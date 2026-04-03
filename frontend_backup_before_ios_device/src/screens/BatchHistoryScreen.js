import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import StatusBadge from '../components/StatusBadge';
import { getScannedHistory } from '../storage/historyStorage';
export default function BatchHistoryScreen() {
const [items, setItems] = useState([]);
useEffect(() => {
getScannedHistory().then(setItems);
}, []);
return (
<SafeAreaView style={styles.container}>
<Text style={styles.title}>Product Batches</Text>
<ScrollView>
{items.map((item) => (
<View key={item.batchId} style={styles.card}>
<Text style={styles.name}>{item.productName}</Text>
<Text>ID: {item.batchId}</Text>
<Text>{item.farmName}</Text>
<View style={{ marginTop: 8 }}>
<StatusBadge status={item.status} />
</View>
</View>
))}
</ScrollView>
</SafeAreaView>
);
}
const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#fff', padding: 20 },
title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom:
20 },
card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth:
1, borderColor: '#EAEAEA', marginBottom: 12 },
name: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
});