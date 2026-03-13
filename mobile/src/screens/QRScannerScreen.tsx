import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { COLORS, SIZES, SPACING, RADIUS, DEMO_BATCH_CODES } from '../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'QRScanner'>;

export default function QRScannerScreen({ navigation }: Props) {
  const [manualCode, setManualCode] = useState('');
  const [simulating, setSimulating] = useState(false);

  function handleManual() {
    const c = manualCode.trim().toUpperCase();
    if (!c) { Alert.alert('Enter a code', 'Type a batch code to look up.'); return; }
    navigation.replace('TraceabilityResult', { batchCode: c });
  }

  function simulateScan() {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      navigation.replace('TraceabilityResult', { batchCode: DEMO_BATCH_CODES[0] });
    }, 1500);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Viewfinder simulation */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.viewfinder}>
          {simulating ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <>
              <View style={[styles.corner, styles.tl]} />
              <View style={[styles.corner, styles.tr]} />
              <View style={[styles.corner, styles.bl]} />
              <View style={[styles.corner, styles.br]} />
              <Text style={styles.scanIcon}>QR</Text>
              <Text style={styles.viewfinderHint}>Point at product QR code</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.simulateBtn, simulating && styles.btnDisabled]}
          onPress={simulateScan}
          disabled={simulating}
          activeOpacity={0.85}
        >
          <Text style={styles.simulateBtnText}>
            {simulating ? 'Scanning...' : 'Simulate Scan (Demo)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual entry */}
      <View style={styles.manualCard}>
        <Text style={styles.manualTitle}>Enter Code Manually</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.input}
            placeholder="OT-2025-001234"
            placeholderTextColor={COLORS.textMuted}
            value={manualCode}
            onChangeText={t => setManualCode(t.toUpperCase())}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={handleManual}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleManual} activeOpacity={0.85}>
            <Text style={styles.searchBtnText}>Go</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.manualHint}>Try: OT-2025-001234</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#0f2d1a' },

  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  backBtn:    { padding: SPACING.xs },
  backText:   { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.base, fontWeight: '600' },
  headerTitle:{ color: '#fff', fontSize: SIZES.xl, fontWeight: '700' },

  viewfinderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.xl },
  viewfinder: { width: 240, height: 240, borderRadius: RADIUS.lg, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },

  // Corner markers
  corner:     { position: 'absolute', width: 32, height: 32, borderColor: COLORS.primary, borderWidth: 3 },
  tl:         { top: 8, left: 8, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  tr:         { top: 8, right: 8, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  bl:         { bottom: 8, left: 8, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  br:         { bottom: 8, right: 8, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },

  scanIcon:         { color: 'rgba(255,255,255,0.3)', fontSize: 48, fontWeight: '800', marginBottom: SPACING.sm },
  viewfinderHint:   { color: 'rgba(255,255,255,0.5)', fontSize: SIZES.sm, textAlign: 'center' },

  simulateBtn:      { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl },
  btnDisabled:      { opacity: 0.5 },
  simulateBtnText:  { color: '#fff', fontSize: SIZES.base, fontWeight: '700' },

  manualCard:   { backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, paddingBottom: SPACING.xxxl },
  manualTitle:  { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  manualRow:    { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  input:        { flex: 1, backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, fontSize: SIZES.md, color: COLORS.textPrimary, letterSpacing: 1 },
  searchBtn:    { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
  searchBtnText:{ color: '#fff', fontWeight: '700', fontSize: SIZES.base },
  manualHint:   { color: COLORS.textMuted, fontSize: SIZES.xs },
});
