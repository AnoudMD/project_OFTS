import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
export default function AppInput(props) {
return <TextInput placeholderTextColor="#999" style={styles.input}
{...props} />;
}
const styles = StyleSheet.create({
input: {
backgroundColor: '#F5F5F5',
borderRadius: 12,
paddingHorizontal: 14,
paddingVertical: 14,
marginTop: 10,
borderWidth: 1,
borderColor: '#E4E4E4',
},
});