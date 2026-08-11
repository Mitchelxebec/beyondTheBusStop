import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PageLoader from "./components/PageLoader";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

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
const CommuterHomeDashboard = lazy(() => import("./pages/CommuterHomeDashboard"));
const NotFound              = lazy(() => import("./pages/NotFound"));
const ComponentShowcase     = lazy(() => import("./pages/ComponentShowcase"));

// Wrap in Suspense spinner
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
  { path: "/auth/reset-password",     element: guest(<ResetPassword />) },
  { path: "/auth/reset-success",      element: guest(<ResetSuccess />) },

  // ── Protected: commuter only ───────────────────────────────────────────────
  { path: "/home",                    element: auth(<CommuterHomeDashboard />, "commuter") },
  { path: "/commuter/home",           element: <Navigate to="/home" replace /> },

  // ── Dev (unguarded) ───────────────────────────────────────────────────────
  { path: "/components-showcase",     element: s(<ComponentShowcase />) },

  // ── Catch-all ─────────────────────────────────────────────────────────────
  { path: "*",                        element: s(<NotFound />) },
]);
