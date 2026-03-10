-- Row Level Security Policies
-- Run this in your Supabase SQL Editor AFTER exempledb.sql and seed.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/write their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Tasks: users can only CRUD their own tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Inventory: users can only CRUD their own inventory
CREATE POLICY "Users can view own inventory"
  ON inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
  ON inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory"
  ON inventory FOR DELETE
  USING (auth.uid() = user_id);

-- Categories: public read (no RLS needed, or open policy)
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);
