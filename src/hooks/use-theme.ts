
import { useMemo } from 'react';
import { Colors, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme(): ThemeColors & { scheme: 'light' | 'dark' } {
  const scheme = useColorScheme();
  const resolved = scheme === 'dark' ? 'dark' : 'light';

  return useMemo(() => ({ ...Colors[resolved], scheme: resolved }), [resolved]);
}
