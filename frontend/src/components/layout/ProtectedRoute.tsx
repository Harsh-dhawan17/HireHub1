import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullPage text="Checking authentication status..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
