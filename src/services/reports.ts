import { api } from "../lib/axios";
import type {
  CreateReportPayload,
  CreateReportResponse,
} from "../types/reports";

/**
 * POST /api/reports — requires Bearer token (commuter / business)
 * Submits a report about a transit route corridor (e.g. incorrect_route, outdated_fare, inaccurate_information).
 * Mounted: app.js:186 → /api/reports
 * Controller: BTBS-BACKEND/src/controllers/report.controller.js:9-63
 */
export async function createReport(
  payload: CreateReportPayload
): Promise<CreateReportResponse> {
  const { data } = await api.post<CreateReportResponse>("/reports", payload);
  return data;
}
