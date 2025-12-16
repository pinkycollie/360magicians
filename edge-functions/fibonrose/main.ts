// fibonrose.360magicians.com - Trust & Reputation Engine
import { App } from "fresh";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const app = new App();
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================================================
// Trust Score Management
// ============================================================================

// GET /score/:userId - Get user trust score
app.get('/score/:userId', async (ctx) => {
  const userId = ctx.params.userId;
  
  const { data, error } = await supabase
    .from('fibonrose_trust_scores')
    .select('score, last_updated')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    return ctx.json({ error: 'User not found' }, { status: 404 });
  }
  
  return ctx.json(data);
});

// POST /log - Log event (impacts trust score)
app.post('/log', async (ctx) => {
  const { event, user_id, ...metadata } = await ctx.request.json();
  
  // Store event
  await supabase.from('fibonrose_logs').insert({
    event,
    user_id,
    metadata,
    timestamp: new Date().toISOString(),
  });
  
  // Update trust score based on event
  await updateTrustScore(user_id, event);
  
  return ctx.json({ logged: true });
});

// ============================================================================
// Trust Score Algorithm
// ============================================================================

async function updateTrustScore(userId: string, event: string) {
  const { data: current } = await supabase
    .from('fibonrose_trust_scores')
    .select('score')
    .eq('user_id', userId)
    .single();
  
  if (!current) return;
  
  let adjustment = 0;
  
  // Trust score adjustments
  switch (event) {
    case 'user_signup':
      adjustment = 0; // Neutral start
      break;
    case 'ai_request':
      adjustment = 0.001; // Small increase for engagement
      break;
    case 'harmful_content':
      adjustment = -0.1; // Significant decrease
      break;
    case 'positive_feedback':
      adjustment = 0.01;
      break;
    default:
      adjustment = 0;
  }
  
  const newScore = Math.max(0, Math.min(1, current.score + adjustment));
  
  await supabase
    .from('fibonrose_trust_scores')
    .update({ 
      score: newScore,
      last_updated: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

await app.listen({ port: 8003 });
