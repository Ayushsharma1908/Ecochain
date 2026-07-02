import { FontFamily, Type } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import React from "react";
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";

export type TextVariant = keyof typeof Type;

type TextAlign = "left" | "center" | "right";

type FontFamilyKey = keyof typeof FontFamily;

export interface TextProps extends RNTextProps {
  /**
   * Typography variant — maps to the Type scale in theme.ts.
   *
   * Display:  display, displaySm
   * Heading:  h1, h2
   * Body:     body, bodySm, italic, caption
   * Label:    label
   * Button:   button, buttonLg
   * Mono:     mono, monoSm
   */
  variant?: TextVariant;

  /** Overrides the default text color. Falls back to theme.text. */
  color?: string;

  /**
   * Text alignment shorthand.
   * - true → 'center' (backward compatible)
   * - 'left' | 'center' | 'right' → explicit alignment
   */
  align?: TextAlign | boolean;

  /** Overrides the font weight without changing the variant. */
  weight?: FontFamilyKey;
}

/**
 * Themed text — picks up brand typography (Fraunces / Archivo / JetBrains
 * Mono) by variant name, and defaults to the theme's primary text color.
 */
export function Text({
  variant = "body",
  color,
  align,
  weight,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const base = Type[variant] as TextStyle;
  const computedColor = color ?? theme.text;

  // Resolve alignment
  let textAlign: TextStyle["textAlign"] | undefined;
  if (align === true) textAlign = "center";
  else if (align === "left") textAlign = "left";
  else if (align === "right") textAlign = "right";
  else if (align === "center") textAlign = "center";

  // Resolve font weight override
  const weightOverride: TextStyle | undefined = weight
    ? { fontFamily: FontFamily[weight] }
    : undefined;

  return (
    <RNText
      style={[
        base,
        { color: computedColor },
        textAlign ? { textAlign } : null,
        weightOverride,
        style,
      ]}
      {...rest}
    />
  );
}
