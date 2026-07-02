import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowRight,
  ChevronLeft,
  Leaf,
  MapPin,
  Package,
  Sparkles,
  Zap,
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";

import { FactorBar, Text } from "@/components/ui";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useCurrentContext } from "@/context/CurrentContext";
import { useScanHistory } from "@/context/ScanHistoryContext";
import { useTheme } from "@/hooks/use-theme";
import {
  fallbackProductForBarcode,
  fetchProductByBarcode,
} from "@/lib/openFoodFacts";
import {
  findRecyclersForWasteType,
  formatDistanceKm,
  getSeededRecyclers,
  haversineDistanceKm,
} from "@/lib/recyclers";
import { computeScore, estimateKgCo2, explainScore } from "@/lib/scoring";
import {
  classifyWasteType,
  DISPOSAL_COPY,
  DISPOSAL_LABEL,
  getPackagingBreakdown,
  recommendDisposalAction,
  WASTE_TYPE_LABEL,
} from "@/lib/wasteMapping";
import type { Product, SustainabilityProfile } from "@/types/domain";

// ─── Section label ───
function SectionLabel({
  children,
  color,
}: {
  children: string;
  color?: string;
}) {
  const theme = useTheme();
  return (
    <Text
      variant="label"
      style={{
        color: color ?? theme.cardTextMuted,
        letterSpacing: 1.4,
        marginBottom: Space.sm,
      }}
    >
      {children}
    </Text>
  );
}

// ─── Info row ───
function InfoRow({
  label,
  value,
  accentColor,
  valueColor,
}: {
  label: string;
  value: string;
  accentColor?: string;
  valueColor?: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: Space.md + 2,
      }}
    >
      <Text
        variant="label"
        style={{
          color: accentColor ?? theme.cardTextMuted,
          letterSpacing: 1.3,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          paddingHorizontal: Space.md,
          paddingVertical: 5,
          borderRadius: Radius.pill,
          backgroundColor: (accentColor ?? theme.lichen) + "22",
          borderWidth: 1,
          borderColor: (accentColor ?? theme.lichen) + "40",
        }}
      >
        <Text
          variant="bodySm"
          style={{
            fontFamily: "Archivo_700Bold",
            color: valueColor ?? accentColor ?? theme.cardText,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Packaging item card ───
function PackagingItem({
  material,
  instruction,
  recyclable,
  index,
}: {
  material: string;
  instruction: string;
  recyclable: boolean;
  index: number;
}) {
  const theme = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: 400 + index * 70, type: "timing", duration: 320 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: Space.md,
          paddingVertical: Space.md + 2,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Color bar */}
        <View
          style={{
            width: 3.5,
            height: 36,
            borderRadius: 2,
            backgroundColor: recyclable ? theme.lichen : theme.clay,
            marginTop: 4,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text
            variant="body"
            style={{
              fontFamily: "Archivo_600SemiBold",
              color: theme.cardText,
            }}
          >
            {material}
          </Text>
          <Text
            variant="bodySm"
            style={{ color: theme.cardTextMuted, marginTop: 3 }}
          >
            {instruction}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: Space.sm,
            paddingVertical: 4,
            borderRadius: Radius.pill,
            backgroundColor: recyclable
              ? "rgba(98,157,60,0.20)"
              : "rgba(192,91,58,0.20)",
            borderWidth: 1,
            borderColor: recyclable
              ? "rgba(98,157,60,0.35)"
              : "rgba(192,91,58,0.35)",
          }}
        >
          <Text
            variant="monoSm"
            style={{
              fontFamily: "JetBrainsMono_700Bold",
              color: recyclable ? theme.lichen : theme.clay,
            }}
          >
            {recyclable ? "✓ Yes" : "✗ No"}
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

// ─── Loading screen ───
function LoadingScreen() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 500 }}
        style={{ alignItems: "center" }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: Radius.pill,
            backgroundColor: theme.card,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: Space.xl,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            ...Shadow.lg,
          }}
        >
          <ActivityIndicator color={theme.lichen} size="large" />
        </View>
        <Text
          style={{
            fontFamily: "Fraunces_600SemiBold",
            fontSize: 20,
            color: theme.text,
          }}
        >
          Reading this product…
        </Text>
        <Text
          variant="bodySm"
          color={theme.textMuted}
          style={{ marginTop: 8 }}
        >
          Checking the loop from source to disposal.
        </Text>
      </MotiView>
    </View>
  );
}

