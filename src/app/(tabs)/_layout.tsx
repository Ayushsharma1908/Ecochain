import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ScanLine, MapPin, BarChart3 } from 'lucide-react-native';
import { Platform } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Shadow, Space } from '@/constants/theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontFamily: 'Archivo_600SemiBold', fontSize: 11, marginTop: -2 },
        tabBarStyle: {
          position: 'absolute',
          left: Space.lg,
          right: Space.lg,
          bottom: Platform.select({ ios: 28, android: 18, default: 18 }),
          height: 64,
          borderRadius: 28,
          backgroundColor: theme.card,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: theme.border,
          paddingTop: 8,
          ...Shadow.md,
        },
        tabBarItemStyle: { paddingTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 22} /> }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: 'Scan', tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size ?? 22} /> }}
      />
      <Tabs.Screen
        name="recyclers"
        options={{ title: 'Recyclers', tabBarIcon: ({ color, size }) => <MapPin color={color} size={size ?? 22} /> }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size ?? 22} /> }}
      />
    </Tabs>
  );
}
