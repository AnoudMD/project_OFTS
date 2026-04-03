import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = 'scan_history';
export const saveScannedBatch = async (item) => {
const raw = await AsyncStorage.getItem(KEY);
const list = raw ? JSON.parse(raw) : [];
const filtered = list.filter((x) => x.batchId !== item.batchId);
const updated = [item, ...filtered].slice(0, 30);
await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};
export const getScannedHistory = async () => {
const raw = await AsyncStorage.getItem(KEY);
return raw ? JSON.parse(raw) : [];
};