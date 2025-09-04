import { api, tokenUtils } from "./apiClient";
import type {
  ApiResponse,
  AuthResponse,
  CreateSOSRequest,
  DisasterEvent,
  LoginRequest,
  PaginatedResponse,
  RegisterRequest,
  SOS,
  User,
} from "./types";

/**
 * Authentication Service Examples
 */
export const authExamples = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials
    );

    if (response.data.success && response.data.data) {
      // Store token after successful login
      tokenUtils.setToken(response.data.data.token);
      return response.data.data;
    }

    throw new Error(response.data.message || "Login failed");
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      userData
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Registration failed");
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/auth/profile");

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch profile");
  },

  // Logout
  logout: () => {
    tokenUtils.removeToken();
  },
};

/**
 * SOS Service Examples
 */
export const sosExamples = {
  // Create SOS alert
  createSOS: async (sosData: CreateSOSRequest): Promise<SOS> => {
    const response = await api.post<ApiResponse<SOS>>("/sos", sosData);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to create SOS alert");
  },

  // Get user's SOS alerts
  getUserSOS: async (): Promise<SOS[]> => {
    const response = await api.get<ApiResponse<SOS[]>>("/sos/user");

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch SOS alerts");
  },

  // Get SOS by ID
  getSOSById: async (id: string): Promise<SOS> => {
    const response = await api.get<ApiResponse<SOS>>(`/sos/${id}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch SOS alert");
  },

  // Cancel SOS
  cancelSOS: async (id: string): Promise<SOS> => {
    const response = await api.patch<ApiResponse<SOS>>(`/sos/${id}/cancel`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to cancel SOS alert");
  },
};

/**
 * Disaster Events Service Examples
 */
export const disasterExamples = {
  // Get all disaster events
  getDisasterEvents: async (
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<DisasterEvent>> => {
    const response = await api.get<
      ApiResponse<PaginatedResponse<DisasterEvent>>
    >(`/disasters?page=${page}&limit=${limit}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch disaster events");
  },

  // Get disaster events by location
  getDisasterEventsByLocation: async (
    lat: number,
    lng: number,
    radius = 50
  ): Promise<DisasterEvent[]> => {
    const response = await api.get<ApiResponse<DisasterEvent[]>>(
      `/disasters/location?lat=${lat}&lng=${lng}&radius=${radius}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(
      response.data.message || "Failed to fetch nearby disaster events"
    );
  },

  // Get disaster event by ID
  getDisasterEventById: async (id: string): Promise<DisasterEvent> => {
    const response = await api.get<ApiResponse<DisasterEvent>>(
      `/disasters/${id}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch disaster event");
  },
};

/**
 * Utility function to handle API errors
 */
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }

  if (error && typeof error === "object" && "message" in error) {
    const genericError = error as { message: string };
    return genericError.message;
  }

  return "An unexpected error occurred";
};

/**
 * Example usage in a React component:
 *
 * ```typescript
 * import { authExamples, sosExamples } from '../services/examples';
 *
 * const LoginComponent = () => {
 *   const handleLogin = async (email: string, password: string) => {
 *     try {
 *       const authData = await authExamples.login({ email, password });
 *       console.log('Login successful:', authData);
 *       // Handle successful login (e.g., redirect, update state)
 *     } catch (error) {
 *       console.error('Login failed:', error);
 *       // Handle error (e.g., show error message)
 *     }
 *   };
 *
 *   // ... rest of component
 * };
 * ```
 */
