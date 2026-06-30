import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextVariant = keyof typeof Type;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
}

/**
 * Themed text — picks up brand typography (Fraunces / Archivo / JetBrains
 * Mono) by variant name, and defaults to the theme's primary text color.
 */
export function Text({ variant = 'body', color, center, style, ...rest }: TextProps) {
  const theme = useTheme();
  const base = Type[variant] as TextStyle;
  const computedColor = color ?? theme.text;

  return (
    <RNText
      style={[base, { color: computedColor }, center ? { textAlign: 'center' } : null, style]}
      {...rest}
    />
  );
}
