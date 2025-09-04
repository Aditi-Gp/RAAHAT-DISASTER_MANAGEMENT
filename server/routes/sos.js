const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { protect, authorize } = require("../middleware/auth");
const { body, validationResult, query } = require("express-validator");
const aiService = require("../services/aiService");

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware for SOS creation (simplified - AI will classify)
const sosValidation = [
  body("text")
    .isLength({ min: 10, max: 1000 })
    .withMessage("SOS text must be between 10 and 1000 characters"),
];

// @route   POST /api/sos
// @desc    Create a new SOS request (USER role)
// @access  Private - User role required
router.post("/", protect, sosValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { text } = req.body;
    const userId = req.user.id;

    // Get user's current location using PostgreSQL native point syntax
    const userWithLocation = await prisma.$queryRaw`
      SELECT id, "fullName", location[0] as longitude, location[1] as latitude
      FROM users 
      WHERE id = ${userId} AND location IS NOT NULL
    `;

    if (
      !userWithLocation ||
      userWithLocation.length === 0 ||
      !userWithLocation[0].latitude
    ) {
      return res.status(400).json({
        success: false,
        message:
          "User location not found. Please update your location first using PUT /api/user/location",
      });
    }

    const user = userWithLocation[0];
    const { latitude, longitude } = user;

    // Call AI service to classify the SOS text
    console.log("Calling AI service for text classification...");
    const { category, urgency } = await aiService.classifySOSText(text);
    console.log(
      `AI Classification result: category=${category}, urgency=${urgency}`
    );

    // Create SOS using raw SQL for PostgreSQL Point
    const sos = await prisma.$queryRaw`
      INSERT INTO sos_requests (text, location, status, category, urgency, "createdById", "createdAt", "updatedAt")
      VALUES (
        ${text},
        point(${longitude}, ${latitude}),
        'NEW',
        ${category},
        ${urgency},
        ${userId},
        NOW(),
        NOW()
      )
      RETURNING id, text, category, urgency, status, "createdAt"
    `;

    const newSosData = {
      ...sos[0],
      location: { latitude, longitude },
      user: {
        id: user.id,
        fullName: user.fullName,
      },
      aiClassification: {
        category,
        urgency,
        source: "AI Service",
      },
    };

    // Broadcast new SOS alert to all connected clients
    if (global.io) {
      global.io.emit("new-sos", newSosData);
      console.log(`📡 New SOS alert broadcasted: ${sos[0].id}`);
    }

    res.status(201).json({
      success: true,
      message: "SOS request created successfully",
      data: {
        sos: newSosData,
      },
    });
  } catch (error) {
    console.error("Create SOS error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create SOS request",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// @route   GET /api/sos
// @desc    Get SOS requests with optional geospatial filtering
// @access  Private (Admin/Volunteer)
router.get(
  "/",
  protect,
  authorize("ADMIN", "VOLUNTEER", "DEPARTMENT", "SUPER_ADMIN"),
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["NEW", "ASSIGNED", "RESOLVED"])
      .withMessage("Invalid status"),
    query("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Invalid latitude"),
    query("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Invalid longitude"),
    query("radius")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Radius must be positive"),
  ],
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

      // Check if user has permission (Admin/Volunteer)
      if (
        !["ADMIN", "VOLUNTEER", "DEPARTMENT", "SUPER_ADMIN"].includes(
          req.user.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      const {
        page = 1,
        limit = 10,
        status,
        latitude,
        longitude,
        radius = 10000, // 10km default radius in meters
      } = req.query;

      const offset = (page - 1) * limit;
      let whereClause = "";
      let params = [];

      // Build WHERE clause
      if (status) {
        whereClause += `WHERE s.status = $${params.length + 1}`;
        params.push(status);
      }

      // Add geospatial filtering if coordinates provided
      if (latitude && longitude) {
        // Using PostgreSQL point distance operator for native point type
        // Distance is calculated in degrees, so we convert meters to degrees (approximately)
        const radiusInDegrees = parseFloat(radius) / 111000; // 1 degree ≈ 111km
        const geoCondition = `${
          whereClause ? "AND" : "WHERE"
        } s.location <-> point($${params.length + 1}, $${
          params.length + 2
        }) <= $${params.length + 3}`;
        whereClause += geoCondition;
        params.push(parseFloat(longitude));
        params.push(parseFloat(latitude));
        params.push(radiusInDegrees);
      }

      const query = `
        SELECT 
          s.id,
          s.text,
          s.location[0] as longitude,
          s.location[1] as latitude,
          s.status,
          s.category,
          s.urgency,
          s."createdAt",
          s."updatedAt",
          u."fullName" as "createdBy",
          a."fullName" as "assignedTo"
        FROM sos_requests s
        JOIN users u ON s."createdById" = u.id
        LEFT JOIN users a ON s."assignedToId" = a.id
        ${whereClause}
        ORDER BY 
          CASE s.urgency 
            WHEN 'Critical' THEN 1 
            WHEN 'High' THEN 2 
            WHEN 'Medium' THEN 3 
            WHEN 'Low' THEN 4 
          END,
          s."createdAt" DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(parseInt(limit), offset);

      const sosRequests = await prisma.$queryRawUnsafe(query, ...params);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM sos_requests s
        JOIN users u ON s."createdById" = u.id
        ${whereClause}
      `;

      const countParams = params.slice(0, whereClause ? params.length - 2 : 0);
      const totalResult = await prisma.$queryRawUnsafe(
        countQuery,
        ...countParams
      );
      const total = parseInt(totalResult[0].total);

      res.json({
        success: true,
        data: {
          sosRequests,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get SOS requests error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch SOS requests",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// @route   PUT /api/sos/:id/assign
// @desc    Assign SOS to volunteer
// @access  Private (Admin/Department)
router.put(
  "/:id/assign",
  protect,
  [body("volunteerId").isInt().withMessage("Volunteer ID must be an integer")],
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

      // Check if user has permission
      if (!["ADMIN", "DEPARTMENT", "SUPER_ADMIN"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      const { id } = req.params;
      const { volunteerId } = req.body;

      // Verify volunteer exists and is available
      const volunteer = await prisma.user.findFirst({
        where: {
          id: volunteerId,
          role: "VOLUNTEER",
          isAvailable: true,
          isVerified: true,
        },
      });

      if (!volunteer) {
        return res.status(404).json({
          success: false,
          message: "Volunteer not found or not available",
        });
      }

      // Update SOS assignment
      const updatedSOS = await prisma.sOS.update({
        where: { id: parseInt(id) },
        data: {
          assignedToId: volunteerId,
          status: "ASSIGNED",
        },
        include: {
          createdBy: {
            select: { fullName: true, email: true },
          },
          assignedTo: {
            select: { fullName: true, email: true },
          },
        },
      });

      res.json({
        success: true,
        message: "SOS assigned successfully",
        data: { sos: updatedSOS },
      });
    } catch (error) {
      console.error("Assign SOS error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign SOS",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// @route   PUT /api/sos/:id/resolve
// @desc    Mark SOS as resolved
// @access  Private (Assigned volunteer or Admin)
router.put("/:id/resolve", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get the SOS request
    const sos = await prisma.sOS.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignedTo: true,
        createdBy: true,
      },
    });

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: "SOS request not found",
      });
    }

    // Check permissions
    const canResolve =
      ["ADMIN", "DEPARTMENT", "SUPER_ADMIN"].includes(userRole) ||
      (sos.assignedToId === userId && userRole === "VOLUNTEER");

    if (!canResolve) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only resolve SOS requests assigned to you.",
      });
    }

    // Update SOS status
    const updatedSOS = await prisma.sOS.update({
      where: { id: parseInt(id) },
      data: { status: "RESOLVED" },
      include: {
        createdBy: {
          select: { fullName: true, email: true },
        },
        assignedTo: {
          select: { fullName: true, email: true },
        },
      },
    });

    res.json({
      success: true,
      message: "SOS marked as resolved",
      data: { sos: updatedSOS },
    });
  } catch (error) {
    console.error("Resolve SOS error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve SOS",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

module.exports = router;
