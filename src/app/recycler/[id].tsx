import React, { useEffect, useState } from 'react';
import { View, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { X, MapPin, Truck, Navigation } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Space } from '@/constants/theme';
import { Text, Card, Badge, Button, IconButton, IconBadge, Divider } from '@/components/ui';
import { getSeededRecyclers, formatDistanceKm, haversineDistanceKm } from '@/lib/recyclers';
import { WASTE_TYPE_LABEL } from '@/lib/wasteMapping';
import type { Recycler } from '@/types/domain';

const KIND_LABEL: Record<Recycler['kind'], string> = {
  recycler: 'Recycler',
  'collection-point': 'Collection Point',
  donation: 'Donation Hub',
  resale: 'Resale Counter',
};

export default function RecyclerDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recycler, setRecycler] = useState<Recycler | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let location: { latitude: number; longitude: number } | null = null;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        }
      } catch {
        // ignore — detail still renders without distance
      }
      const list = getSeededRecyclers(location);
      const found = list.find((r) => r.id === id) ?? null;
      setRecycler(found);
      if (found && location) setDistance(haversineDistanceKm(location, found));
      setLoading(false);
    })();
  }, [id]);

  if (loading || !recycler) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.tint} />
      </View>
    );
  }

  const openDirections = () => {
    const url = `https://maps.google.com/?q=${recycler.latitude},${recycler.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: Space.lg, paddingTop: Space.xl }}>
        <IconButton icon={X} onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Space.lg, paddingTop: 0, paddingBottom: Space['4xl'] }}>
        <IconBadge icon={recycler.hasTransportPartner ? Truck : MapPin} accent={theme.teal} size={56} />
        <Text variant="display" style={{ marginTop: Space.lg, fontSize: 26 }}>
          {recycler.name}
        </Text>
        <Text variant="bodySm" color={theme.textSecondary} style={{ marginTop: 4 }}>
          {KIND_LABEL[recycler.kind]} · {recycler.address}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginTop: Space.lg }}>
          {recycler.acceptedWaste.map((w) => (
            <Badge key={w} label={WASTE_TYPE_LABEL[w]} accent={theme.lichenDark} />
          ))}
        </View>

        {distance !== null ? (
          <Card style={{ marginTop: Space.lg, flexDirection: 'row', alignItems: 'center', gap: Space.md }}>
            <Navigation size={18} color={theme.teal} />
            <Text variant="bodySm">{formatDistanceKm(distance)} from your current location</Text>
          </Card>
        ) : null}

        {recycler.notes ? (
          <Card style={{ marginTop: Space.md }}>
            <Text variant="label" color={theme.textMuted}>
              NOTES
            </Text>
            <Text variant="bodySm" color={theme.textSecondary} style={{ marginTop: 6 }}>
              {recycler.notes}
            </Text>
          </Card>
        ) : null}

        {recycler.hasTransportPartner ? (
          <Card style={{ marginTop: Space.md, flexDirection: 'row', gap: Space.md, alignItems: 'flex-start' }} borderAccent={theme.gold}>
            <Truck size={18} color={theme.goldDark} style={{ marginTop: 2 }} />
            <Text variant="bodySm" color={theme.textSecondary} style={{ flex: 1 }}>
              This partner runs scheduled pickups — batch items together and request a pickup instead of dropping off one at a time.
            </Text>
          </Card>
        ) : null}

        <Divider />

        <Button label="Open in Maps" icon={Navigation} fullWidth onPress={openDirections} />
      </ScrollView>
    </View>
  );
}
