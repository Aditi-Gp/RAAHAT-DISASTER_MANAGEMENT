const express = require("express");
const axios = require("axios");
const { query, validationResult } = require("express-validator");

const router = express.Router();

// @route   GET /api/shelters/nearby
// @desc    Proxy endpoint to fetch nearby shelters from external API
// @access  Public (for emergency use)
router.get(
  "/nearby",
  [
    query("lat")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Valid latitude is required"),
    query("lon")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Valid longitude is required"),
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

      const { lat, lon } = req.query;

      console.log(`🏠 Fetching nearby shelters for location: ${lat}, ${lon}`);

      // Make request to external shelter API
      const response = await axios.get(
        "https://e795cf78568f.ngrok-free.app/shelters/nearby/",
        {
          params: {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
          },
          timeout: 10000, // 10 second timeout
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        `✅ Successfully fetched ${response.data?.length || 0} shelters`
      );

      // Return the response from external API directly
      res.json(response.data);
    } catch (error) {
      console.error("Shelter API proxy error:", error.message);

      if (error.code === "ECONNABORTED") {
        return res.status(504).json({
          success: false,
          message: "Shelter service timeout",
          error: "The shelter service is taking too long to respond",
        });
      }

      if (error.response) {
        // External API returned an error
        return res.status(error.response.status).json({
          success: false,
          message: "Shelter service error",
          error: error.response.data || "External service error",
        });
      }

      // Network or other error
      res.status(503).json({
        success: false,
        message: "Shelter service unavailable",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Service temporarily unavailable",
      });
    }
  }
);

module.exports = router;
