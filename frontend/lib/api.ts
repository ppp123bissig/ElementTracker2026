// Frontend API Configuration
// Automatically determines backend URL based on where frontend is accessed from
// This allows the app to work seamlessly across different PCs and networks

export function getAPIBaseURL(): string {
  // If explicitly set via environment variable, use that
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Production: use configured domain
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-production-domain.com';
  }

  // Development: Auto-detect from current window location
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol; // http: or https:
    const hostname = window.location.hostname; // localhost, 10.0.2.15, 192.168.x.x, etc.
    const port = 3000; // Backend always runs on port 3000

    const url = `${protocol}//${hostname}:${port}`;
    return url;
  }

  // Fallback if neither window nor process available (shouldn't happen)
  return 'http://localhost:3000';
}

// Export as constant for static access - evaluated at runtime
export const API_BASE_URL = getAPIBaseURL();