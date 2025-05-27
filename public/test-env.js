// Test script to verify environment variables in production
console.log('=== Environment Variables Test ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('VITE_GOOGLE_GEMINI_API_KEY:', import.meta.env.VITE_GOOGLE_GEMINI_API_KEY ? 'SET' : 'NOT SET');
console.log('VITE_FATSECRET_API_KEY:', import.meta.env.VITE_FATSECRET_API_KEY ? 'SET' : 'NOT SET');
console.log('VITE_FATSECRET_SHARED_SECRET:', import.meta.env.VITE_FATSECRET_SHARED_SECRET ? 'SET' : 'NOT SET');

if (import.meta.env.VITE_GOOGLE_GEMINI_API_KEY) {
    console.log('Gemini API Key length:', import.meta.env.VITE_GOOGLE_GEMINI_API_KEY.length);
    console.log('Gemini API Key starts with:', import.meta.env.VITE_GOOGLE_GEMINI_API_KEY.substring(0, 10) + '...');
}

console.log('=== Test Complete ===');
