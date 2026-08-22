import { api } from "../lib/axios";
import type {
  GetRouteConfirmationsResponse,
  CreateConfirmationPayload,
  CreateConfirmationResponse,
  UpdateConfirmationPayload,
  UpdateConfirmationResponse,
  DeleteConfirmationResponse,
} from "../types/confirmations";

/** GET /api/confirmations/routes/:routeId — public */
export async function getRouteConfirmations(
  routeId: string
): Promise<GetRouteConfirmationsResponse> {
  const { data } = await api.get<GetRouteConfirmationsResponse>(
    `/confirmations/routes/${routeId}`
  );
  return data;
}

/** POST /api/confirmations/:routeId — requires Bearer token (any logged-in user) */
export async function createConfirmation(
  routeId: string,
  payload: CreateConfirmationPayload
): Promise<CreateConfirmationResponse> {
  const { data } = await api.post<CreateConfirmationResponse>(
    `/confirmations/${routeId}`,
    {
      ...payload,
      routeId,
    }
  );
  return data;
}

/** PATCH /api/confirmations/:confirmationId — requires Bearer token (owner or admin)
 *  Note: only confirmedFare is saved by the backend; verificationStatus is not updatable here.
 */
export async function updateConfirmation(
  confirmationId: string,
  payload: UpdateConfirmationPayload
): Promise<UpdateConfirmationResponse> {
  const { data } = await api.patch<UpdateConfirmationResponse>(
    `/confirmations/${confirmationId}`,
    payload
  );
  return data;
}

/** DELETE /api/confirmations/:confirmationId — requires Bearer token (admin only) */
export async function deleteConfirmation(
  confirmationId: string
): Promise<DeleteConfirmationResponse> {
  const { data } = await api.delete<DeleteConfirmationResponse>(
    `/confirmations/${confirmationId}`
  );
  return data;
}
