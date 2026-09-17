import { NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

// Two admins on the same list is routine, so a write aimed at a row someone else already
// deleted answers "not found" rather than a 500. P2025 is the row itself, P2003 its parent.
export function rethrowMissing(message: string): (error: unknown) => never {
  return (error: unknown): never => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2025" || error.code === "P2003")
    ) {
      throw new NotFoundException(message);
    }
    throw error;
  };
}
