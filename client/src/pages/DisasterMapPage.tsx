import DisasterMap from "@/components/DisasterMap";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { disasterData } from "@/data/disasters";
import {
  SOSAlert as ImportedSOSAlert,
  sosAlerts as initialSosAlerts,
} from "@/data/sosAlerts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/apiClient";
import { Activity, AlertTriangle, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Extended SOSAlert interface for local use
interface SOSAlert extends ImportedSOSAlert {
  category?: string;
}

// API response interface for disaster events
interface DisasterEvent {
  id: number;
  eventName: string;
  disasterType: string;
  isActive: boolean;
  createdAt: string;
  affectedArea: {
    type: string;
    coordinates: number[][][];
  };
  center: {
    latitude: number;
    longitude: number;
  };
}

interface DisasterResponse {
  success: boolean;
  data: {
    events: DisasterEvent[];
  };
}
interface SOSResponse {
  success: boolean;
  data: {
    sosRequests: Array<{
      id: number;
      text: string;
      longitude: number;
      latitude: number;
      status: string;
      category: string;
      urgency: string;
      createdAt: string;
      createdBy: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Function to transform API SOS data to local format
const transformAPISosData = (
  apiSosRequests: SOSResponse["data"]["sosRequests"]
): SOSAlert[] => {
  return apiSosRequests.map((sos) => ({
    id: sos.id,
    text: sos.text,
    location: `${sos.latitude.toFixed(4)}, ${sos.longitude.toFixed(4)}`,
    status: sos.status as "NEW" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED",
    urgency: sos.urgency as "Low" | "Medium" | "High" | "Critical",
    category: sos.category,
    createdAt: sos.createdAt,
    createdBy: parseInt(sos.createdBy),
    coordinates: {
      lat: sos.latitude,
      lng: sos.longitude,
    },
  }));
};

interface NewSOSData {
  sos: {
    id: number;
    text: string;
    status: string;
    urgency: string;
    category: string;
    createdAt: string;
    location: {
      latitude: number;
      longitude: number;
    };
    user: {
      id: number;
      fullName: string;
    };
  };
}

// Transform data to match our new DisasterMap component interface
const transformDisasterData = () => {
  return disasterData.map((disaster) => ({
    id: disaster.id.toString(),
    latitude: disaster.latitude,
    longitude: disaster.longitude,
    type: disaster.type.toLowerCase() as
      | "flood"
      | "fire"
      | "earthquake"
      | "cyclone"
      | "drought",
    severity:
      disaster.fillKey === "HIGH_IMPACT"
        ? "critical"
        : disaster.fillKey === "MEDIUM_IMPACT"
        ? "medium"
        : ("low" as "low" | "medium" | "high" | "critical"),
    name: disaster.name,
    sosCount: disaster.sosCount,
  }));
};

const transformSOSData = (alerts: SOSAlert[]) => {
  return alerts
    .filter((alert) => alert.status === "NEW" || alert.status === "ASSIGNED")
    .filter((alert) => alert.coordinates) // Only include alerts with coordinates
    .map((alert) => ({
      id: alert.id.toString(),
      latitude: alert.coordinates!.lat,
      longitude: alert.coordinates!.lng,
      timestamp: new Date(alert.createdAt),
      userId: alert.createdBy.toString(),
    }));
};

// Enhanced safe shelters list with more coverage across India
const safeShelters = [
  // North India
  {
    id: "shelter1",
    latitude: 28.68,
    longitude: 77.12,
    name: "Central Delhi Emergency Center",
    capacity: 500,
  },
  {
    id: "shelter2",
    latitude: 28.3949,
    longitude: 77.3178,
    name: "Noida Relief Station",
    capacity: 250,
  },
  {
    id: "shelter3",
    latitude: 30.7333,
    longitude: 76.7794,
    name: "Chandigarh Emergency Hub",
    capacity: 300,
  },
  {
    id: "shelter4",
    latitude: 31.1048,
    longitude: 77.1734,
    name: "Shimla Mountain Shelter",
    capacity: 200,
  },

  // West India
  {
    id: "shelter5",
    latitude: 19.1,
    longitude: 72.9,
    name: "Mumbai Relief Center",
    capacity: 400,
  },
  {
    id: "shelter6",
    latitude: 18.5204,
    longitude: 73.8567,
    name: "Pune Emergency Station",
    capacity: 350,
  },
  {
    id: "shelter7",
    latitude: 23.0225,
    longitude: 72.5714,
    name: "Ahmedabad Safe House",
    capacity: 300,
  },
  {
    id: "shelter8",
    latitude: 26.9124,
    longitude: 75.7873,
    name: "Jaipur Emergency Center",
    capacity: 280,
  },

  // South India
  {
    id: "shelter9",
    latitude: 13.0827,
    longitude: 80.2707,
    name: "Chennai Safe House",
    capacity: 450,
  },
  {
    id: "shelter10",
    latitude: 12.9716,
    longitude: 77.5946,
    name: "Bangalore Emergency Hub",
    capacity: 400,
  },
  {
    id: "shelter11",
    latitude: 17.385,
    longitude: 78.4867,
    name: "Hyderabad Relief Station",
    capacity: 380,
  },
  {
    id: "shelter12",
    latitude: 15.2993,
    longitude: 74.124,
    name: "Goa Coastal Shelter",
    capacity: 200,
  },
  {
    id: "shelter13",
    latitude: 11.0168,
    longitude: 76.9558,
    name: "Coimbatore Emergency Center",
    capacity: 250,
  },

  // East India
  {
    id: "shelter14",
    latitude: 22.5726,
    longitude: 88.3639,
    name: "Kolkata Emergency Shelter",
    capacity: 350,
  },
  {
    id: "shelter15",
    latitude: 25.5941,
    longitude: 85.1376,
    name: "Patna Relief Center",
    capacity: 300,
  },
  {
    id: "shelter16",
    latitude: 26.8467,
    longitude: 80.9462,
    name: "Lucknow Emergency Station",
    capacity: 320,
  },

  // Northeast India
  {
    id: "shelter17",
    latitude: 26.1445,
    longitude: 91.7362,
    name: "Guwahati Safe Hub",
    capacity: 200,
  },
  {
    id: "shelter18",
    latitude: 27.0238,
    longitude: 88.2636,
    name: "Gangtok Mountain Shelter",
    capacity: 150,
  },

  // Central India
  {
    id: "shelter19",
    latitude: 23.2599,
    longitude: 77.4126,
    name: "Bhopal Emergency Center",
    capacity: 280,
  },
  {
    id: "shelter20",
    latitude: 21.1458,
    longitude: 79.0882,
    name: "Nagpur Relief Station",
    capacity: 300,
  },
];

export const DisasterMapPage = () => {
  const [_isSendingSOS, _setIsSendingSOS] = useState(false);
  const [_sosMessage, _setSosMessage] = useState("");
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingDisasters, setIsLoadingDisasters] = useState(true);
  const [disasterStats, setDisasterStats] = useState({
    totalDisasters: 0,
    totalSOSAlerts: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const newSocket = io(
      import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
        "http://localhost:5000"
    );

    newSocket.on("connect", () => {
      console.log("🔌 Connected to server for real-time updates");

      // Join user room for targeted notifications if user is logged in
      if (user?.id) {
        newSocket.emit("join-user-room", user.id);
      }
    });

    // Listen for new SOS alerts (for admins)
    newSocket.on("new-sos", (newSosData: NewSOSData) => {
      console.log("🚨 New SOS alert received:", newSosData);

      // Transform the new SOS data to match our format
      const newSosAlert: SOSAlert = {
        id: newSosData.sos.id,
        text: newSosData.sos.text,
        location: `${newSosData.sos.location.latitude.toFixed(
          4
        )}, ${newSosData.sos.location.longitude.toFixed(4)}`,
        status: newSosData.sos.status as
          | "NEW"
          | "ASSIGNED"
          | "IN_PROGRESS"
          | "RESOLVED",
        urgency: newSosData.sos.urgency as
          | "Low"
          | "Medium"
          | "High"
          | "Critical",
        category: newSosData.sos.category,
        createdAt: newSosData.sos.createdAt,
        createdBy: newSosData.sos.user.id,
        assignedTo: undefined,
        coordinates: {
          lat: newSosData.sos.location.latitude,
          lng: newSosData.sos.location.longitude,
        },
      };

      // Update SOS alerts state
      setSosAlerts((prev) => [newSosAlert, ...prev]);

      // Show toast notification for admins
      if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
        toast({
          title: "New SOS Alert",
          description: `Emergency alert from ${
            newSosData.sos.user.fullName
          }: ${newSosData.sos.text.slice(0, 50)}...`,
          variant: "destructive",
        });
      }
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Disconnected from server");
    });

    return () => {
      newSocket.close();
    };
  }, [user, toast]);

  // Fetch real SOS data from the API when component mounts
  useEffect(() => {
    const fetchSOSData = async () => {
      try {
        if (
          !user ||
          !["ADMIN", "VOLUNTEER", "DEPARTMENT", "SUPER_ADMIN"].includes(
            user.role
          )
        ) {
          // Use fallback data for regular users or unauthenticated users
          setSosAlerts(initialSosAlerts);
          setIsLoadingData(false);
          return;
        }

        console.log("🔍 Fetching real SOS data from API...");
        setIsLoadingData(true);

        const response = await api.get<SOSResponse>("/sos?limit=50");

        if (response.data.success && response.data.data.sosRequests) {
          const realSosData = transformAPISosData(
            response.data.data.sosRequests
          );
          console.log(
            `✅ Loaded ${realSosData.length} real SOS alerts from database`
          );
          setSosAlerts(realSosData);
        } else {
          console.log("⚠️ No real SOS data available, using fallback data");
          setSosAlerts(initialSosAlerts);
        }
      } catch (error) {
        console.error("❌ Failed to fetch real SOS data:", error);
        console.log("📋 Using fallback static data");
        setSosAlerts(initialSosAlerts);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchSOSData();
  }, [user]); // Re-fetch when user changes

  // Fetch real disaster data from the API when component mounts
  useEffect(() => {
    const fetchDisasterData = async () => {
      try {
        console.log("🔍 Fetching real disaster data from API...");
        setIsLoadingDisasters(true);

        const response = await api.get<DisasterResponse>(
          "/disasters/map/events"
        );

        if (response.data.success && response.data.data.events) {
          console.log(
            `✅ Loaded ${response.data.data.events.length} real disaster events from database`
          );
          setDisasters(response.data.data.events);
        } else {
          console.log("⚠️ No real disaster data available");
          setDisasters([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch real disaster data:", error);
        console.log("📋 Using empty disaster data");
        setDisasters([]);
      } finally {
        setIsLoadingDisasters(false);
      }
    };

    fetchDisasterData();
  }, []); // Fetch once on component mount

  // Update disaster stats when SOS alerts or disasters change
  useEffect(() => {
    const totalDisasters = disasters.length;
    const totalSOSAlerts = sosAlerts.length;
    const activeAlerts = sosAlerts.filter(
      (alert) => alert.status === "NEW" || alert.status === "ASSIGNED"
    ).length;
    const criticalAlerts = sosAlerts.filter(
      (alert) => alert.urgency === "Critical"
    ).length;

    setDisasterStats({
      totalDisasters,
      totalSOSAlerts,
      activeAlerts,
      criticalAlerts,
    });
  }, [sosAlerts, disasters]); // Add disasters as dependency

  // const handleSendSOS = async () => {
  //   // Check if user is authenticated
  //   if (!user) {
  //     toast({
  //       title: "Authentication Required",
  //       description: "Please log in to send SOS alerts.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   if (!sosMessage.trim()) {
  //     toast({
  //       title: "Error",
  //       description: "Please enter an SOS message describing your emergency.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   if (sosMessage.trim().length < 10) {
  //     toast({
  //       title: "Error",
  //       description:
  //         "Please provide more details about your emergency (at least 10 characters).",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setIsSendingSOS(true);

  //   try {
  //     // First, try to get user's current location
  //     const updateUserLocation = () => {
  //       return new Promise<{ latitude: number; longitude: number }>(
  //         (resolve, reject) => {
  //           if (!navigator.geolocation) {
  //             reject(new Error("Geolocation is not supported by this browser"));
  //             return;
  //           }

  //           navigator.geolocation.getCurrentPosition(
  //             (position) => {
  //               resolve({
  //                 latitude: position.coords.latitude,
  //                 longitude: position.coords.longitude,
  //               });
  //             },
  //             (error) => {
  //               reject(new Error(`Could not get location: ${error.message}`));
  //             },
  //             { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  //           );
  //         }
  //       );
  //     };

  //     // Get user location and update it on the server
  //     try {
  //       const location = await updateUserLocation();

  //       // Update user location on server
  //       console.log("Updating user location on server:", location);
  //       const locationResponse = await api.put("/user/location", {
  //         latitude: location.latitude,
  //         longitude: location.longitude,
  //       });

  //       console.log(
  //         "User location updated successfully:",
  //         locationResponse.data
  //       );
  //     } catch (locationError: unknown) {
  //       console.error("Could not update location:", locationError);

  //       // If location update fails, show more specific error
  //       const axiosLocationError = locationError as {
  //         response?: { data?: { message?: string } };
  //       };
  //       if (axiosLocationError.response?.data?.message) {
  //         toast({
  //           title: "Location Update Failed",
  //           description: axiosLocationError.response.data.message,
  //           variant: "destructive",
  //         });
  //         return; // Don't proceed with SOS if location update fails
  //       }

  //       // Continue with SOS creation anyway - maybe user already has location set
  //     }

  //     // Now try to create the SOS request
  //     const response = await api.post("/sos", {
  //       text: sosMessage.trim(),
  //     });

  //     if (
  //       response.data &&
  //       typeof response.data === "object" &&
  //       "success" in response.data &&
  //       response.data.success
  //     ) {
  //       toast({
  //         title: "SOS Alert Sent Successfully",
  //         description:
  //           "Emergency services have been notified. Help is on the way!",
  //       });
  //       setSosMessage(""); // Clear the message
  //     }
  //   } catch (error: unknown) {
  //     console.error("Failed to send SOS:", error);

  //     const axiosError = error as {
  //       response?: { data?: { message?: string } };
  //     };

  //     // Log the full error response for debugging
  //     if (axiosError.response) {
  //       console.error("Server response:", axiosError.response.data);
  //     }

  //     // Check if it's a location-related error
  //     if (axiosError.response?.data?.message?.includes("location")) {
  //       toast({
  //         title: "Location Required",
  //         description:
  //           "Please enable location services and try again. Your location is needed for emergency response.",
  //         variant: "destructive",
  //       });
  //     } else if (
  //       axiosError.response?.data?.message?.includes("Validation failed")
  //     ) {
  //       toast({
  //         title: "Invalid Input",
  //         description:
  //           "Please provide a detailed description of your emergency (10-1000 characters).",
  //         variant: "destructive",
  //       });
  //     } else if (axiosError.response?.data?.message) {
  //       // Show the actual server error message
  //       toast({
  //         title: "Failed to Send SOS",
  //         description: axiosError.response.data.message,
  //         variant: "destructive",
  //       });
  //     } else {
  //       toast({
  //         title: "Failed to Send SOS",
  //         description:
  //           "There was an error sending your emergency alert. Please try again.",
  //         variant: "destructive",
  //       });
  //     }
  //   } finally {
  //     setIsSendingSOS(false);
  //   }
  // };

  const handleRouteGenerated = (route: unknown) => {
    console.log("Route generated:", route);
    toast({
      title: "Route Generated",
      description:
        "Emergency route has been calculated and displayed on the map.",
    });
  };

  const transformedDisasters = transformDisasterData();
  const transformedSOSAlerts = transformSOSData(sosAlerts);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Disaster Overview
          </h1>
          <p className="text-gray-600">
            Real-time disaster monitoring and emergency response
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Disasters
            </CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {disasterStats.totalDisasters}
            </div>
            <p className="text-xs text-gray-600">Currently monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total SOS Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {disasterStats.totalSOSAlerts}
            </div>
            <p className="text-xs text-gray-600">All time alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {disasterStats.activeAlerts}
            </div>
            <p className="text-xs text-gray-600">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {disasterStats.criticalAlerts}
            </div>
            <p className="text-xs text-gray-600">High priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Disaster Map</CardTitle>
          <CardDescription>
            Real-time Google Maps view showing disasters, SOS alerts, and safe
            shelters.
            {user?.role === "ADMIN"
              ? " As admin, you can select SOS alerts and shelters to generate routes."
              : " Click the red SOS button to send emergency alerts."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading real SOS data...</p>
              </div>
            </div>
          ) : (
            <>
              <DisasterMap
                disasters={transformedDisasters}
                sosAlerts={transformedSOSAlerts}
                safeShelters={safeShelters}
                isAdmin={user?.role === "ADMIN"}
                onRouteGenerated={handleRouteGenerated}
              />

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                  <span>Critical Disasters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span>High Severity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span>Medium Severity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <span>Low Severity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <span>SOS Alerts ({sosAlerts.length} total)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-700 rounded-full"></div>
                  <span>Safe Shelters</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  <span>Your Location</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Disasters */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Disasters</CardTitle>
          <CardDescription>
            Latest disaster updates and impact assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDisasters ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">
                  Loading disaster data...
                </p>
              </div>
            </div>
          ) : disasters.length > 0 ? (
            <div className="space-y-4">
              {disasters.slice(0, 5).map((disaster) => (
                <div
                  key={disaster.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {disaster.eventName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Type: {disaster.disasterType}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Location: {disaster.center.latitude.toFixed(4)}°N,{" "}
                        {disaster.center.longitude.toFixed(4)}°E
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(disaster.createdAt).toLocaleDateString()} at{" "}
                        {new Date(disaster.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          disaster.isActive
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {disaster.isActive ? "Active" : "Resolved"}
                      </span>
                      <span className="text-xs text-gray-500 mt-2">
                        ID: {disaster.id}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {disasters.length > 5 && (
                <div className="text-center pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    Showing 5 of {disasters.length} total disasters
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium">No Active Disasters</p>
              <p className="text-sm mt-2">
                Currently no active disaster events in the database.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating SOS Button */}
    </div>
  );
};