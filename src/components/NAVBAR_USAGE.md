# Navigation Bar (`BottomNavBar`) Developer Guide

## Overview

The `BottomNavBar` component is the standard top/mobile navigation header for the **Beyond the Bus Stop** web application.

### Key Features
- **Zero Boilerplate for Commuter Views**: Call `<BottomNavBar />` without passing any props on standard commuter pages.
- **Responsive Layout**:
  - **Desktop (`md+`)**: Displays brand logo + title on the left, top navigation links (`Home`, `Routes`, `Share`, `Profile`) on the right.
  - **Tablet (`sm`)**: Compact logo layout with text navigation links.
  - **Mobile (`<md`)**: Clean header bar with mobile hamburger menu drawer containing navigation icons.
- **Customizable (`items` prop)**: Pass a custom `NavItem[]` array when rendering specialized views (e.g. Vendor/Business portal navigation).

---

## Usage Examples

### 1. Standard Commuter Page Usage (Default)

On any commuter page (e.g. `CommuterHomeDashboard.tsx`, `SearchResults.tsx`, `Profile.tsx`), simply import and render `<BottomNavBar />`:

```tsx
import { BottomNavBar } from "@/components";

const CommuterPage = () => {
  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      {/* Renders default Home, Routes, Share, Profile navigation */}
      <BottomNavBar />

      <main className="pt-16">
        {/* Page content */}
      </main>
    </div>
  );
};

export default CommuterPage;
```

---

### 2. Custom Navigation (Vendor / Admin Views)

If building a specialized dashboard (e.g., Vendor Portal or Admin View) that requires different links, pass custom items to the `items` prop:

```tsx
import { BottomNavBar } from "@/components";
import type { NavItem } from "@/components/BottomNavBar";

const VENDOR_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/vendor/home" },
  { label: "Manage Routes", path: "/vendor/routes" },
  { label: "Settings", path: "/vendor/settings" },
];

const VendorPage = () => {
  return (
    <div>
      <BottomNavBar items={VENDOR_NAV_ITEMS} />
      <main className="pt-16">
        {/* Vendor Content */}
      </main>
    </div>
  );
};
```

---

## Exported Defaults & Interfaces

From `src/components/BottomNavBar.tsx`:

```ts
import { DEFAULT_NAV_ITEMS } from "@/components/BottomNavBar";
// DEFAULT_NAV_ITEMS provides: Home (/home), Routes (/routes), Share (/share), Profile (/profile)
```

---

## 🚫 What NOT to Do (Anti-patterns)

- **Do NOT** duplicate `HomeNavIcon`, `RoutesNavIcon`, `ShareNavIcon`, `ProfileNavIcon` SVG definitions inside individual page files.
- **Do NOT** recreate the `NAV_ITEMS` array inside standard commuter page components.
- **Do NOT** re-implement custom top/bottom header bars for commuter screens. Always use `<BottomNavBar />`.
