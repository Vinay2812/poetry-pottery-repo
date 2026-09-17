-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "dispatch_days_min" INTEGER NOT NULL DEFAULT 7;
ALTER TABLE "site_settings" ADD COLUMN "dispatch_days_max" INTEGER NOT NULL DEFAULT 12;
