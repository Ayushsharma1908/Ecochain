/**
 * EcoChain Link — design tokens.
 *
 * Single source of truth for color, type, spacing and elevation.
 * Mirrors the brand built for the EcoChain Link concept documentation:
 * paper/canopy surfaces, four accent hues (teal / gold / clay / lichen),
 * Fraunces for display type, Archivo for UI text, JetBrains Mono for data.
 */
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Accent palette — stable across light & dark, these ARE the brand.
// ---------------------------------------------------------------------------
export const Accent = {
  teal: '#1F7A78',
  tealDark: '#134F4E',
  tealSoft: '#D6E6E3',
  gold: '#D79A32',
  goldDark: '#A8721C',
  goldSoft: '#F2E3C2',
  clay: '#BD5B38',
  clayDark: '#8C3F26',
  claySoft: '#F0DCCF',
  lichen: '#5FA646',
  lichenDark: '#3D7A2D',
  lichenSoft: '#DCE9D2',
} as const;

// ---------------------------------------------------------------------------
// Surfaces — light is "paper", dark is "canopy". Same brand, two times of day.
// ---------------------------------------------------------------------------
export interface ThemeColors {
  background: string;
  backgroundAlt: string;
  card: string;
  cardAlt: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  canopy: string;
  canopyAlt: string;
  onCanopy: string;
  tint: string;
  teal: string;
  tealDark: string;
  tealSoft: string;
  gold: string;
  goldDark: string;
  goldSoft: string;
  clay: string;
  clayDark: string;
  claySoft: string;
  lichen: string;
  lichenDark: string;
  lichenSoft: string;
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#ECE6D3',
    backgroundAlt: '#E1DABF',
    card: '#F8F4E6',
    cardAlt: '#F2ECD9',
    border: '#D8CFAF',
    borderStrong: '#C7BC97',
    text: '#16241B',
    textSecondary: '#3C4A3F',
    textMuted: '#8A8568',
    canopy: '#152D26',
    canopyAlt: '#1E4438',
    onCanopy: '#F8F4E6',
    tint: Accent.lichenDark,
    ...Accent,
  },
  dark: {
    background: '#13261F',
    backgroundAlt: '#1A3A30',
    card: '#1E4438',
    cardAlt: '#234A3C',
    border: '#2F5747',
    borderStrong: '#3C6A57',
    text: '#F2EEDF',
    textSecondary: '#C7D6CB',
    textMuted: '#7E9686',
    canopy: '#0F1F19',
    canopyAlt: '#1A3A30',
    onCanopy: '#F8F4E6',
    tint: Accent.lichen,
    ...Accent,
  },
};

export type ThemeName = keyof typeof Colors;
export type ThemeColorKey = keyof ThemeColors;

// ---------------------------------------------------------------------------
// Typography — Fraunces (display) · Archivo (UI) · JetBrains Mono (data)
// ---------------------------------------------------------------------------
export const FontFamily = {
  displayBlack: 'Fraunces_900Black',
  displaySemiBold: 'Fraunces_600SemiBold',
  displayMedium: 'Fraunces_500Medium',
  displayItalic: 'Fraunces_500Medium_Italic',
  body: 'Archivo_400Regular',
  bodyMedium: 'Archivo_500Medium',
  bodySemiBold: 'Archivo_600SemiBold',
  bodyBold: 'Archivo_700Bold',
  bodyExtraBold: 'Archivo_800ExtraBold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const FontsToLoad = {
  Fraunces_900Black: require('@expo-google-fonts/fraunces/900Black/Fraunces_900Black.ttf'),
  Fraunces_600SemiBold: require('@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf'),
  Fraunces_500Medium: require('@expo-google-fonts/fraunces/500Medium/Fraunces_500Medium.ttf'),
  Fraunces_500Medium_Italic: require('@expo-google-fonts/fraunces/500Medium_Italic/Fraunces_500Medium_Italic.ttf'),
  Archivo_400Regular: require('@expo-google-fonts/archivo/400Regular/Archivo_400Regular.ttf'),
  Archivo_500Medium: require('@expo-google-fonts/archivo/500Medium/Archivo_500Medium.ttf'),
  Archivo_600SemiBold: require('@expo-google-fonts/archivo/600SemiBold/Archivo_600SemiBold.ttf'),
  Archivo_700Bold: require('@expo-google-fonts/archivo/700Bold/Archivo_700Bold.ttf'),
  Archivo_800ExtraBold: require('@expo-google-fonts/archivo/800ExtraBold/Archivo_800ExtraBold.ttf'),
  JetBrainsMono_500Medium: require('@expo-google-fonts/jetbrains-mono/500Medium/JetBrainsMono_500Medium.ttf'),
  JetBrainsMono_700Bold: require('@expo-google-fonts/jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf'),
};

export const Type = {
  display: { fontFamily: FontFamily.displayBlack, fontSize: 34, lineHeight: 38 },
  displaySm: { fontFamily: FontFamily.displayBlack, fontSize: 24, lineHeight: 28 },
  h1: { fontFamily: FontFamily.displaySemiBold, fontSize: 22, lineHeight: 27 },
  h2: { fontFamily: FontFamily.displaySemiBold, fontSize: 18, lineHeight: 23 },
  italic: { fontFamily: FontFamily.displayItalic, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: FontFamily.body, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: FontFamily.body, fontSize: 13, lineHeight: 19 },
  label: { fontFamily: FontFamily.bodyExtraBold, fontSize: 11, lineHeight: 14, letterSpacing: 1.1 },
  button: { fontFamily: FontFamily.bodySemiBold, fontSize: 15, lineHeight: 18 },
  mono: { fontFamily: FontFamily.mono, fontSize: 12, lineHeight: 16 },
  monoSm: { fontFamily: FontFamily.mono, fontSize: 10.5, lineHeight: 14 },
} as const;

// ---------------------------------------------------------------------------
// Spacing & radii
// ---------------------------------------------------------------------------
export const Space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32, '4xl': 40 } as const;

export const Radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;

// ---------------------------------------------------------------------------
// Drop shadows — soft, warm, consistent. iOS uses shadow*, Android elevation.
// ---------------------------------------------------------------------------
export const Shadow = Platform.select({
  ios: {
    sm: { shadowColor: '#16241B', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    md: { shadowColor: '#16241B', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
    lg: { shadowColor: '#16241B', shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
  },
  android: {
    sm: { elevation: 2 },
    md: { elevation: 6 },
    lg: { elevation: 12 },
  },
  default: {
    sm: { shadowColor: '#16241B', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    md: { shadowColor: '#16241B', shadowOpacity: 0.12, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
    lg: { shadowColor: '#16241B', shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
  },
})!;
