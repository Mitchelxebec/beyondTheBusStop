import { api } from "../lib/axios";

// ─── Types — exact backend response shape ──────────────────────────────────────
// Source: BTBS-BACKEND/src/controllers/listing.controller.js:145-154 (getMyListings)
//         BTBS-BACKEND/src/models/listing.model.js (fields: businessId, description, location, photoUrls, timestamps)

export interface MyListing {
  _id: string;
  businessName: string;
  category: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  photoUrls: string[];
  vendorId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GetMyListingsResponse {
  success: boolean;
  listings: MyListing[];
}

/**
 * GET /api/listings/my
 * Returns all listings belonging to the authenticated vendor's business.
 * Auth: protect middleware (listing.routes.js:32-36).
 * Mounted: app.js:194 → /api/listings → /my.
 */
export async function getMyListings(): Promise<GetMyListingsResponse> {
  const { data } = await api.get<GetMyListingsResponse>("/listings/my");
  return data;
}

export interface CreateListingPayload {
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  photoUrls?: string[];
}

export interface CreateListingResponse {
  success: boolean;
  listing: MyListing;
}

/**
 * POST /api/listings/upload
 * Uploads up to 5 image files to Cloudinary via backend proxy.
 * Field name: "photos".
 * Auth: protect middleware (listing.routes.js:43-48).
 */
export async function uploadListingPhotos(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) return [];
  const formData = new FormData();
  files.slice(0, 5).forEach((file) => {
    formData.append("photos", file);
  });

  const { data } = await api.post<{ success: boolean; urls?: string[]; message?: string }>(
    "/listings/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!data.success || !Array.isArray(data.urls) || data.urls.length === 0) {
    throw new Error(data.message || "Failed to upload photos. Please check your connection and try again.");
  }

  return data.urls;
}

/**
 * POST /api/listings
 * Creates a new listing with description, location coords, and photoUrls.
 * Auth: protect + requireActiveSubscription (listing.routes.js:24-29).
 */
export async function createListing(
  payload: CreateListingPayload
): Promise<CreateListingResponse> {
  const { data } = await api.post<CreateListingResponse>("/listings", payload);
  return data;
}

export interface UpdateListingPayload {
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
  photoUrls?: string[];
}

export interface UpdateListingResponse {
  success: boolean;
  message: string;
  listing: MyListing;
}

/**
 * PUT /api/listings/:listingId
 * Updates an existing listing owned by the authenticated business.
 * Auth: protect + requireActiveSubscription (listing.routes.js:51-56).
 */
export async function updateListing(
  listingId: string,
  payload: UpdateListingPayload
): Promise<UpdateListingResponse> {
  const { data } = await api.put<UpdateListingResponse>(
    `/listings/${listingId}`,
    payload
  );
  return data;
}

/**
 * DELETE /api/listings/:listingId
 * Deletes an existing listing owned by the authenticated business.
 * Auth: protect + requireActiveSubscription (listing.routes.js:59-64).
 */
export async function deleteListing(listingId: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete<{ success: boolean; message: string }>(
    `/listings/${listingId}`
  );
  return data;
}

