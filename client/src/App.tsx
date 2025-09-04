import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";

import { DisasterMapPage } from "@/pages/DisasterMapPage";
import { HomePage } from "@/pages/HomePage";
import { InsightsPage } from "@/pages/InsightsPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SuperAdminPanel } from "@/pages/SuperAdminPanel";

import "./App.css";

function App() {
  const { initializeAuth } = useAuth();

  // Initialize authentication on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        {/* Public Routes with Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/about"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl">About Page Coming Soon</h1>
              </div>
            }
          />
        </Route>

        {/* Protected Routes with Dashboard Layout */}
        <Route
          element={
            <ProtectedRoute
              roles={[
                "USER",
                "VOLUNTEER",
                "ADMIN",
                "DEPARTMENT",
                "SUPER_ADMIN",
              ]}
            />
          }
        >
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DisasterMapPage />} />
            <Route path="/dashboard/insights" element={<InsightsPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Super Admin Only Routes */}
        <Route element={<ProtectedRoute roles={["SUPER_ADMIN"]} />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard/manage-admins"
              element={<SuperAdminPanel />}
            />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </Router>
  );
}

export default App;
