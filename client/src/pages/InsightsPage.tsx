import DisasterMap from "@/components/DisasterMap";
import { DisasterTeamDashboard } from "@/components/DisasterTeamDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sosAlerts } from "@/data/sosAlerts";
import { users } from "@/data/users";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  Shield,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Types for SOS request data
interface SOSRequestData {
  sosId: number;
  text: string;
  category: string;
  urgency: string;
  createdAt: string;
  location: {
    latitude: number;
    longitude: number;
  };
  volunteerDistance?: number;
  estimatedDistance?: number;
}

export const InsightsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [sosRequest, setSosRequest] = useState<SOSRequestData | null>(null);
  const [showSOSDialog, setShowSOSDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [volunteerLocation, setVolunteerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Initialize WebSocket for volunteers and departments
  useEffect(() => {
    if (user?.role === "VOLUNTEER" || user?.role === "DEPARTMENT") {
      const newSocket = io(
        import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
          "http://localhost:5000"
      );

      newSocket.on("connect", () => {
        console.log("🔌 Volunteer/Department connected to SOS notifications");
        if (user?.id) {
          newSocket.emit("join-user-room", user.id);
        }
      });

      // Listen for SOS requests
      newSocket.on("sos-request", (sosData: SOSRequestData) => {
        console.log("🚨 SOS request received:", sosData);
        setSosRequest(sosData);
        setShowSOSDialog(true);

        toast({
          title: "New Emergency Request",
          description: `SOS alert ${
            sosData.estimatedDistance?.toFixed(1) || "unknown"
          }km away. Click to respond.`,
          variant: "destructive",
        });
      });

      // Get volunteer's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setVolunteerLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.warn("Could not get volunteer location:", error);
          }
        );
      }

      return () => {
        newSocket.close();
      };
    }
  }, [user, toast]);

  const handleAcceptSOS = () => {
    if (!sosRequest) return;

    toast({
      title: "SOS Request Accepted",
      description:
        "You have accepted the emergency request. Route details are being prepared.",
    });

    setShowSOSDialog(false);
  };

  const handleDeclineSOS = () => {
    toast({
      title: "SOS Request Declined",
      description:
        "Request declined. It will be forwarded to other available responders.",
    });
    setShowSOSDialog(false);
    setSosRequest(null);
  };

  const handleViewRoute = () => {
    setShowMapDialog(true);
  };

  const handleAssignAlert = (alertId: number) => {
    if (!selectedVolunteer) return;

    // TODO: Implement actual assignment logic with API call
    console.log(`Assigning alert ${alertId} to volunteer ${selectedVolunteer}`);

    toast({
      title: "Alert Assigned",
      description: `SOS alert has been assigned to the selected volunteer.`,
    });
    setSelectedVolunteer("");
  };

  const renderUserContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SOS Status */}
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <span>Your SOS Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status:</span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Safe
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Check-in:</span>
                <span className="text-sm">2 hours ago</span>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Update Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Preparedness */}
        <Card className="border-l-4 border-l-yellow-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              <span>Emergency Preparedness</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Emergency contacts updated</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Location services enabled</span>
              </li>
              <li className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>Have emergency contacts readily available</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Nearby Shelters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-red-600" />
            <span>Nearby Emergency Shelters</span>
          </CardTitle>
          <CardDescription>Safe locations in your area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium">Mumbai Community Center</h4>
              <p className="text-sm text-gray-600">
                Distance: 2.5 km • Capacity: 500 people
              </p>
              <p className="text-xs text-gray-500">
                Facilities: Medical aid, Food, Water
              </p>
            </div>
            <div className="border rounded-lg p-3">
              <h4 className="font-medium">Bandra Sports Complex</h4>
              <p className="text-sm text-gray-600">
                Distance: 3.2 km • Capacity: 800 people
              </p>
              <p className="text-xs text-gray-500">
                Facilities: Medical aid, Food, Water, Electricity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVolunteerContent = () => (
    <div className="space-y-6">
      {/* Availability Toggle */}
      <Card className="border-l-4 border-l-green-600">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Volunteer Status</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Available for Duty</span>
              <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {isAvailable
              ? "You are currently available for emergency assignments."
              : "You are currently offline and won't receive new assignments."}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Assigned Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>My Assigned Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sosAlerts
                .filter((alert) => alert.assignedTo === user?.id)
                .map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.text}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {alert.coordinates
                            ? `${alert.coordinates.lat.toFixed(
                                4
                              )}, ${alert.coordinates.lng.toFixed(4)}`
                            : alert.location}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {alert.urgency}
                        </Badge>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge
                          variant={
                            alert.status === "ASSIGNED"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {alert.status}
                        </Badge>
                        {alert.status === "ASSIGNED" && (
                          <Button
                            size="sm"
                            onClick={handleViewRoute}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Navigation className="h-3 w-3 mr-1" />
                            View Route
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {sosAlerts.filter((alert) => alert.assignedTo === user?.id)
                .length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No assigned alerts. You'll be notified when new emergencies in
                  your area need response.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time SOS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Real-time SOS Notifications</span>
            </CardTitle>
            <CardDescription>
              You'll receive instant notifications for emergency requests in
              your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {isAvailable
                    ? "Active - Ready to receive SOS alerts"
                    : "Offline - Not receiving alerts"}
                </span>
              </div>
              <p className="text-xs text-green-700 mt-2">
                When an emergency occurs nearby, you'll get an instant
                notification with location details and response options.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminContent = () => {
    const unassignedAlerts = sosAlerts.filter(
      (alert) => alert.status === "NEW"
    );
    const volunteers = users.filter(
      (user) => user.role === "VOLUNTEER" && user.isVerified
    );

    return (
      <div className="space-y-6">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Unassigned SOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {unassignedAlerts.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Volunteers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {volunteers.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {
                  sosAlerts.filter((alert) => alert.status === "IN_PROGRESS")
                    .length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Resolved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {
                  sosAlerts.filter((alert) => alert.status === "RESOLVED")
                    .length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unassigned SOS Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Unassigned SOS Alerts</CardTitle>
            <CardDescription>
              Alerts waiting for volunteer assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.text}</TableCell>
                    <TableCell>{alert.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{alert.urgency}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={selectedVolunteer}
                          onValueChange={setSelectedVolunteer}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select volunteer" />
                          </SelectTrigger>
                          <SelectContent>
                            {volunteers.map((volunteer) => (
                              <SelectItem
                                key={volunteer.id}
                                value={volunteer.id.toString()}
                              >
                                {volunteer.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleAssignAlert(alert.id)}
                          disabled={!selectedVolunteer}
                        >
                          Assign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDepartmentContent = () => <DisasterTeamDashboard />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === "USER"
            ? "Safety Dashboard"
            : user?.role === "VOLUNTEER"
            ? "Volunteer Dashboard"
            : user?.role === "ADMIN"
            ? "Admin Dashboard"
            : user?.role === "DEPARTMENT"
            ? "Department Dashboard"
            : "Insights Dashboard"}
        </h1>
        <p className="text-gray-600">
          {user?.role === "USER"
            ? "Your safety status and emergency resources"
            : user?.role === "VOLUNTEER"
            ? "Manage your volunteer assignments and availability"
            : user?.role === "ADMIN"
            ? "Manage SOS alerts and coordinate emergency response"
            : user?.role === "DEPARTMENT"
            ? "Department operations and resource management"
            : "Role-specific insights and data"}
        </p>
      </div>

      {user?.role === "USER" && renderUserContent()}
      {user?.role === "VOLUNTEER" && renderVolunteerContent()}
      {user?.role === "ADMIN" && renderAdminContent()}
      {user?.role === "DEPARTMENT" && renderDepartmentContent()}

      {/* SOS Request Dialog for Volunteers/Departments */}
      <Dialog open={showSOSDialog} onOpenChange={setShowSOSDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Emergency SOS Request</span>
            </DialogTitle>
            <DialogDescription>
              A new emergency request requires immediate response
            </DialogDescription>
          </DialogHeader>

          {sosRequest && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">
                  Emergency Details
                </h4>
                <p className="text-sm text-red-700 mb-2">{sosRequest.text}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-red-600">
                  <div>Category: {sosRequest.category}</div>
                  <div>Urgency: {sosRequest.urgency}</div>
                  <div>
                    Distance: {sosRequest.volunteerDistance?.toFixed(1)}km
                  </div>
                  <div>
                    Time: {new Date(sosRequest.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Location</h4>
                <div className="text-sm text-blue-700">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Lat: {sosRequest.location.latitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Lng: {sosRequest.location.longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={handleDeclineSOS}>
              Decline
            </Button>
            <Button
              onClick={handleAcceptSOS}
              className="bg-red-600 hover:bg-red-700"
            >
              Accept & Respond
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Route Map Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <span>Route to Emergency Location</span>
            </DialogTitle>
            <DialogDescription>
              Navigation route from your location to the emergency site
            </DialogDescription>
          </DialogHeader>

          <div className="h-[500px] w-full">
            {sosRequest && volunteerLocation && (
              <DisasterMap
                disasters={[]}
                sosAlerts={[
                  {
                    id: sosRequest.sosId?.toString() || "emergency",
                    latitude: sosRequest.location?.latitude || 0,
                    longitude: sosRequest.location?.longitude || 0,
                    timestamp: new Date(sosRequest.createdAt || new Date()),
                    userId: "emergency",
                  },
                ]}
                safeShelters={[]}
                isAdmin={true}
                onRouteGenerated={(route) => {
                  console.log("Route generated for volunteer:", route);
                  toast({
                    title: "Route Ready",
                    description: "Navigation route has been calculated.",
                  });
                }}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMapDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                // Open in external navigation app
                if (sosRequest && sosRequest.location) {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${sosRequest.location.latitude},${sosRequest.location.longitude}&travelmode=driving`;
                  window.open(url, "_blank");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
