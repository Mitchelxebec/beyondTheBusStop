// ─── Route Issue Reporting Types ─────────────────────────────────────────────
// Source: BTBS-BACKEND/src/controllers/report.controller.js:9-63
//         BTBS-BACKEND/src/validators/report.validation.js:3-24

export type ReportType =
  | "incorrect_route"
  | "outdated_fare"
  | "inaccurate_information";

export interface CreateReportPayload {
  routeId: string;
  reportType: ReportType;
  description?: string;
}

export interface ReportItem {
  id: string;
  routeId: string;
  reportType: ReportType;
  description?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
}

export interface CreateReportResponse {
  success: boolean;
  message: string;
  report: ReportItem;
}
