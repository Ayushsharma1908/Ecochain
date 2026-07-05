import { router } from "expo-router";
import { useCallback } from "react";

import { useAuth } from "@/context/AuthContext";

export function useAuthGate() {
  const { user, loading } = useAuth();

  const requireAuth = useCallback(
    (next?: () => void, redirect?: string) => {
      if (loading) return;
      if (!user) {
        router.push({ pathname: "/login", params: redirect ? { redirect } : undefined });
        return;
      }
      next?.();
    },
    [loading, user]
  );

  return { user, loading, requireAuth, isAuthenticated: Boolean(user) };
}
