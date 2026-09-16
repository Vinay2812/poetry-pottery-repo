-- CreateTable
CREATE TABLE "batch_notifications" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "token" TEXT NOT NULL,
    "notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "batch_notifications_token_key" ON "batch_notifications"("token");

-- CreateIndex
CREATE INDEX "batch_notifications_product_id_notified_at_idx" ON "batch_notifications"("product_id", "notified_at");

-- CreateIndex
CREATE UNIQUE INDEX "batch_notifications_email_product_id_key" ON "batch_notifications"("email", "product_id");

-- AddForeignKey
ALTER TABLE "batch_notifications" ADD CONSTRAINT "batch_notifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_notifications" ADD CONSTRAINT "batch_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
