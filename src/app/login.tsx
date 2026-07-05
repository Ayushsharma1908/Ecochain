import { router, useLocalSearchParams } from "expo-router";
import { LogIn, Mail, X } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import EcoChainLogo from "@/assets/images/echochain.svg";
import { Button, IconButton, Text } from "@/components/ui";
import { Radius, Shadow, Space } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email.trim());
}

export default function LoginScreen() {
  const theme = useTheme();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loadingProvider, setLoadingProvider] = useState<
    "email" | "google" | null
  >(null);

  const completeLogin = async (provider: "email" | "google") => {
    setLoadingProvider(provider);
    if (provider === "email") {
      await signInWithEmail(email, name);
    } else {
      await signInWithGoogle();
    }
    setLoadingProvider(null);
    if (redirect) {
      router.replace(redirect as any);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: Space.lg,
          paddingTop: Space.xl,
          paddingBottom: Space["4xl"],
        }}
      >
        <View style={{ alignItems: "flex-end" }}>
          <IconButton icon={X} onPress={() => router.back()} />
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 420 }}
          style={{ alignItems: "center", paddingTop: Space.md }}
        >
          <EcoChainLogo width={170} height={170} />
          <Text
            style={{
              fontFamily: "Fraunces_900Black",
              fontSize: 32,
              lineHeight: 38,
              color: theme.text,
              textAlign: "center",
              marginTop: Space.lg,
            }}
          >
            Welcome to EcoChain
          </Text>
          <Text
            variant="body"
            color={theme.textSecondary}
            style={{ textAlign: "center", marginTop: Space.sm, maxWidth: 300 }}
          >
            Sign in once to unlock scanning, recycling guidance, and your
            personal impact history.
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100, type: "timing", duration: 420 }}
          style={{
            marginTop: Space["3xl"],
            backgroundColor: theme.card,
            borderRadius: Radius.xl,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            padding: Space.lg,
            gap: Space.md,
            ...Shadow.lg,
          }}
        >
          <View>
            <Text variant="label" style={{ color: theme.cardTextMuted }}>
              NAME
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.cardTextMuted}
              autoCapitalize="words"
              style={{
                marginTop: Space.sm,
                borderRadius: Radius.md,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                paddingHorizontal: Space.lg,
                paddingVertical: Space.md,
                color: theme.cardText,
                fontFamily: "Archivo_500Medium",
                fontSize: 15,
              }}
            />
          </View>

          <View>
            <Text variant="label" style={{ color: theme.cardTextMuted }}>
              EMAIL
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.cardTextMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              style={{
                marginTop: Space.sm,
                borderRadius: Radius.md,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                paddingHorizontal: Space.lg,
                paddingVertical: Space.md,
                color: theme.cardText,
                fontFamily: "Archivo_500Medium",
                fontSize: 15,
              }}
            />
          </View>

          <Button
            label="Sign in with email"
            icon={Mail}
            fullWidth
            disabled={!isValidEmail(email)}
            loading={loadingProvider === "email"}
            onPress={() => completeLogin("email")}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: Space.md,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "rgba(255,255,255,0.14)",
              }}
            />
            <Text variant="monoSm" style={{ color: theme.cardTextMuted }}>
              OR
            </Text>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: "rgba(255,255,255,0.14)",
              }}
            />
          </View>

          <Pressable
            onPress={() => completeLogin("google")}
            disabled={loadingProvider !== null}
            style={({ pressed }) => ({
              minHeight: 48,
              borderRadius: Radius.pill,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: Space.sm,
              opacity: pressed ? 0.86 : loadingProvider ? 0.6 : 1,
            })}
          >
            <LogIn size={18} color={theme.lichenDark} />
            <Text variant="button" color={theme.lichenDark}>
              Continue with Google
            </Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
