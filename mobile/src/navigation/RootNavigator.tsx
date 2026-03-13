import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';
import type { RootStackParamList } from '../types';

// ─── Public screens ───────────────────────────────────────────────────────────
import WelcomeScreen          from '../screens/WelcomeScreen';
import LoginScreen            from '../screens/LoginScreen';
import QRScannerScreen        from '../screens/QRScannerScreen';
import TraceabilityResultScreen  from '../screens/TraceabilityResultScreen';
import TraceabilityHistoryScreen from '../screens/TraceabilityHistoryScreen';
import ScanHistoryScreen      from '../screens/ScanHistoryScreen';

// ─── Role navigators ──────────────────────────────────────────────────────────
import ProducerNavigator     from './ProducerNavigator';
import CertifierNavigator    from './CertifierNavigator';
import DistributorNavigator  from './DistributorNavigator';
import RetailerNavigator     from './RetailerNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primaryDark }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // ── Guest stack ──────────────────────────────────────────────────────
        <>
          <Stack.Screen name="Welcome"    component={WelcomeScreen} />
          <Stack.Screen name="Login"      component={LoginScreen} />
          <Stack.Screen name="QRScanner"  component={QRScannerScreen} />
          <Stack.Screen name="TraceabilityResult"  component={TraceabilityResultScreen} />
          <Stack.Screen name="TraceabilityHistory" component={TraceabilityHistoryScreen} />
          <Stack.Screen name="ScanHistory"         component={ScanHistoryScreen} />
        </>
      ) : (
        // ── Authenticated stack (role-based) ─────────────────────────────────
        <>
          {user?.role === 'producer'    && <Stack.Screen name="ProducerTabs"    component={ProducerNavigator} />}
          {user?.role === 'certifier'   && <Stack.Screen name="CertifierTabs"   component={CertifierNavigator} />}
          {user?.role === 'distributor' && <Stack.Screen name="DistributorTabs" component={DistributorNavigator} />}
          {user?.role === 'retailer'    && <Stack.Screen name="RetailerTabs"    component={RetailerNavigator} />}
          {/* Shared screens accessible from any authenticated role */}
          <Stack.Screen name="QRScanner"           component={QRScannerScreen} />
          <Stack.Screen name="TraceabilityResult"  component={TraceabilityResultScreen} />
          <Stack.Screen name="TraceabilityHistory" component={TraceabilityHistoryScreen} />
          <Stack.Screen name="ScanHistory"         component={ScanHistoryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
