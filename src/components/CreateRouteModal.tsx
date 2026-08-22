import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PrimaryButton, SecondaryButton, TextInput } from "./";
import { createRoute } from "../services/routes";
import { searchPlaces, getPlaceDetails, resolveCoordinates } from "../services/locations";
import type { VehicleType, CreateRoutePayload, Route, LocationPlace } from "../types/routes";

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 5L15 15M5 15L15 5" stroke="#444748" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (route: Route) => void;
  initialOrigin?: LocationPlace;
  initialDestination?: LocationPlace;
}

/**
 * Shared CreateRouteModal component for both Commuter and Business/Vendor users.
 * Connects directly to POST /api/routes/create via createRoute service.
 * Enforces backend schema: structured origin/destination { placeId, name, lat, lng },
 * boardingPoint, dropOffPoint, and valid vehicle types ('bus' | 'keke' | 'taxi').
 */
const isGenericGpsName = (val?: string | null): boolean => {
  if (!val) return false;
  return val.trim().toLowerCase() === "current location";
};

export const CreateRouteModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialOrigin,
  initialDestination,
}: CreateRouteModalProps) => {
  const queryClient = useQueryClient();

  const initialOriginIsGps = isGenericGpsName(initialOrigin?.name);
  const [originName, setOriginName] = useState(initialOriginIsGps ? "" : (initialOrigin?.name ?? ""));
  const [originPlaceId, setOriginPlaceId] = useState(initialOriginIsGps ? "" : (initialOrigin?.placeId ?? ""));
  const [originLat, setOriginLat] = useState<number | undefined>(initialOrigin?.latitude);
  const [originLng, setOriginLng] = useState<number | undefined>(initialOrigin?.longitude);

  const initialDestIsGps = isGenericGpsName(initialDestination?.name);
  const [destName, setDestName] = useState(initialDestIsGps ? "" : (initialDestination?.name ?? ""));
  const [destPlaceId, setDestPlaceId] = useState(initialDestIsGps ? "" : (initialDestination?.placeId ?? ""));
  const [destLat, setDestLat] = useState<number | undefined>(initialDestination?.latitude);
  const [destLng, setDestLng] = useState<number | undefined>(initialDestination?.longitude);

  const [boardingPoint, setBoardingPoint] = useState(initialOriginIsGps ? "" : (initialOrigin?.name ?? ""));
  const [dropOffPoint, setDropOffPoint] = useState(initialDestIsGps ? "" : (initialDestination?.name ?? ""));

  const [vehicleType, setVehicleType] = useState<VehicleType>("bus");
  const [fareLow, setFareLow] = useState<number>(200);
  const [fareHigh, setFareHigh] = useState<number>(500);

  const [formError, setFormError] = useState(
    initialOriginIsGps
      ? "We couldn't detect your street name from GPS — please enter your starting point manually."
      : ""
  );

  useEffect(() => {
    if (initialOrigin) {
      if (isGenericGpsName(initialOrigin.name)) {
        setOriginName("");
        setOriginPlaceId("");
        setOriginLat(initialOrigin.latitude);
        setOriginLng(initialOrigin.longitude);
        setBoardingPoint("");
        setFormError("We couldn't detect your street name from GPS — please enter your starting point manually.");
      } else {
        setOriginName(initialOrigin.name);
        setOriginPlaceId(initialOrigin.placeId ?? "");
        setOriginLat(initialOrigin.latitude);
        setOriginLng(initialOrigin.longitude);
        setBoardingPoint(initialOrigin.name);
      }
    }
  }, [initialOrigin]);

  useEffect(() => {
    if (initialDestination) {
      if (isGenericGpsName(initialDestination.name)) {
        setDestName("");
        setDestPlaceId("");
        setDestLat(initialDestination.latitude);
        setDestLng(initialDestination.longitude);
        setDropOffPoint("");
      } else {
        setDestName(initialDestination.name);
        setDestPlaceId(initialDestination.placeId ?? "");
        setDestLat(initialDestination.latitude);
        setDestLng(initialDestination.longitude);
        setDropOffPoint(initialDestination.name);
      }
    }
  }, [initialDestination]);

  const createRouteMutation = useMutation({
    mutationFn: createRoute,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const oName = originName.trim();
    const dName = destName.trim();
    const bName = boardingPoint.trim() || oName;
    const dpName = dropOffPoint.trim() || dName;

    if (!oName || !dName) {
      setFormError("Please enter both origin and destination");
      return;
    }
    if (isGenericGpsName(oName)) {
      setFormError("Please provide a specific street, bus stop, or landmark name instead of 'Current Location'.");
      return;
    }
    if (isGenericGpsName(dName)) {
      setFormError("Please provide a specific destination street or landmark name instead of 'Current Location'.");
      return;
    }
    if (isGenericGpsName(bName)) {
      setFormError("Please provide a specific boarding stop or landmark name instead of 'Current Location'.");
      return;
    }
    if (isGenericGpsName(dpName)) {
      setFormError("Please provide a specific drop-off stop or landmark name instead of 'Current Location'.");
      return;
    }
    if (fareLow <= 0 || fareHigh < fareLow) {
      setFormError("Please enter valid low and high fare amounts (high must be ≥ low)");
      return;
    }

    let resolvedOriginPlaceId = originPlaceId;
    let resolvedOriginLat = originLat;
    let resolvedOriginLng = originLng;

    let resolvedDestPlaceId = destPlaceId;
    let resolvedDestLat = destLat;
    let resolvedDestLng = destLng;

    // If origin place ID is missing, attempt to resolve via backend places search
    if (!resolvedOriginPlaceId) {
      const places = await searchPlaces(oName);
      if (places.length > 0 && places[0].placeId) {
        resolvedOriginPlaceId = places[0].placeId;
      } else {
        resolvedOriginPlaceId = `place_${Date.now()}_orig`;
      }
    }

    // Ensure origin coordinates
    if (resolvedOriginLat === undefined || resolvedOriginLng === undefined) {
      if (resolvedOriginPlaceId && !resolvedOriginPlaceId.startsWith("place_")) {
        const details = await getPlaceDetails(resolvedOriginPlaceId);
        if (details) {
          resolvedOriginLat = details.lat;
          resolvedOriginLng = details.lng;
        }
      }
      if (resolvedOriginLat === undefined || resolvedOriginLng === undefined) {
        const coords = await resolveCoordinates(oName);
        resolvedOriginLat = coords.lat;
        resolvedOriginLng = coords.lng;
      }
    }

    // If destination place ID is missing, attempt to resolve via backend places search
    if (!resolvedDestPlaceId) {
      const places = await searchPlaces(dName);
      if (places.length > 0 && places[0].placeId) {
        resolvedDestPlaceId = places[0].placeId;
      } else {
        resolvedDestPlaceId = `place_${Date.now()}_dest`;
      }
    }

    // Ensure destination coordinates
    if (resolvedDestLat === undefined || resolvedDestLng === undefined) {
      if (resolvedDestPlaceId && !resolvedDestPlaceId.startsWith("place_")) {
        const details = await getPlaceDetails(resolvedDestPlaceId);
        if (details) {
          resolvedDestLat = details.lat;
          resolvedDestLng = details.lng;
        }
      }
      if (resolvedDestLat === undefined || resolvedDestLng === undefined) {
        const coords = await resolveCoordinates(dName);
        resolvedDestLat = coords.lat;
        resolvedDestLng = coords.lng;
      }
    }

    // Backend route.validation.js strictly allows ["bus", "keke", "taxi"]
    const safeVehicleType: VehicleType =
      vehicleType === "keke"
        ? "keke"
        : vehicleType === "taxi"
        ? "taxi"
        : "bus";

    const payload: CreateRoutePayload = {
      origin: {
        placeId: resolvedOriginPlaceId,
        name: oName,
        lat: resolvedOriginLat,
        lng: resolvedOriginLng,
      },
      destination: {
        placeId: resolvedDestPlaceId,
        name: dName,
        lat: resolvedDestLat,
        lng: resolvedDestLng,
      },
      boardingPoint: {
        name: bName,
        placeId: resolvedOriginPlaceId,
      },
      dropOffPoint: {
        name: dpName,
        placeId: resolvedDestPlaceId,
      },
      vehicleType: safeVehicleType,
      fareLow: Number(fareLow),
      fareHigh: Number(fareHigh),
    };

    createRouteMutation.mutate(payload);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-route-title"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in duration-150 my-auto"
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
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <TextInput
            label="Origin (Starting Point)"
            placeholder="e.g. Ojota, Oshodi, Maryland"
            value={originName}
            onChange={(e) => {
              setOriginName(e.target.value);
              setOriginPlaceId("");
            }}
            required
          />

          <TextInput
            label="Destination (Ending Point)"
            placeholder="e.g. CMS, Ikeja, Lekki Phase 1"
            value={destName}
            onChange={(e) => {
              setDestName(e.target.value);
              setDestPlaceId("");
            }}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Boarding Stop / Park"
              placeholder="e.g. Main Terminal Gate 1"
              value={boardingPoint}
              onChange={(e) => setBoardingPoint(e.target.value)}
              required
            />

            <TextInput
              label="Drop-off Stop / Landmark"
              placeholder="e.g. Under Bridge Roundabout"
              value={dropOffPoint}
              onChange={(e) => setDropOffPoint(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 px-1">
              Vehicle Type
            </label>
            <div className="bg-gray-50 rounded-lg px-4 py-3.5 border border-gray-200">
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full bg-transparent text-gray-900 text-sm outline-none capitalize cursor-pointer"
              >
                <option value="bus">Bus</option>
                <option value="keke">Keke</option>
                <option value="taxi">Taxi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Fare Low (₦)"
              type="number"
              min="1"
              value={fareLow}
              onChange={(e) => setFareLow(Number(e.target.value))}
              required
            />

            <TextInput
              label="Fare High (₦)"
              type="number"
              min="1"
              value={fareHigh}
              onChange={(e) => setFareHigh(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100 mt-1">
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

