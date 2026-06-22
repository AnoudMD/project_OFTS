import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { theme } from '../constants/theme';

export const AppInput: React.FC<TextInputProps> = (props) => (
  <TextInput
    placeholderTextColor={theme.colors.muted}
    style={[styles.input, props.multiline && styles.multiline, props.style]}
    {...props}
  />
);

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#F2F6F2',
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});
