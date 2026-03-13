import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { apiLookupBatchByCode } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { Alert.alert('Enter a code', 'Please type or scan a batch QR code.'); return; }
    setLoading(true);
    try {
      await apiLookupBatchByCode(trimmed);
      navigation.navigate('TraceabilityResult', { batchCode: trimmed });
    } catch {
      Alert.alert('Not Found', `No product found for "${trimmed}". Try OT-2025-001234.`);
    } finally {
      setLoading(false);
    }
  }

  function handleDemoScan() {
    setCode('OT-2025-001234');
    setTimeout(() => navigation.navigate('TraceabilityResult', { batchCode: 'OT-2025-001234' }), 400);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>OFTS</Text>
            </View>
            <Text style={styles.heroTitle}>Organic Food{'\n'}Traceability System</Text>
            <Text style={styles.heroSub}>Scan any product QR code to verify its origin, certification, and full supply chain journey.</Text>
          </View>

          {/* Search card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Track a Product</Text>
            <Text style={styles.cardSub}>Enter batch code manually or scan QR</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="e.g. OT-2025-001234"
                placeholderTextColor={COLORS.textMuted}
                value={code}
                onChangeText={t => setCode(t.toUpperCase())}
                autoCapitalize="characters"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleSearch}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Search Product</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnOutline]}
              onPress={() => navigation.navigate('QRScanner')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnOutlineText}>Scan QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={handleDemoScan}
              activeOpacity={0.85}
            >
              <Text style={styles.btnGhostText}>Try Demo Scan</Text>
            </TouchableOpacity>
          </View>

          {/* Demo codes */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Demo Batch Codes</Text>
            {['OT-2025-001234', 'OT-2025-005678', 'OT-2025-009012'].map(c => (
              <TouchableOpacity key={c} style={styles.codeRow} onPress={() => {
                setCode(c);
                navigation.navigate('TraceabilityResult', { batchCode: c });
              }}>
                <View style={styles.codeDot} />
                <Text style={styles.codeText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Login link */}
          <View style={styles.loginCard}>
            <Text style={styles.loginLabel}>Are you a supply chain stakeholder?</Text>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Supply Chain Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: COLORS.primaryDark },
  scroll:        { padding: SPACING.xl, paddingBottom: SPACING.xxxl },

  hero:          { alignItems: 'center', paddingVertical: SPACING.xxxl },
  logoCircle:    { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  logoText:      { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  heroTitle:     { color: '#fff', fontSize: SIZES.xxxl, fontWeight: '800', textAlign: 'center', lineHeight: 36, marginBottom: SPACING.md },
  heroSub:       { color: 'rgba(255,255,255,0.75)', fontSize: SIZES.base, textAlign: 'center', lineHeight: 22 },

  card:          { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 },
  cardTitle:     { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  cardSub:       { fontSize: SIZES.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },

  inputRow:      { marginBottom: SPACING.md },
  input:         { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, fontSize: SIZES.md, color: COLORS.textPrimary, letterSpacing: 1 },

  btn:           { borderRadius: RADIUS.lg, paddingVertical: SPACING.md + 2, alignItems: 'center', marginBottom: SPACING.sm },
  btnPrimary:    { backgroundColor: COLORS.primary },
  btnOutline:    { borderWidth: 1.5, borderColor: COLORS.primary },
  btnGhost:      { backgroundColor: 'transparent' },
  btnDisabled:   { opacity: 0.6 },
  btnText:       { color: '#fff', fontSize: SIZES.md, fontWeight: '700' },
  btnOutlineText:{ color: COLORS.primary, fontSize: SIZES.md, fontWeight: '700' },
  btnGhostText:  { color: COLORS.textMuted, fontSize: SIZES.sm, fontWeight: '600' },

  codeRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  codeDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: SPACING.sm },
  codeText:      { fontSize: SIZES.base, color: COLORS.primary, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  loginCard:     { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.xl, padding: SPACING.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  loginLabel:    { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.base, textAlign: 'center', marginBottom: SPACING.md, fontWeight: '500' },
});
