import { router } from "expo-router";
import {
  ArrowRight,
  ChevronRight,
  Leaf,
  Recycle,
  ScanLine,
  Sparkles,
} from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { FlatList, Pressable, View } from "react-native";

import { Button, LoopDots, Text } from "@/components/ui";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useScanHistory } from "@/context/ScanHistoryContext";
import { useTheme } from "@/hooks/use-theme";
import { scoreTier } from "@/lib/scoring";
import { WASTE_TYPE_LABEL } from "@/lib/wasteMapping";
import type { ScanRecord } from "@/types/domain";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function ScanRow({ item, index }: { item: ScanRecord; index: number }) {
  const theme = useTheme();
  const tier = scoreTier(item.scoreTotal);

  // Score pill color based on tier
  const tierAccent = (theme as any)[tier.accent] as string;
  const tierAccentSoft = ((theme as any)[tier.accent + "Soft"] ??
    "#E8F5DF") as string;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 200 + index * 70, type: "timing", duration: 350 }}
    >
      <Pressable
        onPress={() => router.push(`/product/${item.barcode}`)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: Space.md,
          paddingVertical: Space.md + 2,
          paddingHorizontal: Space.lg,
          backgroundColor: pressed ? theme.cardAlt : theme.card,
          borderRadius: Radius.lg,
          marginBottom: Space.sm,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          ...Shadow.md,
        })}
      >
        {/* Icon circle */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: Radius.sm,
            backgroundColor: "rgba(98,157,60,0.20)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Recycle size={19} color={theme.lichen} strokeWidth={2} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            variant="bodySm"
            style={{
              fontFamily: "Archivo_600SemiBold",
              color: theme.cardText,
            }}
            numberOfLines={1}
          >
            {item.productName}
          </Text>
          <Text
            variant="monoSm"
            style={{ color: theme.cardTextMuted, marginTop: 2 }}
          >
            {WASTE_TYPE_LABEL[item.wasteType]}
          </Text>
        </View>

        {/* Score pill */}
        <View
          style={{
            paddingHorizontal: Space.md,
            paddingVertical: 4,
            borderRadius: Radius.pill,
            backgroundColor: tierAccentSoft,
            borderWidth: 1,
            borderColor: tierAccent + "40",
          }}
        >
          <Text
            variant="monoSm"
            style={{
              fontFamily: "JetBrainsMono_700Bold",
              color: tierAccent,
            }}
          >
            {item.scoreTotal}
          </Text>
        </View>

        <ChevronRight size={15} color={theme.cardTextMuted} strokeWidth={2} />
      </Pressable>
    </MotiView>
  );
}

