import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { clearAuthUser, createAuthUser, loadAuthUser, saveAuthUser } from "@/lib/auth";
import { signInWithGoogleNative, signOutGoogle } from "@/lib/googleAuth";
import type { AuthUser } from "@/types/auth";

interface AuthContextState {
  user: AuthUser | null;
  loading: boolean;
  signInWithEmail: (email: string, name?: string) => Promise<AuthUser>;
  /**
   * Opens the native Google account picker and signs in via Firebase.
   *
   * Returns the signed-in user, or `null` if the user cancelled.
   * Throws an `Error` (with a `.message` safe to display) on failure.
   */
  signInWithGoogle: () => Promise<AuthUser | null>;
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

  const signInWithGoogle = useCallback(async () => {
    // signInWithGoogleNative returns null when user cancels, throws on error
    const googleUser = await signInWithGoogleNative();
    if (!googleUser) return null;
    return persistUser(googleUser);
  }, [persistUser]);

  const signOut = useCallback(async () => {
    await clearAuthUser();
    setUser(null);
    // Sign out from Google + Firebase in the background (best-effort)
    signOutGoogle().catch(() => {});
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
