import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components";

type Role = "commuter" | "vendor" | null;

interface RoleCardProps {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const RoleCard = ({ icon, title, description, selected, onSelect }: RoleCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all ${
      selected
        ? "border-[#F5B800] bg-[#F5B800]/5"
        : "border-gray-200 bg-gray-50 active:bg-gray-100"
    }`}
    aria-pressed={selected}
  >
    <span className="text-xl mt-0.5">{icon}</span>
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <span className="text-xs text-gray-500 leading-relaxed">{description}</span>
    </div>
    <span
      className={`ml-auto mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
        selected ? "border-[#F5B800] bg-[#F5B800]" : "border-gray-300"
      }`}
    >
      {selected && (
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5l2.5 2.5L8 3" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  </button>
);

const RoleSelect = () => {
  const [role, setRole] = useState<Role>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (role === "commuter") navigate("/auth/commuter/login");
    if (role === "vendor") navigate("/auth/vendor/login");
  };

  return (
    <main className="min-h-screen bg-[#F5F5F0] flex flex-col px-5 pt-14 pb-8 gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-lg font-bold text-gray-900">Choose Your Path</h1>
        <p className="text-xs text-gray-500">
          Select how you want to experience Lagos Transit today.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <RoleCard
          icon="🚌"
          title="I am a Commuter"
          description="Find the fastest routes, check real-time fares, and navigate the city with confidence."
          selected={role === "commuter"}
          onSelect={() => setRole("commuter")}
        />
        <RoleCard
          icon="🏪"
          title="I am a Vendor"
          description="Manage your listings, track sales analytics, and connect with thousands of daily commuters."
          selected={role === "vendor"}
          onSelect={() => setRole("vendor")}
        />
      </div>

      <div className="flex-1" />

      <PrimaryButton disabled={!role} onClick={handleContinue}>
        Continue
      </PrimaryButton>
    </main>
  );
};

export default RoleSelect;
