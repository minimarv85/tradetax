-- ============================================================================
-- SUPABASE DATABASE SETUP FOR TRADETAX
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- Step 1: Add user_id column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users;

-- Step 2: Add user_id column to mileage_trips table
ALTER TABLE mileage_trips ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users;

-- Step 3: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mileage_trips_user_id ON mileage_trips(user_id);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_trips ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop old policies if they exist
DROP POLICY IF EXISTS "Users can CRUD own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can CRUD own mileage" ON mileage_trips;

-- Step 6: Create policies for user data isolation
-- Each user can only see/edit their own data
CREATE POLICY "Users can CRUD own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own mileage" ON mileage_trips
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- WHAT THIS DOES:
-- - Each user's data is private to them
-- - Data syncs to cloud when logged in
-- - Switch devices = data follows you
-- - Multi-device support enabled
-- ============================================================================

-- Run all the above in Supabase SQL Editor and click "Run"
