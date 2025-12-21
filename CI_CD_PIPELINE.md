# CI/CD Pipeline Documentation

## Overview

The 360Magicians CI/CD pipeline provides a comprehensive, automated deployment workflow for the MBTQ edge functions infrastructure. It ensures code quality, security, performance, and accessibility compliance before every deployment.

## Pipeline Architecture

### 🔄 Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ TRIGGER: Push, PR, Schedule, or Manual                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 1: Code Quality                                           │
│ • Format check (deno fmt)                                       │
│ • Linting (deno lint)                                           │
│ • Type checking                                                 │
│ • Dependency validation                                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 2: Configuration Validation                               │
│ • Service configs check                                         │
│ • deployctl.json validation                                     │
│ • DNS configuration format                                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 3: Testing                                                │
│ • Unit tests                                                    │
│ • Service type checking                                         │
│ • Integration tests                                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 4: Security Scanning                                      │
│ • Hardcoded secrets detection                                   │
│ • Sensitive files check                                         │
│ • Security audit                                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 5: Build                                                  │
│ • Cache dependencies                                            │
│ • Build all services                                            │
│ • Generate build report                                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 6: Deploy to Production (main branch only)                │
│ • Deploy API Gateway                                            │
│ • Deploy DeafAUTH                                               │
│ • Deploy AI Router                                              │
│ • Deploy Fibonrose                                              │
│ • Deploy PinkSync                                               │
│ • Verify deployments                                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 7: Smoke Tests                                            │
│ • Health check all services                                     │
│ • Verify basic functionality                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 8: Load Testing (scheduled/manual)                        │
│ • 100 concurrent users                                          │
│ • 60 second duration                                            │
│ • Performance metrics (P95, P99)                                │
│ • Success rate validation                                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STAGE 9: Accessibility Compliance                               │
│ • WCAG AAA validation                                           │
│ • Deaf-first design check                                       │
│ • Visual-first requirements                                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ FINAL: Deployment Summary                                       │
│ • Generate comprehensive report                                 │
│ • Upload artifacts                                              │
│ • Notify stakeholders                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Triggers

### 1. Push Events
```yaml
on:
  push:
    branches: [main, feat-Pinksync-AI]
```
- Automatic deployment on push to `main` branch
- Full pipeline runs on `feat-Pinksync-AI` branch (no deployment)

### 2. Pull Requests
```yaml
on:
  pull_request:
    branches: [main]
```
- Runs all quality checks and tests
- Does NOT deploy (validation only)

### 3. Scheduled Runs
```yaml
on:
  schedule:
    - cron: '0 2 * * *'
```
- Daily load tests at 2 AM UTC
- Monitors production performance
- Catches degradation early

### 4. Manual Dispatch
```yaml
on:
  workflow_dispatch:
    inputs:
      environment: [production, staging]
      run_load_test: boolean
```
- Manual deployments with options
- Control over load testing
- Environment selection

## Pipeline Stages

### Stage 1: Code Quality Checks

**Purpose**: Ensure code meets quality standards

**Steps**:
1. **Format Check** - Validates code formatting with `deno fmt --check`
2. **Lint** - Runs linter with `deno lint`
3. **Type Check** - Validates TypeScript types
4. **Dependencies** - Caches and validates all dependencies

**Pass Criteria**:
- All code properly formatted
- No linting errors
- All types valid
- All dependencies resolve

### Stage 2: Configuration Validation

**Purpose**: Validate infrastructure configuration

**Steps**:
1. **Service Configs** - Verifies all main.ts files exist
2. **deployctl.json** - Validates JSON structure
3. **DNS Config** - Checks domain name formats

**Pass Criteria**:
- All 5 services have main.ts files
- deployctl.json is valid JSON
- All domain names follow pattern

### Stage 3: Testing

**Purpose**: Verify service functionality

**Steps**:
1. **Unit Tests** - Runs basic service validation tests
2. **DeafAUTH Test** - Type checks auth service
3. **AI Router Test** - Type checks AI service
4. **Fibonrose Test** - Type checks trust engine

**Pass Criteria**:
- All unit tests pass
- All services type check successfully
- No runtime errors

### Stage 4: Security Scanning

**Purpose**: Detect security vulnerabilities

**Steps**:
1. **Secret Detection** - Scans for hardcoded API keys
2. **Sensitive Files** - Checks for .env, secrets.json, etc.
3. **Password Detection** - Warns on hardcoded passwords

