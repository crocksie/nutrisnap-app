-- Migration: Add goal-setting columns to profiles table
-- Created: 2024
-- Purpose: Support the goal-setting functionality in the Profile.tsx component

-- Add goal-related columns to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_calories INTEGER,
ADD COLUMN IF NOT EXISTS daily_protein INTEGER,
ADD COLUMN IF NOT EXISTS daily_carbs INTEGER,
ADD COLUMN IF NOT EXISTS daily_fat INTEGER,
ADD COLUMN IF NOT EXISTS daily_fiber INTEGER,
ADD COLUMN IF NOT EXISTS daily_water INTEGER,
ADD COLUMN IF NOT EXISTS weight_goal DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS goal_type TEXT CHECK (goal_type IN ('lose', 'maintain', 'gain'));

-- Add comments to document the new columns
COMMENT ON COLUMN profiles.daily_calories IS 'Daily calorie target for the user';
COMMENT ON COLUMN profiles.daily_protein IS 'Daily protein target in grams';
COMMENT ON COLUMN profiles.daily_carbs IS 'Daily carbohydrate target in grams';
COMMENT ON COLUMN profiles.daily_fat IS 'Daily fat target in grams';
COMMENT ON COLUMN profiles.daily_fiber IS 'Daily fiber target in grams';
COMMENT ON COLUMN profiles.daily_water IS 'Daily water target in milliliters';
COMMENT ON COLUMN profiles.weight_goal IS 'Target weight in kilograms';
COMMENT ON COLUMN profiles.goal_type IS 'Primary fitness goal: lose, maintain, or gain weight';

-- Create an index on goal_type for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_goal_type ON profiles(goal_type);

-- Update RLS (Row Level Security) policies if they exist
-- Note: This assumes RLS is already set up for the profiles table
-- You may need to adjust these policies based on your existing RLS setup

-- Allow users to update their own goals
-- This policy may already exist for the profiles table, so we use CREATE POLICY IF NOT EXISTS
-- or you can modify existing policies to include the new columns

-- Example policy (adjust as needed based on existing policies):
-- CREATE POLICY IF NOT EXISTS "Users can update own profile and goals" ON profiles
--   FOR ALL USING (auth.uid() = id);

-- Verify the migration by checking the table structure
-- This is a comment for verification, not executable SQL
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position;
