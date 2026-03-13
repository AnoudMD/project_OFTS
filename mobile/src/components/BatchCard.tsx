import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { formatDate } from '../utils';
import StatusBadge from './StatusBadge';
import type { Batch } from '../types';

interface BatchCardProps {
  batch:   Batch;
  onPress: (batch: Batch) => void;
}

export default function BatchCard({ batch, onPress }: BatchCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(batch)}
      activeOpacity={0.8}
    >
      {/* Icon + top row */}
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>📦</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{batch.productName}</Text>
          <Text style={styles.farm} numberOfLines={1}>{batch.farmName}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.batchId}>{batch.batchId}</Text>
        <Text style={styles.date}>{formatDate(batch.createdAt)}</Text>
      </View>

      <View style={styles.footer}>
        <StatusBadge status={batch.certificationStatus} size="sm" />
        {batch.origin ? <Text style={styles.origin}>{batch.origin}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    padding:         SPACING.lg,
    marginBottom:    SPACING.md,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.07,
    shadowRadius:    8,
    elevation:       3,
    borderWidth:     1,
    borderColor:     COLORS.border,
  },
  row:    { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  iconBox:{ width: 44, height: 44, backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  icon:   { fontSize: 22 },
  info:   { flex: 1 },
  name:   { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  farm:   { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  arrow:  { fontSize: 22, color: COLORS.textMuted },

  meta:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  batchId:{ fontSize: SIZES.xs, color: COLORS.primary, fontWeight: '600', fontFamily: 'monospace' },
  date:   { fontSize: SIZES.xs, color: COLORS.textMuted },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.xs },
  origin: { fontSize: SIZES.xs, color: COLORS.textMuted },
});