function StatBlock({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  unit,
  label,
}: {
  icon: any;
  iconColor: string;
  iconBg: string;
  value: string | number;
  unit?: string;
  label: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: Space.lg }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: Radius.md,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: Space.sm,
        }}
      >
        <Icon size={19} color={iconColor} strokeWidth={2} />
      </View>
      <Text
        style={{
          fontFamily: "Fraunces_900Black",
          fontSize: 26,
          lineHeight: 30,
          color: theme.cardText,
        }}
      >
        {value}
        {unit && (
          <Text
            variant="bodySm"
            style={{ color: theme.cardTextMuted }}
          >
            {" "}
            {unit}
          </Text>
        )}
      </Text>
      <Text
        variant="monoSm"
        style={{ color: theme.cardTextMuted, marginTop: 3 }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { history, stats, loading } = useScanHistory();
  const recent = history.slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={recent}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => <ScanRow item={item} index={index} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Space.lg,
          paddingTop: Space["4xl"],
          paddingBottom: 150,
        }}
        ListHeaderComponent={
          <>
            {/* ─── Greeting ─── */}
            <MotiView
              from={{ opacity: 0, translateY: -12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 450 }}
            >
              {/* Brand pill */}
              <View
                style={{
                  alignSelf: "flex-start",
                  paddingHorizontal: Space.md,
                  paddingVertical: 5,
                  borderRadius: Radius.pill,
                  backgroundColor: theme.lichenDark,
                  marginBottom: Space.lg,
                  borderWidth: 1,
                  borderColor: theme.lichen + "50",
                }}
              >
                <Text
                  variant="label"
                  style={{ color: "#FDF5E4", letterSpacing: 1.6 }}
                >
                  ECOCHAIN LINK
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: "Fraunces_900Black",
                  fontSize: 34,
                  lineHeight: 40,
                  color: theme.text,
                }}
              >
                {greeting()}.
              </Text>
              <Text
                variant="body"
                color={theme.textSecondary}
                style={{ marginTop: 8, maxWidth: 280, lineHeight: 23 }}
              >
                Scan a product to get its sustainability score and disposal
                guidance.
              </Text>
            </MotiView>

            {/* ─── Scan Hero CTA ─── */}
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 100, type: "timing", duration: 450 }}
              style={{ marginTop: Space["2xl"] }}
            >
              <Pressable
                onPress={() => router.push("/(tabs)/scan")}
                style={({ pressed }) => ({
                  borderRadius: Radius.xl,
                  backgroundColor: theme.lichenDark,
                  padding: Space["2xl"],
                  opacity: pressed ? 0.93 : 1,
                  overflow: "hidden",
                  ...Shadow.lg,
                  borderWidth: 1,
                  borderColor: "rgba(98,157,60,0.30)",
                })}
              >
                {/* Decorative blobs */}
                <View
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: theme.lichen,
                    opacity: 0.25,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -30,
                    left: -10,
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#629D3C",
                    opacity: 0.15,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 20,
                    opacity: 0.15,
                  }}
                >
                  <Leaf size={64} color="#FDF5E4" strokeWidth={1} />
                </View>

                <Text
                  style={{
                    fontFamily: "Fraunces_900Black",
                    fontSize: 26,
                    lineHeight: 30,
                    color: "#FDF5E4",
                    maxWidth: 220,
                  }}
                >
                  Ready to scan?
                </Text>
                <Text
                  variant="bodySm"
                  style={{
                    color: "rgba(253,245,228,0.72)",
                    marginTop: 8,
                    maxWidth: 210,
                    lineHeight: 20,
                  }}
                >
                  Point your camera at any product barcode or label.
                </Text>

                <View style={{ marginTop: Space.xl }}>
                  <Button
                    label="Open scanner"
                    icon={ScanLine}
                    onPress={() => router.push("/(tabs)/scan")}
                    style={{
                      backgroundColor: "#629D3C",
                    }}
                  />
                </View>
              </Pressable>
            </MotiView>

            {/* ─── Stats Row ─── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200, type: "timing", duration: 380 }}
              style={{ marginTop: Space.lg }}
            >
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: theme.card,
                  borderRadius: Radius.lg,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  ...Shadow.md,
                  overflow: "hidden",
                }}
              >
                <StatBlock
                  icon={Leaf}
                  iconColor={theme.lichen}
                  iconBg="rgba(98,157,60,0.20)"
                  value={stats.estimatedKgCo2Avoided}
                  unit="kg"
                  label="CO₂e avoided"
                />
                <View
                  style={{
                    width: 1,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    marginVertical: Space.lg,
                  }}
                />
                <StatBlock
                  icon={Recycle}
                  iconColor={theme.teal}
                  iconBg="rgba(26,138,122,0.20)"
                  value={stats.recyclableCount}
                  label="recyclable"
                />
              </View>
            </MotiView>

            {/* ─── AI Advisor Row ─── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 280, type: "timing", duration: 380 }}
              style={{ marginTop: Space.sm }}
            >
              <Pressable
                onPress={() => router.push("/advisor")}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Space.md,
                  paddingVertical: Space.md + 2,
                  paddingHorizontal: Space.lg,
                  backgroundColor: pressed ? theme.cardAlt : theme.card,
                  borderRadius: Radius.lg,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                  opacity: pressed ? 0.87 : 1,
                  ...Shadow.md,
                })}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: Radius.sm,
                    backgroundColor: "rgba(212,149,42,0.25)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={19} color={theme.gold} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    variant="body"
                    style={{
                      fontFamily: "Archivo_600SemiBold",
                      color: theme.cardText,
                    }}
                  >
                    Ask the AI advisor
                  </Text>
                  <Text
                    variant="monoSm"
                    style={{ color: theme.cardTextMuted, marginTop: 2 }}
                  >
                    Alternatives, pickup points & value
                  </Text>
                </View>
                <ChevronRight size={16} color={theme.cardTextMuted} strokeWidth={2} />
              </Pressable>
            </MotiView>

            {/* ─── Recent Scans Header ─── */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginTop: Space["2xl"],
                marginBottom: Space.sm,
              }}
            >
              <Text
                style={{
                  fontFamily: "Fraunces_600SemiBold",
                  fontSize: 18,
                  color: theme.text,
                }}
              >
                Recent scans
              </Text>
              {history.length > 0 && (
                <Pressable
                  onPress={() => router.push("/(tabs)/dashboard")}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text variant="monoSm" color={theme.lichenDark}>
                    View all
                  </Text>
                  <ArrowRight size={12} color={theme.lichenDark} strokeWidth={2} />
                </Pressable>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <MotiView
              from={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 320, type: "timing", duration: 400 }}
              style={{ marginTop: Space.md }}
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
                  ...Shadow.md,
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: Radius.pill,
                    backgroundColor: "rgba(98,157,60,0.18)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: Space.lg,
                  }}
                >
                  <Leaf size={28} color={theme.lichen} strokeWidth={1.5} />
                </View>
                <Text
                  variant="h2"
                  style={{ textAlign: "center", color: theme.cardText }}
                >
                  Nothing here yet
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
                  Your first scan will appear here with its score and how to
                  dispose of it.
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
          ) : null
        }
        ListFooterComponent={
          recent.length > 0 ? (
            <View style={{ alignItems: "center", marginTop: Space["2xl"] }}>
              <LoopDots size={6} gap={12} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
