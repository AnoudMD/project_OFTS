import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
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
const { user } = useAuth();
return (
<NavigationContainer>
<Stack.Navigator>
<Stack.Screen name="Lookup" component={ConsumerLookupScreen} options={{
headerShown: false }} />
<Stack.Screen name="QrScanner" component={QrScannerScreen} options={{
title: 'Scan QR' }} />
<Stack.Screen name="Login" component={LoginScreen} options={{ title:
'Supply Chain Login' }} />
<Stack.Screen name="Traceability" component={TraceabilityScreen} />
<Stack.Screen name="BatchHistory" component={BatchHistoryScreen} />
{user && <Stack.Screen name="Dashboard" component={DashboardScreen} />}
{user?.role === 'Producer' && <Stack.Screen name="CreateBatch"
component={CreateBatchScreen} />}
{['Producer', 'Distributor', 'Retailer'].includes(user?.role) && (
<Stack.Screen name="AddEvent" component={AddEventScreen} />
)}
{user?.role === 'Certifier' && <Stack.Screen name="CertifierReview"
component={CertifierReviewScreen} />}
</Stack.Navigator>
</NavigationContainer>
);
}
