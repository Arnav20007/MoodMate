export function getApiBaseUrl() {
  const configured = (process.env.REACT_APP_API_URL || '').trim();

  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  // Fallback to Render production if not on localhost
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://moodmate-8-sucu.onrender.com';
  }

  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();
