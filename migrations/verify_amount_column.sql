-- Verification script for amount column migration
-- Run this after applying add_amount_column_to_meals.sql

-- Check if the amount column was added correctly
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'meals' AND column_name = 'amount';

-- Verify table structure shows the amount column
\d meals;

-- Check if existing records have the default amount value
SELECT COUNT(*) as total_records, 
       COUNT(amount) as records_with_amount,
       AVG(amount) as average_amount
FROM meals;
