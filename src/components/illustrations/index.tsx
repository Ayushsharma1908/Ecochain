import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';

/**
 * Custom illustrations, drawn in-house to match the EcoChain Link brand
 * (the same minimal line-art language as the concept documentation).
 *
 * To use real Magnific (https://www.magnific.com/illustrations) artwork
 * instead: download an SVG from Magnific under your account's license,
 * drop the file in `assets/illustrations/`, and swap the relevant
 * component below for an <Image source={require('...')} /> or an
 * `react-native-svg-transformer`-imported component. Everywhere these
 * components are used (EmptyState, Home, Scan) stays unchanged.
 */

export function ScanIllustration({ size = 160 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx="100" cy="100" r="92" fill={theme.lichenSoft} opacity={0.5} />
        <Rect x="55" y="48" width="90" height="104" rx="14" fill={theme.card} stroke={theme.border} strokeWidth="2" />
        <Path d="M64 64V52a6 6 0 0 1 6-6h12" stroke={theme.teal} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Path d="M136 64V52a6 6 0 0 0-6-6h-12" stroke={theme.teal} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Path d="M64 136v12a6 6 0 0 0 6 6h12" stroke={theme.teal} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Path d="M136 136v12a6 6 0 0 1-6 6h-12" stroke={theme.teal} strokeWidth="4" fill="none" strokeLinecap="round" />
        <G stroke={theme.text} strokeWidth="5" strokeLinecap="round">
          <Path d="M76 84v32" />
          <Path d="M88 84v32" strokeWidth="9" />
          <Path d="M101 84v32" />
          <Path d="M114 84v32" strokeWidth="9" />
          <Path d="M127 84v32" />
        </G>
        <Circle cx="150" cy="58" r="14" fill={theme.gold} />
        <Path d="M150 51l2.6 6.4 6.4 2.6-6.4 2.6-2.6 6.4-2.6-6.4-6.4-2.6 6.4-2.6z" fill="#fff" opacity={0.9} />
      </Svg>
    </View>
  );
}

export function MapPinIllustration({ size = 160 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx="100" cy="100" r="92" fill={theme.tealSoft} opacity={0.5} />
        <Circle cx="100" cy="95" r="46" stroke={theme.teal} strokeWidth="2" fill="none" opacity={0.4} />
        <Circle cx="100" cy="95" r="64" stroke={theme.teal} strokeWidth="2" fill="none" opacity={0.25} />
        <Path
          d="M100 150s38-40 38-68a38 38 0 0 0-76 0c0 28 38 68 38 68z"
          fill={theme.clay}
        />
        <Circle cx="100" cy="82" r="14" fill={theme.card} />
      </Svg>
    </View>
  );
}

export function SuccessIllustration({ size = 160 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx="100" cy="100" r="92" fill={theme.lichenSoft} opacity={0.55} />
        <Circle cx="100" cy="100" r="56" fill={theme.lichen} />
        <Path
          d="M78 101l14 14 30-30"
          stroke="#FFFFFF"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path d="M52 56c10-2 16 4 14 14" stroke={theme.gold} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Path d="M150 146c-10 2-16-4-14-14" stroke={theme.clay} strokeWidth="4" fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

export function EmptyBoxIllustration({ size = 160 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx="100" cy="100" r="92" fill={theme.claySoft} opacity={0.45} />
        <Path d="M52 86l48-24 48 24-48 24z" fill={theme.card} stroke={theme.border} strokeWidth="2" />
        <Path d="M52 86v46l48 24v-46z" fill={theme.cardAlt} stroke={theme.border} strokeWidth="2" />
        <Path d="M148 86v46l-48 24v-46z" fill={theme.card} stroke={theme.border} strokeWidth="2" />
        <Path d="M76 74l48 24" stroke={theme.border} strokeWidth="2" />
      </Svg>
    </View>
  );
}

export type IllustrationName = 'scan' | 'map' | 'success' | 'empty';

export function Illustration({ name, size }: { name: IllustrationName; size?: number }) {
  switch (name) {
    case 'scan':
      return <ScanIllustration size={size} />;
    case 'map':
      return <MapPinIllustration size={size} />;
    case 'success':
      return <SuccessIllustration size={size} />;
    case 'empty':
    default:
      return <EmptyBoxIllustration size={size} />;
  }
}
