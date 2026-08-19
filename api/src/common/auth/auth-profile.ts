import type { AuthProvider } from "@prisma/client";

export interface AuthProfile {
  email: string;
  name: string | null;
}

export interface AuthProvisionRequest {
  provider: AuthProvider;
  authId: string;
  loadProfile: () => Promise<AuthProfile>;
}
