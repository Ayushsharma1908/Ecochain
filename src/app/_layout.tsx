import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { FontsToLoad } from "@/constants/theme";
import { CurrentContextProvider } from "@/context/CurrentContext";
import { ScanHistoryProvider } from "@/context/ScanHistoryContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";

// Keep splash visible until we're ready
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
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  useColorScheme(); // subscribe to changes — triggers re-render
  const [fontsLoaded, fontError] = useFonts(FontsToLoad);

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutReady();
  }, [onLayoutReady]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScanHistoryProvider>
        <CurrentContextProvider>
          <RootLayoutInner />
        </CurrentContextProvider>
      </ScanHistoryProvider>
    </GestureHandlerRootView>
  );
}
