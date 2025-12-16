// api.360magicians.com - Main API Gateway
import { App } from "fresh";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const app = new App();
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

// ============================================================================
// CORS Middleware (Global)
// ============================================================================
app.use((ctx) => {
  const origin = ctx.request.headers.get('origin');
  const allowedOrigins = [
    'https://360magicians.com',
    'https://mbtq.dev',
    'http://localhost:5173'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    ctx.response.headers.set('Access-Control-Allow-Origin', origin);
    ctx.response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  if (ctx.request.method === 'OPTIONS') {
    ctx.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return new Response(null, { status: 204 });
  }
  
  return ctx.next();
});

// ============================================================================
// Request Logger Middleware
// ============================================================================
app.use(async (ctx) => {
  const start = Date.now();
  const response = await ctx.next();
  const duration = Date.now() - start;
  
  // Log to Supabase
  await supabase.from('api_logs').insert({
    path: ctx.url.pathname,
    method: ctx.request.method,
    duration_ms: duration,
    region: Deno.env.get('DENO_REGION'),
    timestamp: new Date().toISOString(),
  });
  
  return response;
});

// ============================================================================
// Service Router
// ============================================================================
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'healthy',
    services: {
      auth: 'https://auth.360magicians.com',
      ai: 'https://ai.360magicians.com',
      sync: 'https://sync.360magicians.com',
      fibonrose: 'https://fibonrose.360magicians.com',
    },
    region: Deno.env.get('DENO_REGION'),
    timestamp: new Date().toISOString(),
  });
});

// Proxy to DeafAUTH
app.all('/auth/*', async (ctx) => {
  const path = ctx.url.pathname.replace('/auth', '');
  const response = await fetch(`https://auth.360magicians.com${path}`, {
    method: ctx.request.method,
    headers: ctx.request.headers,
    body: ctx.request.body,
  });
  return response;
});

// Proxy to AI Router
app.all('/ai/*', async (ctx) => {
  const path = ctx.url.pathname.replace('/ai', '');
  const response = await fetch(`https://ai.360magicians.com${path}`, {
    method: ctx.request.method,
    headers: ctx.request.headers,
    body: ctx.request.body,
  });
  return response;
});

// Proxy to PinkSync
app.all('/sync/*', async (ctx) => {
  const path = ctx.url.pathname.replace('/sync', '');
  const response = await fetch(`https://sync.360magicians.com${path}`, {
    method: ctx.request.method,
    headers: ctx.request.headers,
    body: ctx.request.body,
  });
  return response;
});

await app.listen({ port: 8000 });
