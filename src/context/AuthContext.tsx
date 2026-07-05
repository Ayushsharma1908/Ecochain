import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { clearAuthUser, createAuthUser, loadAuthUser, saveAuthUser } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";

interface AuthContextState {
  user: AuthUser | null;
  loading: boolean;
  signInWithEmail: (email: string, name?: string) => Promise<AuthUser>;
  signInWithGoogle: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthUser().then((storedUser) => {
      setUser(storedUser);
      setLoading(false);
    });
  }, []);

  const persistUser = useCallback(async (nextUser: AuthUser) => {
    await saveAuthUser(nextUser);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, name?: string) => persistUser(createAuthUser(email, "email", name)),
    [persistUser]
  );

  const signInWithGoogle = useCallback(
    async () => persistUser(createAuthUser("google.user@ecochain.local", "google", "Google User")),
    [persistUser]
  );

  const signOut = useCallback(async () => {
    await clearAuthUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signInWithEmail, signInWithGoogle, signOut }),
    [user, loading, signInWithEmail, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextState {
  const ctx = React.use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
