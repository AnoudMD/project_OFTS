import 'react-native-get-random-values';
import { initializeApp, getApps, getApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAF83tNedcZbVXLQfhyur0ooe-w-TOJQis",
  authDomain: "ofts-3f295.firebaseapp.com",
  projectId: "ofts-3f295",
  storageBucket: "ofts-3f295.firebasestorage.app",
  messagingSenderId: "412485014210",
  appId: "1:412485014210:web:d601b6a316d0376975215b"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };