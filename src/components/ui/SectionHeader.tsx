import { Text } from "@/components/ui/Text";
import { Space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ArrowRight } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Pressable, View } from "react-native";

interface SectionHeaderAction {
  label: string;
  onPress: () => void;
  icon?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  accent,
  compact,
  action,
  delay = 0,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: string;
  /** Uses smaller title variant and tighter spacing for inline sections. */
  compact?: boolean;
  /** Optional right-aligned action (e.g., "View all →"). */
  action?: SectionHeaderAction;
  /** Animation delay in ms. */
  delay?: number;
}) {
  const theme = useTheme();

  return (
    <MotiView
      from={{ opacity: 0, translateY: -8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay, type: "timing", duration: 400 }}
      style={{ marginBottom: compact ? Space.lg : Space.xl }}
    >
      {/* ─── Top row: eyebrow + optional action ─── */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: compact ? Space.sm : Space.md,
        }}
      >
        <Text
          variant="label"
          color={accent ?? theme.textMuted}
          style={{ letterSpacing: 1.4 }}
        >
          {eyebrow}
        </Text>

        {action && (
          <Pressable
            onPress={action.onPress}
            hitSlop={8}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              opacity: pressed ? 0.5 : 0.7,
            })}
          >
            <Text variant="monoSm" color={theme.lichenDark}>
              {action.label}
            </Text>
            {action.icon !== false && (
              <ArrowRight size={12} color={theme.lichenDark} strokeWidth={2} />
            )}
          </Pressable>
        )}
      </View>

      {/* ─── Title ─── */}
      <Text variant={compact ? "h2" : "display"}>{title}</Text>

      {/* ─── Subtitle ─── */}
      {subtitle && (
        <Text
          variant="bodySm"
          color={theme.textSecondary}
          style={{
            marginTop: compact ? 4 : 6,
            maxWidth: compact ? 280 : 320,
            lineHeight: 20,
          }}
        >
          {subtitle}
        </Text>
      )}
    </MotiView>
  );
}
