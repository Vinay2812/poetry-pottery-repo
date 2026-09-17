-- CreateTable
CREATE TABLE "glazes" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "variation_note" TEXT,
    "swatch_url" TEXT,
    "color_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "glazes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "glazes_slug_key" ON "glazes"("slug");

-- AlterTable
ALTER TABLE "products" ADD COLUMN "glaze_id" INTEGER,
ADD COLUMN "capacity_ml" INTEGER,
ADD COLUMN "height_cm" DECIMAL(5,1),
ADD COLUMN "diameter_cm" DECIMAL(5,1),
ADD COLUMN "weight_g" INTEGER,
ADD COLUMN "maker_note" TEXT;

-- CreateIndex
CREATE INDEX "products_glaze_id_idx" ON "products"("glaze_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_glaze_id_fkey" FOREIGN KEY ("glaze_id") REFERENCES "glazes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
