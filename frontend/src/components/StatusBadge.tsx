import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styleMap: Record<string, { backgroundColor: string; color: string }> = {
    Approved: { backgroundColor: '#E6F6ED', color: theme.colors.success },
    Pending: { backgroundColor: '#FFF7E5', color: theme.colors.warning },
    Rejected: { backgroundColor: '#FCEDED', color: theme.colors.danger },
    'Certified Organic': { backgroundColor: '#E6F6ED', color: theme.colors.success },
  };
  const colors = styleMap[status] || { backgroundColor: '#F2F6F2', color: theme.colors.text };

  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }]}> 
      <Text style={[styles.text, { color: colors.color }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    fontSize: 12,
  },
});
