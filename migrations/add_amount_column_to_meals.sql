-- Migration: Add amount column to meals table
-- Created: 2024
-- Purpose: Support the editable food amount functionality in the UploadFood.tsx component

-- Add amount column to the meals table
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 100;

-- Add comment to document the new column
COMMENT ON COLUMN meals.amount IS 'Amount/serving size of the food item in grams';

-- Update existing records to have default amount if null
UPDATE meals SET amount = 100 WHERE amount IS NULL;

-- Verify the migration by checking the table structure
-- This is a comment for verification, not executable SQL
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'meals' 
-- ORDER BY ordinal_position;
