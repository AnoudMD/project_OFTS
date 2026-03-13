import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RetailerDashboard          from '../screens/RetailerDashboard';
import BatchListScreen            from '../screens/BatchListScreen';
import BatchDetailScreen          from '../screens/BatchDetailScreen';
import AddSupplyChainEventScreen  from '../screens/AddSupplyChainEventScreen';

export type RetailerStackParamList = {
  RetailerDashboard: undefined;
  BatchList:         { role: string };
  BatchDetail:       { batchId: string };
  AddEvent:          { batchId?: string; role: string };
};

const Stack = createNativeStackNavigator<RetailerStackParamList>();

export default function RetailerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RetailerDashboard" component={RetailerDashboard} />
      <Stack.Screen name="BatchList"         component={BatchListScreen} />
      <Stack.Screen name="BatchDetail"       component={BatchDetailScreen} />
      <Stack.Screen name="AddEvent"          component={AddSupplyChainEventScreen} />
    </Stack.Navigator>
  );
}
