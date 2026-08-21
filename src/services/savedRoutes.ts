/**
 * Saved Routes Local Storage Service
 *
 * KNOWN ARCHITECTURAL LIMITATION:
 * Saved routes are persisted to browser `localStorage` namespaced by user ID (`session.user._id`).
 * This provides immediate, per-device bookmark persistence without requiring backend schema changes.
 * Because there is currently no backend endpoint (e.g. POST/DELETE /api/users/saved-routes) in BTBS-BACKEND,
 * saved routes are scoped strictly to the local browser/device and will not synchronize across different devices.
 *
 * FUTURE BACKEND TASK:
 * Once a user saved-routes endpoint and schema are introduced on the server, this service should be
 * refactored to sync with the backend REST API instead of localStorage.
 */

export function getSavedRoutesKey(userId?: string): string {
  const cleanId = userId?.trim();
  return cleanId ? `btbs_saved_routes_${cleanId}` : "btbs_saved_routes_guest";
}

/**
 * Reads all saved route IDs for the specified user from localStorage.
 */
export function getSavedRouteIds(userId?: string): string[] {
  try {
    const key = getSavedRoutesKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => (typeof item === "string" ? item : item?._id || item?.id))
        .filter((id): id is string => typeof id === "string" && id.length > 0);
    }
    return [];
  } catch (err) {
    console.warn("[savedRoutes] Error reading saved route IDs from localStorage:", err);
    return [];
  }
}

/**
 * Persists a route ID into the user's saved list in localStorage.
 */
export function saveRouteId(routeId: string, userId?: string): string[] {
  if (!routeId) return getSavedRouteIds(userId);
  try {
    const key = getSavedRoutesKey(userId);
    const existing = getSavedRouteIds(userId);
    if (!existing.includes(routeId)) {
      const updated = [routeId, ...existing];
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    }
    return existing;
  } catch (err) {
    console.warn("[savedRoutes] Error saving route ID to localStorage:", err);
    return getSavedRouteIds(userId);
  }
}

/**
 * Removes a route ID from the user's saved list in localStorage.
 */
export function removeRouteId(routeId: string, userId?: string): string[] {
  if (!routeId) return getSavedRouteIds(userId);
  try {
    const key = getSavedRoutesKey(userId);
    const existing = getSavedRouteIds(userId);
    const updated = existing.filter((id) => id !== routeId);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("[savedRoutes] Error removing route ID from localStorage:", err);
    return getSavedRouteIds(userId);
  }
}

/**
 * Checks if a given route ID is currently saved for the specified user.
 */
export function isRouteSaved(routeId?: string, userId?: string): boolean {
  if (!routeId) return false;
  const existing = getSavedRouteIds(userId);
  return existing.includes(routeId);
}
