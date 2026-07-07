import { useTheme } from "@/hooks/use-theme";
import React from "react";
import { View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";


export function ScanIllustration({ size = 160 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Background wash */}
        <Circle
          cx="100"
          cy="100"
          r="92"
          fill={theme.lichenSoft}
          opacity={0.5}
        />

        {/* Decorative leaf accents */}
        <Path
          d="M44 60c4-8 14-8 14 2s-10 6-14-2z"
          fill={theme.lichen}
          opacity={0.2}
        />
        <Path
          d="M152 148c-3 6-11 6-11-1s9-5 11 1z"
          fill={theme.lichenDark}
          opacity={0.15}
        />

        {/* Phone body */}
        <Rect
          x="58"
          y="42"
          width="84"
          height="116"
          rx="14"
          fill={theme.card}
          stroke={theme.border}
          strokeWidth="1.5"
        />

        {/* Screen area */}
        <Rect
          x="64"
          y="54"
          width="72"
          height="92"
          rx="6"
          fill={theme.backgroundAlt}
        />

        {/* Scan corners */}
        <Path
          d="M72 62V58a4 4 0 0 1 4-4h8"
          stroke={theme.teal}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M128 62V58a4 4 0 0 0-4-4h-8"
          stroke={theme.teal}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M72 138v4a4 4 0 0 0 4 4h8"
          stroke={theme.teal}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M128 138v4a4 4 0 0 1-4 4h-8"
          stroke={theme.teal}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Barcode lines */}
        <G
          stroke={theme.text}
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.7}
        >
          <Line x1="80" y1="86" x2="80" y2="118" />
          <Line x1="90" y1="86" x2="90" y2="118" strokeWidth="7" />
          <Line x1="101" y1="86" x2="101" y2="118" />
          <Line x1="112" y1="86" x2="112" y2="118" strokeWidth="7" />
          <Line x1="122" y1="86" x2="122" y2="118" />
        </G>

        {/* Home button */}
        <Circle cx="100" cy="150" r="4" fill={theme.border} />

        {/* Leaf sprouting from top of phone */}
        <Path
          d="M100 42c0-12 8-22 8-22s-18 4-18 18"
          stroke={theme.lichenDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M108 20c0 0-6 8-2 16s12 6 12-2-10-14-10-14z"
          fill={theme.lichen}
          opacity={0.7}
        />
        <Path
          d="M106 22c2 4 2 10 0 14"
          stroke={theme.lichenDark}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity={0.6}
        />

        {/* Small second leaf */}
        <Path
          d="M93 34c-2-4 0-10 4-12s6 4 2 10"
          fill={theme.lichen}
          opacity={0.4}
        />

        {/* Decorative dots */}
        <Circle cx="48" cy="120" r="3" fill={theme.gold} opacity={0.4} />
        <Circle cx="156" cy="70" r="2.5" fill={theme.teal} opacity={0.3} />
        <Circle cx="148" cy="130" r="2" fill={theme.lichen} opacity={0.3} />
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

        <Circle
          cx="100"
          cy="118"
          r="52"
          stroke={theme.teal}
          strokeWidth="1.5"
          fill="none"
          opacity={0.2}
        />
        <Circle
          cx="100"
          cy="118"
          r="68"
          stroke={theme.teal}
          strokeWidth="1"
          fill="none"
          opacity={0.12}
        />
        <Circle
          cx="100"
          cy="118"
          r="82"
          stroke={theme.teal}
          strokeWidth="0.8"
          fill="none"
          opacity={0.06}
        />

        {/* Ground shadow */}
        <Ellipse
          cx="100"
          cy="160"
          rx="28"
          ry="6"
          fill={theme.teal}
          opacity={0.12}
        />

        {/* Pin body */}
        <Path
          d="M100 156s34-36 34-62a34 34 0 0 0-68 0c0 26 34 62 34 62z"
          fill={theme.lichen}
        />
        <Path
          d="M100 156s34-36 34-62a34 34 0 0 0-68 0c0 26 34 62 34 62z"
          fill="none"
          stroke={theme.lichenDark}
          strokeWidth="1.5"
          opacity={0.3}
        />

        {/* Inner circle of pin */}
        <Circle cx="100" cy="94" r="16" fill={theme.card} />
        <Circle cx="100" cy="94" r="10" fill={theme.lichenMuted} />

        {/* Small leaf in the center of pin */}
        <Path
          d="M100 88c0 0 5 4 5 9s-5 5-5 5-5-1-5-5 5-9 5-9z"
          fill={theme.lichenDark}
          opacity={0.6}
        />
        <Line
          x1="100"
          y1="90"
          x2="100"
          y2="100"
          stroke={theme.lichenDark}
          strokeWidth="0.8"
          opacity={0.4}
        />

        {/* Small plant growing from top of pin */}
        <Path
          d="M100 60V48"
          stroke={theme.lichenDark}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M100 48c0 0 6-2 8-8"
          stroke={theme.lichen}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M108 40c0 0-4 6-8 8-4-2-8-8-8-8s6-2 8 0c2 2 8 0 8 0z"
          fill={theme.lichen}
          opacity={0.6}
        />
        <Path
          d="M100 52c0 0-5-1-7-6"
          stroke={theme.lichen}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M93 46c0 0 4 4 7 6 3-2 7-6 7-6s-4-1-7 1-7-1-7-1z"
          fill={theme.lichen}
          opacity={0.35}
        />

        {/* Decorative dots */}
        <Circle cx="46" cy="80" r="3" fill={theme.gold} opacity={0.35} />
        <Circle cx="158" cy="100" r="2.5" fill={theme.lichen} opacity={0.25} />
        <Circle cx="60" cy="140" r="2" fill={theme.teal} opacity={0.2} />
      </Svg>
    </View>
  );
}

