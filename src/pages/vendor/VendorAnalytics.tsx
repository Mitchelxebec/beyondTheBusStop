import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavBar, VENDOR_NAV_ITEMS } from "../../components";
import { useAuth } from "../../contexts/AuthContext";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "3m" | "all";

interface DataPoint {
  label: string;   // x-axis label
  value: number;   // raw count
}

interface AnalyticsSnapshot {
  totalViews: number;
  viewsDelta: number;      // percentage change vs previous period
  avgRating: number;
  reviewCount: number;
  reachByLocation: { name: string; count: number }[];
  ratingBreakdown: { stars: number; count: number }[];
  chartPoints: DataPoint[];
}

// ─── Static data — swap these for API calls when ready ────────────────────────
// TODO: replace with GET /api/business/analytics?period={period}
// Response shape maps 1-to-1 with AnalyticsSnapshot above.

const MOCK_DATA: Record<Period, AnalyticsSnapshot> = {
  "7d": {
    totalViews: 14200,
    viewsDelta: 12.5,
    avgRating: 4.8,
    reviewCount: 128,
    chartPoints: [
      { label: "Mon", value: 1600 },
      { label: "Tue", value: 1900 },
      { label: "Wed", value: 1400 },
      { label: "Thu", value: 2200 },
      { label: "Fri", value: 2800 },
      { label: "Sat", value: 3100 },
      { label: "Sun", value: 1200 },
    ],
    reachByLocation: [
      { name: "Ikeja",       count: 4200 },
      { name: "Yaba",        count: 3100 },
      { name: "Victoria Is.", count: 2400 },
      { name: "Surulere",    count: 1500 },
    ],
    ratingBreakdown: [
      { stars: 5, count: 80 },
      { stars: 4, count: 28 },
      { stars: 3, count: 12 },
      { stars: 2, count: 5 },
      { stars: 1, count: 3 },
    ],
  },
  "30d": {
    totalViews: 48600,
    viewsDelta: 8.2,
    avgRating: 4.7,
    reviewCount: 312,
    chartPoints: [
      { label: "W1", value: 9200 },
      { label: "W2", value: 11400 },
      { label: "W3", value: 13800 },
      { label: "W4", value: 14200 },
    ],
    reachByLocation: [
      { name: "Ikeja",       count: 14100 },
      { name: "Oshodi",      count: 11200 },
      { name: "Yaba",        count: 9500 },
      { name: "Surulere",    count: 5800 },
      { name: "Victoria Is.", count: 8000 },
    ],
    ratingBreakdown: [
      { stars: 5, count: 190 },
      { stars: 4, count: 72 },
      { stars: 3, count: 30 },
      { stars: 2, count: 12 },
      { stars: 1, count: 8 },
    ],
  },
  "3m": {
    totalViews: 134000,
    viewsDelta: 22.1,
    avgRating: 4.6,
    reviewCount: 891,
    chartPoints: [
      { label: "Jun", value: 38000 },
      { label: "Jul", value: 46000 },
      { label: "Aug", value: 50000 },
    ],
    reachByLocation: [
      { name: "Ikeja",       count: 41000 },
      { name: "Oshodi",      count: 32000 },
      { name: "Yaba",        count: 27000 },
      { name: "Surulere",    count: 18000 },
      { name: "Victoria Is.", count: 16000 },
    ],
    ratingBreakdown: [
      { stars: 5, count: 540 },
      { stars: 4, count: 210 },
      { stars: 3, count: 90 },
      { stars: 2, count: 32 },
      { stars: 1, count: 19 },
    ],
  },
  all: {
    totalViews: 298000,
    viewsDelta: 0,
    avgRating: 4.7,
    reviewCount: 2140,
    chartPoints: [
      { label: "Jan", value: 18000 },
      { label: "Feb", value: 22000 },
      { label: "Mar", value: 27000 },
      { label: "Apr", value: 31000 },
      { label: "May", value: 38000 },
      { label: "Jun", value: 43000 },
      { label: "Jul", value: 52000 },
      { label: "Aug", value: 67000 },
    ],
    reachByLocation: [
      { name: "Ikeja",       count: 91000 },
      { name: "Oshodi",      count: 72000 },
      { name: "Yaba",        count: 58000 },
      { name: "Surulere",    count: 41000 },
      { name: "Victoria Is.", count: 36000 },
    ],
    ratingBreakdown: [
      { stars: 5, count: 1280 },
      { stars: 4, count: 520 },
      { stars: 3, count: 220 },
      { stars: 2, count: 80 },
      { stars: 1, count: 40 },
    ],
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
};

// Build a smooth SVG polyline from data points inside a fixed viewBox
const buildPolyline = (points: DataPoint[], w = 300, h = 90): string => {
  const values = points.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 8;
  return points
    .map((p, i) => {
      const x = pad + (i / (points.length - 1)) * (w - pad * 2);
      const y = h - pad - ((p.value - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#F8BA2A" : "none"} stroke="#F8BA2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Sparkline chart — pure SVG, no library needed
const LineChart = ({ points }: { points: DataPoint[] }) => {
  const W = 300;
  const H = 88;
  const polyline = buildPolyline(points, W, H);
  const values   = points.map(p => p.value);
  const min      = Math.min(...values);
  const max      = Math.max(...values);
  const range    = max - min || 1;
  const pad      = 8;

  // Area fill path (close below the line)
  const lineCoords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (W - pad * 2);
    const y = H - pad - ((p.value - min) / range) * (H - pad * 2);
    return { x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) };
  });
  const areaPath = `M ${lineCoords.map(c => `${c.x},${c.y}`).join(" L ")} L ${lineCoords[lineCoords.length - 1].x},${H} L ${lineCoords[0].x},${H} Z`;

  return (
    <div className="w-full" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#00C9A7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00C9A7" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#00C9A7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data dots */}
        {lineCoords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3" fill="#00C9A7" stroke="#02241F" strokeWidth="1.5" />
        ))}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between px-1 mt-1">
        {points.map(p => (
          <span key={p.label} className="text-[9px] text-[#79F7E3]/60 font-medium">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// Horizontal bar row for reach / ratings
const BarRow = ({
  label,
  value,
  maxValue,
  color = "#F8BA2A",
  suffix = "",
}: {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
  suffix?: string;
}) => {
  const pct = Math.round((value / maxValue) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#747878] w-20 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2 bg-[#DCDAD5] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold text-[#1C1B1B] w-10 text-right shrink-0">
        {fmt(value)}{suffix}
      </span>
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

const PERIODS: { key: Period; label: string }[] = [
  { key: "7d",  label: "7 Days"   },
  { key: "30d", label: "30 Days"  },
  { key: "3m",  label: "3 Months" },
  { key: "all", label: "All"      },
];

const VendorAnalytics = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [period, setPeriod] = useState<Period>("7d");
  const [reachFilter, setReachFilter] = useState<"location" | "vehicle">("location");

  const snap = MOCK_DATA[period];
  const businessName =
    session?.user?.businessName ||
    session?.user?.fullName ||
    "Your Business";

  const maxReach = Math.max(...snap.reachByLocation.map(r => r.count));
  const maxRating = Math.max(...snap.ratingBreakdown.map(r => r.count));

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      <BottomNavBar items={VENDOR_NAV_ITEMS} />

      <main
        className="flex-1 w-full mx-auto pt-16"
        style={{ maxWidth: "min(100%, 36rem)" }}
        aria-label="Analytics dashboard"
      >
        <div className="flex flex-col gap-5 px-4 sm:px-6 pt-4 pb-16">

          {/* Header */}
          <div className="flex items-center gap-3 py-1">
            <button
              onClick={() => navigate("/vendor/home")}
              className="p-1.5 -ml-1.5 rounded-lg text-[#1C1B1B] hover:bg-black/5 active:scale-95 transition-all"
              aria-label="Back to Business Portal"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-[#1C1B1B] m-0">Analytics</h1>
              <p className="text-xs text-[#747878] m-0 truncate">{businessName}</p>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1 bg-[#EBEAE6] p-1 rounded-xl">
            {PERIODS.map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={`
                  flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150
                  ${period === p.key
                    ? "bg-[#F8BA2A] text-[#1C1B1B] shadow-sm"
                    : "text-[#747878] hover:text-[#1C1B1B]"
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Views */}
            <div className="bg-[#00C9A7] rounded-2xl p-4 flex flex-col justify-between min-h-27">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#005047]">
                Total Views
              </span>
              <div>
                <div className="text-3xl font-black text-white tracking-tight leading-none">
                  {fmt(snap.totalViews)}
                </div>
                {snap.viewsDelta !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUpIcon />
                    <span className="text-xs font-semibold text-white/90">
                      +{snap.viewsDelta}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Avg Rating */}
            <div className="bg-[#00C9A7] rounded-2xl p-4 flex flex-col justify-between min-h-27">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#005047]">
                Avg Rating
              </span>
              <div>
                <div className="text-3xl font-black text-white tracking-tight leading-none">
                  {snap.avgRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <StarIcon filled />
                  <span className="text-xs text-white/80">{snap.reviewCount} Reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Listing Views chart — dark card, signature element */}
          <div className="bg-[#02241F] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Listing Views</span>
              <button
                type="button"
                className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors"
                aria-label="Chart options"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="5"  r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </div>
            <LineChart points={snap.chartPoints} />
          </div>

          {/* Commuter Reach */}
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 border border-black/5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#1C1B1B]">Commuter Reach</span>
              <button
                type="button"
                onClick={() => setReachFilter(reachFilter === "location" ? "vehicle" : "location")}
                className="text-xs font-semibold text-[#F8BA2A] hover:underline transition-colors"
              >
                By {reachFilter === "location" ? "Location" : "Vehicle"} ▾
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {snap.reachByLocation.map(r => (
                <BarRow
                  key={r.name}
                  label={r.name}
                  value={r.count}
                  maxValue={maxReach}
                  color="#F8BA2A"
                />
              ))}
            </div>
          </div>

          {/* Rating Breakdown — dark card to balance the chart */}
          <div className="bg-[#005047] rounded-2xl p-4 flex flex-col gap-4">
            <span className="text-sm font-bold text-white">Rating Breakdown</span>
            <div className="flex items-start gap-5">
              {/* Score */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-4xl font-black text-white leading-none">
                  {snap.avgRating.toFixed(1)}
                </span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <StarIcon key={s} filled={s <= Math.round(snap.avgRating)} />
                  ))}
                </div>
                <span className="text-[10px] text-[#79F7E3]/70 mt-0.5">
                  {snap.reviewCount} Total
                </span>
              </div>

              {/* Bars */}
              <div className="flex-1 flex flex-col gap-2">
                {[5,4,3,2,1].map(star => {
                  const row = snap.ratingBreakdown.find(r => r.stars === star);
                  return (
                    <BarRow
                      key={star}
                      label={`${star}`}
                      value={row?.count ?? 0}
                      maxValue={maxRating}
                      color="#F8BA2A"
                    />
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default VendorAnalytics;
