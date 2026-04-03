import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import ConsumerLookupScreen from '../screens/ConsumerLookupScreen';
import CreateBatchScreen from '../screens/CreateBatchScreen';
import AddEventScreen from '../screens/AddEventScreen';
import TraceabilityScreen from '../screens/TraceabilityScreen';
import BatchHistoryScreen from '../screens/BatchHistoryScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CertifierReviewScreen from '../screens/CertifierReviewScreen';
import QrScannerScreen from '../screens/QrScannerScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Lookup">
        <Stack.Screen
          name="Lookup"
          component={ConsumerLookupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QrScanner"
          component={QrScannerScreen}
          options={{ title: 'Scan QR Code' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Supply Chain Login' }}
        />
        <Stack.Screen
          name="Traceability"
          component={TraceabilityScreen}
          options={{ title: 'Product Traceability' }}
        />
        <Stack.Screen
          name="BatchHistory"
          component={BatchHistoryScreen}
          options={{ title: 'Product Batches' }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateBatch"
          component={CreateBatchScreen}
          options={{ title: 'Create Product Batch' }}
        />
        <Stack.Screen
          name="AddEvent"
          component={AddEventScreen}
          options={{ title: 'Add Supply Chain Event' }}
        />
        <Stack.Screen
          name="CertifierReview"
          component={CertifierReviewScreen}
          options={{ title: 'Review Batches' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}