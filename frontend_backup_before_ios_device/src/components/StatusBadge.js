import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function StatusBadge({ status }) {
const styleMap = {
Approved: styles.approved,
Pending: styles.pending,
Rejected: styles.rejected,
'Certified Organic': styles.approved,
};
return (
<View style={[styles.badge, styleMap[status] || styles.pending]}>
<Text style={styles.text}>{status}</Text>
</View>
);
}
const styles = StyleSheet.create({
badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
alignSelf: 'flex-start' },
approved: { backgroundColor: '#EAF9EE' },
pending: { backgroundColor: '#FFF6DF' },
rejected: { backgroundColor: '#FDECEC' },
text: { fontWeight: '700' },
});