-- AlterTable
ALTER TABLE "studio_visits" ADD COLUMN "cancelled_at" TIMESTAMP(3);

-- The plain unique held a cancelled window closed forever. A partial unique keeps the
-- race on the live rows only, so a cancelled window goes back on offer.
DROP INDEX "studio_visits_starts_at_key";

CREATE UNIQUE INDEX "studio_visits_live_starts_at_key" ON "studio_visits"("starts_at") WHERE "cancelled_at" IS NULL;
