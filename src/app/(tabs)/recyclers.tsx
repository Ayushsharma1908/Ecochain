import * as Location from 'expo-location';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import {
  ChevronRight,
  Locate,
  MapPin,
  Navigation,
  Truck,
} from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Space, Radius, Shadow } from '@/constants/theme';
import { Text, EmptyState } from '@/components/ui';
import {
  getSeededRecyclers,
  haversineDistanceKm,
  formatDistanceKm,
} from '@/lib/recyclers';
import { WASTE_TYPE_LABEL } from '@/lib/wasteMapping';
import type { Recycler, WasteTypeId } from '@/types/domain';

// ─── Filter definitions ───
const FILTERS: { id: WasteTypeId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'plastic', label: 'Plastic' },
  { id: 'paper', label: 'Paper' },
  { id: 'metal', label: 'Metal' },
  { id: 'glass', label: 'Glass' },
  { id: 'mixed', label: 'Mixed' },
];

// ─── Kind → accent color mapping ───
const KIND_THEME: Record<
  Recycler['kind'],
  { accent: string; label: string }
> = {
  recycler: { accent: 'teal', label: 'Recycler' },
  'collection-point': { accent: 'lichen', label: 'Collection point' },
  donation: { accent: 'gold', label: 'Donation' },
  resale: { accent: 'clay', label: 'Resale' },
};

// ─── Filter chip ───
function FilterChip({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: Space.lg,
        paddingVertical: Space.sm + 3,
        borderRadius: Radius.pill,
        backgroundColor: selected
          ? theme.lichen
          : pressed
          ? theme.cardAlt
          : theme.card,
        borderWidth: selected ? 0 : 1,
        borderColor: selected ? 'transparent' : theme.cardBorder,
        opacity: pressed ? 0.88 : 1,
        ...Shadow.sm,
      })}
    >
      <Text
        variant="bodySm"
        style={{
          fontFamily: selected ? 'Archivo_700Bold' : 'Archivo_500Medium',
          color: selected ? '#FFFFFF' : theme.cardTextSecondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Recycler row card ───
function RecyclerRow({
  item,
  index,
  location,
  theme,
}: {
  item: Recycler;
  index: number;
  location: Location.LocationObjectCoords | null;
  theme: any;
}) {
  const distance = location ? haversineDistanceKm(location, item) : null;
  const kindInfo = KIND_THEME[item.kind];
  const accentColor = theme[kindInfo.accent];
  const accentSoft = theme[kindInfo.accent + 'Soft'] ?? theme.lichenSoft;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        delay: 150 + index * 55,
        type: 'timing',
        duration: 320,
      }}
    >
      <Pressable
        onPress={() => router.push(`/recycler/${item.id}`)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: pressed ? theme.cardAlt : theme.card,
          borderRadius: Radius.lg,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          marginBottom: Space.sm,
          overflow: 'hidden',
          ...Shadow.md,
        })}
      >
        {/* Left accent bar — colored per type */}
        <View
          style={{
            width: 4,
            alignSelf: 'stretch',
            backgroundColor: accentColor,
          }}
        />

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: Space.md + 2,
            paddingHorizontal: Space.lg,
            gap: Space.md,
          }}
        >
          {/* Icon */}
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: Radius.sm,
              backgroundColor: accentSoft + '28',
              borderWidth: 1,
              borderColor: accentColor + '35',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.hasTransportPartner ? (
              <Truck size={19} color={accentColor} strokeWidth={2} />
            ) : (
              <MapPin size={19} color={accentColor} strokeWidth={2} />
            )}
          </View>

          {/* Text */}
          <View style={{ flex: 1 }}>
            <Text
              variant="body"
              style={{
                fontFamily: 'Archivo_600SemiBold',
                color: theme.cardText,
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 3,
                gap: Space.sm,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: Radius.pill,
                  backgroundColor: accentColor + '25',
                }}
              >
                <Text
                  variant="monoSm"
                  style={{
                    color: accentColor,
                    fontFamily: 'JetBrainsMono_700Bold',
                  }}
                >
                  {kindInfo.label}
                </Text>
              </View>
              {item.hasTransportPartner && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Truck size={10} color={theme.cardTextMuted} strokeWidth={2} />
                  <Text variant="monoSm" style={{ color: theme.cardTextMuted }}>
                    Pickup
                  </Text>
                </View>
              )}
            </View>
            <Text
              variant="monoSm"
              style={{ color: theme.cardTextMuted, marginTop: 2 }}
              numberOfLines={1}
            >
              {item.acceptedWaste.map((w) => WASTE_TYPE_LABEL[w]).join(' · ')}
            </Text>
          </View>

          {/* Distance badge */}
          {distance !== null && (
            <View
              style={{
                paddingHorizontal: Space.sm,
                paddingVertical: 4,
                borderRadius: Radius.pill,
                backgroundColor: 'rgba(98,157,60,0.18)',
                borderWidth: 1,
                borderColor: 'rgba(98,157,60,0.30)',
              }}
            >
              <Text
                variant="monoSm"
                style={{
                  fontFamily: 'JetBrainsMono_700Bold',
                  color: theme.lichen,
                }}
              >
                {formatDistanceKm(distance)}
              </Text>
            </View>
          )}

          <ChevronRight size={15} color={theme.cardTextMuted} strokeWidth={2} />
        </View>
      </Pressable>
    </MotiView>
  );
}

