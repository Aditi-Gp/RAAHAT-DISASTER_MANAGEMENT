import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Clock, Home, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface Shelter {
  id: string;
  name: string;
  distance: number;
  availableSlots: number;
  totalCapacity: number;
  address: string;
  contactNumber?: string;
  facilities: string[];
}

interface UserSosStatusProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

const UserSosStatus: React.FC<UserSosStatusProps> = ({ userLocation }) => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNearbyShelters = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/shelters/nearby?lat=${userLocation.latitude}&lon=${userLocation.longitude}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch shelter information");
        }

        const data = await response.json();
        setShelters(data.shelters || []);
      } catch (err) {
        console.error("Error fetching shelters:", err);
        setError("Unable to load shelter information. Please try again later.");
        toast({
          title: "Unable to Load Shelters",
          description:
            "There was a problem loading nearby shelter information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userLocation.latitude && userLocation.longitude) {
      fetchNearbyShelters();
    }
  }, [userLocation, toast]);

  const getDistanceText = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const handleGetDirections = (shelter: Shelter) => {
    // Open in user's preferred map application
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      shelter.address
    )}&travelmode=driving`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-blue-600" />
            <span>Finding Nearby Shelters</span>
          </CardTitle>
          <CardDescription>
            Searching for safe shelters in your area...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Shelter Information Unavailable</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Please contact emergency services directly: <strong>112</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Your SOS Alert is Active</span>
          </CardTitle>
          <CardDescription className="text-green-700">
            Emergency services have been notified. Help is on the way. Here are
            nearby safe shelters:
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-blue-600" />
            <span>Nearby Safe Shelters</span>
          </CardTitle>
          <CardDescription>
            {shelters.length} shelter{shelters.length !== 1 ? "s" : ""} found
            within 20km of your location
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shelters.length === 0 ? (
            <div className="text-center py-8">
              <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                No shelters found in your immediate area.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Emergency services are aware of your location and will assist
                you.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {shelters.map((shelter) => (
                <Card key={shelter.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {shelter.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {getDistanceText(shelter.distance)} away
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-medium ${getAvailabilityColor(
                            shelter.availableSlots,
                            shelter.totalCapacity
                          )}`}
                        >
                          <Users className="h-4 w-4 inline mr-1" />
                          {shelter.availableSlots}/{shelter.totalCapacity} slots
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-700">{shelter.address}</p>
                      {shelter.contactNumber && (
                        <p className="text-sm text-gray-600">
                          Contact: {shelter.contactNumber}
                        </p>
                      )}
                      {shelter.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {shelter.facilities.map((facility, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleGetDirections(shelter)}
                        className="flex-1"
                        size="sm"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                      {shelter.contactNumber && (
                        <Button
                          onClick={() =>
                            window.open(`tel:${shelter.contactNumber}`)
                          }
                          variant="outline"
                          size="sm"
                        >
                          Call
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">
                Important Information
              </h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Emergency responders have your exact location</li>
                <li>• Stay in a safe location if possible</li>
                <li>• Keep your phone charged and accessible</li>
                <li>• Call 112 for immediate life-threatening emergencies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSosStatus;
