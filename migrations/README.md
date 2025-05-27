# Database Migration: Goal Setting Columns

## Overview

This migration adds goal-setting functionality to the NutriSnap application by adding the necessary columns to the `profiles` table in Supabase.

## Files

- `add_goal_columns_to_profiles.sql` - Main migration script
- `verify_goal_columns.sql` - Verification script to check migration success
- `README.md` - This documentation file

## Columns Added

The migration adds the following columns to the `profiles` table:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| `daily_calories` | INTEGER | Daily calorie target for the user |
| `daily_protein` | INTEGER | Daily protein target in grams |
| `daily_carbs` | INTEGER | Daily carbohydrate target in grams |
| `daily_fat` | INTEGER | Daily fat target in grams |
| `daily_fiber` | INTEGER | Daily fiber target in grams |
| `daily_water` | INTEGER | Daily water target in milliliters |
| `weight_goal` | DECIMAL(5,2) | Target weight in kilograms |
| `goal_type` | TEXT | Primary fitness goal: 'lose', 'maintain', or 'gain' |

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `add_goal_columns_to_profiles.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration
6. Run the verification script from `verify_goal_columns.sql` to confirm success

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd "d:\Projects\Food Tracker from scratch\nutrisnap-app"

# Apply the migration
supabase db reset --linked
# OR apply manually:
# supabase db run migrations/add_goal_columns_to_profiles.sql
```

### Option 3: Using a Database Client

If you have a PostgreSQL client (like pgAdmin, DBeaver, etc.):

1. Connect to your Supabase database using the connection details from your Supabase dashboard
2. Open and execute the `add_goal_columns_to_profiles.sql` file

## Verification

After running the migration, execute the `verify_goal_columns.sql` script to ensure all columns were added correctly. You should see:

- 8 new columns in the profiles table
- A check constraint on the `goal_type` column
- An index on the `goal_type` column

## Expected Output

The verification query should return something like:

```
column_name     | data_type | is_nullable | column_default
----------------|-----------|-------------|---------------
daily_calories  | integer   | YES         | 
daily_carbs     | integer   | YES         | 
daily_fat       | integer   | YES         | 
daily_fiber     | integer   | YES         | 
daily_protein   | integer   | YES         | 
daily_water     | integer   | YES         | 
goal_type       | text      | YES         | 
weight_goal     | numeric   | YES         | 
```

## Testing

After the migration:

1. Start your NutriSnap application
2. Navigate to the Profile page
3. Try setting nutrition goals and saving them
4. Verify that the data persists when you refresh the page

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove the added columns (use with caution!)
ALTER TABLE profiles 
DROP COLUMN IF EXISTS daily_calories,
DROP COLUMN IF EXISTS daily_protein,
DROP COLUMN IF EXISTS daily_carbs,
DROP COLUMN IF EXISTS daily_fat,
DROP COLUMN IF EXISTS daily_fiber,
DROP COLUMN IF EXISTS daily_water,
DROP COLUMN IF EXISTS weight_goal,
DROP COLUMN IF EXISTS goal_type;

-- Drop the index
DROP INDEX IF EXISTS idx_profiles_goal_type;
```

## Notes

- All new columns are nullable, so existing profiles won't be affected
- The `goal_type` column has a check constraint to ensure only valid values ('lose', 'maintain', 'gain') can be stored
- An index is created on `goal_type` for better query performance
- The migration is idempotent (safe to run multiple times) due to the `IF NOT EXISTS` clauses
