import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppInput from '../frontend/src/components/AppInput';
import AppButton from '../frontend/src/components/AppButton';
import { ROLES } from '../frontend/src/utils/constants';
import { registerApi } from '../frontend/src/api/authApi';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Producer');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please fill in all fields');
      return;
    }
    try {
      await registerApi({ name, email, password, role });
      Alert.alert(
        'Account Created',
        'Your account has been created successfully. Please login.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error?.response?.data?.message || 'Could not create account'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register to join the supply chain</Text>

        <Text style={styles.label}>Full Name</Text>
        <AppInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Email</Text>
        <AppInput
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <AppInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />

        <Text style={styles.label}>Role</Text>
        <View style={styles.roleRow}>
          {ROLES.map((item) => (
            <Text
              key={item}
              style={[styles.rolePill, role === item && styles.rolePillActive]}
              onPress={() => setRole(item)}
            >
              {item}
            </Text>
          ))}
        </View>

        <AppButton title="Register" onPress={handleRegister} />
        <AppButton
          title="Back to Login"
          onPress={() => navigation.navigate('Login')}
          outline
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0AA329',
    marginTop: 40,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#777',
    marginTop: 8,
    marginBottom: 20,
  },
  label: { marginTop: 14, fontWeight: '700', color: '#222' },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  rolePill: {
    borderWidth: 1,
    borderColor: '#0AA329',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    color: '#0AA329',
  },
  rolePillActive: { backgroundColor: '#0AA329', color: '#fff' },
});