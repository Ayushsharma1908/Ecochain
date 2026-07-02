import { Text } from "@/components/ui/Text";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { LucideIcon } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  type ViewStyle,
} from "react-native";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "soft";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonAccent = "tint" | "teal" | "gold" | "clay" | "lichen";

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  accent?: ButtonAccent;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

// ─── Size config ───
const SIZE_MAP: Record<
  ButtonSize,
  {
    paddingV: number;
    paddingH: number;
    fontFamily: string;
    fontSize: number;
    iconSize: number;
  }
> = {
  sm: {
    paddingV: Space.sm + 2,
    paddingH: Space.lg,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 13,
    iconSize: 15,
  },
  md: {
    paddingV: Space.md + 4,
    paddingH: Space.xl,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 15,
    iconSize: 17,
  },
  lg: {
    paddingV: Space.lg + 2,
    paddingH: Space["2xl"],
    fontFamily: "Archivo_600SemiBold",
    fontSize: 17,
    iconSize: 19,
  },
};

// ─── Button ───
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  accent = "tint",
  icon: Icon,
  iconPosition = "left",
  disabled,
  loading,
  fullWidth,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const dims = SIZE_MAP[size];

  // Resolve accent color — leaf green (#629D3C) is the primary CTA color
  const accentColor = accent === "tint" ? theme.lichen : theme[accent];

  let backgroundColor: string;
  let borderColor: string;
  let textColor: string;
  let useShadow = false;

  switch (variant) {
    case "primary":
      // Leaf green primary — vibrant and on-brand
      backgroundColor = theme.lichen;
      borderColor = "transparent";
      textColor = "#FFFFFF";
      useShadow = true;
      break;

    case "secondary":
      // Dark forest green secondary
      backgroundColor = theme.lichenDark;
      borderColor = "transparent";
      textColor = "#FFFFFF";
      useShadow = true;
      break;

    case "outline":
      backgroundColor = "transparent";
      borderColor = theme.lichen;
      textColor = theme.lichenDark;
      break;

    case "soft":
      backgroundColor = theme.lichenMuted;
      borderColor = "transparent";
      textColor = theme.lichenDark;
      break;

    case "ghost":
    default:
      backgroundColor = "transparent";
      borderColor = "transparent";
      textColor = accentColor;
      break;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: Space.sm,
          paddingVertical: dims.paddingV,
          paddingHorizontal: dims.paddingH,
          borderRadius: Radius.pill,
          backgroundColor,
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        useShadow ? Shadow.md : undefined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon size={dims.iconSize} color={textColor} strokeWidth={2.2} />
          )}
          <Text variant={size === "lg" ? "buttonLg" : "button"} color={textColor}>
            {label}
          </Text>
          {Icon && iconPosition === "right" && (
            <Icon size={dims.iconSize} color={textColor} strokeWidth={2.2} />
          )}
        </>
      )}
    </Pressable>
  );
}

// ─── IconButton ───
export function IconButton({
  icon: Icon,
  onPress,
  accent = "tint",
  size = 40,
}: {
  icon: LucideIcon;
  onPress?: () => void;
  accent?: ButtonAccent;
  size?: number;
}) {
  const theme = useTheme();
  const accentColor = accent === "tint" ? theme.lichen : theme[accent];

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed ? theme.lichenMuted : "transparent",
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon size={Math.round(size * 0.5)} color={accentColor} strokeWidth={2} />
    </Pressable>
  );
}
