// /src/components/DisasterMap.tsx

import api from "@/services/apiClient";
import { Loader } from "@googlemaps/js-api-loader";
import { AlertTriangle, MapPin } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

// Temporary Google Maps type declarations
declare global {
  interface Window {
    google: any;
  }
}

// Types for disaster data
interface DisasterMarker {
  id: string;
  latitude: number;
  longitude: number;
  type: "flood" | "fire" | "earthquake" | "cyclone" | "drought";
  severity: "low" | "medium" | "high" | "critical";
  name: string;
  sosCount?: number;
}

interface SOSAlert {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  userId: string;
}

interface SafeShelter {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  capacity: number;
}

interface DisasterMapProps {
  disasters?: DisasterMarker[];
  sosAlerts?: SOSAlert[];
  safeShelters?: SafeShelter[];
  isAdmin?: boolean;
  onRouteGenerated?: (route: any) => void;
}

const DisasterMap: React.FC<DisasterMapProps> = ({
  disasters = [],
  sosAlerts = [],
  safeShelters = [],
  isAdmin = false,
  onRouteGenerated,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const directionsRendererRef = useRef<any>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedSOS, setSelectedSOS] = useState<SOSAlert | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<SafeShelter | null>(
    null
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchingRoute, setIsSearchingRoute] = useState(false);
  const [nearestShelter, setNearestShelter] = useState<SafeShelter | null>(
    null
  );

  // Diagnostic function to test Directions API
  // const testDirectionsAPI = async () => {
  //   if (!window.google || !window.google.maps) {
  //     console.error("❌ Google Maps not loaded");
  //     return;
  //   }

  //   console.log("🧪 Testing Directions API with simple request...");
  //   const directionsService = new window.google.maps.DirectionsService();

  //   try {
  //     const result = await new Promise((resolve, reject) => {
  //       directionsService.route(
  //         {
  //           origin: { lat: 28.6139, lng: 77.209 }, // Delhi
  //           destination: { lat: 19.076, lng: 72.8777 }, // Mumbai
  //           travelMode: window.google.maps.TravelMode.DRIVING,
  //         },
  //         (result: any, status: any) => {
  //           console.log(`🔍 Test API response status: ${status}`);
  //           if (status === window.google.maps.DirectionsStatus.OK) {
  //             resolve(result);
  //           } else {
  //             reject(new Error(`Test failed with status: ${status}`));
  //           }
  //         }
  //       );
  //     });

  //     console.log("✅ Directions API test successful!", result);
  //     alert("✅ Directions API is working correctly!");
  //   } catch (error: any) {
  //     console.error("❌ Directions API test failed:", error);
  //     alert(`❌ Directions API test failed: ${error.message}`);
  //   }
  // };

  // Color mapping for different disaster types and severities
  const getDisasterColor = (type: string, severity: string): string => {
    const colors = {
      flood: {
        low: "#3B82F6",
        medium: "#2563EB",
        high: "#1D4ED8",
        critical: "#1E40AF",
      },
      fire: {
        low: "#F59E0B",
        medium: "#D97706",
        high: "#B45309",
        critical: "#92400E",
      },
      earthquake: {
        low: "#8B5CF6",
        medium: "#7C3AED",
        high: "#6D28D9",
        critical: "#5B21B6",
      },
      cyclone: {
        low: "#10B981",
        medium: "#059669",
        high: "#047857",
        critical: "#065F46",
      },
      drought: {
        low: "#F97316",
        medium: "#EA580C",
        high: "#C2410C",
        critical: "#9A3412",
      },
    };
    return (
      colors[type as keyof typeof colors]?.[
        severity as keyof typeof colors.flood
      ] || "#6B7280"
    );
  };

  /**
   * Calculate straight-line distance between two points using Haversine formula
   * @param lat1, lng1 - First point coordinates
   * @param lat2, lng2 - Second point coordinates
   * @returns Distance in meters
   */
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  /**
   * Find the nearest safe shelter and generate route automatically
   * Fallback to straight-line distance if Directions API fails
   * @param origin - User's current location { lat: number, lng: number }
   * @param shelters - Array of available safe shelters
   * @returns Promise<{ shelter: SafeShelter, route: any, distance: number } | null>
   */
  const getSafeRoute = async (
    origin: { lat: number; lng: number },
    shelters: SafeShelter[]
  ): Promise<{
    shelter: SafeShelter;
    route: any;
    distance: number;
    duration: number;
  } | null> => {
    if (!window.google || !mapInstanceRef.current || shelters.length === 0) {
      return null;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const validRoutes: Array<{
      shelter: SafeShelter;
      route: any;
      distance: number;
      duration: number;
    }> = [];

    console.log(
      `🔍 Searching routes to ${shelters.length} shelters from user location...`
    );

    // Step 1: Try to generate routes to all shelters with Directions API
    for (const shelter of shelters) {
      try {
        console.log(`🛣️ Testing route to: ${shelter.name}`);

        const result = await new Promise((resolve, reject) => {
          directionsService.route(
            {
              origin: origin,
              destination: { lat: shelter.latitude, lng: shelter.longitude },
              travelMode: window.google.maps.TravelMode.DRIVING,
              avoidTolls: false,
              avoidHighways: false,
              unitSystem: window.google.maps.UnitSystem.METRIC,
              region: "IN", // Specify India region
            },
            (result: any, status: any) => {
              if (status === window.google.maps.DirectionsStatus.OK) {
                resolve(result);
              } else {
                reject(new Error(`Route to ${shelter.name} failed: ${status}`));
              }
            }
          );
        });

        // Step 2: Extract distance and duration from successful result
        const route = (result as any).routes[0];
        const leg = route.legs[0];

        // Step 3: Extract distance and duration
        const distanceValue = leg.distance?.value || 0; // in meters
        const durationValue = leg.duration?.value || 0; // in seconds

        console.log(
          `✅ Route found to ${shelter.name}: ${(distanceValue / 1000).toFixed(
            1
          )}km, ${Math.round(durationValue / 60)}min`
        );

        validRoutes.push({
          shelter,
          route: result,
          distance: distanceValue,
          duration: durationValue,
        });
      } catch (error: any) {
        console.log(`❌ Route failed to ${shelter.name}: ${error.message}`);

        // If this is a billing/permission error, break and use fallback
        if (
          error.message.includes("REQUEST_DENIED") ||
          error.message.includes("OVER_QUERY_LIMIT")
        ) {
          console.log(
            "🔄 Directions API not available, using straight-line distance fallback..."
          );
          break;
        }
      }
    }

    // Step 4: If no routes found with Directions API, use straight-line distance fallback
    if (validRoutes.length === 0) {
      console.log("🔄 Using straight-line distance calculation as fallback...");

      const shelterDistances = shelters.map((shelter) => {
        const distance = calculateDistance(
          origin.lat,
          origin.lng,
          shelter.latitude,
          shelter.longitude
        );

        // Estimate duration: assume 50 km/h average speed
        const estimatedDuration = (distance / 1000 / 50) * 3600; // seconds

        return {
          shelter,
          route: null, // No actual route available
          distance,
          duration: estimatedDuration,
        };
      });

      // Sort by distance and return nearest
      shelterDistances.sort((a, b) => a.distance - b.distance);
      const nearest = shelterDistances[0];

      console.log(
        `🎯 Nearest shelter (straight-line): ${nearest.shelter.name} (${(
          nearest.distance / 1000
        ).toFixed(1)}km away)`
      );

      return nearest;
    }

    // Step 5: Find the shortest route (by distance)
    validRoutes.sort((a, b) => a.distance - b.distance);
    const nearestRoute = validRoutes[0];

    console.log(
      `🎯 Nearest shelter selected: ${nearestRoute.shelter.name} (${(
        nearestRoute.distance / 1000
      ).toFixed(1)}km away)`
    );

    return nearestRoute;
  };

  // Initialize Google Maps
  const initializeMap = async () => {
    try {
      const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!googleMapsApiKey) {
        throw new Error(
          "Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables."
        );
      }

      const loader = new Loader({
        apiKey: googleMapsApiKey,
        version: "weekly",
        libraries: ["places", "geometry"],
        region: "IN", // Set region to India for better performance
      });

      await loader.load();

      if (!mapRef.current) return;

      // Initialize map centered on India
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Initialize directions renderer for admin routes (always initialize for potential use)
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer(
        {
          draggable: false,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: isAdmin ? "#2563EB" : "#059669", // Blue for admin, green for automatic
            strokeWeight: 5,
            strokeOpacity: 0.8,
          },
        }
      );
      directionsRendererRef.current.setMap(map);

      setIsMapLoaded(true);

      // Get user's current location
      getUserLocation();
    } catch (err) {
      console.error("Error initializing map:", err);
      setError(err instanceof Error ? err.message : "Failed to load map");
    }
  };

  // Get user's current location using geolocation API
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };

        setUserLocation(location);

        // Add user location marker
        if (mapInstanceRef.current) {
          new window.google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            title: "Your Location",
            icon: {
              url:
                "data:image/svg+xml;base64," +
                btoa(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#2563EB" stroke="#FFFFFF" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12),
            },
          });
        }
      },
      (error) => {
        console.warn("Error getting user location:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };
  // Add disaster markers to the map
  const addDisasterMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add disaster markers
    disasters.forEach((disaster) => {
      if (!mapInstanceRef.current) return;

      const marker = new window.google.maps.Marker({
        position: { lat: disaster.latitude, lng: disaster.longitude },
        map: mapInstanceRef.current,
        title: `${disaster.name} (${disaster.type})`,
        icon: {
          url:
            "data:image/svg+xml;base64," +
            btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" fill="${getDisasterColor(
                disaster.type,
                disaster.severity
              )}" stroke="#FFFFFF" stroke-width="2"/>
              <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">!</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        },
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${
              disaster.name
            }</h3>
            <p style="margin: 4px 0; font-size: 14px;">Type: ${
              disaster.type
            }</p>
            <p style="margin: 4px 0; font-size: 14px;">Severity: <span style="color: ${getDisasterColor(
              disaster.type,
              disaster.severity
            )}; font-weight: bold;">${disaster.severity}</span></p>
            ${
              disaster.sosCount
                ? `<p style="margin: 4px 0; font-size: 14px;">SOS Calls: ${disaster.sosCount}</p>`
                : ""
            }
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Add SOS alert markers (red blinking)
    sosAlerts.forEach((alert) => {
      if (!mapInstanceRef.current) return;

      const marker = new window.google.maps.Marker({
        position: { lat: alert.latitude, lng: alert.longitude },
        map: mapInstanceRef.current,
        title: `SOS Alert - ${alert.timestamp.toLocaleString()}`,
        icon: {
          url:
            "data:image/svg+xml;base64," +
            btoa(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">SOS</text>
              <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12),
        },
        animation: window.google.maps.Animation.BOUNCE,
      });

      // Add click handler for admin route selection
      if (isAdmin) {
        marker.addListener("click", () => {
          console.log(`🚨 Admin selected SOS alert:`, alert);
          setSelectedSOS(alert);
          setSelectedShelter(null); // Reset shelter selection
        });
      }

      markersRef.current.push(marker);
    });

    // Add safe shelter markers (green)
    safeShelters.forEach((shelter) => {
      if (!mapInstanceRef.current) return;

      const marker = new window.google.maps.Marker({
        position: { lat: shelter.latitude, lng: shelter.longitude },
        map: mapInstanceRef.current,
        title: `Safe Shelter - ${shelter.name}`,
        icon: {
          url:
            "data:image/svg+xml;base64," +
            btoa(`
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="12" fill="#059669" stroke="#FFFFFF" stroke-width="2"/>
              <text x="14" y="18" text-anchor="middle" fill="white" font-size="12" font-weight="bold">H</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(28, 28),
          anchor: new window.google.maps.Point(14, 14),
        },
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${shelter.name}</h3>
            <p style="margin: 4px 0; font-size: 14px;">Capacity: ${shelter.capacity} people</p>
            <p style="margin: 4px 0; font-size: 14px; color: #059669;">Safe Shelter</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        if (isAdmin) {
          console.log(`🏠 Admin selected shelter:`, shelter);
          setSelectedShelter(shelter);
        } else {
          infoWindow.open(mapInstanceRef.current, marker);
        }
      });

      markersRef.current.push(marker);
    });
  };

  // Generate route between selected SOS and shelter (Admin only)
  const generateRoute = async () => {
    if (!selectedSOS || !selectedShelter || !mapInstanceRef.current) {
      console.log(
        "❌ Cannot generate route: Missing SOS, shelter, or map instance"
      );
      return;
    }

    console.log(
      `🛣️ Admin generating route from SOS (${selectedSOS.latitude}, ${selectedSOS.longitude}) to shelter: ${selectedShelter.name}`
    );

    // Check if Google Maps and DirectionsService are available
    if (
      !window.google ||
      !window.google.maps ||
      !window.google.maps.DirectionsService
    ) {
      console.error("❌ Google Maps DirectionsService not available");
      setError(
        "Google Maps services not loaded properly. Please refresh the page."
      );
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    try {
      console.log("🔍 Making directions request...");

      // Use Promise wrapper for better error handling
      const result = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: { lat: selectedSOS.latitude, lng: selectedSOS.longitude },
            destination: {
              lat: selectedShelter.latitude,
              lng: selectedShelter.longitude,
            },
            travelMode: window.google.maps.TravelMode.DRIVING,
            avoidTolls: false,
            avoidHighways: false,
            unitSystem: window.google.maps.UnitSystem.METRIC,
            region: "IN", // Specify India region
          },
          (result: any, status: any) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              resolve(result);
            } else {
              reject(
                new Error(`Directions request failed with status: ${status}`)
              );
            }
          }
        );
      });

      console.log("✅ Route generated successfully");

      // Initialize directions renderer if not already done
      if (!directionsRendererRef.current) {
        directionsRendererRef.current =
          new window.google.maps.DirectionsRenderer({
            draggable: false,
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: "#2563EB", // Blue color for admin routes
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
          });
        directionsRendererRef.current.setMap(mapInstanceRef.current);
      }

      // Clear any existing route and set new one
      directionsRendererRef.current.setDirections(result);

      // Extract route information
      const route = (result as any).routes[0];
      const leg = route.legs[0];
      const distance = leg.distance
        ? (leg.distance.value / 1000).toFixed(1)
        : "Unknown";
      const duration = leg.duration
        ? Math.round(leg.duration.value / 60)
        : "Unknown";

      console.log(`📊 Route details: ${distance}km, ${duration}min`);

      // Call callback with route information
      onRouteGenerated?.(result);

      // Show success message
      alert(`✅ Route Generated Successfully!

🚨 From SOS Alert to: ${selectedShelter.name}
📍 Distance: ${distance} km
⏱️ Estimated time: ${duration} minutes
🏠 Shelter capacity: ${selectedShelter.capacity} people

The blue route is now displayed on the map.`);
    } catch (error: any) {
      console.error("❌ Error generating route:", error);

      let errorMessage = "Failed to generate route";
      const errorString = error.message || error.toString();

      if (errorString.includes("REQUEST_DENIED")) {
        errorMessage = `🔑 API Permission Error: The Google Maps API key doesn't have permission to use the Directions service.

Please ensure:
1. Directions API is enabled in Google Cloud Console
2. API key has proper restrictions
3. Billing is enabled for your Google Cloud project
4. API key is not restricted to specific referrer URLs (or add localhost:5174 to allowed URLs)

Current error: ${errorString}`;
      } else if (errorString.includes("OVER_QUERY_LIMIT")) {
        errorMessage =
          "API quota exceeded. Please try again later or upgrade your Google Maps plan.";
      } else if (errorString.includes("ZERO_RESULTS")) {
        errorMessage =
          "No route could be found between these locations. Try different points.";
      } else if (errorString.includes("NOT_FOUND")) {
        errorMessage =
          "One or both locations could not be found. Please verify the coordinates.";
      } else {
        errorMessage = `Route generation failed: ${errorString}`;
      }

      setError(errorMessage);

      alert(`❌ Route Generation Failed

${errorMessage}

Troubleshooting steps:
1. Check Google Cloud Console for API key setup
2. Ensure Directions API is enabled
3. Verify billing is active
4. Check API key restrictions`);
    }
  };

  // Send SOS alert with automatic route finding to nearest shelter
  const sendSOSAlert = async () => {
    if (!userLocation) {
      setError("Location not available. Please enable location services.");
      return;
    }

    setIsSearchingRoute(true);
    setError(null);

    try {
      // Step 1: Send SOS alert to backend
      console.log("📡 Sending SOS alert to backend...");
      const response = await api.post("/sos", {
        text: "Emergency assistance needed - SOS alert from map location",
      });

      if (response.data?.success) {
        console.log("✅ SOS alert sent successfully");
      } else {
        throw new Error("Failed to send SOS alert");
      }

      // Step 2: Add immediate visual feedback - red blinking SOS marker
      console.log("🚨 Adding SOS marker to map...");
      if (mapInstanceRef.current) {
        const sosMarker = new window.google.maps.Marker({
          position: userLocation,
          map: mapInstanceRef.current,
          title: "Your SOS Alert - Searching for safe route...",
          icon: {
            url:
              "data:image/svg+xml;base64," +
              btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#DC2626" stroke="#FFFFFF" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">SOS</text>
                <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16),
          },
          animation: window.google.maps.Animation.BOUNCE,
        });

        markersRef.current.push(sosMarker);
      }

      // Step 3: Find nearest safe shelter and generate route
      console.log("🔍 Searching for nearest safe shelter...");
      const safeRouteResult = await getSafeRoute(userLocation, safeShelters);

      if (safeRouteResult) {
        // Step 4: Display the route on map
        console.log("✅ Safe route found! Displaying on map...");
        setNearestShelter(safeRouteResult.shelter);

        // Only render actual route if available (not straight-line distance)
        if (safeRouteResult.route) {
          // Initialize directions renderer if not already done
          if (!directionsRendererRef.current) {
            directionsRendererRef.current =
              new window.google.maps.DirectionsRenderer({
                draggable: false,
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: "#059669", // Green color for safe route
                  strokeWeight: 6,
                  strokeOpacity: 0.8,
                },
              });
            directionsRendererRef.current.setMap(mapInstanceRef.current);
          }

          // Render the route
          directionsRendererRef.current.setDirections(safeRouteResult.route);

          // Call callback if provided
          onRouteGenerated?.(safeRouteResult.route);
        } else {
          // For straight-line distance, draw a simple line
          console.log("📏 Drawing straight-line path to nearest shelter...");

          const lineSymbol = {
            path: "M 0,-1 0,1",
            strokeOpacity: 1,
            scale: 4,
          };

          const line = new window.google.maps.Polyline({
            path: [
              userLocation,
              {
                lat: safeRouteResult.shelter.latitude,
                lng: safeRouteResult.shelter.longitude,
              },
            ],
            geodesic: true,
            strokeColor: "#059669",
            strokeOpacity: 0,
            strokeWeight: 6,
            icons: [
              {
                icon: lineSymbol,
                offset: "0",
                repeat: "20px",
              },
            ],
            map: mapInstanceRef.current,
          });

          // Store the line for potential cleanup
          markersRef.current.push(line);
        }

        // Step 5: Show success message with route details
        const distanceKm = (safeRouteResult.distance / 1000).toFixed(1);
        const durationMin = Math.round(safeRouteResult.duration / 60);

        const routeType = safeRouteResult.route
          ? "Safe route"
          : "Nearest shelter (straight-line distance)";
        const routeNote = safeRouteResult.route
          ? "Follow the green path to reach safety!"
          : "Use your preferred navigation app for the best route.";

        alert(`🚨 SOS Alert Sent Successfully!

🛣️ ${routeType} found to: ${safeRouteResult.shelter.name}
📍 Distance: ${distanceKm} km
⏱️ Estimated time: ${durationMin} minutes
🏠 Shelter capacity: ${safeRouteResult.shelter.capacity} people

${routeNote}`);
      } else {
        // Step 6: No safe route found - show error
        console.log("❌ No safe routes available");
        setError(
          "No safe route available to any shelter. Please try alternative transportation or contact emergency services directly."
        );

        alert(`🚨 SOS Alert Sent Successfully!

⚠️ Warning: No safe driving route could be calculated to any shelter at this time.

Please consider:
• Walking to the nearest safe area
• Contacting emergency services: 112
• Seeking shelter in nearby sturdy buildings
• Waiting for emergency responders

Your location has been shared with emergency services.`);
      }
    } catch (error) {
      console.error("Error sending SOS alert:", error);
      setError("Failed to send SOS alert. Please try again.");
    } finally {
      setIsSearchingRoute(false);
    }
  };

  // Add disaster-prone area polygons
  const addDisasterProneAreas = () => {
    if (!mapInstanceRef.current) return;

    // Example disaster-prone areas (you can replace with real data)
    const proneAreas = [
      {
        name: "Flood Prone Area - Bihar",
        coordinates: [
          { lat: 25.0961, lng: 85.3131 },
          { lat: 25.5941, lng: 85.1376 },
          { lat: 25.644, lng: 85.9063 },
          { lat: 25.2048, lng: 86.083 },
        ],
        type: "flood",
      },
      {
        name: "Earthquake Prone Area - Himachal Pradesh",
        coordinates: [
          { lat: 31.1048, lng: 77.1734 },
          { lat: 32.0836, lng: 77.5719 },
          { lat: 31.8853, lng: 78.0747 },
          { lat: 31.2256, lng: 77.7089 },
        ],
        type: "earthquake",
      },
    ];

    proneAreas.forEach((area) => {
      const polygon = new window.google.maps.Polygon({
        paths: area.coordinates,
        strokeColor: getDisasterColor(area.type, "medium"),
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: getDisasterColor(area.type, "low"),
        fillOpacity: 0.35,
        map: mapInstanceRef.current,
      });

      // Add info window on click
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${area.name}</h3>
            <p style="margin: 4px 0; font-size: 14px;">Type: ${area.type}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #DC2626;">High Risk Zone</p>
          </div>
        `,
      });

      polygon.addListener("click", (event: any) => {
        if (event.latLng) {
          infoWindow.setPosition(event.latLng);
          infoWindow.open(mapInstanceRef.current);
        }
      });
    });
  };

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (isMapLoaded) {
      addDisasterMarkers();
      addDisasterProneAreas();
    }
  }, [disasters, sosAlerts, safeShelters, isMapLoaded]);

  // Handle route generation when both SOS and shelter are selected
  useEffect(() => {
    console.log("🔄 Route generation check:", {
      selectedSOS: !!selectedSOS,
      selectedShelter: !!selectedShelter,
      isAdmin,
      sosDetails: selectedSOS
        ? `${selectedSOS.latitude}, ${selectedSOS.longitude}`
        : "none",
      shelterDetails: selectedShelter ? selectedShelter.name : "none",
    });

    if (selectedSOS && selectedShelter && isAdmin) {
      console.log("✅ All conditions met, generating admin route...");
      generateRoute();
    } else {
      const missing = [];
      if (!selectedSOS) missing.push("SOS");
      if (!selectedShelter) missing.push("Shelter");
      if (!isAdmin) missing.push("Admin Mode");
      console.log(
        `❌ Missing requirements for route generation: ${missing.join(", ")}`
      );
    }
  }, [selectedSOS, selectedShelter, isAdmin]);

  if (error) {
    return (
      <Alert className="w-full">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg border" />

      {/* SOS Button */}
      <div className="absolute top-4 right-20 space-y-2 ">
        <Button
          onClick={sendSOSAlert}
          className={`${
            isSearchingRoute
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-red-600 hover:bg-red-700"
          } text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-200`}
          disabled={!userLocation || !isMapLoaded || isSearchingRoute}
        >
          <AlertTriangle
            className={`w-4 h-4 mr-2 ${
              isSearchingRoute ? "animate-pulse" : ""
            }`}
          />
          {isSearchingRoute ? "FINDING ROUTE..." : "SEND SOS"}
        </Button>

        {/* Test API Button */}
        {/* <Button
          onClick={testDirectionsAPI}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg shadow-lg text-xs"
          disabled={!isMapLoaded}
        >
          Test API
        </Button> */}

        {/* Route Information */}
        {nearestShelter && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg shadow-lg max-w-xs">
            <h4 className="font-semibold text-sm mb-2 text-green-800">
              Safe Route Found
            </h4>
            <p className="text-xs text-green-700 mb-1">
              🏠 {nearestShelter.name}
            </p>
            <p className="text-xs text-green-600">
              Capacity: {nearestShelter.capacity} people
            </p>
            <p className="text-xs text-green-600 mt-1">
              Follow the green route on the map
            </p>
          </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
          <div className="bg-white p-3 rounded-lg shadow-lg max-w-xs">
            <h4 className="font-semibold text-sm mb-2 text-blue-800">
              Admin Route Generator
            </h4>

            {!selectedSOS && !selectedShelter && (
              <p className="text-xs text-gray-600 mb-2">
                Click on a red SOS marker and green shelter marker to generate
                rescue route
              </p>
            )}

            {selectedSOS && (
              <div className="mb-2">
                <p className="text-xs text-red-600 font-medium">
                  ✅ SOS Selected:
                </p>
                <p className="text-xs text-gray-600">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {selectedSOS.latitude.toFixed(4)},{" "}
                  {selectedSOS.longitude.toFixed(4)}
                </p>
              </div>
            )}

            {selectedShelter && (
              <div className="mb-2">
                <p className="text-xs text-green-600 font-medium">
                  ✅ Shelter Selected:
                </p>
                <p className="text-xs text-gray-600">
                  🏠 {selectedShelter.name}
                </p>
                <p className="text-xs text-gray-500">
                  Capacity: {selectedShelter.capacity} people
                </p>
              </div>
            )}

            {selectedSOS && !selectedShelter && (
              <p className="text-xs text-orange-600">
                Now click on a green shelter marker to generate route
              </p>
            )}

            {!selectedSOS && selectedShelter && (
              <p className="text-xs text-orange-600">
                Now click on a red SOS marker to generate route
              </p>
            )}

            {selectedSOS && selectedShelter && (
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <p className="text-xs text-green-700 font-medium">
                  🛣️ Route Generated!
                </p>
                <p className="text-xs text-green-600">
                  Blue path shows rescue route
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {!isMapLoaded && !error && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Route Search Loading Indicator */}
      {isSearchingRoute && (
        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
            <p className="text-gray-800 font-semibold">
              Finding nearest safe shelter...
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Testing routes to {safeShelters.length} shelters
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterMap;