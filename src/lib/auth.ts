import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthProvider, AuthUser } from "@/types/auth";

const AUTH_STORAGE_KEY = "ecochain.authUser.v1";

const AVATAR_SEED_COUNT = 9;

function hash(input: string): number {
  return input.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "Eco User";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createAuthUser(email: string, provider: AuthProvider, name?: string): AuthUser {
  const cleanEmail = email.trim().toLowerCase();
  const displayName = name?.trim() || nameFromEmail(cleanEmail);

  return {
    id: `${provider}-${hash(`${provider}:${cleanEmail}`)}`,
    email: cleanEmail,
    name: displayName,
    provider,
    avatarSeed: hash(cleanEmail || provider) % AVATAR_SEED_COUNT,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create an AuthUser from a Google Sign-In response.
 * The `uid` is the stable Google user ID — used as the user's persistent ID.
 */
export function createGoogleAuthUser(
  uid: string,
  email: string,
  name: string | null,
  photoURL: string | null,
): AuthUser {
  const cleanEmail = email.trim().toLowerCase();
  const displayName = name?.trim() || nameFromEmail(cleanEmail);

  return {
    id: uid,
    email: cleanEmail,
    name: displayName,
    provider: "google",
    photoURL: photoURL ?? undefined,
    avatarSeed: hash(cleanEmail || uid) % AVATAR_SEED_COUNT,
    createdAt: new Date().toISOString(),
  };
}

export async function loadAuthUser(): Promise<AuthUser | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveAuthUser(user: AuthUser): Promise<void> {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export async function clearAuthUser(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}
