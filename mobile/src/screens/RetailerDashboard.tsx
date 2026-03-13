import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RetailerStackParamList } from '../navigation/RetailerNavigator';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { apiListBatches } from '../services/api';
import { getStatusStyle, formatDate } from '../utils';
import type { Batch } from '../types';

type Nav = NativeStackNavigationProp<RetailerStackParamList>;

export default function RetailerDashboard() {
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

  const certifiedCount = batches.filter(b => b.certificationStatus === 'Certified').length;
  const pendingCount   = batches.filter(b => ['Pending', 'Under Review'].includes(b.certificationStatus)).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Retailer Portal</Text>
            <Text style={styles.name}>{user?.name ?? 'Retailer'}</Text>
            <View style={styles.roleChip}><Text style={styles.roleText}>RETAILER</Text></View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <StatBox label="Total Batches" value={batches.length} color={COLORS.primary} />
            <StatBox label="Certified"     value={certifiedCount}  color="#16a34a" />
            <StatBox label="Pending"       value={pendingCount}    color="#d97706" />
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <ActionCard label="Browse Products" icon="≡" onPress={() => navigation.navigate('BatchList', { role: 'retailer' })} />
            <ActionCard label="Add Event"        icon="+" onPress={() => navigation.navigate('AddEvent', { role: 'retailer' })} />
          </View>

          {/* Product shelf */}
          <Text style={styles.sectionTitle}>Product Inventory</Text>
          {batches.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No products available.</Text>
            </View>
          ) : (
            batches.slice(0, 6).map(b => {
              const s = getStatusStyle(b.certificationStatus);
              return (
                <TouchableOpacity
                  key={b._id}
                  style={styles.productCard}
                  onPress={() => navigation.navigate('BatchDetail', { batchId: b._id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.productLeft}>
                    <View style={styles.categoryChip}>
                      <Text style={styles.categoryText}>{b.category}</Text>
                    </View>
                    <Text style={styles.productName}>{b.productName}</Text>
                    <Text style={styles.farmName}>{b.farmName}</Text>
                    <Text style={styles.batchId}>{b.batchId}</Text>
                  </View>
                  <View style={styles.productRight}>
                    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
                      <Text style={[styles.badgeText, { color: s.text }]}>{b.certificationStatus}</Text>
                    </View>
                    <Text style={styles.date}>Exp: {formatDate(b.expiryDate)}</Text>
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
  statsRow:     { flexDirection: 'row', marginHorizontal: -4, marginBottom: SPACING.lg },
  actionsRow:   { flexDirection: 'row', marginHorizontal: -4, marginBottom: SPACING.xl },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  emptyCard:    { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center' },
  emptyText:    { color: COLORS.textMuted, fontSize: SIZES.base },
  productCard:  { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.sm, flexDirection: 'row', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productLeft:  { flex: 1, marginRight: SPACING.md },
  categoryChip: { backgroundColor: COLORS.primaryLight, alignSelf: 'flex-start', borderRadius: RADIUS.full, paddingVertical: 2, paddingHorizontal: SPACING.sm, marginBottom: SPACING.xs },
  categoryText: { color: COLORS.primaryDark, fontSize: SIZES.xs, fontWeight: '700' },
  productName:  { fontSize: SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  farmName:     { fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: 2 },
  batchId:      { fontSize: SIZES.xs, color: COLORS.textMuted, fontFamily: 'monospace' },
  productRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  badge:        { borderRadius: RADIUS.full, paddingVertical: 3, paddingHorizontal: SPACING.sm, borderWidth: 1, marginBottom: SPACING.xs },
  badgeText:    { fontSize: SIZES.xs, fontWeight: '700' },
  date:         { fontSize: SIZES.xs, color: COLORS.textMuted },
});
