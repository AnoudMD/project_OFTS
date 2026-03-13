import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  type TextInputProps, type ViewStyle,
} from 'react-native';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';

interface AppInputProps extends TextInputProps {
  label?:       string;
  error?:       string;
  containerStyle?: ViewStyle;
  rightIcon?:   React.ReactNode;
  onRightPress?: () => void;
}

export default function AppInput({
  label, error, containerStyle, rightIcon, onRightPress, ...rest
}: AppInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrap,
        focused && styles.focused,
        !!error  && styles.errored,
      ]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.rightIcon} activeOpacity={0.7}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:   { marginBottom: SPACING.md },
  label:     { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  inputWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: COLORS.surface,
    borderWidth:     1.5,
    borderColor:     COLORS.border,
    borderRadius:    RADIUS.md,
    paddingHorizontal: SPACING.md,
  },
  input:     {
    flex:          1,
    paddingVertical: SPACING.md,
    fontSize:      SIZES.md,
    color:         COLORS.textPrimary,
  },
  focused:   { borderColor: COLORS.primary, backgroundColor: '#f0fff4' },
  errored:   { borderColor: COLORS.error },
  rightIcon: { padding: SPACING.xs },
  error:     { fontSize: SIZES.xs, color: COLORS.error, marginTop: SPACING.xs },
});
