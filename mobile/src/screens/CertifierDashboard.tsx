import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CertifierStackParamList } from '../navigation/CertifierNavigator';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { apiListBatches } from '../services/api';
import { getStatusStyle, formatDate } from '../utils';
import type { Batch } from '../types';

type Nav = NativeStackNavigationProp<CertifierStackParamList>;

export default function CertifierDashboard() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<Nav>();
  const [batches, setBatches]       = useState<Batch[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { batches: list } = await apiListBatches();
    setBatches(list);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const pending  = batches.filter(b => b.certificationStatus === 'Pending' || b.certificationStatus === 'Under Review');
  const reviewed = batches.filter(b => b.certificationStatus === 'Certified' || b.certificationStatus === 'Approved' || b.certificationStatus === 'Rejected');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Certifier Portal</Text>
            <Text style={styles.name}>{user?.name ?? 'Certifier'}</Text>
            <View style={styles.roleChip}><Text style={styles.roleText}>CERTIFIER</Text></View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <StatBox label="Awaiting Review" value={pending.length} color="#d97706" />
            <StatBox label="Certified"       value={reviewed.filter(b => b.certificationStatus === 'Certified').length} color={COLORS.primary} />
            <StatBox label="Rejected"        value={reviewed.filter(b => b.certificationStatus === 'Rejected').length} color="#dc2626" />
          </View>

          {/* Pending queue */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Review ({pending.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BatchList', { role: 'certifier' })}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          {pending.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No batches pending review.</Text>
            </View>
          ) : (
            pending.slice(0, 5).map(b => (
              <TouchableOpacity
                key={b._id}
                style={styles.batchRow}
                onPress={() => navigation.navigate('ReviewBatch', { batchId: b._id })}
                activeOpacity={0.8}
              >
                <View style={styles.batchLeft}>
                  <Text style={styles.productName} numberOfLines={1}>{b.productName}</Text>
                  <Text style={styles.batchId}>{b.batchId}</Text>
                  <Text style={styles.batchMeta}>{b.farmName} · {formatDate(b.productionDate)}</Text>
                </View>
                <View style={styles.reviewBtn}>
                  <Text style={styles.reviewBtnText}>Review</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[statStyles.box, { borderTopColor: color }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}
const statStyles = StyleSheet.create({
  box:   { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', borderTopWidth: 3, marginHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  value: { fontSize: SIZES.xxl, fontWeight: '800', marginBottom: 4 },
  label: { fontSize: SIZES.xs, color: COLORS.textMuted, textAlign: 'center', fontWeight: '500' },
});

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  header:       { backgroundColor: COLORS.primaryDark, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:     { color: 'rgba(255,255,255,0.7)', fontSize: SIZES.sm },
  name:         { color: '#fff', fontSize: SIZES.xxl, fontWeight: '800', marginBottom: SPACING.xs },
  roleChip:     { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingVertical: 3, paddingHorizontal: SPACING.sm },
  roleText:     { color: '#fff', fontSize: SIZES.xs, fontWeight: '800', letterSpacing: 1 },
  logoutBtn:    { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.md, paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md },
  logoutText:   { color: '#fff', fontSize: SIZES.sm, fontWeight: '600' },
  content:      { padding: SPACING.lg },
  statsRow:     { flexDirection: 'row', marginBottom: SPACING.xl, marginHorizontal: -4 },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  viewAll:      { color: COLORS.primary, fontSize: SIZES.sm, fontWeight: '600' },
  emptyCard:    { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center' },
  emptyText:    { color: COLORS.textMuted, fontSize: SIZES.base },
  batchRow:     { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  batchLeft:    { flex: 1, marginRight: SPACING.md },
  productName:  { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  batchId:      { fontSize: SIZES.xs, color: COLORS.textMuted, fontFamily: 'monospace', marginBottom: 2 },
  batchMeta:    { fontSize: SIZES.xs, color: COLORS.textSecondary },
  reviewBtn:    { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.sm, paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md },
  reviewBtnText:{ color: COLORS.primaryDark, fontSize: SIZES.sm, fontWeight: '700' },
});
