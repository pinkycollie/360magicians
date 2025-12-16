# MBTQ Fresh 2.0 + Deno Deploy: Production Infrastructure

## 🌐 Domain Architecture

```
360magicians.com (Main Brand)
├── api.360magicians.com        → Deno Deploy (API Gateway)
├── auth.360magicians.com       → Deno Deploy (DeafAUTH)
├── ai.360magicians.com         → Deno Deploy (AI Router)
├── sync.360magicians.com       → Deno Deploy (PinkSync)
└── fibonrose.360magicians.com  → Deno Deploy (Trust Engine)

mbtq.dev (Infrastructure Domain)
├── edge.mbtq.dev              → Deno Deploy (Edge Functions)
├── cdn.mbtq.dev               → Cloudflare CDN
└── monitor.mbtq.dev           → Deno Deploy (Monitoring)
```

## 📋 Quick Start

### 1. Setup

```bash
# Run the setup script
./setup-mbtq-edge.sh

# Copy environment variables
cp .env.example .env

# Edit .env with your actual credentials
nano .env
```

### 2. Local Development

```bash
# Start individual services
deno task dev           # API Gateway (port 8000)
deno task dev:auth      # DeafAUTH (port 8001)
deno task dev:ai        # AI Router (port 8002)
deno task dev:fibonrose # Fibonrose (port 8003)
deno task dev:sync      # PinkSync (port 8004)
deno task dev:monitor   # Monitor (port 8005)
```

### 3. Deploy to Production

```bash
# Deploy all services to Deno Deploy
./deploy.sh
```

## 🏗️ Architecture Overview

### Edge Functions Structure

```
360magicians/
├── edge-functions/
│   ├── api/          # Main API Gateway
│   ├── auth/         # DeafAUTH Service
│   ├── ai/           # AI Router (Claude/GPT)
│   ├── sync/         # PinkSync Orchestrator
│   ├── fibonrose/    # Trust Engine
│   └── monitor/      # Real-time Monitoring
├── shared/
│   ├── middleware/   # Shared middleware
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript types
├── deno.json         # Deno configuration
├── deployctl.json    # Deployment configuration
├── setup-mbtq-edge.sh # Setup script
└── deploy.sh         # Deployment script
```

## 🔧 Services

### 1. API Gateway (`api.360magicians.com`)

**Purpose**: Central entry point for all API requests with routing to microservices

**Key Features**:
- CORS middleware for cross-origin requests
- Request logging to Supabase
- Service health monitoring
- Proxy routing to other services

**Endpoints**:
- `GET /health` - Service health check
- `ALL /auth/*` - Proxy to DeafAUTH
- `ALL /ai/*` - Proxy to AI Router
- `ALL /sync/*` - Proxy to PinkSync

### 2. DeafAUTH Service (`auth.360magicians.com`)

**Purpose**: Accessibility-first authentication with visual patterns

**Key Features**:
- Email/password authentication
- Visual pattern verification
- JWT token generation with trust scores
- Integration with Fibonrose trust engine

**Endpoints**:
- `POST /login` - Authenticate user
- `POST /signup` - Register new user
- `POST /verify` - Verify JWT token

**Example Login Request**:
```json
POST https://auth.360magicians.com/login
{
  "email": "user@example.com",
  "password": "secure_password",
  "visualPattern": { "pattern": "..." }
}
```

### 3. AI Router (`ai.360magicians.com`)

**Purpose**: Intelligent routing to AI models with MBTQ principles

**Key Features**:
- Multi-model support (Claude, GPT)
- Automatic model selection based on prompt
- Rate limiting per IP
- DeafAUTH token verification
- MBTQ-aware system prompts

**Endpoints**:
- `POST /chat` - AI chat completion

**Example Chat Request**:
```json
POST https://ai.360magicians.com/chat
Authorization: Bearer <jwt_token>
{
  "prompt": "Help me create an accessible web form",
  "role": "accessibility_expert",
  "model": "claude-sonnet-4-20250514"
}
```

### 4. Fibonrose Trust Engine (`fibonrose.360magicians.com`)

**Purpose**: Decentralized trust and reputation management

**Key Features**:
- Trust score calculation
- Event logging
- Automatic trust score adjustments

**Endpoints**:
- `GET /score/:userId` - Get user trust score
- `POST /log` - Log event (updates trust score)

**Trust Score Algorithm**:
- User signup: +0.0 (neutral start at 0.5)
- AI request: +0.001 (engagement)
- Harmful content: -0.1 (penalty)
- Positive feedback: +0.01 (reward)

### 5. PinkSync Orchestrator (`sync.360magicians.com`)

**Purpose**: Data synchronization and orchestration

**Endpoints**:
- `GET /health` - Health check
- `POST /sync` - Trigger synchronization

### 6. Monitor (`monitor.mbtq.dev`)

**Purpose**: Real-time system monitoring and metrics

**Endpoints**:
- `GET /health` - Service health
- `GET /metrics` - System metrics
- `POST /alert` - Create alert

## 🚀 Deployment

### Prerequisites

