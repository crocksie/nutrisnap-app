-- Quick Schema Check - Run this first to see current database schema
-- Copy and paste this in Supabase SQL Editor

-- Check current meals table structure
SELECT 
    'meals' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'meals' 
ORDER BY ordinal_position;

-- Check current profiles table structure  
SELECT 
    'profiles' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
