import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { COLORS, SIZES, SPACING, RADIUS, DEMO_ACCOUNTS } from '../constants';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // Navigation is handled automatically by RootNavigator based on auth state
    } catch (err: any) {
      Alert.alert('Login Failed', err?.message ?? 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email: string, password: string) {
    setEmail(email);
    setPassword(password);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.logoMini}>
              <Text style={styles.logoText}>OFTS</Text>
            </View>
            <Text style={styles.headerTitle}>Supply Chain Login</Text>
            <Text style={styles.headerSub}>Sign in to manage batches and certifications</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPass ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Sign In</Text>}
            </TouchableOpacity>
          </View>

          {/* Demo accounts */}
          <View style={styles.card}>
            <Text style={styles.demoTitle}>Demo Accounts</Text>
            <Text style={styles.demoSub}>Tap to auto-fill credentials</Text>
            {DEMO_ACCOUNTS.map(acc => (
              <TouchableOpacity
                key={acc.role}
                style={styles.demoRow}
                onPress={() => fillDemo(acc.email, acc.password)}
                activeOpacity={0.7}
              >
                <View style={styles.demoLeft}>
                  <View style={styles.roleChip}>
                    <Text style={styles.roleChipText}>{acc.role.toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.demoName}>{acc.name}</Text>
                    <Text style={styles.demoEmail}>{acc.email}</Text>
                  </View>
                </View>
                <Text style={styles.demoArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.primaryDark },
  scroll:       { padding: SPACING.xl, paddingBottom: SPACING.xxxl },

  header:       { alignItems: 'center', paddingBottom: SPACING.xl },
  backBtn:      { alignSelf: 'flex-start', marginBottom: SPACING.lg },
  backText:     { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.base, fontWeight: '600' },
  logoMini:     { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  logoText:     { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  headerTitle:  { color: '#fff', fontSize: SIZES.xxl, fontWeight: '800', marginBottom: SPACING.xs },
  headerSub:    { color: 'rgba(255,255,255,0.7)', fontSize: SIZES.sm, textAlign: 'center' },

  card:         { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl, marginBottom: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 5 },

  fieldLabel:   { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:        { backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, fontSize: SIZES.md, color: COLORS.textPrimary, marginBottom: SPACING.lg },

  passRow:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  eyeBtn:       { paddingHorizontal: SPACING.sm },
  eyeText:      { color: COLORS.primary, fontSize: SIZES.sm, fontWeight: '600' },

  btn:          { borderRadius: RADIUS.lg, paddingVertical: SPACING.md + 2, alignItems: 'center' },
  btnPrimary:   { backgroundColor: COLORS.primary },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: '#fff', fontSize: SIZES.md, fontWeight: '700' },

  demoTitle:    { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  demoSub:      { fontSize: SIZES.sm, color: COLORS.textMuted, marginBottom: SPACING.md },
  demoRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  demoLeft:     { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  roleChip:     { backgroundColor: COLORS.primaryLight, paddingVertical: 4, paddingHorizontal: SPACING.sm, borderRadius: RADIUS.sm },
  roleChipText: { color: COLORS.primaryDark, fontSize: SIZES.xs, fontWeight: '800' },
  demoName:     { fontSize: SIZES.base, fontWeight: '600', color: COLORS.textPrimary },
  demoEmail:    { fontSize: SIZES.xs, color: COLORS.textMuted },
  demoArrow:    { color: COLORS.primary, fontSize: SIZES.lg, fontWeight: '700' },
});
