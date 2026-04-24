import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import client from '../api/client';

export default function CertifierReviewScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState({});

  const user = auth.currentUser;

  const loadBatches = async () => {
    try {
      setLoading(true);

      const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setBatches(data);
    } catch (error) {
      console.log('LOAD CERTIFIER BATCHES ERROR:', error);
      Alert.alert('Error', 'Could not load batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const pendingBatches = useMemo(() => {
    return batches.filter(
      (item) => item.status === 'pending' || item.status === 'created'
    );
  }, [batches]);

  const approvedBatches = useMemo(() => {
    return batches.filter((item) => item.status === 'approved');
  }, [batches]);

  const rejectedBatches = useMemo(() => {
    return batches.filter((item) => item.status === 'rejected');
  }, [batches]);

  const currentList = useMemo(() => {
    if (selectedTab === 'approved') return approvedBatches;
    if (selectedTab === 'rejected') return rejectedBatches;
    return pendingBatches;
  }, [selectedTab, pendingBatches, approvedBatches, rejectedBatches]);

  const handleApprove = async (batchId) => {
    try {
      setActionLoadingId(batchId);

      await updateDoc(doc(db, 'batches', batchId), {
        status: 'approved',
        rejectionReason: '',
        certifiedBy: user?.uid || '',
        certifiedAt: new Date().toISOString(),
      });

      const certQuery = query(
        collection(db, 'certificates'),
        where('batchId', '==', batchId)
      );

      const certSnapshot = await getDocs(certQuery);

      if (certSnapshot.empty) {
        Alert.alert(
          'Approved with warning',
          `${batchId} approved, but no linked certificate was found`
        );
        await loadBatches();
        return;
      }

      const certificateDoc = certSnapshot.docs[0];
      const certificateId = certificateDoc.id;

      try {
        const response = await client.post(
          `/ipfs/upload-certificate/${certificateId}`
        );

        const result = response?.data || {};

        Alert.alert(
          'Approved',
          `${batchId} approved successfully and recorded.\n\nIPFS CID: ${result.cid || 'Done'}\nTX Hash: ${result.txHash || 'Done'}`
        );
      } catch (apiError) {
        console.log(
          'IPFS/BLOCKCHAIN API ERROR:',
          apiError?.response?.data || apiError.message
        );

        Alert.alert(
          'Approved with warning',
          `${batchId} approved, but IPFS / blockchain failed`
        );
      }

      await loadBatches();
    } catch (error) {
      console.log('APPROVE ERROR:', error);
      Alert.alert('Error', 'Could not approve batch');
    } finally {
      setActionLoadingId('');
    }
  };

  const handleReject = async (batchId) => {
    try {
      const reason = rejectionReasons[batchId]?.trim() || '';

      if (!reason) {
        Alert.alert('Missing Reason', 'Please enter rejection reason');
        return;
      }

      setActionLoadingId(batchId);

      await updateDoc(doc(db, 'batches', batchId), {
        status: 'rejected',
        rejectionReason: reason,
        certifiedBy: user?.uid || '',
        certifiedAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Batch rejected successfully');
      loadBatches();
    } catch (error) {
      console.log('REJECT ERROR:', error);
      Alert.alert('Error', 'Could not reject batch');
    } finally {
      setActionLoadingId('');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Lookup');
    } catch (error) {
      console.log('LOGOUT ERROR:', error);
    }
  };

  const renderStatusBadge = (status) => {
    if (status === 'approved') {
      return <Text style={styles.approvedBadge}>approved</Text>;
    }

    if (status === 'rejected') {
      return <Text style={styles.rejectedBadge}>rejected</Text>;
    }

    return <Text style={styles.pendingBadge}>created</Text>;
  };

  const renderEmptyText = () => {
    if (selectedTab === 'approved') return 'No approved batches';
    if (selectedTab === 'rejected') return 'No rejected batches';
    return 'No pending batches';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.loggedText}>Logged in as</Text>
          <Text style={styles.roleText}> Certifier</Text>
          <Text style={styles.emailText}>{user?.email || 'No email'}</Text>
        </View>

        
      </View>

      <View style={styles.tabsWrapper}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'pending' && styles.activePendingTab,
          ]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'pending' && styles.activeTabText,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'approved' && styles.activeApprovedTab,
          ]}
          onPress={() => setSelectedTab('approved')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'approved' && styles.activeTabText,
            ]}
          >
            Approved
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'rejected' && styles.activeRejectedTab,
          ]}
          onPress={() => setSelectedTab('rejected')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'rejected' && styles.activeTabText,
            ]}
          >
            Rejected
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {currentList.length === 0 ? (
            <Text style={styles.emptyText}>{renderEmptyText()}</Text>
          ) : (
            currentList.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>
                      {item.productName || 'Unnamed Product'}
                    </Text>
                    <Text style={styles.cardId}>ID: {item.id}</Text>
                  </View>

                  {renderStatusBadge(item.status)}
                </View>

                <Text style={styles.farmText}>
                  {item.farmName || 'Unknown Farm'}
                </Text>

                <Text style={styles.metaText}>
                  Production:{' '}
                  {item.productionDate
                    ? String(item.productionDate).slice(0, 10)
                    : '-'}
                </Text>

                <Text style={styles.metaText}>
                  Expiry:{' '}
                  {item.expiryDate
                    ? String(item.expiryDate).slice(0, 10)
                    : '-'}
                </Text>

                {!!item.notes && (
                  <>
                    <Text style={styles.sectionLabel}>Notes</Text>
                    <Text style={styles.notesText}>{item.notes}</Text>
                  </>
                )}

                {selectedTab === 'pending' && (
                  <>
                    <Text style={styles.sectionLabel}>Rejection Reason</Text>

                    <TextInput
                      value={rejectionReasons[item.id] || ''}
                      onChangeText={(text) =>
                        setRejectionReasons((prev) => ({
                          ...prev,
                          [item.id]: text,
                        }))
                      }
                      placeholder="Enter rejection reason if needed"
                      placeholderTextColor="#9CA3AF"
                      style={styles.reasonInput}
                      multiline
                    />

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => handleApprove(item.id)}
                        disabled={actionLoadingId === item.id}
                      >
                        <Text style={styles.approveBtnText}>
                          {actionLoadingId === item.id ? 'Saving...' : 'Approve'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleReject(item.id)}
                        disabled={actionLoadingId === item.id}
                      >
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {selectedTab === 'rejected' && !!item.rejectionReason && (
                  <>
                    <Text style={styles.sectionLabel}>Rejection Reason</Text>
                    <Text style={styles.notesText}>{item.rejectionReason}</Text>
                  </>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const GREEN = '#16A34A';
const GREEN_LIGHT = '#ECFDF5';
const RED = '#DC2626';
const RED_LIGHT = '#FEE2E2';
const GOLD = '#D4A72C';
const GOLD_LIGHT = '#FEF3C7';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  loggedText: {
    color: '#DCFCE7',
    fontSize: 12,
    marginBottom: 2,
  },

  roleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  emailText: {
    color: '#DCFCE7',
    fontSize: 13,
    marginTop: 4,
  },

  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },

  activePendingTab: {
    backgroundColor: GOLD,
  },

  activeApprovedTab: {
    backgroundColor: GREEN,
  },

  activeRejectedTab: {
    backgroundColor: '#EF4444',
  },

  tabText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 13,
  },

  activeTabText: {
    color: '#FFFFFF',
  },

  listContent: {
    padding: 14,
    paddingBottom: 28,
  },

  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 16,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },

  cardId: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },

  farmText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 6,
  },

  metaText: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },

  pendingBadge: {
    backgroundColor: GOLD_LIGHT,
    color: '#8A6A00',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },

  approvedBadge: {
    backgroundColor: GREEN_LIGHT,
    color: GREEN,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },

  rejectedBadge: {
    backgroundColor: RED_LIGHT,
    color: RED,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#374151',
    marginTop: 14,
    marginBottom: 8,
  },

  notesText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
  },

  reasonInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111827',
    textAlignVertical: 'top',
  },

  actionsRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },

  approveBtn: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  rejectBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GREEN,
  },

  rejectBtnText: {
    color: GREEN,
    fontWeight: '800',
    fontSize: 15,
  },
});