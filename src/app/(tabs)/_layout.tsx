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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Shadow, Space } from "@/constants/theme";
import { useAuthGate } from "@/hooks/use-auth-gate";
import { useColorScheme } from "@/hooks/use-color-scheme";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const TAB_META = [
  { key: "index", title: "Home", Icon: Home },
  { key: "scan", title: "Scan", Icon: ScanLine },
  { key: "recyclers", title: "Map", Icon: MapPin },
  { key: "dashboard", title: "Stats", Icon: BarChart3 },
] as const;

const PILL_WIDTH = 72;
const PILL_RADIUS = 20;
const ICON_SIZE = 22;
const LABEL_SIZE = 11;
const BAR_HEIGHT = Platform.select({ ios: 72, android: 68, default: 68 });
const PILL_HEIGHT = BAR_HEIGHT - 14;
const BAR_MARGIN = Space.lg;

/* ------------------------------------------------------------------ */
/*  Custom animated tab bar                                            */
/* ------------------------------------------------------------------ */

function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const { isAuthenticated, loading } = useAuthGate();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [barWidth, setBarWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const isFirst = useRef(true);
  const insets = useSafeAreaInsets();

  /* FIXED: Calculate tab width from full bar width, no extra padding offset needed */
  const tabW = barWidth / TAB_META.length;
  const pillOffset = (tabW - PILL_WIDTH) / 2;

  /* Slide the pill whenever the active tab (or bar width) changes */
  useEffect(() => {
    if (barWidth === 0) return;

    /* FIXED: Target is simply index * tab width + center offset */
    const target = state.index * tabW + pillOffset;

    if (isFirst.current) {
      indicatorX.value = target;
      isFirst.current = false;
    } else {
      indicatorX.value = withSpring(target, {
        damping: 24,
        stiffness: 220,
        mass: 0.7,
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

  // Dynamic colors based on theme
  const barBg = isDark ? "rgba(15,31,23,0.92)" : "rgba(22,94,57,0.95)";
  const barBorder = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(255,255,255,0.15)";
  const pillBg = isDark
    ? "rgba(255,255,255,0.10)"
    : "rgba(255,255,255,0.14)";
  const pillBorder = isDark
    ? "rgba(255,255,228,0.10)"
    : "rgba(255,255,255,0.18)";

  /* GREEN active color for both modes */
  const iconInactive = isDark
    ? "rgba(237,242,232,0.45)"
    : "rgba(253,245,228,0.55)";
  const iconActive = theme.lichen;
  const labelInactive = isDark
    ? "rgba(237,242,232,0.45)"
    : "rgba(253,245,228,0.55)";
  const labelActive = theme.lichen;
  const shadowColor = isDark ? "#000000" : "#0D3520";
  const activeGlow = "rgba(98,157,60,0.30)";
  const activeBg = "rgba(98,157,60,0.12)";

  return (
    <View
      style={{
        position: "absolute",
        left: BAR_MARGIN,
        right: BAR_MARGIN,
        bottom: Math.max(insets.bottom, 12) + 2,
        borderRadius: 26,
        overflow: "hidden",
        ...Shadow.lg,
        ...(Platform.OS === "ios"
          ? {
            shadowColor,
            shadowOpacity: isDark ? 0.4 : 0.25,
            shadowRadius: isDark ? 24 : 30,
            shadowOffset: { width: 0, height: isDark ? 10 : 14 },
          }
          : {
            elevation: 8,
          }),
      }}
    >
      <BlurView
        intensity={isDark ? 70 : 85}
        tint="dark"
        style={{
          height: BAR_HEIGHT,
          borderRadius: 26,

          backgroundColor: barBg,
          borderWidth: 1,
          borderColor: barBorder,
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
          {/* ---- Sliding accent pill indicator ---- */}
          {barWidth > 0 && (
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: (BAR_HEIGHT - PILL_HEIGHT) / 2,
                  width: PILL_WIDTH,
                  height: PILL_HEIGHT,
                  borderRadius: PILL_RADIUS,
                  backgroundColor: pillBg,
                  borderWidth: 1,
                  borderColor: pillBorder,

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
                router.push({
                  pathname: "/login",
                  params: { redirect: `/(tabs)/${route.name}` },
                });
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
                  height: PILL_HEIGHT,
                  borderRadius: PILL_RADIUS,
                }}
              >
                <View
                  style={
                    focused
                      ? {
                        shadowColor: theme.lichen,
                        shadowOpacity: 0.45,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 8,
                      }
                      : undefined
                  }
                >
                  <Icon
                    color={focused ? iconActive : iconInactive}
                    size={ICON_SIZE}
                    strokeWidth={focused ? 2.5 : 1.8}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={{
                    width: 44,
                    textAlign: "center",
                    fontFamily: "Archivo_600SemiBold",
                    fontSize: LABEL_SIZE,
                    letterSpacing: 0.3,
                    color: focused ? labelActive : labelInactive,
                    marginTop: 3,

                  }}
                >
                  {title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView >
    </View >
  );
}

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