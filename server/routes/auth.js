const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();
const prisma = new PrismaClient();

// Validation rules
const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("fullName")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2-100 characters"),
  body("phone")
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["USER", "VOLUNTEER"])
    .withMessage("Invalid role"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const locationValidation = [
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a number between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a number between -180 and 180"),
];

// Generate JWT token with user data
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      id: user.id,
      role: user.role,
      fullName: user.fullName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post(
  "/register",
  authLimiter,
  registerValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        email,
        fullName,
        phone,
        password,
        role = "USER",
        governmentIdUrl,
      } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { phone }],
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            existingUser.email === email
              ? "Email already registered"
              : "Phone number already registered",
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          fullName,
          phone,
          password: hashedPassword,
          role,
          governmentIdUrl, // Add government ID URL if provided
          isVerified: false, // In a real app, you'd send verification email
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", authLimiter, loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified. Please verify your account first.",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user);

    // Create user response without password
    const userResponse = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/verify
// @desc    Verify JWT token
// @access  Private
router.get("/verify", protect, async (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    data: {
      user: req.user,
    },
  });
});

// @route   PUT /api/auth/location
// @desc    Update user location
// @access  Private
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

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", protect, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement a token blacklist here if needed
  res.json({
    success: true,
    message: "Logout successful",
  });
});

module.exports = router;
