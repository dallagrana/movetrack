-- migration.sql: Cost Control + Box Tracking
-- Run this in the Supabase SQL editor after the initial setup (exempledb.sql, seed.sql, rls.sql)

-- ──────────────────────────────────────────────
-- 1. Expenses table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 2. Box tracking — add box_id to inventory
--    (inventory table was created in exempledb.sql)
-- ──────────────────────────────────────────────
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS box_id      TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS box_number  INTEGER;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS room_name   TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS is_fragile  BOOLEAN NOT NULL DEFAULT FALSE;
