import { NavLink } from "react-router-dom";

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface BottomNavBarProps {
  items: NavItem[];
}

/**
 * Fixed bottom navigation bar with 4 tabs.
 * Active tab label turns teal/green; inactive tabs are grey.
 * Appears on: all post-auth screens (Home, Routes, Saved, Profile,
 *             Share, Vendor Dashboard variants).
 */
const BottomNavBar = ({ items }: BottomNavBarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-white/10 flex justify-around items-center h-16 px-2 z-50">
      {items.map(({ label, path, icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors ${
              isActive ? "text-[#00C9A7]" : "text-white/40"
            }`
          }
        >
          <span className="text-xl leading-none">{icon}</span>
          <span className="uppercase tracking-wide">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavBar;
