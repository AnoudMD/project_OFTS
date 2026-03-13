import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Batch } from '../types';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { apiGetBatch } from '../services/api';
import TraceabilityTimeline from '../components/TraceabilityTimeline';

type Props = NativeStackScreenProps<RootStackParamList, 'TraceabilityHistory'>;

export default function TraceabilityHistoryScreen({ route, navigation }: Props) {
  const { batchId } = route.params;
  const [batch,   setBatch]   = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetBatch(batchId)
      .then(setBatch)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [batchId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supply Chain History</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : !batch ? (
        <View style={styles.center}><Text style={styles.muted}>Batch not found.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.batchInfo}>
            <Text style={styles.productName}>{batch.productName}</Text>
            <Text style={styles.batchId}>{batch.batchId}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Full Journey</Text>
            <Text style={styles.sectionSub}>{batch.events.length} events</Text>
            <TraceabilityTimeline events={batch.events} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll:       { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryDark, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  backText:     { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.base, fontWeight: '600', width: 60 },
  headerTitle:  { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
  batchInfo:    { backgroundColor: COLORS.primaryDark, marginHorizontal: 0, padding: SPACING.xl, marginBottom: SPACING.md },
  productName:  { color: '#fff', fontSize: SIZES.xl, fontWeight: '800', marginBottom: 4 },
  batchId:      { color: 'rgba(255,255,255,0.7)', fontSize: SIZES.sm, fontFamily: 'monospace' },
  card:         { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  sectionSub:   { fontSize: SIZES.xs, color: COLORS.textMuted, marginBottom: SPACING.lg },
  muted:        { color: COLORS.textMuted, fontSize: SIZES.base },
});
