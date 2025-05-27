// Apply database migrations script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://swgrbthpvxaxuwkhjuld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Z3JidGhwdnhheHV3a2hqdWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MzIwNTgsImV4cCI6MjA2MzAwODA1OH0.Us0ZxqmziFfrK4f4p_VjxJ4VgqGnR6yhl1etW985Skc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigrations() {
  console.log('🚀 Applying database migrations...\n');
  
  try {
    // Migration 1: Add amount column to meals table
    console.log('📝 Applying Migration 1: Amount column for meals table...');
    
    const migration1 = `
      ALTER TABLE meals 
      ADD COLUMN IF NOT EXISTS amount INTEGER DEFAULT 100;
    `;
    
    const { error: migration1Error } = await supabase.rpc('exec_sql', { 
      sql: migration1 
    });
    
    if (migration1Error) {
      console.error('❌ Migration 1 failed:', migration1Error.message);
      console.log('⚠️  You may need to apply this manually in Supabase Dashboard');
    } else {
      console.log('✅ Migration 1: Amount column added successfully');
    }
    
    // Migration 2: Add goal columns to profiles table
    console.log('\n📝 Applying Migration 2: Goal columns for profiles table...');
    
    const migration2 = `
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS daily_calories INTEGER,
      ADD COLUMN IF NOT EXISTS daily_protein INTEGER,
      ADD COLUMN IF NOT EXISTS daily_carbs INTEGER,
      ADD COLUMN IF NOT EXISTS daily_fat INTEGER,
      ADD COLUMN IF NOT EXISTS daily_fiber INTEGER,
      ADD COLUMN IF NOT EXISTS daily_water INTEGER,
      ADD COLUMN IF NOT EXISTS weight_goal DECIMAL(5,2),
      ADD COLUMN IF NOT EXISTS goal_type TEXT CHECK (goal_type IN ('lose', 'maintain', 'gain'));
    `;
    
    const { error: migration2Error } = await supabase.rpc('exec_sql', { 
      sql: migration2 
    });
    
    if (migration2Error) {
      console.error('❌ Migration 2 failed:', migration2Error.message);
      console.log('⚠️  You may need to apply this manually in Supabase Dashboard');
    } else {
      console.log('✅ Migration 2: Goal columns added successfully');
    }
    
    // Create index
    console.log('\n📝 Creating index for goal_type...');
    const indexSql = `CREATE INDEX IF NOT EXISTS idx_profiles_goal_type ON profiles(goal_type);`;
    
    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql: indexSql 
    });
    
    if (indexError) {
      console.error('❌ Index creation failed:', indexError.message);
    } else {
      console.log('✅ Index created successfully');
    }
    
    console.log('\n🎯 Migration process complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the verification script: node check-database.cjs');
    console.log('2. Test the application at http://localhost:5175');
    console.log('3. Try uploading food and setting nutrition goals');
    
  } catch (error) {
    console.error('💥 Unexpected error during migration:', error.message);
    console.log('\n🔧 Manual migration required:');
    console.log('Please apply the migrations manually in your Supabase Dashboard SQL Editor');
  }
}

applyMigrations();
