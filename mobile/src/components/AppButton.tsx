import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet, View,
  type ViewStyle, type TextStyle,
} from 'react-native';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';

interface AppButtonProps {
  label:        string;
  onPress:      () => void;
  variant?:     'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?:        'sm' | 'md' | 'lg';
  loading?:     boolean;
  disabled?:    boolean;
  fullWidth?:   boolean;
  style?:       ViewStyle;
  textStyle?:   TextStyle;
  icon?:        React.ReactNode;
}

export default function AppButton({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = true,
  style, textStyle, icon,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' },
    isDisabled && styles.disabled,
    style as ViewStyle,
  ];

  const labelStyle: TextStyle[] = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    textStyle as TextStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#fff'}
        />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={labelStyle}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius:    RADIUS.lg,
    alignItems:      'center',
    justifyContent:  'center',
    flexDirection:   'row',
  },
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            8,
  },
  iconWrap: { marginRight: 4 },

  // Variants
  primary:   { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.primaryLight },
  outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  danger:    { backgroundColor: '#dc2626' },
  ghost:     { backgroundColor: 'transparent' },

  // Labels
  label:           { fontWeight: '600', textAlign: 'center' },
  label_primary:   { color: '#fff' },
  label_secondary: { color: COLORS.primaryDark },
  label_outline:   { color: COLORS.primary },
  label_danger:    { color: '#fff' },
  label_ghost:     { color: COLORS.primary },

  // Sizes
  size_sm: { paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md },
  size_md: { paddingVertical: SPACING.md,     paddingHorizontal: SPACING.xl },
  size_lg: { paddingVertical: SPACING.lg,     paddingHorizontal: SPACING.xxl },

  labelSize_sm: { fontSize: SIZES.sm },
  labelSize_md: { fontSize: SIZES.md },
  labelSize_lg: { fontSize: SIZES.lg },

  disabled: { opacity: 0.5 },
});
