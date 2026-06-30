import React from 'react';
import { View } from 'react-native';
import { Radius, Space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/Text';
import type { ScoreBreakdown } from '@/types/domain';

export function FactorBar({ score }: { score: ScoreBreakdown }) {
  const theme = useTheme();

  const segments = [
    { label: 'Base', value: score.base, color: theme.textMuted },
    { label: '+ Label', value: score.labelBonus, color: theme.lichen },
    { label: '− Packaging', value: score.packagingPenalty, color: theme.clay },
    { label: '+ Recycler', value: score.recyclerBonus, color: theme.lichenDark },
  ].filter((s) => s.value > 0);

  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          height: 16,
          borderRadius: Radius.pill,
          overflow: 'hidden',
          backgroundColor: theme.backgroundAlt,
        }}
      >
        {segments.map((s) => (
          <View key={s.label} style={{ flex: s.value / total, backgroundColor: s.color }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Space.md, marginTop: Space.sm }}>
        {segments.map((s) => (
          <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color }} />
            <Text variant="monoSm" color={theme.textSecondary}>
              {s.label} {s.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
