-- Trigram matching on names and titles, so a prefix or a near spelling still finds the piece.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "products_name_trgm_idx" ON "products" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "events_title_trgm_idx" ON "events" USING GIN ("title" gin_trgm_ops);
