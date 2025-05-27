// Vercel Serverless Function for FatSecret API
import cors from 'cors';
import crypto from 'crypto-js';
import OAuth from 'oauth-1.0a';

// Enable CORS
const corsHandler = cors({
  origin: true,
  credentials: true
});

export default async function handler(req, res) {
  // Handle CORS
  await new Promise((resolve, reject) => {
    corsHandler(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { food_name } = req.body;
    
    if (!food_name) {
      return res.status(400).json({ error: 'food_name is required' });
    }

    const API_KEY = process.env.FATSECRET_API_KEY;
    const SHARED_SECRET = process.env.FATSECRET_SHARED_SECRET;

    if (!API_KEY || !SHARED_SECRET) {
      console.error('Missing FatSecret API credentials');
      return res.status(500).json({ error: 'API credentials not configured' });
    }

    // OAuth 1.0a setup
    const oauth = OAuth({
      consumer: { key: API_KEY, secret: SHARED_SECRET },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.HmacSHA1(base_string, key).toString(crypto.enc.Base64);
      },
    });

    const requestData = {
      url: 'https://platform.fatsecret.com/rest/server.api',
      method: 'POST',
    };

    const authHeader = oauth.toHeader(oauth.authorize(requestData));

    const formData = new URLSearchParams({
      method: 'foods.search',
      search_expression: food_name,
      format: 'json'
    });

    const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
      method: 'POST',
      headers: {
        'Authorization': authHeader['Authorization'],
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      console.error('FatSecret API error:', response.status, response.statusText);
      return res.status(response.status).json({ error: 'FatSecret API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
