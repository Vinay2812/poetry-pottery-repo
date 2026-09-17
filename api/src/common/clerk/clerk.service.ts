import { clerkClient, User as ClerkUser } from "@clerk/express";
import { Injectable } from "@nestjs/common";

import { SessionClaims } from "./clerk.type";

// Typed wrapper around the Clerk SDK so the rest of the app never touches it directly.
@Injectable()
export class ClerkService {
  getPrimaryEmail(user: ClerkUser): string | undefined {
    return (
      user.emailAddresses.find(
        (address) => address.id === user.primaryEmailAddressId,
      )?.emailAddress ?? user.emailAddresses[0]?.emailAddress
    );
  }

  // Only a verified primary address proves the caller owns that mailbox, so a secondary or
  // unverified one is never allowed to claim an account that already holds the email.
  hasVerifiedPrimaryEmail(user: ClerkUser): boolean {
    const primary = user.emailAddresses.find(
      (address) => address.id === user.primaryEmailAddressId,
    );
    return primary?.verification?.status === "verified";
  }

  getFullName(user: ClerkUser): string | undefined {
    if (user.fullName) {
      return user.fullName;
    }
    const composed = [user.firstName, user.lastName]
      .map((part) => part?.trim() ?? "")
      .filter((part) => part.length > 0)
      .join(" ");
    return composed.length > 0 ? composed : undefined;
  }

  getImageUrl(user: ClerkUser): string | undefined {
    return user.imageUrl;
  }

  async getUser(authId: string): Promise<ClerkUser> {
    const user = await clerkClient.users.getUser(authId);
    return user;
  }

  async updatePublicMetadata(
    authId: string,
    metadata: SessionClaims,
  ): Promise<void> {
    await clerkClient.users.updateUserMetadata(authId, {
      publicMetadata: {
        dbUserId: metadata.dbUserId,
        role: metadata.role,
      },
    });
  }
}
