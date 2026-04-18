import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBkUGWKJtoUf8jn3j6efv1PreqGqiY_aUc',
  authDomain: 'fintech-b7387.firebaseapp.com',
  projectId: 'fintech-b7387',
  storageBucket: 'fintech-b7387.firebasestorage.app',
  messagingSenderId: '252950874524',
  appId: '1:252950874524:web:ea9438a0438983333d2059',
  measurementId: 'G-4FGPXWVH89',
};

// Prevent re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Warning fix: Provide AsyncStorage so Firebase can persist state strictly on Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };
export default app;
