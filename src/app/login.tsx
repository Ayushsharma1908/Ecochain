import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, useLocalSearchParams } from "expo-router";
import { Mail, X } from "lucide-react-native";
import { MotiView } from "moti";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
  const [loadingProvider, setLoadingProvider] = useState<"email" | "google" | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Press-scale animation for the Google button
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const completeLogin = async (provider: "email" | "google") => {
    setLoadingProvider(provider);
    setGoogleError(null);

    try {
      if (provider === "email") {
        await signInWithEmail(email, name);
      } else {
        const result = await signInWithGoogle();
        // null means user cancelled — stay on the login screen
        if (result === null) {
          setLoadingProvider(null);
          return;
        }
      }

      setLoadingProvider(null);

      if (redirect) {
        router.replace(redirect as any);
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      setLoadingProvider(null);
      if (provider === "google") {
        setGoogleError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
      }
    }
  };

  const isLoading = loadingProvider !== null;

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
          <IconButton icon={X} onPress={() => router.replace("/(tabs)")} />
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

          {/* Divider */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: Space.md }}>
            <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.14)" }} />
            <Text variant="monoSm" style={{ color: theme.cardTextMuted }}>
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.14)" }} />
          </View>

          {/* ── Google Sign-In Button ───────────────────────────────────────── */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPress={() => completeLogin("google")}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isLoading}
              accessibilityLabel="Continue with Google"
              accessibilityRole="button"
              style={({ pressed }) => ({
                minHeight: 52,
                borderRadius: Radius.pill,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                paddingHorizontal: Space.xl,
                gap: Space.sm,
                opacity: isLoading ? 0.6 : pressed ? 0.92 : 1,
                // Subtle shadow to lift the white button off the dark card
                shadowColor: "#000",
                shadowOpacity: 0.18,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 4,
              })}
            >
              {/* Left: Google "G" icon (official brand colours) */}
              <View style={{ width: 22, alignItems: "center" }}>
                {loadingProvider === "google" ? (
                  <ActivityIndicator size="small" color="#DB4437" />
                ) : (
                  <FontAwesome name="google" size={20} color="#DB4437" />
                )}
              </View>

              {/* Centre-aligned label */}
              <Text
                variant="button"
                style={{
                  flex: 1,
                  textAlign: "center",
                  color: "#1A2B1E",
                  fontFamily: "Archivo_600SemiBold",
                  fontSize: 15,
                }}
              >
                {loadingProvider === "google" ? "Signing in…" : "Continue with Google"}
              </Text>

              {/* Invisible spacer so text stays optically centred */}
              <View style={{ width: 22 }} />
            </Pressable>
          </Animated.View>

          {/* Error message (shown only when Google sign-in fails) */}
          {googleError ? (
            <MotiView
              from={{ opacity: 0, translateY: -4 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 220 }}
            >
              <Text
                variant="bodySm"
                style={{
                  color: theme.error,
                  textAlign: "center",
                  paddingHorizontal: Space.sm,
                }}
              >
                {googleError}
              </Text>
            </MotiView>
          ) : null}
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
