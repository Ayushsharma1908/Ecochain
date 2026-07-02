import { Radius, Shadow, Space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import React from "react";
import { Pressable, View, type ViewProps, type ViewStyle } from "react-native";

export interface CardProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
  tint?: string;
  borderAccent?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

/** A soft, rounded surface — the base building block for almost every screen. */
export function Card({
  elevated = true,
  padded = true,
  tint,
  borderAccent,
  onPress,
  disabled,
  style,
  children,
  ...rest
}: CardProps) {
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
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          ...baseStyle,
          { opacity: disabled ? 0.5 : pressed ? 0.88 : 1 },
        ]}
      >
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