// ─── Location denied banner ───
function LocationBanner({ theme }: { theme: any }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Space.md,
        paddingVertical: Space.md,
        paddingHorizontal: Space.lg,
        backgroundColor: theme.card,
        borderRadius: Radius.md,
        marginBottom: Space.lg,
        borderWidth: 1,
        borderColor: 'rgba(212,149,42,0.30)',
        ...Shadow.sm,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: Radius.xs,
          backgroundColor: 'rgba(212,149,42,0.20)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Locate size={16} color={theme.gold} strokeWidth={2} />
      </View>
      <Text
        variant="bodySm"
        style={{ flex: 1, lineHeight: 18, color: theme.cardTextSecondary }}
      >
        Location off — showing demo data. Enable for real distances.
      </Text>
    </View>
  );
}

// ─── Main screen ───
export default function RecyclersScreen() {
  const theme = useTheme();
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
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
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(pos.coords);
      } catch {
        setLocationDenied(true);
      }
    })();
  }, []);

  const recyclers = useMemo(
    () =>
      getSeededRecyclers(
        location
          ? { latitude: location.latitude, longitude: location.longitude }
          : null
      ),
    [location]
  );

  const filtered = useMemo(() => {
    const list =
      filter === 'all'
        ? recyclers
        : recyclers.filter((r) => r.acceptedWaste.includes(filter));
    return [...list].sort((a, b) => {
      if (!location) return 0;
      return (
        haversineDistanceKm(location, a) - haversineDistanceKm(location, b)
      );
    });
  }, [recyclers, filter, location]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(r) => r.id}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{
        paddingHorizontal: Space.lg,
        paddingTop: Space['4xl'],
        paddingBottom: 150,
      }}
      ListHeaderComponent={
        <>
          {/* ─── Header ─── */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
          >
            <Text
              variant="label"
              color={theme.lichenDark}
              style={{ letterSpacing: 1.6 }}
            >
              RECYCLING
            </Text>
            <Text
              style={{
                fontFamily: 'Fraunces_900Black',
                fontSize: 34,
                lineHeight: 40,
                color: theme.text,
                marginTop: 8,
              }}
            >
              Nearby
            </Text>
            <Text variant="bodySm" color={theme.textMuted} style={{ marginTop: 6 }}>
              {location
                ? 'Sorted by distance from you.'
                : locationDenied
                ? 'Showing demo locations.'
                : 'Finding recyclers near you…'}
            </Text>
          </MotiView>

          {/* ─── Location denied banner ─── */}
          {locationDenied && (
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100, type: 'timing', duration: 350 }}
              style={{ marginTop: Space.xl }}
            >
              <LocationBanner theme={theme} />
            </MotiView>
          )}

          {/* ─── Filter chips ─── */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 120, type: 'timing', duration: 400 }}
          >
            <FlatList
              horizontal
              data={FILTERS}
              keyExtractor={(f) => f.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: Space.sm,
                paddingVertical: Space.xl,
              }}
              renderItem={({ item }) => (
                <FilterChip
                  label={item.label}
                  selected={filter === item.id}
                  onPress={() => setFilter(item.id)}
                  theme={theme}
                />
              )}
            />
          </MotiView>

          {/* ─── Result count ─── */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: Space.md,
            }}
          >
            <Text
              style={{
                fontFamily: 'Fraunces_600SemiBold',
                fontSize: 18,
                color: theme.text,
              }}
            >
              {filtered.length}{' '}
              <Text variant="bodySm" color={theme.textMuted}>
                {filtered.length === 1 ? 'result' : 'results'}
              </Text>
            </Text>
          </View>
        </>
      }
      renderItem={({ item, index }) => (
        <RecyclerRow
          item={item}
          index={index}
          location={location}
          theme={theme}
        />
      )}
      ListEmptyComponent={
        <MotiView
          from={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200, type: 'timing', duration: 400 }}
          style={{ marginTop: Space.xl }}
        >
          <View
            style={{
              alignItems: 'center',
              paddingVertical: Space['4xl'],
              paddingHorizontal: Space['2xl'],
              backgroundColor: theme.card,
              borderRadius: Radius.xl,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              ...Shadow.md,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: Radius.pill,
                backgroundColor: 'rgba(98,157,60,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Space.lg,
              }}
            >
              <Navigation size={26} color={theme.lichen} strokeWidth={1.5} />
            </View>
            <Text
              variant="h2"
              style={{ textAlign: 'center', color: theme.cardText }}
            >
              Nothing nearby
            </Text>
            <Text
              variant="bodySm"
              style={{
                textAlign: 'center',
                color: theme.cardTextMuted,
                marginTop: 8,
                maxWidth: 240,
                lineHeight: 20,
              }}
            >
              No recyclers match that filter. Try selecting a different waste type.
            </Text>
          </View>
        </MotiView>
      }
    />
  );
}