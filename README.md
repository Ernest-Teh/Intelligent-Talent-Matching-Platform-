# Database

PostgreSQL schema for the CSIT314 job recommendation platform.
Deployed to Supabase.

## To apply this schema to a fresh database

1. Make sure these extensions are enabled:
   - pgcrypto
   - pg_trgm
   - unaccent

2. Run `schema.sql` in the SQL editor (or `psql -f schema.sql`).

## What's in here

- 12 tables + 1 view (v_active_membership)
- 8 ENUM types for fixed-domain columns
- Triggers that maintain search_text columns for fuzzy/keyword search
- Indexes for all filter columns and trigram GIN indexes for fuzzy search
