import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import StatusBadge from '../components/StatusBadge';

export default function TraceabilityScreen({ route }) {
  const traceData = route.params?.traceData || {};

  const batch = traceData.batch || null;
  const product = traceData.product || null;
  const certificate = traceData.certificate || null;
  const events = traceData.events || [];

  if (!batch) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Product Traceability</Text>
        <Text style={styles.empty}>No traceability data found.</Text>
      </SafeAreaView>
    );
  }

  const batchId = batch.id || batch.batchId || 'N/A';
  const certificationStatus =
    certificate?.status || batch.status || 'unknown';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.header}>Product Traceability</Text>
        <Text style={styles.subheader}>
          Verify the authenticity and journey of your organic product from farm to table.
        </Text>

        <View style={styles.card}>
          <Text style={styles.section}>Batch Information</Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Batch ID: </Text>
            {batchId}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Product Name: </Text>
            {batch.productName || product?.name || 'N/A'}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Farm Name: </Text>
            {batch.farmName || 'N/A'}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Barcode: </Text>
            {batch.productBarcode || product?.barcode || 'N/A'}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Brand: </Text>
            {product?.brand || 'N/A'}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Production Date: </Text>
            {batch.productionDate || 'N/A'}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Expiry Date: </Text>
            {batch.expiryDate || 'N/A'}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Certification Status: </Text>
          </Text>
          <StatusBadge status={certificationStatus} />

          <Text style={styles.section}>Certificate Information</Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Certificate Number: </Text>
            {certificate?.certificateNumber || 'N/A'}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Certifier: </Text>
            {certificate?.certifierName || 'N/A'}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Issue Date: </Text>
            {certificate?.issueDate || 'N/A'}
          </Text>

          <Text style={styles.row}>
            <Text style={styles.key}>Expiry Date: </Text>
            {certificate?.expiryDate || 'N/A'}
          </Text>

          {!!certificate?.notes && (
            <Text style={styles.row}>
              <Text style={styles.key}>Certificate Notes: </Text>
              {certificate.notes}
            </Text>
          )}
        </View>

        <Text style={styles.section}>Supply Chain Events</Text>

        {events.length ? (
          events.map((event, index) => (
            <View key={event.id || index} style={styles.eventCard}>
              <Text style={styles.eventTitle}>
                {event.eventType || 'Unknown Event'}
              </Text>
              <Text>{event.location || 'No location'}</Text>
              <Text>
                {event.eventDateTime
                  ? new Date(event.eventDateTime).toLocaleString()
                  : 'No date'}
              </Text>
              {!!event.notes && <Text>{event.notes}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No supply chain events found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 30, fontWeight: '800', color: '#0AA329' },
  subheader: { color: '#4A5568', marginTop: 8, marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  section: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0AA329',
    marginVertical: 12,
  },
  row: { marginTop: 6, fontSize: 16 },
  key: { fontWeight: '800' },
  eventCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    marginBottom: 12,
  },
  eventTitle: { fontWeight: '800', fontSize: 18, marginBottom: 4 },
  empty: { marginTop: 20, color: '#777', textAlign: 'center' },
});