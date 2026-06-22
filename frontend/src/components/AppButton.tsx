import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

interface AppButtonProps {
  title: string;
  onPress?: () => void;
  outline?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  outline,
  loading,
  style,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    style={[styles.button, outline && styles.outline, style]}
  >
    {loading ? (
      <ActivityIndicator color={outline ? theme.colors.primary : '#fff'} />
    ) : (
      <Text style={[styles.text, outline && styles.outlineText]}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: 12,
    ...theme.shadow,
  },
  outline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  text: { color: '#fff', fontWeight: '700', fontSize: 16 },
  outlineText: { color: theme.colors.primary },
});
