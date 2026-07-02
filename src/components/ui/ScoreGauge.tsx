import { Text } from "@/components/ui/Text";
import { Radius, Space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { scoreTier } from "@/lib/scoring";
import { MotiView } from "moti";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Animated numeric display — counts from 0 to target
function AnimatedScore({
  score,
  size,
  color,
}: {
  score: number;
  size: number;
  color: string;
}) {
  const animValue = useSharedValue(0);

  useEffect(() => {
    animValue.value = withDelay(
      200,
      withTiming(score, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [score, animValue]);

  // We use a workaround: render score text via a ref label that JS updates
  // via Reanimated's useAnimatedStyle → opacity trick.
  // Because RN Animated Text doesn't support numeric formatting easily,
  // we'll use multiple Text views with discrete opacity stepping.
  // Simpler approach: just use the MotiView fade-in with the JS value directly.
  // For true counter, we rely on Reanimated derived text display.
  return (
    <Animated.Text
      style={[
        {
          fontFamily: "Fraunces_900Black",
          fontSize: size * 0.3,
          lineHeight: size * 0.34,
          color,
          includeFontPadding: false,
        },
      ]}
    >
      {score}
    </Animated.Text>
  );
}

export function ScoreGauge({
  score,
  size = 160,
}: {
  score: number;
  size?: number;
}) {
  const theme = useTheme();
  const tier = scoreTier(score);
  const accentColor = (theme as any)[tier.accent] as string;
  const accentSoft = ((theme as any)[tier.accent + "Soft"] ??
    theme.lichenSoft) as string;

  const stroke = size * 0.09;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Arc animation: 0 → score/100
  const progress = useSharedValue(0);
  // Number animation: 0 → score
  const numberVal = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      150,
      withTiming(score / 100, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );
    numberVal.value = withDelay(
      150,
      withTiming(score, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [score, progress, numberVal]);

  const animatedArcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  // Animated text style to trigger re-render for the number counter
  const numberAnimStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={accentColor} stopOpacity="0.7" />
            <Stop offset="1" stopColor={theme.lichen} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Ghost track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(22,94,57,0.12)"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Animated progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accentColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedArcProps}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      {/* Center content */}
      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 250,
            type: "spring",
            damping: 14,
            stiffness: 120,
          }}
          style={{ alignItems: "center" }}
        >
          {/* Animated score counter */}
          <ScoreCounter score={score} size={size} textColor={theme.text} />

          {/* Tier badge */}
          <View
            style={{
              paddingHorizontal: Space.md,
              paddingVertical: 3,
              borderRadius: Radius.pill,
              backgroundColor: accentSoft,
              marginTop: 4,
              borderWidth: 1,
              borderColor: accentColor + "40",
            }}
          >
            <Text
              variant="monoSm"
              style={{
                fontFamily: "JetBrainsMono_700Bold",
                color: accentColor,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontSize: size * 0.065,
              }}
            >
              {tier.label}
            </Text>
          </View>
        </MotiView>
      </View>
    </View>
  );
}

// ─── Counter using discrete stepping via useState ───
function ScoreCounter({
  score,
  size,
  textColor,
}: {
  score: number;
  size: number;
  textColor: string;
}) {
  const [displayScore, setDisplayScore] = React.useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <Text
      style={{
        fontFamily: "Fraunces_900Black",
        fontSize: size * 0.3,
        lineHeight: size * 0.34,
        color: textColor,
        includeFontPadding: false,
      } as any}
    >
      {displayScore}
    </Text>
  );
}
