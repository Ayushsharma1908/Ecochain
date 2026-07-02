/**
 * EcoChain Link — v3 Premium Beige × Forest Green Design System
 *
 * Primary palette (from logo):
 *   Dark Forest Green  #165E39
 *   Fresh Leaf Green   #629D3C
 *   Soft Beige         #FDF5E4
 */
import { Platform } from "react-native";

// ---------------------------------------------------------------------------
// Accent palette — forest-green leads, leaf-green CTAs, gold rewards.
// ---------------------------------------------------------------------------
export const Accent = {
  // LICHEN — fresh leaf green (logo leaf, CTAs)
  lichen: "#629D3C",
  lichenDark: "#165E39",
  lichenLight: "#7EC24A",
  lichenSoft: "#E8F5DF",
  lichenMuted: "#F0FAE8",

  // FOREST — deep forest green (cards, canopy)
  forest: "#165E39",
  forestAlt: "#1A7046",
  forestLight: "#1E8A55",

  // TEAL — secondary (trust, water)
  teal: "#1A8A7A",
  tealDark: "#126057",
  tealSoft: "#D6F0EC",

  // GOLD — CTA / achievement / reward
  gold: "#D4952A",
  goldDark: "#B07A1E",
  goldSoft: "#F7EDDA",

  // CLAY — warning / warm accent
  clay: "#C05B3A",
  clayDark: "#964329",
  claySoft: "#F5E2D8",
} as const;

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------
export interface ThemeColors {
  // Surfaces
  background: string;
  backgroundAlt: string;
  card: string;
  cardAlt: string;
  cardElevated: string;
  cardSurface: string; // beige-tinted surface for score gauge, etc.

  // Borders
  border: string;
  borderLight: string;
  borderStrong: string;
  cardBorder: string; // subtle white border on dark green cards

  // Text — background context
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Text — on dark green cards
  cardText: string;
  cardTextSecondary: string;
  cardTextMuted: string;

  // Canopy / hero areas
  canopy: string;
  canopyAlt: string;
  onCanopy: string;

  // Semantic
  tint: string;
  success: string;
  warning: string;
  error: string;

  // Brand accents (spread from Accent)
  lichen: string;
  lichenDark: string;
  lichenLight: string;
  lichenSoft: string;
  lichenMuted: string;
  forest: string;
  forestAlt: string;
  forestLight: string;
  teal: string;
  tealDark: string;
  tealSoft: string;
  gold: string;
  goldDark: string;
  goldSoft: string;
  clay: string;
  clayDark: string;
  claySoft: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    // Surfaces — warm beige base, dark forest green cards
    background: "#FDF5E4",      // soft beige (brand bg)
    backgroundAlt: "#F7EDD6",   // slightly deeper beige
    card: "#165E39",            // dark forest green cards
    cardAlt: "#1A7046",         // hover state for dark green cards
    cardElevated: "#1E8A55",    // elevated forest green
    cardSurface: "#FFFDF5",     // near-white beige for gauge/chart cards

    // Borders — green-tinted on beige, white-tinted on cards
    border: "#C8D9B8",
    borderLight: "#DFE8D2",
    borderStrong: "#A8C490",
    cardBorder: "rgba(255,255,255,0.18)",

    // Text on beige background
    text: "#1A2B1E",
    textSecondary: "#3D5243",
    textMuted: "#7A8F72",
    textInverse: "#FDF5E4",

    // Text on dark green cards
    cardText: "#FFFFFF",
    cardTextSecondary: "rgba(255,255,255,0.82)",
    cardTextMuted: "rgba(255,255,255,0.55)",

    // Canopy — deep forest (for hero CTA)
    canopy: "#165E39",
    canopyAlt: "#1A7046",
    onCanopy: "#FDF5E4",

    // Semantic
    tint: Accent.lichen,
    success: Accent.lichen,
    warning: Accent.gold,
    error: Accent.clay,

    // Brand accents
    ...Accent,
  },

  dark: {
    // Surfaces — rich layered forest greens
    background: "#0F1F17",
    backgroundAlt: "#152A1F",
    card: "#1A3326",
    cardAlt: "#1F3B2D",
    cardElevated: "#234233",
    cardSurface: "#1A3326",

    // Borders
    border: "#2A4A38",
    borderLight: "#1F3B2D",
    borderStrong: "#3A6050",
    cardBorder: "rgba(255,255,255,0.10)",

    // Text on dark background
    text: "#EDF2E8",
    textSecondary: "#B8CCB0",
    textMuted: "#6B8A6B",
    textInverse: "#0F1F17",

    // Text on dark green cards (similar in dark mode)
    cardText: "#EDF2E8",
    cardTextSecondary: "rgba(237,242,232,0.80)",
    cardTextMuted: "rgba(237,242,232,0.50)",

    // Canopy
    canopy: "#0A170F",
    canopyAlt: "#142B1E",
    onCanopy: "#EDF2E8",

    // Semantic
    tint: Accent.lichenLight,
    success: Accent.lichenLight,
    warning: Accent.gold,
    error: Accent.clay,

    // Brand accents
    ...Accent,
  },
};

