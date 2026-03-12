import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import AppButton from '../components/AppButton';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name || 'User'}</Text>
      <Text style={styles.subtitle}>Role: {user?.role || '-'}</Text>

      {user?.role === 'Producer' && (
        <AppButton title="Create Product Batch" onPress={() => navigation.navigate('CreateBatch')} />
      )}

      {['Producer', 'Distributor', 'Retailer'].includes(user?.role) && (
        <AppButton title="Add Supply Chain Event" onPress={() => navigation.navigate('AddEvent')} outline />
      )}

      {user?.role === 'Certifier' && (
        <AppButton title="Review Pending Batches" onPress={() => navigation.navigate('CertifierReview')} />
      )}

      <AppButton title="Consumer Lookup" onPress={() => navigation.navigate('Lookup')} outline />
      <AppButton title="Logout" onPress={logout} outline />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#0AA329', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#666', marginTop: 8, marginBottom: 24 },
});