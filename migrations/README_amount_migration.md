# Database Migration: Amount Column

## Overview

This migration adds the `amount` column to the `meals` table to support editable food amounts in the NutriSnap application.

## Files

- `add_amount_column_to_meals.sql` - Main migration script  
- `verify_amount_column.sql` - Verification script to check migration success
- `README_amount_migration.md` - This documentation file

## Column Added

The migration adds the following column to the `meals` table:

| Column Name | Data Type | Description |
|-------------|-----------|-------------|
| `amount` | INTEGER | Amount/serving size of the food item in grams (default: 100) |

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `add_amount_column_to_meals.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration
6. Run the verification script from `verify_amount_column.sql` to confirm success

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd "d:\Projects\Food Tracker from scratch\nutrisnap-app"

# Apply the migration manually:
supabase db sql --file migrations/add_amount_column_to_meals.sql
```

### Option 3: Using a Database Client

If you have a PostgreSQL client (like pgAdmin, DBeaver, etc.):

1. Connect to your Supabase database using the connection details from your Supabase dashboard
2. Open and execute the `add_amount_column_to_meals.sql` file

## Verification

After running the migration, execute the `verify_amount_column.sql` script to ensure the column was added correctly. You should see:

- The `amount` column in the meals table
- Default value of 100 for existing records

## Expected Output

The verification query should return something like:

```
column_name | data_type | is_nullable | column_default
------------|-----------|-------------|---------------
amount      | integer   | YES         | 100
```

## Testing

After the migration:

1. Start your NutriSnap application
2. Navigate to the Upload Food page
3. Upload an image and get nutrition data
4. Try editing the amount (grams) and verify nutrition values update automatically
5. Log the meal and verify the amount is stored correctly
6. Edit a logged meal and verify the amount field is editable

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove the amount column (use with caution!)
ALTER TABLE meals DROP COLUMN IF EXISTS amount;
```

## Notes

- The amount column is nullable with a default value of 100 grams
- Existing records are updated to have the default amount value
- The migration is idempotent (safe to run multiple times) due to the `IF NOT EXISTS` clause
- This migration supports the amount editing functionality in `UploadFood.tsx`
