import 'dotenv/config';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import fetch from 'node-fetch';

const FATSECRET_API_KEY = process.env.VITE_FATSECRET_API_KEY;
const FATSECRET_SHARED_SECRET = process.env.VITE_FATSECRET_SHARED_SECRET;

console.log('Testing FatSecret API Key:', FATSECRET_API_KEY);
console.log('Testing FatSecret Shared Secret:', FATSECRET_SHARED_SECRET);

const oauth = OAuth({
  consumer: { key: FATSECRET_API_KEY, secret: FATSECRET_SHARED_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

const fatsecretApiUrl = 'https://platform.fatsecret.com/rest/server.api';
const method = 'foods.search';
const format = 'json';
const searchTerm = 'Apple';

// All parameters for the request
const params = {
  method,
  search_expression: searchTerm,
  format,
};

// Get OAuth params
const oauthParams = oauth.authorize({ url: fatsecretApiUrl, method: 'GET', data: params });

// Merge all params
const allParams = { ...params, ...oauthParams };
const queryString = Object.entries(allParams)
  .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
  .join('&');

const request_url_with_oauth = `${fatsecretApiUrl}?${queryString}`;
console.log('Request URL with OAuth params:', request_url_with_oauth);

fetch(request_url_with_oauth)
  .then(async res => {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      console.log('FatSecret API response (JSON):', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('FatSecret API response (RAW):', text);
    }
  })
  .catch(err => {
    console.error('Error:', err);
  });
