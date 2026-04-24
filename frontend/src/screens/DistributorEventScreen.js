import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import AppInput from '../components/AppInput';

const EVENTS = [
  'Received from Producer',
  'Stored in Warehouse',
  'Shipped to Retailer',
];

export default function DistributorEventScreen() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');

  const [selectedEvent, setSelectedEvent] = useState({});
  const [showEventList, setShowEventList] = useState({});
  const [locations, setLocations] = useState({});
  const [destinations, setDestinations] = useState({});
  const [dates, setDates] = useState({});
  const [showDatePicker, setShowDatePicker] = useState({});
  const [notes, setNotes] = useState({});

  const loadBatches = async () => {
    try {
      setLoading(true);

      const snap = await getDocs(collection(db, 'batches'));

      const data = snap.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .filter((item) =>
          ['approved', 'Approved', 'certified', 'created'].includes(item.status)
        )
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

      setBatches(data);
    } catch (error) {
      console.log('LOAD DISTRIBUTOR ERROR:', error);
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
      (item) =>
        item.currentActor !== 'distributor' &&
        item.currentActor !== 'retailer'
    );
  }, [batches]);

  const updateBatches = useMemo(() => {
    return batches.filter(
      (item) =>
        item.currentActor === 'distributor' &&
        item.lastEventType !== 'Shipped to Retailer'
    );
  }, [batches]);

  const sentBatches = useMemo(() => {
    return batches.filter(
      (item) => item.lastEventType === 'Shipped to Retailer'
    );
  }, [batches]);

  const currentList = useMemo(() => {
    if (selectedTab === 'update') return updateBatches;
    if (selectedTab === 'sent') return sentBatches;
    return pendingBatches;
  }, [selectedTab, pendingBatches, updateBatches, sentBatches]);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getDateValue = (batchId) => dates[batchId] || new Date();

  const saveEvent = async (batch) => {
    try {
      const batchId = batch.id;
      const eventType = selectedEvent[batchId] || 'Received from Producer';
      const location = locations[batchId]?.trim() || '';
      const destination = destinations[batchId]?.trim() || '';
      const note = notes[batchId]?.trim() || '';
      const eventDateTime = formatDate(getDateValue(batchId));

      if (!location) {
        Alert.alert('Missing Data', 'Please enter location');
        return;
      }

      if (eventType === 'Shipped to Retailer' && !destination) {
        Alert.alert('Missing Data', 'Please enter destination retailer');
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      setActionLoadingId(batchId);

      const eventPayload = {
        batchId,
        actorRole: 'distributor',
        source: 'Producer',
        destination,
        eventType,
        location,
        eventDateTime,
        notes: note,
        actorId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'batches', batchId, 'events'), eventPayload);

      await updateDoc(doc(db, 'batches', batchId), {
        lastEventType: eventType,
        lastEventLocation: location,
        lastEventDateTime: eventDateTime,
        currentActor: 'distributor',
        destinationRetailer: destination,
        updatedAt: serverTimestamp(),
      });

      Alert.alert('Saved', 'Distributor event added successfully');

      setLocations((prev) => ({ ...prev, [batchId]: '' }));
      setDestinations((prev) => ({ ...prev, [batchId]: '' }));
      setNotes((prev) => ({ ...prev, [batchId]: '' }));

      loadBatches();
    } catch (error) {
      console.log('SAVE DISTRIBUTOR ERROR:', error);
      Alert.alert('Error', error.message || 'Could not save event');
    } finally {
      setActionLoadingId('');
    }
  };

  const renderEmpty = () => {
    if (selectedTab === 'update') return 'No batches to update';
    if (selectedTab === 'sent') return 'No batches sent to retailer';
    return 'No pending batches';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roleText}> Distributor</Text>
        <Text style={styles.headerSub}>Manage producer batches</Text>
      </View>

      <View style={styles.tabsWrapper}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'pending' && styles.activeTab]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'update' && styles.activeTab]}
          onPress={() => setSelectedTab('update')}
        >
          <Text style={[styles.tabText, selectedTab === 'update' && styles.activeTabText]}>
            Update
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'sent' && styles.activeTab]}
          onPress={() => setSelectedTab('sent')}
        >
          <Text style={[styles.tabText, selectedTab === 'sent' && styles.activeTabText]}>
            Sent
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
            <Text style={styles.emptyText}>{renderEmpty()}</Text>
          ) : (
            currentList.map((batch) => {
              const batchEvent =
                selectedEvent[batch.id] || 'Received from Producer';

              return (
                <View key={batch.id} style={styles.card}>
                  <Text style={styles.productName}>
                    {batch.productName || 'Unnamed Product'}
                  </Text>
                  <Text style={styles.cardId}>ID: {batch.id}</Text>
                  <Text style={styles.metaText}>
                    Farm: {batch.farmName || '-'}
                  </Text>

                  {!!batch.lastEventType && (
                    <Text style={styles.metaText}>
                      Last Event: {batch.lastEventType}
                    </Text>
                  )}

                  {selectedTab !== 'sent' && (
                    <>
                      <Text style={styles.label}>Source</Text>
                      <View style={styles.readOnly}>
                        <Text style={styles.readOnlyText}>Producer</Text>
                      </View>

                      <Text style={styles.label}>Event Type</Text>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() =>
                          setShowEventList((prev) => ({
                            ...prev,
                            [batch.id]: !prev[batch.id],
                          }))
                        }
                      >
                        <Text style={styles.dropdownText}>{batchEvent}</Text>
                        <Text style={styles.arrow}>
                          {showEventList[batch.id] ? '▲' : '▼'}
                        </Text>
                      </TouchableOpacity>

                      {showEventList[batch.id] && (
                        <View style={styles.dropdownList}>
                          {EVENTS.map((type) => (
                            <TouchableOpacity
                              key={type}
                              style={styles.dropdownItem}
                              onPress={() => {
                                setSelectedEvent((prev) => ({
                                  ...prev,
                                  [batch.id]: type,
                                }));
                                setShowEventList((prev) => ({
                                  ...prev,
                                  [batch.id]: false,
                                }));
                              }}
                            >
                              <Text style={styles.optionText}>{type}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      <Text style={styles.label}>Location</Text>
                      <AppInput
                        value={locations[batch.id] || ''}
                        onChangeText={(text) =>
                          setLocations((prev) => ({
                            ...prev,
                            [batch.id]: text,
                          }))
                        }
                        placeholder="Enter location"
                      />

                      <Text style={styles.label}>Destination Retailer</Text>
                      <AppInput
                        value={destinations[batch.id] || ''}
                        onChangeText={(text) =>
                          setDestinations((prev) => ({
                            ...prev,
                            [batch.id]: text,
                          }))
                        }
                        placeholder="Enter retailer name"
                      />

                      <Text style={styles.label}>Date</Text>
                      <TouchableOpacity
                        style={styles.dateBox}
                        onPress={() =>
                          setShowDatePicker((prev) => ({
                            ...prev,
                            [batch.id]: true,
                          }))
                        }
                      >
                        <Text>{formatDate(getDateValue(batch.id))}</Text>
                      </TouchableOpacity>

                      {showDatePicker[batch.id] && (
                        <DateTimePicker
                          value={getDateValue(batch.id)}
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker((prev) => ({
                              ...prev,
                              [batch.id]: false,
                            }));

                            if (selectedDate) {
                              setDates((prev) => ({
                                ...prev,
                                [batch.id]: selectedDate,
                              }));
                            }
                          }}
                        />
                      )}

                      <Text style={styles.label}>Notes</Text>
                      <AppInput
                        value={notes[batch.id] || ''}
                        onChangeText={(text) =>
                          setNotes((prev) => ({
                            ...prev,
                            [batch.id]: text,
                          }))
                        }
                        placeholder="Add details"
                        multiline
                        style={{ minHeight: 90 }}
                      />

                      <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={() => saveEvent(batch)}
                        disabled={actionLoadingId === batch.id}
                      >
                        <Text style={styles.saveBtnText}>
                          {actionLoadingId === batch.id
                            ? 'Saving...'
                            : 'Update Event'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const GREEN = '#16A34A';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 18,
  },

  roleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },

  headerSub: {
    color: '#DCFCE7',
    marginTop: 4,
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

  activeTab: {
    backgroundColor: GREEN,
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  productName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1F2937',
  },

  cardId: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },

  metaText: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },

  label: {
    marginTop: 14,
    marginBottom: 8,
    fontWeight: '800',
    color: '#374151',
  },

  readOnly: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
  },

  readOnlyText: {
    color: '#6B7280',
    fontWeight: '700',
  },

  dropdownButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dropdownText: {
    flex: 1,
    color: '#1F2937',
    fontWeight: '600',
  },

  arrow: {
    color: '#6B7280',
    marginLeft: 8,
  },

  dropdownList: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginTop: 6,
    overflow: 'hidden',
  },

  dropdownItem: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  optionText: {
    color: '#1F2937',
    fontWeight: '600',
  },

  dateBox: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },

  saveBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },

  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});