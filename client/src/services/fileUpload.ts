import { api } from "./apiClient";
import type { ApiResponse } from "./types";

export interface FileUploadResponse {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  format: string;
  resourceType: string;
  createdAt: string;
}

/**
 * File Upload Service
 * Handles uploading files to the backend
 */
export const fileUploadService = {
  /**
   * Upload a government ID file (authenticated)
   */
  uploadGovernmentId: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("governmentId", file);

    const response = await api.post<ApiResponse<FileUploadResponse>>(
      "/upload/government-id",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "File upload failed");
  },

  /**
   * Upload a government ID file for registration (public - no authentication required)
   */
  uploadGovernmentIdPublic: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("governmentId", file);

    const response = await api.post<ApiResponse<FileUploadResponse>>(
      "/upload/government-id-public",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "File upload failed");
  },

  /**
   * Upload any file (general purpose)
   */
  uploadFile: async (
    file: File,
    endpoint = "/upload/file"
  ): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ApiResponse<FileUploadResponse>>(
      endpoint,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "File upload failed");
  },

  /**
   * Validate file before upload
   */
  validateFile: (
    file: File,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
    } = {}
  ): { isValid: boolean; error?: string } => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ],
    } = options;

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${(maxSize / 1024 / 1024).toFixed(
          0
        )}MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type must be one of: ${allowedTypes
          .map((type) => type.split("/")[1])
          .join(", ")}`,
      };
    }

    return { isValid: true };
  },

  /**
   * Convert file to base64 for preview
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Get file extension
   */
  getFileExtension: (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  },

  /**
   * Format file size for display
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },
};

export default fileUploadService;
