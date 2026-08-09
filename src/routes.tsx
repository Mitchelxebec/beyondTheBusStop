import { createBrowserRouter } from "react-router-dom";

import Splash            from "./pages/auth/Splash";
import Onboarding        from "./pages/auth/Onboarding";
import RoleSelect        from "./pages/auth/RoleSelect";
import CommmuterLogin    from "./pages/auth/CommmuterLogin";
import CommuterRegister  from "./pages/auth/CommuterRegister";
import VendorLogin       from "./pages/auth/VendorLogin";
import VendorRegister    from "./pages/auth/VendorRegister";
import ComponentShowcase from "./pages/ComponentShowcase";

export const router = createBrowserRouter([
  { path: "/",                       element: <Splash /> },
  { path: "/onboarding",             element: <Onboarding /> },
  { path: "/auth/role-select",       element: <RoleSelect /> },
  { path: "/auth/commuter/login",    element: <CommmuterLogin /> },
  { path: "/auth/commuter/register", element: <CommuterRegister /> },
  { path: "/auth/vendor/login",      element: <VendorLogin /> },
  { path: "/auth/vendor/register",   element: <VendorRegister /> },
  { path: "/components-showcase",    element: <ComponentShowcase /> },
]);
