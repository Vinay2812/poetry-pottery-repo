import { Prisma } from "@prisma/client";

// What Prisma throws when the row a write aimed at is already gone.
export function missingRow(
  code: "P2025" | "P2003" = "P2025",
): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Record not found", {
    code,
    clientVersion: "7.9.1",
  });
}
