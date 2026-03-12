import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import StatusBadge from '../components/StatusBadge';
import { getAllBatchesApi, reviewBatchApi } from '../api/batchApi';
export default function CertifierReviewScreen() {
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);
const [reasons, setReasons] = useState({});
const loadBatches = async () => {
try {
setLoading(true);
const data = await getAllBatchesApi();
setItems(data.filter((item) => item.status === 'Pending'));
} catch (error) {
Alert.alert('Error', error?.response?.data?.message || 'Could not load pending batches');
} finally {
setLoading(false);
}
};
useEffect(() => {
loadBatches();
}, []);
const handleApprove = async (batchId) => {
try {
await reviewBatchApi(batchId, { status: 'Approved' });
Alert.alert('Approved',
`${batchId} approved successfully`);
loadBatches();
} catch (error) {
Alert.alert('Error', error?.response?.data?.message || 'Could not approve batch');
}
};
const handleReject = async (batchId) => {
try {
await reviewBatchApi(batchId, {
status: 'Rejected',
rejectionReason: reasons[batchId] || 'Rejected by certifier',
});
Alert.alert('Rejected',
`${batchId} rejected`);
loadBatches();
} catch (error) {
Alert.alert('Error', error?.response?.data?.message || 'Could not reject batch');
}
};
return (
<SafeAreaView style={styles.container}>
<Text style={styles.title}>Pending Batches</Text>
<Text style={styles.subtitle}>Review and approve or reject producer
submissions.</Text>
<AppButton title={loading ? 'Refreshing...' : 'Refresh'}
onPress={loadBatches} outline />
<ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
{items.map((item) => (
<View key={item.batchId} style={styles.card}>
<View style={styles.rowBetween}>
<View style={{ flex: 1 }}>
<Text style={styles.name}>{item.productName}</Text>
<Text style={styles.id}>ID: {item.batchId}</Text>
<Text style={styles.meta}>{item.farmName}</Text>
<Text style={styles.meta}>Production: {new
Date(item.productionDate).toLocaleDateString()}</Text>
<Text style={styles.meta}>Expiry: {new
Date(item.expiryDate).toLocaleDateString()}</Text>
</View>
<StatusBadge status={item.status} />
</View>
<Text style={styles.notesTitle}>Notes</Text>
<Text style={styles.notes}>{item.notes || 'No notes provided'}</
Text>
<Text style={styles.notesTitle}>Rejection Reason</Text>
<AppInput
placeholder="Enter rejection reason if rejecting"
value={reasons[item.batchId] || ''}
onChangeText={(value) => setReasons((prev) => ({ ...prev,
[item.batchId]: value }))}
/>
<View style={styles.actionRow}>
<View style={{ flex: 1 }}>
<AppButton title="Approve" onPress={() =>
handleApprove(item.batchId)} />
</View>
<View style={{ width: 10 }} />
<View style={{ flex: 1 }}>
<AppButton title="Reject" onPress={() =>
handleReject(item.batchId)} outline />
</View>
</View>
</View>
))}
{!items.length && !loading && <Text style={styles.empty}>No pending batches found.</Text>}
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
rowBetween: { flexDirection: 'row', justifyContent: 'space-between',
alignItems: 'flex-start' },
name: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
id: { fontWeight: '700', color: '#444' },
meta: { color: '#666', marginTop: 4 },
notesTitle: { fontWeight: '800', marginTop: 12, marginBottom: 4 },
notes: { color: '#555' },
actionRow: { flexDirection: 'row', marginTop: 12 },
empty: { textAlign: 'center', marginTop: 30, color: '#777' },
});