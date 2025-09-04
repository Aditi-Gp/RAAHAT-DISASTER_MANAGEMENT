const express = require("express");
const { body, validationResult, query } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Validation rules
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

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
        isAvailable: true,
        governmentIdUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sosRequests: true,
            assignedSos: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put("/me", protect, updateProfileValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
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

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get(
  "/",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
            isVerified: true,
            isAvailable: true,
            createdAt: true,
            _count: {
              select: {
                sosRequests: true,
                assignedSos: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count(),
      ]);

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      };

      res.json({
        success: true,
        message: "Users retrieved successfully",
        data: {
          users,
          pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
        isAvailable: true,
        governmentIdUrl: true,
        createdAt: true,
        _count: {
          select: {
            sosRequests: true,
            assignedSos: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with the specified ID was not found",
      });
    }

    res.json({
      success: true,
      message: "User retrieved successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/users/:id/status
// @desc    Update user verification status (Admin only)
// @access  Private/Admin
router.patch(
  "/:id/status",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { isVerified } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      if (typeof isVerified !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isVerified must be a boolean value",
        });
      }

      // Prevent admin from unverifying themselves
      if (id === req.user.id && !isVerified) {
        return res.status(400).json({
          success: false,
          message: "You cannot unverify your own account",
        });
      }

      const user = await prisma.user.update({
        where: { id },
        data: { isVerified },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isVerified: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: `User ${isVerified ? "verified" : "unverified"} successfully`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
