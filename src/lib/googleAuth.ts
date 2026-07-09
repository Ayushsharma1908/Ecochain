import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { createGoogleAuthUser } from "@/lib/auth";
import type { AuthUser } from "@/types/auth";

let _configured = false;

function ensureConfigured() {
  if (_configured) return;
  GoogleSignin.configure({
    webClientId:
      "508663573845-cgma5sg9ki696unssg4svo9spm57ctjt.apps.googleusercontent.com",
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
  _configured = true;
}

export async function signInWithGoogleNative(): Promise<AuthUser | null> {
  ensureConfigured();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const signInResult = await GoogleSignin.signIn();

    // Support every response shape across @react-native-google-signin versions:
    //   v13+  → signInResult.data.user
    //   v12   → signInResult.user
    //   v11   → signInResult.data (user fields at top level)
    const googleUser =
      signInResult?.data?.user ??
      (signInResult as any)?.user ??
      signInResult?.data;

    if (!googleUser) {
      throw new Error("Google Sign-In returned no user.");
    }

    const id: string =
      googleUser.id ?? googleUser.userId ?? `google-${Date.now()}`;
    const email: string = googleUser.email ?? "";
    const name: string | null = googleUser.name ?? null;
    const photo: string | null = googleUser.photo ?? null;

    return createGoogleAuthUser(id, email, name, photo);
  } catch (error: any) {
    // Re-throw cancellation and known codes so the UI can react appropriately
    throw error;
  }
}

/**
 * Sign out from Google (native).
 * Called alongside clearAuthUser() in AuthContext.
 */
export async function signOutGoogle(): Promise<void> {
  try {
    ensureConfigured();
    await GoogleSignin.signOut();
  } catch {
    // Best-effort — don't block app sign-out if Google sign-out fails
  }
}
