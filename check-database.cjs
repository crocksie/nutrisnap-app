// Database verification script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://swgrbthpvxaxuwkhjuld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Z3JidGhwdnhheHV3a2hqdWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MzIwNTgsImV4cCI6MjA2MzAwODA1OH0.Us0ZxqmziFfrK4f4p_VjxJ4VgqGnR6yhl1etW985Skc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase database connection and schema...\n');
  
  try {
    // Test basic connection by trying to select from meals table
    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .limit(1);
      
    if (mealsError) {
      console.error('❌ Error accessing meals table:', mealsError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log('✅ Meals table accessible');
    
    // Check if amount column exists by looking at the first record or table metadata
    if (mealsData && mealsData.length > 0) {
      const sampleRecord = mealsData[0];
      const hasAmount = 'amount' in sampleRecord;
      console.log(`${hasAmount ? '✅' : '❌'} Amount column ${hasAmount ? 'exists' : 'missing'} in meals table`);
      
      console.log('\n📋 Available columns in meals table:');
      Object.keys(sampleRecord).forEach(col => {
        console.log(`  • ${col}`);
      });
    } else {
      console.log('ℹ️  No records in meals table - will test with insert');
      
      // Try to insert a test record to check schema
      const testRecord = {
        user_id: 'test-user',
        date: '2025-01-01',
        food_description: 'Test Food',
        calories: 100,
        protein: 10,
        carbs: 10,
        fat: 5,
        amount: 100
      };
      
      const { error: insertError } = await supabase
        .from('meals')
        .insert([testRecord])
        .select();
        
      if (insertError) {
        if (insertError.message.includes('amount')) {
          console.log('❌ Amount column missing from meals table');
        } else {
          console.log('⚠️  Insert test failed:', insertError.message);
        }
      } else {
        console.log('✅ Amount column exists - test insert successful');
        
        // Clean up test record
        await supabase
          .from('meals')
          .delete()
          .eq('user_id', 'test-user')
          .eq('date', '2025-01-01');
          
        console.log('🧹 Test record cleaned up');
      }
    }
    
    // Check profiles table
    console.log('\n🔍 Checking profiles table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      
      if (profilesData && profilesData.length > 0) {
        const sampleProfile = profilesData[0];
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
      } else {
        console.log('ℹ️  No profiles exist - testing schema with insert');
        
        const testProfile = {
          id: 'test-profile-id',
          daily_calories: 2000,
          daily_protein: 150,
          daily_carbs: 250,
          daily_fat: 70,
          daily_fiber: 25,
          daily_water: 2000,
          weight_goal: 70.5,
          goal_type: 'maintain'
        };
        
        const { error: profileInsertError } = await supabase
          .from('profiles')
          .insert([testProfile])
          .select();
          
        if (profileInsertError) {
          console.log('❌ Goal columns missing:', profileInsertError.message);
        } else {
          console.log('✅ All goal columns exist - test insert successful');
          
          // Clean up
          await supabase
            .from('profiles')
            .delete()
            .eq('id', 'test-profile-id');
            
          console.log('🧹 Test profile cleaned up');
        }
      }
    }
    
    console.log('\n🎯 Database verification complete!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

checkDatabase();
