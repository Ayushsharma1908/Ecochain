import {
  Illustration,
  type IllustrationName,
} from "@/components/illustrations";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { LucideIcon } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Pressable, View } from "react-native";

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

interface EmptyStateSecondaryAction {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
}

export function EmptyState({
  illustration,
  title,
  subtitle,
  action,
  secondaryAction,
  compact,
}: {
  illustration: IllustrationName;
  title: string;
  subtitle?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateSecondaryAction;
  /** Reduces padding and illustration size for inline use. */
  compact?: boolean;
}) {
  const theme = useTheme();

  const illustrationSize = compact ? 100 : 140;
  const containerPadding = compact ? Space.xl : Space["2xl"];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 420 }}
    >
      <View
        style={{
          alignItems: "center",
          paddingVertical: containerPadding,
          paddingHorizontal: Space.xl,
          backgroundColor: theme.card,
          borderRadius: Radius.xl,
          borderWidth: 1,
          borderColor: theme.borderLight,
          ...Shadow.sm,
        }}
      >
        <Illustration name={illustration} size={illustrationSize} />

        <Text
          variant={compact ? "h2" : "h1"}
          style={{
            textAlign: "center",
            marginTop: compact ? Space.lg : Space.xl,
          }}
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            variant="bodySm"
            color={theme.textSecondary}
            style={{
              textAlign: "center",
              marginTop: Space.sm,
              maxWidth: 260,
              lineHeight: 20,
            }}
          >
            {subtitle}
          </Text>
        )}

        {action && (
          <View
            style={{
              marginTop: compact ? Space.xl : Space["2xl"],
              width: "100%",
              alignItems: "center",
            }}
          >
            <Button
              label={action.label}
              icon={action.icon}
              onPress={action.onPress}
              fullWidth={action.fullWidth ?? true}
            />
          </View>
        )}

        {secondaryAction && (
          <Pressable
            onPress={secondaryAction.onPress}
            style={({ pressed }) => ({
              marginTop: Space.md,
              flexDirection: "row",
              alignItems: "center",
              gap: Space.xs,
              paddingVertical: Space.sm,
              opacity: pressed ? 0.5 : 0.7,
            })}
          >
            {secondaryAction.icon && (
              <secondaryAction.icon
                size={13}
                color={theme.textMuted}
                strokeWidth={2}
              />
            )}
            <Text variant="bodySm" color={theme.textMuted}>
              {secondaryAction.label}
            </Text>
          </Pressable>
        )}
      </View>
    </MotiView>
  );
}
