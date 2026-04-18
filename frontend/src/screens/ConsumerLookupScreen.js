import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image } from 'react-native';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import logo from '../../assets/logo.jpg'; // تأكدي من الامتداد

export default function ConsumerLookupScreen({ navigation }) {
  const [batchId, setBatchId] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        {/* اللوقو */}
        <Image source={logo} style={styles.logo} />

        {/* العنوان */}
        <Text style={styles.title}>
          Organic Food Traceability System
        </Text>

        {/* زر QR */}
        <AppButton
          title="Scan QR Code"
          onPress={() => navigation.navigate('QrScanner')}
        />

        <Text style={styles.or}>or enter batch ID manually</Text>

        {/* input */}
        <AppInput
          placeholder="BATCH-XXXXXXXX"
          value={batchId}
          onChangeText={setBatchId}
        />

        {/* زر البحث */}
        <AppButton
          title="Search"
          onPress={() => {
            // نفس كودك القديم (لا تغيرينه)
          }}
        />

        {/* روابط */}
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('BatchHistory')}
        >
          Product Batches
        </Text>

        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          Supply Chain Login
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },

  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },

  or: {
    textAlign: 'center',
    color: '#6B7280',
    marginVertical: 10,
  },

  link: {
    textAlign: 'center',
    color: '#16A34A', // اللون الموحد
    marginTop: 10,
    fontWeight: '700',
  },
});