import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";

import { createGoogleAuthUser } from "@/lib/auth";
import { firebaseAuth } from "@/lib/firebase";
import type { AuthUser } from "@/types/auth";

let _configured = false;

function ensureConfigured() {
  if (_configured) return;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    // Request offline access so Firebase can refresh tokens server-side if needed
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
  _configured = true;
}

// --------------------------------------------------------------------------
// Human-readable error messages
// --------------------------------------------------------------------------
function mapGoogleError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as any).code as string | undefined;

    if (code === statusCodes.SIGN_IN_CANCELLED) {
      // User deliberately closed the picker — don't show an error
      return "";
    }
    if (code === statusCodes.IN_PROGRESS) {
      return "Sign-in is already in progress.";
    }
    if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return "Google Play Services is unavailable on this device.";
    }
    if (
      error.message?.toLowerCase().includes("network") ||
      error.message?.toLowerCase().includes("connection")
    ) {
      return "Network error. Please check your connection and try again.";
    }
  }
  return "Google Sign-In failed. Please try again.";
}

export async function signInWithGoogleNative(): Promise<AuthUser | null> {
  ensureConfigured();

  try {
    // 1. Native Google sign-in
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await GoogleSignin.signOut().catch(() => {});
    const signInResult = await GoogleSignin.signIn();

    // 2. Get the ID token
    // The shape changed in v13 — idToken lives at the top level.
    const idToken =
      (signInResult as any).data?.idToken ?? (signInResult as any).idToken;

    if (!idToken) {
      throw new Error("No ID token returned from Google Sign-In.");
    }

    // 3. Exchange with Firebase
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(firebaseAuth, credential);
    const firebaseUser = userCredential.user;

    // 4. Map to AuthUser
    return createGoogleAuthUser(
      firebaseUser.uid,
      firebaseUser.email ?? "",
      firebaseUser.displayName,
      firebaseUser.photoURL,
    );
  } catch (error: any) {
    console.log("GOOGLE SIGN IN ERROR");
    console.log(error);
    console.log("CODE:", error?.code);
    console.log("MESSAGE:", error?.message);

    const message = mapGoogleError(error);

    if (!message) return null;

    throw new Error(message);
  }
}

/**
 * Sign out from both Google (native) and Firebase.
 * Call this alongside your existing clearAuthUser() in AuthContext.
 */
export async function signOutGoogle(): Promise<void> {
  try {
    ensureConfigured();
    await GoogleSignin.signOut();
  } catch {
    // Best-effort — don't block app sign-out if Google sign-out fails
  }
  try {
    await firebaseSignOut(firebaseAuth);
  } catch {
    // Same — best-effort
  }
}