// ─── Success Illustration ───
// A sprout emerging from soil with a gentle arc (growth = success)
export function SuccessIllustration({ size = 160 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Background wash */}
        <Circle
          cx="100"
          cy="100"
          r="92"
          fill={theme.lichenSoft}
          opacity={0.55}
        />

        {/* Soil mound */}
        <Path
          d="M40 140c0 0 30-12 60-12s60 12 60 12v20H40z"
          fill={theme.clay}
          opacity={0.3}
        />
        <Path
          d="M50 140c0 0 25-8 50-8s50 8 50 8v14H50z"
          fill={theme.clay}
          opacity={0.2}
        />

        {/* Main stem */}
        <Path
          d="M100 140c0 0 0-30-2-50s-2-32 2-40"
          stroke={theme.lichenDark}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Large leaf — right */}
        <Path
          d="M100 80c0 0 14-4 22-14s2-18-6-16-14 10-16 30z"
          fill={theme.lichen}
          opacity={0.7}
        />
        <Path
          d="M100 80c4-6 12-12 18-16"
          stroke={theme.lichenDark}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity={0.4}
        />

        {/* Large leaf — left */}
        <Path
          d="M98 65c0 0-12-2-20-10s-4-16 4-14 14 8 16 24z"
          fill={theme.lichen}
          opacity={0.5}
        />
        <Path
          d="M98 65c-4-4-10-8-16-12"
          stroke={theme.lichenDark}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity={0.3}
        />

        {/* Small emerging leaf at top */}
        <Path
          d="M102 44c0 0 4-6 8-6s4 6 0 10-8-4-8-4z"
          fill={theme.lichen}
          opacity={0.6}
        />

        {/* Tiny curl at top */}
        <Path
          d="M102 40c0 0-2-6 0-10"
          stroke={theme.lichenDark}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Checkmark arc — gentle, integrated */}
        <Path
          d="M130 56c6 8 10 14 14 22"
          stroke={theme.lichenDark}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity={0.3}
        />
        <Path
          d="M144 78c2 4 6 10 12 6"
          stroke={theme.lichenDark}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity={0.3}
        />

        {/* Decorative small dots — "sparkle" around growth */}
        <Circle cx="134" cy="48" r="3" fill={theme.gold} opacity={0.45} />
        <Circle cx="142" cy="60" r="2" fill={theme.gold} opacity={0.3} />
        <Circle cx="126" cy="40" r="2" fill={theme.lichen} opacity={0.3} />
        <Circle cx="62" cy="60" r="2.5" fill={theme.teal} opacity={0.25} />
        <Circle cx="54" cy="90" r="2" fill={theme.gold} opacity={0.2} />
      </Svg>
    </View>
  );
}

// ─── Empty Illustration ───
// A seed in soil — empty but full of potential
export function EmptyBoxIllustration({ size = 160 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Background wash */}
        <Circle cx="100" cy="100" r="92" fill={theme.claySoft} opacity={0.35} />

        {/* Soil bed */}
        <Path
          d="M30 136c0 0 30-8 70-8s70 8 70 8v28H30z"
          fill={theme.clay}
          opacity={0.25}
        />
        <Path
          d="M36 140c0 0 28-5 64-5s64 5 64 5v20H36z"
          fill={theme.clay}
          opacity={0.18}
        />

        {/* Seed — visible, waiting */}
        <Ellipse
          cx="100"
          cy="130"
          rx="10"
          ry="7"
          fill={theme.clayDark}
          opacity={0.5}
        />
        <Path
          d="M94 128c2-2 6-3 10-2"
          stroke={theme.clay}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity={0.4}
        />

        {/* Tiny sprout — just barely emerging */}
        <Path
          d="M100 124V116"
          stroke={theme.lichen}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.5}
        />
        <Path
          d="M100 116c0 0 3-2 5-1s1 4-2 5-3-4-3-4z"
          fill={theme.lichen}
          opacity={0.4}
        />

        {/* Waiting indicators — small dots in an arc above */}
        <Circle cx="80" cy="96" r="2.5" fill={theme.textMuted} opacity={0.2} />
        <Circle cx="100" cy="88" r="3" fill={theme.textMuted} opacity={0.25} />
        <Circle cx="120" cy="96" r="2.5" fill={theme.textMuted} opacity={0.2} />

        {/* Decorative */}
        <Path
          d="M58 110c2-4 6-4 8 0"
          stroke={theme.textMuted}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity={0.15}
        />
        <Path
          d="M134 106c2-4 6-4 8 0"
          stroke={theme.textMuted}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity={0.15}
        />

        {/* Small dots */}
        <Circle cx="50" cy="80" r="2" fill={theme.lichen} opacity={0.15} />
        <Circle cx="154" cy="84" r="2" fill={theme.teal} opacity={0.15} />
      </Svg>
    </View>
  );
}

