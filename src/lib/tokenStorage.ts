const TOKEN_KEY = "btbs_token";
const USER_KEY  = "btbs_user";
const ROLE_KEY  = "btbs_role";

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setSession(token: string, user: object, role: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ROLE_KEY, role);
  },
  getUser<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  getRole(): string | null {
    return localStorage.getItem(ROLE_KEY);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};
