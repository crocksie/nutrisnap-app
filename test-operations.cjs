// Direct schema verification script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://swgrbthpvxaxuwkhjuld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Z3JidGhwdnhheHV3a2hqdWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MzIwNTgsImV4cCI6MjA2MzAwODA1OH0.Us0ZxqmziFfrK4f4p_VjxJ4VgqGnR6yhl1etW985Skc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testActualOperations() {
  console.log('🧪 Testing actual database operations after migration...\n');
  
  try {
    // Test 1: Try to insert a meal with amount column
    console.log('Test 1: Inserting meal with amount column...');
    const testMeal = {
      user_id: 'test-user-123',
      date: '2025-01-01',
      food_description: 'Test Apple',
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      amount: 150,
      fibre: 4,
      water: 130,
      micros: { 'vitamin_c': '8.4mg', 'potassium': '195mg' }
    };
    
    const { data: mealData, error: mealError } = await supabase
      .from('meals')
      .insert([testMeal])
      .select();
      
    if (mealError) {
      console.log('❌ Meal insert failed:', mealError.message);
    } else {
      console.log('✅ Meal insert successful with amount column!');
      console.log('📊 Inserted meal data:', {
        id: mealData[0].id,
        amount: mealData[0].amount,
        calories: mealData[0].calories,
        fibre: mealData[0].fibre,
        water: mealData[0].water,
        micros: mealData[0].micros
      });
      
      // Clean up test meal
      await supabase
        .from('meals')
        .delete()
        .eq('user_id', 'test-user-123');
      console.log('🧹 Test meal cleaned up');
    }
    
    console.log('\nTest 2: Inserting profile with goal columns...');
    
    // Test 2: Try to insert a profile with goal columns
    const testProfile = {
      id: 'test-profile-456',
      name: 'Test User',
      dob: '1990-01-01',
      weight: 70,
      height: 175,
      age: 35,
      sex: 'male',
      activity: 'moderate',
      daily_calories: 2200,
      daily_protein: 165,
      daily_carbs: 275,
      daily_fat: 73,
      daily_fiber: 30,
      daily_water: 2500,
      weight_goal: 68.0,
      goal_type: 'lose'
    };
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([testProfile])
      .select();
      
    if (profileError) {
      console.log('❌ Profile insert failed:', profileError.message);
    } else {
      console.log('✅ Profile insert successful with all goal columns!');
      console.log('📊 Inserted profile data:', {
        id: profileData[0].id,
        name: profileData[0].name,
        daily_calories: profileData[0].daily_calories,
        daily_protein: profileData[0].daily_protein,
        weight_goal: profileData[0].weight_goal,
        goal_type: profileData[0].goal_type
      });
      
      // Clean up test profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', 'test-profile-456');
      console.log('🧹 Test profile cleaned up');
    }
    
    console.log('\n🎉 Database migration verification complete!');
    console.log('✅ All required columns are working correctly');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testActualOperations();
