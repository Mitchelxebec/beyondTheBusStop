import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import PageLoader from "./components/PageLoader";

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

// Wrap a lazy element in Suspense with the spinner fallback
const s = (el: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
);

export const router = createBrowserRouter([
  // ── Launch ──────────────────────────────────────────────────────────────
  { path: "/",                        element: s(<Splash />) },

  // ── Onboarding ──────────────────────────────────────────────────────────
  { path: "/onboarding",              element: <Navigate to="/onboarding/1" replace /> },
  { path: "/onboarding/1",            element: s(<Onboarding1 />) },
  { path: "/onboarding/2",            element: s(<Onboarding2 />) },
  { path: "/onboarding/3",            element: s(<Onboarding3 />) },

  // ── Auth ────────────────────────────────────────────────────────────────
  { path: "/auth/role-select",        element: s(<RoleSelect />) },
  { path: "/auth/commuter/login",     element: s(<CommmuterLogin />) },
  { path: "/auth/commuter/register",  element: s(<CommuterRegister />) },
  { path: "/auth/vendor/login",       element: s(<VendorLogin />) },
  { path: "/auth/vendor/register",    element: s(<VendorRegister />) },

  // ── OTP + password recovery ──────────────────────────────────────────────
  { path: "/auth/verify-email",       element: s(<VerifyEmail />) },
  { path: "/auth/forgot-password",    element: s(<ForgotPassword />) },
  { path: "/auth/reset-password",     element: s(<ResetPassword />) },
  { path: "/auth/reset-success",      element: s(<ResetSuccess />) },

  // ── Commuter app ─────────────────────────────────────────────────────────
  { path: "/home",                    element: s(<CommuterHomeDashboard />) },
  { path: "/commuter/home",           element: <Navigate to="/home" replace /> },

  // ── Dev ──────────────────────────────────────────────────────────────────
  { path: "/components-showcase",     element: s(<ComponentShowcase />) },

  // ── Catch-all ────────────────────────────────────────────────────────────
  { path: "*",                        element: s(<NotFound />) },
]);
