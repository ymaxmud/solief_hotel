#!/usr/bin/env bash
#
# Execute every migration against a throwaway PostgreSQL database and assert the
# resulting schema. Catches SQL that only looks correct when read.
#
# Requires a local PostgreSQL 16 (brew install postgresql@16). Supabase's own
# `supabase db start` needs Docker; this is the Docker-free equivalent and
# validates the same thing that matters: the SQL actually runs.
#
#   ./supabase/tests/run-migrations.sh
set -euo pipefail

export PATH="/opt/homebrew/opt/postgresql@16/bin:${PATH}"
# macOS ships a locale that makes the postmaster go multithreaded during
# startup, which Postgres refuses ("postmaster became multithreaded").
export LC_ALL=C
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PGDATA_DIR="${PGDATA_DIR:-${TMPDIR:-/tmp}/solief-migration-test}"
PORT="${PGPORT:-55432}"
DB="solief_migration_test"

cleanup() {
  pg_ctl -D "$PGDATA_DIR" -o "-p $PORT" stop -m immediate >/dev/null 2>&1 || true
  rm -rf "$PGDATA_DIR"
}
trap cleanup EXIT

echo "==> Starting throwaway PostgreSQL on port $PORT"
rm -rf "$PGDATA_DIR"
initdb -D "$PGDATA_DIR" -U postgres --no-locale --encoding=UTF8 >/dev/null
pg_ctl -D "$PGDATA_DIR" -o "-p $PORT -k /tmp" -l "$PGDATA_DIR/server.log" start >/dev/null
for _ in $(seq 1 30); do pg_isready -h /tmp -p "$PORT" >/dev/null 2>&1 && break; sleep 1; done

PSQL=(psql -h /tmp -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q)
"${PSQL[@]}" -d postgres -c "create database $DB;" >/dev/null

echo "==> Applying Supabase harness"
"${PSQL[@]}" -d "$DB" -f "$ROOT/supabase/tests/00_supabase_harness.sql" >/dev/null

echo "==> Applying migrations in order"
for file in "$ROOT"/supabase/migrations/*.sql; do
  echo "    $(basename "$file")"
  "${PSQL[@]}" -d "$DB" -f "$file" >/dev/null
done

echo "==> Applying seed"
"${PSQL[@]}" -d "$DB" -f "$ROOT/supabase/seed/seed.sql" >/dev/null

echo "==> Asserting resulting schema"
"${PSQL[@]}" -d "$DB" -f "$ROOT/supabase/tests/01_assertions.sql"

echo
echo "ALL MIGRATION ASSERTIONS PASSED"
