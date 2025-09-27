const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const userProfileRoutes = require("./routes/user");
const sosRoutes = require("./routes/sos");
const disasterRoutes = require("./routes/disasters");
const uploadRoutes = require("./routes/upload");
const shelterRoutes = require("./routes/shelter");
const adminRoutes = require("./routes/admin");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const { rateLimiter } = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Rate limiting (disabled in Lambda environment)
if (!process.env.IS_LAMBDA) {
  app.use(rateLimiter);
}

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check PostGIS extension
    const postgisVersion = await prisma.$queryRaw`SELECT PostGIS_Version()`;

    res.status(200).json({
      status: "OK",
      message: "Raahat Disaster Management API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      serverless: !!process.env.IS_LAMBDA,
      database: "Connected",
      postgis: postgisVersion[0]?.postgis_version || "Available",
      services: {
        authentication: "Active",
        geospatial: "Active",
        notifications: "Active",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "ERROR",
      message: "Service unavailable",
      timestamp: new Date().toISOString(),
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/disasters", disasterRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/map", disasterRoutes); // Map endpoints are in disasters routes
app.use("/api/shelters", shelterRoutes);
app.use("/api/admin", adminRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Raahat - Disaster Management System API",
    version: "1.0.0",
    documentation: "/api/health",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      sos: "/api/sos",
      disasters: "/api/disasters",
    },
    features: [
      "Real-time SOS requests",
      "Geospatial disaster tracking",
      "Volunteer coordination",
      "Emergency response management",
    ],
    serverless: !!process.env.IS_LAMBDA,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist on this server.`,
    availableRoutes: ["/api/auth", "/api/users", "/api/sos", "/api/disasters"],
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  console.log("🛑 Received SIGINT. Graceful shutdown...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Received SIGTERM. Graceful shutdown...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server only if not running in Lambda
if (!module.parent && !process.env.IS_LAMBDA) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Raahat API Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
    );
    console.log(`🗺️  PostGIS: Enabled for geospatial operations`);
    console.log(`🆘 Emergency Services: Active`);
  });
}

// Make Prisma available globally
app.locals.prisma = prisma;

module.exports = app;
