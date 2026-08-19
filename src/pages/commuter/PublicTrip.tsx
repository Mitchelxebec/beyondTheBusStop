import { useParams } from "react-router-dom";
import { usePublicTrip } from "../../hooks/useTrips";
import type { PublicTrip as PublicTripType } from "../../types/trips";

// ─── Icons ─────────────────────────────────────────────────────────────────────

const BusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 6h8M3 6h18M3 10h18M5 18H3v-8h18v8h-2M9 18h6" />
    <circle cx="7.5" cy="18.5" r="1.5" />
    <circle cx="16.5" cy="18.5" r="1.5" />
  </svg>
);

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const FareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V6l-8-4z" />
  </svg>
);

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  planned:   { bg: "bg-[#FFF8E6]",  text: "text-[#8A6200]", dot: "bg-[#FFC72C]",       label: "Trip Planned" },
  active:    { bg: "bg-[#E6FAF6]",  text: "text-[#005047]", dot: "bg-[#00C9A7] animate-pulse", label: "Live — Tracking Active" },
  completed: { bg: "bg-[#F4F1EE]",  text: "text-[#444748]", dot: "bg-neutral-400",      label: "Trip Completed" },
  cancelled: { bg: "bg-[#FCE8E6]",  text: "text-[#BA1A1A]", dot: "bg-[#BA1A1A]",        label: "Trip Cancelled" },
};

// ─── Detail row ───────────────────────────────────────────────────────────────

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <span className="w-8 h-8 rounded-lg bg-[#F4F1EE] flex items-center justify-center shrink-0 text-[#444748]">
      {icon}
    </span>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#747878]">{label}</span>
      <span className="text-sm font-semibold text-[#1C1B1B]">{value}</span>
    </div>
  </div>
);

// ─── Trip card ────────────────────────────────────────────────────────────────

const TripCard = ({ trip }: { trip: PublicTripType }) => {
  const status = STATUS_STYLES[trip.status] ?? STATUS_STYLES.planned;

  return (
    <div className="flex flex-col gap-5">

      {/* Hero route card */}
      <div className="bg-[#00C9A7] rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#005047]">
              Shared Trip
            </span>
            <div className="flex items-center gap-2 text-white font-bold text-xl flex-wrap">
              <span>{trip.origin.name}</span>
              <span className="text-white/50">→</span>
              <span>{trip.destination.name}</span>
            </div>
          </div>

          {/* Status badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${status.bg} ${status.text}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            {status.label}
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-2xl p-5 border border-black/5 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-[#1C1B1B] m-0">Journey Details</h2>

        <div className="flex flex-col gap-4">
          <DetailRow
            icon={<BusIcon />}
            label="Transport"
            value={trip.vehicleType.charAt(0).toUpperCase() + trip.vehicleType.slice(1)}
          />
          <DetailRow
            icon={<PinIcon />}
            label="Boarding Point"
            value={trip.boardingPoint.name}
          />
          <DetailRow
            icon={<PinIcon />}
            label="Drop-off Point"
            value={trip.dropOffPoint.name}
          />
          <DetailRow
            icon={<FareIcon />}
            label="Expected Fare"
            value={`₦${trip.fareLow.toLocaleString()} – ₦${trip.fareHigh.toLocaleString()}`}
          />
          {trip.confidenceScore !== undefined && (
            <DetailRow
              icon={<ShieldIcon />}
              label="Route Confidence"
              value={`${trip.confidenceScore}% — ${trip.confidenceLevel}`}
            />
          )}
        </div>
      </div>

      {/* Active location card */}
      {trip.status === "active" && trip.currentLocation && (
        <div className="bg-[#005047] rounded-2xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C9A7] animate-pulse" />
            <span className="text-xs font-bold text-[#79F7E3] uppercase tracking-wider">
              Live Location
            </span>
          </div>
          <p className="text-sm text-white/90 m-0">
            Last updated:{" "}
            <span className="font-semibold text-white">
              {new Date(trip.currentLocation.updatedAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </p>
          <p className="text-xs text-white/60 font-mono m-0">
            {trip.currentLocation.latitude.toFixed(5)},{" "}
            {trip.currentLocation.longitude.toFixed(5)}
          </p>
        </div>
      )}

      {/* Completed notice */}
      {trip.status === "completed" && (
        <div className="bg-[#F4F1EE] rounded-2xl p-4 text-center">
          <p className="text-sm text-[#444748] m-0">
            This trip has been completed. The commuter has arrived safely. 🎉
          </p>
        </div>
      )}

      {/* Footer branding */}
      <div className="text-center pt-2">
        <p className="text-xs text-[#747878]">
          Shared via <span className="font-bold text-[#005047]">Beyond The Bus Stop</span>
        </p>
      </div>
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────────

const PublicTrip = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data: trip, isLoading, isError, error } = usePublicTrip(shareToken);

  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">

      {/* Minimal header — no nav (public page, no auth) */}
      <header className="w-full bg-[#005047] px-4 py-4 flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#79F7E3]">
            Beyond The Bus Stop
          </span>
          <span className="text-sm font-bold text-white">Live Trip Tracker</span>
        </div>
      </header>

      <main
        className="flex-1 w-full mx-auto px-4 sm:px-6 py-6"
        style={{ maxWidth: "min(100%, 48rem)" }}
        aria-label="Public trip view"
      >
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-[#005047]/20 border-t-[#005047] rounded-full animate-spin" />
            <p className="text-sm font-semibold text-[#1C1B1B]">Loading trip details…</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#FCE8E6] flex items-center justify-center text-[#BA1A1A] text-2xl font-bold">
              !
            </div>
            <h2 className="text-base font-bold text-[#1C1B1B] m-0">Trip Not Found</h2>
            <p className="text-xs text-[#747878] max-w-xs m-0">
              {error?.message || "This trip link is invalid or has expired."}
            </p>
          </div>
        )}

        {trip && <TripCard trip={trip} />}
      </main>
    </div>
  );
};

export default PublicTrip;
