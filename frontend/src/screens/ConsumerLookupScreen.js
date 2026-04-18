import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
} from 'react-native';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import logo from '../../assets/logo.jpg';
import client from '../api/client';

export default function ConsumerLookupScreen({ navigation }) {
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      const trimmedBatchId = batchId.trim();

      if (!trimmedBatchId) {
        Alert.alert('Missing Batch ID', 'Please enter a batch ID');
        return;
      }

      setLoading(true);

      const response = await client.get(`/trace/${trimmedBatchId}`);
      const traceData = response?.data;

      if (!traceData || !traceData.batch) {
        Alert.alert('Not Found', 'No traceability data found for this batch');
        return;
      }

      navigation.navigate('Traceability', { traceData });
    } catch (error) {
      console.log('LOOKUP ERROR:', error?.response?.data || error.message);

      Alert.alert(
        'Lookup Failed',
        error?.response?.data?.message || 'Could not fetch traceability data'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image source={logo} style={styles.logo} />

        <Text style={styles.title}>
          Organic Food Traceability System
        </Text>

        <AppButton
          title="Scan QR Code"
          onPress={() => navigation.navigate('QrScanner')}
        />

        <Text style={styles.or}>or enter batch ID manually</Text>

        <AppInput
          placeholder="BATCH-XXXXXXXX"
          value={batchId}
          onChangeText={setBatchId}
        />

        <AppButton
          title={loading ? 'Searching...' : 'Search'}
          onPress={handleSearch}
        />

        <Text
          style={styles.link}
          onPress={() => navigation.navigate('BatchHistory')}
        >
          Product Batches
        </Text>

        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          Supply Chain Login
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
  },

  card: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },

  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },

  or: {
    textAlign: 'center',
    color: '#6B7280',
    marginVertical: 10,
  },

  link: {
    textAlign: 'center',
    color: '#16A34A',
    marginTop: 10,
    fontWeight: '700',
  },
});