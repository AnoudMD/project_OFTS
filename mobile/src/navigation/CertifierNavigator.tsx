import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CertifierDashboard from '../screens/CertifierDashboard';
import BatchListScreen    from '../screens/BatchListScreen';
import BatchDetailScreen  from '../screens/BatchDetailScreen';
import ReviewBatchScreen  from '../screens/ReviewBatchScreen';

export type CertifierStackParamList = {
  CertifierDashboard: undefined;
  BatchList:          { role: string };
  BatchDetail:        { batchId: string };
  ReviewBatch:        { batchId: string };
};

const Stack = createNativeStackNavigator<CertifierStackParamList>();

export default function CertifierNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CertifierDashboard" component={CertifierDashboard} />
      <Stack.Screen name="BatchList"          component={BatchListScreen} />
      <Stack.Screen name="BatchDetail"        component={BatchDetailScreen} />
      <Stack.Screen name="ReviewBatch"        component={ReviewBatchScreen} />
    </Stack.Navigator>
  );
}
