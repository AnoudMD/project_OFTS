import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
export default function AppButton({ title, onPress, outline = false }) {
return (
<TouchableOpacity onPress={onPress} style={[styles.btn, outline &&
styles.outline]}>
<Text style={[styles.text, outline && styles.outlineText]}>{title}</Text>
</TouchableOpacity>
);
}
const styles = StyleSheet.create({
btn: {
backgroundColor: '#0AA329',
paddingVertical: 14,
borderRadius: 12,
alignItems: 'center',
marginTop: 12,
},
outline: {
backgroundColor: '#fff',
borderWidth: 1,
borderColor: '#0AA329',
},
text: { color: '#fff', fontWeight: '700', fontSize: 16 },
outlineText: { color: '#0AA329' },
});