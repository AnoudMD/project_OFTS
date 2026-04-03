import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { EVENT_TYPES } from '../utils/constants';

export default function AddEventScreen() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [eventType, setEventType] = useState('Harvest');
  const [location, setLocation] = useState('');
  const [eventDateTime, setEventDateTime] = useState('2026-03-12T12:00:00.000Z');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, 'batches'),
          where('status', 'in', ['Approved', 'approved', 'created', 'certified'])
        );

        const snap = await getDocs(q);

        const approvedBatches = snap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setBatches(approvedBatches);

        if (approvedBatches.length) {
          setBatchId(approvedBatches[0].id);
        }
      } catch (error) {
        console.log('LOAD BATCHES ERROR:', error);
        Alert.alert('Error', 'Could not load batches');
      }
    };

    load();
  }, []);

  const saveEvent = async () => {
    try {
      if (!batchId) {
        Alert.alert('Missing Data', 'Please select a batch');
        return;
      }

      if (!location.trim()) {
        Alert.alert('Missing Data', 'Please enter location');
        return;
      }

      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      setLoading(true);

      const eventPayload = {
        batchId,
        eventType,
        location: location.trim(),
        eventDateTime: eventDateTime.trim(),
        notes: notes.trim(),
        actorId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'batches', batchId, 'events'), eventPayload);

      await updateDoc(doc(db, 'batches', batchId), {
        lastEventType: eventType,
        lastEventLocation: location.trim(),
        lastEventDateTime: eventDateTime.trim(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert('Saved', 'Supply chain event added');

      setLocation('');
      setNotes('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not save event');
      console.log('SAVE EVENT ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Add Supply Chain Event</Text>

        <Text style={styles.label}>Batch ID</Text>
        {batches.map((b) => (
          <Text
            key={b.id}
            style={[styles.option, batchId === b.id && styles.active]}
            onPress={() => setBatchId(b.id)}
          >
            {b.id} - {b.productName || 'Unnamed Product'}
          </Text>
        ))}

        <Text style={styles.label}>Event Type</Text>
        {EVENT_TYPES.map((type) => (
          <Text
            key={type}
            style={[styles.option, eventType === type && styles.active]}
            onPress={() => setEventType(type)}
          >
            {type}
          </Text>
        ))}

        <Text style={styles.label}>Location</Text>
        <AppInput
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />

        <Text style={styles.label}>Date & Time</Text>
        <AppInput
          value={eventDateTime}
          onChangeText={setEventDateTime}
          placeholder="ISO date time"
        />

        <Text style={styles.label}>Notes</Text>
        <AppInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add details"
          multiline
          style={{ minHeight: 100 }}
        />

        <AppButton
          title={loading ? 'Saving Event...' : 'Save Event'}
          onPress={saveEvent}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0AA329',
    marginBottom: 12,
  },
  label: { marginTop: 12, fontWeight: '700' },
  option: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  active: {
    borderColor: '#0AA329',
    backgroundColor: '#F1FFF4',
  },
});