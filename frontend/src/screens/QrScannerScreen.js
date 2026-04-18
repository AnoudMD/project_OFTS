import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { getTraceabilityApi } from '../api/traceApi';
import { saveScannedBatch } from '../storage/historyStorage';

export default function QrScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    let batchId = data;
    const match = data.match(/OFTS-[A-Z0-9]+/);
    if (match) batchId = match[0];

    try {
      const traceData = await getTraceabilityApi(batchId.trim());
      await saveScannedBatch({
        batchId: traceData.batch.batchId,
        productName: traceData.batch.productName,
        status: traceData.batch.status,
        farmName: traceData.batch.farmName,
        scannedAt: new Date().toISOString(),
      });

      navigation.replace('Traceability', { traceData });
    } catch (error) {
      Alert.alert(
        'Not found',
        error?.response?.data?.message || 'Invalid batch ID',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={{ marginTop: 12, color: '#555' }}>
          Requesting camera permission...
        </Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Camera permission denied.</Text>
        <Text style={styles.subText}>
          Please enable camera access in settings.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />

          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />

            <View style={styles.scanBox}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            <View style={styles.sideOverlay} />
          </View>

          <View style={styles.bottomOverlay}>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.hint}>
                {scanned ? 'Processing...' : 'Point camera at a QR code'}
              </Text>
            )}

            {scanned && !loading && (
              <TouchableOpacity
                style={styles.rescanBtn}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.rescanText}>Tap to Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const BOX_SIZE = 250;
const CORNER_SIZE = 30;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },

  camera: { flex: 1 },

  overlay: { flex: 1 },

  topOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },

  middleRow: { flexDirection: 'row', height: BOX_SIZE },

  sideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },

  scanBox: { width: BOX_SIZE, height: BOX_SIZE },

  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hint: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },

  /* ✅ اللون الموحد */
  rescanBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  rescanText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },

  subText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },

  /* ✅ لون زوايا السكان */
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#16A34A',
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
});