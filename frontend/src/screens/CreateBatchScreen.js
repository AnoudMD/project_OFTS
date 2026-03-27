import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';

export default function CreateBatchScreen() {
  const [productName, setProductName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [productionDate, setProductionDate] = useState('2026-03-12');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setDocuments(result.assets || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not pick documents');
    }
  };

  const handleCreateBatch = async () => {
    try {
      if (!productName.trim() || !farmName.trim()) {
        Alert.alert('Missing Data', 'Please enter product name and farm name');
        return;
      }

      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      setLoading(true);

      const batchPayload = {
        productName: productName.trim(),
        farmName: farmName.trim(),
        productionDate: productionDate.trim(),
        expiryDate: expiryDate.trim(),
        notes: notes.trim(),
        producerId: currentUser.uid,
        status: 'created',
        documents: documents.map((file) => ({
          name: file.name || 'Unnamed file',
          mimeType: file.mimeType || 'application/octet-stream',
          uri: file.uri || '',
        })),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'batches'), batchPayload);

      Alert.alert('Success', `Batch created: ${docRef.id}`);

      setProductName('');
      setFarmName('');
      setProductionDate('2026-03-12');
      setExpiryDate('2026-12-31');
      setNotes('');
      setDocuments([]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not create batch');
      console.log('CREATE BATCH ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.title}>Create Product Batch</Text>
        <Text style={styles.desc}>
          Enter product details and upload certification documents.
        </Text>

        <Text style={styles.label}>Product Name</Text>
        <AppInput
          value={productName}
          onChangeText={setProductName}
          placeholder="Enter product name"
        />

        <Text style={styles.label}>Farm Name</Text>
        <AppInput
          value={farmName}
          onChangeText={setFarmName}
          placeholder="Enter farm name"
        />

        <Text style={styles.label}>Production Date</Text>
        <AppInput
          value={productionDate}
          onChangeText={setProductionDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Expiry Date</Text>
        <AppInput
          value={expiryDate}
          onChangeText={setExpiryDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Batch Notes</Text>
        <AppInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Enter batch notes"
          multiline
          style={{ minHeight: 110 }}
        />

        <Text style={styles.label}>Upload Certification Documents</Text>
        <AppButton
          title={`Pick Files (${documents.length})`}
          onPress={pickDocuments}
          outline
        />

        <AppButton
          title={loading ? 'Creating Batch...' : 'Create Batch'}
          onPress={handleCreateBatch}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0AA329' },
  desc: { color: '#555', marginTop: 8, marginBottom: 16 },
  label: { marginTop: 12, fontWeight: '700' },
});