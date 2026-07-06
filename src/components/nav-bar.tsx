import { Image } from "expo-image";
import { router } from "expo-router";
import { LogIn } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@/components/ui";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";

// Avatar image map — images 1–9 must be placed in assets/images/avatars/
const AVATAR_IMAGES = [
  require("../../assets/images/avatars/avatar_1.png"),
  require("../../assets/images/avatars/avatar_2.png"),
  require("../../assets/images/avatars/avatar_3.png"),
  require("../../assets/images/avatars/avatar_4.png"),
  require("../../assets/images/avatars/avatar_5.png"),
  require("../../assets/images/avatars/avatar_6.png"),
  require("../../assets/images/avatars/avatar_7.png"),
  require("../../assets/images/avatars/avatar_8.png"),
  require("../../assets/images/avatars/avatar_9.png"),
];

function Avatar({ seed }: { seed: number }) {
  const source = AVATAR_IMAGES[seed % AVATAR_IMAGES.length];

  return (
    <View
      style={{
        width: 42,
        height: 42,
        borderRadius: Radius.pill,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.72)",
        ...Shadow.sm,
      }}
    >
      <Image
        source={source}
        style={{ width: 42, height: 42 }}
        contentFit="cover"
      />
    </View>
  );
}

export function NavBar() {
  const theme = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: insets.top + 10,
        paddingHorizontal: Space.md,
        paddingBottom: Space.sm,
        gap: Space.sm,
      }}
    >
      {/* Left section — Logo & Name */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: Space.sm,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: Radius.md,
            backgroundColor: theme.card,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme.cardBorder,
            overflow: "hidden",
            ...Shadow.sm,
          }}
        >
          <Image
            source={require("../../assets/images/icon.png")}
            style={{ width: 42, height: 42 }}
            contentFit="contain"
          />
        </View>
        <View>
          <Text
            numberOfLines={1}
            allowFontScaling={false}
            adjustsFontSizeToFit
            minimumFontScale={0.9}
            style={{
              color: theme.text,
            }}
          >
            EcoChain
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text variant="monoSm" color={theme.textMuted} numberOfLines={1} allowFontScaling={false}>
              Link
            </Text>
          </View>
        </View>
      </View>

      {/* Right section — Profile / Login */}
      {user ? (
        <Pressable
          onPress={() => router.push("/profile")}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
        >
          <Avatar seed={user.avatarSeed} />
        </Pressable>
      ) : (
        <View>
          <Button
            label="Login"
            icon={LogIn}
            size="sm"
            onPress={() => router.push("/login")}
            style={{
              minWidth: 120,
            }}
          />
        </View>
      )}
    </View>
  );
}