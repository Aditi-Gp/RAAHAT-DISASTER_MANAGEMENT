const axios = require("axios");

// AI Service for text classification and disaster analysis
class AIService {
  constructor() {
    this.classifyEndpoint =
      process.env.AI_CLASSIFY_URL || "http://localhost:8001/classify";
    this.disasterAnalysisEndpoint =
      process.env.AI_DISASTER_URL || "http://localhost:8002/analyze";
  }

  /**
   * Classify SOS text to get category and urgency
   * @param {string} text - SOS text to classify
   * @returns {Promise<{category: string, urgency: string}>}
   */
  async classifySOSText(text) {
    try {
      const response = await axios.post(
        this.classifyEndpoint,
        { text },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        category: response.data.category || "Other",
        urgency: response.data.urgency || "Medium",
      };
    } catch (error) {
      console.error("AI Classification Error:", error.message);

      // Fallback classification based on keywords
      return this.fallbackClassification(text);
    }
  }

  /**
   * Analyze disaster satellite data to get affected area polygon
   * @param {string} eventName - Name of the disaster event
   * @param {string} disasterType - Type of disaster
   * @param {object} satelliteData - Mock satellite data
   * @returns {Promise<{type: string, coordinates: array}>}
   */
  async analyzeDisasterArea(eventName, disasterType, satelliteData) {
    try {
      const response = await axios.post(
        this.disasterAnalysisEndpoint,
        {
          eventName,
          disasterType,
          satelliteData,
        },
        {
          timeout: 15000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Expecting GeoJSON Polygon format
      if (response.data.type === "Polygon" && response.data.coordinates) {
        return response.data;
      }

      throw new Error("Invalid GeoJSON response from AI service");
    } catch (error) {
      console.error("AI Disaster Analysis Error:", error.message);

      // Fallback polygon based on disaster type
      return this.fallbackDisasterPolygon(disasterType, satelliteData);
    }
  }

  /**
   * Fallback classification when AI service is unavailable
   * @param {string} text - SOS text
   * @returns {object} Classification result
   */
  fallbackClassification(text) {
    const textLower = text.toLowerCase();

    // Category classification
    let category = "Other";
    if (textLower.includes("fire") || textLower.includes("burn")) {
      category = "Fire";
    } else if (textLower.includes("flood") || textLower.includes("water")) {
      category = "Flood";
    } else if (
      textLower.includes("medical") ||
      textLower.includes("injured") ||
      textLower.includes("hospital")
    ) {
      category = "Medical Emergency";
    } else if (
      textLower.includes("rescue") ||
      textLower.includes("trapped") ||
      textLower.includes("stuck")
    ) {
      category = "Needs Rescue";
    }

    // Urgency classification
    let urgency = "Medium";
    if (
      textLower.includes("critical") ||
      textLower.includes("emergency") ||
      textLower.includes("urgent")
    ) {
      urgency = "Critical";
    } else if (textLower.includes("severe") || textLower.includes("serious")) {
      urgency = "High";
    } else if (textLower.includes("minor") || textLower.includes("small")) {
      urgency = "Low";
    }

    return { category, urgency };
  }

  /**
   * Fallback disaster polygon when AI service is unavailable
   * @param {string} disasterType - Type of disaster
   * @param {object} satelliteData - Satellite data with coordinates
   * @returns {object} GeoJSON Polygon
   */
  fallbackDisasterPolygon(disasterType, satelliteData) {
    // Use provided coordinates or generate a default polygon
    let coordinates;

    if (satelliteData && satelliteData.coordinates) {
      coordinates = satelliteData.coordinates;
    } else {
      // Generate a default polygon based on disaster type
      const centerLat = satelliteData?.centerLat || 28.6139;
      const centerLon = satelliteData?.centerLon || 77.209;

      // Different radius based on disaster type
      const radius =
        {
          FLOOD: 0.01, // ~1km radius
          FIRE: 0.005, // ~0.5km radius
          EARTHQUAKE: 0.02, // ~2km radius
          CYCLONE: 0.05, // ~5km radius
        }[disasterType] || 0.01;

      // Create a simple square polygon
      coordinates = [
        [
          [centerLon - radius, centerLat - radius],
          [centerLon + radius, centerLat - radius],
          [centerLon + radius, centerLat + radius],
          [centerLon - radius, centerLat + radius],
          [centerLon - radius, centerLat - radius], // Close the polygon
        ],
      ];
    }

    return {
      type: "Polygon",
      coordinates,
    };
  }
}

module.exports = new AIService();
