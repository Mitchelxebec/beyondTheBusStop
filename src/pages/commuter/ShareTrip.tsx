import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  BottomNavBar,
  DEFAULT_NAV_ITEMS,
  PrimaryButton,
  SecondaryButton,
  SectionLabel,
  Toast,
} from "../../components";
import { useCreateTrip, useStartTrip, useEndTrip } from "../../hooks/useTrips";
import { shareTrip } from "../../services/trips";
import type { Trip } from "../../types/trips";

// ─── Icons ─────────────────────────────────────────────────────────────────────

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

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V6l-8-4z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

// ─── Step definitions ──────────────────────────────────────────────────────────

type Step = "prepare" | "sharing" | "done";

// ─── Page ──────────────────────────────────────────────────────────────────────

const ShareTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  // Route data passed via location.state from RouteDetails
  const stateRoute = location.state as {
    origin?: string;
    destination?: string;
    fare?: string;
    routeId?: string;
  } | null;

  const origin      = stateRoute?.origin      ?? "–";
  const destination = stateRoute?.destination ?? "–";
  const fare        = stateRoute?.fare        ?? "–";
  const routeId     = stateRoute?.routeId;

  const now = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep]           = useState<Step>("prepare");
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [sharePayload, setSharePayload] = useState<{
    shareToken: string;
    shareUrl: string;
    whatsappMessage: string;
  } | null>(null);
  const [copied, setCopied]       = useState(false);
  const [toastMsg, setToastMsg]   = useState<string | null>(null);
  const [endConfirm, setEndConfirm] = useState(false);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createTripMutation = useCreateTrip();
  const startTripMutation  = useStartTrip();
  const endTripMutation    = useEndTrip();

  // ── Derived ───────────────────────────────────────────────────────────────
  const isBusy =
    createTripMutation.isPending ||
    startTripMutation.isPending ||
    endTripMutation.isPending;

  // ── Show toast helper ──────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── No routeId guard ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!routeId) {
      showToast("No route selected. Please choose a route first.");
    }
  }, [routeId]);

  // ─── Step 1 → 2: Create trip + start it + fetch share payload ──────────────
  const handleStartSharing = async () => {
    if (!routeId) {
      showToast("No route selected. Go back and pick a route.");
      return;
    }

    try {
      // 1. Create the trip record
      const createRes = await createTripMutation.mutateAsync(routeId);
      const trip = createRes.trip;

      // 2. Immediately start the trip so live tracking is enabled
      await startTripMutation.mutateAsync(trip._id);

      // 3. Fetch share payload (token + WhatsApp message + URL)
      const shareRes = await shareTrip(trip._id);

      setActiveTrip({ ...trip, status: "active" });
      setSharePayload(shareRes.share);
      setStep("sharing");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      showToast(msg);
    }
  };

  // ─── Open WhatsApp with pre-filled message ────────────────────────────────
  const handleWhatsApp = () => {
    if (!sharePayload) return;
    const text = encodeURIComponent(
      `${sharePayload.whatsappMessage}\n\n🔗 Track live: ${sharePayload.shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  // ─── Copy share link to clipboard ────────────────────────────────────────
  const handleCopyLink = async () => {
    if (!sharePayload?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(sharePayload.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Could not copy link. Please copy it manually.");
    }
  };

  // ─── End trip ─────────────────────────────────────────────────────────────
  const handleEndTrip = async () => {
    if (!activeTrip) return;
    setEndConfirm(false);
    try {
      await endTripMutation.mutateAsync(activeTrip._id);
      setStep("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not end trip.";
      showToast(msg);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-dvh bg-[#F5F5F0]">
      <BottomNavBar items={DEFAULT_NAV_ITEMS} />

      {/* ── Sub-header ──────────────────────────────────────────────────────── */}
      <div className="w-full pt-16">
        <div
          className="px-4 sm:px-6 py-4 w-full mx-auto flex items-center justify-between"
          style={{ maxWidth: "min(100%, 72rem)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-lg text-[#1C1B1B] hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
              aria-label="Go back"
            >
              <BackIcon />
            </button>
            <div>
              <h1 className="text-base font-semibold text-[#1C1B1B] m-0">Share Trip</h1>
              <p className="text-xs text-[#747878] m-0">
                {step === "prepare" && "Start your trip and get a live tracking link."}
                {step === "sharing" && "Your trip is live — share the link with your contacts."}
                {step === "done"    && "Trip completed. Stay safe!"}
              </p>
            </div>
          </div>

          {session?.user && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/5 text-xs text-[#444748] shadow-2xs">
              <ProfileIcon />
              <span className="font-medium truncate max-w-35">
                {session.user.fullName || "Commuter"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────────────── */}
      <main
        className="flex-1 w-full mx-auto px-4 sm:px-6 pb-12 flex flex-col gap-6"
        style={{ maxWidth: "min(100%, 72rem)" }}
        aria-label="Share trip content"
      >
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Route card ──────────────────────────────────────────────────── */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
            <div className="bg-[#00C9A7] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#005047]">
                    {step === "sharing" ? "Active Trip" : step === "done" ? "Completed Trip" : "Selected Route"}
                  </span>
                  <div className="flex items-center gap-2 text-white font-bold text-lg flex-wrap">
                    <span>{origin}</span>
                    <span className="text-white/60">→</span>
                    <span>{destination}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-[#1C1B1B] text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
                  <ClockIcon />
                  <span>{now}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                <FareIcon />
                <span>Est. Fare: <span className="font-bold">{fare}</span></span>
              </div>

              {/* Status badge */}
              {step !== "prepare" && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${
                  step === "sharing" ? "bg-white/20 text-white" : "bg-white/10 text-white/80"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${step === "sharing" ? "bg-white animate-pulse" : "bg-white/50"}`} />
                  {step === "sharing" ? "Live — Tracking Active" : "Trip Ended"}
                </div>
              )}
            </div>

            {/* Safety notice */}
            <div className="flex items-start gap-3 bg-[#005047] text-white rounded-xl p-4">
              <span className="shrink-0 mt-0.5 text-[#79F7E3]">
                <ShieldIcon />
              </span>
              <p className="text-xs leading-relaxed text-white/90">
                {step === "prepare"
                  ? "Starting a trip generates a live tracking link. Anyone with the link can follow your journey until you end it."
                  : step === "sharing"
                  ? "Your trip is live. Share the link via WhatsApp or copy it to send through any channel."
                  : "Your trip has ended. The tracking link is no longer active."}
              </p>
            </div>
          </div>

          {/* ── Right panel ─────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-5 w-full">

            {/* ── STEP: prepare ─────────────────────────────────────────────── */}
            {step === "prepare" && (
              <div className="flex flex-col gap-5">
                <section className="bg-white rounded-2xl p-5 border border-black/5 flex flex-col gap-3">
                  <SectionLabel>How it works</SectionLabel>
                  <ol className="flex flex-col gap-3 list-none m-0 p-0">
                    {[
                      { n: "1", text: "Tap \"Start Trip & Get Link\" below." },
                      { n: "2", text: "Your trip goes live and a unique tracking link is generated." },
                      { n: "3", text: "Share the link via WhatsApp or copy it to any chat app." },
                      { n: "4", text: "When you arrive, tap \"End Trip\" to stop sharing." },
                    ].map(({ n, text }) => (
                      <li key={n} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#00C9A7]/15 text-[#005047] text-xs font-bold flex items-center justify-center shrink-0">
                          {n}
                        </span>
                        <span className="text-sm text-[#444748]">{text}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                {!routeId && (
                  <div className="bg-[#FEF7E0] border border-[#FFC72C]/40 rounded-xl p-4 text-xs text-[#6F5400] font-medium">
                    No route selected. Please go back and open a route first, then tap "Share Trip".
                  </div>
                )}

                <PrimaryButton
                  width="full"
                  onClick={handleStartSharing}
                  disabled={isBusy || !routeId}
                >
                  <ShareIcon />
                  {isBusy ? "Starting trip…" : "Start Trip & Get Link"}
                </PrimaryButton>

                <SecondaryButton width="full" onClick={() => navigate(-1)}>
                  Cancel
                </SecondaryButton>
              </div>
            )}

            {/* ── STEP: sharing ─────────────────────────────────────────────── */}
            {step === "sharing" && sharePayload && (
              <div className="flex flex-col gap-5">

                {/* Share link card */}
                <section className="bg-white rounded-2xl p-5 border border-black/5 flex flex-col gap-4">
                  <SectionLabel>Your Live Tracking Link</SectionLabel>

                  {/* URL display */}
                  <div className="flex items-center gap-2 bg-[#F4F1EE] rounded-xl px-4 py-3 border border-black/5">
                    <span className="text-xs text-[#444748] flex-1 break-all font-mono leading-relaxed">
                      {sharePayload.shareUrl}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="shrink-0 p-2 rounded-lg bg-white border border-black/10 text-[#1C1B1B] hover:bg-[#00C9A7]/10 hover:border-[#00C9A7]/40 transition-all active:scale-95"
                      aria-label="Copy link"
                    >
                      {copied ? <CheckCircleIcon /> : <CopyIcon />}
                    </button>
                  </div>

                  {copied && (
                    <p className="text-xs text-[#005047] font-semibold -mt-2">
                      ✓ Link copied to clipboard
                    </p>
                  )}

                  {/* WhatsApp CTA */}
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#1EBE5D] active:scale-[0.98] transition-all shadow-sm"
                  >
                    <WhatsAppIcon />
                    Share on WhatsApp
                  </button>

                  <SecondaryButton
                    width="full"
                    onClick={handleCopyLink}
                  >
                    <CopyIcon />
                    {copied ? "Copied!" : "Copy Link"}
                  </SecondaryButton>
                </section>

                {/* Trip info summary */}
                <section className="bg-white rounded-2xl p-5 border border-black/5 flex flex-col gap-2">
                  <SectionLabel>Trip Summary</SectionLabel>
                  {activeTrip && (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt className="text-[#747878] text-xs">Vehicle</dt>
                      <dd className="font-semibold text-[#1C1B1B] capitalize m-0">{activeTrip.vehicleType}</dd>
                      <dt className="text-[#747878] text-xs">Boarding</dt>
                      <dd className="font-semibold text-[#1C1B1B] m-0">{activeTrip.boardingPoint.name}</dd>
                      <dt className="text-[#747878] text-xs">Drop-off</dt>
                      <dd className="font-semibold text-[#1C1B1B] m-0">{activeTrip.dropOffPoint.name}</dd>
                      <dt className="text-[#747878] text-xs">Fare range</dt>
                      <dd className="font-semibold text-[#1C1B1B] m-0">₦{activeTrip.fareLow} – ₦{activeTrip.fareHigh}</dd>
                    </dl>
                  )}
                </section>

                {/* End trip */}
                {!endConfirm ? (
                  <button
                    type="button"
                    onClick={() => setEndConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-[#BA1A1A]/40 bg-[#FCE8E6] text-[#BA1A1A] text-sm font-bold hover:bg-[#BA1A1A]/10 active:scale-[0.98] transition-all"
                    disabled={isBusy}
                  >
                    <StopIcon />
                    {isBusy ? "Ending trip…" : "End Trip"}
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 bg-[#FCE8E6] rounded-2xl p-4 border border-[#BA1A1A]/20">
                    <p className="text-sm font-semibold text-[#BA1A1A] m-0">
                      Are you sure you want to end this trip? The tracking link will stop working.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleEndTrip}
                        disabled={isBusy}
                        className="flex-1 py-2.5 rounded-xl bg-[#BA1A1A] text-white text-sm font-bold hover:bg-[#9B1717] transition-colors disabled:opacity-60"
                      >
                        {isBusy ? "Ending…" : "Yes, End Trip"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEndConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl bg-white border border-black/10 text-[#1C1B1B] text-sm font-semibold hover:bg-neutral-50 transition-colors"
                      >
                        Keep Sharing
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP: done ────────────────────────────────────────────────── */}
            {step === "done" && (
              <div className="flex flex-col gap-5">
                <section className="bg-white rounded-2xl p-6 border border-black/5 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#00C9A7]/15 flex items-center justify-center">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1C1B1B] m-0">Trip Completed</h2>
                    <p className="text-xs text-[#747878] mt-1">
                      Your tracking link has been deactivated. You arrived safely!
                    </p>
                  </div>
                </section>

                <PrimaryButton width="full" onClick={() => navigate("/home")}>
                  Back to Home
                </PrimaryButton>

                <SecondaryButton width="full" onClick={() => navigate("/routes")}>
                  Browse Routes
                </SecondaryButton>
              </div>
            )}

          </div>
        </div>
      </main>

      <Toast message={toastMsg} />
    </div>
  );
};

export default ShareTrip;
