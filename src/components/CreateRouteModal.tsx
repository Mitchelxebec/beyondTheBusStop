import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PrimaryButton, SecondaryButton, TextInput } from "./";
import { createRoute } from "../services/routes";
import type { VehicleType, CreateRoutePayload, Route } from "../types/routes";

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 5L15 15M5 15L15 5" stroke="#444748" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (route: Route) => void;
}

/**
 * Shared CreateRouteModal component for both Commuter and Business/Vendor users.
 * Connects directly to POST /api/routes/create via createRoute service.
 * Defensively ensures only supported vehicleTypes ('bus' | 'keke' | 'taxi' | 'train') are sent.
 */
export const CreateRouteModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateRouteModalProps) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateRoutePayload>({
    origin: "",
    destination: "",
    vehicleType: "bus",
    fareLow: 200,
    fareHigh: 500,
  });
  const [formError, setFormError] = useState("");

  const createRouteMutation = useMutation({
    mutationFn: createRoute,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      setFormData({
        origin: "",
        destination: "",
        vehicleType: "bus",
        fareLow: 200,
        fareHigh: 500,
      });
      setFormError("");
      onClose();
      if (onSuccess && data.route) {
        onSuccess(data.route);
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to create route";
      setFormError(msg);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.origin.trim() || !formData.destination.trim()) {
      setFormError("Please enter both origin and destination");
      return;
    }
    if (formData.fareLow <= 0 || formData.fareHigh < formData.fareLow) {
      setFormError("Please enter valid low and high fare amounts (high must be ≥ low)");
      return;
    }

    // Defensively sanitize vehicleType (mapping unsupported values like 'danfo' to 'bus')
    const rawType = (formData.vehicleType || "bus").toLowerCase();
    const safeVehicleType: VehicleType =
      rawType === "keke"
        ? "keke"
        : rawType === "taxi"
        ? "taxi"
        : rawType === "train"
        ? "train"
        : "bus";

    createRouteMutation.mutate({
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
      vehicleType: safeVehicleType,
      fareLow: Number(formData.fareLow),
      fareHigh: Number(formData.fareHigh),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-route-title"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h2 id="create-route-title" className="text-lg font-bold text-[#1C1B1B] m-0">
              Create New Transit Route
            </h2>
            <p className="text-xs text-[#747878] m-0 mt-0.5">
              Add a verified transit route to the community network
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 text-[#444748] transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextInput
            label="Origin (Starting Point)"
            placeholder="e.g. Ojota, Oshodi, Egbeda"
            value={formData.origin}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, origin: e.target.value }))
            }
            required
          />

          <TextInput
            label="Destination (Ending Point)"
            placeholder="e.g. CMS, Ikeja, Lekki Phase 1"
            value={formData.destination}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, destination: e.target.value }))
            }
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 px-1">
              Vehicle Type
            </label>
            <div className="bg-gray-50 rounded-lg px-4 py-3.5 border border-gray-200">
              <select
                value={formData.vehicleType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    vehicleType: e.target.value as VehicleType,
                  }))
                }
                className="w-full bg-transparent text-gray-900 text-sm outline-none capitalize cursor-pointer"
              >
                <option value="bus">Bus</option>
                <option value="keke">Keke</option>
                <option value="taxi">Taxi</option>
                <option value="train">Train</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Fare Low (₦)"
              type="number"
              min="1"
              value={formData.fareLow}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fareLow: Number(e.target.value),
                }))
              }
              required
            />

            <TextInput
              label="Fare High (₦)"
              type="number"
              min="1"
              value={formData.fareHigh}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fareHigh: Number(e.target.value),
                }))
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
            <SecondaryButton onClick={onClose} width="auto">
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={createRouteMutation.isPending}
              width="auto"
            >
              {createRouteMutation.isPending ? "Creating…" : "Create Route"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRouteModal;
