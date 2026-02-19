/**
 * CORS Utilities
 * Centralized CORS configuration for public API endpoints
 */

// Production origins only
const PRODUCTION_ORIGINS = [
  'https://alecam.dev',
  'https://www.alecam.dev',
];

// Development origins (only allowed in development environment)
const DEVELOPMENT_ORIGINS = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',  // Next.js dev server
];

/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins(): string[] {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production: only allow production domains
    return PRODUCTION_ORIGINS;
  }
  
  // Development: allow both development and production domains
  return [...PRODUCTION_ORIGINS, ...DEVELOPMENT_ORIGINS];
}

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

  const allowedOrigins = getAllowedOrigins();

  // Only set Origin header if the origin is in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
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
