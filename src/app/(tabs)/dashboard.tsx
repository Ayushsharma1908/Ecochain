import { router } from "expo-router";
import {
  Gauge,
  Leaf,
  Recycle,
  ScanLine,
  Trash2,
  TrendingUp,
} from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { FlatList, Pressable, View } from "react-native";

import { Button, LoopDiagram, Text, TrendChart } from "@/components/ui";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useScanHistory } from "@/context/ScanHistoryContext";
import { useTheme } from "@/hooks/use-theme";

// ─── Single metric row inside the stats card ───
function MetricRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  unit,
  isPrimary,
}: {
  icon: any;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
  unit?: string;
  isPrimary?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: Space.md,
        paddingVertical: isPrimary ? Space.lg : Space.md + 2,
      }}
    >
      <View
        style={{
          width: isPrimary ? 44 : 36,
          height: isPrimary ? 44 : 36,
          borderRadius: isPrimary ? Radius.md : Radius.sm,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={isPrimary ? 21 : 17} color={iconColor} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          variant={isPrimary ? "body" : "bodySm"}
          style={{
            fontFamily: "Archivo_500Medium",
            color: isPrimary ? theme.cardText : theme.cardTextSecondary,
          }}
        >
          {label}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        {isPrimary ? (
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3 }}>
            <Text
              style={{
                fontFamily: "Fraunces_900Black",
                fontSize: 28,
                lineHeight: 32,
                color: theme.cardText,
              }}
            >
              {value}
            </Text>
            {unit && (
              <Text variant="bodySm" style={{ color: theme.cardTextMuted }}>
                {unit}
              </Text>
            )}
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3 }}>
            <Text
              style={{
                fontFamily: "Fraunces_600SemiBold",
                fontSize: 20,
                color: theme.cardText,
              }}
            >
              {value}
            </Text>
            {unit && (
              <Text variant="monoSm" style={{ color: theme.cardTextMuted }}>
                {unit}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Empty state ───
function DashboardEmpty() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ paddingTop: Space["4xl"], paddingHorizontal: Space.lg }}>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
        >
          <Text
            variant="label"
            color={theme.lichenDark}
            style={{ letterSpacing: 1.6 }}
          >
            ANALYTICS
          </Text>
          <Text
            style={{
              fontFamily: "Fraunces_900Black",
              fontSize: 34,
              lineHeight: 40,
              color: theme.text,
              marginTop: 8,
            }}
          >
            Your impact
          </Text>
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 150, type: "timing", duration: 400 }}
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: Space.xl,
          paddingBottom: 100,
        }}
      >
        <View
          style={{
            alignItems: "center",
            paddingVertical: Space["4xl"],
            paddingHorizontal: Space["2xl"],
            backgroundColor: theme.card,
            borderRadius: Radius.xl,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            ...Shadow.lg,
          }}
        >
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: Radius.pill,
              backgroundColor: "rgba(98,157,60,0.18)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: Space.xl,
            }}
          >
            <TrendingUp size={30} color={theme.lichen} strokeWidth={1.5} />
          </View>
          <Text
            variant="h2"
            style={{ textAlign: "center", color: theme.cardText }}
          >
            No data yet
          </Text>
          <Text
            variant="bodySm"
            style={{
              textAlign: "center",
              color: theme.cardTextMuted,
              marginTop: 8,
              maxWidth: 240,
              lineHeight: 20,
            }}
          >
            Scan a few products and your personal impact trend will build up
            here.
          </Text>
          <View style={{ marginTop: Space.xl, width: "100%" }}>
            <Button
              label="Scan your first product"
              icon={ScanLine}
              onPress={() => router.push("/(tabs)/scan")}
              fullWidth
            />
          </View>
        </View>
      </MotiView>
    </View>
  );
}

