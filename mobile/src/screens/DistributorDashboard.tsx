import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DistributorStackParamList } from '../navigation/DistributorNavigator';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { apiListBatches } from '../services/api';
import { formatDate, getStatusStyle } from '../utils';
import type { Batch } from '../types';

type Nav = NativeStackNavigationProp<DistributorStackParamList>;

export default function DistributorDashboard() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<Nav>();
  const [batches, setBatches]       = useState<Batch[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { batches: list } = await apiListBatches({ status: 'Approved' });
    setBatches(list);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Distributor Portal</Text>
            <Text style={styles.name}>{user?.name ?? 'Distributor'}</Text>
            <View style={styles.roleChip}><Text style={styles.roleText}>DISTRIBUTOR</Text></View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Actions */}
          <View style={styles.actionsRow}>
            <ActionCard
              label="All Batches"
              icon="≡"
              onPress={() => navigation.navigate('BatchList', { role: 'distributor' })}
            />
            <ActionCard
              label="Add Event"
              icon="+"
              onPress={() => navigation.navigate('AddEvent', { role: 'distributor' })}
            />
          </View>

          {/* Certified / approved batches ready for distribution */}
          <Text style={styles.sectionTitle}>Ready for Distribution</Text>
          {batches.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No approved batches at the moment.</Text>
            </View>
          ) : (
            batches.slice(0, 8).map(b => {
              const s = getStatusStyle(b.certificationStatus);
              return (
                <TouchableOpacity
                  key={b._id}
                  style={styles.batchRow}
                  onPress={() => navigation.navigate('BatchDetail', { batchId: b._id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.batchLeft}>
                    <Text style={styles.productName} numberOfLines={1}>{b.productName}</Text>
                    <Text style={styles.batchId}>{b.batchId}</Text>
                    <Text style={styles.batchMeta}>{b.origin} · {formatDate(b.productionDate)}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
                    <Text style={[styles.badgeText, { color: s.text }]}>{b.certificationStatus}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={actionStyles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={actionStyles.iconCircle}>
        <Text style={actionStyles.icon}>{icon}</Text>
      </View>
      <Text style={actionStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}
const actionStyles = StyleSheet.create({
  card:       { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, alignItems: 'center', marginHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  icon:       { color: COLORS.primaryDark, fontSize: 24, fontWeight: '700' },
  label:      { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary },
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
  actionsRow:   { flexDirection: 'row', marginHorizontal: -4, marginBottom: SPACING.xl },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  emptyCard:    { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center' },
  emptyText:    { color: COLORS.textMuted, fontSize: SIZES.base },
  batchRow:     { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  batchLeft:    { flex: 1, marginRight: SPACING.md },
  productName:  { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  batchId:      { fontSize: SIZES.xs, color: COLORS.textMuted, fontFamily: 'monospace', marginBottom: 2 },
  batchMeta:    { fontSize: SIZES.xs, color: COLORS.textSecondary },
  badge:        { borderRadius: RADIUS.full, paddingVertical: 3, paddingHorizontal: SPACING.sm, borderWidth: 1 },
  badgeText:    { fontSize: SIZES.xs, fontWeight: '700' },
});
