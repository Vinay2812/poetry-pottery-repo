import { clerkClient } from "@clerk/express";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";

import { env } from "@/config/env";

// Promotes a user who has signed in at least once: `pnpm make-admin you@example.com`.
async function main(): Promise<void> {
  const email = process.argv[2];
  if (!email) {
    throw new Error("Usage: pnpm make-admin <email>");
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: UserRole.ADMIN },
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
