# Component Library

This directory contains all reusable UI components for the Beyond the Bus Stop app.

---

## Components Overview

### 1. **AppLogo**
**Path:** `components/AppLogo.tsx`

App logo with icon and optional wordmark.

**Props:**
- `size?: "sm" | "md" | "lg"` — Size of the logo container. Defaults to `"md"`.
- `showWordmark?: boolean` — Show "Beyond the Bus Stop" text below icon. Defaults to `true`.

**Usage:**
```tsx
import { AppLogo } from "@/components";

<AppLogo size="lg" showWordmark />
```

**Appears on:** Splash, Onboarding, Commuter Home, Login, Register screens.

---

### 2. **BackButton**
**Path:** `components/BackButton.tsx`

Back navigation button with chevron icon.

**Props:**
- `label?: string` — Optional text label next to icon.
- `dark?: boolean` — Dark theme variant (white icon). Defaults to `false`.
- Extends `ButtonHTMLAttributes<HTMLButtonElement>`.

**Usage:**
```tsx
import { BackButton } from "@/components";

<BackButton dark onClick={() => navigate(-1)} />
<BackButton label="Back to home" />
```

**Appears on:** OTP Confirmation, Route Details, Search Results.

---

### 3. **BottomNavBar**
**Path:** `components/BottomNavBar.tsx`

Fixed bottom navigation with 4 tabs. Active tab is teal; inactive tabs are grey.

**Props:**
- `items: NavItem[]` — Array of navigation items.

**NavItem interface:**
```ts
{
  label: string;
  path: string;
  icon: React.ReactNode;
}
```

**Usage:**
```tsx
import { BottomNavBar } from "@/components";

const navItems = [
  { label: "Home", path: "/", icon: "🏠" },
  { label: "Routes", path: "/routes", icon: "🗺️" },
  { label: "Saved", path: "/saved", icon: "📌" },
  { label: "Profile", path: "/profile", icon: "👤" }
];

<BottomNavBar items={navItems} />
```

**Appears on:** All post-auth screens (Home, Routes, Saved, Profile).

---

### 4. **NotificationBell**
**Path:** `components/NotificationBell.tsx`

Bell icon button with optional unread indicator dot.

**Props:**
- `hasUnread?: boolean` — Show red notification dot. Defaults to `false`.
- `dark?: boolean` — Dark theme variant. Defaults to `false`.
- Extends `ButtonHTMLAttributes<HTMLButtonElement>`.

**Usage:**
```tsx
import { NotificationBell } from "@/components";

<NotificationBell hasUnread onClick={openNotifications} />
<NotificationBell dark />
```

**Appears on:** Profile, Nearby Essentials pages (top-right).

---

### 5. **PageHeader**
**Path:** `components/PageHeader.tsx`

Top page header with title and optional left/right slots.

**Props:**
- `title: string` — Main heading text.
- `leading?: ReactNode` — Node rendered before title (e.g., back button).
- `trailing?: ReactNode` — Node rendered on right side (e.g., notification bell).

**Usage:**
```tsx
import { PageHeader, BackButton, NotificationBell } from "@/components";

<PageHeader 
  title="Profile"
  leading={<BackButton />}
  trailing={<NotificationBell hasUnread />}
/>
```

**Appears on:** Home, Nearby Essentials, Share Trip, Route Details, Profile, Vendor Dashboard, Search Results.

---

### 6. **PrimaryButton**
**Path:** `components/PrimaryButton.tsx`

Large amber/yellow CTA button. Primary action on almost every screen.

**Props:**
- `children: ReactNode` — Button content.
- `withArrow?: boolean` — Show → arrow suffix. Defaults to `false`.
- `fullWidth?: boolean` — Full-width block button. Defaults to `true`.
- Extends `ButtonHTMLAttributes<HTMLButtonElement>`.

**Usage:**
```tsx
import { PrimaryButton } from "@/components";

<PrimaryButton withArrow onClick={handleNext}>
  Next
</PrimaryButton>

<PrimaryButton fullWidth={false}>Share Now</PrimaryButton>
```

