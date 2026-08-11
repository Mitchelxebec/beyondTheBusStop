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
  items: NavItem[];
}

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
 * Replaces the previous bottom-tab-bar pattern for web use.
 * To restore Figma bottom-tab layout, replace this component with the
 * earlier BottomNavBar implementation.
 */
const BottomNavBar = ({ items }: NavBarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#FDFAF8]/90 backdrop-blur-md border-b border-black/[0.06]"
      aria-label="Site header"
    >
      {/* ── Main bar ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand: logo + name */}
        <NavLink
          to="/home"
          className="flex items-center gap-2.5 flex-shrink-0 group"
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
          className="md:hidden p-2 -mr-2 rounded-lg text-[#444748] hover:text-[#1C1B1B] hover:bg-black/[0.04] transition-colors"
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
          className="md:hidden bg-[#FDFAF8] border-t border-black/[0.04]"
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
                  <span className="w-5 h-5 flex items-center justify-center flex-shrink-0" aria-hidden="true">
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