// ─── Main dashboard ───
export default function DashboardScreen() {
  const theme = useTheme();
  const { stats, history, clearHistory, loading } = useScanHistory();

  if (!loading && history.length === 0) {
    return <DashboardEmpty />;
  }

  return (
    <FlatList
      data={[]}
      renderItem={null}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{
        paddingHorizontal: Space.lg,
        paddingTop: Space["4xl"],
        paddingBottom: 150,
      }}
      ListHeaderComponent={
        <>
          {/* ─── Header ─── */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400 }}
          >
            <Text
              variant="label"
              color={theme.lichenDark}
              style={{ letterSpacing: 1.6 }}
            >
              ANALYTICS
            </Text>
            <Text
              style={{
                fontFamily: "Fraunces_900Black",
                fontSize: 34,
                lineHeight: 40,
                color: theme.text,
                marginTop: 8,
              }}
            >
              Your impact
            </Text>
            <Text variant="bodySm" color={theme.textMuted} style={{ marginTop: 6 }}>
              From {history.length} scans on this device.
            </Text>
          </MotiView>

          {/* ─── Stats card ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100, type: "timing", duration: 400 }}
            style={{ marginTop: Space["2xl"] }}
          >
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: Radius.xl,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                paddingHorizontal: Space.lg,
                paddingVertical: Space.sm,
                ...Shadow.lg,
              }}
            >
              <MetricRow
                icon={Gauge}
                iconColor={theme.teal}
                iconBg="rgba(26,138,122,0.22)"
                label="Products scanned"
                value={stats.totalScans}
                isPrimary
              />
              <View
                style={{ height: 1, backgroundColor: "rgba(255,255,255,0.10)" }}
              />
              <MetricRow
                icon={Leaf}
                iconColor={theme.lichen}
                iconBg="rgba(98,157,60,0.22)"
                label="CO₂e avoided"
                value={stats.estimatedKgCo2Avoided}
                unit="kg"
              />
              <View
                style={{ height: 1, backgroundColor: "rgba(255,255,255,0.10)" }}
              />
              <MetricRow
                icon={Recycle}
                iconColor={theme.teal}
                iconBg="rgba(26,138,122,0.22)"
                label="Recyclable share"
                value={`${Math.round(stats.recyclableShare * 100)}%`}
              />
              <View
                style={{ height: 1, backgroundColor: "rgba(255,255,255,0.10)" }}
              />
              <MetricRow
                icon={Gauge}
                iconColor={theme.gold}
                iconBg="rgba(212,149,42,0.22)"
                label="Average score"
                value={stats.averageScore}
              />
            </View>
          </MotiView>

          {/* ─── 7-day trend ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, type: "timing", duration: 400 }}
            style={{ marginTop: Space["2xl"] }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: Space.md,
              }}
            >
              <Text
                style={{
                  fontFamily: "Fraunces_600SemiBold",
                  fontSize: 18,
                  color: theme.text,
                }}
              >
                This week
              </Text>
              <Text variant="monoSm" color={theme.textMuted}>
                Last 7 days
              </Text>
            </View>

            {/* Chart card — beige surface so chart is visible */}
            <View
              style={{
                backgroundColor: theme.cardSurface,
                borderRadius: Radius.xl,
                borderWidth: 1.5,
                borderColor: theme.lichenDark + "30",
                padding: Space.lg,
                alignItems: "center",
                ...Shadow.md,
              }}
            >
              <TrendChart data={stats.last7Days} height={160} />
            </View>
          </MotiView>

          {/* ─── Loop diagram ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, type: "timing", duration: 400 }}
            style={{ marginTop: Space["2xl"] }}
          >
            <Text
              style={{
                fontFamily: "Fraunces_600SemiBold",
                fontSize: 18,
                color: theme.text,
                marginBottom: 4,
              }}
            >
              The loop
            </Text>
            <Text
              variant="bodySm"
              color={theme.textMuted}
              style={{ marginBottom: Space.lg }}
            >
              Every scan moves through five stages.
            </Text>
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: Radius.xl,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                padding: Space.xl,
                alignItems: "center",
                ...Shadow.md,
              }}
            >
              <LoopDiagram size={220} />
            </View>
          </MotiView>

          {/* ─── Clear history ─── */}
          <View
            style={{
              marginTop: Space["4xl"],
              paddingTop: Space.xl,
              borderTopWidth: 1,
              borderTopColor: theme.borderLight,
              alignItems: "center",
            }}
          >
            <Pressable
              onPress={clearHistory}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: Space.sm,
                paddingVertical: Space.md,
                paddingHorizontal: Space.lg,
                opacity: pressed ? 0.5 : 0.7,
              })}
            >
              <Trash2 size={14} color={theme.clay} strokeWidth={2} />
              <Text variant="bodySm" color={theme.clay}>
                Clear scan history
              </Text>
            </Pressable>
          </View>
        </>
      }
    />
  );
}
