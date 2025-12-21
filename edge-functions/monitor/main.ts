// monitor.mbtq.dev - Real-time Monitoring Service
import { App } from "fresh";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const app = new App();
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ============================================================================
// Monitoring Endpoints
// ============================================================================

// GET /health - Service health check
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'healthy',
    service: 'Monitor',
    region: Deno.env.get('DENO_REGION'),
    timestamp: new Date().toISOString(),
  });
});

// GET /metrics - Get system metrics
app.get('/metrics', async (ctx) => {
  // Fetch recent API logs
  const { data: apiLogs } = await supabase
    .from('api_logs')
    .select('duration_ms, timestamp')
    .order('timestamp', { ascending: false })
    .limit(100);
  
  // Calculate metrics
  const avgDuration = apiLogs && apiLogs.length > 0
    ? apiLogs.reduce((sum, log) => sum + log.duration_ms, 0) / apiLogs.length
    : 0;
  
  return ctx.json({
    metrics: {
      avgResponseTime: avgDuration,
      totalRequests: apiLogs?.length || 0,
      region: Deno.env.get('DENO_REGION'),
    },
    timestamp: new Date().toISOString(),
  });
});

// POST /alert - Create monitoring alert
app.post('/alert', async (ctx) => {
  const { severity, message, service } = await ctx.request.json();
  
  await supabase.from('monitoring_alerts').insert({
    severity,
    message,
    service,
    timestamp: new Date().toISOString(),
  });
  
  return ctx.json({ alerted: true });
});

await app.listen({ port: 8005 });
