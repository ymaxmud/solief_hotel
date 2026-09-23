-- Sweep stale public rate-limit counters.
--
-- This migration is deliberately NON-DESTRUCTIVE to business data. It touches
-- exactly one table, public_rate_limits, which holds ephemeral anti-spam
-- counters with hashed identifiers and no business meaning.
--
-- Removing the development seed data (sample staff, seeded room numbers) used to
-- live here. It was moved out because deciding whether a seeded record has since
-- been used for real hotel work is a judgement that must be previewed by a human
-- before anything is deleted — not something a migration should do silently on
-- deploy. That logic now lives in scripts/cleanup-demo-data.mjs, which previews
-- by default and only deletes with an explicit --apply flag.
--
-- Ongoing cleanup of this table already happens inside check_public_rate_limit(),
-- which drops rows older than 24 hours on every call, so no scheduled job is
-- needed. This one sweep clears anything left over from development.

delete from public.public_rate_limits where created_at < now() - interval '24 hours';
