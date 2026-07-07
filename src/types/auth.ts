export type AuthProvider = "email" | "google";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: AuthProvider;
  photoURL?: string;   // Google profile photo URL (populated for Google Sign-In)
  avatarSeed: number;
  createdAt: string;
}

