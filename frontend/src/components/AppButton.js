import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function AppButton({ title, onPress, outline, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        outline && styles.outline,
        style,
      ]}
    >
      <Text style={[styles.text, outline && styles.outlineText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  text: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
  },
});