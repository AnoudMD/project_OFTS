import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import StatusBadge from '../components/StatusBadge';
import { db } from '../firebase/config';

export default function BatchHistoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBatches = async () => {
    try {
      setLoading(true);

      const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setItems(data);
    } catch (error) {
      console.log('LOAD BATCHES ERROR:', error);
      Alert.alert('Error', 'Could not load product batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Product Batches</Text>

      <TouchableOpacity style={styles.refreshBtn} onPress={loadBatches}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {items.length === 0 ? (
            <Text style={styles.emptyText}>No product batches found</Text>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.name}>
                  {item.productName || 'Unnamed Product'}
                </Text>

                <Text style={styles.metaText}>
                  ID: {item.batchId || item.id}
                </Text>

                <Text style={styles.metaText}>
                  {item.farmName || 'Unknown Farm'}
                </Text>

                {!!item.productionDate && (
                  <Text style={styles.metaText}>
                    Production: {String(item.productionDate).slice(0, 10)}
                  </Text>
                )}

                {!!item.expiryDate && (
                  <Text style={styles.metaText}>
                    Expiry: {String(item.expiryDate).slice(0, 10)}
                  </Text>
                )}

                <View style={{ marginTop: 8 }}>
                  <StatusBadge status={item.status || 'created'} />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },

  refreshBtn: {
    alignSelf: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },

  refreshText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 30,
    fontSize: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 12,
  },

  name: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },

  metaText: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 2,
  },
});