import React, { createContext, useContext, useEffect, useMemo, useState } from
'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi } from '../api/authApi';
import { setAuthToken } from '../api/client';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
const restore = async () => {
const storedToken = await AsyncStorage.getItem('token');
const storedUser = await AsyncStorage.getItem('user');
if (storedToken && storedUser) {
setToken(storedToken);
setUser(JSON.parse(storedUser));
setAuthToken(storedToken);
}
setLoading(false);
};
restore();
}, []);
const login = async (email, password, role) => {
const data = await loginApi({ email, password, role });
setToken(data.token);
setUser(data.user);
setAuthToken(data.token);
await AsyncStorage.setItem('token', data.token);
await AsyncStorage.setItem('user', JSON.stringify(data.user));
};
const logout = async () => {
setToken(null);
setUser(null);
setAuthToken(null);
await AsyncStorage.multiRemove(['token', 'user']);
};
const value = useMemo(() => ({ user, token, loading, login, logout }), [user,
token, loading]);
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
