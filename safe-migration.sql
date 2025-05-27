-- Safe Migration Script - Only adds columns that don't exist
-- Run this in Supabase SQL Editor

-- First, let's check what columns already exist
-- (This is just for information - you can run this separately to see current schema)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'meals' 
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position;

-- Safe migration for meals table - add columns only if they don't exist
DO $$ 
BEGIN
    -- Add amount column to meals table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meals' AND column_name='amount') THEN
        ALTER TABLE meals ADD COLUMN amount INTEGER DEFAULT 100;
        COMMENT ON COLUMN meals.amount IS 'Amount/serving size of the food item in grams';
    END IF;
    
    -- Add fibre column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meals' AND column_name='fibre') THEN
        ALTER TABLE meals ADD COLUMN fibre NUMERIC;
    END IF;
    
    -- Add water column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meals' AND column_name='water') THEN
        ALTER TABLE meals ADD COLUMN water NUMERIC;
    END IF;
    
    -- Add micros column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meals' AND column_name='micros') THEN
        ALTER TABLE meals ADD COLUMN micros JSONB;
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meals' AND column_name='created_at') THEN
        ALTER TABLE meals ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    RAISE NOTICE 'Meals table migration completed successfully';
END $$;

-- Safe migration for profiles table - add columns only if they don't exist
DO $$ 
BEGIN
    -- Add basic profile columns if they don't exist (skip 'name' since it already exists)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='dob') THEN
        ALTER TABLE profiles ADD COLUMN dob DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='weight') THEN
        ALTER TABLE profiles ADD COLUMN weight NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='height') THEN
        ALTER TABLE profiles ADD COLUMN height NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='age') THEN
        ALTER TABLE profiles ADD COLUMN age INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='sex') THEN
        ALTER TABLE profiles ADD COLUMN sex TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='activity') THEN
        ALTER TABLE profiles ADD COLUMN activity TEXT;
    END IF;
    
    -- Add goal-setting columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='daily_calories') THEN
        ALTER TABLE profiles ADD COLUMN daily_calories INTEGER;
        COMMENT ON COLUMN profiles.daily_calories IS 'Daily calorie target for the user';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='daily_protein') THEN
        ALTER TABLE profiles ADD COLUMN daily_protein INTEGER;
        COMMENT ON COLUMN profiles.daily_protein IS 'Daily protein target in grams';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='daily_carbs') THEN
        ALTER TABLE profiles ADD COLUMN daily_carbs INTEGER;
        COMMENT ON COLUMN profiles.daily_carbs IS 'Daily carbohydrate target in grams';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='daily_fat') THEN
        ALTER TABLE profiles ADD COLUMN daily_fat INTEGER;
        COMMENT ON COLUMN profiles.daily_fat IS 'Daily fat target in grams';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='daily_fiber') THEN
        ALTER TABLE profiles ADD COLUMN daily_fiber INTEGER;
        COMMENT ON COLUMN profiles.daily_fiber IS 'Daily fiber target in grams';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='daily_water') THEN
        ALTER TABLE profiles ADD COLUMN daily_water INTEGER;
        COMMENT ON COLUMN profiles.daily_water IS 'Daily water target in milliliters';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='weight_goal') THEN
        ALTER TABLE profiles ADD COLUMN weight_goal DECIMAL(5,2);
        COMMENT ON COLUMN profiles.weight_goal IS 'Target weight in kilograms';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='goal_type') THEN
        ALTER TABLE profiles ADD COLUMN goal_type TEXT CHECK (goal_type IN ('lose', 'maintain', 'gain'));
        COMMENT ON COLUMN profiles.goal_type IS 'Primary fitness goal: lose, maintain, or gain weight';
    END IF;
    
    RAISE NOTICE 'Profiles table migration completed successfully';
END $$;

-- Create index on goal_type for better query performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_goal_type ON profiles(goal_type);

-- Update existing records to have default amount if null
UPDATE meals SET amount = 100 WHERE amount IS NULL;

-- Final verification queries (run these to check what was added)
SELECT 'meals' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'meals' 
ORDER BY ordinal_position;

SELECT 'profiles' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
