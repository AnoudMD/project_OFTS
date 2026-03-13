import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { apiGetBatch, apiCertifyBatch } from '../services/api';
import { formatDate, getStatusStyle } from '../utils';
import type { Batch, CertificationStatus } from '../types';
import TraceabilityTimeline from '../components/TraceabilityTimeline';

const DECISIONS: { label: string; value: CertificationStatus; color: string }[] = [
  { label: 'Certify',       value: 'Certified',    color: '#16a34a' },
  { label: 'Approve',       value: 'Approved',     color: '#15803d' },
  { label: 'Under Review',  value: 'Under Review', color: '#2563eb' },
  { label: 'Reject',        value: 'Rejected',     color: '#dc2626' },
];

export default function ReviewBatchScreen() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const { batchId } = route.params;

  const [batch,    setBatch]    = useState<Batch | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [decision, setDecision] = useState<CertificationStatus | null>(null);
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    apiGetBatch(batchId).then(b => { setBatch(b); }).finally(() => setLoading(false));
  }, [batchId]);

  async function handleSubmit() {
    if (!decision) { Alert.alert('Select a decision', 'Choose Certify, Approve, Under Review, or Reject.'); return; }
    setSaving(true);
    try {
      await apiCertifyBatch(batchId, decision, notes.trim() || undefined);
      Alert.alert('Review Submitted', `Batch has been marked as "${decision}".`, [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to submit review.');
    } finally {
      setSaving(false);
    }
  }

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

  const currentStyle = getStatusStyle(batch.certificationStatus);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Batch</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Product info */}
          <View style={styles.card}>
            <View style={[styles.statusRow, { backgroundColor: currentStyle.bg, borderColor: currentStyle.border }]}>
              <Text style={[styles.statusLabel, { color: currentStyle.text }]}>{batch.certificationStatus}</Text>
            </View>
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
                <Text style={styles.notesLabel}>Producer Notes</Text>
                <Text style={styles.notesText}>{batch.notes}</Text>
              </View>
            )}
          </View>

          {/* Docs */}
          {batch.certificationDocuments.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Certification Documents</Text>
              {batch.certificationDocuments.map((doc, i) => (
                <View key={i} style={styles.docRow}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docDate}>{formatDate(doc.uploadedAt)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Timeline */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Supply Chain History ({batch.events.length})</Text>
            <TraceabilityTimeline events={batch.events} />
          </View>

          {/* Review form */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your Decision</Text>
            <View style={styles.decisionsGrid}>
              {DECISIONS.map(d => (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.decisionBtn, { borderColor: d.color }, decision === d.value && { backgroundColor: d.color }]}
                  onPress={() => setDecision(d.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.decisionText, { color: decision === d.value ? '#fff' : d.color }]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Certifier Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Add notes for this review decision..."
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[styles.submitBtn, (!decision || saving) && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!decision || saving}
              activeOpacity={0.85}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Review</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  safe:           { flex: 1, backgroundColor: COLORS.background },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:         { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryDark, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  backText:       { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.base, fontWeight: '600', width: 60 },
  headerTitle:    { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
  card:           { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  statusRow:      { alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingVertical: 4, paddingHorizontal: SPACING.md, borderWidth: 1, marginBottom: SPACING.md },
  statusLabel:    { fontSize: SIZES.sm, fontWeight: '700' },
  productName:    { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  farmName:       { fontSize: SIZES.base, color: COLORS.primary, fontWeight: '600', marginBottom: SPACING.lg },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  notesBox:       { backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.xs },
  notesLabel:     { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.textMuted, marginBottom: 4, textTransform: 'uppercase' },
  notesText:      { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  sectionTitle:   { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  docRow:         { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  docName:        { fontSize: SIZES.sm, color: COLORS.textPrimary, fontWeight: '600' },
  docDate:        { fontSize: SIZES.xs, color: COLORS.textMuted },
  decisionsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  decisionBtn:    { borderRadius: RADIUS.md, borderWidth: 2, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg },
  decisionText:   { fontSize: SIZES.sm, fontWeight: '700' },
  fieldLabel:     { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:          { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, fontSize: SIZES.base, color: COLORS.textPrimary, marginBottom: SPACING.lg },
  textarea:       { height: 100, textAlignVertical: 'top', paddingTop: SPACING.md },
  submitBtn:      { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingVertical: SPACING.md + 2, alignItems: 'center' },
  btnDisabled:    { opacity: 0.5 },
  submitText:     { color: '#fff', fontSize: SIZES.base, fontWeight: '700' },
  muted:          { color: COLORS.textMuted, fontSize: SIZES.base },
});
