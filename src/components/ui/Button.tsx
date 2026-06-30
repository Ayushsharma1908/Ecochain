import React from 'react';
import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import type { LucideIcon } from 'lucide-react-native';
import { Radius, Shadow, Space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonAccent = 'tint' | 'teal' | 'gold' | 'clay' | 'lichen';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  accent?: ButtonAccent;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const SIZE_MAP: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number; iconSize: number }> = {
  sm: { paddingV: 8, paddingH: 14, fontSize: 13, iconSize: 16 },
  md: { paddingV: 13, paddingH: 20, fontSize: 15, iconSize: 18 },
  lg: { paddingV: 17, paddingH: 26, fontSize: 16, iconSize: 20 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  accent = 'tint',
  icon: Icon,
  iconPosition = 'left',
  disabled,
  loading,
  fullWidth,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const dims = SIZE_MAP[size];
  const accentColor = accent === 'tint' ? theme.tint : theme[accent];

  let backgroundColor = 'transparent';
  let borderColor = 'transparent';
  let textColor = theme.text;
  let shadow = {};

  switch (variant) {
    case 'primary':
      backgroundColor = accentColor;
      textColor = theme.onCanopy;
      shadow = Shadow.sm;
      break;
    case 'secondary':
      backgroundColor = theme.canopy;
      textColor = theme.onCanopy;
      shadow = Shadow.sm;
      break;
    case 'outline':
      borderColor = theme.borderStrong;
      textColor = theme.text;
      break;
    case 'soft':
      backgroundColor = `${accentColor}22`;
      textColor = accentColor;
      break;
    case 'ghost':
      textColor = accentColor;
      break;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Space.sm,
          paddingVertical: dims.paddingV,
          paddingHorizontal: dims.paddingH,
          borderRadius: Radius.pill,
          backgroundColor,
          borderWidth: variant === 'outline' ? 1.3 : 0,
          borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        shadow,
        style,
      ]}
    >
      <MotiView
        from={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'timing', duration: 180 }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: Space.sm }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            {Icon && iconPosition === 'left' ? <Icon size={dims.iconSize} color={textColor} strokeWidth={2} /> : null}
            <Text variant="button" color={textColor} style={{ fontSize: dims.fontSize }}>
              {label}
            </Text>
            {Icon && iconPosition === 'right' ? <Icon size={dims.iconSize} color={textColor} strokeWidth={2} /> : null}
          </>
        )}
      </MotiView>
    </Pressable>
  );
}

/** A small circular icon-only button (used for back/close affordances). */
export function IconButton({
  icon: Icon,
  onPress,
  accent = 'tint',
  size = 40,
}: {
  icon: LucideIcon;
  onPress?: () => void;
  accent?: ButtonAccent;
  size?: number;
}) {
  const theme = useTheme();
  const accentColor = accent === 'tint' ? theme.tint : theme[accent];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.card,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
        },
        Shadow.sm,
      ]}
    >
      <View>
        <Icon size={size * 0.46} color={accentColor} strokeWidth={2} />
      </View>
    </Pressable>
  );
}
