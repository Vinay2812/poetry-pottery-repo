-- AlterTable
ALTER TABLE "products" ADD COLUMN "is_second" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN "flaw_note" TEXT;
