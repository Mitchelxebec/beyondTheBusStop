/**
 * Nav item definitions — kept separate from BottomNavBar.tsx so that file
 * only exports a single React component, satisfying Vite Fast Refresh rules.
 *
 * Icons are stored as component references (not pre-evaluated JSX) to avoid
 * the "Objects are not valid as React child" crash from lucide-react.
 */
import { Home, Waypoints, Bookmark, Sparkles, User } from "lucide-react";
import type { NavItem } from "./BottomNavBar";

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home",    path: "/home",         Icon: () => <Home      className="w-4 h-4" /> },
  { label: "Routes",  path: "/routes",        Icon: () => <Waypoints className="w-4 h-4" /> },
  { label: "Saved",   path: "/saved-routes",  Icon: () => <Bookmark  className="w-4 h-4" /> },
  { label: "Profile", path: "/profile",       Icon: () => <User      className="w-4 h-4" /> },
];

export const VENDOR_NAV_ITEMS: NavItem[] = [
  { label: "Home",    path: "/vendor/home",    Icon: () => <Home      className="w-4 h-4" /> },
  { label: "Routes",  path: "/routes",         Icon: () => <Waypoints className="w-4 h-4" /> },
  { label: "Upgrade", path: "/vendor/upgrade", Icon: () => <Sparkles  className="w-4 h-4" /> },
  { label: "Profile", path: "/vendor/profile", Icon: () => <User      className="w-4 h-4" /> },
];
