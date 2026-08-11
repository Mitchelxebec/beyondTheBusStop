import { BottomNavBar, SectionLabel } from "../components";
import type { NavItem } from "../components/BottomNavBar";

// ─── Type Definitions ──────────────────────────────────────────────────────────

interface TrafficStatus {
  label: string;
  variant: "heavy" | "clear" | "moderate";
}

interface QuickRoute {
  id: string;
  from: string;
  to: string;
  traffic: TrafficStatus;
  estimatedTime: string;
}

interface NearbyEssential {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface RecentSearch {
  id: string;
  label: string;
}

interface CommuterHomeDashboardProps {
  userName?: string;
  /** Override the auto time-of-day greeting. */
  greeting?: string;
  subtitle?: string;
  quickRoutes?: QuickRoute[];
  nearbyEssentials?: NearbyEssential[];
  recentSearches?: RecentSearch[];
  onSearchFocus?: () => void;
  onRouteNavigate?: (routeId: string) => void;
  onEssentialSelect?: (essentialId: string) => void;
  onViewAllRoutes?: () => void;
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="5.5" stroke="#747878" strokeWidth="1.5" />
    <path d="M12.5 12.5L15.5 15.5" stroke="#747878" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const NavigateTurnIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path
      d="M8 2L13 7L8 12"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 7H13"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowRightSmallIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
    <path
      d="M2 5.5H9M9 5.5L6 2.5M9 5.5L6 8.5"
      stroke="#C4C7C7"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BusIcon = () => (
  <svg width="16" height="19" viewBox="0 0 16 19" fill="none" aria-hidden="true">
    <rect x="1" y="2" width="14" height="13" rx="2" fill="#6F5400" />
    <rect x="3" y="4" width="4" height="3" rx="0.5" fill="#FFC72C" />
    <rect x="9" y="4" width="4" height="3" rx="0.5" fill="#FFC72C" />
    <rect x="1" y="11" width="14" height="2" fill="#6F5400" />
    <circle cx="4" cy="16" r="2" fill="#6F5400" />
    <circle cx="12" cy="16" r="2" fill="#6F5400" />
  </svg>
);

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M2 18h16M10 2L18 7H2L10 2Z" stroke="#444748" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="4" y="8" width="2" height="7" fill="#444748" />
    <rect x="9" y="8" width="2" height="7" fill="#444748" />
    <rect x="14" y="8" width="2" height="7" fill="#444748" />
  </svg>
);

const HospitalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="16" height="16" rx="2" stroke="#444748" strokeWidth="1.3" />
    <path d="M9 5V13M5 9H13" stroke="#444748" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MarketIcon = () => (
  <svg width="20" height="18" viewBox="0 0 20 18" fill="none" aria-hidden="true">
    <path d="M1 6H19L17 16H3L1 6Z" stroke="#444748" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M1 6L4 2H16L19 6" stroke="#444748" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="7" y="9" width="6" height="4" rx="0.5" stroke="#444748" strokeWidth="1" />
  </svg>
);

const FoodIcon = () => (
  <svg width="15" height="20" viewBox="0 0 15 20" fill="none" aria-hidden="true">
    <path d="M1 1V6C1 8.2 2.8 10 5 10V19" stroke="#444748" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M9 1V19M12 1C12 1 14 4 14 7C14 9.2 11 10 9 10" stroke="#444748" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <circle cx="6" cy="6" r="5" stroke="#444748" strokeWidth="1.2" />
    <path d="M6 3.5V6L7.5 7.5" stroke="#444748" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Nav icons (shown in mobile hamburger dropdown)
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

// ─── Traffic Badge ─────────────────────────────────────────────────────────────
// Soft-fill styling per Figma node 178:292 (light bg + coloured text)

const TRAFFIC_CLASSES: Record<TrafficStatus["variant"], string> = {
  heavy:    "bg-[#FCE8E6] text-[#BA1A1A]",
  clear:    "bg-[#79F7E3] text-[#005047]",
  moderate: "bg-[#FFF4D6] text-[#6F5400]",
};

const TrafficBadge = ({ status }: { status: TrafficStatus }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide leading-none ${TRAFFIC_CLASSES[status.variant]}`}
  >
    {status.label}
  </span>
);

// ─── Quick Route Card ──────────────────────────────────────────────────────────

const QuickRouteCard = ({
  route,
  onNavigate,
}: {
  route: QuickRoute;
  onNavigate: (id: string) => void;
}) => (
  <article className="relative flex items-center bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
    {/* 4px teal left accent bar — Figma node 178:280 */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#79F7E3] rounded-l-xl" aria-hidden="true" />

    <div className="flex items-center justify-between w-full pl-5 pr-3 py-3 gap-4">
      <div className="flex flex-col gap-1 min-w-0">
        {/* From → To */}
        <div className="flex items-center gap-1">
          <span className="text-[#1C1B1B] text-base leading-6 font-normal truncate">{route.from}</span>
          <ArrowRightSmallIcon />
          <span className="text-[#1C1B1B] text-base leading-6 font-normal truncate">{route.to}</span>
        </div>
        {/* Badge + ETA */}
        <div className="flex items-center gap-2 flex-wrap">
          <TrafficBadge status={route.traffic} />
          <span className="text-[#444748] text-sm leading-5 font-normal">{route.estimatedTime}</span>
        </div>
      </div>

      <button
        id={`navigate-route-${route.id}`}
        onClick={() => onNavigate(route.id)}
        aria-label={`Navigate from ${route.from} to ${route.to}`}
        className="shrink-0 w-10 h-10 rounded-full bg-[#FFC72C] flex items-center justify-center transition-transform active:scale-95 hover:brightness-95"
      >
        <BusIcon />
      </button>
    </div>
  </article>
);

// ─── Nearby Essential Item ─────────────────────────────────────────────────────

const NearbyEssentialItem = ({
  essential,
  onSelect,
}: {
  essential: NearbyEssential;
  onSelect: (id: string) => void;
}) => (
  <button
    id={`essential-${essential.id}`}
    onClick={() => onSelect(essential.id)}
    aria-label={essential.label}
    className="flex flex-col items-center gap-2 shrink-0 transition-transform active:scale-95 group"
  >
    <div className="w-14 h-14 rounded-2xl bg-[#F1EDEC] flex items-center justify-center group-hover:bg-[#e8e4e3] transition-colors">
      {essential.icon}
    </div>
    <span className="text-[#444748] text-[10px] leading-3.75 font-normal">{essential.label}</span>
  </button>
);

// ─── Recent Search Item ────────────────────────────────────────────────────────

const RecentSearchItem = ({
  search,
  hasBorderBottom = false,
  onSelect,
}: {
  search: RecentSearch;
  hasBorderBottom?: boolean;
  onSelect: (label: string) => void;
}) => (
  <button
    onClick={() => onSelect(search.label)}
    aria-label={`Search again: ${search.label}`}
    className={`flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${
      hasBorderBottom ? "border-b border-neutral-100" : ""
    }`}
  >
    <div className="w-8 h-8 rounded-full bg-[#EBE7E6] flex items-center justify-center shrink-0">
      <ClockIcon />
    </div>
    <span className="text-[#1C1B1B] text-base leading-6 font-normal">{search.label}</span>
  </button>
);

// ─── Default Data ──────────────────────────────────────────────────────────────

const DEFAULT_QUICK_ROUTES: QuickRoute[] = [
  {
    id: "ojota-cms",
    from: "Ojota",
    to: "CMS",
    traffic: { label: "HEAVY TRAFFIC", variant: "heavy" },
    estimatedTime: "Est. 45 mins",
  },
  {
    id: "egbeda-ikeja",
    from: "Egbeda",
    to: "Ikeja",
    traffic: { label: "CLEAR", variant: "clear" },
    estimatedTime: "Est. 20 mins",
  },
];

const DEFAULT_NEARBY_ESSENTIALS: NearbyEssential[] = [
  { id: "bank",     label: "Bank",     icon: <BankIcon /> },
  { id: "hospital", label: "Hospital", icon: <HospitalIcon /> },
  { id: "market",   label: "Market",   icon: <MarketIcon /> },
  { id: "food",     label: "Food",     icon: <FoodIcon /> },
];

const DEFAULT_RECENT_SEARCHES: RecentSearch[] = [
  { id: "1", label: "Yaba → Obalende" },
  { id: "2", label: "Oshodi → Berger" },
];

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home",    path: "/home",    icon: <HomeNavIcon /> },
  { label: "Routes",  path: "/routes",  icon: <RoutesNavIcon /> },
  { label: "Share",   path: "/share",   icon: <ShareNavIcon /> },
  { label: "Profile", path: "/profile", icon: <ProfileNavIcon /> },
];

// ─── Main Component ────────────────────────────────────────────────────────────

/**
 * CommuterHomeDashboard
 *
 * Figma node 178:248 — "Commuter Home Dashboard".
 *
 * Layout tiers:
 *   Mobile  (<md) — single column, full-width, hamburger nav.
 *   Tablet  (md)  — single column centred at max-w-lg, navbar links visible.
 *   Desktop (lg+) — single column centred at max-w-2xl, navbar links visible.
 *
 * Shared components used:
 *   BottomNavBar — now a transparent web navbar (hamburger on mobile).
 *   SectionLabel — variant="page" for 16px Figma-spec headings.
 */
const CommuterHomeDashboard = ({
  userName = "Tunde",
  greeting,
  subtitle = "Lagos is moving fast today. Where to?",
  quickRoutes = DEFAULT_QUICK_ROUTES,
  nearbyEssentials = DEFAULT_NEARBY_ESSENTIALS,
  recentSearches = DEFAULT_RECENT_SEARCHES,
  onSearchFocus,
  onRouteNavigate = () => {},
  onEssentialSelect = () => {},
  onViewAllRoutes,
}: CommuterHomeDashboardProps) => {
  const resolvedGreeting =
    greeting ??
    (() => {
      const h = new Date().getHours();
      if (h < 12) return `Good morning, ${userName}`;
      if (h < 17) return `Good afternoon, ${userName}`;
      return `Good evening, ${userName}`;
    })();

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFAF8]">

      {/* ── Web navbar — fixed top, transparent background ─────────── */}
      <BottomNavBar items={DEFAULT_NAV_ITEMS} />

      {/*
        Main content starts below the fixed h-16 navbar.
        pt-16 clears the navbar; inner gap-6 handles section spacing.
        Responsive container centres content on tablet/desktop.
      */}
      <main
        id="home-main"
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 42rem)" }}
        aria-label="Home dashboard content"
      >
        {/* On lg screens, expand wider and show a two-col hint via padding */}
        <div className="flex flex-col gap-6 px-4 sm:px-6 pt-8 pb-12">

          {/* 1 · Greeting ───────────────────────────────────────────── */}
          <section aria-labelledby="greeting-heading" className="flex flex-col gap-1">
            <h1 id="greeting-heading" className="text-[#1C1B1B] text-base leading-6 font-normal m-0">
              {resolvedGreeting}
            </h1>
            <p className="text-[#444748] text-base leading-6 font-normal m-0">
              {subtitle}
            </p>
          </section>

          {/* 2 · Search Bar ─────────────────────────────────────────── */}
          <section aria-label="Search for a destination">
            <div className="relative flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                id="destination-search"
                type="search"
                placeholder="Where are you going?"
                onFocus={onSearchFocus}
                aria-label="Search for your destination"
                className="w-full h-12 pl-10 pr-14 rounded-lg bg-[#E5E2E1] text-base leading-6 text-[#1C1B1B] placeholder:text-[#C4C7C7] outline-none focus:ring-2 focus:ring-[#79F7E3]/60 transition-shadow"
              />
              <button
                id="search-navigate-btn"
                aria-label="Navigate to destination"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1C1B1B] flex items-center justify-center transition-transform active:scale-95 hover:bg-black"
              >
                <NavigateTurnIcon />
              </button>
            </div>
          </section>

          {/* 3 · Quick Routes ───────────────────────────────────────── */}
          <section aria-labelledby="quick-routes-heading" className="flex flex-col gap-3">
            <SectionLabel
              variant="page"
              action={
                onViewAllRoutes != null ? (
                  <button
                    id="view-all-routes-btn"
                    onClick={onViewAllRoutes}
                    aria-label="View all quick routes"
                    className="text-[#59DBC7] text-sm font-medium hover:underline transition-colors"
                  >
                    View All
                  </button>
                ) : undefined
              }
            >
              Quick Routes
            </SectionLabel>

            <div className="flex flex-col gap-3">
              {quickRoutes.map((route) => (
                <QuickRouteCard key={route.id} route={route} onNavigate={onRouteNavigate} />
              ))}
            </div>
          </section>

          {/* 4 · Nearby Essentials ──────────────────────────────────── */}
          <section aria-labelledby="nearby-essentials-heading" className="flex flex-col gap-3">
            <SectionLabel variant="page">Nearby Essentials</SectionLabel>

            {/* Horizontal scroll on mobile; spaced row on wider screens */}
            <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto no-scrollbar">
              <div className="flex gap-4 sm:gap-6 pb-1">
                {nearbyEssentials.map((essential) => (
                  <NearbyEssentialItem
                    key={essential.id}
                    essential={essential}
                    onSelect={onEssentialSelect}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* 5 · Recent Searches ────────────────────────────────────── */}
          <section aria-labelledby="recent-searches-heading" className="flex flex-col gap-3">
            <SectionLabel variant="page">Recent Searches</SectionLabel>

            <div className="bg-white rounded-xl overflow-hidden shadow-xs">
              {recentSearches.map((search, index) => (
                <RecentSearchItem
                  key={search.id}
                  search={search}
                  hasBorderBottom={index < recentSearches.length - 1}
                  onSelect={() => onSearchFocus?.()}
                />
              ))}
            </div>
          </section>

        </div>
      </main>

    </div>
  );
};

export default CommuterHomeDashboard;
