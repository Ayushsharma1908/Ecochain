import React from 'react';
import { ScrollView, View } from 'react-native';
import { Leaf, Recycle, Gauge, Trash2, ScanLine } from 'lucide-react-native';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { useScanHistory } from '@/context/ScanHistoryContext';
import { Space } from '@/constants/theme';
import { Text, Card, SectionHeader, IconBadge, TrendChart, EmptyState, LoopDiagram, Button, Divider } from '@/components/ui';

export default function DashboardScreen() {
  const theme = useTheme();
  const { stats, history, clearHistory, loading } = useScanHistory();

  if (!loading && history.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: Space['3xl'], paddingHorizontal: Space.lg }}>
        <SectionHeader eyebrow="Analytics" title="Your impact" />
        <EmptyState
          illustration="empty"
          title="No data to chart yet"
          subtitle="Scan a handful of products and your personal impact trend will build up here."
          action={{ label: 'Scan now', icon: ScanLine, onPress: () => router.push('/(tabs)/scan') }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: Space.lg, paddingTop: Space['3xl'], paddingBottom: 140 }}
    >
      <SectionHeader eyebrow="Analytics" title="Your impact" subtitle="Pulled live from your scan history, stored on this device." />

      <View style={{ flexDirection: 'row', gap: Space.md }}>
        <Card style={{ flex: 1, alignItems: 'flex-start' }}>
          <IconBadge icon={Gauge} accent={theme.teal} size={36} />
          <Text variant="h1" style={{ marginTop: Space.sm }}>
            {stats.totalScans}
          </Text>
          <Text variant="monoSm" color={theme.textSecondary}>
            products scanned
          </Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'flex-start' }}>
          <IconBadge icon={Leaf} accent={theme.lichenDark} size={36} />
          <Text variant="h1" style={{ marginTop: Space.sm }}>
            {Math.round(stats.recyclableShare * 100)}%
          </Text>
          <Text variant="monoSm" color={theme.textSecondary}>
            recyclable share
          </Text>
        </Card>
      </View>

      <View style={{ flexDirection: 'row', gap: Space.md, marginTop: Space.md }}>
        <Card style={{ flex: 1, alignItems: 'flex-start' }}>
          <IconBadge icon={Trash2} accent={theme.clay} size={36} />
          <Text variant="h1" style={{ marginTop: Space.sm }}>
            {stats.estimatedKgCo2Avoided}
            <Text variant="bodySm" color={theme.textSecondary}> kg</Text>
          </Text>
          <Text variant="monoSm" color={theme.textSecondary}>
            CO2e avoided
          </Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'flex-start' }}>
          <IconBadge icon={Recycle} accent={theme.gold} size={36} />
          <Text variant="h1" style={{ marginTop: Space.sm }}>
            {stats.averageScore}
          </Text>
          <Text variant="monoSm" color={theme.textSecondary}>
            average score
          </Text>
        </Card>
      </View>

      <Card style={{ marginTop: Space.xl }}>
        <Text variant="h2">Last 7 days</Text>
        <View style={{ marginTop: Space.md, alignItems: 'center' }}>
          <TrendChart data={stats.last7Days} />
        </View>
      </Card>

      <Card style={{ marginTop: Space.xl, alignItems: 'center' }}>
        <Text variant="h2" style={{ alignSelf: 'flex-start' }}>
          The loop, end to end
        </Text>
        <Text variant="bodySm" color={theme.textSecondary} style={{ alignSelf: 'flex-start', marginTop: 4, marginBottom: Space.md }}>
          Every scan moves through the same five stages.
        </Text>
        <LoopDiagram size={240} />
      </Card>

      <Divider />

      <Button
        label="Clear scan history"
        variant="ghost"
        accent="clay"
        size="sm"
        onPress={clearHistory}
      />
    </ScrollView>
  );
}
