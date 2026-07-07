
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { View } from "react-native";

import { NavBar } from "@/components/nav-bar";
import { Radius, Space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

function useSkeletonColors() {
  const theme = useTheme();
  const isDark = theme.scheme === "dark";
  return isDark
    ? // Dark: shimmer between dark card shades
      (["#1A3326", "#234233", "#1A3326"] as [string, ...string[]])
    : // Light: shimmer between warm beige tones
      (["#EDE0C4", "#F7EDD6", "#EDE0C4"] as [string, ...string[]]);
}

function Shimmer({
  width,
  height,
  radius = Radius.md,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: object;
}) {
  const colors = useSkeletonColors();
  return (
    <Skeleton
      colorMode="light"
      colors={colors}
      width={width}
      height={height}
      radius={radius}
      {...(style ? { style } : {})}
    />
  );
}

export function HomeSkeleton() {
  const theme = useTheme();

  return (
    <MotiView
      style={{ flex: 1, backgroundColor: theme.background }}
      from={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <View
        style={{
          paddingHorizontal: Space.lg,
          paddingTop: Space.xs,
          flex: 1,
        }}
      >
        
        <NavBar />

        <View style={{ marginTop: Space["3xl"], gap: Space.sm }}>
          <Shimmer width="55%" height={34} radius={10} />
          <Shimmer width="80%" height={18} radius={8} />
          <Shimmer width="60%" height={18} radius={8} />
        </View>

        <View style={{ marginTop: Space["2xl"] }}>
          <Shimmer width="100%" height={160} radius={Radius.xl} />
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: Space.md,
            marginTop: Space.lg,
          }}
        >
          <Shimmer width="48%" height={100} radius={Radius.lg} />
          <Shimmer width="48%" height={100} radius={Radius.lg} />
        </View>

        <View style={{ marginTop: Space.sm }}>
          <Shimmer width="100%" height={64} radius={Radius.lg} />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: Space["2xl"],
            marginBottom: Space.sm,
          }}
        >
          <Shimmer width="38%" height={22} radius={8} />
          <Shimmer width="18%" height={18} radius={8} />
        </View>

        {[0, 1, 2].map((i) => (
          <View key={i} style={{ marginBottom: Space.sm }}>
            <Shimmer width="100%" height={66} radius={Radius.lg} />
          </View>
        ))}
      </View>
    </MotiView>
  );
}
