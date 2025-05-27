-- Verification script: Check if goal columns exist in profiles table
-- Run this after the migration to verify it was successful

SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN (
    'daily_calories', 
    'daily_protein', 
    'daily_carbs', 
    'daily_fat', 
    'daily_fiber', 
    'daily_water', 
    'weight_goal', 
    'goal_type'
  )
ORDER BY column_name;

-- Also check if the goal_type constraint was created properly
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%goal_type%';

-- Check if the index was created
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
  AND indexname = 'idx_profiles_goal_type';
