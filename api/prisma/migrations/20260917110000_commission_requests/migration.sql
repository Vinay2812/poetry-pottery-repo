-- AlterTable
ALTER TABLE "products" ADD COLUMN "is_commission" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "commission_requests" (
    "id" TEXT NOT NULL,
    "piece_type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "glaze" TEXT NOT NULL,
    "carved_words" TEXT,
    "notes" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "reference_image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commission_requests_is_read_created_at_idx" ON "commission_requests"("is_read", "created_at");

-- CreateIndex
CREATE INDEX "commission_requests_user_id_idx" ON "commission_requests"("user_id");

-- AddForeignKey
ALTER TABLE "commission_requests" ADD CONSTRAINT "commission_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