**Pass Criteria**:
- No hardcoded secrets found
- No sensitive files in repo
- No obvious security issues

### Stage 5: Build & Bundle

**Purpose**: Compile and prepare for deployment

**Steps**:
1. **Cache Dependencies** - Speeds up builds
2. **Build Services** - Type checks and validates all services
3. **Generate Report** - Creates build artifact
4. **Upload Artifacts** - Stores build report

**Output**:
- Build report (Markdown)
- Cached dependencies
- Validated services

### Stage 6: Deploy to Production

**Purpose**: Deploy to Deno Deploy

**Conditions**:
- Only runs on `main` branch
- Only on push events (not PRs)
- Requires `DENO_DEPLOY_TOKEN` secret

**Steps**:
1. **Install deployctl** - Deno Deploy CLI
2. **Deploy API Gateway** - api.360magicians.com
3. **Deploy DeafAUTH** - auth.360magicians.com
4. **Deploy AI Router** - ai.360magicians.com
5. **Deploy Fibonrose** - fibonrose.360magicians.com
6. **Deploy PinkSync** - sync.360magicians.com
7. **Verify Deployment** - Check health endpoints
8. **Notify Success** - Display deployment URLs

**Environment**:
- Name: `production`
- URL: https://api.360magicians.com

### Stage 7: Smoke Tests

**Purpose**: Verify basic functionality post-deployment

**Steps**:
1. **Health Checks** - Test all /health endpoints
2. **Response Validation** - Verify 200 OK responses
3. **Error Handling** - Catch and report failures

**Pass Criteria**:
- All services respond with 200 OK
- No connection errors
- All health checks pass

### Stage 8: Load Testing

**Purpose**: Validate performance under load

**Conditions**:
- Runs on schedule (daily 2 AM)
- Runs on manual dispatch (if enabled)
- Skipped for PR builds

**Configuration**:
```typescript
const CONCURRENT_USERS = 100;
const DURATION_SECONDS = 60;
const PASS_THRESHOLD = 95; // 95% success rate
const LATENCY_THRESHOLD = 1000; // 1000ms max P95
```

**Metrics Collected**:
- Total requests
- Success rate
- Failed requests
- Average latency
- P95 latency (95th percentile)
- P99 latency (99th percentile)
- Requests per second

**Pass Criteria**:
- ≥95% success rate
- P95 latency ≤1000ms
- No critical errors

**Output**:
- Load test report (Markdown)
- Detailed metrics in logs

### Stage 9: Accessibility Compliance

**Purpose**: Ensure deaf-first accessibility standards

**Checks**:
- ✅ Visual-first design requirements
- ✅ ASL-native UX patterns
- ✅ No audio-only interactions
- ✅ Deaf-first accessibility standards
- ✅ All services provide visual feedback

**Standards**:
- WCAG AAA compliance
- MBTQ principles enforcement
- Deaf community best practices

### Final: Deployment Summary

**Purpose**: Comprehensive reporting

**Output**:
- GitHub Step Summary (Markdown)
- Deployment timestamp
- Commit SHA
- Branch name
- Service URLs
- Test results summary

## Required Secrets

Configure these in GitHub Repository Settings → Secrets:

