const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabase = createClient(
  'https://uaxayhxvmbqfknwyfgys.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheGF5aHh2bWJxZmtud3lmZ3lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2NDgwMzksImV4cCI6MjA0ODIyNDAzOX0.bbP0L_IUBxhOIeGx6JhtDUJlAm9EWCJPJgMCwj3wnds'
);

async function quickVerify() {
  console.log('🔍 Quick verification of database columns...\n');
  
  try {
    // Test meals table structure with a simple select
    console.log('📊 Testing meals table...');
    const { data: mealsTest, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .limit(1);
    
    if (mealsError) {
      console.log('❌ Meals table error:', mealsError.message);
    } else {
      console.log('✅ Meals table accessible');
      
      // Check if we can select the new columns specifically
      const { data: mealsColumns, error: mealsColError } = await supabase
        .from('meals')
        .select('amount, fibre, water, micros, created_at')
        .limit(1);
      
      if (mealsColError) {
        console.log('❌ New meals columns not found:', mealsColError.message);
      } else {
        console.log('✅ New meals columns (amount, fibre, water, micros, created_at) are available!');
      }
    }
    
    // Test profiles table structure
    console.log('\n👤 Testing profiles table...');
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      
      // Check if we can select the new goal columns specifically
      const { data: goalColumns, error: goalColError } = await supabase
        .from('profiles')
        .select('daily_calories, daily_protein, daily_carbs, daily_fat, daily_fiber, daily_water, weight_goal, goal_type')
        .limit(1);
      
      if (goalColError) {
        console.log('❌ Goal columns not found:', goalColError.message);
      } else {
        console.log('✅ Goal columns (daily_calories, daily_protein, etc.) are available!');
      }
    }
    
    console.log('\n🎉 Migration verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

quickVerify();
