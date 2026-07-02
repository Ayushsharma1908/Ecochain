import { Text } from "@/components/ui/Text";
import { Radius, Space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { LucideIcon } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

// ─── Accent → soft background mapping ───
// Maps a theme color key to its corresponding soft/muted background.
// Falls back to a low-opacity version of the accent if no soft token exists.
function getAccentBackground(theme: any, accentKey: string): string {
  const softMap: Record<string, string> = {
    [theme.lichen]: theme.lichenMuted,
    [theme.lichenDark]: theme.lichenMuted,
    [theme.lichenLight]: theme.lichenMuted,
    [theme.teal]: theme.tealSoft,
    [theme.tealDark]: theme.tealSoft,
    [theme.gold]: theme.goldSoft,
    [theme.goldDark]: theme.goldSoft,
    [theme.clay]: theme.claySoft,
    [theme.clayDark]: theme.claySoft,
  };
  return softMap[accentKey] ?? theme.cardAlt;
}

// ─── Badge ───
type BadgeVariant = "solid" | "soft" | "outline";

export function Badge({
  label,
  accent,
  variant = "solid",
}: {
  label: string;
  accent: string;
  variant?: BadgeVariant;
}) {
  const theme = useTheme();

  const bg =
    variant === "solid"
      ? accent
      : variant === "soft"
        ? getAccentBackground(theme, accent)
        : "transparent";

  const textColor = variant === "solid" ? "#FFFFFF" : accent;

  const borderW = variant === "outline" ? 1.5 : 0;
  const borderColor = variant === "outline" ? accent : "transparent";

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: 3,
        paddingHorizontal: Space.sm + 2,
        borderRadius: Radius.pill,
        backgroundColor: bg,
        borderWidth: borderW,
        borderColor,
      }}
    >
      <Text
        variant="monoSm"
        color={textColor}
        style={{
          fontFamily: "JetBrainsMono_700Bold",
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Chip ───
export function Chip({
  label,
  selected,
  onPress,
  accent,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accent: string;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: Space.sm + 2,
        paddingHorizontal: Space.lg,
        borderRadius: Radius.pill,
        backgroundColor: selected
          ? accent
          : pressed
            ? theme.cardAlt
            : theme.card,
        borderWidth: selected ? 0 : 1.5,
        borderColor: theme.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        variant="bodySm"
        color={selected ? "#FFFFFF" : theme.textSecondary}
        style={{
          fontFamily: selected ? "Archivo_700Bold" : "Archivo_500Medium",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── IconBadge ───
type IconBadgeShape = "circle" | "rounded";

export function IconBadge({
  icon: Icon,
  accent,
  size = 44,
  shape = "rounded",
}: {
  icon: LucideIcon;
  accent: string;
  size?: number;
  shape?: IconBadgeShape;
}) {
  const theme = useTheme();
  const bgColor = getAccentBackground(theme, accent);
  const borderRadius = shape === "circle" ? size / 2 : Math.round(size * 0.3);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: bgColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={Math.round(size * 0.46)} color={accent} strokeWidth={2} />
    </View>
  );
}

// ─── Divider ───
export function Divider({ inset }: { inset?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.borderLight,
        marginVertical: Space.xl,
        marginHorizontal: inset ? Space.lg : 0,
      }}
    />
  );
}
