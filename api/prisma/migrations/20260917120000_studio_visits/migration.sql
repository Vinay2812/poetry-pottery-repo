-- CreateTable
CREATE TABLE "studio_visits" (
    "id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "note" TEXT,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "studio_visits_pkey" PRIMARY KEY ("id")
);

-- One visitor per window; the unique start is what two simultaneous bookings race for.
CREATE UNIQUE INDEX "studio_visits_starts_at_key" ON "studio_visits"("starts_at");

-- CreateIndex
CREATE INDEX "studio_visits_starts_at_idx" ON "studio_visits"("starts_at");

-- CreateIndex
CREATE INDEX "studio_visits_user_id_idx" ON "studio_visits"("user_id");

-- AddForeignKey
ALTER TABLE "studio_visits" ADD CONSTRAINT "studio_visits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
