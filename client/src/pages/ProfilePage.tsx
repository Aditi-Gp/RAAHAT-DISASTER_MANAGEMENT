import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/apiClient";
import { Edit, MapPin, Save, User, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: "USER" | "VOLUNTEER" | "ADMIN" | "DEPARTMENT" | "SUPER_ADMIN";
  isVerified: boolean;
  isAvailable: boolean;
  governmentIdUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
  stats?: {
    sosRequests: number;
    assignedSos: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface UserResponse {
  user: ProfileData;
}

export const ProfilePage = () => {
  const { updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    isAvailable: false,
  });

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/user/me");

        if (
          response.data &&
          typeof response.data === "object" &&
          "success" in response.data &&
          response.data.success
        ) {
          const data = response.data as ApiResponse<UserResponse>;
          if (data.data && data.data.user) {
            const userData = data.data.user;
            setProfileData(userData);
            setFormData({
              fullName: userData.fullName || "",
              phone: userData.phone || "",
              isAvailable: userData.isAvailable || false,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          title: "Error Loading Profile",
          description: "Failed to load your profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Only send fields that can be updated according to the API
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        isAvailable: formData.isAvailable,
      };

      const response = await api.put("/user/me", updateData);

      if (
        response.data &&
        typeof response.data === "object" &&
        "success" in response.data &&
        response.data.success
      ) {
        const data = response.data as ApiResponse<UserResponse>;
        if (data.data && data.data.user) {
          // Update the profile data state
          setProfileData((prev) =>
            prev
              ? {
                  ...prev,
                  ...data.data.user,
                }
              : data.data.user
          );

          // Update the auth store if needed
          updateUser?.(data.data.user);

          toast({
            title: "Profile Updated Successfully",
            description: "Your profile information has been saved.",
          });
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || "",
        phone: profileData.phone || "",
        isAvailable: profileData.isAvailable || false,
      });
    }
    setIsEditing(false);
  };

  if (isLoading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Profile data not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {profileData.role.toLowerCase()}
          </Badge>
          {profileData.isVerified && (
            <Badge variant="default" className="bg-green-600">
              Verified
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} size="sm" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled={true} // Email cannot be changed
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              {profileData.role === "VOLUNTEER" && (
                <div>
                  <Label htmlFor="isAvailable">Availability Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      checked={formData.isAvailable}
                      onChange={(e) =>
                        handleInputChange("isAvailable", e.target.checked)
                      }
                      disabled={!isEditing}
                      className="rounded"
                    />
                    <label htmlFor="isAvailable" className="text-sm">
                      Available for emergency assignments
                    </label>
                  </div>
                </div>
              )}

              {profileData.location && (
                <div>
                  <Label>Current Location</Label>
                  <div className="flex items-center space-x-2 mt-2 p-2 bg-gray-50 rounded">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {profileData.location.latitude.toFixed(4)},{" "}
                      {profileData.location.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}

              {profileData.stats && (
                <div>
                  <Label>Profile Statistics</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>SOS Requests Created:</span>
                      <span className="font-medium">
                        {profileData.stats.sosRequests}
                      </span>
                    </div>
                    {profileData.role === "VOLUNTEER" && (
                      <div className="flex justify-between text-sm">
                        <span>SOS Requests Assigned:</span>
                        <span className="font-medium">
                          {profileData.stats.assignedSos}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label>Account Created</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(profileData.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <Label>Last Updated</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(profileData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
