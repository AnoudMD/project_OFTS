import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusStyle } from '../utils';
import type { CertificationStatus } from '../types';
import { SIZES, SPACING, RADIUS } from '../constants';

interface StatusBadgeProps {
  status: CertificationStatus;
  size?:  'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const s = getStatusStyle(status);
  return (
    <View style={[
      styles.badge,
      { backgroundColor: s.bg, borderColor: s.border },
      size === 'sm' && styles.small,
    ]}>
      <View style={[styles.dot, { backgroundColor: s.text }]} />
      <Text style={[styles.text, { color: s.text }, size === 'sm' && styles.smallText]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius:    RADIUS.full,
    borderWidth:     1,
    gap:             5,
    alignSelf:       'flex-start',
  },
  small: { paddingVertical: 2, paddingHorizontal: SPACING.xs + 2 },
  dot:   { width: 6, height: 6, borderRadius: 3 },
  text:  { fontSize: SIZES.sm, fontWeight: '600' },
  smallText: { fontSize: SIZES.xs },
});
