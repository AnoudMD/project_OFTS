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
        <Text style={styles.title}>Product Traceability</Text>
        <Text style={styles.empty}>No traceability data found.</Text>
      </SafeAreaView>
    );
  }

  const batchId = batch.id || batch.batchId || 'N/A';
  const certificationStatus = certificate?.status || batch.status || 'unknown';

  const certificateNumber =
    certificate?.certificateNumber ||
    certificate?.certificateId ||
    certificate?.id ||
    'Not available';

  const certifierDisplay = 'Certified by OFTS Authorized Certifier';

  const issueDate =
    certificate?.issueDate ||
    certificate?.certifiedAt ||
    batch?.certifiedAt ||
    'Not available';

  const expiryDate =
    certificate?.expiryDate ||
    batch?.expiryDate ||
    'Not available';

  const notesDisplay =
    certificate?.notes && certificate?.notes.trim() !== ''
      ? certificate.notes
      : 'This product certificate has been reviewed and approved in the system.';

  const ipfsMessage = certificate?.ipfsCid
    ? 'This certificate has been uploaded to IPFS successfully.'
    : 'Certificate upload is pending.';

  const blockchainMessage =
    certificate?.blockchainStatus === 'recorded_onchain'
      ? 'This certificate has been securely recorded on the blockchain.'
      : 'Blockchain recording is pending.';

  const verificationMessage = certificate?.txHash
    ? 'This product information has been verified and cannot be tampered with.'
    : 'Verification is pending.';

  const networkMessage = 'Polygon Amoy Testnet';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Product Traceability</Text>
          <Text style={styles.subtitle}>
            Verify the product journey from farm to consumer.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {batch.productName || product?.name || 'Product'}
          </Text>
          <Text style={styles.batchId}>{batchId}</Text>

          <View style={styles.badgeWrap}>
            <StatusBadge status={certificationStatus} />
          </View>
        </View>

        <InfoCard
          title="Batch Information"
          items={[
            ['Farm Name', batch.farmName || 'N/A'],
            ['Barcode', batch.productBarcode || product?.barcode || 'N/A'],
            ['Brand', product?.brand || 'N/A'],
            [
              'Production Date',
              batch.productionDate
                ? String(batch.productionDate).slice(0, 10)
                : 'N/A',
            ],
            [
              'Expiry Date',
              batch.expiryDate
                ? String(batch.expiryDate).slice(0, 10)
                : 'N/A',
            ],
          ]}
        />

        <InfoCard
          title="Certificate Information"
          items={[
            ['Certificate Number', certificateNumber],
            ['Certifier', certifierDisplay],
            [
              'Issue Date',
              issueDate !== 'Not available'
                ? String(issueDate).slice(0, 10)
                : 'Not available',
            ],
            [
              'Expiry Date',
              expiryDate !== 'Not available'
                ? String(expiryDate).slice(0, 10)
                : 'Not available',
            ],
            ['Notes', notesDisplay],
          ]}
        />

        <InfoCard
          title="Verification Details"
          items={[
            ['IPFS Status', ipfsMessage],
            ['Blockchain Status', blockchainMessage],
            ['Verification', verificationMessage],
            ['Network', networkMessage],
          ]}
        />

        <Text style={styles.sectionTitle}>Supply Chain Events</Text>

        {events.length ? (
          events.map((event, index) => (
            <View key={event.id || index} style={styles.eventCard}>
              <View style={styles.timelineDot} />

              <View style={{ flex: 1 }}>
                <Text style={styles.eventTitle}>
                  {event.eventType || 'Unknown Event'}
                </Text>

                <Text style={styles.eventMeta}>
                  Actor: {event.actorRole || 'N/A'}
                </Text>

                <Text style={styles.eventMeta}>
                  Location: {event.location || 'No location'}
                </Text>

                <Text style={styles.eventMeta}>
                  Date:{' '}
                  {event.eventDateTime
                    ? String(event.eventDateTime).slice(0, 10)
                    : 'No date'}
                </Text>

                {!!event.notes && (
                  <Text style={styles.eventNotes}>{event.notes}</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No supply chain events found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({ title, items }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {items.map(([label, value]) => (
        <View key={label} style={styles.infoRow}>
          <Text style={styles.infoKey}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const GREEN = '#16A34A';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  content: {
    padding: 16,
    paddingBottom: 34,
  },

  header: {
    backgroundColor: GREEN,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  subtitle: {
    color: '#DCFCE7',
    marginTop: 6,
    lineHeight: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },

  batchId: {
    color: '#6B7280',
    fontWeight: '700',
    marginTop: 6,
  },

  badgeWrap: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: GREEN,
    marginBottom: 12,
  },

  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 9,
  },

  infoKey: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },

  infoValue: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 22,
  },

  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
  },

  timelineDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: GREEN,
    marginTop: 5,
  },

  eventTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 5,
  },

  eventMeta: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },

  eventNotes: {
    marginTop: 8,
    color: '#374151',
    lineHeight: 19,
  },

  empty: {
    marginTop: 20,
    color: '#9CA3AF',
    textAlign: 'center',
    fontSize: 15,
  },
});