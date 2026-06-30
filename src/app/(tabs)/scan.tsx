import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { ScanLine, Camera as CameraIcon, Keyboard, X } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';
import { Space, Radius } from '@/constants/theme';
import { Text, Button, Card } from '@/components/ui';

export default function ScanScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualMode, setManualMode] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const lockRef = useRef(false);

  const handleScanned = useCallback((result: BarcodeScanningResult) => {
    if (lockRef.current) return;
    lockRef.current = true;
    router.push(`/product/${result.data}`);
    setTimeout(() => {
      lockRef.current = false;
    }, 1500);
  }, []);

  if (manualMode) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background, padding: Space.xl }]}>
        <Pressable style={styles.closeBtn} onPress={() => setManualMode(false)}>
          <X size={20} color={theme.text} />
        </Pressable>
        <Keyboard size={32} color={theme.tint} />
        <Text variant="h1" style={{ marginTop: Space.md }}>
          Enter a barcode or product
        </Text>
        <Text variant="bodySm" color={theme.textSecondary} center style={{ marginTop: 6, marginBottom: Space.xl }}>
          Useful when a package is damaged, missing, or the camera can&rsquo;t get a clean read.
        </Text>
        <TextInput
          value={manualBarcode}
          onChangeText={setManualBarcode}
          placeholder="e.g. 3017620422003 or Kissan Jam"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="words"
          style={{
            width: '100%',
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: Radius.md,
            padding: Space.lg,
            fontFamily: 'JetBrainsMono_500Medium',
            fontSize: 16,
            color: theme.text,
            textAlign: 'center',
            marginBottom: Space.lg,
          }}
        />
        <Button
          label="Look up product"
          fullWidth
          disabled={manualBarcode.trim().length < 3}
          onPress={() => router.push(`/product/${encodeURIComponent(manualBarcode.trim())}`)}
        />
      </View>
    );
  }

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background, padding: Space.xl }]}>
        <CameraIcon size={40} color={theme.tint} />
        <Text variant="h1" center style={{ marginTop: Space.lg }}>
          Camera access needed
        </Text>
        <Text variant="bodySm" color={theme.textSecondary} center style={{ marginTop: 6, marginBottom: Space.xl, maxWidth: 280 }}>
          EcoChain Link scans barcodes locally on your device. Nothing is recorded or uploaded.
        </Text>
        <Button label="Enable camera" icon={CameraIcon} onPress={requestPermission} />
        <Pressable onPress={() => setManualMode(true)} style={{ marginTop: Space.lg }}>
          <Text variant="bodySm" color={theme.tint}>
            Enter a barcode manually instead
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'] }}
        onBarcodeScanned={handleScanned}
      />

      <View style={[StyleSheet.absoluteFill, styles.overlay]}>
        <View style={{ paddingTop: 64, alignItems: 'center' }}>
          <Text variant="label" color="#F8F4E6">
            POINT AT A BARCODE
          </Text>
        </View>

        <MotiView
          from={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 900, loop: true }}
          style={styles.frame}
        >
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </MotiView>

        <View style={{ alignItems: 'center', gap: Space.md, paddingBottom: 150 }}>
          <Card tint="rgba(20,30,24,0.78)" style={{ flexDirection: 'row', alignItems: 'center', gap: Space.sm }}>
            <ScanLine size={16} color={theme.lichen} />
            <Text variant="bodySm" color="#F8F4E6">
              Open Food Facts lookup, on scan
            </Text>
          </Card>
          <Pressable onPress={() => setManualMode(true)}>
            <Text variant="bodySm" color="#CFE0D4" style={{ textDecorationLine: 'underline' }}>
              Type a barcode instead
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { position: 'absolute', top: 60, right: Space.xl },
  overlay: { justifyContent: 'space-between' },
  frame: {
    alignSelf: 'center',
    width: 240,
    height: 150,
  },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#5FA646' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
});
