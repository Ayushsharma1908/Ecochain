import { useTheme } from "@/hooks/use-theme";
import { MotiView } from "moti";
import React from "react";
import { useWindowDimensions } from "react-native";
import Svg, { Defs, G, LinearGradient, Rect, Stop, Text as SvgText } from "react-native-svg";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function TrendChart({
  data,
  height = 160,
  onBarPress,
}: {
  data: { date: string; scans: number }[];
  height?: number;
  onBarPress?: (date: string) => void;
}) {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const chartPadH = 24;
  const width = screenWidth - chartPadH * 2 - 32; // full-width minus padding
  const max = Math.max(1, ...data.map((d) => d.scans));

  const barCount = data.length || 7;
  const totalGap = (barCount + 1) * 6;
  const barWidth = Math.floor((width - totalGap) / barCount);
  const barGap = Math.floor((width - barWidth * barCount) / (barCount + 1));

  const chartHeight = height - 32; // reserve space for labels
  const labelY = height - 8;

  const todayIdx = new Date().getDay();
  const peakScans = Math.max(...data.map((d) => d.scans));

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
    >
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.lichen} stopOpacity="1" />
            <Stop offset="1" stopColor={theme.lichenDark} stopOpacity="0.9" />
          </LinearGradient>
          <LinearGradient id="barGradPeak" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#7EC24A" stopOpacity="1" />
            <Stop offset="1" stopColor={theme.lichen} stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="barGradEmpty" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgba(22,94,57,0.08)" stopOpacity="1" />
            <Stop offset="1" stopColor="rgba(22,94,57,0.04)" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {data.map((d, i) => {
          const barH = Math.max(6, (d.scans / max) * (chartHeight - 16));
          const x = barGap + i * (barWidth + barGap);
          const yBar = chartHeight - barH + 4;
          const dayIdx = new Date(d.date).getDay();
          const isToday = dayIdx === todayIdx;
          const isPeak = d.scans === peakScans && d.scans > 0;
          const hasData = d.scans > 0;

          return (
            <G key={d.date}>
              {/* Background track */}
              <Rect
                x={x}
                y={8}
                width={barWidth}
                height={chartHeight - 4}
                rx={barWidth / 2}
                fill="url(#barGradEmpty)"
              />

              {/* Foreground bar — uses opacity stagger via MotiView */}
              {hasData && (
                <Rect
                  x={x}
                  y={yBar}
                  width={barWidth}
                  height={barH}
                  rx={barWidth / 2}
                  fill={
                    isPeak
                      ? "url(#barGradPeak)"
                      : "url(#barGradActive)"
                  }
                  opacity={isToday ? 1 : 0.85}
                />
              )}

              {/* Today highlight ring */}
              {isToday && (
                <Rect
                  x={x - 2}
                  y={6}
                  width={barWidth + 4}
                  height={chartHeight - 2}
                  rx={barWidth / 2 + 2}
                  fill="none"
                  stroke={theme.lichen}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  opacity={0.5}
                />
              )}

              {/* Scan count above peak bar */}
              {isPeak && hasData && (
                <SvgText
                  x={x + barWidth / 2}
                  y={yBar - 6}
                  fontSize={10}
                  fontFamily="JetBrainsMono_700Bold"
                  fill={theme.lichenDark}
                  textAnchor="middle"
                >
                  {d.scans}
                </SvgText>
              )}

              {/* Day label */}
              <SvgText
                x={x + barWidth / 2}
                y={labelY}
                fontSize={10}
                fontFamily={
                  isToday ? "JetBrainsMono_700Bold" : "JetBrainsMono_500Medium"
                }
                fill={isToday ? theme.lichenDark : theme.textMuted}
                textAnchor="middle"
              >
                {DAY_LABELS[dayIdx]}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </MotiView>
  );
}
