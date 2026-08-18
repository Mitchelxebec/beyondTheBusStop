import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import AppLogo from "./AppLogo";

// ─── Public interface ──────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  /** Optional icon shown alongside the label in mobile menu only. */
  icon?: ReactNode;
}

interface NavBarProps {
  items?: NavItem[];
}

import { Home, Waypoints, Bookmark, Sparkles, User, Menu, X } from "lucide-react";

// ─── Default Commuter Nav Items ───────────────────────────────────────────────

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home",    path: "/home",          icon: <Home className="w-4 h-4" /> },
  { label: "Routes",  path: "/routes",         icon: <Waypoints className="w-4 h-4" /> },
  { label: "Saved",   path: "/saved-routes",   icon: <Bookmark className="w-4 h-4" /> },
  { label: "Profile", path: "/profile",         icon: <User className="w-4 h-4" /> },
];

export const VENDOR_NAV_ITEMS: NavItem[] = [
  { label: "Home",    path: "/vendor/home",    icon: <Home className="w-4 h-4" /> },
  { label: "Routes",  path: "/routes",          icon: <Waypoints className="w-4 h-4" /> },
  { label: "Upgrade", path: "/vendor/upgrade",  icon: <Sparkles className="w-4 h-4" /> },
  { label: "Profile", path: "/vendor/profile",  icon: <User className="w-4 h-4" /> },
];

// ─── Shared NavLink class helper ───────────────────────────────────────────────

const desktopLinkClass = (isActive: boolean) =>
  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
    isActive
      ? "text-[#1C1B1B] font-semibold bg-[#79F7E3]/20"
      : "text-[#444748] hover:text-[#1C1B1B] hover:bg-black/[0.04]"
  }`;

const mobileLinkClass = (isActive: boolean) =>
  `flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
    isActive
      ? "text-[#1C1B1B] font-semibold bg-[#79F7E3]/20"
      : "text-[#444748] hover:text-[#1C1B1B] hover:bg-black/[0.04]"
  }`;

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Responsive web-app navigation bar.
 *
 * Desktop (md+)  — Transparent fixed bar: logo + brand name on the left,
 *                   text nav links on the right. No icons.
 * Tablet (sm)    — Same as desktop with brand name hidden.
 * Mobile (<md)   — Logo on the left, hamburger on the right.
 *                   Tapping hamburger reveals a full dropdown with icons.
 *
 * Background is translucent (#FDFAF8 / 90%) with backdrop-blur so it
 * resonates with the page background instead of sitting as a separate bar.
 *
 * Defaults to standard Commuter navigation items (Home, Routes, Share, Profile).
 * Pass custom `items` array if building specialized views (e.g. Vendor navigation).
 */
const BottomNavBar = ({ items = DEFAULT_NAV_ITEMS }: NavBarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#FDFAF8]/90 backdrop-blur-md border-b border-black/6"
      aria-label="Site header"
    >
      {/* ── Main bar ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand: logo + name */}
        <NavLink
          to="/home"
          className="flex items-center gap-2.5 shrink-0 group"
          aria-label="Beyond the Bus Stop — home"
        >
          <AppLogo size="xs" showWordmark={false} />
          <span className="text-[#1C1B1B] text-sm font-semibold tracking-tight hidden sm:block group-hover:text-black transition-colors">
            Beyond the Bus Stop
          </span>
        </NavLink>

        {/* Desktop nav links (md+) */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {items.map(({ label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => desktopLinkClass(isActive)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger toggle (mobile only) */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden p-2 -mr-2 rounded-lg text-[#444748] hover:text-[#1C1B1B] hover:bg-black/4 transition-colors"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="w-5.5 h-5.5 text-[#444748]" /> : <Menu className="w-5.5 h-5.5 text-[#444748]" />}
        </button>
      </div>

      {/* ── Mobile dropdown ─────────────────────────────────────────── */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden bg-[#FDFAF8] border-t border-black/4"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {items.map(({ label, path, icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => mobileLinkClass(isActive)}
              >
                {icon && (
                  <span className="w-5 h-5 flex items-center justify-center shrink-0" aria-hidden="true">
                    {icon}
                  </span>
                )}
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default BottomNavBar;
