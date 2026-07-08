import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowRight,
  ChevronLeft,
  Clock,
  MapPin,
  Navigation,
  Truck
} from "lucide-react-native";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useAuthGate } from "@/hooks/use-auth-gate";
import { useTheme } from "@/hooks/use-theme";
import {
  formatDistanceKm,
  getSeededRecyclers,
  haversineDistanceKm,
} from "@/lib/recyclers";
import { WASTE_TYPE_LABEL } from "@/lib/wasteMapping";
import type { Recycler } from "@/types/domain";

// ─── Kind metadata ───
const KIND_THEME: Record<Recycler["kind"], { accent: string; label: string }> =
  {
    recycler: { accent: "teal", label: "Recycler" },
    "collection-point": { accent: "lichen", label: "Collection point" },
    donation: { accent: "gold", label: "Donation hub" },
    resale: { accent: "clay", label: "Resale counter" },
  };

// ─── Section reveal wrapper ───
function Section({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 14 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay, type: "timing", duration: 420 }}
      style={style}
    >
      {children}
    </MotiView>
  );
}

// ─── Detail row (label + value inside a card) ───
function DetailRow({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  const theme = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, translateX: -8 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay, type: "timing", duration: 300 }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: Space.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderLight,
        }}
      >
        <Text variant="body" color={theme.textSecondary}>
          {label}
        </Text>
        <Text variant="body" style={{ fontFamily: "Archivo_600SemiBold" }}>
          {value}
        </Text>
      </View>
    </MotiView>
  );
}

// ─── Loading state ───
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
        from={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 800,
          loop: true,
          repeatReverse: true,
        }}
      >
        <ActivityIndicator color={theme.lichen} size="large" />
      </MotiView>
    </View>
  );
}

// ─── Not found state ───
function NotFound() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: Space.lg,
          paddingTop: insets.top + Space.sm,
          paddingBottom: Space.lg,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <ChevronLeft size={24} color={theme.text} />
        </Pressable>
        <Text
          variant="body"
          style={{
            fontFamily: "Archivo_600SemiBold",
            marginLeft: Space.sm,
          }}
        >
          Recycler
        </Text>
      </View>

      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 150, type: "timing", duration: 450 }}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: Space.xl,
          paddingBottom: 80,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: Radius.pill,
            backgroundColor: theme.lichenMuted,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: Space.xl,
          }}
        >
          <MapPin size={28} color={theme.lichen} strokeWidth={1.5} />
        </View>
        <Text variant="h1" style={{ textAlign: "center" }}>
          Recycler not found
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
          This location may have been removed or the link is incorrect.
        </Text>
      </MotiView>
    </View>
  );
}

