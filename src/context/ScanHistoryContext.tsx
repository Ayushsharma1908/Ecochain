import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { addScanRecord, clearScanHistory, loadScanHistory } from '@/lib/storage';
import type { ScanRecord } from '@/types/domain';

interface DashboardStats {
  totalScans: number;
  recyclableShare: number; // 0-1
  estimatedKgCo2Avoided: number;
  recyclableVolumeCount: number;
  averageScore: number;
  last7Days: { date: string; scans: number }[];
}

interface ScanHistoryState {
  history: ScanRecord[];
  loading: boolean;
  stats: DashboardStats;
  addScan: (record: ScanRecord) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const EMPTY_STATS: DashboardStats = {
  totalScans: 0,
  recyclableShare: 0,
  estimatedKgCo2Avoided: 0,
  recyclableVolumeCount: 0,
  averageScore: 0,
  last7Days: [],
};

const ScanHistoryContext = createContext<ScanHistoryState | null>(null);

function computeStats(history: ScanRecord[]): DashboardStats {
  if (history.length === 0) return EMPTY_STATS;

  const totalScans = history.length;
  const recyclable = history.filter((h) => h.recyclable);
  const recyclableShare = recyclable.length / totalScans;
  const estimatedKgCo2Avoided =
    Math.round(history.reduce((sum, h) => sum + h.estimatedKgCo2 * (h.scoreTotal / 100), 0) * 10) / 10;
  const averageScore = Math.round(history.reduce((sum, h) => sum + h.scoreTotal, 0) / totalScans);

  const days: { date: string; scans: number }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = history.filter((h) => h.scannedAt.slice(0, 10) === key).length;
    days.push({ date: key, scans: count });
  }

  return {
    totalScans,
    recyclableShare,
    estimatedKgCo2Avoided,
    recyclableVolumeCount: recyclable.length,
    averageScore,
    last7Days: days,
  };
}

export function ScanHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScanHistory().then((h) => {
      setHistory(h);
      setLoading(false);
    });
  }, []);

  const addScan = useCallback(async (record: ScanRecord) => {
    const next = await addScanRecord(record);
    setHistory(next);
  }, []);

  const clearHistory = useCallback(async () => {
    await clearScanHistory();
    setHistory([]);
  }, []);

  const stats = useMemo(() => computeStats(history), [history]);

  const value = useMemo(
    () => ({ history, loading, stats, addScan, clearHistory }),
    [history, loading, stats, addScan, clearHistory]
  );

  return <ScanHistoryContext.Provider value={value}>{children}</ScanHistoryContext.Provider>;
}

export function useScanHistory(): ScanHistoryState {
  const ctx = useContext(ScanHistoryContext);
  if (!ctx) throw new Error('useScanHistory must be used within a ScanHistoryProvider');
  return ctx;
}
