import { router } from "expo-router";
import { LogOut, Mail, User, X } from "lucide-react-native";
import React from "react";
import { ScrollView, View } from "react-native";

import { Button, IconButton, Text } from "@/components/ui";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";

const AVATAR_COLORS = ["#629D3C", "#1A8A7A", "#D4952A", "#C05B3A", "#1E8A55", "#7EC24A", "#B07A1E", "#126057"];

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();

  const logout = async () => {
    await signOut();
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: Space.lg, paddingTop: Space.xl, paddingBottom: Space["4xl"] }}>
      <View style={{ alignItems: "flex-end" }}>
        <IconButton icon={X} onPress={() => router.back()} />
      </View>

      <View style={{ alignItems: "center", marginTop: Space.lg }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: Radius.pill,
            backgroundColor: AVATAR_COLORS[(user?.avatarSeed ?? 0) % AVATAR_COLORS.length],
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 4,
            borderColor: "rgba(255,255,255,0.72)",
            ...Shadow.lg,
          }}
        >
          <Text style={{ fontFamily: "Archivo_800ExtraBold", fontSize: 34, color: "#FFFFFF" }}>
            {(user?.name ?? "Eco User").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontFamily: "Fraunces_900Black", fontSize: 30, lineHeight: 36, color: theme.text, marginTop: Space.lg }}>
          {user?.name ?? "Eco User"}
        </Text>
        <Text variant="bodySm" color={theme.textMuted} style={{ marginTop: 4 }}>
          {user?.provider === "google" ? "Google sign-in" : "Email sign-in"}
        </Text>
      </View>

      <View
        style={{
          marginTop: Space["3xl"],
          backgroundColor: theme.card,
          borderRadius: Radius.xl,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          padding: Space.lg,
          gap: Space.lg,
          ...Shadow.md,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: Space.md }}>
          <User size={18} color={theme.lichen} />
          <Text variant="body" style={{ color: theme.cardText, flex: 1 }}>
            {user?.name ?? "Eco User"}
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.10)" }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: Space.md }}>
          <Mail size={18} color={theme.gold} />
          <Text variant="body" style={{ color: theme.cardText, flex: 1 }}>
            {user?.email ?? "Not signed in"}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: Space["3xl"] }}>
        <Button label="Sign out" icon={LogOut} accent="clay" variant="outline" fullWidth onPress={logout} />
      </View>
    </ScrollView>
  );
}
