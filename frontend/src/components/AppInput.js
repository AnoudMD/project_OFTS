import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function AppInput(props) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#9CA3AF"
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: COLORS.white,
    marginTop: 6,
  },
});