// ─── Main screen ───
export default function RecyclerDetailScreen() {
  const theme = useTheme();
  const { isAuthenticated, loading: authLoading } = useAuthGate();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [recycler, setRecycler] = useState<Recycler | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace({ pathname: "/login", params: { redirect: `/recycler/${id}` } });
      return;
    }
    if (!isAuthenticated) return;

    (async () => {
      let location: {
        latitude: number;
        longitude: number;
      } | null = null;
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
        // proceed without distance
      }
      const list = getSeededRecyclers(location);
      const found = list.find((r) => r.id === id) ?? null;
      setRecycler(found);
      if (found && location) {
        setDistance(haversineDistanceKm(location, found));
      }
      setLoading(false);
    })();
  }, [id, authLoading, isAuthenticated]);

  // ── Loading ──
  if (!isAuthenticated) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  // ── Not found ──
  if (!recycler) {
    return <NotFound />;
  }

  const kindInfo = KIND_THEME[recycler.kind];
  const accentColor = (theme as any)[kindInfo.accent];
  const accentSoft = (theme as any)[kindInfo.accent + "Soft"] ?? theme.lichenSoft;
  const accentDark = (theme as any)[kindInfo.accent + "Dark"] ?? accentColor;

  const openDirections = () => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(
      `${recycler.latitude},${recycler.longitude}`,
    )}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          paddingHorizontal: Space.lg,
          paddingTop: insets.top + Space.sm,
          paddingBottom: Space.sm,
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: Space.lg,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <ChevronLeft size={24} color={theme.text} />
            </Pressable>
            <Text
              variant="body"
              style={{
                fontFamily: "Archivo_600SemiBold",
                marginLeft: Space.sm,
              }}
            >
              Details
            </Text>
          </View>
        </MotiView>
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: Space.lg,
        }}
      >
        {/* ─── Hero ─── */}
        <Section delay={60}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: Space.lg,
            }}
          >
            {/* Accent bar */}
            <View
              style={{
                width: 4,
                height: 56,
                borderRadius: 2,
                backgroundColor: accentColor,
                marginTop: 4,
              }}
            />

            <View style={{ flex: 1 }}>
              {/* Kind pill */}
              <View
                style={{
                  alignSelf: "flex-start",
                  paddingHorizontal: Space.md,
                  paddingVertical: 3,
                  borderRadius: Radius.pill,
                  backgroundColor: accentSoft,
                  marginBottom: Space.md,
                }}
              >
                <Text
                  variant="monoSm"
                  style={{
                    fontFamily: "JetBrainsMono_700Bold",
                    color: accentDark,
                  }}
                >
                  {kindInfo.label.toUpperCase()}
                </Text>
              </View>

              <Text variant="display" style={{ maxWidth: 280 }}>
                {recycler.name}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: Space.xs,
                  marginTop: Space.sm,
                }}
              >
                <MapPin size={13} color={theme.textMuted} strokeWidth={2} />
                <Text
                  variant="body"
                  color={theme.textSecondary}
                  style={{ flex: 1 }}
                >
                  {recycler.address}
                </Text>
              </View>
            </View>
          </View>
        </Section>

        {/* ─── Distance highlight ─── */}
        {distance !== null && (
          <Section delay={140} style={{ marginTop: Space.xl }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: Space.md,
                backgroundColor: theme.lichenMuted,
                borderRadius: Radius.lg,
                paddingVertical: Space.md + 2,
                paddingHorizontal: Space.lg,
              }}
            >
              <Navigation size={16} color={theme.lichenDark} strokeWidth={2} />
              <Text
                variant="body"
                style={{
                  fontFamily: "Archivo_600SemiBold",
                  color: theme.lichenDark,
                }}
              >
                {formatDistanceKm(distance)}
              </Text>
              <Text
                variant="bodySm"
                color={theme.lichenDark}
                style={{ opacity: 0.7 }}
              >
                from your location
              </Text>
            </View>
          </Section>
        )}

        {/* ─── Accepted waste types ─── */}
        <Section delay={200} style={{ marginTop: Space.xl }}>
          <Text
            variant="label"
            color={theme.textMuted}
            style={{ letterSpacing: 1.4, marginBottom: Space.md }}
          >
            ACCEPTED WASTE
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: Space.sm,
            }}
          >
            {recycler.acceptedWaste.map((w, i) => (
              <MotiView
                key={w}
                from={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 260 + i * 60,
                  type: "timing",
                  duration: 250,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: Space.md + 2,
                    paddingVertical: Space.sm,
                    borderRadius: Radius.pill,
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text
                    variant="bodySm"
                    style={{ fontFamily: "Archivo_500Medium" }}
                  >
                    {WASTE_TYPE_LABEL[w]}
                  </Text>
                </View>
              </MotiView>
            ))}
          </View>
        </Section>

        {/* ─── Details card ─── */}
        <Section delay={300} style={{ marginTop: Space.xl }}>
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: Radius.xl,
              borderWidth: 1,
              borderColor: theme.borderLight,
              paddingHorizontal: Space.lg,
              paddingVertical: Space.sm,
              ...Shadow.sm,
            }}
          >
            <DetailRow label="Type" value={kindInfo.label} delay={340} />
            <DetailRow
              label="Waste streams"
              value={`${recycler.acceptedWaste.length} types`}
              delay={380}
            />
            {distance !== null && (
              <DetailRow
                label="Distance"
                value={formatDistanceKm(distance)}
                delay={420}
              />
            )}
            {recycler.hasTransportPartner && (
              <DetailRow label="Pickup service" value="Available" delay={460} />
            )}
          </View>
        </Section>

        {/* ─── Transport partner callout ─── */}
        {recycler.hasTransportPartner && (
          <Section delay={380} style={{ marginTop: Space.lg }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: Space.md,
                backgroundColor: theme.goldSoft,
                borderRadius: Radius.lg,
                padding: Space.lg,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: Radius.sm,
                  backgroundColor: theme.gold,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                }}
              >
                <Truck size={16} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  variant="body"
                  style={{
                    fontFamily: "Archivo_600SemiBold",
                    color: theme.goldDark,
                  }}
                >
                  Pickup available
                </Text>
                <Text
                  variant="bodySm"
                  color={theme.goldDark}
                  style={{ marginTop: 4, opacity: 0.8, lineHeight: 20 }}
                >
                  This partner runs scheduled pickups. Batch your items together
                  and request a collection instead of visiting individually.
                </Text>
              </View>
            </View>
          </Section>
        )}

        {/* ─── Notes ─── */}
        {recycler.notes && (
          <Section delay={440} style={{ marginTop: Space.lg }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: Space.md,
                backgroundColor: theme.card,
                borderRadius: Radius.lg,
                borderWidth: 1,
                borderColor: theme.borderLight,
                padding: Space.lg,
                ...Shadow.sm,
              }}
            >
              <Clock
                size={16}
                color={theme.textMuted}
                strokeWidth={2}
                style={{ marginTop: 3 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  variant="monoSm"
                  color={theme.textMuted}
                  style={{
                    fontFamily: "JetBrainsMono_700Bold",
                    marginBottom: 4,
                  }}
                >
                  NOTES
                </Text>
                <Text
                  variant="body"
                  color={theme.textSecondary}
                  style={{ lineHeight: 22 }}
                >
                  {recycler.notes}
                </Text>
              </View>
            </View>
          </Section>
        )}
      </View>

      {/* ─── Bottom CTA — pinned ─── */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 500, type: "timing", duration: 400 }}
        style={{
          paddingHorizontal: Space.lg,
          paddingTop: Space.md,
          paddingBottom: Space["3xl"],
          backgroundColor: theme.background,
        }}
      >
        <Pressable
          onPress={openDirections}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: Space.md,
            paddingVertical: Space.lg,
            borderRadius: Radius.xl,
            backgroundColor: theme.lichen,
            opacity: pressed ? 0.85 : 1,
            ...Shadow.md,
          })}
        >
          <Navigation size={18} color="#FFFFFF" strokeWidth={2.5} />
          <Text variant="buttonLg" style={{ color: "#FFFFFF" }}>
            Get directions
          </Text>
          <ArrowRight size={16} color="#FFFFFF" strokeWidth={2} />
        </Pressable>

        <Pressable
          onPress={() =>
            Linking.openURL(`tel:${(recycler as any).phone ?? ""}`).catch(() => {})
          }
          style={({ pressed }) => ({
            alignItems: "center",
            paddingVertical: Space.md,
            marginTop: Space.sm,
            opacity: pressed ? 0.5 : 0.7,
          })}
        >
          <Text variant="bodySm" color={theme.textMuted}>
            Or call ahead to confirm hours
          </Text>
        </Pressable>
      </MotiView>
    </View>
  );
}
