import { router } from "expo-router";
import {
  Droplets,
  Gauge,
  Leaf,
  Recycle,
  ScanLine,
  Trash2,
  TreePine,
  TrendingUp,
  Wind,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, LoopDiagram, Text, TrendChart } from "@/components/ui";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useScanHistory } from "@/context/ScanHistoryContext";
import { useAuthGate } from "@/hooks/use-auth-gate";
import { useTheme } from "@/hooks/use-theme";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Eco Illustration Components ───

function EcoLeaf({ size = 24, color = "#629D3C", style }: { size?: number; color?: string; style?: any }) {
  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      <Leaf size={size} color={color} strokeWidth={1.5} />
    </View>
  );
}

function FloatingLeaf({
  size = 16,
  color,
  delay = 0,
  duration = 3000,
  style,
}: {
  size?: number;
  color: string;
  delay?: number;
  duration?: number;
  style?: any;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 10, rotate: "-10deg" }}
      animate={{ opacity: [0, 1, 1, 0], translateY: [10, -5, -15, -25], rotate: ["-10deg", "5deg", "-5deg", "10deg"] }}
      transition={{ delay, duration, loop: true, type: "timing" }}
      style={[{ position: "absolute" }, style]}
    >
      <Leaf size={size} color={color} strokeWidth={1.5} fill={color + "30"} />
    </MotiView>
  );
}

function EcoBadge({
  icon: Icon,
  color,
  bgColor,
  label,
  value,
  subtitle,
  delay = 0,
}: {
  icon: any;
  color: string;
  bgColor: string;
  label: string;
  value: string | number;
  subtitle?: string;
  delay?: number;
}) {
  const theme = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9, translateY: 15 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ delay, type: "spring", damping: 14, stiffness: 120 }}
      style={{
        flex: 1,
        minWidth: SCREEN_W * 0.4,
        backgroundColor: theme.card,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        padding: Space.lg,
        ...Shadow.md,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: Radius.md,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: Space.md,
        }}
      >
        <Icon size={20} color={color} strokeWidth={2} />
      </View>
      <Text
        variant="bodySm"
        style={{ color: theme.cardTextSecondary, marginBottom: 2 }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "Fraunces_900Black",
          fontSize: 26,
          lineHeight: 30,
          color: theme.cardText,
        }}
      >
        {value}
      </Text>
      {subtitle && (
        <Text variant="monoSm" style={{ color: theme.cardTextMuted, marginTop: 2 }}>
          {subtitle}
        </Text>
      )}
    </MotiView>
  );
}

// ─── Single metric row inside the stats card ───
function MetricRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  unit,
  isPrimary,
  delay = 0,
}: {
  icon: any;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
  unit?: string;
  isPrimary?: boolean;
  delay?: number;
}) {
  const theme = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateX: -15 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay, type: "timing", duration: 400 }}
    >
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
            width: isPrimary ? 48 : 40,
            height: isPrimary ? 48 : 40,
            borderRadius: isPrimary ? Radius.md : Radius.sm,
            backgroundColor: iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={isPrimary ? 22 : 18} color={iconColor} strokeWidth={2} />
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
    </MotiView>
  );
}

// ─── Impact Score Ring ───
function ImpactScoreRing({ score, delay = 0 }: { score: number; delay?: number }) {
  const theme = useTheme();
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 70 ? theme.lichen : score >= 40 ? theme.gold : theme.clay;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", damping: 12 }}
      style={{ alignItems: "center", marginVertical: Space.xl }}
    >
      <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
        {/* Background ring */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: Radius.pill,
            borderWidth: 8,
            borderColor: theme.cardBorder,
          }}
        />
        {/* Animated progress ring */}
        <MotiView
          from={{ rotate: "0deg" }}
          animate={{ rotate: "360deg" }}
          transition={{ duration: 20000, loop: true, type: "timing" }}
          style={{ position: "absolute" }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: Radius.pill,
              borderWidth: 8,
              borderColor: scoreColor + "40",
              borderTopColor: scoreColor,
              borderLeftColor: scoreColor,
            }}
          />
        </MotiView>
        <View
          style={{
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
            gap: 6, // <-- Adds spacing between the texts
          }}
        >
          <Text
            style={{
              fontFamily: "Fraunces_900Black",
              fontSize: 32,
              lineHeight: 36,
              color: theme.cardText,
            }}
          >
            {score}
          </Text>

          <Text
            variant="monoSm"
            style={{
              color: theme.cardTextMuted,
              marginTop: 2,
            }}
          >
            Score
          </Text>
        </View>
      </View>
      <Text
        variant="bodySm"
        style={{
          color: scoreColor,
          marginTop: Space.md,
          fontFamily: "Archivo_600SemiBold",
        }}
      >
        {score >= 70 ? "Excellent eco impact! 🌿" : score >= 40 ? "Good progress! ♻️" : "Keep scanning! 🌱"}
      </Text>
    </MotiView>
  );
}

