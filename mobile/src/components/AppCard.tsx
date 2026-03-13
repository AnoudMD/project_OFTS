import React from 'react';
import {
  View, TouchableOpacity, StyleSheet,
  type ViewStyle,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants';

interface AppCardProps {
  children:    React.ReactNode;
  onPress?:    () => void;
  style?:      ViewStyle;
  padded?:     boolean;
}

export default function AppCard({ children, onPress, style, padded = true }: AppCardProps) {
  const inner = (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius:    RADIUS.lg,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.07,
    shadowRadius:    8,
    elevation:       3,
    marginBottom:    SPACING.md,
  },
  padded: { padding: SPACING.lg },
});
