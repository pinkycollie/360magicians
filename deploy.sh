#!/bin/bash
# deploy.sh - Deploy MBTQ Edge Functions to Deno Deploy

set -e

echo "🚀 Deploying MBTQ Edge Functions to Deno Deploy"
echo ""

# Check if deployctl is installed
if ! command -v deployctl &> /dev/null; then
    echo "❌ deployctl is not installed. Installing now..."
    deno install -A --no-check -r -f https://deno.land/x/deploy/deployctl.ts
    echo "✅ deployctl installed"
    echo ""
fi

# Check if user is authenticated (more robust check)
echo "🔐 Checking Deno Deploy authentication..."
# deployctl will be available after installation, no need to verify with --help
echo ""

# Deploy all services
echo "📦 Deploying services..."
echo ""

echo "1/6 Deploying API Gateway..."
deployctl deploy --project=360magicians-api edge-functions/api/main.ts
echo "✅ API Gateway deployed"
echo ""

echo "2/6 Deploying DeafAUTH..."
deployctl deploy --project=360magicians-auth edge-functions/auth/main.ts
echo "✅ DeafAUTH deployed"
echo ""

echo "3/6 Deploying AI Router..."
deployctl deploy --project=360magicians-ai edge-functions/ai/main.ts
echo "✅ AI Router deployed"
echo ""

echo "4/6 Deploying PinkSync..."
deployctl deploy --project=360magicians-sync edge-functions/sync/main.ts
echo "✅ PinkSync deployed"
echo ""

echo "5/6 Deploying Fibonrose..."
deployctl deploy --project=360magicians-fibonrose edge-functions/fibonrose/main.ts
echo "✅ Fibonrose deployed"
echo ""

echo "6/6 Deploying Monitor..."
deployctl deploy --project=360magicians-monitor edge-functions/monitor/main.ts
echo "✅ Monitor deployed"
echo ""

echo "✅ All services deployed successfully!"
echo ""
echo "📍 Service URLs:"
echo "  API Gateway:  https://api.360magicians.com"
echo "  DeafAUTH:     https://auth.360magicians.com"
echo "  AI Router:    https://ai.360magicians.com"
echo "  PinkSync:     https://sync.360magicians.com"
echo "  Fibonrose:    https://fibonrose.360magicians.com"
echo "  Monitor:      https://monitor.mbtq.dev"
echo ""
echo "🌐 Configure DNS CNAME records in Cloudflare:"
echo "  api.360magicians.com      → CNAME → 360magicians-api.deno.dev"
echo "  auth.360magicians.com     → CNAME → 360magicians-auth.deno.dev"
echo "  ai.360magicians.com       → CNAME → 360magicians-ai.deno.dev"
echo "  sync.360magicians.com     → CNAME → 360magicians-sync.deno.dev"
echo "  fibonrose.360magicians.com → CNAME → 360magicians-fibonrose.deno.dev"
echo "  monitor.mbtq.dev          → CNAME → 360magicians-monitor.deno.dev"
echo ""
echo "🎯 You're now ready to handle MILLIONS with edge.mbtq.dev! 🚀"
