import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SplashOverlay } from "@/components/SplashOverlay";
import { FontsToLoad } from "@/constants/theme";
import { AuthProvider } from "@/context/AuthContext";
import { CurrentContextProvider } from "@/context/CurrentContext";
import { ScanHistoryProvider } from "@/context/ScanHistoryContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";

// Keep native splash visible until we're ready to show in-app overlay
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutInner() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="product/[barcode]"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
            gestureDirection: "vertical",
            animationDuration: 300,
          }}
        />

        <Stack.Screen
          name="recycler/[id]"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
            gestureDirection: "vertical",
            animationDuration: 300,
          }}
        />

        <Stack.Screen
          name="advisor"
          options={{
            presentation: "modal",
            animation: "fade",
            animationDuration: 200,
          }}
        />

        <Stack.Screen
          name="login"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
            gestureDirection: "vertical",
            animationDuration: 260,
          }}
        />

        <Stack.Screen
          name="profile"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
            gestureDirection: "vertical",
            animationDuration: 260,
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  useColorScheme(); // subscribe to changes — triggers re-render
  const [fontsLoaded, fontError] = useFonts(FontsToLoad);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the native OS splash — the in-app SplashOverlay takes over seamlessly
      SplashScreen.hideAsync().catch(() => {});
      // Brief delay so the OS splash and in-app overlay don't overlap awkwardly
      const timer = setTimeout(() => setFontsReady(true), 80);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ScanHistoryProvider>
          <CurrentContextProvider>
            <RootLayoutInner />
          </CurrentContextProvider>
        </ScanHistoryProvider>
      </AuthProvider>

      {/* In-app animated splash — sits above everything, unmounts after exit animation */}
      <SplashOverlay visible={!fontsReady} />
    </GestureHandlerRootView>
  );
}
