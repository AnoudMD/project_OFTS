import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProducerDashboard  from '../screens/ProducerDashboard';
import CreateBatchScreen  from '../screens/CreateBatchScreen';
import BatchListScreen    from '../screens/BatchListScreen';
import BatchDetailScreen  from '../screens/BatchDetailScreen';

export type ProducerStackParamList = {
  ProducerDashboard: undefined;
  CreateBatch:       undefined;
  BatchList:         { role: string };
  BatchDetail:       { batchId: string };
};

const Stack = createNativeStackNavigator<ProducerStackParamList>();

export default function ProducerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProducerDashboard" component={ProducerDashboard} />
      <Stack.Screen name="CreateBatch"       component={CreateBatchScreen} />
      <Stack.Screen name="BatchList"         component={BatchListScreen} />
      <Stack.Screen name="BatchDetail"       component={BatchDetailScreen} />
    </Stack.Navigator>
  );
}
