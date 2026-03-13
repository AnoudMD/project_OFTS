import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { apiListBatches } from '../services/api';
import { getStatusStyle, formatDate } from '../utils';
import type { Batch } from '../types';

export default function BatchListScreen() {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const role       = route.params?.role ?? 'producer';

  const [batches,    setBatches]    = useState<Batch[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');

  const load = useCallback(async () => {
    const { batches: list } = await apiListBatches({ search: search || undefined });
    setBatches(list);
    setLoading(false);
    setRefreshing(false);
  }, [search]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  async function onRefresh() {
    setRefreshing(true);
    await load();
  }

  const filtered = search
    ? batches.filter(b => b.productName.toLowerCase().includes(search.toLowerCase()) || b.batchId.includes(search))
    : batches;

  function renderItem({ item }: { item: Batch }) {
    const s = getStatusStyle(item.certificationStatus);
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('BatchDetail', { batchId: item._id })}
        activeOpacity={0.8}
      >
        <View style={styles.rowTop}>
          <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
          <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
            <Text style={[styles.badgeText, { color: s.text }]}>{item.certificationStatus}</Text>
          </View>
        </View>
        <Text style={styles.batchId}>{item.batchId}</Text>
        <View style={styles.rowMeta}>
          <Text style={styles.meta}>{item.farmName}</Text>
          <Text style={styles.meta}>{formatDate(item.productionDate)}</Text>
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
        <Text style={styles.headerTitle}>Batches</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or batch ID..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No batches found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryDark, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  backText:     { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.base, fontWeight: '600', width: 60 },
  headerTitle:  { color: '#fff', fontSize: SIZES.lg, fontWeight: '700' },
  searchBox:    { backgroundColor: COLORS.surface, padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInput:  { backgroundColor: COLORS.background, borderRadius: RADIUS.md, paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg, fontSize: SIZES.base, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  list:         { padding: SPACING.lg },
  row:          { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  rowTop:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  productName:  { flex: 1, fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginRight: SPACING.sm },
  batchId:      { fontSize: SIZES.xs, color: COLORS.textMuted, fontFamily: 'monospace', marginBottom: SPACING.xs },
  rowMeta:      { flexDirection: 'row', justifyContent: 'space-between' },
  meta:         { fontSize: SIZES.xs, color: COLORS.textSecondary },
  badge:        { borderRadius: RADIUS.full, paddingVertical: 3, paddingHorizontal: SPACING.sm, borderWidth: 1 },
  badgeText:    { fontSize: SIZES.xs, fontWeight: '700' },
  empty:        { alignItems: 'center', paddingTop: SPACING.xxxl },
  emptyText:    { color: COLORS.textMuted, fontSize: SIZES.base },
});
