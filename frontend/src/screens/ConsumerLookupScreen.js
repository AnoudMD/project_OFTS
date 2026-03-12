import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import { getTraceabilityApi } from '../api/traceApi';
import { saveScannedBatch } from '../storage/historyStorage';
export default function ConsumerLookupScreen({ navigation }) {
const [batchId, setBatchId] = useState('');
const handleSearch = async () => {
try {
const data = await getTraceabilityApi(batchId.trim());
await saveScannedBatch({
batchId: data.batch.batchId,
productName: data.batch.productName,
status: data.batch.status,
farmName: data.batch.farmName,
scannedAt: new Date().toISOString(),
});
navigation.navigate('Traceability', { traceData: data });
} catch (error) {
Alert.alert('Not found', error?.response?.data?.message || 'Invalid batch ID');
}
};
return (
<SafeAreaView style={styles.container}>
<Text style={styles.header}>Organic Food Traceability System</Text>
<AppButton title="Scan QR Code" onPress={() => Alert.alert('Demo',
'Connect expo-barcode-scanner here')} />
<Text style={styles.or}>or enter QR manually</Text>
<AppInput placeholder="OFTS-XXXXXXXX" value={batchId}
onChangeText={setBatchId} autoCapitalize="characters" />
<AppButton title="Search" onPress={handleSearch} />
<Text style={styles.link} onPress={() =>
navigation.navigate('BatchHistory')}>Product Batches</Text>
<Text style={styles.link} onPress={() => navigation.navigate('Login')}
>Supply Chain Login</Text>
</SafeAreaView>
);
}
const styles = StyleSheet.create({
container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor:
'#fff' },
header: { fontSize: 28, fontWeight: '800', color: '#0AA329', textAlign:
'center', marginBottom: 24 },
or: { textAlign: 'center', color: '#777', marginVertical: 12 },
link: { textAlign: 'center', color: '#0AA329', fontWeight: '700', marginTop:
22 },
});