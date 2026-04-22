export function getApiBaseUrl() {
  const configured = (process.env.REACT_APP_API_URL || '').trim();

  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  // If on Vercel/Production, use relative path to talk to the same domain
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '';
  }

  return 'http://localhost:5000';
}

export const API_BASE_URL = getApiBaseUrl();
