-- The original verification migration may already have been applied before
-- its backfill statement was added. Verify only accounts created before that
-- migration so newer signups still need to confirm their email.
UPDATE "users"
SET "email_verified_at" = "created_at"
WHERE "email_verified_at" IS NULL
  AND "created_at" < TIMESTAMP '2026-11-08 12:00:00';
