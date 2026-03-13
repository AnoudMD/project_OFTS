import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProducerStackParamList } from '../navigation/ProducerNavigator';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { apiListBatches } from '../services/api';
import type { Batch } from '../types';

type Nav = NativeStackNavigationProp<ProducerStackParamList>;

export default function ProducerDashboard() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<Nav>();
  const [batches,    setBatches]    = useState<Batch[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadBatches = useCallback(async () => {
    const { batches: list } = await apiListBatches();
    setBatches(list);
  }, []);

  useFocusEffect(useCallback(() => { loadBatches(); }, [loadBatches]));

  async function onRefresh() {
    setRefreshing(true);
    await loadBatches();
    setRefreshing(false);
  }

  const stats = {
    total:      batches.length,
    certified:  batches.filter(b => b.certificationStatus === 'Certified').length,
    pending:    batches.filter(b => b.certificationStatus === 'Pending').length,
    rejected:   batches.filter(b => b.certificationStatus === 'Rejected').length,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.name}>{user?.name ?? 'Producer'}</Text>
            <View style={styles.roleChip}><Text style={styles.roleText}>PRODUCER</Text></View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsGrid}>
            <StatCard label="Total Batches" value={stats.total} color={COLORS.primary} />
            <StatCard label="Certified"     value={stats.certified} color="#16a34a" />
            <StatCard label="Pending"       value={stats.pending}   color="#d97706" />
            <StatCard label="Rejected"      value={stats.rejected}  color="#dc2626" />
          </View>

          {/* Quick actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              icon="+"
              label="Create Batch"
              desc="Register a new product batch"
              color={COLORS.primary}
              onPress={() => navigation.navigate('CreateBatch')}
            />
            <ActionCard
              icon="≡"
              label="My Batches"
              desc="View and manage all batches"
              color={COLORS.primaryDark}
              onPress={() => navigation.navigate('BatchList', { role: 'producer' })}
            />
          </View>

          {/* Recent batches */}
          {batches.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Recent Batches</Text>
              {batches.slice(0, 3).map(b => (
                <TouchableOpacity
                  key={b._id}
                  style={styles.batchRow}
                  onPress={() => navigation.navigate('BatchDetail', { batchId: b._id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.batchRowLeft}>
                    <Text style={styles.batchName} numberOfLines={1}>{b.productName}</Text>
                    <Text style={styles.batchId}>{b.batchId}</Text>
                  </View>
                  <StatusPill status={b.certificationStatus} />
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[statStyles.card, { borderTopColor: color }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function ActionCard({ icon, label, desc, color, onPress }: {
  icon: string; label: string; desc: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={actionStyles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[actionStyles.iconCircle, { backgroundColor: color }]}>
        <Text style={actionStyles.icon}>{icon}</Text>
      </View>
      <Text style={actionStyles.label}>{label}</Text>
      <Text style={actionStyles.desc}>{desc}</Text>
    </TouchableOpacity>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Certified: { bg: '#dcfce7', text: '#166534' },
    Approved:  { bg: '#dcfce7', text: '#166534' },
    Pending:   { bg: '#fef3c7', text: '#92400e' },
    Rejected:  { bg: '#fee2e2', text: '#991b1b' },
    'Under Review': { bg: '#dbeafe', text: '#1e40af' },
  };
  const c = colors[status] ?? colors['Pending'];
  return (
    <View style={[pillStyles.pill, { backgroundColor: c.bg }]}>
      <Text style={[pillStyles.text, { color: c.text }]}>{status}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card:  { width: '47%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderTopWidth: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  value: { fontSize: SIZES.xxxl, fontWeight: '800', marginBottom: 4 },
  label: { fontSize: SIZES.sm, color: COLORS.textMuted, fontWeight: '500' },
});

const actionStyles = StyleSheet.create({
  card:        { width: '47%', backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.md, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  iconCircle:  { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  icon:        { color: '#fff', fontSize: 28, fontWeight: '700', lineHeight: 32 },
  label:       { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 2 },
  desc:        { fontSize: SIZES.xs, color: COLORS.textMuted, textAlign: 'center' },
});

const pillStyles = StyleSheet.create({
  pill: { borderRadius: RADIUS.full, paddingVertical: 4, paddingHorizontal: SPACING.sm },
  text: { fontSize: SIZES.xs, fontWeight: '700' },
});

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLORS.background },
  header:      { backgroundColor: COLORS.primaryDark, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting:    { color: 'rgba(255,255,255,0.7)', fontSize: SIZES.sm },
  name:        { color: '#fff', fontSize: SIZES.xxl, fontWeight: '800', marginBottom: SPACING.xs },
  roleChip:    { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingVertical: 3, paddingHorizontal: SPACING.sm },
  roleText:    { color: '#fff', fontSize: SIZES.xs, fontWeight: '800', letterSpacing: 1 },
  logoutBtn:   { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.md, paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md },
  logoutText:  { color: '#fff', fontSize: SIZES.sm, fontWeight: '600' },
  content:     { padding: SPACING.lg },
  statsGrid:   { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SPACING.md },
  sectionTitle:{ fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md, marginTop: SPACING.sm },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SPACING.md },
  batchRow:    { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  batchRowLeft:{ flex: 1, marginRight: SPACING.md },
  batchName:   { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  batchId:     { fontSize: SIZES.xs, color: COLORS.textMuted, fontFamily: 'monospace' },
});
