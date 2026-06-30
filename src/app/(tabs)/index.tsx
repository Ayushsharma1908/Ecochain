import React from 'react';
import { ScrollView, View, FlatList } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { ScanLine, Sparkles, Leaf, Recycle, ChevronRight } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { useScanHistory } from '@/context/ScanHistoryContext';
import { Space } from '@/constants/theme';
import { Text, Card, Button, IconBadge, Badge, EmptyState, LoopDots } from '@/components/ui';
import { WASTE_TYPE_LABEL } from '@/lib/wasteMapping';
import { scoreTier } from '@/lib/scoring';
import type { ScanRecord } from '@/types/domain';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function ScanRow({ item }: { item: ScanRecord }) {
  const theme = useTheme();
  const tier = scoreTier(item.scoreTotal);
  return (
    <Card
      style={{ marginBottom: Space.sm, flexDirection: 'row', alignItems: 'center', gap: Space.md }}
      onPress={() => router.push(`/product/${item.barcode}`)}
    >
      <IconBadge icon={Recycle} accent={theme[tier.accent]} size={40} />
      <View style={{ flex: 1 }}>
        <Text variant="bodySm" style={{ fontFamily: 'Archivo_600SemiBold' }}>
          {item.productName}
        </Text>
        <Text variant="monoSm" color={theme.textSecondary} style={{ marginTop: 2 }}>
          {WASTE_TYPE_LABEL[item.wasteType]} · {tier.label}
        </Text>
      </View>
      <Badge label={`${item.scoreTotal}`} accent={theme[tier.accent]} />
    </Card>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { history, stats, loading } = useScanHistory();
  const recent = history.slice(0, 4);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: Space.lg, paddingTop: Space['3xl'], paddingBottom: 140 }}
    >
      <MotiView from={{ opacity: 0, translateY: -8 }} animate={{ opacity: 1, translateY: 0 }}>
        <Text variant="label" color={theme.tint}>
          ECOCHAIN LINK
        </Text>
        <Text variant="display" style={{ marginTop: 6 }}>
          {greeting()}.
        </Text>
        <Text variant="bodySm" color={theme.textSecondary} style={{ marginTop: 4 }}>
          Scan something, and we&rsquo;ll route it back into the loop.
        </Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 80 }}
        style={{ marginTop: Space.xl }}
      >
        <Card
          tint={theme.canopy}
          style={{ alignItems: 'flex-start', gap: Space.md }}
          onPress={() => router.push('/(tabs)/scan')}
        >
          <IconBadge icon={ScanLine} accent={theme.lichen} size={48} />
          <View>
            <Text variant="h1" color={theme.onCanopy}>
              Scan a product
            </Text>
            <Text variant="bodySm" color="#BFD3C5" style={{ marginTop: 4, maxWidth: 240 }}>
              Get a sustainability score and disposal guidance in seconds.
            </Text>
          </View>
          <Button label="Open scanner" icon={ScanLine} onPress={() => router.push('/(tabs)/scan')} />
        </Card>
      </MotiView>

      <View style={{ flexDirection: 'row', gap: Space.md, marginTop: Space.xl }}>
        <Card style={{ flex: 1, alignItems: 'flex-start' }}>
          <Leaf size={18} color={theme.lichenDark} />
          <Text variant="h2" style={{ marginTop: Space.sm }}>
            {stats.estimatedKgCo2Avoided}
            <Text variant="bodySm" color={theme.textSecondary}> kg</Text>
          </Text>
          <Text variant="monoSm" color={theme.textSecondary}>
            CO2e avoided
          </Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'flex-start' }}>
          <Recycle size={18} color={theme.teal} />
          <Text variant="h2" style={{ marginTop: Space.sm }}>
            {stats.recyclableVolumeCount}
          </Text>
          <Text variant="monoSm" color={theme.textSecondary}>
            items recyclable
          </Text>
        </Card>
      </View>

      <View style={{ marginTop: Space.xl }}>
        <Card
          borderAccent={theme.gold}
          style={{ flexDirection: 'row', alignItems: 'center', gap: Space.md }}
          onPress={() => router.push('/advisor')}
        >
          <IconBadge icon={Sparkles} accent={theme.gold} size={40} />
          <View style={{ flex: 1 }}>
            <Text variant="bodySm" style={{ fontFamily: 'Archivo_600SemiBold' }}>
              Ask the AI advisor
            </Text>
            <Text variant="monoSm" color={theme.textSecondary} style={{ marginTop: 2 }}>
              Explanations, alternatives, pickup &amp; value
            </Text>
          </View>
          <ChevronRight size={18} color={theme.textMuted} />
        </Card>
      </View>

      <View style={{ marginTop: Space.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: Space.md }}>
          <Text variant="h2">Recent scans</Text>
          {history.length > 0 ? (
            <Text variant="monoSm" color={theme.tint} onPress={() => router.push('/(tabs)/dashboard')}>
              View all
            </Text>
          ) : null}
        </View>

        {!loading && recent.length === 0 ? (
          <EmptyState
            illustration="scan"
            title="Nothing scanned yet"
            subtitle="Your first scan will show up here with its score and disposal guidance."
            action={{ label: 'Scan now', icon: ScanLine, onPress: () => router.push('/(tabs)/scan') }}
          />
        ) : (
          <FlatList
            data={recent}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => <ScanRow item={item} />}
            scrollEnabled={false}
          />
        )}
      </View>

      <View style={{ alignItems: 'center', marginTop: Space['2xl'] }}>
        <LoopDots size={6} gap={12} />
      </View>
    </ScrollView>
  );
}
