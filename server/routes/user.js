const express = require("express");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Validation rules
const locationValidation = [
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a number between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a number between -180 and 180"),
];

const updateProfileValidation = [
  body("fullName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2-100 characters"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),
  body("governmentIdUrl")
    .optional()
    .isURL()
    .withMessage("Government ID URL must be a valid URL"),
];

// @route   PUT /api/user/location
// @desc    Update user location (PostGIS point)
// @access  Private (All logged-in users)
router.put("/location", protect, locationValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }

    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    // Update user location using PostgreSQL native point type
    const updatedUser = await prisma.$queryRaw`
      UPDATE users 
      SET location = point(${longitude}, ${latitude}),
          "updatedAt" = NOW()
      WHERE id = ${userId}
      RETURNING id, email, "fullName", phone, role, "isVerified", "isAvailable", 
                location[0] as longitude, location[1] as latitude, "updatedAt"
    `;

    if (!updatedUser || updatedUser.length === 0) {
      return res.status(404).json({
        error: "User not found",
        message: "Unable to update user location",
      });
    }

    const user = updatedUser[0];

    res.json({
      success: true,
      message: "Location updated successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          isAvailable: user.isAvailable,
          location: {
            latitude: user.latitude,
            longitude: user.longitude,
          },
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/user/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, async (req, res, next) => {
  try {
    // Get user with location coordinates using PostgreSQL native point syntax
    const userWithLocation = await prisma.$queryRaw`
      SELECT id, email, "fullName", phone, role, "isVerified", "isAvailable", 
             "governmentIdUrl", "createdAt", "updatedAt",
             location[0] as longitude, location[1] as latitude
      FROM users 
      WHERE id = ${req.user.id}
    `;

    if (!userWithLocation || userWithLocation.length === 0) {
      return res.status(404).json({
        error: "User not found",
        message: "User profile not found",
      });
    }

    const user = userWithLocation[0];

    // Get SOS counts
    const [sosRequests, assignedSos] = await Promise.all([
      prisma.sOS.count({ where: { createdById: req.user.id } }),
      prisma.sOS.count({ where: { assignedToId: req.user.id } }),
    ]);

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          isAvailable: user.isAvailable,
          governmentIdUrl: user.governmentIdUrl,
          location:
            user.latitude && user.longitude
              ? {
                  latitude: user.latitude,
                  longitude: user.longitude,
                }
              : null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          stats: {
            sosRequests,
            assignedSos,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/user/me
// @desc    Update current user profile
// @access  Private
router.put("/me", protect, updateProfileValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }

    const { fullName, phone, isAvailable, governmentIdUrl } = req.body;

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (governmentIdUrl !== undefined)
      updateData.governmentIdUrl = governmentIdUrl;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
        isAvailable: true,
        governmentIdUrl: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/user/nearby
// @desc    Get nearby users within a radius
// @access  Private
router.get("/nearby", protect, async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5000, roles } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Missing coordinates",
        message: "Latitude and longitude are required",
      });
    }

    let roleFilter = "";
    if (roles) {
      const roleArray = roles
        .split(",")
        .map((role) => `'${role}'`)
        .join(",");
      roleFilter = `AND role IN (${roleArray})`;
    }

    // Find nearby users using PostgreSQL native point distance calculation
    let query = `
      SELECT id, email, "fullName", phone, role, "isVerified", "isAvailable",
             location[0] as longitude, location[1] as latitude,
             point(${parseFloat(longitude)}, ${parseFloat(latitude)}) <-> location as distance
      FROM users 
      WHERE location IS NOT NULL 
        AND id != ${req.user.id}
        AND "isAvailable" = true
        AND "isVerified" = true
    `;

    if (roleFilter) {
      query += ` ${roleFilter}`;
    }

    query += `
        AND point(${parseFloat(longitude)}, ${parseFloat(latitude)}) <-> location <= ${parseFloat(radius) / 111000.0}
      ORDER BY distance ASC
      LIMIT 50
    `;

    const nearbyUsers = await prisma.$queryRawUnsafe(query);

    res.json({
      success: true,
      message: `Found ${nearbyUsers.length} users within ${radius}m`,
      data: {
        users: nearbyUsers.map((user) => ({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          isAvailable: user.isAvailable,
          location: {
            latitude: user.latitude,
            longitude: user.longitude,
          },
          distance: Math.round(user.distance * 111000), // Convert degrees to meters (approximate)
        })),
        params: {
          center: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
          radius: parseFloat(radius),
          roles: roles ? roles.split(",") : "all",
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
