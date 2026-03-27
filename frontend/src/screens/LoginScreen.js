import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text } from 'react-native';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { loginUser } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('producer1@ofts.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const goByRole = (role) => {
    if (role === 'producer') {
      navigation.replace('CreateBatch');
      return;
    }

    if (role === 'certifier') {
      navigation.replace('CertifierReview');
      return;
    }

    if (role === 'distributor' || role === 'retailer') {
      navigation.replace('AddEvent');
      return;
    }
س
    navigation.replace('Lookup');
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const result = await loginUser({ email, password });

      Alert.alert('Success', `Welcome ${result.profile.fullName}`);
      goByRole(result.profile.role);
    } catch (error) {
      Alert.alert('Login Error', error.message);
      console.log('LOGIN ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Enter your account details to continue</Text>

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
        placeholder="Enter your password"
        secureTextEntry
      />

      <AppButton
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0AA329',
    marginTop: 60,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
    marginBottom: 20,
  },
  label: {
    marginTop: 14,
    fontWeight: '700',
    color: '#222',
  },
});