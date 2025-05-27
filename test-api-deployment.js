// Test script to verify FatSecret API function on Vercel
const API_URL = 'https://nutrisnap-8dt9i2k0k-crocksies-projects.vercel.app/api/fatsecret';

async function testFatSecretAPI() {
  try {
    console.log('Testing FatSecret API endpoint...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchTerm: 'apple'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('API Response successful!');
    console.log('Number of foods found:', data.foods?.food?.length || 0);
    
    if (data.foods?.food?.length > 0) {
      console.log('First food item:', data.foods.food[0]);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testFatSecretAPI();
