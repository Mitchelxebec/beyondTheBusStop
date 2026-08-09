import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components";

type Role = "commuter" | "vendor" | null;

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const RoleCard = ({ icon, title, description, selected, onSelect }: RoleCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={`
      w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2
      transition-all duration-200
      ${selected
        ? "border-[#F5B800] bg-[#F5B800]/8 shadow-[0_0_0_4px_rgba(245,184,0,0.08)]"
        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }
    `}
  >
    {/* Icon badge */}
    <span className={`
      w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0
      transition-colors duration-200
      ${selected ? "bg-[#F5B800]/20" : "bg-gray-100"}
    `}>
      {icon}
    </span>

    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <span className="text-xs text-gray-500 leading-relaxed">{description}</span>
    </div>

    {/* Radio dot */}
    <span className={`
      w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center
      transition-all duration-200
      ${selected ? "border-[#F5B800] bg-[#F5B800]" : "border-gray-300"}
    `}>
      {selected && (
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5l2.5 2.5L8 3" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  </button>
);

const RoleSelect = () => {
  const [role, setRole] = useState<Role>(null);
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm flex flex-col gap-7">

        {/* Heading */}
        <div className="flex flex-col gap-1.5 text-center">
          <h1 className="text-xl font-bold text-gray-900">Choose Your Path</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Select how you want to experience Lagos Transit today.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3">
          <RoleCard
            icon="🚌"
            title="I am a Commuter"
            description="Find the fastest routes, check real-time fares, and navigate the city."
            selected={role === "commuter"}
            onSelect={() => setRole("commuter")}
          />
          <RoleCard
            icon="🏪"
            title="I am a Vendor"
            description="Manage listings, track analytics, and connect with daily commuters."
            selected={role === "vendor"}
            onSelect={() => setRole("vendor")}
          />
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <PrimaryButton
            width="full"
            disabled={!role}
            onClick={() => {
              if (role === "commuter") navigate("/auth/commuter/login");
              if (role === "vendor") navigate("/auth/vendor/login");
            }}
          >
            Continue
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
};

export default RoleSelect;
