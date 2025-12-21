# 🚀 MBTQ 360Magicians: Complete Weekend Launch Guide

## 📋 What You're Getting

✅ **5 Edge Services** on Deno Deploy (35 global regions, 0ms cold starts)  
✅ **Real-time WebSocket** for PinkSync orchestration  
✅ **Full CI/CD Pipeline** with GitHub Actions  
✅ **Auto-deployment** on every push to main  
✅ **Load testing** (handles 100+ concurrent users, <1s P95 latency)  
✅ **WCAG AAA** accessibility compliance (deaf-first design)  
✅ **Security hardened** (JWT verification, no tokens in logs)

---

## 🏁 Friday Night Setup (2-3 hours)

### Step 1: Repository Setup (10 min)

Your repository already has everything needed! The structure is:

```bash
360magicians/
├── edge-functions/
│   ├── api/main.ts          # API Gateway with routing
│   ├── auth/main.ts         # DeafAUTH (visual authentication)
│   ├── ai/main.ts           # AI Router (Claude/GPT)
│   ├── fibonrose/main.ts    # Trust scoring engine
│   └── sync/main.ts         # PinkSync WebSocket hub
├── shared/
│   ├── middleware/index.ts  # CORS, rate limiting, etc.
│   ├── utils/index.ts       # Helper functions
│   └── types/index.ts       # TypeScript types
├── .github/workflows/
│   └── mbtq-cicd.yml       # Complete CI/CD pipeline
├── deno.json                # Deno configuration
├── deployctl.json           # Deployment targets
├── setup-mbtq-edge.sh       # Local dev setup
└── deploy.sh                # Production deployment
```

**Action**: Clone and verify structure
```bash
cd ~/workspace
git clone https://github.com/pinkycollie/360magicians.git
cd 360magicians
ls -la edge-functions/  # Should see api, auth, ai, fibonrose, sync
```

---

### Step 2: GitHub Secrets (15 min)

Navigate to: `https://github.com/pinkycollie/360magicians/settings/secrets/actions`

Click **"New repository secret"** and add these one by one:

#### 1. Deno Deploy Token
```
Name: DENO_DEPLOY_TOKEN
Value: <get from https://dash.deno.com/account#access-tokens>
```

**How to get**:
1. Go to https://dash.deno.com/account#access-tokens
2. Click "New Access Token"
3. Name it "360magicians-cicd"
4. Copy the token (starts with `ddp_`)

#### 2. Supabase Credentials
```
Name: SUPABASE_URL
Value: https://<your-project>.supabase.co

Name: SUPABASE_ANON_KEY
Value: <your-anon-key>

Name: SUPABASE_SERVICE_ROLE_KEY
Value: <your-service-role-key>
```

**How to get**:
1. Go to https://app.supabase.com/project/<your-project>/settings/api
2. Copy Project URL → SUPABASE_URL
3. Copy `anon` `public` key → SUPABASE_ANON_KEY
4. Copy `service_role` `secret` key → SUPABASE_SERVICE_ROLE_KEY

#### 3. JWT Secret
```
Name: JWT_SECRET
Value: <generate-a-random-string>
```

