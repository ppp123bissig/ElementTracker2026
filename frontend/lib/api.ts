// Frontend API Configuration
// In development: use localhost for local machine, or set NEXT_PUBLIC_API_BASE_URL env var for remote access
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-domain.com'
    : 'http://localhost:3000'
);