// Frontend API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-domain.com'
  : 'http://10.0.2.15:3000';