import 'dotenv/config';
import express from 'express';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const FATSECRET_API_KEY = process.env.VITE_FATSECRET_API_KEY;
const FATSECRET_SHARED_SECRET = process.env.VITE_FATSECRET_SHARED_SECRET;

console.log('Loaded FatSecret API Key:', FATSECRET_API_KEY);
console.log('Loaded FatSecret Shared Secret:', FATSECRET_SHARED_SECRET);

const oauth = OAuth({
  consumer: { key: FATSECRET_API_KEY, secret: FATSECRET_SHARED_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

app.get('/', (req, res) => {
  res.send('FatSecret proxy server is running. Use POST /api/fatsecret.');
});

app.post('/api/fatsecret', async (req, res) => {
  const { foodDescription } = req.body;
  if (!foodDescription) return res.status(400).json({ error: 'Missing foodDescription' });

  const fatsecretApiUrl = 'https://platform.fatsecret.com/rest/server.api';
  const method = 'foods.search';
  const format = 'json';

  async function searchFatSecret(term) {
    // Build all params (query + OAuth)
    const params = {
      method: method,
      search_expression: term,
      format: format,
    };
    // Generate OAuth params and signature
    const request_data = {
      url: fatsecretApiUrl,
      method: 'GET',
      data: params,
    };
    const oauthParams = oauth.authorize(request_data);
    // Merge all params (query + OAuth)
    const allParams = { ...params, ...oauthParams };
    // Build query string
    const queryString = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');
    const urlWithParams = `${fatsecretApiUrl}?${queryString}`;
    console.log('FatSecret search term:', term);
    console.log('FatSecret request URL:', urlWithParams);
    const response = await fetch(urlWithParams, {
      method: 'GET',
    });
    return response.json();
  }

  // First, try the original term
  let data = await searchFatSecret(foodDescription);
  if (!data.foods || !data.foods.food || data.foods.food.length === 0) {
    console.log('No foods found for original term:', foodDescription, 'Response:', JSON.stringify(data));
    // If no results, try plural (add 's')
    let plural = foodDescription;
    if (!foodDescription.endsWith('s')) plural = foodDescription + 's';
    data = await searchFatSecret(plural);
  }
  if (!data.foods || !data.foods.food || data.foods.food.length === 0) {
    console.log('No foods found for plural/generic. Response:', JSON.stringify(data));
    // If still no results, try a generic fallback
    data = await searchFatSecret('fruit');
  }
  if (!data.foods || !data.foods.food || data.foods.food.length === 0) {
    console.log('No foods found for any search. Final response:', JSON.stringify(data));
    res.status(404).json({ error: 'No foods found in FatSecret for any search', fatsecretResponse: data });
    return;
  }
  console.log('FatSecret raw response:', JSON.stringify(data, null, 2));
  res.json(data);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`FatSecret proxy server running on port ${PORT}`);
});
