import heroImg from "../assets/hero.png";

const PhoneEntry = () => {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      {/* Hero image */}
      <div className="w-full">
        <img
          src={heroImg}
          alt="Beyond the Bus Stop"
          className="w-full object-cover max-h-56 sm:max-h-72"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-6 pt-8 pb-10 gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold leading-tight">
            Enter your phone number
          </h1>
          <p className="text-sm text-white/60">
            We'll send you a one-time code to verify your number.
          </p>
        </div>

        {/* Phone input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium text-white/80">
            Phone number
          </label>
          <div className="flex items-center gap-3 bg-transparent rounded-md px-4 py-3 border border-white/30 focus-within:border-white/70 transition-colors">
            <span className="text-white/60 text-sm select-none whitespace-nowrap">
              🇺🇸 +1
            </span>
            <div className="w-px h-5 bg-white/20" aria-hidden="true" />
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="(555) 000-0000"
              maxLength={14}
              className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
              aria-label="Phone number"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <button
          type="button"
          className="w-full bg-white text-[#1A1A1A] font-semibold text-sm rounded-md py-4 active:opacity-80 transition-opacity"
        >
          Send code
        </button>

        <p className="text-center text-xs text-white/40">
          By continuing you agree to our{" "}
          <span className="underline underline-offset-2">Terms of Service</span>{" "}
          and{" "}
          <span className="underline underline-offset-2">Privacy Policy</span>.
        </p>
      </div>
    </main>
  );
};

export default PhoneEntry;
