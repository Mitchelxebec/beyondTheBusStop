import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

interface GuestRouteProps {
  children: ReactNode;
}

/**
 * Blocks authenticated users from seeing auth pages (login, register, etc.).
 * If already logged in, redirect to the correct home for their role.
 */
const GuestRoute = ({ children }: GuestRouteProps) => {
  const { isAuthenticated, session } = useAuth();

  if (isAuthenticated) {
    const home = session?.role === "business" ? "/vendor/home" : "/home";
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
