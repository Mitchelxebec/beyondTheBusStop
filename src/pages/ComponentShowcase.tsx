import { useState } from "react";
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
  TextInput,
} from "../components";

// ─── Section wrapper ────────────────────────────────────────────────────────
const Section = ({
  title,
  description,
  children,
  dark = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  dark?: boolean;
}) => (
  <section
    className={`rounded-2xl overflow-hidden border ${
      dark ? "border-white/10" : "border-gray-200"
    }`}
  >
    <div className={`px-4 py-3 border-b ${dark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
      <h2 className={`text-sm font-bold ${dark ? "text-white" : "text-gray-900"}`}>{title}</h2>
      <p className={`text-xs mt-0.5 ${dark ? "text-white/50" : "text-gray-500"}`}>{description}</p>
    </div>
    <div className={`p-5 flex flex-col gap-5 ${dark ? "bg-[#1A1A1A]" : "bg-white"}`}>
      {children}
    </div>
  </section>
);

// ─── Row helper ──────────────────────────────────────────────────────────────
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">{label}</span>
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
);

// ─── Showcase page ───────────────────────────────────────────────────────────
const ComponentShowcase = () => {
  const [stepDot, setStepDot] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const navItems = [
    { label: "Home", path: "/", icon: "⊙" },
    { label: "Routes", path: "/routes", icon: "⊟" },
    { label: "Saved", path: "/saved", icon: "⊠" },
    { label: "Profile", path: "/profile", icon: "⊕" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] pb-24">
      {/* Sticky page title */}
      <div className="sticky top-0 z-40 bg-[#F5F5F0]/90 backdrop-blur-sm border-b border-gray-200 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900">Component Showcase</h1>
        <p className="text-xs text-gray-500">Beyond the Bus Stop · UI library</p>
      </div>

      <div className="flex flex-col gap-6 px-4 pt-6">

        {/* ── AppLogo ── */}
        <Section
          title="AppLogo"
          description="Rounded icon card + optional wordmark. Used on Splash, Onboarding, Login screens."
        >
          <Row label="sm — no wordmark">
            <AppLogo size="sm" showWordmark={false} />
          </Row>
          <Row label="md — with wordmark (default)">
            <AppLogo size="md" />
          </Row>
          <Row label="lg — with wordmark">
            <AppLogo size="lg" />
          </Row>
        </Section>

        {/* ── PrimaryButton ── */}
        <Section
          title="PrimaryButton"
          description="Amber full-width CTA. Used on almost every screen."
        >
          <Row label="default">
            <PrimaryButton>Get Started</PrimaryButton>
          </Row>
          <Row label="with arrow">
            <PrimaryButton withArrow>Next</PrimaryButton>
          </Row>
          <Row label="not full width">
            <PrimaryButton width="auto" withArrow>
              View Details
            </PrimaryButton>
          </Row>
          <Row label="disabled">
            <PrimaryButton disabled>Continue</PrimaryButton>
          </Row>
        </Section>

        {/* ── SecondaryButton ── */}
        <Section
          title="SecondaryButton"
          description="Outlined white button. Used for Google OAuth, alternate actions."
        >
          <Row label="default">
            <SecondaryButton>
              <span className="font-bold text-[#4285F4]">G</span> Continue with Google
            </SecondaryButton>
          </Row>
          <Row label="not full width">
            <SecondaryButton width="auto">Log in</SecondaryButton>
          </Row>
        </Section>

        {/* ── TextInput ── */}
        <Section
          title="TextInput"
          description="Labelled input with leading/trailing icon slots. Used on Login, Register, Phone Entry forms."
        >
          <TextInput
            label="Full Name"
            placeholder="Chidi Eze"
            leadingIcon="👤"
          />
          <TextInput
            label="Email Address"
            type="email"
            placeholder="you@business.com"
            leadingIcon="✉"
          />
          <TextInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            leadingIcon="🔒"
            trailingIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />
          <TextInput
            label="Phone Number"
            type="tel"
            placeholder="801 234 5678"
            leadingIcon={<span className="text-sm font-medium text-gray-600">🇳🇬 +234</span>}
          />
          <TextInput
            label="Business Name"
            placeholder="e.g. Iya Basira Foods"
            error
            helperText="This field is required"
          />
        </Section>

        {/* ── BackButton ── */}
        <Section
          title="BackButton"
          description="Left-chevron back navigation. Used on OTP Confirmation, Route Details, Search Results."
        >
          <Row label="light (default)">
            <BackButton />
          </Row>
          <Row label="light with label">
            <BackButton label="Search Results" />
          </Row>
          <Row label="dark variant">
            <div className="bg-[#1A1A1A] p-4 rounded-xl flex gap-4">
              <BackButton dark />
              <BackButton dark label="Back" />
            </div>
          </Row>
        </Section>

        {/* ── NotificationBell ── */}
        <Section
          title="NotificationBell"
          description="Bell icon button with optional unread dot. Appears top-right on Profile and Nearby Essentials."
        >
          <Row label="no unread">
            <NotificationBell />
          </Row>
          <Row label="with unread dot">
            <NotificationBell hasUnread />
          </Row>
          <Row label="dark variant">
            <div className="bg-[#1A1A1A] p-4 rounded-xl flex gap-4">
              <NotificationBell dark />
              <NotificationBell dark hasUnread />
            </div>
          </Row>
        </Section>

        {/* ── PageHeader ── */}
        <Section
          title="PageHeader"
          description="Top page header with title and leading/trailing slots. Used on most post-auth screens."
        >
          <Row label="title only">
            <div className="w-full border border-gray-100 rounded-xl overflow-hidden">
              <PageHeader title="Home" />
            </div>
          </Row>
          <Row label="with trailing bell">
            <div className="w-full border border-gray-100 rounded-xl overflow-hidden">
              <PageHeader
                title="Profile"
                trailing={<NotificationBell hasUnread />}
              />
            </div>
          </Row>
          <Row label="with back button + trailing">
            <div className="w-full border border-gray-100 rounded-xl overflow-hidden">
              <PageHeader
                title="Route Details"
                leading={<BackButton />}
                trailing={
                  <button className="text-gray-500" aria-label="Save">
                    🔖
                  </button>
                }
              />
            </div>
          </Row>
        </Section>

        {/* ── SectionLabel ── */}
        <Section
          title="SectionLabel"
          description="All-caps section heading with optional right action. Used on Home, Routes, Share Trip."
        >
          <SectionLabel>Quick Routes</SectionLabel>
          <SectionLabel action={<button className="text-xs text-[#00C9A7] font-semibold">View All</button>}>
            Nearby Essentials
          </SectionLabel>
          <SectionLabel action={<button className="text-xs text-[#F5B800] font-bold tracking-wide uppercase">Clear All</button>}>
            Recently Viewed
          </SectionLabel>
        </Section>

        {/* ── StepDots ── */}
        <Section
          title="StepDots"
          description="Onboarding pagination dots. Active dot is amber pill; inactive are grey circles."
        >
          <Row label="step 1 of 3">
            <StepDots total={3} current={0} />
          </Row>
          <Row label="step 2 of 3">
            <StepDots total={3} current={1} />
          </Row>
          <Row label="step 3 of 3">
            <StepDots total={3} current={2} />
          </Row>
          <Row label="interactive (tap to advance)">
            <div className="flex flex-col items-center gap-4 w-full">
              <StepDots total={3} current={stepDot} />
              <div className="flex gap-3">
                <button
                  onClick={() => setStepDot((s) => Math.max(0, s - 1))}
                  className="text-sm px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
                >
                  Prev
                </button>
                <button
                  onClick={() => setStepDot((s) => Math.min(2, s + 1))}
                  className="text-sm px-4 py-2 rounded-lg bg-[#F5B800] text-[#1A1A1A] font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </Row>
        </Section>

        {/* ── BottomNavBar ── */}
        <Section
          title="BottomNavBar"
          description="Fixed 4-tab bottom navigation. Active tab is teal; inactive tabs are grey. Rendered live at the bottom of this page."
          dark
        >
          <p className="text-white/60 text-sm">
            The nav bar below this page is a live instance. It uses the{" "}
            <code className="text-[#F5B800] text-xs bg-white/10 px-1 py-0.5 rounded">
              NavLink
            </code>{" "}
            component from react-router-dom to automatically highlight the active route.
          </p>
          <div className="rounded-xl overflow-hidden border border-white/10">
            <nav className="bg-[#1A1A1A] flex justify-around items-center h-16 px-2">
              {navItems.map(({ label, icon }, i) => (
                <div
                  key={label}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium ${
                    i === 0 ? "text-[#00C9A7]" : "text-white/40"
                  }`}
                >
                  <span className="text-xl leading-none">{icon}</span>
                  <span className="uppercase tracking-wide">{label}</span>
                </div>
              ))}
            </nav>
          </div>
        </Section>

      </div>

      {/* Live BottomNavBar instance */}
      <BottomNavBar items={navItems} />
    </div>
  );
};

export default ComponentShowcase;
