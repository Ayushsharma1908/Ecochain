import type { AdvisorContext } from "@/lib/aiAdvisor";
import React, { createContext, useContext, useMemo, useState } from "react";

// Re-export so consumers don't need to reach into lib/aiAdvisor
export type { AdvisorContext };

interface CurrentContextState {
  /** The current product context, or null if nothing is scanned. */
  context: AdvisorContext | null;
  /** Timestamp (ms) of when context was last set. 0 if never set. */
  setAt: number;
  /** Store a new product context. */
  set: (ctx: AdvisorContext) => void;
  /** Clear the current context (e.g. on navigation away). */
  clear: () => void;
}

const CurrentContextCtx = createContext<CurrentContextState | null>(null);

export function CurrentContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [context, setContext] = useState<AdvisorContext | null>(null);
  const [setAt, setSetAt] = useState<number>(0);

  const set = (ctx: AdvisorContext) => {
    setContext(ctx);
    setSetAt(Date.now());
  };

  const clear = () => {
    setContext(null);
    setSetAt(0);
  };

  const value = useMemo<CurrentContextState>(
    () => ({ context, setAt, set, clear }),
    // set and clear are stable (no deps, no useCallback needed)
    // but we include context and setAt so consumers re-render on change
    [context, setAt],
  );

  return (
    <CurrentContextCtx.Provider value={value}>
      {children}
    </CurrentContextCtx.Provider>
  );
}

/**
 * Access the current scan context.
 *
 * Throws if used outside a CurrentContextProvider.
 */
export function useCurrentContext(): CurrentContextState {
  const ctx = useContext(CurrentContextCtx);
  if (!ctx) {
    throw new Error(
      "useCurrentContext must be used within a CurrentContextProvider",
    );
  }
  return ctx;
}

/**
 * Access the current scan context without throwing.
 * Returns null if used outside a CurrentContextProvider.
 */
export function useCurrentContextSafe(): CurrentContextState | null {
  return useContext(CurrentContextCtx);
}
