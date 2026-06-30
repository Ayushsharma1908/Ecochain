import React from 'react';
import { Pressable, View, type ViewProps, type ViewStyle } from 'react-native';
import { Radius, Shadow, Space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
  tint?: string;
  borderAccent?: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}

/** A soft, rounded surface — the base building block for almost every screen. */
export function Card({ elevated = true, padded = true, tint, borderAccent, onPress, style, children, ...rest }: CardProps) {
  const theme = useTheme();

  const baseStyle = [
    {
      backgroundColor: tint ?? theme.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      padding: padded ? Space.lg : 0,
    },
    borderAccent ? { borderLeftWidth: 4, borderLeftColor: borderAccent } : null,
    elevated ? Shadow.sm : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...baseStyle, { opacity: pressed ? 0.88 : 1 }]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={baseStyle} {...rest}>
      {children}
    </View>
  );
}