export type ThemeName = keyof typeof Colors;
export type ThemeColorKey = keyof ThemeColors;

// ---------------------------------------------------------------------------
// Typography — Fraunces (display) · Archivo (UI) · JetBrains Mono (data)
// ---------------------------------------------------------------------------
export const FontFamily = {
  displayBlack: "Fraunces_900Black",
  displaySemiBold: "Fraunces_600SemiBold",
  displayMedium: "Fraunces_500Medium",
  displayItalic: "Fraunces_500Medium_Italic",
  body: "Archivo_400Regular",
  bodyMedium: "Archivo_500Medium",
  bodySemiBold: "Archivo_600SemiBold",
  bodyBold: "Archivo_700Bold",
  bodyExtraBold: "Archivo_800ExtraBold",
  mono: "JetBrainsMono_500Medium",
  monoBold: "JetBrainsMono_700Bold",
} as const;

export const FontsToLoad = {
  Fraunces_900Black: require("@expo-google-fonts/fraunces/900Black/Fraunces_900Black.ttf"),
  Fraunces_600SemiBold: require("@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf"),
  Fraunces_500Medium: require("@expo-google-fonts/fraunces/500Medium/Fraunces_500Medium.ttf"),
  Fraunces_500Medium_Italic: require("@expo-google-fonts/fraunces/500Medium_Italic/Fraunces_500Medium_Italic.ttf"),
  Archivo_400Regular: require("@expo-google-fonts/archivo/400Regular/Archivo_400Regular.ttf"),
  Archivo_500Medium: require("@expo-google-fonts/archivo/500Medium/Archivo_500Medium.ttf"),
  Archivo_600SemiBold: require("@expo-google-fonts/archivo/600SemiBold/Archivo_600SemiBold.ttf"),
  Archivo_700Bold: require("@expo-google-fonts/archivo/700Bold/Archivo_700Bold.ttf"),
  Archivo_800ExtraBold: require("@expo-google-fonts/archivo/800ExtraBold/Archivo_800ExtraBold.ttf"),
  JetBrainsMono_500Medium: require("@expo-google-fonts/jetbrains-mono/500Medium/JetBrainsMono_500Medium.ttf"),
  JetBrainsMono_700Bold: require("@expo-google-fonts/jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf"),
};

// ---------------------------------------------------------------------------
// Type scale
// ---------------------------------------------------------------------------
export const Type = {
  display: {
    fontFamily: FontFamily.displayBlack,
    fontSize: 32,
    lineHeight: 38,
  },
  displaySm: {
    fontFamily: FontFamily.displayBlack,
    fontSize: 22,
    lineHeight: 28,
  },
  h1: { fontFamily: FontFamily.displaySemiBold, fontSize: 20, lineHeight: 26 },
  h2: { fontFamily: FontFamily.displaySemiBold, fontSize: 17, lineHeight: 22 },
  italic: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 16,
    lineHeight: 22,
  },
  body: { fontFamily: FontFamily.body, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: FontFamily.body, fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: FontFamily.bodyMedium, fontSize: 12, lineHeight: 16 },
  label: {
    fontFamily: FontFamily.bodyExtraBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
  button: { fontFamily: FontFamily.bodySemiBold, fontSize: 15, lineHeight: 18 },
  buttonLg: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 17,
    lineHeight: 20,
  },
  mono: { fontFamily: FontFamily.mono, fontSize: 12, lineHeight: 16 },
  monoSm: { fontFamily: FontFamily.mono, fontSize: 10.5, lineHeight: 14 },
} as const;

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------
export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 56,
  "6xl": 72,
} as const;

// ---------------------------------------------------------------------------
// Radii
// ---------------------------------------------------------------------------
export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  "2xl": 36,
  pill: 999,
} as const;

// ---------------------------------------------------------------------------
// Shadows — elevated, premium feel with green-tinted shadow color.
// ---------------------------------------------------------------------------
export const Shadow = Platform.select({
  ios: {
    none: {
      shadowColor: "transparent",
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    },
    sm: {
      shadowColor: "#0D3520",
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    md: {
      shadowColor: "#0D3520",
      shadowOpacity: 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    lg: {
      shadowColor: "#0D3520",
      shadowOpacity: 0.35,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
    },
  },
  android: {
    none: { elevation: 0 },
    sm: { elevation: 4 },
    md: { elevation: 8 },
    lg: { elevation: 16 },
  },
  default: {
    none: {
      shadowColor: "transparent",
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    },
    sm: {
      shadowColor: "#0D3520",
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    md: {
      shadowColor: "#0D3520",
      shadowOpacity: 0.25,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    lg: {
      shadowColor: "#0D3520",
      shadowOpacity: 0.35,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
    },
  },
})!;

// ---------------------------------------------------------------------------
// Animation presets
// ---------------------------------------------------------------------------
export const Motion = {
  fast: 150,
  normal: 250,
  slow: 400,
  gentle: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;
