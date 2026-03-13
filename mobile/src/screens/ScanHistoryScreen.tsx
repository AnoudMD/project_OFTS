import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, ScanRecord } from '../types';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { apiGetScanHistory } from '../services/api';
import { getStatusStyle, timeAgo } from '../utils';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanHistory'>;

export default function ScanHistoryScreen({ navigation }: Props) {
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetScanHistory().then(setRecords).finally(() => setLoading(false));
  }, []);

  function renderItem({ item }: { item: ScanRecord }) {
    const s = getStatusStyle(item.certificationStatus);
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('TraceabilityResult', { batchCode: item.batchId })}
        activeOpacity={0.8}
      >
        <View style={styles.rowLeft}>
          <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
          <Text style={styles.farmName}>{item.farmName}</Text>
          <Text style={styles.batchId}>{item.batchId}</Text>
        </View>
        <View style={styles.rowRight}>
          <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{item.certificationStatus}</Text>
          </View>
          <Text style={styles.time}>{timeAgo(item.scannedAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan History</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : records.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptyText}>Scan a product QR code to see it here.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={i => i._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryDark, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  backText:     { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.base, fontWeight: '600', width: 60 },
  headerTitle:  { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
  list:         { padding: SPACING.lg },

  row:          { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rowLeft:      { flex: 1, marginRight: SPACING.md },
  productName:  { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  farmName:     { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 2 },
  batchId:      { fontSize: SIZES.xs, color: COLORS.textMuted, fontFamily: 'monospace' },
  rowRight:     { alignItems: 'flex-end', gap: SPACING.xs },
  badge:        { borderRadius: RADIUS.full, paddingVertical: 3, paddingHorizontal: SPACING.sm, borderWidth: 1 },
  badgeText:    { fontSize: SIZES.xs, fontWeight: '700' },
  time:         { fontSize: SIZES.xs, color: COLORS.textMuted },
  sep:          { height: SPACING.sm },
  emptyTitle:   { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  emptyText:    { fontSize: SIZES.base, color: COLORS.textMuted, textAlign: 'center' },
});
