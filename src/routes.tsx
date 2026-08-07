import { createBrowserRouter } from "react-router-dom";

// Auth pages
import Splash             from "./pages/auth/Splash";
import RoleSelect         from "./pages/auth/RoleSelect";
import CommmuterLogin     from "./pages/auth/CommmuterLogin";
import CommuterRegister   from "./pages/auth/CommuterRegister";
import VendorLogin        from "./pages/auth/VendorLogin";
import VendorRegister     from "./pages/auth/VendorRegister";

// Dev
import ComponentShowcase  from "./pages/ComponentShowcase";

export const router = createBrowserRouter([
  // ── Splash ──────────────────────────────────────────────────────
  { path: "/",                      element: <Splash /> },

  // ── Role selection ──────────────────────────────────────────────
  { path: "/auth/role-select",      element: <RoleSelect /> },

  // ── Commuter auth ───────────────────────────────────────────────
  { path: "/auth/commuter/login",   element: <CommmuterLogin /> },
  { path: "/auth/commuter/register",element: <CommuterRegister /> },

  // ── Vendor auth ─────────────────────────────────────────────────
  { path: "/auth/vendor/login",     element: <VendorLogin /> },
  { path: "/auth/vendor/register",  element: <VendorRegister /> },

  // ── OTP verification (shared) ────────────────────────────────────

  // ── Dev only ────────────────────────────────────────────────────
  { path: "/components-showcase",   element: <ComponentShowcase /> },
]);
