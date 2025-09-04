const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Protect middleware - verifies JWT and attaches user to request
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "No token provided. Access denied.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
        isAvailable: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Access denied",
        message: "The user belonging to this token does not exist",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Access denied",
        message:
          "Your account is not verified. Please verify your account to access this resource.",
      });
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Access denied",
        message: "Invalid token. Please log in again.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Access denied",
        message: "Your token has expired. Please log in again.",
      });
    }
    return res.status(500).json({
      error: "Server error",
      message: "Something went wrong during authentication",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Authorize middleware - checks if user has required roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Access denied",
        message:
          "You are not logged in. Please log in to access this resource.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Access denied. This resource requires one of the following roles: ${roles.join(
          ", "
        )}`,
      });
    }

    next();
  };
};

// Legacy auth middleware (alias for protect)
const auth = protect;

// Admin role check middleware (using authorize)
const adminAuth = authorize("ADMIN", "SUPER_ADMIN");

// Optional auth middleware (doesn't throw error if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId || decoded.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isVerified: true,
          isAvailable: true,
        },
      });

      if (user && user.isVerified) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = {
  protect,
  authorize,
  auth,
  authenticateToken: auth, // Alias for backward compatibility
  adminAuth,
  optionalAuth,
};
