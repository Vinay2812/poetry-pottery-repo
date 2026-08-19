import type { UserRole } from "@prisma/client";

declare global {
  // Clerk merges this into the session token claims; both fields are absent until the guard provisions the user.
  interface CustomJwtSessionClaims {
    dbUserId?: number;
    role?: UserRole;
  }
}

export {};
