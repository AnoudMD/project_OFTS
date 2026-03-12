import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { createBatchApi } from '../api/batchApi';
export default function CreateBatchScreen() {
const [productName, setProductName] = useState('');
const [farmName, setFarmName] = useState('');
const [productionDate, setProductionDate] = useState('2026-03-12');
const [expiryDate, setExpiryDate] = useState('2026-12-31');
const [notes, setNotes] = useState('');
const [documents, setDocuments] = useState([]);
const pickDocuments = async () => {
const result = await DocumentPicker.getDocumentAsync({ multiple: true,
copyToCacheDirectory: true });
if (!result.canceled) setDocuments(result.assets || []);
};
const handleCreateBatch = async () => {
try {
const formData = new FormData();
formData.append('productName', productName);
formData.append('farmName', farmName);
formData.append('productionDate', productionDate);
formData.append('expiryDate', expiryDate);
formData.append('notes', notes);
documents.forEach((file) => {
formData.append('documents', {
uri: file.uri,
name: file.name,
type: file.mimeType || 'application/octet-stream',
});
});
const data = await createBatchApi(formData);
Alert.alert('Success', `Batch created: ${data.batchId}`);

setProductName('');
setFarmName('');
setNotes('');
setDocuments([]);
} catch (error) {
Alert.alert('Error', error?.response?.data?.message || 'Could not create batch');
}
};
return (
<SafeAreaView style={styles.container}>
<ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
<Text style={styles.title}>Create Product Batch</Text>
<Text style={styles.desc}>Enter product details and upload
certification documents.</Text>
<Text style={styles.label}>Product Name</Text>
<AppInput value={productName} onChangeText={setProductName}
placeholder="Enter product name" />
<Text style={styles.label}>Farm Name</Text>
<AppInput value={farmName} onChangeText={setFarmName}
placeholder="Enter farm name" />
<Text style={styles.label}>Production Date</Text>
<AppInput value={productionDate} onChangeText={setProductionDate}
placeholder="YYYY-MM-DD" />
<Text style={styles.label}>Expiry Date</Text>
<AppInput value={expiryDate} onChangeText={setExpiryDate}
placeholder="YYYY-MM-DD" />
<Text style={styles.label}>Batch Notes</Text>
<AppInput value={notes} onChangeText={setNotes}
placeholder="Enter batch notes" multiline style={{ minHeight: 110 }} />
<Text style={styles.label}>Upload Certification Documents</Text>
<AppButton title={`Pick Files (${documents.length})`}
onPress={pickDocuments} outline />
<AppButton title="Create Batch" onPress={handleCreateBatch} />
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