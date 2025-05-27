-- ========================================================================
-- NUTRISNAP APP - COMPLETE DATABASE SETUP FROM SCRATCH
-- ========================================================================
-- This script creates a complete database schema for the NutriSnap application
-- Run this in Supabase SQL Editor to set up everything from scratch
-- ========================================================================

-- 🧹 CLEANUP: Drop existing tables if they exist (CAUTION: This deletes all data)
-- Uncomment the lines below ONLY if you want to start completely fresh
-- DROP TABLE IF EXISTS meals CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ========================================================================
-- 📊 PROFILES TABLE - User information and nutrition goals
-- ========================================================================

CREATE TABLE IF NOT EXISTS profiles (
    -- Primary identification
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- Basic profile information
    email TEXT,
    username TEXT,
    name TEXT,
    
    -- Personal metrics
    dob DATE,
    weight NUMERIC(5,2), -- Weight in kg (e.g., 70.50)
    height NUMERIC(5,2), -- Height in cm (e.g., 175.50)
    age INTEGER,
    sex TEXT CHECK (sex IN ('male', 'female', 'other')),
    activity TEXT CHECK (activity IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    
    -- Daily nutrition goals
    daily_calories INTEGER,
    daily_protein INTEGER, -- grams
    daily_carbs INTEGER,   -- grams  
    daily_fat INTEGER,     -- grams
    daily_fiber INTEGER,   -- grams
    daily_water INTEGER,   -- milliliters
    
    -- Weight management goals
    weight_goal NUMERIC(5,2), -- Target weight in kg
    goal_type TEXT CHECK (goal_type IN ('lose', 'maintain', 'gain')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 🍽️ MEALS TABLE - Food logging with comprehensive nutrition data
-- ========================================================================

CREATE TABLE IF NOT EXISTS meals (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Meal information
    date DATE NOT NULL,
    food_description TEXT NOT NULL,
    
    -- Amount and basic nutrition
    amount INTEGER DEFAULT 100, -- Amount in grams
    calories NUMERIC(8,2) NOT NULL,
    
    -- Macronutrients (in grams)
    protein NUMERIC(8,2) DEFAULT 0,
    carbs NUMERIC(8,2) DEFAULT 0,
    fat NUMERIC(8,2) DEFAULT 0,
    
    -- Additional nutrients
    fibre NUMERIC(8,2) DEFAULT 0, -- British spelling to match your app
    water NUMERIC(8,2) DEFAULT 0, -- Water content in grams/ml
    
    -- Micronutrients (flexible JSON storage)
    micros JSONB DEFAULT '{}',
    
    -- Meal metadata
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    source TEXT DEFAULT 'ai_analysis', -- 'ai_analysis', 'manual_entry', 'database_search'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================================
-- 📊 INDEXES FOR PERFORMANCE
-- ========================================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_goal_type ON profiles(goal_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Meals table indexes  
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at);
CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);

-- JSONB index for micronutrient searches
CREATE INDEX IF NOT EXISTS idx_meals_micros_gin ON meals USING GIN(micros);

-- ========================================================================
-- 🔒 ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

-- Enable RLS on both tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Profiles policies: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- Meals policies: Users can only access their own meals
CREATE POLICY "Users can view own meals" ON meals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" ON meals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals" ON meals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON meals
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================================================
-- 🏷️ HELPFUL COMMENTS FOR COLUMNS
-- ========================================================================

-- Profiles table comments
COMMENT ON TABLE profiles IS 'User profiles with personal information and nutrition goals';
COMMENT ON COLUMN profiles.id IS 'User ID from Supabase Auth';
COMMENT ON COLUMN profiles.daily_calories IS 'Daily calorie target for the user';
COMMENT ON COLUMN profiles.daily_protein IS 'Daily protein target in grams';
COMMENT ON COLUMN profiles.daily_carbs IS 'Daily carbohydrate target in grams';
COMMENT ON COLUMN profiles.daily_fat IS 'Daily fat target in grams';
COMMENT ON COLUMN profiles.daily_fiber IS 'Daily fiber target in grams';
COMMENT ON COLUMN profiles.daily_water IS 'Daily water target in milliliters';
COMMENT ON COLUMN profiles.weight_goal IS 'Target weight in kilograms';
COMMENT ON COLUMN profiles.goal_type IS 'Primary fitness goal: lose, maintain, or gain weight';

-- Meals table comments
COMMENT ON TABLE meals IS 'Food logs with comprehensive nutrition information';
COMMENT ON COLUMN meals.amount IS 'Amount/serving size of the food item in grams';
COMMENT ON COLUMN meals.calories IS 'Total calories for this serving';
COMMENT ON COLUMN meals.protein IS 'Protein content in grams';
COMMENT ON COLUMN meals.carbs IS 'Carbohydrate content in grams';
COMMENT ON COLUMN meals.fat IS 'Fat content in grams';
COMMENT ON COLUMN meals.fibre IS 'Dietary fiber content in grams';
COMMENT ON COLUMN meals.water IS 'Water content in grams/milliliters';
COMMENT ON COLUMN meals.micros IS 'Micronutrients stored as JSON (vitamins, minerals, etc.)';
COMMENT ON COLUMN meals.source IS 'How the meal was added: ai_analysis, manual_entry, or database_search';

-- ========================================================================
-- 🧪 INSERT SAMPLE DATA (Optional - for testing)
-- ========================================================================

-- Sample profile (will only work if you're authenticated and the ID matches your auth user)
-- INSERT INTO profiles (id, email, name, daily_calories, daily_protein, daily_carbs, daily_fat, goal_type)
-- VALUES (
--     auth.uid(), 
--     'user@example.com', 
--     'Test User', 
--     2000, 
--     150, 
--     250, 
--     65, 
--     'maintain'
-- ) ON CONFLICT (id) DO NOTHING;

-- Sample meal (will only work if you're authenticated)
-- INSERT INTO meals (user_id, date, food_description, calories, protein, carbs, fat, amount, micros)
-- VALUES (
--     auth.uid(),
--     CURRENT_DATE,
--     'Apple (medium)',
--     95,
--     0.5,
--     25,
--     0.3,
--     150,
--     '{"vitamin_c": "8.4mg", "potassium": "195mg", "fiber": "4.0g"}'
-- );

-- ========================================================================
-- ✅ VERIFICATION QUERIES
-- ========================================================================

-- Check table structures
SELECT 'profiles' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

SELECT 'meals' as table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'meals' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'meals')
ORDER BY tablename, policyname;

-- Check indexes
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('profiles', 'meals')
ORDER BY tablename, indexname;

-- ========================================================================
-- 🎯 SETUP COMPLETE!
-- ========================================================================

-- Your NutriSnap database is now ready with:
-- ✅ Comprehensive user profiles with nutrition goals
-- ✅ Detailed meal logging with macros, micros, and flexible nutrition data
-- ✅ Proper security policies (users can only access their own data)
-- ✅ Optimized indexes for performance
-- ✅ Support for all your app features:
--    - Real AI food recognition and logging
--    - Amount editing with nutrition recalculation  
--    - Goal setting and progress tracking
--    - Meal history and analytics
--    - Dashboard with daily totals
--    - Profile management with BMR calculations

-- 🚀 NEXT STEPS:
-- 1. Run this script in your Supabase SQL Editor
-- 2. Test your app at http://localhost:5175
-- 3. Try uploading food, setting goals, and viewing history
-- 4. All features should now work with real database integration!