### `DENO_DEPLOY_TOKEN`
- **Type**: Repository Secret
- **Purpose**: Authenticate with Deno Deploy
- **How to Get**: 
  1. Log in to [dash.deno.com](https://dash.deno.com)
  2. Go to Settings → Access Tokens
  3. Create new token
  4. Add to GitHub Secrets

### Optional Secrets (for production services)
These are set in Deno Deploy dashboard, not GitHub:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `ANTHROPIC_API_KEY`

## Usage Examples

### Example 1: Regular Development Flow

```bash
# 1. Create feature branch
git checkout -b feature/new-endpoint

# 2. Make changes
vim edge-functions/api/main.ts

# 3. Commit and push
git add .
git commit -m "Add new endpoint"
git push origin feature/new-endpoint

# 4. Create PR
# → Pipeline runs: code-quality, validate-configs, test-services, security-scan, build
# → No deployment (PR only)

# 5. Merge to main
# → Full pipeline runs including deployment
```

### Example 2: Manual Deployment

```bash
# Go to GitHub Actions → 360Magicians CI/CD Pipeline → Run workflow
# Select:
#   - environment: production
#   - run_load_test: true
# Click "Run workflow"
```

### Example 3: Emergency Hotfix

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 2. Fix the issue
vim edge-functions/auth/main.ts

# 3. Push directly to main (if you have permissions)
git add .
git commit -m "Fix critical auth bug"
git push origin main

# 4. Pipeline auto-deploys to production
```

## Monitoring & Debugging

### View Pipeline Status

1. Go to repository on GitHub
2. Click "Actions" tab
3. Select workflow run
4. View job logs

### Download Artifacts

Available artifacts:
- `build-report` - Build summary
- `load-test-report` - Performance metrics

To download:
1. Open workflow run
2. Scroll to "Artifacts" section
3. Click artifact name to download

### Common Issues

#### Issue: "deno: command not found"
**Solution**: Ensure `denoland/setup-deno@v1` action runs before Deno commands

#### Issue: "deployctl: command not found"
**Solution**: Check installation step runs successfully

#### Issue: "DENO_DEPLOY_TOKEN not set"
**Solution**: Add secret in repository settings

#### Issue: Load test fails with high latency
**Cause**: Service under actual load or network issues
**Solution**: Check Deno Deploy dashboard for regional issues

## Performance Benchmarks

### Expected Results

**Code Quality** (1-2 minutes):
- Format check: <10s
- Linting: <15s
- Type checking: <30s
- Dependencies: <1min

**Testing** (1-2 minutes):
- Unit tests: <30s
- Service checks: <1min

**Build** (1-2 minutes):
- Caching: <30s
- Building: <1min

**Deployment** (3-5 minutes):
- Per service: 30-60s
- Total: 3-5min

**Smoke Tests** (<1 minute):
- Health checks: <30s

**Load Tests** (2-3 minutes):
- Test duration: 60s
- Report generation: <30s

**Total Pipeline Time**: 10-15 minutes

## Best Practices

### 1. Commit Frequently
- Small, focused commits
- Triggers faster validation
- Easy to identify issues

### 2. Test Locally First
```bash
deno fmt --check
deno lint
deno check edge-functions/**/main.ts
```

### 3. Monitor Pipeline
- Check Actions tab regularly
- Fix failures immediately
- Don't merge failing PRs

### 4. Use Meaningful Commit Messages
```bash
# Good
git commit -m "Add rate limiting to AI router"

# Bad
git commit -m "fix stuff"
```

### 5. Review Artifacts
- Check build reports
- Review load test results
- Monitor trends over time

## Customization

### Modify Load Test Parameters

Edit `.github/workflows/mbtq-cicd.yml`:

```typescript
const CONCURRENT_USERS = 200; // Increase users
const DURATION_SECONDS = 120; // Longer test
const PASS_THRESHOLD = 98; // Stricter threshold
```

### Add New Service

1. Create service in `edge-functions/new-service/main.ts`
2. Add to `deployctl.json`
3. Add deployment step in workflow:

```yaml
- name: 🚀 Deploy New Service
  env:
    DENO_DEPLOY_TOKEN: ${{ secrets.DENO_DEPLOY_TOKEN }}
  run: |
    deployctl deploy \
      --project=360magicians-new-service \
      --prod \
      --token=$DENO_DEPLOY_TOKEN \
      edge-functions/new-service/main.ts
```

### Change Schedule

Edit cron expression:

```yaml
schedule:
  - cron: '0 4 * * *'  # 4 AM UTC instead of 2 AM
```

## Troubleshooting Guide

### Pipeline Not Triggering

**Check**:
1. Workflow file in `.github/workflows/`
2. Branch name matches trigger configuration
3. Workflow is enabled in repository settings

### Tests Failing

**Steps**:
1. Run tests locally: `deno test test-runner.ts`
2. Check error messages in pipeline logs
3. Fix issues and push again

### Deployment Fails

**Check**:
1. `DENO_DEPLOY_TOKEN` secret is set
2. Token has not expired
3. Project names match in Deno Deploy dashboard
4. Services exist in Deno Deploy

### Load Test Exceeds Threshold

**Actions**:
1. Check Deno Deploy dashboard for issues
2. Review recent code changes
3. Check for regional outages
4. Adjust thresholds if needed

## Support

For issues with:
- **Pipeline**: Check GitHub Actions documentation
- **Deno Deploy**: Visit [deno.com/deploy/docs](https://deno.com/deploy/docs)
- **Edge Functions**: See MBTQ_EDGE_INFRASTRUCTURE.md

---

**🎯 Pipeline Status**: Production Ready ✅  
**🚀 Last Updated**: December 2024  
**📚 Version**: 1.0.0
