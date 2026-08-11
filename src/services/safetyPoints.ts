import { api } from "../lib/axios";
import type {
  GetSafetyPointsResponse,
  GetByCategoryResponse,
  CreateSafetyPointPayload,
  CreateSafetyPointResponse,
  SafetyPointCategory,
} from "../types/safetyPoints";

/** GET /api/safety-points/ — public */
export async function getSafetyPoints(): Promise<GetSafetyPointsResponse> {
  const { data } = await api.get<GetSafetyPointsResponse>("/safety-points");
  return data;
}

/** GET /api/safety-points/category/:category — public */
export async function getSafetyPointsByCategory(
  category: SafetyPointCategory
): Promise<GetByCategoryResponse> {
  const { data } = await api.get<GetByCategoryResponse>(
    `/safety-points/category/${encodeURIComponent(category)}`
  );
  return data;
}

/** POST /api/safety-points/ — admin only, requires Bearer token */
export async function createSafetyPoint(
  payload: CreateSafetyPointPayload
): Promise<CreateSafetyPointResponse> {
  const { data } = await api.post<CreateSafetyPointResponse>(
    "/safety-points",
    payload
  );
  return data;
}