// ─── Main screen ───
export default function ProductScreen() {
  const theme = useTheme();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const { addScan } = useScanHistory();
  const { set: setContext } = useCurrentContext();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SustainabilityProfile | null>(null);
  const [recyclersNearby, setRecyclersNearby] = useState<
    ReturnType<typeof getSeededRecyclers>
  >([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const savedRef = React.useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      let location: { latitude: number; longitude: number } | null = null;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          location = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        }
      } catch {
        // proceed without location
      }

      const recyclers = getSeededRecyclers(location);
      let product: Product | null = await fetchProductByBarcode(barcode);
      if (!product) product = fallbackProductForBarcode(barcode);

      const wasteType = classifyWasteType(product);
      const disposalAction = recommendDisposalAction(product, wasteType);
      const matches = findRecyclersForWasteType(recyclers, wasteType);
      const score = computeScore(product, wasteType, matches.length > 0);
      const explanation = explainScore(score, product);

      if (cancelled) return;

      setProfile({
        product,
        score,
        wasteType,
        disposalAction,
        explanation,
        alternativesHint: "",
      });
      setRecyclersNearby(recyclers);
      setUserLocation(location);
      setLoading(false);

      setContext({
        product,
        score,
        wasteType,
        disposalAction,
        recyclers,
        userLocation: location,
      });

      if (!savedRef.current) {
        savedRef.current = true;
        addScan({
          id: `${barcode}-${Date.now()}`,
          barcode,
          productName: product.name,
          brand: product.brand,
          scoreTotal: score.total,
          wasteType,
          disposalAction,
          scannedAt: new Date().toISOString(),
          estimatedKgCo2: estimateKgCo2(score),
          recyclable: disposalAction !== "dispose",
        });
      }
    }

    run();
    return () => { cancelled = true; };
  }, [barcode, addScan, setContext]);

  if (loading || !profile) {
    return <LoadingScreen />;
  }

  const { product, score, wasteType, disposalAction, explanation } = profile;
  const packagingBreakdown = getPackagingBreakdown(product);
  const matches = findRecyclersForWasteType(recyclersNearby, wasteType);
  const nearest = matches[0];
  const distance =
    nearest && userLocation
      ? haversineDistanceKm(userLocation, nearest)
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={packagingBreakdown}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Space["4xl"] + 20,
        }}
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: Space.lg }}>
            <PackagingItem
              material={item.material}
              instruction={item.instruction}
              recyclable={item.recyclable}
              index={index}
            />
          </View>
        )}
        ListHeaderComponent={
          <>
            {/* ─── Header ─── */}
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400 }}
            >
              {/* Back button + source badge row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: Space.lg,
                  paddingTop: 56,
                  paddingBottom: Space.sm,
                }}
              >
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={12}
                  style={({ pressed }) => ({
                    width: 40,
                    height: 40,
                    borderRadius: Radius.sm,
                    backgroundColor: pressed ? theme.cardAlt : theme.card,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    ...Shadow.sm,
                  })}
                >
                  <ChevronLeft size={22} color={theme.cardText} />
                </Pressable>

                {/* Source badge */}
                <View
                  style={{
                    paddingHorizontal: Space.md,
                    paddingVertical: 5,
                    borderRadius: Radius.pill,
                    backgroundColor:
                      product.source === "fallback"
                        ? "rgba(212,149,42,0.18)"
                        : "rgba(26,138,122,0.18)",
                    borderWidth: 1,
                    borderColor:
                      product.source === "fallback"
                        ? "rgba(212,149,42,0.35)"
                        : "rgba(26,138,122,0.35)",
                  }}
                >
                  <Text
                    variant="monoSm"
                    style={{
                      fontFamily: "JetBrainsMono_700Bold",
                      color:
                        product.source === "fallback"
                          ? theme.gold
                          : theme.teal,
                    }}
                  >
                    {product.source === "fallback"
                      ? "DEMO DATA"
                      : "OPEN FOOD FACTS"}
                  </Text>
                </View>
              </View>

              {/* Product name + brand */}
              <View
                style={{
                  paddingHorizontal: Space.lg,
                  paddingBottom: Space.md,
                  paddingTop: Space.sm,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Fraunces_900Black",
                    fontSize: 30,
                    lineHeight: 36,
                    color: theme.text,
                    maxWidth: 300,
                  }}
                >
                  {product.name}
                </Text>
                {product.brand && (
                  <Text
                    variant="body"
                    color={theme.textSecondary}
                    style={{ marginTop: 4 }}
                  >
                    {product.brand}
                  </Text>
                )}
              </View>
            </MotiView>

            {/* ─── Score Gauge — hero card (beige surface card) ─── */}
            <MotiView
              from={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 150, type: "timing", duration: 550 }}
              style={{ marginHorizontal: Space.lg }}
            >
              <View
                style={{
                  backgroundColor: theme.cardSurface,
                  borderRadius: Radius.xl,
                  borderWidth: 2,
                  borderColor: theme.lichenDark + "25",
                  padding: Space["2xl"],
                  alignItems: "center",
                  ...Shadow.lg,
                }}
              >
                <ScoreGauge score={score.total} size={168} />
                <Text
                  variant="bodySm"
                  color={theme.textMuted}
                  style={{
                    marginTop: Space.lg,
                    maxWidth: 260,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  {explanation}
                </Text>
              </View>
            </MotiView>

            {/* ─── Score breakdown ─── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 250, type: "timing", duration: 400 }}
              style={{
                marginTop: Space.lg,
                marginHorizontal: Space.lg,
                backgroundColor: theme.cardSurface,
                borderRadius: Radius.xl,
                borderWidth: 1.5,
                borderColor: theme.lichenDark + "20",
                padding: Space.lg,
                ...Shadow.md,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Space.sm,
                  marginBottom: 4,
                }}
              >
                <Zap size={16} color={theme.lichenDark} strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: "Fraunces_600SemiBold",
                    fontSize: 16,
                    color: theme.text,
                  }}
                >
                  Score breakdown
                </Text>
              </View>
              <Text
                variant="bodySm"
                color={theme.textMuted}
                style={{ marginBottom: Space.lg }}
              >
                How each factor contributed to the total.
              </Text>
              <FactorBar score={score} />
            </MotiView>

            {/* ─── Waste type + Disposal action ─── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 320, type: "timing", duration: 400 }}
              style={{
                marginTop: Space.lg,
                marginHorizontal: Space.lg,
                backgroundColor: theme.card,
                borderRadius: Radius.xl,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                paddingHorizontal: Space.lg,
                ...Shadow.md,
              }}
            >
              <InfoRow
                label="WASTE TYPE"
                value={WASTE_TYPE_LABEL[wasteType]}
                accentColor={theme.clay}
              />
              <View
                style={{ height: 1, backgroundColor: "rgba(255,255,255,0.10)" }}
              />
              <InfoRow
                label="NEXT ACTION"
                value={DISPOSAL_LABEL[disposalAction]}
                accentColor={theme.lichen}
              />
            </MotiView>

            {/* ─── Disposal guidance ─── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 380, type: "timing", duration: 400 }}
              style={{
                marginTop: Space.md,
                marginHorizontal: Space.lg,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  backgroundColor: theme.card,
                  borderRadius: Radius.lg,
                  padding: Space.lg,
                  gap: Space.md,
                  borderWidth: 1,
                  borderColor: "rgba(98,157,60,0.25)",
                  ...Shadow.sm,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: Radius.xs,
                    backgroundColor: "rgba(98,157,60,0.18)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <Leaf size={17} color={theme.lichen} strokeWidth={2} />
                </View>
                <Text
                  variant="body"
                  style={{
                    flex: 1,
                    lineHeight: 22,
                    color: theme.cardText,
                  }}
                >
                  {DISPOSAL_COPY[disposalAction]}
                </Text>
              </View>
            </MotiView>

            {/* ─── Packaging breakdown header ─── */}
            <View
              style={{
                marginTop: Space["2xl"],
                paddingHorizontal: Space.lg,
                marginBottom: Space.sm,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Space.sm,
                  marginBottom: 4,
                }}
              >
                <Package size={16} color={theme.lichenDark} strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: "Fraunces_600SemiBold",
                    fontSize: 18,
                    color: theme.text,
                  }}
                >
                  Packaging
                </Text>
              </View>
              <Text variant="bodySm" color={theme.textMuted}>
                Each component and how to handle it.
              </Text>
            </View>

            {/* Packaging card container open */}
            <View
              style={{
                marginHorizontal: Space.lg,
                backgroundColor: theme.card,
                borderRadius: Radius.xl,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                paddingHorizontal: Space.lg,
                paddingTop: Space.sm,
                ...Shadow.md,
              }}
            >
            </View>
          </>
        }
        ListFooterComponent={
          <>
            {/* Close packaging card */}
            <View
              style={{
                marginHorizontal: Space.lg,
                backgroundColor: theme.card,
                borderRadius: Radius.xl,
                paddingBottom: Space.sm,
              }}
            />

            {/* ─── Nearest recycler ─── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 500, type: "timing", duration: 400 }}
              style={{ marginTop: Space["2xl"], paddingHorizontal: Space.lg }}
            >
              <Text
                style={{
                  fontFamily: "Fraunces_600SemiBold",
                  fontSize: 18,
                  color: theme.text,
                  marginBottom: Space.md,
                }}
              >
                Drop off nearby
              </Text>

              {nearest ? (
                <Pressable
                  onPress={() => router.push(`/recycler/${nearest.id}`)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: pressed ? theme.cardAlt : theme.card,
                    borderRadius: Radius.lg,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    padding: Space.lg,
                    gap: Space.md,
                    ...Shadow.md,
                  })}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: Radius.sm,
                      backgroundColor: "rgba(26,138,122,0.20)",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "rgba(26,138,122,0.30)",
                    }}
                  >
                    <MapPin size={20} color={theme.teal} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="body"
                      style={{
                        fontFamily: "Archivo_600SemiBold",
                        color: theme.cardText,
                      }}
                      numberOfLines={1}
                    >
                      {nearest.name}
                    </Text>
                    <Text
                      variant="bodySm"
                      style={{ color: theme.cardTextMuted, marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {nearest.notes}
                    </Text>
                  </View>
                  {distance !== null && (
                    <View
                      style={{
                        paddingHorizontal: Space.sm,
                        paddingVertical: 4,
                        borderRadius: Radius.pill,
                        backgroundColor: "rgba(98,157,60,0.18)",
                        borderWidth: 1,
                        borderColor: "rgba(98,157,60,0.30)",
                      }}
                    >
                      <Text
                        variant="monoSm"
                        style={{
                          fontFamily: "JetBrainsMono_700Bold",
                          color: theme.lichen,
                        }}
                      >
                        {formatDistanceKm(distance)}
                      </Text>
                    </View>
                  )}
                  <ArrowRight size={16} color={theme.cardTextMuted} strokeWidth={2} />
                </Pressable>
              ) : (
                <View
                  style={{
                    padding: Space.xl,
                    backgroundColor: theme.card,
                    borderRadius: Radius.lg,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    alignItems: "center",
                    ...Shadow.sm,
                  }}
                >
                  <MapPin
                    size={22}
                    color={theme.cardTextMuted}
                    style={{ marginBottom: Space.sm }}
                  />
                  <Text
                    variant="bodySm"
                    style={{
                      textAlign: "center",
                      color: theme.cardTextMuted,
                      maxWidth: 240,
                      lineHeight: 20,
                    }}
                  >
                    No nearby recycler accepts this stream. Check your municipal
                    collection schedule.
                  </Text>
                </View>
              )}
            </MotiView>

            {/* ─── AI Advisor CTA ─── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 560, type: "timing", duration: 400 }}
              style={{ marginTop: Space.lg, paddingHorizontal: Space.lg }}
            >
              <Pressable
                onPress={() => router.push("/advisor")}
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: pressed
                    ? "rgba(212,149,42,0.25)"
                    : "rgba(212,149,42,0.15)",
                  borderRadius: Radius.xl,
                  padding: Space.xl,
                  gap: Space.lg,
                  opacity: pressed ? 0.88 : 1,
                  borderWidth: 1.5,
                  borderColor: "rgba(212,149,42,0.35)",
                  ...Shadow.md,
                })}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: Radius.pill,
                    backgroundColor: theme.gold,
                    alignItems: "center",
                    justifyContent: "center",
                    ...Shadow.sm,
                  }}
                >
                  <Sparkles size={22} color="#FFFFFF" strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    variant="body"
                    style={{
                      fontFamily: "Archivo_700Bold",
                      color: theme.goldDark,
                    }}
                  >
                    Ask the AI advisor
                  </Text>
                  <Text
                    variant="bodySm"
                    style={{
                      color: theme.goldDark,
                      marginTop: 3,
                      opacity: 0.75,
                      lineHeight: 18,
                    }}
                  >
                    Get alternatives, recycling tips, and value recovery options.
                  </Text>
                </View>
                <ArrowRight size={18} color={theme.goldDark} strokeWidth={2} />
              </Pressable>
            </MotiView>

            <View style={{ height: Space["3xl"] }} />
          </>
        }
      />
    </View>
  );
}
