const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { protect, authorize } = require("../middleware/auth");
const { body, param, query, validationResult } = require("express-validator");

const router = express.Router();
const prisma = new PrismaClient();

// Volunteer Verification (admin role)
// GET /api/admin/volunteers/unverified
router.get(
  "/volunteers/unverified",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req, res) => {
    try {
      const unverified = await prisma.user.findMany({
        where: { role: "VOLUNTEER", isVerified: false },
        select: {
          id: true,
          fullName: true,
          email: true,
          isVerified: true,
          isAvailable: true,
        },
      });
      res.json({ success: true, data: unverified });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch unverified volunteers",
        error: error.message,
      });
    }
  }
);

// PUT /api/admin/volunteers/verify/:id
router.put(
  "/volunteers/verify/:id",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  [param("id").isInt()],
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await prisma.user.update({
        where: { id },
        data: { isVerified: true },
      });
      res.json({ success: true, message: "Volunteer verified", data: updated });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to verify volunteer",
        error: error.message,
      });
    }
  }
);

// Volunteer Availability (volunteer role)
// PUT /api/volunteer/status
router.put(
  "/volunteer/status",
  protect,
  authorize("VOLUNTEER"),
  [body("isAvailable").isBoolean()],
  async (req, res) => {
    try {
      const { isAvailable } = req.body;
      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { isAvailable },
      });
      res.json({
        success: true,
        message: "Availability updated",
        data: updated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update availability",
        error: error.message,
      });
    }
  }
);

// SOS Assignment (admin role)
// GET /api/admin/sos/unassigned
router.get(
  "/sos/unassigned",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req, res) => {
    try {
      const sos = await prisma.sos_requests.findMany({
        where: { status: "NEW" },
        orderBy: [{ urgency: "desc" }, { createdAt: "asc" }],
        select: {
          id: true,
          text: true,
          category: true,
          urgency: true,
          location: true,
          createdAt: true,
        },
      });
      res.json({ success: true, data: sos });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch unassigned SOS",
        error: error.message,
      });
    }
  }
);

// GET /api/admin/volunteers/available?longitude=...&latitude=...
router.get(
  "/volunteers/available",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  [query("longitude").isFloat(), query("latitude").isFloat()],
  async (req, res) => {
    try {
      const longitude = parseFloat(req.query.longitude);
      const latitude = parseFloat(req.query.latitude);
      // Use raw query for geospatial distance
      const volunteers = await prisma.$queryRaw`
      SELECT id, "fullName", email, location[0] as longitude, location[1] as latitude,
        ST_Distance(ST_SetSRID(ST_MakePoint(location[0], location[1]), 4326), ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)) as distance_meters
      FROM users
      WHERE role = 'VOLUNTEER' AND "isVerified" = true AND "isAvailable" = true AND location IS NOT NULL
      ORDER BY distance_meters ASC
    `;
      res.json({ success: true, data: volunteers });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch available volunteers",
        error: error.message,
      });
    }
  }
);

// POST /api/admin/assign
router.post(
  "/assign",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  [body("sosId").isInt(), body("volunteerId").isInt()],
  async (req, res) => {
    try {
      const { sosId, volunteerId } = req.body;
      // Update SOS record
      const updated = await prisma.sos_requests.update({
        where: { id: sosId },
        data: { status: "ASSIGNED", assignedToId: volunteerId },
      });
      res.json({
        success: true,
        message: "SOS assigned to volunteer",
        data: updated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to assign SOS",
        error: error.message,
      });
    }
  }
);

// POST /api/admin/notify-responders
router.post(
  "/notify-responders",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  [body("sosId").isInt().withMessage("Valid SOS ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { sosId } = req.body;

      // Fetch SOS location
      const sosRequest = await prisma.$queryRaw`
        SELECT id, text, location[0] as longitude, location[1] as latitude, category, urgency, "createdAt"
        FROM sos_requests 
        WHERE id = ${sosId} AND status = 'NEW'
      `;

      if (!sosRequest || sosRequest.length === 0) {
        return res.status(404).json({
          success: false,
          message: "SOS request not found or already processed",
        });
      }

      const sos = sosRequest[0];
      const { latitude, longitude } = sos;

      // Find available volunteers within 10km radius using PostGIS ST_Distance
      const volunteers = await prisma.$queryRaw`
        SELECT id, "fullName", email, location[0] as longitude, location[1] as latitude,
        ST_Distance(location, point(${longitude}, ${latitude})) * 111.32 as distance_km
        FROM users 
        WHERE role IN ('VOLUNTEER', 'DEPARTMENT') 
        AND "isAvailable" = true 
        AND location IS NOT NULL
        AND ST_Distance(location, point(${longitude}, ${latitude})) * 111.32 <= 10
        ORDER BY distance_km ASC
        LIMIT 20
      `;

      console.log(
        `🚨 Found ${volunteers.length} available responders within 10km of SOS ${sosId}`
      );

      // Broadcast SOS request to nearby volunteers
      if (global.io && volunteers.length > 0) {
        const sosNotification = {
          sosId: sos.id,
          text: sos.text,
          location: { latitude, longitude },
          category: sos.category,
          urgency: sos.urgency,
          createdAt: sos.createdAt,
          estimatedDistance: volunteers[0].distance_km,
        };

        // Send targeted notifications to each volunteer
        volunteers.forEach((volunteer) => {
          global.io.to(`user-${volunteer.id}`).emit("sos-request", {
            ...sosNotification,
            volunteerDistance: volunteer.distance_km,
          });
          console.log(
            `📱 Notified volunteer ${
              volunteer.fullName
            } (${volunteer.distance_km.toFixed(1)}km away)`
          );
        });
      }

      res.json({
        success: true,
        message: `Notified ${volunteers.length} responders within 10km radius`,
        data: {
          sosId,
          notifiedVolunteers: volunteers.length,
          volunteers: volunteers.map((v) => ({
            id: v.id,
            name: v.fullName,
            distance: `${v.distance_km.toFixed(1)}km`,
          })),
        },
      });
    } catch (error) {
      console.error("Notify responders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to notify responders",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

module.exports = router;
