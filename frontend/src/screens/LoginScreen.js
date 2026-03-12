import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { ROLES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
export default function LoginScreen() {
const { login } = useAuth();
const [email, setEmail] = useState('producer@ofts.com');
const [password, setPassword] = useState('123456');
const [role, setRole] = useState('Producer');
const handleLogin = async () => {
try {
await login(email, password, role);
} catch (error) {
Alert.alert('Login failed', error?.response?.data?.message || 'Please tryagain');
}
};
return (
<SafeAreaView style={styles.container}>
<Text style={styles.title}>Login</Text>

<Text style={styles.subtitle}>Select your role to continue</Text>
<Text style={styles.label}>Role</Text>
<View style={styles.roleRow}>
{ROLES.map((item) => (
<Text
key={item}
style={[styles.rolePill, role === item && styles.rolePillActive]}
onPress={() => setRole(item)}
>
{item}
</Text>
))}
</View>
<Text style={styles.label}>Email</Text>
<AppInput value={email} onChangeText={setEmail}
placeholder="your@email.com" autoCapitalize="none" />
<Text style={styles.label}>Password</Text>
<AppInput value={password} onChangeText={setPassword} placeholder="Enter
your password" secureTextEntry />
<AppButton title="Login" onPress={handleLogin} />
</SafeAreaView>
);
}
const styles = StyleSheet.create({
container: { flex: 1, padding: 20, backgroundColor: '#fff' },
title: { fontSize: 34, fontWeight: '800', color: '#0AA329', marginTop: 60,
textAlign: 'center' },
subtitle: { textAlign: 'center', color: '#777', marginTop: 10, marginBottom:
20 },
label: { marginTop: 14, fontWeight: '700', color: '#222' },
roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
rolePill: { borderWidth: 1, borderColor: '#0AA329', paddingHorizontal: 12,
paddingVertical: 8, borderRadius: 20, color: '#0AA329' },
rolePillActive: { backgroundColor: '#0AA329', color: '#fff' },
});