// ─── Eco Tip Card ───
function EcoTipCard({ delay = 0 }: { delay?: number }) {
  const theme = useTheme();
  const tips = [
    { icon: Recycle, text: "Rinse containers before recycling to avoid contamination." },
    { icon: Leaf, text: "Choose products with minimal packaging to reduce waste." },
    { icon: Droplets, text: "Reusable bottles save ~167 plastic bottles per year." },
    { icon: TreePine, text: "One tree absorbs ~22kg of CO₂ annually." },
    { icon: Wind, text: "Air-drying clothes saves 2-3kg CO₂ per load." },
  ];

  const tip = useMemo(() => tips[Math.floor(Math.random() * tips.length)], []);
  const Icon = tip.icon;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay, type: "timing", duration: 500 }}
      style={{
        backgroundColor: theme.lichen + "12",
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: theme.lichen + "30",
        padding: Space.lg,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: Space.md,
        marginTop: Space.lg,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: Radius.pill,
          backgroundColor: theme.lichen + "20",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={theme.lichen} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          variant="bodySm"
          style={{
            color: theme.lichenDark,
            fontFamily: "Archivo_600SemiBold",
            marginBottom: 2,
          }}
        >
          Eco Tip
        </Text>
        <Text variant="bodySm" style={{ color: theme.text, lineHeight: 20 }}>
          {tip.text}
        </Text>
      </View>
    </MotiView>
  );
}

