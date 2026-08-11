import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * If provided, the user must ALSO have this role.
   * A commuter trying to hit /vendor/home gets bounced to /home.
   * A business user trying to hit /home gets bounced to /vendor/home.
   */
  role?: UserRole;
}

/**
 * Frontend route guard — the "velvet rope".
 *
 * Unauthenticated user  → redirect to /auth/role-select (preserves intended path)
 * Wrong role            → redirect to their correct home
 * Correct auth + role   → render children
 *
 * NOTE: This is UX-only. The backend still validates the JWT on every API call.
 */
const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { session, isAuthenticated } = useAuth();
  const location = useLocation();

  // Not logged in → send to role select, remember where they were trying to go
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/role-select"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Logged in but wrong role → bounce to their correct home
  if (role && session?.role !== role) {
    const correctHome = session?.role === "business" ? "/vendor/home" : "/home";
    return <Navigate to={correctHome} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
