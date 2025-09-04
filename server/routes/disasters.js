const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { protect, authorize } = require("../middleware/auth");
const { body, validationResult, query } = require("express-validator");
const aiService = require("../services/aiService");

const router = express.Router();
const prisma = new PrismaClient();

// @route   POST /api/disaster
// @desc    Create a new disaster event with AI-powered satellite data analysis (ADMIN role)
// @access  Private (Admin/Department only)
router.post(
  "/",
  protect,
  authorize("ADMIN", "DEPARTMENT", "SUPER_ADMIN"),
  [
    body("eventName")
      .isLength({ min: 3, max: 100 })
      .withMessage("Event name must be between 3 and 100 characters"),
    body("disasterType")
      .isIn(["FLOOD", "FIRE", "EARTHQUAKE", "CYCLONE"])
      .withMessage("Invalid disaster type"),
    body("satelliteData")
      .isObject()
      .withMessage("Satellite data must be an object"),
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

      const { eventName, disasterType, satelliteData } = req.body;

      console.log("Calling AI service for disaster area analysis...");

      // Call AI service to analyze satellite data and get affected area polygon
      const geoJsonPolygon = await aiService.analyzeDisasterArea(
        eventName,
        disasterType,
        satelliteData
      );

      console.log(`AI Disaster Analysis result:`, geoJsonPolygon);

      if (
        !geoJsonPolygon.coordinates ||
        !Array.isArray(geoJsonPolygon.coordinates[0])
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid polygon coordinates from AI analysis",
        });
      }

      // Convert GeoJSON polygon to PostgreSQL polygon format
      let polygonCoords = "";
      if (geoJsonPolygon.coordinates && geoJsonPolygon.coordinates[0]) {
        polygonCoords = geoJsonPolygon.coordinates[0]
          .map((coord) => `(${coord[0]},${coord[1]})`)
          .join(",");
        polygonCoords = `((${polygonCoords}))`;
      } else {
        throw new Error("Invalid polygon coordinates from AI analysis");
      }

      // Use raw Prisma query to insert DisasterEvent with native PostgreSQL polygon
      await prisma.$executeRaw`
        INSERT INTO disaster_events ("eventName", "disasterType", "affectedArea", "isActive", "createdAt", "updatedAt")
        VALUES (
          ${eventName},
          ${disasterType}::"DisasterType",
          ${polygonCoords}::polygon,
          true,
          NOW(),
          NOW()
        )
      `;
      // Parse the PostgreSQL polygon format and convert back to GeoJSON
      let parsedAffectedArea = geoJsonPolygon; // Default to original
      try {
        const polygonText = createdDisaster[0].affectedAreaText;
        if (polygonText) {
          const coordMatches = polygonText.match(/\(([^)]+)\)/g);
          if (coordMatches && coordMatches.length > 0) {
            const coordinates = coordMatches.map((match) => {
              const coords = match.replace(/[()]/g, "").split(",");
              return [parseFloat(coords[0]), parseFloat(coords[1])]; // [lng, lat]
            });
            parsedAffectedArea = {
              type: "Polygon",
              coordinates: [coordinates],
            };
          }
        }
      } catch (error) {
        console.error("Error parsing stored polygon:", error);
      }

      res.status(201).json({
        success: true,
        message: "Disaster event created successfully with AI analysis",
        data: {
          disaster: {
            ...createdDisaster[0],
            affectedArea: parsedAffectedArea,
          },
          aiAnalysis: {
            source: "AI Service",
            inputSatelliteData: satelliteData,
            processedPolygon: geoJsonPolygon,
          },
        },
      });
    } catch (error) {
      console.error("Create disaster error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create disaster event",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// @route   GET /api/disasters
// @desc    Get disaster events with optional geospatial filtering
// @access  Public (with rate limiting)
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("active")
      .optional()
      .isBoolean()
      .withMessage("Active must be a boolean"),
    query("type")
      .optional()
      .isIn(["FLOOD", "FIRE", "EARTHQUAKE", "CYCLONE"])
      .withMessage("Invalid disaster type"),
    query("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Invalid latitude"),
    query("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Invalid longitude"),
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

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const { active = true, type, latitude, longitude } = req.query;

      let whereClause = `WHERE "isActive" = ${active}`;
      let params = [];

      if (type) {
        whereClause += ` AND "disasterType" = $${params.length + 1}`;
        params.push(type);
      }

      // Point-in-polygon query if coordinates are provided (use native PostgreSQL)
      if (latitude && longitude) {
        whereClause += ` AND point($${params.length + 1}, $${
          params.length + 2
        }) <@ "affectedArea"`;
        params.push(parseFloat(longitude), parseFloat(latitude));
      }

      // Use $queryRawUnsafe for dynamic WHERE clause
      let queryParams = [limit, skip];
      let disasterQuery = `
        SELECT id, "eventName", "disasterType", "isActive", "createdAt", "updatedAt",
               "affectedArea"::text as "affectedAreaText"
        FROM disaster_events 
        ${whereClause}
        ORDER BY "createdAt" DESC
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `;

      let totalQuery = `
        SELECT COUNT(*)::int as count
        FROM disaster_events 
        ${whereClause}
      `;

      const [disasters, totalResult] = await Promise.all([
        prisma.$queryRawUnsafe(disasterQuery, ...params, ...queryParams),
        prisma.$queryRawUnsafe(totalQuery, ...params),
      ]);

      const total = totalResult[0].count;

      const formattedDisasters = disasters.map((disaster) => {
        // Parse the PostgreSQL polygon format for affected area
        let affectedArea = null;
        let center = { latitude: 0, longitude: 0 };

        try {
          const polygonText = disaster.affectedAreaText;
          if (polygonText) {
            // Extract coordinates from PostgreSQL polygon format
            const coordMatches = polygonText.match(/\(([^)]+)\)/g);
            if (coordMatches && coordMatches.length > 0) {
              const coordinates = coordMatches.map((match) => {
                const coords = match.replace(/[()]/g, "").split(",");
                return [parseFloat(coords[0]), parseFloat(coords[1])]; // [lng, lat]
              });

              // Create GeoJSON-like structure
              affectedArea = {
                type: "Polygon",
                coordinates: [coordinates],
              };

              // Calculate center point
              if (coordinates.length > 0) {
                const avgLng =
                  coordinates.reduce((sum, coord) => sum + coord[0], 0) /
                  coordinates.length;
                const avgLat =
                  coordinates.reduce((sum, coord) => sum + coord[1], 0) /
                  coordinates.length;
                center = { latitude: avgLat, longitude: avgLng };
              }
            }
          }
        } catch (error) {
          console.error(
            "Error parsing polygon for disaster",
            disaster.id,
            ":",
            error
          );
          center = { latitude: 28.6139, longitude: 77.209 }; // Default center
        }

        return {
          id: disaster.id,
          eventName: disaster.eventName,
          disasterType: disaster.disasterType,
          isActive: disaster.isActive,
          createdAt: disaster.createdAt,
          updatedAt: disaster.updatedAt,
          affectedArea,
          center,
        };
      });

      res.json({
        success: true,
        message: "Disaster events retrieved successfully",
        data: {
          disasters: formattedDisasters,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          filters: {
            active,
            type: type || null,
            pointQuery: latitude && longitude ? { latitude, longitude } : null,
          },
        },
      });
    } catch (error) {
      console.error("Get disasters error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve disaster events",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// =================== MAP DATA ENDPOINTS (PUBLIC) ===================

// @route   GET /api/map/events
// @desc    Returns all active DisasterEvents with their affectedArea polygons
// @access  Public
router.get("/map/events", async (req, res) => {
  try {
    // Use native PostgreSQL polygon functions instead of PostGIS
    const activeDisasters = await prisma.$queryRaw`
      SELECT id, "eventName", "disasterType", "isActive", "createdAt",
             "affectedArea"::text as "affectedAreaText"
      FROM disaster_events 
      WHERE "isActive" = true
      ORDER BY "createdAt" DESC
    `;

    const formattedEvents = activeDisasters.map((disaster) => {
      // Parse the PostgreSQL polygon format: ((x1,y1),(x2,y2),...)
      let affectedArea = null;
      let center = { latitude: 0, longitude: 0 };

      try {
        const polygonText = disaster.affectedAreaText;
        if (polygonText) {
          // Extract coordinates from PostgreSQL polygon format
          // Format: ((lng1,lat1),(lng2,lat2),...)
          const coordMatches = polygonText.match(/\(([^)]+)\)/g);
          if (coordMatches && coordMatches.length > 0) {
            const coordinates = coordMatches.map((match) => {
              const coords = match.replace(/[()]/g, "").split(",");
              return [parseFloat(coords[0]), parseFloat(coords[1])]; // [lng, lat]
            });

            // Create GeoJSON-like structure
            affectedArea = {
              type: "Polygon",
              coordinates: [coordinates], // Wrap in array for GeoJSON format
            };

            // Calculate center point (simple average)
            if (coordinates.length > 0) {
              const avgLng =
                coordinates.reduce((sum, coord) => sum + coord[0], 0) /
                coordinates.length;
              const avgLat =
                coordinates.reduce((sum, coord) => sum + coord[1], 0) /
                coordinates.length;
              center = { latitude: avgLat, longitude: avgLng };
            }
          }
        }
      } catch (error) {
        console.error(
          "Error parsing polygon for disaster",
          disaster.id,
          ":",
          error
        );
        // Fallback to default center point
        center = { latitude: 28.6139, longitude: 77.209 }; // Delhi center
      }

      return {
        id: disaster.id,
        eventName: disaster.eventName,
        disasterType: disaster.disasterType,
        isActive: disaster.isActive,
        createdAt: disaster.createdAt,
        affectedArea,
        center,
      };
    });

    res.json({
      success: true,
      message: `Found ${formattedEvents.length} active disaster events`,
      data: {
        events: formattedEvents,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Map events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve map events",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// @route   GET /api/map/sos
// @desc    Returns all SOS records with status NEW or ASSIGNED
// @access  Public
router.get("/map/sos", async (req, res) => {
  try {
    const activeSOS = await prisma.$queryRaw`
      SELECT s.id, s.text, s.status, s.category, s.urgency, s."createdAt",
             s.location[0] as longitude, s.location[1] as latitude,
             u."fullName" as creator_name, u.role as creator_role
      FROM sos_requests s
      JOIN users u ON s."createdById" = u.id
      WHERE s.status IN ('NEW', 'ASSIGNED')
      ORDER BY s."createdAt" DESC
    `;

    const formattedSOS = activeSOS.map((sos) => ({
      id: sos.id,
      text: sos.text,
      status: sos.status,
      category: sos.category,
      urgency: sos.urgency,
      createdAt: sos.createdAt,
      location: {
        latitude: sos.latitude,
        longitude: sos.longitude,
      },
      creator: {
        name: sos.creator_name,
        role: sos.creator_role,
      },
    }));

    res.json({
      success: true,
      message: `Found ${formattedSOS.length} active SOS requests`,
      data: {
        sosRequests: formattedSOS,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Map SOS error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve map SOS data",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// @route   GET /api/map/heatmap
// @desc    Placeholder heatmap endpoint - returns basic disaster data without complex PostGIS queries
// @access  Public
// @note    Simplified version for now, will integrate with Google Maps in the future
router.get("/map/heatmap", async (req, res) => {
  try {
    // Simple query to get active disasters without complex geospatial operations
    const disasters = await prisma.disasterEvent.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        eventName: true,
        disasterType: true,
        createdAt: true,
        _count: {
          select: {
            sosRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format data to match expected frontend structure
    const formattedHeatmap = disasters.map((disaster, index) => {
      const sosCount = disaster._count.sosRequests;

      // Determine impact level based on SOS count
      let impact = "LOW";
      if (sosCount === 0) {
        impact = "MINIMAL";
      } else if (sosCount > 10) {
        impact = "CRITICAL";
      } else if (sosCount > 5) {
        impact = "HIGH";
      } else if (sosCount > 2) {
        impact = "MEDIUM";
      }

      // Generate placeholder coordinates (will be replaced with Google Maps integration)
      const baseLatitude = 28.6139; // Delhi center
      const baseLongitude = 77.209;
      const lat = baseLatitude + (Math.random() - 0.5) * 0.5; // Random offset within ~25km radius
      const lon = baseLongitude + (Math.random() - 0.5) * 0.5;

      return {
        id: disaster.id,
        eventName: disaster.eventName,
        disasterType: disaster.disasterType,
        impact,
        sosCount,
        urgencyBreakdown: {
          critical: Math.floor(sosCount * 0.2),
          high: Math.floor(sosCount * 0.3),
          medium: Math.floor(sosCount * 0.3),
          low: Math.floor(sosCount * 0.2),
        },
        center: {
          lat,
          lon,
        },
        affectedArea: {
          type: "Point",
          coordinates: [lon, lat],
        },
        createdAt: disaster.createdAt,
      };
    });

    // Calculate overall statistics
    const totalSOS = formattedHeatmap.reduce(
      (sum, item) => sum + item.sosCount,
      0
    );
    const totalEvents = formattedHeatmap.length;
    const criticalEvents = formattedHeatmap.filter(
      (item) => item.impact === "CRITICAL"
    ).length;

    res.json({
      success: true,
      message: `Heatmap data generated for ${totalEvents} active disasters with ${totalSOS} SOS requests`,
      data: {
        heatmap: formattedHeatmap,
        statistics: {
          totalEvents,
          totalSOS,
          criticalEvents,
          averageSOSPerEvent:
            totalEvents > 0 ? Math.round(totalSOS / totalEvents) : 0,
        },
        timestamp: new Date().toISOString(),
        note: "Placeholder data - will be enhanced with Google Maps integration",
      },
    });
  } catch (error) {
    console.error("Heatmap error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate heatmap data",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

module.exports = router;
