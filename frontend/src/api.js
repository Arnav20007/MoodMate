const FALLBACK_API_URL = 'https://moodmate-8-sucu.onrender.com';

export function getApiBaseUrl() {
  const configured = (process.env.REACT_APP_API_URL || '').trim();

  if (!configured) {
    return FALLBACK_API_URL;
  }

  if (/^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, '');
  }

  return `https://${configured.replace(/^\/+|\/+$/g, '')}`;
}

export const API_BASE_URL = getApiBaseUrl();
