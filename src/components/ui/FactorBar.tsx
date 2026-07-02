import { Text } from "@/components/ui/Text";
import { Radius, Space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ScoreBreakdown } from "@/types/domain";
import { MotiView } from "moti";
import React from "react";
import { View } from "react-native";

// ─── Segment definition ───
interface Segment {
  label: string;
  value: number;
  color: string;
  softColor: string;
  type: "base" | "bonus" | "penalty";
}

// ─── Animated progress bar row ───
function FactorRow({
  segment,
  total,
  index,
}: {
  segment: Segment;
  total: number;
  index: number;
}) {
  const theme = useTheme();
  const fraction = segment.value / total;
  const prefix = segment.type === "penalty" ? "−" : "+";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        delay: 200 + index * 80,
        type: "timing",
        duration: 350,
      }}
    >
      <View
        style={{
          marginBottom: Space.md,
        }}
      >
        {/* Label row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: segment.color,
              }}
            />
            <Text
              variant="bodySm"
              color={theme.textSecondary}
              style={{ fontFamily: "Archivo_500Medium" }}
            >
              {segment.label}
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: Space.sm,
              paddingVertical: 2,
              borderRadius: Radius.pill,
              backgroundColor: segment.softColor,
            }}
          >
            <Text
              variant="monoSm"
              style={{
                fontFamily: "JetBrainsMono_700Bold",
                color: segment.type === "penalty" ? theme.clay : segment.color,
              }}
            >
              {prefix}
              {segment.value}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 10,
            borderRadius: Radius.pill,
            backgroundColor: "rgba(22,94,57,0.10)",
            overflow: "hidden",
          }}
        >
          <MotiView
            from={{ width: "0%" }}
            animate={{ width: `${Math.round(fraction * 100)}%` }}
            transition={{
              delay: 300 + index * 80,
              type: "timing",
              duration: 600,
            }}
            style={{
              height: "100%",
              borderRadius: Radius.pill,
              backgroundColor: segment.color,
            }}
          />
        </View>
      </View>
    </MotiView>
  );
}

// ─── Main component ───
export function FactorBar({ score }: { score: ScoreBreakdown }) {
  const theme = useTheme();

  const segments: Segment[] = [
    {
      label: "Base score",
      value: score.base,
      color: theme.teal,
      softColor: theme.tealSoft,
      type: "base" as const,
    },
    {
      label: "Label bonus",
      value: score.labelBonus,
      color: theme.lichen,
      softColor: theme.lichenSoft,
      type: "bonus" as const,
    },
    {
      label: "Recycler bonus",
      value: score.recyclerBonus,
      color: theme.lichenDark,
      softColor: theme.lichenMuted,
      type: "bonus" as const,
    },
    {
      label: "Packaging penalty",
      value: score.packagingPenalty,
      color: theme.clay,
      softColor: theme.claySoft,
      type: "penalty" as const,
    },
  ].filter((s) => s.value > 0);

  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <View style={{ marginTop: Space.sm }}>
      {segments.map((s, i) => (
        <FactorRow key={s.label} segment={s} total={total} index={i} />
      ))}
    </View>
  );
}
