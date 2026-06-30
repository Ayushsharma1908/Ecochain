import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/Text';
import { scoreTier } from '@/lib/scoring';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ScoreGauge({ score, size = 132 }: { score: number; size?: number }) {
  const theme = useTheme();
  const tier = scoreTier(score);
  const accentColor = theme[tier.accent];

  const stroke = size * 0.1;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [score, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.border}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accentColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text variant="display" style={{ fontSize: size * 0.3, lineHeight: size * 0.32 }}>
          {score}
        </Text>
        <Text variant="monoSm" color={accentColor} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {tier.label}
        </Text>
      </View>
    </View>
  );
}
