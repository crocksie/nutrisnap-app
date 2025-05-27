import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials
const supabaseUrl = 'https://swgrbthpvxaxuwkhjuld.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3Z3JidGhwdnhheHV3a2hqdWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0MzIwNTgsImV4cCI6MjA2MzAwODA1OH0.Us0ZxqmziFfrK4f4p_VjxJ4VgqGnR6yhl1etW985Skc';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Key must be provided.');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey);

export const supabase = createClient(supabaseUrl, supabaseKey);
