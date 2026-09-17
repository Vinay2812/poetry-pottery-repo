CREATE TABLE "confirmed_uploads" (
    "key" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "confirmed_uploads_pkey" PRIMARY KEY ("key")
);
