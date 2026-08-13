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

// ─── Default Commuter Nav Icons ───────────────────────────────────────────────

const HomeNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 18" fill="currentColor" aria-hidden="true">
    <path d="M8 1L15 7V17H10V12H6V17H1V7L8 1Z" />
  </svg>
);

const RoutesNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="3" cy="3" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 5V10C3 12.2 4.8 14 7 14H11C13.2 14 15 12.2 15 10V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const ShareNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 20" fill="none" aria-hidden="true">
    <circle cx="15" cy="3" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="3" cy="10" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="15" cy="17" r="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5 8.8L13 4.2M5 11.2L13 15.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const ProfileNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 19C2 15.1 5.6 12 10 12C14.4 12 18 15.1 18 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home",    path: "/home",    icon: <HomeNavIcon /> },
  { label: "Routes",  path: "/routes",  icon: <RoutesNavIcon /> },
  { label: "Share",   path: "/share",   icon: <ShareNavIcon /> },
  { label: "Profile", path: "/profile", icon: <ProfileNavIcon /> },
];

// ─── Hamburger / Close icon ────────────────────────────────────────────────────

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M3 7H19M3 11H19M3 15H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M5 5L17 17M5 17L17 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

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
          {open ? <CloseIcon /> : <MenuIcon />}
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
