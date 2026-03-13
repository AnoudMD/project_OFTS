import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Batch } from '../types';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { apiLookupBatchByCode, apiSaveScan } from '../services/api';
import { formatDate, getStatusStyle } from '../utils';
import TraceabilityTimeline from '../components/TraceabilityTimeline';

type Props = NativeStackScreenProps<RootStackParamList, 'TraceabilityResult'>;

export default function TraceabilityResultScreen({ route, navigation }: Props) {
  const { batchCode } = route.params;
  const [batch,   setBatch]   = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiLookupBatchByCode(batchCode);
        if (!cancelled) {
          setBatch(data);
          // save scan to history (non-blocking)
          apiSaveScan({
            batchId:             data.batchId,
            productName:         data.productName,
            farmName:            data.farmName,
            certificationStatus: data.certificationStatus,
          }).catch(() => {});
        }
      } catch {
        if (!cancelled) setError(`No product found for code "${batchCode}".`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [batchCode]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  if (error || !batch) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>✕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Try Another Code</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusStyle(batch.certificationStatus);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {batch.certificationStatus}
          </Text>
          <Text style={[styles.batchCode, { color: statusStyle.text }]}>{batch.batchId}</Text>
        </View>

        {/* Product info */}
        <View style={styles.card}>
          <Text style={styles.productName}>{batch.productName}</Text>
          <Text style={styles.farmName}>{batch.farmName}</Text>
          <View style={styles.infoGrid}>
            <InfoCell label="Category" value={batch.category} />
            <InfoCell label="Origin" value={batch.origin} />
            <InfoCell label="Produced" value={formatDate(batch.productionDate)} />
            <InfoCell label="Expires" value={formatDate(batch.expiryDate)} />
            {batch.quantity && <InfoCell label="Quantity" value={batch.quantity} />}
            <InfoCell label="Producer" value={batch.producerName} />
          </View>
          {batch.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{batch.notes}</Text>
            </View>
          )}
        </View>

        {/* Certification */}
        {batch.certifierNotes && (
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: statusStyle.border }]}>
            <Text style={styles.sectionTitle}>Certifier Review</Text>
            <Text style={styles.certNotes}>{batch.certifierNotes}</Text>
            {batch.reviewedBy && (
              <Text style={styles.certMeta}>by {batch.reviewedBy} · {formatDate(batch.reviewedAt!)}</Text>
            )}
          </View>
        )}

        {/* Supply chain timeline */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Supply Chain Journey</Text>
          <Text style={styles.sectionSub}>{batch.events.length} events recorded</Text>
          <TraceabilityTimeline events={batch.events} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoCellStyles.cell}>
      <Text style={infoCellStyles.label}>{label}</Text>
      <Text style={infoCellStyles.value}>{value}</Text>
    </View>
  );
}

const infoCellStyles = StyleSheet.create({
  cell:  { width: '48%', marginBottom: SPACING.md },
  label: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: SIZES.base, fontWeight: '600', color: COLORS.textPrimary },
});

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  scroll:       { padding: SPACING.lg, paddingBottom: SPACING.xxxl },

  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryDark, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  backText:     { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.base, fontWeight: '600', width: 60 },
  headerTitle:  { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },

  statusBanner: { borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, alignItems: 'center', gap: 4 },
  statusText:   { fontSize: SIZES.xl, fontWeight: '800' },
  batchCode:    { fontSize: SIZES.sm, fontWeight: '600', opacity: 0.8, fontFamily: 'monospace' },

  card:         { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  productName:  { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  farmName:     { fontSize: SIZES.base, color: COLORS.primary, fontWeight: '600', marginBottom: SPACING.lg },

  infoGrid:     { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  notesBox:     { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.sm },
  notesLabel:   { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.textMuted, marginBottom: 4, textTransform: 'uppercase' },
  notesText:    { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },

  sectionTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  sectionSub:   { fontSize: SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.lg },
  certNotes:    { fontSize: SIZES.base, color: COLORS.textSecondary, lineHeight: 22 },
  certMeta:     { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: SPACING.xs },

  errorIcon:    { fontSize: 48, color: COLORS.error, marginBottom: SPACING.md },
  errorText:    { fontSize: SIZES.base, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  retryBtn:     { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl },
  retryText:    { color: '#fff', fontWeight: '700', fontSize: SIZES.base },
});