1. **Deno Deploy Account**: Sign up at [deno.com/deploy](https://deno.com/deploy)
2. **Supabase Project**: Create at [supabase.com](https://supabase.com)
3. **API Keys**: Anthropic, OpenAI (optional)

### Step-by-Step Deployment

#### 1. Create Deno Deploy Projects

In Deno Deploy dashboard, create these projects:
- `360magicians-api`
- `360magicians-auth`
- `360magicians-ai`
- `360magicians-sync`
- `360magicians-fibonrose`
- `360magicians-monitor`

#### 2. Set Environment Variables

For each project in Deno Deploy, add these environment variables:

**All Services**:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**DeafAUTH Service** (additional):
```
JWT_SECRET=your-secret-key-min-32-chars
```

**AI Router** (additional):
```
ANTHROPIC_API_KEY=sk-ant-your-key
```

#### 3. Deploy Services

```bash
# Authenticate with Deno Deploy
deployctl login

# Deploy all services
./deploy.sh
```

#### 4. Configure DNS (Cloudflare)

Add these CNAME records in your DNS provider:

```
api.360magicians.com      → CNAME → 360magicians-api.deno.dev
auth.360magicians.com     → CNAME → 360magicians-auth.deno.dev
ai.360magicians.com       → CNAME → 360magicians-ai.deno.dev
sync.360magicians.com     → CNAME → 360magicians-sync.deno.dev
fibonrose.360magicians.com → CNAME → 360magicians-fibonrose.deno.dev
monitor.mbtq.dev          → CNAME → 360magicians-monitor.deno.dev
```

**Enable Cloudflare Proxy (Orange Cloud)** for automatic SSL and CDN benefits.

## 📊 Expected Performance

| Metric | Value |
|--------|-------|
| **Cold Start** | 0ms (V8 isolates) |
| **Global Latency** | <50ms (35 regions) |
| **Requests/Second** | 10,000+ per region |
| **Auto-scaling** | Infinite |
| **Cost (first 100M req)** | $0 |

## 🔒 Security

### Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Rotate keys regularly
3. **JWT Secret**: Use strong, random 32+ character secret
4. **Rate Limiting**: Configured per-service
5. **CORS**: Whitelist only trusted domains

### Supabase Database Schema

Required tables:

```sql
-- API Logs
CREATE TABLE api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  duration_ms INTEGER,
  region TEXT,
  timestamp TIMESTAMPTZ NOT NULL
);

-- DeafAUTH Patterns
CREATE TABLE deaf_auth_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  pattern_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fibonrose Trust Scores
CREATE TABLE fibonrose_trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  score DECIMAL(3,2) DEFAULT 0.5 CHECK (score >= 0 AND score <= 1),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Fibonrose Logs
CREATE TABLE fibonrose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  metadata JSONB,
  timestamp TIMESTAMPTZ NOT NULL
);

-- Sync Logs
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity TEXT NOT NULL,
  action TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMPTZ NOT NULL
);

-- Monitoring Alerts
CREATE TABLE monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  service TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL
);
```

## 🧪 Testing

### Local Testing

```bash
# Test API Gateway
curl http://localhost:8000/health

# Test DeafAUTH
curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test AI Router (requires auth token)
curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"prompt":"Hello","role":"general"}'

# Test Fibonrose
curl http://localhost:8003/score/user-uuid-here
```

### Production Testing

Replace `localhost:800X` with your production URLs:
- `api.360magicians.com`
- `auth.360magicians.com`
- `ai.360magicians.com`
- etc.

## 📈 Monitoring

### Built-in Monitoring

The Monitor service provides real-time metrics:

```bash
# Get system metrics
curl https://monitor.mbtq.dev/metrics

# Create alert
curl -X POST https://monitor.mbtq.dev/alert \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "high",
    "message": "High latency detected",
    "service": "api"
  }'
```

### Deno Deploy Dashboard

Monitor your deployments at:
- https://dash.deno.com/projects/360magicians-api
- https://dash.deno.com/projects/360magicians-auth
- etc.

## 🤝 Integration Examples

### Frontend Integration

```typescript
// Login with DeafAUTH
const login = async (email: string, password: string) => {
  const response = await fetch('https://auth.360magicians.com/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const { token, user } = await response.json();
  localStorage.setItem('auth_token', token);
  return user;
};

// Use AI Router
const chat = async (prompt: string) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('https://ai.360magicians.com/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, role: 'general' }),
  });
  
  return await response.json();
};
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: `App is not a constructor`
- **Solution**: Ensure using Fresh 2.0 beta: `https://deno.land/x/fresh@2.0.0-beta.8/mod.ts`

**Issue**: CORS errors
- **Solution**: Add your domain to `allowedOrigins` in API Gateway

**Issue**: Supabase connection fails
- **Solution**: Verify `SUPABASE_URL` and keys in environment variables

**Issue**: JWT verification fails
- **Solution**: Ensure `JWT_SECRET` is the same across all services

## 📚 Additional Resources

- [Deno Deploy Documentation](https://deno.com/deploy/docs)
- [Fresh Framework](https://fresh.deno.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Anthropic API](https://docs.anthropic.com)

## 🎯 Next Steps

1. **Set up Supabase**: Create tables using SQL schema above
2. **Configure Environment**: Add all required environment variables
3. **Deploy Services**: Run `./deploy.sh`
4. **Configure DNS**: Add CNAME records in Cloudflare
5. **Test Endpoints**: Verify all services are responding
6. **Monitor Performance**: Check metrics in Monitor service

---

**🎯 You're now ready to handle MILLIONS with edge.mbtq.dev and 360magicians.com! 🚀**
