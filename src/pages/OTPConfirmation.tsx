const OTP_LENGTH = 6;

const OTPConfirmation = () => {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white flex flex-col px-6 pt-14 pb-10 gap-6">
      {/* Back button */}
      <button
        type="button"
        aria-label="Go back"
        className="self-start text-white/60 hover:text-white transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Heading */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold leading-tight">Verify your number</h1>
        <p className="text-sm text-white/60">
          Enter the 6-digit code sent to{" "}
          <span className="text-white font-medium">(555) 000-0000</span>.
        </p>
      </div>

      {/* OTP digit boxes */}
      <div
        className="flex justify-between gap-2"
        role="group"
        aria-label="One-time passcode"
      >
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            placeholder="·"
            aria-label={`Digit ${i + 1}`}
            className="w-11 h-12 bg-transparent border border-white/30 rounded-md text-center text-lg font-semibold text-white placeholder-white/20 outline-none focus:border-white/70 transition-colors caret-white"
          />
        ))}
      </div>

      {/* Resend */}
      <p className="text-sm text-white/50 text-center">
        Didn't get a code?{" "}
        <button
          type="button"
          className="text-white font-medium underline underline-offset-2 active:opacity-70 transition-opacity"
        >
          Resend
        </button>
      </p>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA */}
      <button
        type="button"
        className="w-full bg-white text-[#1A1A1A] font-semibold text-sm rounded-md py-4 active:opacity-80 transition-opacity"
      >
        Verify
      </button>
    </main>
  );
};

export default OTPConfirmation;
