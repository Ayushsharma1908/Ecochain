import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { MapPin, Truck, ChevronRight } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Space } from '@/constants/theme';
import { Text, Card, Chip, IconBadge, SectionHeader, EmptyState } from '@/components/ui';
import { getSeededRecyclers, haversineDistanceKm, formatDistanceKm } from '@/lib/recyclers';
import { WASTE_TYPE_LABEL } from '@/lib/wasteMapping';
import type { Recycler, WasteTypeId } from '@/types/domain';

const FILTERS: { id: WasteTypeId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'plastic', label: 'Plastic' },
  { id: 'paper', label: 'Paper' },
  { id: 'metal', label: 'Metal' },
  { id: 'glass', label: 'Glass' },
  { id: 'mixed', label: 'Mixed' },
];

const KIND_ACCENT: Record<Recycler['kind'], 'teal' | 'lichen' | 'gold' | 'clay'> = {
  recycler: 'teal',
  'collection-point': 'lichen',
  donation: 'gold',
  resale: 'clay',
};

export default function RecyclersScreen() {
  const theme = useTheme();
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [filter, setFilter] = useState<WasteTypeId | 'all'>('all');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationDenied(true);
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(pos.coords);
      } catch {
        setLocationDenied(true);
      }
    })();
  }, []);

  const recyclers = useMemo(() => getSeededRecyclers(location ? { latitude: location.latitude, longitude: location.longitude } : null), [location]);

  const filtered = useMemo(() => {
    const list = filter === 'all' ? recyclers : recyclers.filter((r) => r.acceptedWaste.includes(filter));
    return [...list].sort((a, b) => {
      if (!location) return 0;
      return (
        haversineDistanceKm(location, a) - haversineDistanceKm(location, b)
      );
    });
  }, [recyclers, filter, location]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: Space['3xl'], paddingHorizontal: Space.lg }}>
      <SectionHeader
        eyebrow="WasteLink"
        title="Nearby recyclers"
        subtitle={
          locationDenied
            ? 'Location is off — showing a demo layout. Enable location for real distances.'
            : location
              ? 'Sorted by distance from where you are now.'
              : 'Finding recyclers near you…'
        }
      />

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: Space.sm, paddingBottom: Space.lg }}
        renderItem={({ item }) => (
          <Chip
            label={item.label}
            selected={filter === item.id}
            accent={theme.tint}
            onPress={() => setFilter(item.id)}
          />
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListEmptyComponent={
          <EmptyState illustration="map" title="No recyclers match that filter" subtitle="Try a different waste type." />
        }
        renderItem={({ item }) => {
          const distance = location ? haversineDistanceKm(location, item) : null;
          return (
            <Card
              style={{ marginBottom: Space.sm, flexDirection: 'row', alignItems: 'center', gap: Space.md }}
              onPress={() => router.push(`/recycler/${item.id}`)}
            >
              <IconBadge icon={item.hasTransportPartner ? Truck : MapPin} accent={theme[KIND_ACCENT[item.kind]]} />
              <View style={{ flex: 1 }}>
                <Text variant="bodySm" style={{ fontFamily: 'Archivo_600SemiBold' }}>
                  {item.name}
                </Text>
                <Text variant="monoSm" color={theme.textSecondary} style={{ marginTop: 2 }}>
                  {item.acceptedWaste.map((w) => WASTE_TYPE_LABEL[w]).join(' · ')}
                </Text>
              </View>
              {distance !== null ? (
                <Text variant="monoSm" color={theme.tint}>
                  {formatDistanceKm(distance)}
                </Text>
              ) : null}
              <ChevronRight size={16} color={theme.textMuted} />
            </Card>
          );
        }}
      />
    </View>
  );
}
