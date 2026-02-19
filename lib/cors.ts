/**
 * CORS Utilities
 * Centralized CORS configuration for public API endpoints
 */

export const ALLOWED_ORIGINS = [
  'https://alecam.dev',
  'https://www.alecam.dev',
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',  // Next.js dev server
];

/**
 * Get CORS headers for a request
 * @param origin - Request origin header
 * @returns Headers object with CORS configuration
 */
export function getCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, Pragma, Expires',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  // Only set Origin header if the origin is in our allowed list
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

/**
 * Add CORS headers to a NextResponse
 * @param response - NextResponse object
 * @param origin - Request origin header
 * @returns NextResponse with CORS headers added
 */
export function addCorsHeaders(response: Response, origin: string | null): Response {
  const corsHeaders = getCorsHeaders(origin);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
