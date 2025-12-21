// auth.360magicians.com - DeafAUTH Identity Service
import { App } from "fresh";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create as createJWT, verify as verifyJWT } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const app = new App();
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const JWT_KEY = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(Deno.env.get('JWT_SECRET')!),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);

// ============================================================================
// Authentication Endpoints
// ============================================================================

// POST /login - Visual-first authentication
app.post('/login', async (ctx) => {
  const { email, password, visualPattern } = await ctx.request.json();
  
  // 1. Standard auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (authError) {
    return ctx.json({ error: authError.message }, { status: 401 });
  }
  
  // 2. Verify visual pattern (DeafAUTH specific)
  const { data: userPattern } = await supabase
    .from('deaf_auth_patterns')
    .select('pattern_hash')
    .eq('user_id', authData.user.id)
    .single();
  
  if (userPattern && visualPattern) {
    const isValidPattern = await verifyVisualPattern(visualPattern, userPattern.pattern_hash);
    if (!isValidPattern) {
      return ctx.json({ error: 'Invalid visual pattern' }, { status: 401 });
    }
  }
  
  // 3. Get Fibonrose trust score
  const { data: trustData } = await supabase
    .from('fibonrose_trust_scores')
    .select('score')
    .eq('user_id', authData.user.id)
    .single();
  
  // 4. Generate custom JWT with trust score
  const jwt = await createJWT(
    { alg: "HS256", typ: "JWT" },
    {
      sub: authData.user.id,
      email: authData.user.email,
      trustScore: trustData?.score || 0.5,
      deafAuthVerified: true,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    },
    JWT_KEY
  );
  
  return ctx.json({
    token: jwt,
    user: {
      id: authData.user.id,
      email: authData.user.email,
      trustScore: trustData?.score || 0.5,
    },
  });
});

// POST /signup - Deaf-first registration
app.post('/signup', async (ctx) => {
  const { email, password, deafProfile, visualPattern } = await ctx.request.json();
  
  // 1. Create user account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: deafProfile,
    },
  });
  
  if (authError) {
    return ctx.json({ error: authError.message }, { status: 400 });
  }
  
  const userId = authData.user!.id;
  
  // 2. Store visual pattern
  if (visualPattern) {
    const patternHash = await hashVisualPattern(visualPattern);
    await supabase.from('deaf_auth_patterns').insert({
      user_id: userId,
      pattern_hash: patternHash,
    });
  }
  
  // 3. Initialize Fibonrose trust score
  await supabase.from('fibonrose_trust_scores').insert({
    user_id: userId,
    score: 0.5, // Default starting trust
  });
  
  // 4. Log to Fibonrose
  await fetch('https://fibonrose.360magicians.com/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'user_signup',
      user_id: userId,
      timestamp: new Date().toISOString(),
    }),
  });
  
  return ctx.json({
    message: 'Signup successful',
    user: { id: userId, email },
  });
});

// POST /verify - Token verification
app.post('/verify', async (ctx) => {
  const token = ctx.request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return ctx.json({ error: 'No token provided' }, { status: 401 });
  }
  
  try {
    const payload = await verifyJWT(token, JWT_KEY);
    
    return ctx.json({
      valid: true,
      user: {
        id: payload.sub as string,
        email: payload.email as string,
        trustScore: payload.trustScore as number,
      },
    });
  } catch {
    return ctx.json({ error: 'Invalid token' }, { status: 401 });
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

async function hashVisualPattern(pattern: unknown): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(pattern));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyVisualPattern(pattern: unknown, hash: string): Promise<boolean> {
  const computedHash = await hashVisualPattern(pattern);
  return computedHash === hash;
}

await app.listen({ port: 8001 });
