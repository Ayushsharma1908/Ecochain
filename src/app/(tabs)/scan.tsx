import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { router } from "expo-router";
import { ChevronLeft, Keyboard, ScanBarcode } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Button, Text } from "@/components/ui";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useAuthGate } from "@/hooks/use-auth-gate";
import { useTheme } from "@/hooks/use-theme";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FRAME_W = 280;
const FRAME_H = 170;
const CORNER_LEN = 38;
const CORNER_W = 3;
const CORNER_R = 14;
const MASK_COLOR = "rgba(0,0,0,0.58)";
const ACCENT = "#629D3C";
const CREAM = "#FDF5E4";

/* ------------------------------------------------------------------ */
/*  Scan laser                                                         */
/* ------------------------------------------------------------------ */

function ScanLine() {
  return (
    <MotiView
      from={{ top: 8 }}
      animate={{ top: FRAME_H - 12 }}
      transition={{
        type: "timing",
        duration: 1800,
        loop: true,
        repeatReverse: true,
      }}
      style={{
        position: "absolute",
        left: 14,
        right: 14,
        height: 2,
        borderRadius: 1,
        backgroundColor: ACCENT,
        shadowColor: ACCENT,
        shadowOpacity: 0.9,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Corner bracket                                                     */
/* ------------------------------------------------------------------ */

function Corner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const pos = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  }[position];

  const border = {
    tl: {
      borderTopWidth: CORNER_W,
      borderLeftWidth: CORNER_W,
      borderTopLeftRadius: CORNER_R,
    },
    tr: {
      borderTopWidth: CORNER_W,
      borderRightWidth: CORNER_W,
      borderTopRightRadius: CORNER_R,
    },
    bl: {
      borderBottomWidth: CORNER_W,
      borderLeftWidth: CORNER_W,
      borderBottomLeftRadius: CORNER_R,
    },
    br: {
      borderBottomWidth: CORNER_W,
      borderRightWidth: CORNER_W,
      borderBottomRightRadius: CORNER_R,
    },
  }[position];

  return (
    <View
      style={{
        position: "absolute",
        width: CORNER_LEN,
        height: CORNER_LEN,
        borderColor: ACCENT,
        ...pos,
        ...border,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Manual entry screen                                                */
/* ------------------------------------------------------------------ */

function ManualEntry({ onClose }: { onClose: () => void }) {
  const theme = useTheme();
  const [value, setValue] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const submit = () => {
    if (value.trim().length >= 3) {
      router.push(`/product/${encodeURIComponent(value.trim())}`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 60,
          paddingHorizontal: Space.lg,
          paddingBottom: Space.lg,
          gap: Space.sm,
        }}
      >
        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: Radius.sm,
            backgroundColor: pressed ? theme.cardAlt : theme.card,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme.cardBorder,
          })}
        >
          <ChevronLeft size={22} color={theme.cardText} />
        </Pressable>
        <Text
          variant="body"
          style={{ fontFamily: "Archivo_600SemiBold", color: theme.text }}
        >
          Manual entry
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1, padding: Space.xl, paddingTop: Space["2xl"] }}>
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
          style={{ alignItems: "center", marginBottom: Space["3xl"] }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: Radius.pill,
              backgroundColor: theme.card,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: Space.lg,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              ...Shadow.md,
            }}
          >
            <Keyboard size={28} color={theme.lichen} strokeWidth={1.5} />
          </View>
          <Text
            style={{
              fontFamily: "Fraunces_900Black",
              fontSize: 22,
              color: theme.text,
              textAlign: "center",
            }}
          >
            Enter barcode or name
          </Text>
          <Text
            variant="bodySm"
            color={theme.textMuted}
            style={{
              textAlign: "center",
              marginTop: 8,
              maxWidth: 260,
              lineHeight: 20,
            }}
          >
            Useful when a package is damaged or the camera cannot get a clean
            read.
          </Text>
        </MotiView>

        <View
          style={{
            borderRadius: Radius.lg,
            borderWidth: 2,
            borderColor: theme.lichenDark,
            marginBottom: Space.lg,
            backgroundColor: theme.card,
            ...Shadow.sm,
          }}
        >
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={setValue}
            placeholder="e.g. 3017620422003 or Kissan Jam"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={submit}
            style={{
              paddingVertical: Space.lg,
              paddingHorizontal: Space.xl,
              fontFamily: "JetBrainsMono_500Medium",
              fontSize: 18,
              color: theme.text,
              letterSpacing: 0.5,
            }}
          />
        </View>

        <Button
          label="Look up product"
          fullWidth
          disabled={value.trim().length < 3}
          onPress={submit}
        />

        <Text
          variant="monoSm"
          color={theme.textMuted}
          style={{ textAlign: "center", marginTop: Space.md }}
        >
          Supports EAN-13, UPC, or product names
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Permission screen                                                  */
/* ------------------------------------------------------------------ */

function PermissionView({
  onGrant,
  onManual,
}: {
  onGrant: () => void;
  onManual: () => void;
}) {
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
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={{ alignItems: "center", width: "100%" }}
      >
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: Radius.pill,
            backgroundColor: theme.card,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: Space["2xl"],
            borderWidth: 1,
            borderColor: theme.cardBorder,
            ...Shadow.lg,
          }}
        >
          <ScanBarcode size={36} color={theme.lichen} strokeWidth={1.5} />
        </View>

        <Text
          style={{
            fontFamily: "Fraunces_900Black",
            fontSize: 24,
            color: theme.text,
            textAlign: "center",
          }}
        >
          Camera access needed
        </Text>
        <Text
          variant="body"
          color={theme.textSecondary}
          style={{
            textAlign: "center",
            marginTop: Space.sm,
            maxWidth: 280,
            lineHeight: 22,
          }}
        >
          EcoLink scans barcodes locally on your device. Nothing is recorded or
          uploaded.
        </Text>

        <View style={{ marginTop: Space["3xl"], width: "100%" }}>
          <Button
            label="Enable camera"
            icon={ScanBarcode}
            onPress={onGrant}
            fullWidth
          />
        </View>

        <Pressable
          onPress={onManual}
          style={({ pressed }) => ({
            marginTop: Space.xl,
            opacity: pressed ? 0.5 : 1,
            paddingVertical: Space.sm,
          })}
        >
          <Text variant="bodySm" color={theme.lichenDark}>
            Enter a barcode manually instead
          </Text>
        </Pressable>
      </MotiView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main scan screen                                                   */
/* ------------------------------------------------------------------ */

export default function ScanScreen() {
  const theme = useTheme();
  const { isAuthenticated, loading } = useAuthGate();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualMode, setManualMode] = useState(false);
  const lockRef = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace({ pathname: "/login", params: { redirect: "/(tabs)/scan" } });
  }, [isAuthenticated, loading]);

  const handleScanned = useCallback((result: BarcodeScanningResult) => {
    if (lockRef.current) return;
    lockRef.current = true;
    router.push(`/product/${result.data}`);
    setTimeout(() => {
      lockRef.current = false;
    }, 1500);
  }, []);

  /* ── Branch views ── */
  if (!isAuthenticated) return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  if (manualMode) return <ManualEntry onClose={() => setManualMode(false)} />;
  if (!permission)
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  if (!permission.granted)
    return (
      <PermissionView
        onGrant={requestPermission}
        onManual={() => setManualMode(true)}
      />
    );

  /* ── Camera + overlay ── */
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "qr"],
        }}
        onBarcodeScanned={handleScanned}
      />

      {/* ── Mask overlay with window cutout ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top band */}
        <View style={{ flex: 1, backgroundColor: MASK_COLOR }} />

        {/* Middle row: left mask → scan window → right mask */}
        <View style={{ flexDirection: "row", height: FRAME_H }}>
          <View style={{ flex: 1, backgroundColor: MASK_COLOR }} />

          {/* Scan window */}
          <View style={{ width: FRAME_W, height: FRAME_H }}>
            {/* Subtle tint inside the window */}
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "rgba(253,245,228,0.04)",
                borderRadius: CORNER_R,
              }}
            />
            <Corner position="tl" />
            <Corner position="tr" />
            <Corner position="bl" />
            <Corner position="br" />
            <ScanLine />
          </View>

          <View style={{ flex: 1, backgroundColor: MASK_COLOR }} />
        </View>

        {/* Bottom band */}
        <View style={{ flex: 1, backgroundColor: MASK_COLOR }} />
      </View>

      {/* ── Interactive UI layer ── */}
      <View style={[StyleSheet.absoluteFill, styles.uiLayer]}>
        {/* Header: back + badge */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150, type: "timing", duration: 400 }}
          style={styles.header}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [
              styles.headerBtn,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <ChevronLeft size={22} color={CREAM} />
          </Pressable>

          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text
              variant="label"
              style={{ color: CREAM, letterSpacing: 1.5, fontSize: 11 }}
            >
              SCANNING
            </Text>
          </View>

          {/* Spacer to balance layout */}
          <View style={{ width: 38 }} />
        </MotiView>

        {/* Spacer above viewfinder label */}
        <View style={{ flex: 1 }} />

        {/* Instruction below viewfinder */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 500, type: "timing", duration: 400 }}
          style={{ alignItems: "center", paddingHorizontal: Space.xl }}
        >
          <Text
            variant="bodySm"
            style={{
              color: "rgba(253,245,228,0.65)",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Point your camera at a barcode
          </Text>
          <Text
            variant="bodySm"
            style={{
              color: "rgba(253,245,228,0.40)",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            The scan happens automatically
          </Text>
        </MotiView>

        {/* Bottom section */}
        <View style={{ flex: 1 }} />

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, type: "timing", duration: 400 }}
          style={{ alignItems: "center", paddingBottom: 130 }}
        >
          <Pressable
            onPress={() => setManualMode(true)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: Space.sm,
              paddingHorizontal: Space.xl,
              paddingVertical: Space.md,
              borderRadius: Radius.pill,
              backgroundColor: "rgba(22,94,57,0.72)",
              borderWidth: 1,
              borderColor: "rgba(98,157,60,0.35)",
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Keyboard
              size={15}
              color="rgba(253,245,228,0.80)"
              strokeWidth={2}
            />
            <Text
              variant="bodySm"
              style={{ color: "rgba(253,245,228,0.80)" }}
            >
              Type barcode instead
            </Text>
          </Pressable>
        </MotiView>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  uiLayer: {
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.select({ ios: 60, android: 48 }),
    paddingHorizontal: Space.lg,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(22,94,57,0.72)",
    borderWidth: 1,
    borderColor: "rgba(98,157,60,0.40)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
});
