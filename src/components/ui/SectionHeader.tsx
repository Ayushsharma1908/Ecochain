import React from 'react';
import { View } from 'react-native';
import { Space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/Text';

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  accent,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: Space.lg }}>
      <Text variant="label" color={accent ?? theme.tint} style={{ textTransform: 'uppercase' }}>
        {eyebrow}
      </Text>
      <Text variant="displaySm" style={{ marginTop: 6 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodySm" color={theme.textSecondary} style={{ marginTop: 6, maxWidth: 320 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
