import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AppLogo, PrimaryButton, SectionLabel } from "../../components";
import { Toast } from "../../components";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TrustedContact {
  id: string;
  name: string;
  relation: string;
  initials: string;
  color: string;
  selected: boolean;
}

// ─── Static trusted contacts — swap for GET /api/user/trusted-contacts ────────
const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: "1",
    name: "Blessing",
    relation: "Sister • Trusted Contact",
    initials: "B",
    color: "#F8BA2A",
    selected: true,
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const FareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const BusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 6h8M3 6h18M3 10h18M5 18H3v-8h18v8h-2M9 18h6" />
    <circle cx="7.5" cy="18.5" r="1.5" />
    <circle cx="16.5" cy="18.5" r="1.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V6l-8-4z" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const AddContactIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="16" y1="11" x2="22" y2="11" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Page ──────────────────────────────────────────────────────────────────────

const ShareTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  // Accept route details passed via location.state from RouteDetails page
  // TODO: connect to real route when wiring from RouteDetails CTA
  const stateRoute = (location.state as {
    origin?: string;
    destination?: string;
    fare?: string;
  } | null);

  const origin      = stateRoute?.origin      ?? "Egbeda";
  const destination = stateRoute?.destination ?? "Ikeja";
  const fare        = stateRoute?.fare        ?? "₦400";

  const now = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const [contacts, setContacts] = useState<TrustedContact[]>(DEFAULT_CONTACTS);
  const [vehicleDetail, setVehicleDetail] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const vehicleRef = useRef<HTMLInputElement>(null);

  const toggleContact = (id: string) => {
    setContacts(prev =>
      prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c)
    );
  };

  const selectedCount = contacts.filter(c => c.selected).length;

  const handleShare = () => {
    if (selectedCount === 0) {
      setToastMsg("Select at least one contact to share with.");
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }
    // TODO: POST /api/trips/share { origin, destination, fare, vehicleDetail, contactIds }
    setToastMsg("Trip shared! Your contacts have been notified.");
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 rounded-lg text-[#1C1B1B] hover:bg-black/5 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <BackIcon />
          </button>
          <AppLogo size="xs" showWordmark={false} />
          <span className="text-base font-semibold text-[#1C1B1B]">Share Trip</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-full bg-[#1C1B1B] flex items-center justify-center text-white hover:bg-black transition-colors"
          aria-label={`Profile — ${session?.user?.fullName ?? "User"}`}
        >
          <ProfileIcon />
        </button>
      </header>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-4 pb-10 gap-5 w-full max-w-lg mx-auto">

        {/* Intro copy */}
        <div className="flex flex-col gap-1 pt-1">
          <p className="text-base font-semibold text-[#1C1B1B]">Share Trip Details</p>
          <p className="text-sm text-[#747878]">
            Keep your loved ones informed about your journey.
          </p>
        </div>

        {/* Current route card */}
        <div className="bg-[#00C9A7] rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#005047]">
                Current Route
              </span>
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <span>{origin}</span>
                <span className="text-white/70 text-sm">→</span>
                <span>{destination}</span>
              </div>
            </div>
            {/* Time badge */}
            <div className="flex items-center gap-1.5 bg-[#1C1B1B] text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
              <ClockIcon />
              <span>{now}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
            <FareIcon />
            <span>Est. Fare: <span className="font-bold">{fare}</span></span>
          </div>
        </div>

        {/* Share with */}
        <div className="flex flex-col gap-3">
          <SectionLabel>Share With</SectionLabel>

          <div className="flex flex-col gap-2">
            {contacts.map(contact => (
              <button
                key={contact.id}
                type="button"
                onClick={() => toggleContact(contact.id)}
                className={`
                  w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150
                  ${contact.selected
                    ? "bg-[#F8BA2A]/15 border-[#F8BA2A]/40"
                    : "bg-white border-gray-100 hover:border-gray-200"
                  }
                `}
                aria-pressed={contact.selected}
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#1C1B1B] shrink-0"
                  style={{ backgroundColor: contact.color }}
                >
                  {contact.initials}
                </div>

                {/* Name + relation */}
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-bold text-[#1C1B1B]">{contact.name}</span>
                  <span className="text-xs text-[#747878]">{contact.relation}</span>
                </div>

                {/* Selection indicator */}
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all
                    ${contact.selected ? "bg-[#1C1B1B]" : "bg-gray-100"}
                  `}
                >
                  {contact.selected && <CheckIcon />}
                </div>
              </button>
            ))}

            {/* Add contact */}
            <button
              type="button"
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-gray-300 bg-white text-[#747878] hover:border-gray-400 hover:text-[#1C1B1B] transition-colors"
              aria-label="Add another contact"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <AddContactIcon />
              </div>
              <span className="text-sm font-medium">Add another contact...</span>
            </button>
          </div>
        </div>

        {/* Vehicle details */}
        <div className="flex flex-col gap-3">
          <SectionLabel>Vehicle Details (Optional)</SectionLabel>
          <div
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 focus-within:border-[#00C9A7]/60 transition-colors cursor-text"
            onClick={() => vehicleRef.current?.focus()}
          >
            <span className="text-[#747878] shrink-0">
              <BusIcon />
            </span>
            <input
              ref={vehicleRef}
              type="text"
              value={vehicleDetail}
              onChange={e => setVehicleDetail(e.target.value)}
              placeholder="e.g., White Danfo, Plate: KJA-123"
              className="flex-1 bg-transparent text-sm text-[#1C1B1B] placeholder-gray-400 outline-none"
              aria-label="Vehicle description (optional)"
            />
          </div>
        </div>

        {/* Safety notice */}
        <div className="flex items-start gap-3 bg-[#005047] text-white rounded-xl p-4">
          <span className="shrink-0 mt-0.5 text-[#79F7E3]">
            <ShieldIcon />
          </span>
          <p className="text-xs leading-relaxed text-white/90">
            Sharing your trip sends a live tracking link. They can see your
            location until you reach your destination.
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <PrimaryButton
          width="full"
          onClick={handleShare}
          disabled={selectedCount === 0}
        >
          <SendIcon />
          Share Now
        </PrimaryButton>

      </div>

      <Toast message={toastMsg} />
    </main>
  );
};

export default ShareTrip;
