import { UserRole } from "@prisma/client";

export type AuthUser = {
  db_user_id: number;
  role: UserRole;
  auth_id: string;
};

export type SessionClaims = {
  dbUserId: number;
  role: UserRole;
};
