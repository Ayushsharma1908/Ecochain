import type { AdvisorContext } from "@/lib/aiAdvisor_old";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface CurrentContextState {
  context: AdvisorContext | null;
  setContext: (ctx: AdvisorContext) => void;
}

const CurrentContext = createContext<CurrentContextState | null>(null);

export function CurrentContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [context, setContextState] = useState<AdvisorContext | null>(null);
  const setContext = useCallback(
    (ctx: AdvisorContext) => setContextState(ctx),
    [],
  );
  const value = useMemo(() => ({ context, setContext }), [context, setContext]);
  return (
    <CurrentContext.Provider value={value}>{children}</CurrentContext.Provider>
  );
}

export function useCurrentContext(): CurrentContextState {
  const ctx = useContext(CurrentContext);
  if (!ctx)
    throw new Error(
      "useCurrentContext must be used within a CurrentContextProvider",
    );
  return ctx;
}