**Appears on:** Every screen with CTAs (Login, Onboarding, Home, Route Details, Share Trip, etc.).

---

### 7. **SecondaryButton**
**Path:** `components/SecondaryButton.tsx`

Outlined white button with grey border. Used for secondary actions and OAuth.

**Props:**
- `children: ReactNode` — Button content.
- `fullWidth?: boolean` — Full-width block button. Defaults to `true`.
- Extends `ButtonHTMLAttributes<HTMLButtonElement>`.

**Usage:**
```tsx
import { SecondaryButton } from "@/components";

<SecondaryButton>
  <img src="/google-icon.svg" alt="" />
  Continue with Google
</SecondaryButton>
```

**Appears on:** Login, Register, Vendor Login screens.

---

### 8. **SectionLabel**
**Path:** `components/SectionLabel.tsx`

Small all-caps section heading with optional right-aligned action link.

**Props:**
- `children: ReactNode` — Label text.
- `action?: ReactNode` — Optional trailing link/button (e.g., "View All").

**Usage:**
```tsx
import { SectionLabel } from "@/components";

<SectionLabel action={<a href="/routes">View All</a>}>
  Quick Routes
</SectionLabel>
```

**Appears on:** Home (Quick Routes, Nearby Essentials, Recent Searches), Routes (Favorite Routes, Recently Viewed), Share Trip (Share With, Vehicle Details).

---

### 9. **StepDots**
**Path:** `components/StepDots.tsx`

Horizontal pagination dots for onboarding/carousel screens. Active dot is amber pill; inactive are grey circles.

**Props:**
- `total: number` — Total number of steps/slides.
- `current: number` — Zero-based index of the active step.

**Usage:**
```tsx
import { StepDots } from "@/components";

<StepDots total={3} current={1} />
```

**Appears on:** Onboarding slides (Step 1 of 3, etc.).

---

### 10. **TextInput**
**Path:** `components/TextInput.tsx`

Labelled text input with optional leading/trailing icon slots and helper text.

**Props:**
- `label: string` — Input label text (required).
- `leadingIcon?: ReactNode` — Icon shown on left inside input.
- `trailingIcon?: ReactNode` — Icon shown on right inside input (e.g., password toggle).
- `helperText?: string` — Helper text or error message below input.
- `error?: boolean` — Show error styling. Defaults to `false`.
- Extends `InputHTMLAttributes<HTMLInputElement>`.
- Forwards `ref` for form libraries like `react-hook-form`.

**Usage:**
```tsx
import { TextInput } from "@/components";

<TextInput 
  label="Email Address"
  type="email"
  placeholder="you@business.com"
  leadingIcon="📧"
/>

<TextInput 
  label="Password"
  type="password"
  error
  helperText="Password must be at least 8 characters"
  trailingIcon={<button>👁️</button>}
/>
```

**Appears on:** Login, Register, Phone Entry, Vendor Login, and most form screens.

---

## Import Patterns

All components are exported from the barrel file `components/index.ts`:

```tsx
import { 
  AppLogo, 
  BackButton, 
  BottomNavBar, 
  NotificationBell,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SectionLabel,
  StepDots,
  TextInput 
} from "@/components";
```

Or import individually:
```tsx
import PrimaryButton from "@/components/PrimaryButton";
```

---

## Design System

**Colors:**
- Primary CTA: `#F5B800` (Amber)
- Dark background: `#1A1A1A` (Used on auth/nav)
- Active nav item: `#00C9A7` (Teal)
- Error: `red-400`/`red-500`

**Typography:**
- Headings: `font-semibold` or `font-bold`
- Section labels: `text-xs font-bold tracking-widest uppercase`

**Rounded corners:**
- Buttons: `rounded-full` (pill shape)
- Cards/inputs: `rounded-lg` or `rounded-xl`

---

## Development

To view all components in action, navigate to `/components-showcase`:

```bash
npm run dev
```

Then visit `http://localhost:5173/components-showcase`
