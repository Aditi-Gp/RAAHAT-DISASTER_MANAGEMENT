import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    initializeAuth,
    updateUser,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    initializeAuth,
    updateUser,
    hasRole: (roles: string[]) => user && roles.includes(user.role),
  };
};
