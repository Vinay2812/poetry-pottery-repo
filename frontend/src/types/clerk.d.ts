import type { UserRole } from "@/graphql/generated/graphql";

declare global {
  // Written by the API auth guard; absent until the first authenticated API call provisions the user.
  interface UserPublicMetadata {
    dbUserId?: number;
    role?: UserRole;
  }
}

export {};
