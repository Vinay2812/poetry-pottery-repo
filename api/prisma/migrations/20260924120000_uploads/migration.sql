-- CreateEnum
CREATE TYPE "UploadPurpose" AS ENUM ('PRODUCT', 'CATEGORY', 'GLAZE', 'COLLECTION', 'EVENT', 'HERO', 'CONTENT', 'REVIEW', 'ORDER_NOTE', 'REFERENCE');

-- CreateTable
CREATE TABLE "uploads" (
    "key" TEXT NOT NULL,
    "owner_id" INTEGER,
    "purpose" "UploadPurpose" NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "confirmed_at" TIMESTAMP(3),
    "claimed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "uploads_owner_id_purpose_idx" ON "uploads"("owner_id", "purpose");

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Console images confirmed before this table existed have no expiry job and may already be on the
-- site, so they carry over as confirmed and claimed; nothing can ever sweep them.
INSERT INTO "uploads" ("key", "purpose", "width", "height", "bytes", "confirmed_at", "claimed_at", "created_at")
SELECT "key", "purpose"::"UploadPurpose", "width", "height", "bytes", "created_at", "created_at", "created_at"
FROM "confirmed_uploads";

-- DropTable
DROP TABLE "confirmed_uploads";
