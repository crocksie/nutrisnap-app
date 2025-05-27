// Vercel Serverless Function for FatSecret API (CommonJS format)
const cors = require('cors');
const crypto = require('crypto-js');
const OAuth = require('oauth-1.0a');

// Enable CORS
const corsHandler = cors({
  origin: true,
  credentials: true
});

module.exports = async function handler(req, res) {
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
    const { searchTerm } = req.body;

    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }    // FatSecret API credentials from environment variables
    const API_KEY = process.env.VITE_FATSECRET_API_KEY;
    const SHARED_SECRET = process.env.VITE_FATSECRET_SHARED_SECRET;

    if (!API_KEY || !SHARED_SECRET) {
      console.error('Missing FatSecret API credentials');
      return res.status(500).json({ error: 'API credentials not configured' });
    }

    // OAuth 1.0a setup for FatSecret API
    const oauth = OAuth({
      consumer: { key: API_KEY, secret: SHARED_SECRET },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.HmacSHA1(base_string, key).toString(crypto.enc.Base64);
      },
    });

    // FatSecret API endpoint
    const url = 'https://platform.fatsecret.com/rest/server.api';
    
    // Request parameters
    const requestData = {
      url: url,
      method: 'POST',
      data: {
        method: 'foods.search',
        search_expression: searchTerm,
        format: 'json'
      }
    };

    // Generate OAuth signature
    const authHeader = oauth.toHeader(oauth.authorize(requestData));

    // Make request to FatSecret API
    const formData = new URLSearchParams();
    formData.append('method', 'foods.search');
    formData.append('search_expression', searchTerm);
    formData.append('format', 'json');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader['Authorization'],
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`FatSecret API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
