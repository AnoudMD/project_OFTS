import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import StatusBadge from '../components/StatusBadge';

export default function TraceabilityScreen({ route }) {
const { traceData } = route.params;
const { batch, events } = traceData;
return (
<SafeAreaView style={styles.container}>
<ScrollView>
<Text style={styles.header}>Product Traceability</Text>
<Text style={styles.subheader}>Verify the authenticity and journey of
your organic product from farm to table.</Text>
<View style={styles.card}>
<Text style={styles.section}>Batch Information</Text>
<Text style={styles.row}><Text style={styles.key}>Batch ID: </
Text>{batch.batchId}</Text>
<Text style={styles.row}><Text style={styles.key}>Product Name: </
Text>{batch.productName}</Text>
<Text style={styles.row}><Text style={styles.key}>Farm Name: </
Text>{batch.farmName}</Text>
<Text style={styles.row}><Text style={styles.key}>Certification
Status: </Text></Text>
<StatusBadge status={batch.certificationStatus} />
{!!batch.qrCodeUrl && <Image source={{ uri: batch.qrCodeUrl }}
style={styles.qr} />}
</View>
<Text style={styles.section}>Supply Chain Events</Text>
{events.map((event) => (
<View key={event._id} style={styles.eventCard}>
<Text style={styles.eventTitle}>{event.eventType}</Text>
<Text>{event.location}</Text>
<Text>{new Date(event.eventDateTime).toLocaleString()}</Text>
{!!event.notes && <Text>{event.notes}</Text>}
</View>
))}
</ScrollView>
</SafeAreaView>
);
}
const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#fff', padding: 20 },
header: { fontSize: 30, fontWeight: '800', color: '#0AA329' },
subheader: { color: '#4A5568', marginTop: 8, marginBottom: 16 },
card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth:
1, borderColor: '#EAEAEA' },
section: { fontSize: 24, fontWeight: '800', color: '#0AA329', marginVertical:
12 },
row: { marginTop: 6, fontSize: 16 },
key: { fontWeight: '800' },
qr: { width: 180, height: 180, marginTop: 16, alignSelf: 'center' },
eventCard: { padding: 14, borderWidth: 1, borderColor: '#EAEAEA',
borderRadius: 14, marginBottom: 12 },
eventTitle: { fontWeight: '800', fontSize: 18, marginBottom: 4 },
});