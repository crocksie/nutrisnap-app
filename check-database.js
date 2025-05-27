// Database verification script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://swgrbthpvxaxuwkhjuld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Z3JidGhwdnhheHV3a2hqdWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MzIwNTgsImV4cCI6MjA2MzAwODA1OH0.Us0ZxqmziFfrK4f4p_VjxJ4VgqGnR6yhl1etW985Skc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase database connection and schema...\n');
  
  try {
    // Check if we can connect
    const { data: connectionTest, error: connectionError } = await supabase
      .from('meals')
      .select('count', { count: 'exact', head: true });
      
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log(`📊 Total meals in database: ${connectionTest.count || 0}\n`);
    
    // Check meals table structure by trying to select all columns
    const { data: mealsTest, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .limit(1);
      
    if (mealsError) {
      console.error('❌ Error accessing meals table:', mealsError.message);
    } else {
      console.log('✅ Meals table accessible');
      
      // Check if amount column exists
      const sampleRecord = mealsTest[0];
      if (sampleRecord) {
        const hasAmount = 'amount' in sampleRecord;
        console.log(`${hasAmount ? '✅' : '❌'} Amount column ${hasAmount ? 'exists' : 'missing'} in meals table`);
      }
    }
    
    // Check profiles table structure
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      
      // Check if goal columns exist
      const sampleProfile = profilesTest[0];
      if (sampleProfile) {
        const goalColumns = [
          'daily_calories', 'daily_protein', 'daily_carbs', 
          'daily_fat', 'daily_fiber', 'daily_water', 
          'weight_goal', 'goal_type'
        ];
        
        console.log('\n📋 Goal columns status:');
        goalColumns.forEach(column => {
          const exists = column in sampleProfile;
          console.log(`${exists ? '✅' : '❌'} ${column} ${exists ? 'exists' : 'missing'}`);
        });
      }
    }
    
    console.log('\n🎯 Database verification complete!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

checkDatabase();
