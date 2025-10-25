-- fitness-project: showcase schema (PostgreSQL)
-- Generated: 2025-10-25
-- Purpose: Display-only schema for the repository. You can run this in pgAdmin4
-- to create a demo-compatible database structure.

-- Notes:
-- - This mirrors the fields used by the Express API routes in server/routes/*.
-- - Uses SERIAL integer keys for simplicity. Adjust types/indexes as needed.
-- - Includes basic CHECK constraints and helpful indexes.

-- Optional: set your schema
-- CREATE SCHEMA IF NOT EXISTS fitness;
-- SET search_path TO fitness, public;

-- =========================
-- Users
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL, -- currently compared as plaintext in demo; replace with bcrypt hashes
  role          TEXT        DEFAULT 'Member',
  location      TEXT,
  avatar_url    TEXT,
  joined_at     TIMESTAMP   DEFAULT NOW()
);

-- =========================
-- Fitness profile (1:1 with users)
-- =========================
CREATE TABLE IF NOT EXISTS fitness_profile (
  user_id     INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  weight_kg   NUMERIC(6,2) CHECK (weight_kg IS NULL OR weight_kg >= 0),
  height_cm   NUMERIC(6,2) CHECK (height_cm IS NULL OR height_cm > 0),
  goal        TEXT,
  bmi         NUMERIC(5,2) CHECK (bmi IS NULL OR bmi >= 0),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- =========================
-- Workouts (N:1 users)
-- =========================
CREATE TABLE IF NOT EXISTS workouts (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT,
  name         TEXT NOT NULL,
  date         DATE NOT NULL,
  duration_min INT  CHECK (duration_min IS NULL OR duration_min >= 0),
  notes        TEXT
);

-- Helpful index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date DESC);

-- =========================
-- Workout exercises (N:1 workouts)
-- =========================
CREATE TABLE IF NOT EXISTS workout_exercises (
  id           SERIAL PRIMARY KEY,
  workout_id   INT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets         INT  CHECK (sets IS NULL OR sets >= 0),
  reps         INT  CHECK (reps IS NULL OR reps >= 0),
  weight_kg    NUMERIC(6,2) CHECK (weight_kg IS NULL OR weight_kg >= 0),
  duration_min INT  CHECK (duration_min IS NULL OR duration_min >= 0)
);

-- =========================
-- Steps logs (unique per user/day)
-- =========================
CREATE TABLE IF NOT EXISTS steps_logs (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_date        DATE NOT NULL,
  steps_count      INT NOT NULL CHECK (steps_count >= 0),
  distance_km      NUMERIC(8,3) DEFAULT 0 CHECK (distance_km >= 0),
  calories_burned  NUMERIC(8,2) DEFAULT 0 CHECK (calories_burned >= 0),
  CONSTRAINT uq_steps_user_date UNIQUE (user_id, step_date)
);

CREATE INDEX IF NOT EXISTS idx_steps_user_date ON steps_logs(user_id, step_date DESC);

-- =========================
-- Settings (1:1 with users)
-- =========================
CREATE TABLE IF NOT EXISTS settings (
  user_id       INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme         TEXT    DEFAULT 'Light',          -- Light | Dark | System Default
  language      TEXT    DEFAULT 'English',
  notifications JSONB   DEFAULT '{"emailAlerts":true, "smsNotifications":false}'
);

-- Optional: sample row creation can be done in a separate seed file.
-- See README for a demo user seed example.
