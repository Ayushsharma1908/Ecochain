import React from 'react';
import { Pressable, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Radius, Space } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Text } from '@/components/ui/Text';

export function Badge({ label, accent, outline }: { label: string; accent: string; outline?: boolean }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: Radius.pill,
        backgroundColor: outline ? 'transparent' : accent,
        borderWidth: outline ? 1.2 : 0,
        borderColor: accent,
      }}
    >
      <Text variant="monoSm" color={outline ? accent : '#F8F4E6'} style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </Text>
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  accent,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accent: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 7,
        paddingHorizontal: 13,
        borderRadius: Radius.pill,
        backgroundColor: selected ? accent : theme.card,
        borderWidth: 1.2,
        borderColor: selected ? accent : theme.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text variant="bodySm" color={selected ? '#F8F4E6' : theme.textSecondary} style={{ fontFamily: 'Archivo_600SemiBold' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function IconBadge({
  icon: Icon,
  accent,
  size = 44,
}: {
  icon: LucideIcon;
  accent: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${accent}22`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.46} color={accent} strokeWidth={2} />
    </View>
  );
}

export function Divider() {
  const theme = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.border, marginVertical: Space.lg }} />;
}
