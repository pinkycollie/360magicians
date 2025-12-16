# MBTQ Edge Functions

This directory contains the Fresh 2.0 edge functions for the 360Magicians MBTQ infrastructure deployed on Deno Deploy.

## Services

### API Gateway (`api/`)
Main entry point and router for all services.
- Port: 8000
- Domain: api.360magicians.com

### DeafAUTH (`auth/`)
Accessibility-first authentication service with visual patterns.
- Port: 8001
- Domain: auth.360magicians.com

### AI Router (`ai/`)
Intelligent AI model routing with MBTQ principles.
- Port: 8002
- Domain: ai.360magicians.com

### PinkSync (`sync/`)
Data synchronization orchestrator.
- Port: 8004
- Domain: sync.360magicians.com

### Fibonrose (`fibonrose/`)
Trust and reputation engine.
- Port: 8003
- Domain: fibonrose.360magicians.com

### Monitor (`monitor/`)
Real-time monitoring and metrics.
- Port: 8005
- Domain: monitor.mbtq.dev

## Local Development

Each service can be run independently:

```bash
# API Gateway
deno task dev

# DeafAUTH
deno task dev:auth

# AI Router
deno task dev:ai

# PinkSync
deno task dev:sync

# Fibonrose
deno task dev:fibonrose

# Monitor
deno task dev:monitor
```

## Architecture

All services are built using:
- **Fresh 2.0** - Modern web framework for Deno
- **Supabase** - Backend database and authentication
- **Deno Deploy** - Edge runtime with global distribution

## Dependencies

Services use these key dependencies:
- `fresh` - Web framework
- `@supabase/supabase-js` - Database client
- `djwt` - JWT token handling (auth service)

## Configuration

Environment variables are configured in Deno Deploy dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (auth service)
- `ANTHROPIC_API_KEY` (AI service)

See `.env.example` in the root directory for complete list.

## Deployment

Deploy all services using:

```bash
./deploy.sh
```

Or deploy individually:

```bash
deployctl deploy --project=360magicians-api edge-functions/api/main.ts
deployctl deploy --project=360magicians-auth edge-functions/auth/main.ts
# etc...
```

## Documentation

See [MBTQ_EDGE_INFRASTRUCTURE.md](../MBTQ_EDGE_INFRASTRUCTURE.md) for complete documentation.
