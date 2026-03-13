import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  Alert, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProducerStackParamList } from '../navigation/ProducerNavigator';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { apiCreateBatch } from '../services/api';

type Nav = NativeStackNavigationProp<ProducerStackParamList>;

const CATEGORIES = ['Coffee', 'Tea', 'Honey', 'Oils', 'Grains', 'Fruits', 'Vegetables', 'Dairy', 'Other'];

export default function CreateBatchScreen() {
  const navigation = useNavigation<Nav>();
  const [form, setForm] = useState({
    productName: '', farmName: '', category: '', origin: '',
    productionDate: '', expiryDate: '', quantity: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCats, setShowCats] = useState(false);

  function set(key: keyof typeof form, val: string) {
    setForm(p => ({ ...p, [key]: val }));
  }

  async function handleSubmit() {
    const { productName, farmName, category, origin, productionDate, expiryDate } = form;
    if (!productName || !farmName || !category || !origin || !productionDate || !expiryDate) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const batch = await apiCreateBatch(form);
      Alert.alert('Batch Created!', `Batch ${batch.batchId} created successfully.`, [
        { text: 'View Batch', onPress: () => navigation.replace('BatchDetail', { batchId: batch._id }) },
        { text: 'Create Another', onPress: () => setForm({ productName: '', farmName: '', category: '', origin: '', productionDate: '', expiryDate: '', quantity: '', notes: '' }) },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create batch.');
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
        <Text style={styles.headerTitle}>Create Batch</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Product Information</Text>

            <Field label="Product Name *">
              <TextInput style={styles.input} placeholder="e.g. Organic Arabica Coffee" placeholderTextColor={COLORS.textMuted}
                value={form.productName} onChangeText={t => set('productName', t)} />
            </Field>

            <Field label="Farm Name *">
              <TextInput style={styles.input} placeholder="e.g. Green Valley Farm" placeholderTextColor={COLORS.textMuted}
                value={form.farmName} onChangeText={t => set('farmName', t)} />
            </Field>

            <Field label="Category *">
              <TouchableOpacity style={styles.picker} onPress={() => setShowCats(p => !p)}>
                <Text style={form.category ? styles.pickerValue : styles.pickerPlaceholder}>
                  {form.category || 'Select category'}
                </Text>
                <Text style={styles.pickerArrow}>{showCats ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showCats && (
                <View style={styles.dropdown}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity key={c} style={styles.dropItem}
                      onPress={() => { set('category', c); setShowCats(false); }}>
                      <Text style={[styles.dropItemText, form.category === c && styles.dropItemSelected]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Field>

            <Field label="Origin / Country *">
              <TextInput style={styles.input} placeholder="e.g. Colombia" placeholderTextColor={COLORS.textMuted}
                value={form.origin} onChangeText={t => set('origin', t)} />
            </Field>

            <Field label="Production Date *  (YYYY-MM-DD)">
              <TextInput style={styles.input} placeholder="2025-10-15" placeholderTextColor={COLORS.textMuted}
                value={form.productionDate} onChangeText={t => set('productionDate', t)} />
            </Field>

            <Field label="Expiry Date *  (YYYY-MM-DD)">
              <TextInput style={styles.input} placeholder="2026-10-15" placeholderTextColor={COLORS.textMuted}
                value={form.expiryDate} onChangeText={t => set('expiryDate', t)} />
            </Field>

            <Field label="Quantity (optional)">
              <TextInput style={styles.input} placeholder="e.g. 500 kg" placeholderTextColor={COLORS.textMuted}
                value={form.quantity} onChangeText={t => set('quantity', t)} />
            </Field>

            <Field label="Notes (optional)">
              <TextInput style={[styles.input, styles.textarea]} placeholder="Additional product notes..."
                placeholderTextColor={COLORS.textMuted} value={form.notes}
                onChangeText={t => set('notes', t)} multiline numberOfLines={3} />
            </Field>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>Create Batch</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label:     { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
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
  submitBtn:         { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  btnDisabled:       { opacity: 0.6 },
  submitText:        { color: '#fff', fontSize: SIZES.lg, fontWeight: '800' },
});
