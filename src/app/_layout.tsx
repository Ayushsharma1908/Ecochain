import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';

import { FontsToLoad } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScanHistoryProvider } from '@/context/ScanHistoryContext';
import { CurrentContextProvider } from '@/context/CurrentContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutInner() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product/[barcode]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="recycler/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="advisor" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
    <GestureHandlerRootView style={{ flex: 1 }} key={colorScheme}>
      <ScanHistoryProvider>
        <CurrentContextProvider>
          <RootLayoutInner />
        </CurrentContextProvider>
      </ScanHistoryProvider>
    </GestureHandlerRootView>
  );
}
