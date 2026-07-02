import {
  addScanRecord,
  clearScanHistory,
  loadScanHistory,
} from "@/lib/storage";
import type { ScanRecord } from "@/types/domain";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface DashboardStats {
  totalScans: number;
  recyclableShare: number; // 0–1
  estimatedKgCo2Avoided: number;
  recyclableCount: number;
  averageScore: number;
  last7Days: { date: string; scans: number }[];
}

interface ScanHistoryState {
  /** All scan records, newest first. */
  history: ScanRecord[];
  /** True while loading from storage on mount. */
  loading: boolean;
  /** Storage load error, if any. */
  error: string | null;
  /** Pre-computed dashboard stats derived from history. */
  stats: DashboardStats;
  /** Add a new scan record to storage and update state. */
  addScan: (record: ScanRecord) => Promise<void>;
  /** Clear all scan history from storage and state. */
  clearHistory: () => Promise<void>;
  /** Reload history from storage. */
  refresh: () => Promise<void>;
  /** Look up a scan record by barcode. Returns the most recent match. */
  getScanByBarcode: (barcode: string) => ScanRecord | undefined;
  /** Check if a barcode has been scanned before. */
  isScanned: (barcode: string) => boolean;
}

const EMPTY_STATS: DashboardStats = {
  totalScans: 0,
  recyclableShare: 0,
  estimatedKgCo2Avoided: 0,
  recyclableCount: 0,
  averageScore: 0,
  last7Days: [],
};

const ScanHistoryCtx = createContext<ScanHistoryState | null>(null);

// ─── Stats computation ───────────────────────────────────────

function computeStats(history: ScanRecord[]): DashboardStats {
  if (history.length === 0) return EMPTY_STATS;

  const totalScans = history.length;
  const recyclable = history.filter((h) => h.recyclable);
  const recyclableShare = recyclable.length / totalScans;

  const estimatedKgCo2Avoided =
    Math.round(
      history.reduce(
        (sum, h) => sum + h.estimatedKgCo2 * (h.scoreTotal / 100),
        0,
      ) * 10,
    ) / 10;

  const averageScore = Math.round(
    history.reduce((sum, h) => sum + h.scoreTotal, 0) / totalScans,
  );

  // Last 7 days — build once, count efficiently
  const now = new Date();
  const last7Days: { date: string; scans: number }[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    let count = 0;
    for (let j = 0; j < history.length; j += 1) {
      if (history[j].scannedAt.slice(0, 10) === key) count += 1;
    }
    last7Days.push({ date: key, scans: count });
  }

  return {
    totalScans,
    recyclableShare,
    estimatedKgCo2Avoided,
    recyclableCount: recyclable.length,
    averageScore,
    last7Days,
  };
}

// ─── Barcode index ───────────────────────────────────────────

function buildBarcodeIndex(history: ScanRecord[]) {
  const map = new Map<string, ScanRecord>();
  for (const record of history) {
    // First match wins — history is newest-first,
    // so this stores the most recent scan per barcode
    if (!map.has(record.barcode)) {
      map.set(record.barcode, record);
    }
  }
  return map;
}

// ─── Provider ────────────────────────────────────────────────

export function ScanHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const h = await loadScanHistory();
      setHistory(h);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load scan history");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    load();
  }, [load]);

  const addScan = useCallback(async (record: ScanRecord) => {
    try {
      const next = await addScanRecord(record);
      setHistory(next);
    } catch (e: any) {
      // Don't clear history on add failure — keep existing state
      console.warn("[ScanHistory] Failed to save scan:", e?.message);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await clearScanHistory();
      setHistory([]);
    } catch (e: any) {
      console.warn("[ScanHistory] Failed to clear history:", e?.message);
    }
  }, []);

  // Derived data — memoized
  const stats = useMemo(() => computeStats(history), [history]);
  const barcodeIndex = useMemo(() => buildBarcodeIndex(history), [history]);

  const getScanByBarcode = useCallback(
    (barcode: string): ScanRecord | undefined => barcodeIndex.get(barcode),
    [barcodeIndex],
  );

  const isScanned = useCallback(
    (barcode: string): boolean => barcodeIndex.has(barcode),
    [barcodeIndex],
  );

  const value = useMemo<ScanHistoryState>(
    () => ({
      history,
      loading,
      error,
      stats,
      addScan,
      clearHistory,
      refresh: load,
      getScanByBarcode,
      isScanned,
    }),
    [
      history,
      loading,
      error,
      stats,
      addScan,
      clearHistory,
      load,
      getScanByBarcode,
      isScanned,
    ],
  );

  return (
    <ScanHistoryCtx.Provider value={value}>{children}</ScanHistoryCtx.Provider>
  );
}

// ─── Hooks ───────────────────────────────────────────────────

/**
 * Access scan history. Throws if used outside ScanHistoryProvider.
 */
export function useScanHistory(): ScanHistoryState {
  const ctx = useContext(ScanHistoryCtx);
  if (!ctx) {
    throw new Error("useScanHistory must be used within a ScanHistoryProvider");
  }
  return ctx;
}

/**
 * Access scan history without throwing. Returns null if outside the provider.
 */
export function useScanHistorySafe(): ScanHistoryState | null {
  return useContext(ScanHistoryCtx);
}
