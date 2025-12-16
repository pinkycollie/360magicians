// ai.360magicians.com - 360Magicians AI Router
import { App } from "fresh";

const app = new App();

// Rate limiter (in-memory per region)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

// ============================================================================
// DeafAUTH Middleware
// ============================================================================
app.use(async (ctx) => {
  const token = ctx.request.headers.get('Authorization');
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Verify with DeafAUTH
  const authResponse = await fetch('https://auth.360magicians.com/verify', {
    method: 'POST',
    headers: { 'Authorization': token },
  });
  
  if (!authResponse.ok) {
    return new Response('Invalid token', { status: 401 });
  }
  
  const authData = await authResponse.json();
  ctx.state.user = authData.user;
  
  return ctx.next();
});

// ============================================================================
// Rate Limiting Middleware
// ============================================================================
app.use((ctx) => {
  const clientIP = ctx.request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const limit = rateLimiter.get(clientIP);
  
  if (limit && limit.resetAt > now) {
    if (limit.count >= 100) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
    limit.count++;
  } else {
    rateLimiter.set(clientIP, { count: 1, resetAt: now + 60000 });
  }
  
  return ctx.next();
});

// ============================================================================
// AI Endpoints
// ============================================================================

// POST /chat - 360Magicians Chat
app.post('/chat', async (ctx) => {
  const { prompt, role = 'general', model } = await ctx.request.json();
  const user = ctx.state.user;
  
  // Select model based on request
  const selectedModel = model || selectModel(prompt);
  
  // Build system prompt with MBTQ principles
  const systemPrompt = buildMBTQPrompt(role, user);
  
  // Call Anthropic API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: selectedModel,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  
  const data = await response.json();
  
  // Log to Fibonrose
  await fetch('https://fibonrose.360magicians.com/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'ai_request',
      user_id: user.id,
      model: selectedModel,
      tokens: data.usage?.total_tokens,
      timestamp: new Date().toISOString(),
    }),
  });
  
  return ctx.json({
    response: data.content[0].text,
    model: selectedModel,
    region: Deno.env.get('DENO_REGION'),
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

function selectModel(prompt: string): string {
  if (prompt.length < 100) return 'claude-haiku-4-20250514';
  if (prompt.includes('code') || prompt.includes('script')) return 'claude-sonnet-4-20250514';
  return 'claude-sonnet-4-20250514';
}

function buildMBTQPrompt(role: string, user: { trustScore: number }): string {
  return `You are a 360Magicians AI assistant in the MBTQ Universe.

**ROLE**: ${role}

**MBTQ PRINCIPLES**:
1. **Deaf-First**: All outputs must be visual-friendly. Never suggest audio-only solutions.
2. **Accessibility**: Use clear language, structured formatting, visual metaphors.
3. **Trust-Based**: User trust score: ${user.trustScore} (actions logged in Fibonrose).
4. **Automation-Driven**: Recommendations should be actionable via PinkSync.

**CONSTRAINTS**:
- No audio-only references
- Always provide visual alternatives (diagrams, ASL, captions)
- Respect DAO governance rules
- All actions logged to Fibonrose for accountability

Respond with accessibility-first guidance.`;
}

await app.listen({ port: 8002 });
