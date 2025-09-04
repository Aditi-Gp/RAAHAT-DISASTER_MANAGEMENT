import { api, tokenUtils } from "@/services";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/services/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const loginData: LoginRequest = { email, password };
          const response = await api.post<ApiResponse<AuthResponse>>(
            "/auth/login",
            loginData
          );

          if (response.data.success && response.data.data) {
            const { token, user } = response.data.data;

            // Store token
            tokenUtils.setToken(token);

            // Update auth state
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });

            return true;
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error("Login error:", error);
          set({ isLoading: false });
          return false;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true });
        try {
          const response = await api.post<ApiResponse<AuthResponse>>(
            "/auth/register",
            userData
          );

          if (response.data.success && response.data.data) {
            const { token, user } = response.data.data;

            // Store token
            tokenUtils.setToken(token);

            // Update auth state
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });

            return true;
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error("Registration error:", error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        tokenUtils.removeToken();
        set({ user: null, isAuthenticated: false });
      },

      initializeAuth: async () => {
        const token = tokenUtils.getToken();
        if (!token) {
          return;
        }

        try {
          // Verify token and get user profile
          const response = await api.get<ApiResponse<{ user: User }>>(
            "/auth/verify"
          );

          if (response.data.success && response.data.data) {
            set({
              user: response.data.data.user,
              isAuthenticated: true,
            });
          } else {
            // Token is invalid, clear it
            tokenUtils.removeToken();
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          // Token is invalid, clear it
          tokenUtils.removeToken();
          set({ user: null, isAuthenticated: false });
        }
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: "raahat-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
