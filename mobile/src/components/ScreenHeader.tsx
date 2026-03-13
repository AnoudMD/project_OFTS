import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../constants';

interface ScreenHeaderProps {
  title:       string;
  subtitle?:   string;
  onBack?:     () => void;
  rightNode?:  React.ReactNode;
  style?:      ViewStyle;
  dark?:       boolean;   // green background
}

export default function ScreenHeader({
  title, subtitle, onBack, rightNode, style, dark = true,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const isDark  = dark;

  return (
    <View style={[
      styles.header,
      isDark ? styles.headerDark : styles.headerLight,
      { paddingTop: insets.top + SPACING.sm },
      style,
    ]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={[styles.backArrow, isDark ? styles.backDark : styles.backLight]}>
              {'←'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.center}>
          <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, isDark ? styles.subtitleDark : styles.subtitleLight]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>
          {rightNode ?? <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  headerDark:   { backgroundColor: COLORS.primaryDark },
  headerLight:  { backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },

  row:          { flexDirection: 'row', alignItems: 'center', paddingTop: SPACING.sm },
  center:       { flex: 1, alignItems: 'center' },
  right:        { width: 44, alignItems: 'flex-end' },

  backBtn:      { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  backArrow:    { fontSize: 24, fontWeight: '300' },
  backDark:     { color: '#fff' },
  backLight:    { color: COLORS.textPrimary },
  placeholder:  { width: 44 },

  title:        { fontSize: SIZES.lg, fontWeight: '700' },
  titleDark:    { color: '#fff' },
  titleLight:   { color: COLORS.textPrimary },

  subtitle:     { fontSize: SIZES.sm, marginTop: 2 },
  subtitleDark: { color: 'rgba(255,255,255,0.75)' },
  subtitleLight:{ color: COLORS.textMuted },
});
