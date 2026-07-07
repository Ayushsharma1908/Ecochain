/**
 * Firebase singleton — initialised once, reused everywhere.
 *
 * Config values are read from EXPO_PUBLIC_FIREBASE_* env vars so they
 * are embedded at build time and never hit the network.
 *
 * Persistence: getReactNativePersistence keeps the Firebase session alive
 * across app restarts via AsyncStorage (same store the rest of the app uses).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Guard against double-init during Expo Fast Refresh
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

// initializeAuth must also be called only once — getAuth() after the first
// initializeAuth() call will return the same instance.
let _auth: ReturnType<typeof initializeAuth> | undefined;
function getFirebaseAuth() {
  if (!_auth) {
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  return _auth;
}

export const firebaseApp = app;
export const firebaseAuth = getFirebaseAuth();
