import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import type { AuthSession, AuthUser, UserRole } from "../types/auth";
import { tokenStorage } from "../lib/tokenStorage";

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadInitialSession(): AuthSession | null {
  const token = tokenStorage.getToken();
  const user  = tokenStorage.getUser<AuthUser>();
  const role  = tokenStorage.getRole() as UserRole | null;
  if (token && user && role) return { token, user, role };
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(
    loadInitialSession
  );

  const setSession = (s: AuthSession) => {
    tokenStorage.setSession(s.token, s.user, s.role);
    setSessionState(s);
  };

  const clearSession = () => {
    tokenStorage.clear();
    setSessionState(null);
  };

  const value = useMemo(
    () => ({ session, isAuthenticated: session !== null, setSession, clearSession }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
