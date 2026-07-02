import { Radius, Shadow, Space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import React from "react";
import { Pressable, View, type ViewProps, type ViewStyle } from "react-native";

export interface CardProps extends ViewProps {
  /** Removes the border entirely. */
  noBorder?: boolean;
  /** Uses a slightly elevated shadow. Default: true */
  elevated?: boolean;
  /** Applies standard internal padding. Default: true */
  padded?: boolean;
  /** Overrides the card background color. */
  tint?: string;
  /** Adds a colored left accent border. */
  borderAccent?: string;
  /** Makes the card pressable with tap feedback. */
  onPress?: () => void;
  /** Disables the press handler and dims the card. */
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

/** A soft, rounded surface — the base building block for almost every screen. */
export function Card({
  noBorder,
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

  const baseStyle: any[] = [
    {
      backgroundColor: tint ?? theme.card,
      borderRadius: Radius.xl,
      borderWidth: noBorder ? 0 : 1,
      borderColor: noBorder ? "transparent" : theme.borderLight,
      padding: padded ? Space.lg : 0,
    },
    borderAccent
      ? {
          borderLeftWidth: 3,
          borderLeftColor: borderAccent,
        }
      : null,
    elevated && !noBorder ? Shadow.sm : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          ...baseStyle,
          {
            backgroundColor:
              pressed && !tint ? theme.cardAlt : (tint ?? theme.card),
            opacity: disabled ? 0.45 : pressed ? 0.92 : 1,
          },
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
