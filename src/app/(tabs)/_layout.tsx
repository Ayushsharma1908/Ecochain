import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { router, Tabs } from "expo-router";
import { BarChart3, Home, MapPin, ScanLine } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Shadow, Space } from "@/constants/theme";
import { useAuthGate } from "@/hooks/use-auth-gate";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const TAB_META = [
  { key: "index", title: "Home", Icon: Home },
  { key: "scan", title: "Scan", Icon: ScanLine },
  { key: "recyclers", title: "Map", Icon: MapPin },
  { key: "dashboard", title: "Stats", Icon: BarChart3 },
] as const;

const PILL_WIDTH = 74;

const PILL_RADIUS = 22;
const BAR_HEIGHT = Platform.select({ ios: 74, android: 72, default: 72 });
const PILL_HEIGHT = BAR_HEIGHT - 14;
const BAR_MARGIN = (Space.lg ?? 20) + 8;

/* ------------------------------------------------------------------ */
/*  Custom animated tab bar                                            */
/* ------------------------------------------------------------------ */

function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const { isAuthenticated, loading } = useAuthGate();
  const [barWidth, setBarWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const isFirst = useRef(true);

  const tabW = barWidth / 4;
  const pillOffset = Math.round((tabW - PILL_WIDTH) / 2);

  /* Slide the pill whenever the active tab (or bar width) changes */
  useEffect(() => {
    if (barWidth === 0) return;
    const target = state.index * tabW + pillOffset;

    if (isFirst.current) {
      // Snap instantly on first render — no slide-in from 0
      indicatorX.value = target;
      isFirst.current = false;
    } else {
      indicatorX.value = withSpring(target, {
        damping: 22,
        stiffness: 200,
        mass: 0.8,
      });
    }
  }, [state.index, barWidth]);

  const animatedPill = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const onBarLayout = useCallback(
    (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width),
    [],
  );

  /* ---------------------------------------------------------------- */

  return (
    <View
      style={{
        position: "absolute",
        left: BAR_MARGIN,
        right: BAR_MARGIN,
        bottom: Platform.select({ ios: 28, android: 22, default: 16 }),
        borderRadius: 28,
        overflow: "hidden",
        ...Shadow.lg,
        ...(Platform.OS === "ios"
          ? {
            shadowColor: "#0D3520",
            shadowOpacity: 0.25,
            shadowRadius: 30,
            shadowOffset: { width: 0, height: 14 },
          }
          : {}),
      }}
    >
      <BlurView
        intensity={100}
        tint="dark"
        style={{
          height: BAR_HEIGHT,
          borderRadius: 28,
          overflow: "hidden",
          backgroundColor: "rgba(18,40,28,0.92)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          shadowOpacity: 0.25
        }}
      >
        <View
          onLayout={onBarLayout}
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: BAR_HEIGHT,
          }}
        >
          {/* ---- Sliding white pill indicator ---- */}
          {barWidth > 0 && (
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: (BAR_HEIGHT - PILL_HEIGHT) / 2, width: PILL_WIDTH,
                  height: PILL_HEIGHT,
                  borderRadius: PILL_RADIUS,
                  backgroundColor: "rgba(255,255,255,0.13)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)"
                },
                animatedPill,
              ]}
            />
          )}

          {/* ---- Tab items ---- */}
          {state.routes.map((route, index) => {
            const meta = TAB_META.find((t) => t.key === route.name);
            if (!meta) return null;
            const { Icon, title } = meta;
            const focused = state.index === index;

            const onPress = () => {
              if (route.name !== "index" && !isAuthenticated && !loading) {
                router.push({ pathname: "/login", params: { redirect: `/(tabs)/${route.name}` } });
                return;
              }

              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  paddingVertical: 10
                }}
              >
                <Icon
                  color={focused ? "#FDF5E4" : "rgba(253,245,228,0.50)"}
                  size={22}
                  strokeWidth={focused ? 2.4 : 2}
                />
                <Text
                  style={{
                    fontFamily: "Archivo_600SemiBold",
                    fontSize: 11,
                    letterSpacing: 0.3,
                    color: focused ? "#FDF5E4" : "rgba(253,245,228,0.50)",
                    marginTop: 2
                  }}
                >
                  {title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="recyclers" />
      <Tabs.Screen name="dashboard" />
    </Tabs>
  );
}
