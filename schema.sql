-- =====================================================================
-- Job Board Web Application — Database Schema
-- Platform: Supabase (PostgreSQL)
-- =====================================================================
-- This file defines the structure of the database. Run it on a fresh
-- Supabase/Postgres database to recreate all tables, relationships,
-- and Row Level Security policies. It does NOT contain any actual data.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. JOBS TABLE
-- Stores all job listings posted on the platform.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS jobs (
    id           BIGSERIAL PRIMARY KEY,
    title        TEXT       NOT NULL,
    description  TEXT,
    company      TEXT,
    location     TEXT,
    salary       NUMERIC,
    created_at   TIMESTAMP  NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------
-- 2. USERS TABLE
-- Stores registered users (job seekers and employers).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    full_name   TEXT       NOT NULL,
    email       TEXT       NOT NULL UNIQUE,
    role        TEXT       NOT NULL CHECK (role IN ('seeker', 'employer')),
    created_at  TIMESTAMP  NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------
-- 3. COMPANIES TABLE
-- Stores information about companies that post job listings.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT       NOT NULL,
    industry    TEXT,
    website     TEXT,
    created_at  TIMESTAMP  NOT NULL DEFAULT NOW()
);


-- ---------------------------------------------------------------------
-- 4. APPLICATIONS TABLE
-- Stores job applications. Links users and jobs via foreign keys.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id      BIGINT      NOT NULL REFERENCES jobs(id)  ON DELETE CASCADE,
    status      TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Helpful indexes for the foreign keys (speeds up lookups/joins)
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id  ON applications(job_id);


-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================

ALTER TABLE jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;


-- Read policies: anyone can read
CREATE POLICY "Enable read access for all users"
    ON jobs FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users"
    ON users FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users"
    ON companies FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users"
    ON applications FOR SELECT USING (true);


-- Write policies: only authenticated users can insert
CREATE POLICY "Enable insert for authenticated users only"
    ON jobs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only"
    ON users FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only"
    ON companies FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only"
    ON applications FOR INSERT TO authenticated WITH CHECK (true);


-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
