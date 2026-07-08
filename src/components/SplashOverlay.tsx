import { MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

// Peach background — matches app.json splash backgroundColor
const SPLASH_BG = "#F2E3BC";

// Minimum time the animated splash stays visible (ms).
// The logo entrance animation is 900 ms + text fades start at 350/600 ms,
// so 1400 ms ensures the whole sequence plays through before dismissing.
const MIN_DISPLAY_MS = 1400;

const { width: SCREEN_W } = Dimensions.get("window");

interface SplashOverlayProps {
  /** Flip to false when fonts/resources are ready; overlay plays its exit then unmounts. */
  visible: boolean;
}

export function SplashOverlay({ visible }: SplashOverlayProps) {
  const mountTime = useRef(Date.now());
  const [canDismiss, setCanDismiss] = useState(false);
  const [mounted, setMounted] = useState(true);

  // Enforce minimum display so the entrance animation finishes before exit begins
  useEffect(() => {
    const elapsed = Date.now() - mountTime.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    const t = setTimeout(() => setCanDismiss(true), remaining);
    return () => clearTimeout(t);
  }, []);

  // Only exit once fonts are ready AND the min animation time has elapsed
  const shouldShow = visible || !canDismiss;

  useEffect(() => {
    if (!shouldShow) {
      // Let exit animation (650 ms) finish before hard-unmounting
      const t = setTimeout(() => setMounted(false), 700);
      return () => clearTimeout(t);
    } else {
      setMounted(true);
    }
  }, [shouldShow]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Background */}
      <MotiView
        style={[StyleSheet.absoluteFillObject, { backgroundColor: SPLASH_BG }]}
        animate={{ opacity: shouldShow ? 1 : 0 }}
        transition={{
          type: "timing",
          duration: 500,
          delay: shouldShow ? 0 : 200,
        }}
      />

      <View style={styles.center}>
        {/* Logo — curved card (borderRadius: 28 clips to rounded rectangle) */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 18,
            scale: 0.94,
            rotate: "-2deg",
          }}
          animate={
            shouldShow
              ? {
                opacity: 1,
                translateY: 0,
                scale: 1,
                rotate: "0deg",
              }
              : {
                opacity: 0,
                translateY: -10,
                scale: 0.98,
              }
          }
          transition={{
            type: "timing",
            duration: 900,
          }}
        >
          <Image
            source={require("../../assets/images/icon.png")}
            resizeMode="contain"
            style={{
              width: 160,
              height: 160,
              borderRadius: 28,
            }}
          />
        </MotiView>

        {/* EcoChain */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 15,
          }}
          animate={
            shouldShow
              ? {
                opacity: 1,
                translateY: 0,
              }
              : {
                opacity: 0,
              }
          }
          transition={{
            delay: 350,
            duration: 600,
            type: "timing",
          }}
        >
          <Text style={styles.title}>EcoChain</Text>
        </MotiView>

        {/* Link */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 10,
          }}
          animate={
            shouldShow
              ? {
                opacity: 1,
                translateY: 0,
              }
              : {
                opacity: 0,
              }
          }
          transition={{
            delay: 600,
            duration: 500,
            type: "timing",
          }}
        >
          <Text style={styles.link}>Link</Text>
        </MotiView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    marginTop: 14,
    fontSize: 34,
    fontWeight: "800",
    color: "#1F1F1F",
    letterSpacing: 0.4,
  },

  link: {
    marginTop: -2,
    marginLeft: 72,
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    letterSpacing: 0.6,
  },
});
