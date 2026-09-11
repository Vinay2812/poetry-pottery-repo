import { clerkClient } from "@clerk/express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";

import { env } from "@/config/env";

// Promotes a Clerk user to admin, creating the database row if needed: `pnpm make-admin you@example.com`.
async function main(): Promise<void> {
  const email = process.argv[2];
  if (!email) {
    throw new Error("Usage: pnpm make-admin <email>");
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });
  try {
    // Sign-in alone does not create the database row, so resolve the Clerk user and upsert.
    const { data: matches } = await clerkClient.users.getUserList({
      emailAddress: [email],
    });
    const clerkUser = matches[0];
    if (!clerkUser || matches.length !== 1) {
      throw new Error(`Expected exactly one Clerk user for ${email}`);
    }
    const user = await prisma.user.upsert({
      where: { auth_id: clerkUser.id },
      create: { auth_id: clerkUser.id, email, role: UserRole.ADMIN },
      update: { role: UserRole.ADMIN },
    });
    await clerkClient.users.updateUserMetadata(user.auth_id, {
      publicMetadata: { dbUserId: user.id, role: user.role },
    });
    process.stdout.write(`${email} is now an admin\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
