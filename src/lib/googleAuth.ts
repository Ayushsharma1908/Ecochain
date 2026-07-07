/**
 * Google Sign-In service for EcoChain Link.
 *
 * Flow:
 *   1. GoogleSignin.signIn()   → opens native Google account picker
 *   2. idToken extracted       → exchanged with Firebase Auth
 *   3. Firebase returns uid / profile
 *   4. We map to AuthUser and return it — caller persists via saveAuthUser()
 *
 * Requires a development build (Expo Go is NOT supported).
 *
 * Prerequisites:
 *   • EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID set in .env
 *   • google-services.json in project root (Android)
 *   • Firebase Console: Authentication → Google provider enabled
 */
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from "firebase/auth";

import { createGoogleAuthUser } from "@/lib/auth";
import { firebaseAuth } from "@/lib/firebase";
import type { AuthUser } from "@/types/auth";

// --------------------------------------------------------------------------
// One-time configuration — idempotent, safe to call multiple times.
// --------------------------------------------------------------------------
let _configured = false;

function ensureConfigured() {
  if (_configured) return;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
    // Request offline access so Firebase can refresh tokens server-side if needed
    offlineAccess: false,
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

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/**
 * Open the native Google account picker, exchange the credential with
 * Firebase, then return the mapped AuthUser.
 *
 * Throws a `GoogleAuthError` (with a `.message` safe to show to the user)
 * on failure, or silently returns `null` when the user cancels.
 */
export async function signInWithGoogleNative(): Promise<AuthUser | null> {
  ensureConfigured();

  try {
    // 1. Native Google sign-in
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();

    // 2. Get the ID token
    // The shape changed in v13 — idToken lives at the top level.
    const idToken =
      (signInResult as any).data?.idToken ??
      (signInResult as any).idToken;

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
  } catch (error: unknown) {
    const message = mapGoogleError(error);

    // User cancelled — return null so the UI can handle it silently
    if (!message) return null;

    // Rethrow with a user-friendly message
    const friendlyError = new Error(message);
    throw friendlyError;
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
