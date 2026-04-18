import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { loginUser } from '../services/authService';
import logo from '../../assets/logo.jpg';

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = ['producer', 'certifier', 'distributor', 'retailer'];

  const handleLogin = async () => {
    if (!role) {
      Alert.alert('Error', 'Please select your role');
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser({
        email: email.trim(),
        password: password.trim(),
      });

      const userRole = result.profile.role;

      if (userRole === 'producer') {
  navigation.replace('ProducerDashboard');

      } else if (userRole === 'certifier') {
        navigation.replace('CertifierReview');
      } else if (userRole === 'distributor' || userRole === 'retailer') {
        navigation.replace('AddEvent');
      } else {
        navigation.replace('Lookup');
      }

    } catch (e) {
      Alert.alert('Login Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        <Image source={logo} style={styles.logo} />

        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Select your role to continue</Text>

        <Text style={styles.label}>Role</Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={{ color: role ? '#000' : '#999' }}>
            {role || 'Select your role'}
          </Text>
          <Text style={styles.arrow}>{showDropdown ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownList}>
            {roles.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setRole(item);
                  setShowDropdown(false);
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Email</Text>
        <AppInput
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <AppInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <AppButton
          title={loading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
        />

        <Text
          style={styles.back}
          onPress={() => navigation.navigate('Lookup')}
        >
          Back to Scanner
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  logo: {
    width: 70,
    height: 70,
    alignSelf: 'center',
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: '#16A34A',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 10,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '700',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 16,
    color: '#666',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  back: {
    textAlign: 'center',
    marginTop: 16,
    color: '#16A34A',
    fontWeight: '700',
  },
});