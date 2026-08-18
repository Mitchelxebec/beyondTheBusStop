import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import AppLogo from "./AppLogo";
import { DEFAULT_NAV_ITEMS } from "./navItems";

// ─── Public interface ──────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  /** Component reference — rendered fresh each time, never a stale JSX object */
  Icon?: () => ReactNode;
}

interface NavBarProps {
  items?: NavItem[];
}

// ─── Shared NavLink class helpers ─────────────────────────────────────────────

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

const BottomNavBar = ({ items = DEFAULT_NAV_ITEMS }: NavBarProps) => {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#FDFAF8]/90 backdrop-blur-md border-b border-black/6"
      aria-label="Site header"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

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

        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {items.map(({ label, path }) => (
            <NavLink key={path} to={path} className={({ isActive }) => desktopLinkClass(isActive)}>
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          id="mobile-menu-toggle"
          className="md:hidden p-2 -mr-2 rounded-lg text-[#444748] hover:text-[#1C1B1B] hover:bg-black/4 transition-colors"
          onClick={() => setOpen(prev => !prev)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="md:hidden bg-[#FDFAF8] border-t border-black/4" role="navigation" aria-label="Mobile navigation">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            {items.map(({ label, path, Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => mobileLinkClass(isActive)}
              >
                {Icon && (
                  <span className="w-5 h-5 flex items-center justify-center shrink-0" aria-hidden="true">
                    <Icon />
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
