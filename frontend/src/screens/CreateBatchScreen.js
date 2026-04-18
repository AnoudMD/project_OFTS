import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  collection,
  serverTimestamp,
  doc,
  setDoc,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import AppInput from '../components/AppInput';

export default function CreateBatchScreen({ navigation }) {
  const [productName, setProductName] = useState('');
  const [productBarcode, setProductBarcode] = useState('');
  const [farmName, setFarmName] = useState('');
  const [productionDate, setProductionDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showProdPicker, setShowProdPicker] = useState(false);
  const [showExpPicker, setShowExpPicker] = useState(false);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

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

  const generateBatchId = async (barcode) => {
    const cleanBarcode = barcode.trim();
    const snapshot = await getDocs(collection(db, 'batches'));

    const existingIds = snapshot.docs
      .map((item) => item.id)
      .filter((id) => id.startsWith(`BATCH-${cleanBarcode}-`));

    const nextNumber = existingIds.length + 1;
    const suffix = String(nextNumber).padStart(3, '0');

    return `BATCH-${cleanBarcode}-${suffix}`;
  };

  const handleCreateBatch = async () => {
    try {
      if (!productName.trim() || !productBarcode.trim() || !farmName.trim()) {
        Alert.alert(
          'Missing Data',
          'Please enter product name, barcode, and farm name'
        );
        return;
      }

      if (documents.length === 0) {
        Alert.alert('Missing File', 'Please upload certification document');
        return;
      }

      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      setLoading(true);

      const docsData = documents.map((file) => ({
        name: file.name || 'Unnamed file',
        mimeType: file.mimeType || 'application/octet-stream',
        uri: file.uri || '',
      }));

      const batchId = await generateBatchId(productBarcode);

      const batchPayload = {
        batchId,
        productName: productName.trim(),
        productBarcode: productBarcode.trim(),
        farmName: farmName.trim(),
        productionDate: formatDate(productionDate),
        expiryDate: formatDate(expiryDate),
        notes: notes.trim(),
        producerId: currentUser.uid,
        status: 'created',
        rejectionReason: '',
        documents: docsData,
        createdAt: serverTimestamp(),
      };

      // ✅ ينحفظ الباتش في batches باسم واضح
      await setDoc(doc(db, 'batches', batchId), batchPayload);

      const certificatePayload = {
        // ✅ الربط مع الباتش
        batchId: batchId,

        productName: productName.trim(),
        productBarcode: productBarcode.trim(),
        farmName: farmName.trim(),
        producerId: currentUser.uid,

        certificateNumber: '',
        certifierId: '',
        certifierName: '',
        issueDate: '',
        expiryDate: formatDate(expiryDate),

        status: 'pending',
        blockchainStatus: 'pending',
        ipfsCid: '',
        network: '',
        notes: notes.trim(),
        documents: docsData,
        createdAt: serverTimestamp(),
      };

      // ✅ الشهادة تنحفظ في certificates كوثيقة مستقلة
      await addDoc(collection(db, 'certificates'), certificatePayload);

      Alert.alert('Success', `Saved as ${batchId}`);
      navigation.replace('ProducerDashboard');
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not create batch');
      console.log('CREATE BATCH ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.replace('ProducerDashboard')}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Create Product Batch</Text>
              <Text style={styles.desc}>
                Enter product details and upload certification documents.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Product Name</Text>
          <AppInput
            value={productName}
            onChangeText={setProductName}
            placeholder="Enter product name"
            style={styles.input}
          />

          <Text style={styles.label}>Product Barcode</Text>
          <AppInput
            value={productBarcode}
            onChangeText={setProductBarcode}
            placeholder="Enter product barcode"
            keyboardType="number-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Farm Name</Text>
          <AppInput
            value={farmName}
            onChangeText={setFarmName}
            placeholder="Enter farm name"
            style={styles.input}
          />

          <Text style={styles.label}>Production Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowProdPicker(true)}
          >
            <Text>{formatDate(productionDate)}</Text>
          </TouchableOpacity>

          {showProdPicker && (
            <DateTimePicker
              value={productionDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowProdPicker(false);
                if (selectedDate) setProductionDate(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>Expiry Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowExpPicker(true)}
          >
            <Text>{formatDate(expiryDate)}</Text>
          </TouchableOpacity>

          {showExpPicker && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowExpPicker(false);
                if (selectedDate) setExpiryDate(selectedDate);
              }}
            />
          )}

          <Text style={styles.label}>Batch Notes</Text>
          <AppInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter batch notes"
            multiline
            style={styles.notesInput}
          />

          <Text style={styles.uploadLabel}>Upload Certification Documents</Text>

          <TouchableOpacity style={styles.uploadBox} onPress={pickDocuments}>
            <Text style={styles.uploadIcon}>↑</Text>
            <Text style={styles.uploadText}>
              Drag and drop certification file or click to upload
            </Text>
            <Text style={styles.uploadSubText}>
              Accepted formats: PDF, PNG, JPG
            </Text>

            {documents.length > 0 && (
              <Text style={styles.filesCount}>
                Selected files: {documents.length}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateBatch}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating Batch...' : 'Create Batch'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.replace('ProducerDashboard')}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#16A34A';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  headerRow: { flexDirection: 'row', marginBottom: 16 },
  backButton: { width: 22, height: 22, marginRight: 6 },
  backArrow: { fontSize: 20, color: '#9CA3AF' },

  headerTextWrap: { flex: 1 },

  title: { fontSize: 24, fontWeight: '800', color: PRIMARY },
  desc: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },

  label: { marginTop: 10, fontWeight: '700' },

  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginTop: 6,
  },

  notesInput: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    padding: 14,
    textAlignVertical: 'top',
  },

  uploadLabel: {
    marginTop: 16,
    fontWeight: '800',
    color: PRIMARY,
  },

  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginTop: 8,
  },

  uploadIcon: { fontSize: 24, color: '#22C55E' },
  uploadText: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  uploadSubText: { fontSize: 11, color: '#9CA3AF' },

  filesCount: { marginTop: 8, color: PRIMARY, fontWeight: '700' },

  createButton: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },

  createButtonText: { color: '#fff', fontWeight: '800' },

  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  cancelButtonText: { color: '#374151', fontWeight: '700' },
});