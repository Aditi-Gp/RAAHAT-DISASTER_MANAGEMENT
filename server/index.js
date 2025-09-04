#!/usr/bin/env node

/**
 * Raahat Disaster Management System - Entry Point
 * A Node.js Express backend using PostgreSQL with PostGIS for geospatial data
 */

const app = require("./app");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;

  console.log("🚀 Raahat Disaster Management API listening on " + bind);
  console.log("📊 Environment:", process.env.NODE_ENV || "development");
  console.log("🗺️  PostGIS: Enabled for geospatial operations");
  console.log("🆘 Emergency Services: Active");
  console.log("📱 Health Check: http://localhost:" + addr.port + "/api/health");
}

/**
 * Test database and PostGIS connection
 */
async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...");

    // Test basic database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");

    // Test PostGIS extension
    try {
      const postgisVersion = await prisma.$queryRaw`SELECT PostGIS_Version()`;
      console.log(
        "✅ PostGIS extension available:",
        postgisVersion[0]?.postgis_version || "Unknown version"
      );
    } catch (postgisError) {
      console.warn(
        "⚠️  PostGIS extension not available. Please ensure PostGIS is installed and enabled."
      );
      console.warn("   Run: CREATE EXTENSION IF NOT EXISTS postgis;");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("   Please check your DATABASE_URL in .env file");
    process.exit(1);
  }
}

/**
 * Initialize the server
 */
async function init() {
  try {
    // Test database connection first
    await testDatabaseConnection();

    // Get port from environment and store in Express
    const port = normalizePort(process.env.PORT || "5000");
    app.set("port", port);

    // Create HTTP server
    const http = require("http");
    const server = http.createServer(app);

    // Initialize Socket.IO
    const { Server } = require("socket.io");
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Socket.IO connection handling
    io.on("connection", (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle user joining room by user ID for targeted notifications
      socket.on("join-user-room", (userId) => {
        socket.join(`user-${userId}`);
        console.log(`👤 User ${userId} joined room user-${userId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });

    // Make io instance available globally for use in routes
    global.io = io;

    // Listen on provided port, on all network interfaces
    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);

    // Make server available globally for reference
    global.server = server;
  } catch (error) {
    console.error("❌ Server initialization failed:", error);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received. Starting graceful shutdown...");

  if (global.server) {
    global.server.close(async () => {
      console.log("🔌 HTTP server closed");
      await prisma.$disconnect();
      console.log("📦 Database connections closed");
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received. Starting graceful shutdown...");

  if (global.server) {
    global.server.close(async () => {
      console.log("🔌 HTTP server closed");
      await prisma.$disconnect();
      console.log("📦 Database connections closed");
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  init();
}

module.exports = { app, prisma };
