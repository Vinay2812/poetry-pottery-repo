-- The slot backfill carried each old booking as one block; bookings count one row per studio hour.
INSERT INTO "workshop_booking_slots" ("booking_id", "starts_at", "ends_at")
SELECT
  s."booking_id",
  g.starts_at,
  LEAST(g.starts_at + c."slot_minutes" * INTERVAL '1 minute', s."ends_at")
FROM "workshop_booking_slots" s
JOIN "workshop_bookings" b ON b."id" = s."booking_id"
JOIN "workshop_configs" c ON c."id" = b."config_id"
CROSS JOIN LATERAL generate_series(
  s."starts_at",
  s."ends_at" - INTERVAL '1 millisecond',
  c."slot_minutes" * INTERVAL '1 minute'
) AS g(starts_at)
WHERE s."ends_at" - s."starts_at" > c."slot_minutes" * INTERVAL '1 minute'
  AND g.starts_at > s."starts_at"
ON CONFLICT ("booking_id", "starts_at") DO NOTHING;

UPDATE "workshop_booking_slots" s
SET "ends_at" = s."starts_at" + c."slot_minutes" * INTERVAL '1 minute'
FROM "workshop_bookings" b
JOIN "workshop_configs" c ON c."id" = b."config_id"
WHERE b."id" = s."booking_id"
  AND s."ends_at" - s."starts_at" > c."slot_minutes" * INTERVAL '1 minute';
