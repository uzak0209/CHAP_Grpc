import axios from 'axios';

const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT?.trim();
axios.defaults.baseURL = apiEndpoint && apiEndpoint.length > 0
  ? apiEndpoint.replace(/\/$/, '')
  : 'http://localhost:8083';

// Attach Authorization header from localStorage if token exists
axios.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});

export default axios;
