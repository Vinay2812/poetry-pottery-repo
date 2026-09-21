-- CreateEnum
CREATE TYPE "WhatsAppDirection" AS ENUM ('TO_STUDIO', 'TO_CUSTOMER');

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" SERIAL NOT NULL,
    "direction" "WhatsAppDirection" NOT NULL,
    "kind" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "page_url" TEXT,
    "user_id" INTEGER,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whatsapp_messages_created_at_idx" ON "whatsapp_messages"("created_at");

-- CreateIndex
CREATE INDEX "whatsapp_messages_user_id_idx" ON "whatsapp_messages"("user_id");

-- AddForeignKey
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
