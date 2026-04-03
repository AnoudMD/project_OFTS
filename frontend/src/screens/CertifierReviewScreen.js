import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import StatusBadge from '../components/StatusBadge';

export default function CertifierReviewScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reasons, setReasons] = useState({});

  const loadBatches = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, 'batches'),
        where('status', 'in', ['created', 'pending', 'Pending'])
      );

      const snap = await getDocs(q);

      const pendingItems = snap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setItems(pendingItems);
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not load pending batches');
      console.log('LOAD CERTIFIER BATCHES ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleApprove = async (batchId) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      await updateDoc(doc(db, 'batches', batchId), {
        status: 'approved',
        reviewedBy: currentUser.uid,
        reviewedAt: serverTimestamp(),
        rejectionReason: '',
      });

      Alert.alert('Approved', `${batchId} approved successfully`);
      loadBatches();
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not approve batch');
      console.log('APPROVE BATCH ERROR:', error);
    }
  };

  const handleReject = async (batchId) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      await updateDoc(doc(db, 'batches', batchId), {
        status: 'rejected',
        reviewedBy: currentUser.uid,
        reviewedAt: serverTimestamp(),
        rejectionReason: reasons[batchId] || 'Rejected by certifier',
      });

      Alert.alert('Rejected', `${batchId} rejected`);
      loadBatches();
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not reject batch');
      console.log('REJECT BATCH ERROR:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pending Batches</Text>
      <Text style={styles.subtitle}>
        Review and approve or reject producer submissions.
      </Text>

      <AppButton
        title={loading ? 'Refreshing...' : 'Refresh'}
        onPress={loadBatches}
        outline
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.productName}</Text>
                <Text style={styles.id}>ID: {item.id}</Text>
                <Text style={styles.meta}>{item.farmName}</Text>
                <Text style={styles.meta}>
                  Production:{' '}
                  {item.productionDate
                    ? new Date(item.productionDate).toLocaleDateString()
                    : 'N/A'}
                </Text>
                <Text style={styles.meta}>
                  Expiry:{' '}
                  {item.expiryDate
                    ? new Date(item.expiryDate).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>

              <StatusBadge status={item.status} />
            </View>

            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notes}>{item.notes || 'No notes provided'}</Text>

            <Text style={styles.notesTitle}>Rejection Reason</Text>
            <AppInput
              placeholder="Enter rejection reason if rejecting"
              value={reasons[item.id] || ''}
              onChangeText={(value) =>
                setReasons((prev) => ({ ...prev, [item.id]: value }))
              }
            />

            <View style={styles.actionRow}>
              <View style={{ flex: 1 }}>
                <AppButton title="Approve" onPress={() => handleApprove(item.id)} />
              </View>

              <View style={{ width: 10 }} />

              <View style={{ flex: 1 }}>
                <AppButton
                  title="Reject"
                  onPress={() => handleReject(item.id)}
                  outline
                />
              </View>
            </View>
          </View>
        ))}

        {!items.length && !loading && (
          <Text style={styles.empty}>No pending batches found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0AA329' },
  subtitle: { color: '#666', marginTop: 8, marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    backgroundColor: '#fff',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  id: { fontWeight: '700', color: '#444' },
  meta: { color: '#666', marginTop: 4 },
  notesTitle: { fontWeight: '800', marginTop: 12, marginBottom: 4 },
  notes: { color: '#555' },
  actionRow: { flexDirection: 'row', marginTop: 12 },
  empty: { textAlign: 'center', marginTop: 30, color: '#777' },
});