// ─── Advisor Illustration ───
// A leaf with a sparkle — AI meets nature
export function AdvisorIllustration({ size = 160 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Background wash */}
        <Circle cx="100" cy="100" r="92" fill={theme.goldSoft} opacity={0.45} />

        {/* Central leaf */}
        <Path
          d="M100 150c0 0 2-40-8-65s-28-30-28-30 20 0 32 18 14 44 4 77z"
          fill={theme.lichen}
          opacity={0.6}
        />
        <Path
          d="M100 150c0 0 2-40-8-65s-28-30-28-30 20 0 32 18 14 44 4 77z"
          fill="none"
          stroke={theme.lichenDark}
          strokeWidth="1.5"
          opacity={0.3}
        />

        {/* Leaf vein */}
        <Path
          d="M96 140c0 0-2-20-4-38s-4-24 0-34"
          stroke={theme.lichenDark}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity={0.4}
        />
        <Path
          d="M88 110c4 2 8 2 8-2"
          stroke={theme.lichenDark}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity={0.3}
        />
        <Path
          d="M82 96c4 2 10 2 10-2"
          stroke={theme.lichenDark}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity={0.3}
        />

        {/* Large sparkle — top right */}
        <Path
          d="M140 60l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"
          fill={theme.gold}
          opacity={0.7}
        />

        {/* Medium sparkle */}
        <Path
          d="M128 88l1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5z"
          fill={theme.gold}
          opacity={0.5}
        />

        {/* Small sparkle */}
        <Path
          d="M150 92l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"
          fill={theme.gold}
          opacity={0.35}
        />

        {/* Decorative arcs — "thinking" feel */}
        <Path
          d="M130 42c6 0 10 4 10 10"
          stroke={theme.gold}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity={0.3}
        />
        <Path
          d="M136 36c8 0 16 6 16 16"
          stroke={theme.gold}
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity={0.2}
        />

        {/* Dots */}
        <Circle cx="56" cy="120" r="2.5" fill={theme.teal} opacity={0.2} />
        <Circle cx="146" cy="130" r="2" fill={theme.lichen} opacity={0.2} />
        <Circle cx="70" cy="60" r="2" fill={theme.gold} opacity={0.2} />
      </Svg>
      <svg></svg>
    </View>
  );
}

// ─── Error Illustration ───
// A broken/cracked leaf — something went wrong
export function ErrorIllustration({ size = 160 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {/* Background wash */}
        <Circle cx="100" cy="100" r="92" fill={theme.claySoft} opacity={0.4} />

        {/* Main leaf — cracked */}
        <Path
          d="M100 160c0 0 4-50-8-80s-30-35-30-35 24 2 36 22 12 55 2 93z"
          fill={theme.clay}
          opacity={0.35}
        />
        <Path
          d="M100 160c0 0-4-50 8-80s30-35 30-35-24 2-36 22-12 55-2 93z"
          fill={theme.clay}
          opacity={0.25}
        />

        {/* Crack line */}
        <Path
          d="M94 130l6-10 4 4 6-12 4 6 4-8"
          stroke={theme.clayDark}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Decorative */}
        <Circle cx="50" cy="80" r="2.5" fill={theme.clay} opacity={0.2} />
        <Circle cx="154" cy="70" r="2" fill={theme.clay} opacity={0.15} />
      </Svg>
    </View>
  );
}

// ─── Type + Switch ───
export type IllustrationName =
  | "scan"
  | "map"
  | "success"
  | "empty"
  | "advisor"
  | "error";

export function Illustration({
  name,
  size,
}: {
  name: IllustrationName;
  size?: number;
}) {
  switch (name) {
    case "scan":
      return <ScanIllustration size={size} />;
    case "map":
      return <MapPinIllustration size={size} />;
    case "success":
      return <SuccessIllustration size={size} />;
    case "advisor":
      return <AdvisorIllustration size={size} />;
    case "error":
      return <ErrorIllustration size={size} />;
    case "empty":
    default:
      return <EmptyBoxIllustration size={size} />;
  }
}
