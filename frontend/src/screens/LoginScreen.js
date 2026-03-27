import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text } from 'react-native';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('producer@ofts.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const goByRole = (role) => {
    const normalizedRole = String(role || '').toLowerCase();

    if (normalizedRole === 'producer') {
      navigation.replace('CreateBatch');
      return;
    }

    if (normalizedRole === 'certifier') {
      navigation.replace('CertifierReview');
      return;
    }

    if (normalizedRole === 'distributor' || normalizedRole === 'retailer') {
      navigation.replace('AddEvent');
      return;
    }

    navigation.replace('Lookup');
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      const user = await login(email, password);

      Alert.alert('Success', 'Login successful');
      goByRole(user?.role);
    } catch (error) {
      const status = error?.response?.status;
      const errorMessage =
        status === 404
          ? 'Auth endpoint not found. Check EXPO_PUBLIC_API_URL and backend routes.'
          : error?.response?.data?.message || error?.message || 'Could not login';

      Alert.alert(
        'Login Error',
        errorMessage
      );
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
