import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, SPACING, RADIUS, EVENT_TYPES } from '../constants';
import { apiAddEvent } from '../services/api';
import type { EventType } from '../types';

export default function AddSupplyChainEventScreen() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const batchIdParam = route.params?.batchId ?? '';

  const [batchId,   setBatchId]   = useState(batchIdParam);
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [location,  setLocation]  = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [notes,     setNotes]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showTypes, setShowTypes] = useState(false);

  async function handleSubmit() {
    if (!batchId.trim() || !eventType || !location.trim() || !timestamp.trim()) {
      Alert.alert('Missing Fields', 'Please fill Batch ID, event type, location, and timestamp.');
      return;
    }
    setLoading(true);
    try {
      await apiAddEvent({
        batchId:   batchId.trim(),
        eventType: eventType as EventType,
        location:  location.trim(),
        timestamp: new Date(timestamp).toISOString(),
        notes:     notes.trim() || undefined,
      });
      Alert.alert('Event Added', `"${eventType}" event recorded successfully.`, [
        { text: 'Add Another', onPress: () => { setEventType(''); setLocation(''); setNotes(''); } },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to add event.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Supply Chain Event</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Event Details</Text>

            <Field label="Batch ID *">
              <TextInput
                style={styles.input}
                placeholder="e.g. OT-2025-001234"
                placeholderTextColor={COLORS.textMuted}
                value={batchId}
                onChangeText={t => setBatchId(t.toUpperCase())}
                autoCapitalize="characters"
              />
            </Field>

            <Field label="Event Type *">
              <TouchableOpacity style={styles.picker} onPress={() => setShowTypes(p => !p)}>
                <Text style={eventType ? styles.pickerValue : styles.pickerPlaceholder}>
                  {eventType || 'Select event type'}
                </Text>
                <Text style={styles.pickerArrow}>{showTypes ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showTypes && (
                <View style={styles.dropdown}>
                  {EVENT_TYPES.map(t => (
                    <TouchableOpacity
                      key={t}
                      style={styles.dropItem}
                      onPress={() => { setEventType(t); setShowTypes(false); }}
                    >
                      <Text style={[styles.dropItemText, eventType === t && styles.dropItemSelected]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Field>

            <Field label="Location *">
              <TextInput
                style={styles.input}
                placeholder="e.g. Port of Cartagena, Colombia"
                placeholderTextColor={COLORS.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </Field>

            <Field label="Timestamp *  (YYYY-MM-DDTHH:MM)">
              <TextInput
                style={styles.input}
                placeholder="2025-10-15T08:30"
                placeholderTextColor={COLORS.textMuted}
                value={timestamp}
                onChangeText={setTimestamp}
              />
            </Field>

            <Field label="Notes (optional)">
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Additional details about this event..."
                placeholderTextColor={COLORS.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </Field>
          </View>

          {/* Event type quick reference */}
          <View style={styles.referenceCard}>
            <Text style={styles.referenceTitle}>Supply Chain Flow</Text>
            <View style={styles.flowRow}>
              {(['Harvest', 'Processing', 'Quality Check', 'Packaging', 'Shipment', 'Distribution', 'Retail'] as const).map((t, i, arr) => (
                <React.Fragment key={t}>
                  <View style={[styles.flowStep, eventType === t && styles.flowStepActive]}>
                    <Text style={[styles.flowText, eventType === t && styles.flowTextActive]}>{t}</Text>
                  </View>
                  {i < arr.length - 1 && <Text style={styles.flowArrow}>›</Text>}
                </React.Fragment>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>Record Event</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}
const fieldStyles = StyleSheet.create({
  wrap:  { marginBottom: SPACING.lg },
  label: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
});

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: COLORS.background },
  header:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryDark, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  backText:          { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.base, fontWeight: '600', width: 60 },
  headerTitle:       { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
  scroll:            { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  card:              { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardTitle:         { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xl },
  input:             { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, fontSize: SIZES.base, color: COLORS.textPrimary },
  textarea:          { height: 80, textAlignVertical: 'top', paddingTop: SPACING.md },
  picker:            { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerValue:       { fontSize: SIZES.base, color: COLORS.textPrimary },
  pickerPlaceholder: { fontSize: SIZES.base, color: COLORS.textMuted },
  pickerArrow:       { color: COLORS.textMuted, fontSize: SIZES.sm },
  dropdown:          { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginTop: 4, zIndex: 99 },
  dropItem:          { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropItemText:      { fontSize: SIZES.base, color: COLORS.textPrimary },
  dropItemSelected:  { color: COLORS.primary, fontWeight: '700' },

  referenceCard:     { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.lg },
  referenceTitle:    { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textMuted, marginBottom: SPACING.md, textTransform: 'uppercase' },
  flowRow:           { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  flowStep:          { backgroundColor: COLORS.background, borderRadius: RADIUS.sm, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: COLORS.border },
  flowStepActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  flowText:          { fontSize: SIZES.xs, color: COLORS.textMuted, fontWeight: '600' },
  flowTextActive:    { color: '#fff' },
  flowArrow:         { color: COLORS.textMuted, fontSize: 12 },

  submitBtn:         { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnDisabled:       { opacity: 0.6 },
  submitText:        { color: '#fff', fontSize: SIZES.lg, fontWeight: '800' },
});
