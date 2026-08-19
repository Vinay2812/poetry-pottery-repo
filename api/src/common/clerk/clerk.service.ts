import { clerkClient } from "@clerk/express";
import { Injectable } from "@nestjs/common";
import { AuthProvider } from "@prisma/client";

import type { AuthProfile } from "@/common/auth/auth-profile";
import type { AppRequest } from "@/common/types/express";
import { readAuthId } from "./clerk.util";

// Typed wrapper around the Clerk SDK so the rest of the app never touches it directly.
@Injectable()
export class ClerkService {
  readonly provider: AuthProvider = AuthProvider.CLERK;

  getAuthId(request: AppRequest): string | null {
    return readAuthId(request);
  }

  async fetchProfile(authId: string): Promise<AuthProfile> {
    const user = await clerkClient.users.getUser(authId);
    const primaryEmail =
      user.emailAddresses.find(
        (address) => address.id === user.primaryEmailAddressId,
      ) ?? user.emailAddresses[0];
    const composedName = [user.firstName, user.lastName]
      .filter((part): part is string => part !== null && part.length > 0)
      .join(" ");

    return {
      email: primaryEmail?.emailAddress ?? `${authId}@users.noreply.clerk.dev`,
      name: user.fullName ?? (composedName.length > 0 ? composedName : null),
    };
  }
}
