import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** The tiny 5-dot signature mark used in footers — echoes the PDF page foot. */
export function LoopDots({ size = 7, gap = 14 }: { size?: number; gap?: number }) {
  const theme = useTheme();
  const colors = [theme.teal, theme.gold, theme.clay, theme.lichen, theme.tealDark];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap }}>
      {colors.map((c, i) => (
        <View key={i} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c }} />
      ))}
    </View>
  );
}

const STAGES = [
  { label: 'SCAN', angle: -90 },
  { label: 'SCORE', angle: -18 },
  { label: 'CLASSIFY', angle: 54 },
  { label: 'MATCH', angle: 126 },
  { label: 'RECOVER', angle: 198 },
];

function point(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = point(cx, cy, r, a0);
  const p1 = point(cx, cy, r, a1);
  return `M${p0.x},${p0.y} A${r},${r} 0 0 1 ${p1.x},${p1.y}`;
}

/** The full 5-stage circular loop diagram — brand hero graphic for Dashboard/Home. */
export function LoopDiagram({ size = 260, activeIndex }: { size?: number; activeIndex?: number }) {
  const theme = useTheme();
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const nodeR = size * 0.082;

  const colors = [theme.teal, theme.gold, theme.clay, theme.lichen, theme.tealDark];
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(120, withTiming(1, { duration: 1100 }));
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: 1000 * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {STAGES.map((s, i) => {
          const next = STAGES[(i + 1) % STAGES.length];
          return (
            <AnimatedPath
              key={s.label}
              d={arcPath(cx, cy, r, s.angle, i === STAGES.length - 1 ? s.angle + 72 : next.angle)}
              stroke={colors[i]}
              strokeWidth={size * 0.018}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="1000 1000"
              animatedProps={animatedProps}
            />
          );
        })}
        {STAGES.map((s, i) => {
          const p = point(cx, cy, r, s.angle);
          const isActive = activeIndex === i;
          return (
            <React.Fragment key={s.label}>
              <Circle
                cx={p.x}
                cy={p.y}
                r={isActive ? nodeR * 1.18 : nodeR}
                fill={colors[i]}
                opacity={activeIndex === undefined || isActive ? 1 : 0.45}
              />
              <SvgText
                x={p.x}
                y={p.y + nodeR + size * 0.052}
                fontSize={size * 0.042}
                fontFamily="JetBrainsMono_700Bold"
                fill={theme.textSecondary}
                textAnchor="middle"
              >
                {s.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
