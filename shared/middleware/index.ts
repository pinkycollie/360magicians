// Shared middleware functions for MBTQ Edge Functions

import type { Context } from "fresh";

/**
 * CORS middleware - allows requests from specified origins
 */
export function corsMiddleware(allowedOrigins: string[]) {
  return (ctx: Context) => {
    const origin = ctx.request.headers.get('origin');
    
    if (origin && allowedOrigins.includes(origin)) {
      ctx.response.headers.set('Access-Control-Allow-Origin', origin);
      ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    if (ctx.request.method === 'OPTIONS') {
      ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return new Response(null, { status: 204 });
    }
    
    return ctx.next();
  };
}

/**
 * Rate limiting middleware - limits requests per IP
 */
export function rateLimitMiddleware(
  limiter: Map<string, { count: number; resetAt: number }>,
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  return (ctx: Context) => {
    const clientIP = ctx.request.headers.get('cf-connecting-ip') || 
                     ctx.request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     'unknown';
    const now = Date.now();
    const limit = limiter.get(clientIP);
    
    if (limit && limit.resetAt > now) {
      if (limit.count >= maxRequests) {
        return new Response('Rate limit exceeded', { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((limit.resetAt - now) / 1000))
          }
        });
      }
      limit.count++;
    } else {
      limiter.set(clientIP, { count: 1, resetAt: now + windowMs });
    }
    
    return ctx.next();
  };
}

/**
 * Request timing middleware - measures request duration
 */
export function timingMiddleware() {
  return async (ctx: Context) => {
    const start = Date.now();
    const response = await ctx.next();
    const duration = Date.now() - start;
    
    response.headers.set('X-Response-Time', `${duration}ms`);
    
    return response;
  };
}

/**
 * Error handling middleware
 */
export function errorMiddleware() {
  return async (ctx: Context) => {
    try {
      return await ctx.next();
    } catch (error) {
      console.error('Request error:', error);
      
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}
