-- AlterTable
ALTER TABLE "workshop_configs" ADD COLUMN "slot_span_days" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "workshop_booking_slots" (
    "id" SERIAL NOT NULL,
    "booking_id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshop_booking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workshop_booking_slots_starts_at_idx" ON "workshop_booking_slots"("starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "workshop_booking_slots_booking_id_starts_at_key" ON "workshop_booking_slots"("booking_id", "starts_at");

-- AddForeignKey
ALTER TABLE "workshop_booking_slots" ADD CONSTRAINT "workshop_booking_slots_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "workshop_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing bookings held one contiguous block; carry it over as a single slot.
INSERT INTO "workshop_booking_slots" ("booking_id", "starts_at", "ends_at")
SELECT "id", "starts_at", "ends_at" FROM "workshop_bookings";
