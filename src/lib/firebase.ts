import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// getReactNativePersistence is only available in Firebase's React Native build.
// Metro correctly resolves it at runtime via the 'react-native' export condition,
// but the TypeScript types for 'firebase/auth' only ship the browser build.
// The @ts-ignore below suppresses the false-positive type error on this one import.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – exists in the react-native Metro bundle; missing from browser types only
import { getReactNativePersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkwXxOuXm-zwwNRZqFddfwXNZ0IUqiUpc",
  authDomain: "ecochain-link.firebaseapp.com",
  projectId: "ecochain-link",
  storageBucket: "ecochain-link.firebasestorage.app",
  messagingSenderId: "508663573845",
  appId: "1:508663573845:web:31e8895fcedae8b27893dc",
};

// Guard against double-init during Expo Fast Refresh
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

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
