export const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5050'
    : ''; // Relative path on production (Vercel)
