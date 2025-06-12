import axios from 'axios';

// Assuming environment variables are loaded via SvelteKit's env handling
const API_URL = import.meta.env.VITE_POSTGREST_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY || '';

console.log('API URL:', API_URL);

// Create axios instance for PostgREST with Supabase configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': API_KEY,
    'Authorization': `Bearer ${API_KEY}`,
    'Prefer': 'return=representation'
  }
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API success response:', response.config.url, response.status);
    return response;
  },
  error => {
    console.error('API error:', error.config?.url, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received, request:', error.request);
    }
    return Promise.reject(error);
  }
);

export default api;
