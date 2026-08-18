import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PageLoader from "./components/PageLoader";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import { useAuth } from "./contexts/AuthContext";

// ── Lazy page imports ─────────────────────────────────────────────────────
const Splash                = lazy(() => import("./pages/auth/Splash"));
const Onboarding1           = lazy(() => import("./pages/auth/Onboarding1"));
const Onboarding2           = lazy(() => import("./pages/auth/Onboarding2"));
const Onboarding3           = lazy(() => import("./pages/auth/Onboarding3"));
const RoleSelect            = lazy(() => import("./pages/auth/RoleSelect"));
const CommmuterLogin        = lazy(() => import("./pages/auth/CommmuterLogin"));
const CommuterRegister      = lazy(() => import("./pages/auth/CommuterRegister"));
const VendorLogin           = lazy(() => import("./pages/auth/VendorLogin"));
const VendorRegister        = lazy(() => import("./pages/auth/VendorRegister"));
const VerifyEmail           = lazy(() => import("./pages/auth/VerifyEmail"));
const ForgotPassword        = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword         = lazy(() => import("./pages/auth/ResetPassword"));
const ResetSuccess          = lazy(() => import("./pages/auth/ResetSuccess"));
const ResetOtp              = lazy(() => import("./pages/auth/ResetOtp"));
const CommuterHomeDashboard = lazy(() => import("./pages/CommuterHomeDashboard"));
const VendorDashboard       = lazy(() => import("./pages/VendorDashboard"));
const VendorRoutes          = lazy(() => import("./pages/vendor/VendorRoutes"));
const VendorAnalytics        = lazy(() => import("./pages/vendor/VendorAnalytics"));
const VendorUpgrade         = lazy(() => import("./pages/vendor/VendorUpgrade"));
const VendorProfile         = lazy(() => import("./pages/vendor/VendorProfile"));
const CreateListing         = lazy(() => import("./pages/vendor/CreateListing"));
const SearchResults         = lazy(() => import("./pages/commuter/SearchResults"));
const CommuterProfile       = lazy(() => import("./pages/commuter/CommuterProfile"));
const SavedRoutes           = lazy(() => import("./pages/commuter/SavedRoutes"));
const RouteDetails          = lazy(() => import("./pages/commuter/RouteDetails"));
const NotFound              = lazy(() => import("./pages/NotFound"));
const ComponentShowcase     = lazy(() => import("./pages/ComponentShowcase"));
const s = (el: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
);

// Guest-only wrapper (kicks logged-in users to their home)
const guest = (el: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>
    <GuestRoute>{el}</GuestRoute>
  </Suspense>
);

// Auth-required wrapper, optional role check
const auth = (el: React.ReactNode, role?: "commuter" | "business") => (
  <Suspense fallback={<PageLoader />}>
    <ProtectedRoute role={role}>{el}</ProtectedRoute>
  </Suspense>
);

// Redirect nav aliases to the user's role-based home dashboard
const RoleHomeRedirect = () => {
  const { session } = useAuth();
  const target = session?.role === "business" ? "/vendor/home" : "/home";
  return <Navigate to={target} replace />;
};

export const router = createBrowserRouter([
  // ── Public (no auth needed) ───────────────────────────────────────────────
  { path: "/",                        element: s(<Splash />) },
  { path: "/onboarding",              element: <Navigate to="/onboarding/1" replace /> },
  { path: "/onboarding/1",            element: s(<Onboarding1 />) },
  { path: "/onboarding/2",            element: s(<Onboarding2 />) },
  { path: "/onboarding/3",            element: s(<Onboarding3 />) },

  // ── Guest-only (logged-in users bounce to their home) ──────────────────────
  { path: "/auth/role-select",        element: guest(<RoleSelect />) },
  { path: "/auth/commuter/login",     element: guest(<CommmuterLogin />) },
  { path: "/auth/commuter/register",  element: guest(<CommuterRegister />) },
  { path: "/auth/vendor/login",       element: guest(<VendorLogin />) },
  { path: "/auth/vendor/register",    element: guest(<VendorRegister />) },
  { path: "/auth/verify-email",       element: guest(<VerifyEmail />) },
  { path: "/auth/forgot-password",    element: guest(<ForgotPassword />) },
  { path: "/auth/reset-otp",          element: guest(<ResetOtp />) },
  { path: "/auth/reset-password",     element: guest(<ResetPassword />) },
  { path: "/auth/reset-success",      element: guest(<ResetSuccess />) },

  // ── Protected: commuter only ───────────────────────────────────────────────
  { path: "/home",                    element: auth(<CommuterHomeDashboard />, "commuter") },
  { path: "/commuter/home",           element: <Navigate to="/home" replace /> },

  // ── Protected: business / vendor only ──────────────────────────────────────
  { path: "/vendor/home",             element: auth(<VendorDashboard />, "business") },
  { path: "/vendor/dashboard",        element: <Navigate to="/vendor/home" replace /> },
  { path: "/vendor/upgrade",          element: auth(<VendorUpgrade />, "business") },
  { path: "/vendor/analytics",        element: auth(<VendorAnalytics />, "business") },
  { path: "/vendor/profile",          element: auth(<VendorProfile />, "business") },
  { path: "/vendor/create-listing",   element: auth(<CreateListing />, "business") },

  // ── Shared: both commuter and business roles ───────────────────────────────
  { path: "/routes",                  element: auth(<VendorRoutes />) },
  { path: "/vendor/routes",           element: auth(<VendorRoutes />) },
  { path: "/search",                  element: auth(<SearchResults />) },
  { path: "/routes/search",           element: auth(<SearchResults />) },
  { path: "/routes/saved",            element: auth(<SavedRoutes />, "commuter") },
  { path: "/saved-routes",            element: auth(<SavedRoutes />, "commuter") },
  { path: "/routes/:id",              element: auth(<RouteDetails />) },
  { path: "/share",                   element: auth(<RoleHomeRedirect />) },
  { path: "/profile",                 element: auth(<CommuterProfile />, "commuter") },

  // ── Dev (unguarded) ───────────────────────────────────────────────────────
  { path: "/components-showcase",     element: s(<ComponentShowcase />) },
  { path: "/dev/vendor",              element: s(<VendorDashboard />) },
  { path: "/dev/vendor-routes",       element: s(<VendorRoutes />) },
  { path: "/dev/vendor-upgrade",       element: s(<VendorUpgrade />) },
  { path: "/dev/vendor-analytics",     element: s(<VendorAnalytics />) },
  { path: "/dev/profile",             element: s(<CommuterProfile />) },
  { path: "/dev/saved-routes",        element: s(<SavedRoutes />) },
  { path: "/dev/routes/:id",          element: s(<RouteDetails />) },
  { path: "/dev/create-listing",      element: s(<CreateListing />) },

  // ── Catch-all ─────────────────────────────────────────────────────────────
  { path: "*",                        element: s(<NotFound />) },
]);
