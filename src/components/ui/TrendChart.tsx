import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function TrendChart({ data, height = 120 }: { data: { date: string; scans: number }[]; height?: number }) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => d.scans));
  const barWidth = 22;
  const gap = 14;
  const width = data.length * (barWidth + gap);
  const chartHeight = height - 24;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height}>
        {data.map((d, i) => {
          const barHeight = Math.max(4, (d.scans / max) * (chartHeight - 8));
          const x = i * (barWidth + gap) + gap / 2;
          const y = chartHeight - barHeight;
          const dayIdx = new Date(d.date).getDay();
          return (
            <React.Fragment key={d.date}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={d.scans > 0 ? theme.lichenDark : theme.border}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 4}
                fontSize={11}
                fontFamily="JetBrainsMono_500Medium"
                fill={theme.textMuted}
                textAnchor="middle"
              >
                {DAY_LABELS[dayIdx]}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