// ─── Empty state ───
function DashboardEmpty() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ paddingTop: insets.top + Space.xl, paddingHorizontal: Space.lg }}>
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
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative floating leaves */}
          <FloatingLeaf size={20} color={theme.lichen + "60"} delay={0} style={{ top: 20, left: 30 }} />
          <FloatingLeaf size={14} color={theme.teal + "50"} delay={800} style={{ top: 40, right: 25 }} />
          <FloatingLeaf size={18} color={theme.gold + "40"} delay={1600} style={{ bottom: 80, left: 20 }} />

          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: Radius.pill,
              backgroundColor: "rgba(98,157,60,0.18)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: Space.xl,
            }}
          >
            <TreePine size={36} color={theme.lichen} strokeWidth={1.5} />
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
  const { isAuthenticated, loading: authLoading } = useAuthGate();
  const { stats, history, clearHistory, loading } = useScanHistory();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace({ pathname: "/login", params: { redirect: "/(tabs)/dashboard" } });
  }, [authLoading, isAuthenticated]);

  if (!isAuthenticated) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

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
        paddingTop: insets.top + Space.xl,
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: Space.sm, marginBottom: 4 }}>
              <Leaf size={16} color={theme.lichen} strokeWidth={2.5} />
              <Text
                variant="label"
                color={theme.lichenDark}
                style={{ letterSpacing: 1.6 }}
              >
                ANALYTICS
              </Text>
            </View>
            <Text
              style={{
                fontFamily: "Fraunces_900Black",
                fontSize: 34,
                lineHeight: 40,
                color: theme.text,
                marginTop: 4,
              }}
            >
              Your impact
            </Text>
            <Text variant="bodySm" color={theme.textMuted} style={{ marginTop: 6 }}>
              From {history.length} {history.length === 1 ? "scan" : "scans"} on this device.
            </Text>
          </MotiView>

          {/* ─── Quick Stats Grid ─── */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: Space.md,
              marginTop: Space["2xl"],
            }}
          >
            <EcoBadge
              icon={Leaf}
              color={theme.lichen}
              bgColor="rgba(98,157,60,0.18)"
              label="CO₂ Avoided"
              value={`${stats.estimatedKgCo2Avoided ?? 0}`}
              subtitle="kg saved"
              delay={100}
            />
            <EcoBadge
              icon={Recycle}
              color={theme.teal}
              bgColor="rgba(26,138,122,0.18)"
              label="Recyclable"
              value={`${Math.round((stats.recyclableShare ?? 0) * 100)}%`}
              subtitle="of scans"
              delay={200}
            />
          </View>

          {/* ─── Impact Score Ring ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 150, type: "timing", duration: 400 }}
            style={{
              marginTop: Space["2xl"],
              backgroundColor: theme.card,
              borderRadius: Radius.xl,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              padding: Space.xl,
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              ...Shadow.lg,
            }}
          >
            {/* Decorative elements
            <FloatingLeaf size={16} color={theme.lichen + "30"} delay={0} style={{ top: 15, left: 20 }} />
            <FloatingLeaf size={12} color={theme.teal + "25"} delay={1200} style={{ top: 25, right: 25 }} />
            <FloatingLeaf size={14} color={theme.gold + "20"} delay={600} style={{ bottom: 20, left: 30 }} /> */}

            <View style={{ flexDirection: "row", alignItems: "center", gap: Space.sm, marginBottom: Space.md }}>
              <Gauge size={16} color={theme.gold} />
              <Text
                style={{
                  fontFamily: "Fraunces_600SemiBold",
                  fontSize: 16,
                  color: theme.cardText,
                }}
              >
                Impact Score
              </Text>
            </View>
            <ImpactScoreRing score={stats.averageScore ?? 0} delay={300} />
          </MotiView>

          {/* ─── Stats card ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 250, type: "timing", duration: 400 }}
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: Space.sm, paddingVertical: Space.md }}>
                <TreePine size={16} color={theme.lichen} />
                <Text
                  style={{
                    fontFamily: "Fraunces_600SemiBold",
                    fontSize: 16,
                    color: theme.cardText,
                  }}
                >
                  Detailed Breakdown
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginBottom: Space.xs }} />

              <MetricRow
                icon={Gauge}
                iconColor={theme.teal}
                iconBg="rgba(26,138,122,0.22)"
                label="Products scanned"
                value={stats.totalScans ?? 0}
                isPrimary
                delay={300}
              />
              <View
                style={{ height: 1, backgroundColor: "rgba(255,255,255,0.10)" }}
              />
              <MetricRow
                icon={Leaf}
                iconColor={theme.lichen}
                iconBg="rgba(98,157,60,0.22)"
                label="CO₂e avoided"
                value={stats.estimatedKgCo2Avoided ?? 0}
                unit="kg"
                delay={400}
              />
              <View
                style={{ height: 1, backgroundColor: "rgba(255,255,255,0.10)" }}
              />
              <MetricRow
                icon={Recycle}
                iconColor={theme.teal}
                iconBg="rgba(26,138,122,0.22)"
                label="Recyclable share"
                value={`${Math.round((stats.recyclableShare ?? 0) * 100)}%`}
                delay={500}
              />
              <View
                style={{ height: 1, backgroundColor: "rgba(255,255,255,0.10)" }}
              />
              <MetricRow
                icon={TrendingUp}
                iconColor={theme.gold}
                iconBg="rgba(212,149,42,0.22)"
                label="Average score"
                value={stats.averageScore ?? 0}
                delay={600}
              />
            </View>
          </MotiView>

          {/* ─── 7-day trend ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 350, type: "timing", duration: 400 }}
            style={{ marginTop: Space["2xl"] }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: Space.md,
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Space.sm,
                  minWidth: 0,
                }}
              >
                <TrendingUp size={18} color={theme.lichen} />

                <Text
                  numberOfLines={1}
                  style={{
                    flexShrink: 1,
                    fontFamily: "Fraunces_600SemiBold",
                    fontSize: 18,
                    color: theme.text,
                  }}
                >
                  This week
                </Text>
              </View>

              <Text
                variant="monoSm"
                numberOfLines={1}
                color={theme.textMuted}
                style={{
                  marginLeft: Space.md,
                  flexShrink: 0,
                }}
              >
                Last 7 days
              </Text>
            </View>

            {/* Enhanced Chart card */}
            <View
              style={{
                backgroundColor: theme.cardSurface,
                borderRadius: Radius.xl,
                borderWidth: 1.5,
                borderColor: theme.lichenDark + "30",
                padding: Space.lg,
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
                ...Shadow.md,
              }}
            >
              {/* Subtle leaf watermark */}
              <View style={{ position: "absolute", top: 10, right: 10, opacity: 0.08 }}>
                <Leaf size={60} color={theme.lichen} strokeWidth={1} />
              </View>
              <TrendChart data={stats.last7Days} height={180} />
            </View>
          </MotiView>

          {/* ─── Eco Tip ─── */}
          <EcoTipCard delay={450} />

          {/* ─── Loop diagram ─── */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500, type: "timing", duration: 400 }}
            style={{ marginTop: Space["2xl"] }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: Space.sm, marginBottom: 4 }}>
              <Recycle size={18} color={theme.teal} />
              <Text
                style={{
                  fontFamily: "Fraunces_600SemiBold",
                  fontSize: 18,
                  color: theme.text,
                }}
              >
                The loop
              </Text>
            </View>
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
                position: "relative",
                overflow: "hidden",
                ...Shadow.md,
              }}
            >
              {/* Decorative recycling symbol watermark */}
              <View style={{ position: "absolute", bottom: -10, right: -10, opacity: 0.06 }}>
                <Recycle size={100} color={theme.teal} strokeWidth={1} />
              </View>
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