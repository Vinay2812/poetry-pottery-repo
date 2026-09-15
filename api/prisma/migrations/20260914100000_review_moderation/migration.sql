ALTER TABLE "reviews" ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "reviews_is_hidden_created_at_idx" ON "reviews" ("is_hidden", "created_at");
