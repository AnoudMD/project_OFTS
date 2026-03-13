import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DistributorDashboard       from '../screens/DistributorDashboard';
import BatchListScreen            from '../screens/BatchListScreen';
import BatchDetailScreen          from '../screens/BatchDetailScreen';
import AddSupplyChainEventScreen  from '../screens/AddSupplyChainEventScreen';

export type DistributorStackParamList = {
  DistributorDashboard: undefined;
  BatchList:            { role: string };
  BatchDetail:          { batchId: string };
  AddEvent:             { batchId?: string; role: string };
};

const Stack = createNativeStackNavigator<DistributorStackParamList>();

export default function DistributorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DistributorDashboard" component={DistributorDashboard} />
      <Stack.Screen name="BatchList"            component={BatchListScreen} />
      <Stack.Screen name="BatchDetail"          component={BatchDetailScreen} />
      <Stack.Screen name="AddEvent"             component={AddSupplyChainEventScreen} />
    </Stack.Navigator>
  );
}
