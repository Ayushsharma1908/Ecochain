import { Link } from "expo-router";
import { ArrowLeft, Leaf, ScanLine } from "lucide-react-native";
import { MotiView } from "moti";
import { View } from "react-native";

import { Button, Text } from "@/components/ui";
import { Radius, Space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        alignItems: "center",
        justifyContent: "center",
        padding: Space.xl,
      }}
    >
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={{ alignItems: "center" }}
      >
        {/* ─── 404 Illustration ─── */}
        <View style={{ alignItems: "center", marginBottom: Space["3xl"] }}>
          {/* Background circles — organic depth */}
          <View
            style={{
              position: "absolute",
              top: -20,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: theme.lichenMuted,
              opacity: 0.5,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 10,
              left: -10,
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: theme.lichenSoft,
              opacity: 0.4,
            }}
          />

          {/* 404 number */}
          <Text
            style={{
              fontFamily: "Fraunces_900Black",
              fontSize: 80,
              lineHeight: 84,
              color: theme.lichenDark,
              opacity: 0.18,
              position: "absolute",
              top: 20,
            }}
          >
            404
          </Text>

          {/* Central leaf cluster */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: Radius.pill,
              backgroundColor: theme.lichenMuted,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: Radius.pill,
                backgroundColor: theme.lichenSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Leaf size={26} color={theme.lichen} strokeWidth={1.5} />
            </View>
          </View>

          {/* Small floating leaf accents */}
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: theme.lichenSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Leaf size={11} color={theme.lichenDark} strokeWidth={1.5} />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 12,
              left: 6,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: theme.lichenSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Leaf size={9} color={theme.lichen} strokeWidth={1.5} />
          </View>
        </View>

        {/* ─── Text ─── */}
        <Text variant="h1" style={{ textAlign: "center" }}>
          Page not found
        </Text>
        <Text
          variant="body"
          color={theme.textSecondary}
          style={{
            textAlign: "center",
            marginTop: Space.sm,
            maxWidth: 260,
            lineHeight: 22,
          }}
        >
          This page got composted. Let&rsquo;s get you back on the loop.
        </Text>

        {/* ─── CTAs ─── */}
        <View style={{ marginTop: Space["3xl"], width: "100%", gap: Space.md }}>
          <Link href="/(tabs)" asChild>
            <Button label="Back to home" icon={ArrowLeft} fullWidth />
          </Link>
          <Link href="/(tabs)/scan" asChild>
            <View
              style={{
                alignItems: "center",
                paddingVertical: Space.md,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Space.sm,
                }}
              >
                <ScanLine size={14} color={theme.lichenDark} strokeWidth={2} />
                <Text variant="body" color={theme.lichenDark}>
                  Or scan a product
                </Text>
              </View>
            </View>
          </Link>
        </View>
      </MotiView>
    </View>
  );
}
