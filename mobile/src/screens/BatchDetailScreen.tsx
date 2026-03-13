import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { apiGetBatch } from '../services/api';
import { formatDate, getStatusStyle } from '../utils';
import type { Batch } from '../types';
import TraceabilityTimeline from '../components/TraceabilityTimeline';
import { useAuth } from '../context/AuthContext';

export default function BatchDetailScreen() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const { batchId } = route.params;
  const { user }    = useAuth();

  const [batch,   setBatch]   = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetBatch(batchId).then(setBatch).finally(() => setLoading(false));
  }, [batchId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </SafeAreaView>
    );
  }

  if (!batch) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}><Text style={styles.muted}>Batch not found.</Text></View>
      </SafeAreaView>
    );
  }

  const s = getStatusStyle(batch.certificationStatus);
  const canAddEvent = user?.role === 'distributor' || user?.role === 'retailer';
  const canReview   = user?.role === 'certifier';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Batch Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: s.bg, borderColor: s.border }]}>
          <Text style={[styles.statusText, { color: s.text }]}>{batch.certificationStatus}</Text>
          <Text style={[styles.batchIdText, { color: s.text }]}>{batch.batchId}</Text>
        </View>

        {/* Product info */}
        <View style={styles.card}>
          <Text style={styles.productName}>{batch.productName}</Text>
          <Text style={styles.farmName}>{batch.farmName}</Text>
          <View style={styles.grid}>
            <InfoCell label="Category" value={batch.category} />
            <InfoCell label="Origin"   value={batch.origin} />
            <InfoCell label="Produced" value={formatDate(batch.productionDate)} />
            <InfoCell label="Expires"  value={formatDate(batch.expiryDate)} />
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

        {/* Certifier notes */}
        {batch.certifierNotes && (
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: s.border }]}>
            <Text style={styles.sectionTitle}>Certifier Review</Text>
            <Text style={styles.certNotes}>{batch.certifierNotes}</Text>
            {batch.reviewedBy && (
              <Text style={styles.certMeta}>by {batch.reviewedBy} · {formatDate(batch.reviewedAt!)}</Text>
            )}
          </View>
        )}

        {/* Actions */}
        {(canAddEvent || canReview) && (
          <View style={styles.actionsCard}>
            {canReview && (
              <TouchableOpacity style={styles.actionBtn}
                onPress={() => navigation.navigate('ReviewBatch', { batchId: batch._id })}>
                <Text style={styles.actionBtnText}>Review & Certify</Text>
              </TouchableOpacity>
            )}
            {canAddEvent && (
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]}
                onPress={() => navigation.navigate('AddEvent', { batchId: batch._id, role: user?.role })}>
                <Text style={styles.actionBtnSecondaryText}>Add Supply Chain Event</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Timeline */}
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
    <View style={cellStyles.cell}>
      <Text style={cellStyles.label}>{label}</Text>
      <Text style={cellStyles.value}>{value}</Text>
    </View>
  );
}
const cellStyles = StyleSheet.create({
  cell:  { width: '48%', marginBottom: SPACING.md },
  label: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
});

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:       { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryDark, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  backText:     { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.base, fontWeight: '600', width: 60 },
  headerTitle:  { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
  statusBanner: { borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, alignItems: 'center', gap: 4 },
  statusText:   { fontSize: SIZES.xl, fontWeight: '800' },
  batchIdText:  { fontSize: SIZES.sm, fontWeight: '600', opacity: 0.8, fontFamily: 'monospace' },
  card:         { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  productName:  { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  farmName:     { fontSize: SIZES.base, color: COLORS.primary, fontWeight: '600', marginBottom: SPACING.lg },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  notesBox:     { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.sm },
  notesLabel:   { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.textMuted, marginBottom: 4, textTransform: 'uppercase' },
  notesText:    { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  sectionSub:   { fontSize: SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.lg },
  certNotes:    { fontSize: SIZES.base, color: COLORS.textSecondary, lineHeight: 22 },
  certMeta:     { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: SPACING.xs },
  actionsCard:  { gap: SPACING.sm, marginBottom: SPACING.md },
  actionBtn:    { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center' },
  actionBtnText:{ color: '#fff', fontSize: SIZES.base, fontWeight: '700' },
  actionBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  actionBtnSecondaryText: { color: COLORS.primary, fontSize: SIZES.base, fontWeight: '700' },
  muted:        { color: COLORS.textMuted, fontSize: SIZES.base },
});
