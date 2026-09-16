-- AlterTable
ALTER TABLE "orders" ADD COLUMN "gift_note" TEXT;
ALTER TABLE "orders" ADD COLUMN "hide_prices" BOOLEAN NOT NULL DEFAULT false;
