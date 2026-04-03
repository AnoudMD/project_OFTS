import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text } from 'react-native';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { saveScannedBatch } from '../storage/historyStorage';

export default function ConsumerLookupScreen({ navigation }) {
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const input = batchId.trim();

    if (!input) {
      Alert.alert('Validation', 'Please enter a batch ID');
      return;
    }

    try {
      setLoading(true);

      let batch = null;
      let batchDocId = input;

      // 1) نجرب أولًا أن يكون الإدخال هو document ID نفسه
      const batchRef = doc(db, 'batches', input);
      const batchSnap = await getDoc(batchRef);

      if (batchSnap.exists()) {
        batch = { id: batchSnap.id, ...batchSnap.data() };
        batchDocId = batchSnap.id;
      } else {
        // 2) إذا ما لقيناه، نجرب البحث بحقل batchId داخل document
        const batchQuery = query(
          collection(db, 'batches'),
          where('batchId', '==', input)
        );
        const batchQuerySnap = await getDocs(batchQuery);

        if (!batchQuerySnap.empty) {
          const found = batchQuerySnap.docs[0];
          batch = { id: found.id, ...found.data() };
          batchDocId = found.id;
        }
      }

      if (!batch) {
        Alert.alert('Not found', 'Invalid batch ID');
        return;
      }

      // 3) نجيب المنتج المرتبط عبر productBarcode
      let product = null;
      const productBarcode = batch.productBarcode;

      if (productBarcode) {
        const productRef = doc(db, 'products', productBarcode);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          product = { id: productSnap.id, ...productSnap.data() };
        }
      }

      // 4) نجيب الشهادة المرتبطة بهذه الدفعة
      let certificate = null;
      const certQuery = query(
        collection(db, 'certificates'),
        where('batchId', '==', batchDocId)
      );
      const certSnap = await getDocs(certQuery);

      if (!certSnap.empty) {
        const certDoc = certSnap.docs[0];
        certificate = { id: certDoc.id, ...certDoc.data() };
      }

      // 5) نجيب الأحداث من subcollection
      const eventsSnap = await getDocs(collection(db, 'batches', batchDocId, 'events'));
      const events = eventsSnap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      // 6) نخزن في history
      await saveScannedBatch({
        batchId: batchDocId,
        productName: batch.productName || product?.name || 'Unknown product',
        status: certificate?.status || batch.status || 'unknown',
        farmName: batch.farmName || '',
        scannedAt: new Date().toISOString(),
      });

      // 7) نفتح شاشة التتبع
      navigation.navigate('Traceability', {
        traceData: {
          batch,
          product,
          certificate,
          events,
        },
      });
    } catch (error) {
      console.log('TRACEABILITY LOOKUP ERROR:', error);
      Alert.alert('Not found', error.message || 'Invalid batch ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Organic Food Traceability System</Text>

      <AppButton
        title="Scan QR Code"
        onPress={() => navigation.navigate('QrScanner')}
      />

      <Text style={styles.or}>or enter batch ID manually</Text>

      <AppInput
        placeholder="BATCH-XXXXXXXX"
        value={batchId}
        onChangeText={setBatchId}
        autoCapitalize="characters"
      />

      <AppButton
        title={loading ? 'Searching...' : 'Search'}
        onPress={handleSearch}
      />

      <Text style={styles.link} onPress={() => navigation.navigate('BatchHistory')}>
        Product Batches
      </Text>

      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Supply Chain Login
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0AA329',
    textAlign: 'center',
    marginBottom: 24,
  },
  or: { textAlign: 'center', color: '#777', marginVertical: 12 },
  link: {
    textAlign: 'center',
    color: '#0AA329',
    fontWeight: '700',
    marginTop: 22,
  },
});