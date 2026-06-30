import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScanRecord } from '@/types/domain';

const STORAGE_KEY = 'ecochain.scanHistory.v1';

export async function loadScanHistory(): Promise<ScanRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScanRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveScanHistory(history: ScanRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Best-effort persistence — a failed write shouldn't crash the scan flow.
  }
}

export async function addScanRecord(record: ScanRecord): Promise<ScanRecord[]> {
  const current = await loadScanHistory();
  const next = [record, ...current].slice(0, 200);
  await saveScanHistory(next);
  return next;
}

export async function clearScanHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
