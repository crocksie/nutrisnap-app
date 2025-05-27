# 🚀 NutriSnap Database Setup from Scratch

This guide will help you set up your Supabase database completely from scratch to support all NutriSnap app functionality.

## 📋 Prerequisites

- ✅ Supabase project: `https://swgrbthpvxaxuwkhjuld.supabase.co`
- ✅ Frontend server running: `http://localhost:5175`
- ✅ Real AI integration enabled

## 🗃️ Database Setup Steps

### Step 1: Apply the Complete Database Schema

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Navigate to your project: `swgrbthpvxaxuwkhjuld`
   - Click on **SQL Editor** in the left sidebar

2. **Run the Setup Script**
   - Copy the entire contents of `complete-database-setup.sql`
   - Paste it into the SQL Editor
   - Click **"Run"** to execute the script

   This will create:
   - 📊 **Profiles table** - User info, nutrition goals, BMR data
   - 🍽️ **Meals table** - Food logs with comprehensive nutrition data
   - 🔒 **Security policies** - Row-level security for data protection
   - 📈 **Indexes** - Performance optimization
   - 🏷️ **Documentation** - Column comments and constraints

### Step 2: Verify the Setup

Run the verification script to ensure everything is working:

```bash
cd "d:\Projects\Food Tracker from scratch\nutrisnap-app"
node verify-database-setup.js
```

Expected output:
```
🔍 Verifying NutriSnap database setup...

📋 Testing meals table...
✅ Meals table accessible

👤 Testing profiles table...
✅ Profiles table accessible

🧪 Testing schema completeness...
   Testing meals table columns...
✅ All meals table columns present
   Testing profiles table columns...
✅ All profiles table columns present

🚀 Testing basic functionality...
✅ Row Level Security is properly configured

🎉 Database verification complete!
```

## 🧪 Test Your Application

### Test 1: Food Upload & AI Recognition
1. Open http://localhost:5175
2. Upload a food image
3. Verify AI analysis works with real Google Gemini Vision
4. Edit the amount and watch nutrition values update
5. Log the meal successfully

### Test 2: Profile & Goal Setting
1. Navigate to Profile page
2. Fill in personal information (weight, height, age, etc.)
3. Set nutrition goals (calories, protein, carbs, fat)
4. Save and verify data persists

### Test 3: Dashboard & History
1. Check Dashboard shows logged meals and progress
2. View History page for meal records
3. Edit logged meals and verify changes save

## 📊 Database Schema Overview

### Profiles Table
```sql
- id (UUID) - Supabase Auth user ID
- email, username, name - Basic info
- dob, weight, height, age, sex, activity - Personal metrics
- daily_calories, daily_protein, daily_carbs, daily_fat, daily_fiber, daily_water - Goals
- weight_goal, goal_type - Weight management
```

### Meals Table
```sql
- id (UUID) - Unique meal ID
- user_id (UUID) - Links to user
- date, food_description - Basic meal info
- amount - Serving size in grams
- calories, protein, carbs, fat, fibre, water - Nutrition data
- micros (JSONB) - Vitamins, minerals, etc.
- meal_type, source - Metadata
```

## 🔒 Security Features

- **Row Level Security**: Users can only access their own data
- **Auth Integration**: Seamless Supabase Auth integration
- **Data Validation**: Constraints and checks for data integrity
- **Secure Policies**: Comprehensive CRUD policies for both tables

## 🚀 Features Now Enabled

✅ **Real AI Food Recognition** - Google Gemini Vision API integration
✅ **Amount Editing** - Editable serving sizes with nutrition recalculation  
✅ **Goal Setting** - Daily nutrition targets and BMR calculations
✅ **Progress Tracking** - Dashboard with daily totals and progress bars
✅ **Meal History** - Searchable and filterable meal logs
✅ **Profile Management** - Complete user profile with health metrics
✅ **Micronutrient Support** - Flexible JSON storage for vitamins/minerals
✅ **Meal Categorization** - Breakfast, lunch, dinner, snack classification
✅ **Data Sources** - Track whether meals came from AI, manual entry, or database

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Test connection
node verify-database-setup.js
```

### Missing Columns Error
- Re-run the `complete-database-setup.sql` script
- The script uses `IF NOT EXISTS` so it's safe to run multiple times

### RLS Policy Issues
- Ensure you're authenticated in your app
- Check Supabase Auth is working properly
- Verify user IDs match between auth and database

## 🎯 Next Steps

1. **Production Deploy**: Your database is now ready for production use
2. **Data Backup**: Consider setting up automated backups
3. **Monitoring**: Set up alerts for database performance
4. **Scaling**: Monitor usage and optimize queries as needed

---

**✅ Setup Complete!** Your NutriSnap app now has a fully functional database supporting all features from food recognition to nutrition goal tracking.
