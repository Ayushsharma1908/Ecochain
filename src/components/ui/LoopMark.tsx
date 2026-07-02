import { useTheme } from "@/hooks/use-theme";
import { MotiView } from "moti";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ═══════════════════════════════════════════════════════════
// LoopDots — the 5-dot brand signature
// ═══════════════════════════════════════════════════════════

export function LoopDots({
  size = 7,
  gap = 14,
}: {
  size?: number;
  gap?: number;
}) {
  const theme = useTheme();
  const colors = [
    theme.teal,
    theme.gold,
    theme.clay,
    theme.lichen,
    theme.tealDark,
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap,
      }}
    >
      {colors.map((c, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: i * 80,
            type: "spring",
            damping: 14,
          }}
        >
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: c,
              // Subtle shadow glow
              shadowColor: c,
              shadowOpacity: 0.3,
              shadowRadius: size * 0.8,
              shadowOffset: { width: 0, height: 0 },
              elevation: 2,
            }}
          />
        </MotiView>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// LoopDiagram — the 5-stage circular loop
// ═══════════════════════════════════════════════════════════

const STAGES = [
  { label: "SCAN", angle: -90 },
  { label: "SCORE", angle: -18 },
  { label: "CLASSIFY", angle: 54 },
  { label: "MATCH", angle: 126 },
  { label: "RECOVER", angle: 198 },
] as const;

function point(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = point(cx, cy, r, a0);
  const p1 = point(cx, cy, r, a1);
  return `M${p0.x},${p0.y} A${r},${r} 0 0 1 ${p1.x},${p1.y}`;
}

export function LoopDiagram({
  size = 260,
  activeIndex,
}: {
  size?: number;
  activeIndex?: number;
}) {
  const theme = useTheme();
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const nodeR = size * 0.075;
  const outerNodeR = size * 0.095;

  const colors = [
    theme.teal,
    theme.gold,
    theme.clay,
    theme.lichen,
    theme.tealDark,
  ];

  // Animation — stroke draw-in
  const strokeProgress = useSharedValue(0);
  useEffect(() => {
    strokeProgress.value = withDelay(200, withTiming(1, { duration: 1200 }));
  }, [strokeProgress]);

  const animatedStrokeProps = useAnimatedProps(() => ({
    strokeDashoffset: 1000 * (1 - strokeProgress.value),
  }));

  // Animation — node scale-in
  const nodeProgress = useSharedValue(0);
  useEffect(() => {
    nodeProgress.value = withDelay(
      600,
      withSpring(1, { damping: 12, stiffness: 100 }),
    );
  }, [nodeProgress]);

  const animatedNodeProps = useAnimatedProps(() => ({
    r: nodeR * nodeProgress.value,
    opacity: nodeProgress.value,
  }));

  const arcSpread = 72; // degrees per arc segment

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Ghost track — faint background circle */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={theme.borderLight}
          strokeWidth={size * 0.012}
          fill="none"
          opacity={0.6}
        />

        {/* Animated colored arcs */}
        {STAGES.map((s, i) => {
          const nextAngle =
            i === STAGES.length - 1
              ? s.angle + arcSpread
              : STAGES[(i + 1) % STAGES.length].angle;

          return (
            <AnimatedPath
              key={s.label}
              d={arcPath(cx, cy, r, s.angle, nextAngle)}
              stroke={colors[i]}
              strokeWidth={size * 0.022}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="1000 1000"
              animatedProps={animatedStrokeProps}
            />
          );
        })}

        {/* Directional arrows on arcs */}
        {STAGES.map((s, i) => {
          const midAngle =
            s.angle +
            (i === STAGES.length - 1
              ? arcSpread / 2
              : (STAGES[(i + 1) % STAGES.length].angle - s.angle) / 2);
          const arrowPoint = point(cx, cy, r, midAngle);
          const arrowSize = size * 0.02;

          return (
            <SvgText
              key={`arrow-${i}`}
              x={arrowPoint.x}
              y={arrowPoint.y + arrowSize * 0.4}
              fontSize={arrowSize * 2.5}
              fill={colors[i]}
              textAnchor="middle"
              opacity={0.5}
            >
              ›
            </SvgText>
          );
        })}

        {/* Node circles — outer glow ring + inner filled circle */}
        {STAGES.map((s, i) => {
          const p = point(cx, cy, r, s.angle);
          const isActive = activeIndex === i;
          const isAnyActive = activeIndex !== undefined;

          return (
            <G key={s.label}>
              {/* Outer glow ring — only for active or all when none selected */}
              {(!isAnyActive || isActive) && (
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={outerNodeR}
                  fill={colors[i]}
                  opacity={isActive ? 0.2 : 0.08}
                />
              )}

              {/* White border ring */}
              <Circle
                cx={p.x}
                cy={p.y}
                r={nodeR + size * 0.012}
                fill={theme.background}
                opacity={isAnyActive && !isActive ? 0.5 : 1}
              />

              {/* Main node */}
              <AnimatedCircle
                cx={p.x}
                cy={p.y}
                fill={colors[i]}
                opacity={!isAnyActive || isActive ? 1 : 0.35}
                animatedProps={animatedNodeProps}
              />

              {/* Active inner highlight */}
              {isActive && (
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={nodeR * 0.35}
                  fill="#FFFFFF"
                  opacity={0.6}
                />
              )}

              {/* Label */}
              <SvgText
                x={p.x}
                y={p.y + outerNodeR + size * 0.055}
                fontSize={size * 0.044}
                fontFamily="JetBrainsMono_700Bold"
                fill={
                  isAnyActive && !isActive
                    ? theme.textMuted
                    : theme.textSecondary
                }
                textAnchor="middle"
                opacity={isAnyActive && !isActive ? 0.5 : 1}
              >
                {s.label}
              </SvgText>
            </G>
          );
        })}

        {/* Center element — decorative */}
        <Circle
          cx={cx}
          cy={cy}
          r={size * 0.08}
          fill={theme.card}
          stroke={theme.borderLight}
          strokeWidth={1}
        />
        <Circle cx={cx} cy={cy} r={size * 0.04} fill={theme.lichenMuted} />
        <Circle cx={cx} cy={cy} r={size * 0.018} fill={theme.lichen} />
      </Svg>
    </View>
  );
}
