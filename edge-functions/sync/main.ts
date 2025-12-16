// sync.360magicians.com - PinkSync Orchestrator
import { App } from "fresh";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const app = new App();
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================================================
// PinkSync Endpoints
// ============================================================================

// GET /health - Health check
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'healthy',
    service: 'PinkSync Orchestrator',
    region: Deno.env.get('DENO_REGION'),
    timestamp: new Date().toISOString(),
  });
});

// POST /sync - Trigger synchronization
app.post('/sync', async (ctx) => {
  const { entity, action, data } = await ctx.request.json();
  
  // Log sync event
  await supabase.from('sync_logs').insert({
    entity,
    action,
    data,
    timestamp: new Date().toISOString(),
  });
  
  return ctx.json({
    synced: true,
    entity,
    action,
  });
});

await app.listen({ port: 8004 });
