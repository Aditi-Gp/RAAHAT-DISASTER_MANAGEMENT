// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Authentication related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: "USER" | "VOLUNTEER";
  governmentIdUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// User types (matching backend response)
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "USER" | "VOLUNTEER" | "ADMIN" | "DEPARTMENT" | "SUPER_ADMIN";
  isVerified: boolean;
  createdAt: string;
}

// SOS related types
export interface SOS {
  _id: string;
  user: string | User;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  emergencyType: "medical" | "fire" | "police" | "natural_disaster" | "other";
  description?: string;
  status: "active" | "responded" | "resolved" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  timestamp: string;
  respondedBy?: string | User;
  respondedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSOSRequest {
  location: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  emergencyType: "medical" | "fire" | "police" | "natural_disaster" | "other";
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
}

// Disaster Event types
export interface DisasterEvent {
  _id: string;
  title: string;
  description: string;
  type: "earthquake" | "flood" | "fire" | "storm" | "tsunami" | "other";
  severity: "low" | "medium" | "high" | "critical";
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  address: string;
  affectedArea?: {
    radius: number; // in kilometers
    polygon?: number[][]; // array of [longitude, latitude] pairs
  };
  status: "active" | "monitoring" | "resolved";
  startTime: string;
  endTime?: string;
  warnings?: string[];
  evacuationZones?: string[];
  emergencyContacts?: {
    name: string;
    phone: string;
    role: string;
  }[];
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisasterEventRequest {
  title: string;
  description: string;
  type: "earthquake" | "flood" | "fire" | "storm" | "tsunami" | "other";
  severity: "low" | "medium" | "high" | "critical";
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  affectedArea?: {
    radius: number;
    polygon?: number[][];
  };
  warnings?: string[];
  evacuationZones?: string[];
  emergencyContacts?: {
    name: string;
    phone: string;
    role: string;
  }[];
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error types
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: string[];
}

export interface BubbleData {
  id: string;
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high" | "critical";
}
