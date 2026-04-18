import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';

export default function ProducerDashboardScreen({ navigation }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  const loadBatches = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'batches'),
        where('producerId', '==', user.uid)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBatches(data);
    } catch (error) {
      console.log('LOAD BATCHES ERROR:', error);
      Alert.alert('Error', 'Could not load batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const stats = useMemo(() => {
    const total = batches.length;
    const approved = batches.filter((item) => item.status === 'approved').length;
    const pending = batches.filter(
      (item) => item.status === 'pending' || item.status === 'created'
    ).length;
    const rejected = batches.filter((item) => item.status === 'rejected').length;

    return { total, approved, pending, rejected };
  }, [batches]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Lookup');
    } catch (error) {
      console.log('LOGOUT ERROR:', error);
    }
  };

  const getBatchStyle = (status) => {
    if (status === 'approved') {
      return {
        card: styles.approvedCard,
        text: styles.approvedText,
        label: 'Approved',
      };
    }

    if (status === 'rejected') {
      return {
        card: styles.rejectedCard,
        text: styles.rejectedText,
        label: 'Rejected',
      };
    }

    return {
      card: styles.pendingCard,
      text: styles.pendingText,
      label: 'Pending',
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logged}>Logged in as</Text>
            <Text style={styles.role}>Producer</Text>
            <Text style={styles.email}>{user?.email || 'No email'}</Text>
          </View>

        
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statIcon, { color: '#22C55E' }]}>✓</Text>
            <Text style={styles.statNumber}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statIcon, { color: '#EAB308' }]}>◔</Text>
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statIcon, { color: '#EF4444' }]}>✕</Text>
            <Text style={styles.statNumber}>{stats.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => navigation.navigate('CreateBatch')}
        >
          <Text style={styles.newBtnText}>＋ New Batch</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>My Batches</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#16A34A" style={{ marginTop: 20 }} />
        ) : batches.length === 0 ? (
          <Text style={styles.emptyText}>No batches found.</Text>
        ) : (
          batches.map((item) => {
            const batchStyle = getBatchStyle(item.status);

            return (
              <View key={item.id} style={[styles.batchCard, batchStyle.card]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.batchTitle}>
                    {item.productName || 'Unnamed Product'}
                  </Text>
                  <Text style={styles.batchSub}>ID: {item.id}</Text>
                  <Text style={styles.batchSub}>
                    {item.farmName || 'Unknown Farm'}
                  </Text>
                </View>

                <Text style={batchStyle.text}>● {batchStyle.label}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = '#16A34A';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#15803D',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logged: {
    color: '#D1FAE5',
    fontSize: 14,
    marginBottom: 4,
  },
  role: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  email: {
    color: '#D1FAE5',
    fontSize: 14,
    marginTop: 4,
  },
  logoutBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -22,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  newBtn: {
    backgroundColor: PRIMARY,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 14,
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
  },
  batchCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  approvedCard: {
    backgroundColor: '#ECFDF5',
  },
  pendingCard: {
    backgroundColor: '#FEF3C7',
  },
  rejectedCard: {
    backgroundColor: '#FEE2E2',
  },
  batchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  batchSub: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  approvedText: {
    color: '#22C55E',
    fontWeight: '700',
    marginLeft: 10,
  },
  pendingText: {
    color: '#D97706',
    fontWeight: '700',
    marginLeft: 10,
  },
  rejectedText: {
    color: '#EF4444',
    fontWeight: '700',
    marginLeft: 10,
  },
});