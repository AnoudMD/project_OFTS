import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { EVENT_TYPES } from '../utils/constants';
import { addSupplyChainEventApi, getAllBatchesApi } from '../api/batchApi';
export default function AddEventScreen() {
const [batches, setBatches] = useState([]);
const [batchId, setBatchId] = useState('');
const [eventType, setEventType] = useState('Harvest');
const [location, setLocation] = useState('');
const [eventDateTime, setEventDateTime] =
useState('2026-03-12T12:00:00.000Z');
const [notes, setNotes] = useState('');
useEffect(() => {
const load = async () => {
try {
const data = await getAllBatchesApi();
const approved = data.filter((item) => item.status === 'Approved');
setBatches(approved);
if (approved.length) setBatchId(approved[0].batchId);
} catch (_e) {}
};
load();
}, []);
const saveEvent = async () => {
try {
await addSupplyChainEventApi({ batchId, eventType, location,
eventDateTime, notes });
Alert.alert('Saved', 'Supply chain event added');
setLocation('');
setNotes('');
} catch (error) {
Alert.alert('Error', error?.response?.data?.message || 'Could not save event');
}
};
return (
<SafeAreaView style={styles.container}>
<ScrollView>

<Text style={styles.title}>Add Supply Chain Event</Text>
<Text style={styles.label}>Batch ID</Text>
{batches.map((b) => (
<Text key={b.batchId} style={[styles.option, batchId === b.batchId &&
styles.active]} onPress={() => setBatchId(b.batchId)}>
{b.batchId} - {b.productName}
</Text>
))}
<Text style={styles.label}>Event Type</Text>
{EVENT_TYPES.map((type) => (
<Text key={type} style={[styles.option, eventType === type &&
styles.active]} onPress={() => setEventType(type)}>
{type}
</Text>
))}
<Text style={styles.label}>Location</Text>
<AppInput value={location} onChangeText={setLocation}
placeholder="Enter location" />
<Text style={styles.label}>Date & Time</Text>
<AppInput value={eventDateTime} onChangeText={setEventDateTime}
placeholder="ISO date time" />
<Text style={styles.label}>Notes</Text>
<AppInput value={notes} onChangeText={setNotes} placeholder="Add
details" multiline style={{ minHeight: 100 }} />
<AppButton title="Save Event" onPress={saveEvent} />
</ScrollView>
</SafeAreaView>
);
}
const styles = StyleSheet.create({
container: { flex: 1, padding: 20, backgroundColor: '#fff' },
title: { fontSize: 28, fontWeight: '800', color: '#0AA329', marginBottom:
12 },
label: { marginTop: 12, fontWeight: '700' },
option: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10,
marginTop: 8 },
active: { borderColor: '#0AA329', backgroundColor: '#F1FFF4' },
});