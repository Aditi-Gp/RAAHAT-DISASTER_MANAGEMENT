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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { fileUploadService } from "@/services";
import { FileText, Image, Shield, Upload, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [activeRole, setActiveRole] = useState<"USER" | "VOLUNTEER">("USER");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file using the upload service
      const validation = fileUploadService.validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "application/pdf",
        ],
      });

      if (!validation.isValid) {
        toast({
          title: "Invalid File",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        fileUploadService
          .fileToBase64(file)
          .then((base64) => setFilePreview(base64))
          .catch(() => setFilePreview(null));
      } else {
        setFilePreview(null);
      }

      toast({
        title: "File Selected",
        description: `${file.name} (${fileUploadService.formatFileSize(
          file.size
        )}) has been selected for upload.`,
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    // Reset the file input
    const fileInput = document.getElementById(
      "governmentId"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate file upload for volunteers
    if (activeRole === "VOLUNTEER" && !selectedFile) {
      toast({
        title: "Government ID Required",
        description:
          "Please upload your government ID document to register as a volunteer.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let governmentIdUrl = undefined;

      // Upload file if selected (for volunteers)
      if (selectedFile && activeRole === "VOLUNTEER") {
        toast({
          title: "Uploading Document",
          description: "Uploading your government ID...",
        });

        try {
          const uploadResult = await fileUploadService.uploadGovernmentIdPublic(
            selectedFile
          );
          governmentIdUrl = uploadResult.url;

          toast({
            title: "Document Uploaded",
            description: "Government ID uploaded successfully.",
          });
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          toast({
            title: "Upload Failed",
            description: "Failed to upload government ID. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Register user with optional government ID URL
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: activeRole,
        ...(governmentIdUrl && { governmentIdUrl }),
      };

      const success = await register(registrationData);

      if (success) {
        toast({
          title: "Registration Successful",
          description:
            activeRole === "VOLUNTEER"
              ? "Welcome to Raahat! Your volunteer application is under review."
              : "Welcome to Raahat! You have been successfully registered.",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Registration Failed",
          description: "Failed to register. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Error",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">Raahat</span>
          </div>
          <CardTitle className="text-2xl">
            Join the Emergency Response Network
          </CardTitle>
          <CardDescription>
            Choose your role and help us build a safer community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeRole.toLowerCase()}
            onValueChange={(value) =>
              setActiveRole(value.toUpperCase() as "USER" | "VOLUNTEER")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register as User"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="volunteer">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="governmentId">Government ID Document *</Label>

                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, PDF up to 5MB
                        </p>
                      </div>
                      <Input
                        id="governmentId"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                      <Label
                        htmlFor="governmentId"
                        className="mt-2 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 cursor-pointer transition-colors"
                      >
                        Choose File
                      </Label>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {filePreview ? (
                              <Image className="h-12 w-12 text-green-500" />
                            ) : (
                              <FileText className="h-12 w-12 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={removeFile}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                      {filePreview && (
                        <div className="mt-3">
                          <img
                            src={filePreview}
                            alt="Government ID Preview"
                            className="max-w-full h-auto max-h-48 rounded border mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-600">
                    Upload your Aadhaar card, PAN card, or other government ID
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Apply as Volunteer"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
