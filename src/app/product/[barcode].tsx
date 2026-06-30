import React, { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import * as Location from 'expo-location';
import { X, Sparkles, MapPin, Leaf } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useScanHistory } from '@/context/ScanHistoryContext';
import { useCurrentContext } from '@/context/CurrentContext';
import { Space } from '@/constants/theme';
import { Text, Card, Badge, Button, IconButton, FactorBar, Divider } from '@/components/ui';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { fetchProductByBarcode, fallbackProductForBarcode } from '@/lib/openFoodFacts';
import { classifyWasteType, recommendDisposalAction, WASTE_TYPE_LABEL, DISPOSAL_LABEL, DISPOSAL_COPY } from '@/lib/wasteMapping';
import { computeScore, estimateKgCo2, explainScore } from '@/lib/scoring';
import { getSeededRecyclers, findRecyclersForWasteType, formatDistanceKm, haversineDistanceKm } from '@/lib/recyclers';
import type { Product, SustainabilityProfile } from '@/types/domain';

export default function ProductScreen() {
  const theme = useTheme();
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const { addScan } = useScanHistory();
  const { setContext } = useCurrentContext();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SustainabilityProfile | null>(null);
  const [recyclersNearby, setRecyclersNearby] = useState<ReturnType<typeof getSeededRecyclers>>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const savedRef = React.useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      let location: { latitude: number; longitude: number } | null = null;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        }
      } catch {
        // proceed without location — recycler list still seeds usefully
      }

      const recyclers = getSeededRecyclers(location);
      let product: Product | null = await fetchProductByBarcode(barcode);
      if (!product) product = fallbackProductForBarcode(barcode);

      const wasteType = classifyWasteType(product);
      const disposalAction = recommendDisposalAction(product, wasteType);
      const matches = findRecyclersForWasteType(recyclers, wasteType);
      const score = computeScore(product, wasteType, matches.length > 0);
      const explanation = explainScore(score, product);

      if (cancelled) return;

      setProfile({
        product,
        score,
        wasteType,
        disposalAction,
        explanation,
        alternativesHint: '',
      });
      setRecyclersNearby(recyclers);
      setUserLocation(location);
      setLoading(false);

      setContext({
        product,
        score,
        wasteType,
        disposalAction,
        recyclers,
        userLocation: location,
      });

      if (!savedRef.current) {
        savedRef.current = true;
        addScan({
          id: `${barcode}-${Date.now()}`,
          barcode,
          productName: product.name,
          brand: product.brand,
          scoreTotal: score.total,
          wasteType,
          disposalAction,
          scannedAt: new Date().toISOString(),
          estimatedKgCo2: estimateKgCo2(score),
          recyclable: disposalAction !== 'dispose',
        });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [barcode, addScan, setContext]);

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.tint} size="large" />
        <Text variant="bodySm" color={theme.textSecondary} style={{ marginTop: Space.md }}>
          Reading the loop for this product…
        </Text>
      </View>
    );
  }

  const { product, score, wasteType, disposalAction, explanation } = profile;
  const matches = findRecyclersForWasteType(recyclersNearby, wasteType);
  const nearest = matches[0];
  const distance = nearest && userLocation ? haversineDistanceKm(userLocation, nearest) : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: Space.lg, paddingTop: Space.xl }}>
        <IconButton icon={X} onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Space.lg, paddingTop: 0, paddingBottom: Space['4xl'] }}>
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }}>
          {product.source === 'fallback' ? (
            <Badge label="Demo data — not found in Open Food Facts" accent={theme.gold} />
          ) : (
            <Badge label="Open Food Facts" accent={theme.teal} />
          )}
          <Text variant="display" style={{ marginTop: Space.md }}>
            {product.name}
          </Text>
          {product.brand ? (
            <Text variant="bodySm" color={theme.textSecondary} style={{ marginTop: 2 }}>
              {product.brand}
            </Text>
          ) : null}
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 100 }}
          style={{ alignItems: 'center', marginTop: Space.xl, marginBottom: Space.lg }}
        >
          <ScoreGauge score={score.total} />
        </MotiView>

        <Card>
          <Text variant="h2">Why this score</Text>
          <Text variant="bodySm" color={theme.textSecondary} style={{ marginTop: Space.sm, marginBottom: Space.lg }}>
            {explanation}
          </Text>
          <FactorBar score={score} />
        </Card>

        <View style={{ flexDirection: 'row', gap: Space.md, marginTop: Space.lg }}>
          <Card style={{ flex: 1 }} borderAccent={theme.clay}>
            <Text variant="label" color={theme.clay}>
              WASTE TYPE
            </Text>
            <Text variant="h2" style={{ marginTop: 6 }}>
              {WASTE_TYPE_LABEL[wasteType]}
            </Text>
          </Card>
          <Card style={{ flex: 1 }} borderAccent={theme.lichenDark}>
            <Text variant="label" color={theme.lichenDark}>
              NEXT ACTION
            </Text>
            <Text variant="h2" style={{ marginTop: 6 }}>
              {DISPOSAL_LABEL[disposalAction]}
            </Text>
          </Card>
        </View>

        <Card style={{ marginTop: Space.lg, flexDirection: 'row', gap: Space.md, alignItems: 'flex-start' }}>
          <Leaf size={18} color={theme.lichenDark} style={{ marginTop: 2 }} />
          <Text variant="bodySm" color={theme.textSecondary} style={{ flex: 1 }}>
            {DISPOSAL_COPY[disposalAction]}
          </Text>
        </Card>

        <Divider />

        <Text variant="h2">Nearest match</Text>
        {nearest ? (
          <Card
            style={{ marginTop: Space.md, flexDirection: 'row', alignItems: 'center', gap: Space.md }}
            onPress={() => router.push(`/recycler/${nearest.id}`)}
          >
            <MapPin size={20} color={theme.teal} />
            <View style={{ flex: 1 }}>
              <Text variant="bodySm" style={{ fontFamily: 'Archivo_600SemiBold' }}>
                {nearest.name}
              </Text>
              <Text variant="monoSm" color={theme.textSecondary}>
                {nearest.notes}
              </Text>
            </View>
            {distance !== null ? (
              <Text variant="monoSm" color={theme.tint}>
                {formatDistanceKm(distance)}
              </Text>
            ) : null}
          </Card>
        ) : (
          <Text variant="bodySm" color={theme.textSecondary} style={{ marginTop: Space.sm }}>
            No seeded recycler accepts this stream nearby yet — check municipal collection.
          </Text>
        )}

        <Button
          label="Ask the AI advisor about this"
          icon={Sparkles}
          variant="soft"
          accent="gold"
          fullWidth
          style={{ marginTop: Space.xl }}
          onPress={() => router.push('/advisor')}
        />
      </ScrollView>
    </View>
  );
}
