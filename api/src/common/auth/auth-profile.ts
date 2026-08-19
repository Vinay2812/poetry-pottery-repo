export interface AuthProfile {
  email: string;
  name: string | null;
}

export interface AuthProvisionRequest {
  authId: string;
  loadProfile: () => Promise<AuthProfile>;
}
