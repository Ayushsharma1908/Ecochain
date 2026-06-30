import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { Space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/Text';
import { Illustration, type IllustrationName } from '@/components/illustrations';
import { Button, type ButtonProps } from '@/components/ui/Button';

export function EmptyState({
  illustration,
  title,
  subtitle,
  action,
}: {
  illustration: IllustrationName;
  title: string;
  subtitle?: string;
  action?: ButtonProps;
}) {
  const theme = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350 }}
      style={{ alignItems: 'center', paddingVertical: Space['3xl'], paddingHorizontal: Space.xl }}
    >
      <Illustration name={illustration} size={140} />
      <Text variant="h2" center style={{ marginTop: Space.lg }}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodySm" color={theme.textSecondary} center style={{ marginTop: Space.sm, maxWidth: 280 }}>
          {subtitle}
        </Text>
      ) : null}
      {action ? (
        <View style={{ marginTop: Space.lg }}>
          <Button {...action} />
        </View>
      ) : null}
    </MotiView>
  );
}