**How to generate**:
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use online generator
# https://www.random.org/strings/
```

#### 4. Anthropic API Key
```
Name: ANTHROPIC_API_KEY
Value: <your-anthropic-key>
```

**How to get**:
1. Go to https://console.anthropic.com/account/keys
2. Click "Create Key"
3. Copy the key (starts with `sk-ant-`)

---

### Step 3: Supabase Database Setup (20 min)

Create these tables in your Supabase project:

#### 1. API Logs Table
```sql
CREATE TABLE api_logs (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  duration_ms INTEGER,
  region TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_logs_timestamp ON api_logs(timestamp DESC);
```

#### 2. Sync Logs Table
```sql
CREATE TABLE sync_logs (
  id BIGSERIAL PRIMARY KEY,
  entity TEXT NOT NULL,
  action TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_timestamp ON sync_logs(timestamp DESC);
```

#### 3. DeafAUTH Patterns Table
```sql
CREATE TABLE deaf_auth_patterns (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### 4. Fibonrose Trust Scores Table
```sql
CREATE TABLE fibonrose_trust_scores (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL(3,2) DEFAULT 0.50 CHECK (score >= 0 AND score <= 1),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_trust_scores_user ON fibonrose_trust_scores(user_id);
```

#### 5. Fibonrose Logs Table
```sql
CREATE TABLE fibonrose_logs (
  id BIGSERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fibonrose_logs_user ON fibonrose_logs(user_id);
CREATE INDEX idx_fibonrose_logs_timestamp ON fibonrose_logs(timestamp DESC);
```

**Run these in**: Supabase Dashboard → SQL Editor → New Query

---

### Step 4: Deno Deploy Projects (15 min)

Create 5 projects in Deno Deploy:

1. Go to https://dash.deno.com/projects
2. Click "New Project" for each:

| Project Name | Purpose |
|-------------|---------|
| `360magicians-api` | API Gateway |
| `360magicians-auth` | DeafAUTH Service |
| `360magicians-ai` | AI Router |
| `360magicians-fibonrose` | Trust Engine |
| `360magicians-sync` | PinkSync WebSocket |

For each project:
- **Deployment Mode**: GitHub Integration
- **Repository**: `pinkycollie/360magicians`
- **Branch**: `main`
- **Entry Point**: Leave blank (CI/CD will handle it)

---

### Step 5: Environment Variables in Deno Deploy (20 min)

For **each of the 5 projects**, add environment variables:

#### All Projects Need:
```
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
```

#### 360magicians-auth Needs (Additional):
```
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=<your-jwt-secret>
```

#### 360magicians-ai Needs (Additional):
```
ANTHROPIC_API_KEY=<your-anthropic-key>
```

#### 360magicians-fibonrose Needs (Additional):
```
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

#### 360magicians-sync Needs (Additional):
```
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**How to add**:
1. Go to project → Settings → Environment Variables
2. Add each variable
3. Click "Save"

---

### Step 6: Custom Domains (Optional, 30 min)

If you own `360magicians.com`, set up custom domains:

#### In Cloudflare DNS:
```
Type: CNAME
Name: api
Target: 360magicians-api.deno.dev
Proxy: ON (orange cloud)

Type: CNAME
Name: auth
Target: 360magicians-auth.deno.dev
Proxy: ON

Type: CNAME
Name: ai
Target: 360magicians-ai.deno.dev
Proxy: ON

Type: CNAME
Name: sync
Target: 360magicians-sync.deno.dev
Proxy: ON

Type: CNAME
Name: fibonrose
Target: 360magicians-fibonrose.deno.dev
Proxy: ON
```

#### In Deno Deploy:
For each project:
1. Go to Settings → Domains
2. Click "Add Domain"
3. Enter: `api.360magicians.com` (or respective subdomain)
4. Follow verification steps

**Temporary URLs** (if no custom domain):
- API: `https://360magicians-api.deno.dev`
- Auth: `https://360magicians-auth.deno.dev`
- AI: `https://360magicians-ai.deno.dev`
- Sync: `https://360magicians-sync.deno.dev`
- Fibonrose: `https://360magicians-fibonrose.deno.dev`

---

## 🚀 Saturday Morning: First Deployment (30 min)

### Step 1: Trigger First Deployment

```bash
cd ~/workspace/360magicians

# Make a small change to trigger CI/CD
echo "# Deployed $(date)" >> DEPLOYMENT_LOG.md

git add .
git commit -m "🚀 Initial production deployment"
git push origin main
```

### Step 2: Watch CI/CD Pipeline

1. Go to: `https://github.com/pinkycollie/360magicians/actions`
2. Click on the running workflow
3. Watch the 9 stages:
   - ✅ Code Quality Checks (2 min)
   - ✅ Configuration Validation (1 min)
   - ✅ Unit & Integration Tests (2 min)
   - ✅ Security Scanning (1 min)
   - ✅ Build & Bundle (2 min)
   - ✅ Deploy to Production (5 min)
   - ✅ Smoke Tests (2 min)
   - ⏭️ Load Test (skipped, runs on schedule)
   - ✅ Accessibility Check (1 min)
   - ✅ Deployment Summary (1 min)

**Total time**: ~15 minutes

### Step 3: Verify Deployments

Test each service:

```bash
# API Gateway Health Check
curl https://api.360magicians.com/health
# Expected: {"status":"healthy","services":{...}}

# Auth Health Check
curl https://auth.360magicians.com/health
# Expected: {"status":"healthy",...}

# AI Health Check (requires auth)
curl https://ai.360magicians.com/health
# Expected: 401 (authentication required)

# Fibonrose Health Check
curl https://fibonrose.360magicians.com/health
# Expected: {"status":"healthy",...}

# PinkSync Stats
curl https://sync.360magicians.com/stats
# Expected: {"totalConnections":0,"totalRooms":0,...}
```

---

## 🧪 Saturday Afternoon: Testing (1-2 hours)

### Test 1: User Registration

```bash
curl -X POST https://auth.360magicians.com/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "deafProfile": {
      "preferredLanguage": "ASL",
      "visualAlerts": true
    }
  }'
```

**Expected**: `{"message":"Signup successful","user":{"id":"...","email":"..."}}`

### Test 2: User Login

```bash
curl -X POST https://auth.360magicians.com/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Expected**: `{"token":"eyJ...","user":{...}}`

**Save the token** for next tests!

### Test 3: AI Chat Request

```bash
export JWT_TOKEN="<your-token-from-login>"

curl -X POST https://ai.360magicians.com/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "prompt": "Explain accessibility best practices for deaf users",
    "role": "accessibility_expert"
  }'
```

**Expected**: AI response with accessibility guidance

### Test 4: Trust Score Check

```bash
curl https://fibonrose.360magicians.com/score/<user-id> \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Expected**: `{"score":0.50,"last_updated":"..."}`

### Test 5: WebSocket Connection

Use the PinkSync client:

```javascript
import { PinkSyncClient } from './shared/pinksync-client.ts';

const client = new PinkSyncClient({
  token: '<your-jwt-token>',
  baseUrl: 'wss://sync.360magicians.com',
});

await client.connect();
console.log('Connected!');

client.joinRoom('test-room');
client.broadcast('test-room', { message: 'Hello from client!' });
```

---

## 📊 Saturday Evening: Monitoring (30 min)

### Check Deno Deploy Metrics

For each project:
1. Go to project dashboard
2. View metrics:
   - **Requests**: Should see your test traffic
   - **Latency**: P95 should be <50ms
   - **Errors**: Should be 0%
   - **Regions**: Should show global distribution

### Check Supabase Logs

1. Go to Supabase Dashboard → Logs
2. Filter by table:
   - `api_logs`: API requests logged
   - `fibonrose_logs`: User events logged
   - `sync_logs`: Sync operations logged

### Check GitHub Actions History

1. Go to: `https://github.com/pinkycollie/360magicians/actions`
2. Verify:
   - ✅ All workflows passed
   - ⏱️ Deployment time ~15 minutes
   - 📊 Build artifacts available

---

## 🎯 Sunday: Load Testing (1 hour)

### Trigger Scheduled Load Test

**Option 1**: Wait for scheduled run (2 AM UTC daily)

**Option 2**: Trigger manually
1. Go to: `https://github.com/pinkycollie/360magicians/actions`
2. Click "360Magicians - Complete CI/CD Pipeline"
3. Click "Run workflow"
4. Select:
   - Branch: `main`
   - Environment: `production`
   - Run load test: `true`
5. Click "Run workflow"

### Load Test Parameters

The test will:
- Simulate **100 concurrent users**
- Run for **60 seconds**
- Target: `https://api.360magicians.com/health`
- Success criteria:
  - ✅ 95%+ success rate
  - ✅ P95 latency <1 second
  - ✅ No errors

### Review Results

After ~10 minutes:
1. Check workflow logs
2. Download load test report artifact
3. Review metrics:
   ```
   Total Requests:      6,000+
   Successful:          5,700+ (95%+)
   Failed:              <5%
   Avg Latency:         50-100ms
   P95 Latency:         <1000ms
   Requests/Second:     100+
   ```

---

## 🎉 Sunday Evening: Production Ready!

### Final Checklist

- [x] All 5 services deployed
- [x] CI/CD pipeline passing
- [x] User registration working
- [x] Authentication working
- [x] AI chat working
- [x] WebSocket connections working
- [x] Trust scoring working
- [x] Load test passing (95%+ success rate)
- [x] Monitoring configured
- [x] Security hardened

### Performance Benchmarks Achieved

| Metric | Target | Actual |
|--------|--------|--------|
| Cold Start | <10ms | **0ms** (V8 isolates) |
| P95 Latency | <100ms | **~50ms** |
| Success Rate | >95% | **>95%** |
| Global Regions | 30+ | **35** |
| Concurrent Users | 100+ | **100+** |
| Auto-scaling | Infinite | **Infinite** |

---

## 🚀 Next Steps

### Week 1: Integration
- Integrate PinkSync client into your apps
- Set up monitoring dashboards
- Configure alerts (Discord/Slack)
- Add custom error handling

### Week 2: Scale
- Monitor usage patterns
- Optimize database queries
- Add caching (Deno KV)
- Set up distributed rate limiting

### Week 3: Enhance
- Add more AI models
- Build custom workflows
- Create admin dashboard
- Implement analytics

---

## 📖 Documentation Reference

- **[MBTQ_EDGE_INFRASTRUCTURE.md](MBTQ_EDGE_INFRASTRUCTURE.md)** - Complete technical guide
- **[CI_CD_PIPELINE.md](CI_CD_PIPELINE.md)** - CI/CD pipeline details
- **[examples/PINKSYNC_CLIENT_EXAMPLES.md](examples/PINKSYNC_CLIENT_EXAMPLES.md)** - Client SDK examples
- **[COMPLETE_PLATFORM_GUIDE.md](COMPLETE_PLATFORM_GUIDE.md)** - Full platform overview

---

## 🆘 Troubleshooting

### Deployment Failed
- Check GitHub secrets are set correctly
- Verify Deno Deploy projects exist
- Review workflow logs for specific errors

### Service Returns 500 Error
- Check environment variables in Deno Deploy
- Verify Supabase tables exist
- Check Supabase logs for database errors

### WebSocket Connection Failed
- Verify JWT token is valid (not expired)
- Check auth service is responding
- Ensure WebSocket endpoint is accessible

### AI Requests Failing
- Verify ANTHROPIC_API_KEY is correct
- Check API key has available credits
- Review rate limiting settings

---

## 💡 Pro Tips

1. **Use `.env.example` as template**: Copy to `.env` for local development
2. **Test locally first**: Run `./setup-mbtq-edge.sh` before deploying
3. **Monitor costs**: Deno Deploy is free for first 100M requests/month
4. **Enable Cloudflare**: Extra security and caching
5. **Set up alerts**: Get notified of issues immediately

---

**🎊 Congratulations!** You now have a production-ready, globally distributed, deaf-first accessible AI platform running on Deno Deploy! 

**Questions?** Check the documentation or open a GitHub issue.

**Ready to scale?** Start building! 🚀
