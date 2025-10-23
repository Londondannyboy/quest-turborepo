# Deployment & Testing Guide

## 🚀 Quick Start

### Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Commit (triggers pre-commit hooks)
git commit -m "feat: my feature"

# 4. Push (triggers pre-push build validation)
git push origin feature/my-feature

# 5. Create PR (triggers GitHub Actions + Vercel preview)
# GitHub will automatically:
# - Build TurboRepo
# - Deploy to Vercel preview URL
# - Run deployment tests
# - Comment on PR with results

# 6. Merge when tests pass
```

---

## 🧪 Testing Layers

### 1. Pre-Commit (Local)
**What runs:** Lint-staged (currently placeholder)
**When:** Every `git commit`
**Purpose:** Catch obvious issues before committing

### 2. Pre-Push (Local)
**What runs:** TurboRepo build
**When:** Every `git push`
**Purpose:** Ensure code builds before pushing
**Bypass (not recommended):** `git push --no-verify`

### 3. CI/CD (GitHub Actions)
**What runs:**
- TurboRepo build
- Vercel preview deployment
- Deployment test script (5 random articles)
- Health check endpoint validation

**When:** Every PR to `main`
**Results:** Posted as PR comment with ✅/❌ status

### 4. Production Monitoring (Recommended)
**Setup Sentry for Vercel:**
```bash
# Install Sentry
pnpm add -w @sentry/astro

# Configure in apps/placement/astro.config.mjs
import sentry from "@sentry/astro";

export default defineConfig({
  integrations: [
    sentry({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.VERCEL_ENV,
      tracesSampleRate: 1.0,
    })
  ]
});
```

**Sentry Benefits:**
- ✅ Catches 404s on article pages
- ✅ Reports 500 errors with stack traces
- ✅ Tracks performance (slow queries)
- ✅ Real-time alerts via email/Slack
- ✅ Native Vercel integration (auto-setup)

---

## 🏥 Health Check Endpoint

### `/api/health`
Tests database connectivity and article availability.

**Example Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "articleCount": 142,
  "sampleArticle": {
    "slug": "top-private-equity-placement-agents-london",
    "title": "Top Private Equity Placement Agents in London",
    "created_at": "2025-10-15T10:30:00Z"
  },
  "responseTime": "87ms",
  "timestamp": "2025-10-23T14:22:19Z",
  "environment": {
    "hasDatabase": true,
    "siteName": "Placement Quest"
  }
}
```

**Usage:**
```bash
# Test production
curl https://turbo-p.vercel.app/api/health

# Test local
curl http://localhost:4321/api/health
```

---

## 🤖 Automated Testing

### Manual Test Deployment
```bash
# Test production
DEPLOYMENT_URL=https://turbo-p.vercel.app \
DATABASE_URL=$DATABASE_URL \
node scripts/test-deployment.mjs

# Test preview (get URL from PR comment)
DEPLOYMENT_URL=https://turbo-abc123.vercel.app \
DATABASE_URL=$DATABASE_URL \
node scripts/test-deployment.mjs
```

### What Gets Tested
1. **Health Check** - Database connectivity
2. **Article Rendering** - 5 random published articles
3. **Content Validation** - No "Internal Server Error" messages
4. **Response Time** - Pages load < 2s
5. **Status Codes** - All return 200 (not 404/500)

---

## 🎭 Playwright E2E Testing (Recommended)

### Why Add Playwright?
**Husky** ✅ Validates code quality (linting, build)
**Sentry** ✅ Catches runtime errors in production
**Playwright** ✅ Validates actual user experience

### Setup Playwright
```bash
# Install
pnpm add -D -w @playwright/test

# Initialize
npx playwright install
```

### Example Test (`tests/articles.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Article Pages', () => {
  test('should render article without 404', async ({ page }) => {
    // Navigate to article
    await page.goto('/top-private-equity-placement-agents-london');

    // Verify page loads
    expect(page.status()).toBe(200);

    // Verify no error messages
    const errorText = await page.textContent('body');
    expect(errorText).not.toContain('Internal Server Error');
    expect(errorText).not.toContain('404');

    // Verify article title exists
    const title = await page.locator('h1').textContent();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);

    // Verify article content exists
    const content = await page.locator('.article-content').textContent();
    expect(content.length).toBeGreaterThan(500);
  });

  test('should handle invalid slugs with 404', async ({ page }) => {
    await page.goto('/this-article-does-not-exist-12345');

    // Should redirect to 404 page
    expect(page.url()).toContain('/404');
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/top-private-equity-placement-agents-london');

    // Click "Back to Home"
    await page.click('text=Back to Home');

    // Verify redirected to home
    expect(page.url()).toContain('/');
  });
});
```

### Add to GitHub Actions
```yaml
# .github/workflows/test-preview.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E Tests
  env:
    PLAYWRIGHT_TEST_BASE_URL: ${{ steps.deploy.outputs.preview-url }}
  run: pnpm test:e2e
```

---

## 🔔 Monitoring Setup (Recommended)

### 1. Vercel + Sentry Integration
**Setup:** https://vercel.com/integrations/sentry

**Benefits:**
- Auto-configured (no code changes)
- Error tracking with source maps
- Performance monitoring
- Release tracking

**Alert Rules:**
- Email on 5+ errors/minute
- Slack notification on 500 errors
- PagerDuty for critical issues

### 2. Vercel + Datadog Integration
**Setup:** https://vercel.com/integrations/datadog

**Benefits:**
- Infrastructure metrics (CPU, memory)
- Request traces (slow queries)
- Custom metrics (article views)
- Dashboards

### 3. Custom Health Monitoring
Use a service like **Better Uptime** or **Pingdom**:

```bash
# Monitor health endpoint
https://turbo-p.vercel.app/api/health

# Alert if:
- Status code != 200
- Response time > 2000ms
- "status": "error" in response
- Check every 60 seconds
```

---

## 📊 What Each Tool Catches

| Tool | 404s | 500s | Slow Pages | Build Errors | Runtime Errors |
|------|------|------|------------|--------------|----------------|
| **Husky (pre-push)** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **GitHub Actions** | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| **Deployment Tests** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Sentry** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Playwright** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Health Endpoint** | ❌ | ⚠️ | ✅ | ❌ | ⚠️ |

### Legend
- ✅ **Catches it reliably**
- ⚠️ **Catches some cases**
- ❌ **Doesn't catch it**

---

## 🛡️ Best Practices

### 1. Never Push to Main Directly
```bash
# ❌ BAD
git push origin main

# ✅ GOOD
git checkout -b feature/my-feature
git push origin feature/my-feature
# Create PR → let tests run → merge
```

### 2. Monitor Vercel Deployment Notifications
Enable Slack/Discord webhook in Vercel settings:
- Deployment started
- Deployment succeeded
- Deployment failed

### 3. Review Failed Deployments
If tests fail:
1. Check GitHub Actions logs
2. Visit preview URL manually
3. Run test script locally
4. Fix issue → push again

### 4. Use Environment Variables
**Required for GitHub Actions:**
```bash
# In GitHub repo → Settings → Secrets
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
DATABASE_URL
```

---

## 🔧 Troubleshooting

### Articles Return 404
```bash
# 1. Test health endpoint
curl https://turbo-p.vercel.app/api/health

# 2. Check database has articles
# Look at "articleCount" in response

# 3. Test specific article
curl -I https://turbo-p.vercel.app/top-private-equity-placement-agents-london

# 4. Check slug in database
# Use Neon console to verify slug matches URL
```

### Build Fails Locally
```bash
# Clear cache
rm -rf node_modules .turbo
pnpm install
pnpm build

# Check DATABASE_URL
echo $DATABASE_URL

# Verify all packages build
cd packages/quest-db && pnpm build
```

### Tests Pass but Production Fails
**Possible causes:**
- Environment variables missing in Vercel
- Database connection string different
- Serverless function timeout (increase in vercel.json)
- Cached serverless functions (redeploy)

**Solution:**
```bash
# Redeploy with clean cache
vercel --prod --force
```

---

## 🎯 Recommended Full Stack

```
┌─────────────────────────────────────────┐
│          Developer Workflow             │
├─────────────────────────────────────────┤
│ 1. Husky pre-commit  (lint/format)     │
│ 2. Husky pre-push    (build)           │
│ 3. GitHub Actions    (test preview)     │
│ 4. Merge to main     (deploy prod)      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Production Monitoring           │
├─────────────────────────────────────────┤
│ • Sentry (errors + performance)         │
│ • Playwright (E2E tests on preview)     │
│ • Better Uptime (health checks)         │
│ • Vercel Analytics (page views)         │
└─────────────────────────────────────────┘
```

---

## 📚 Resources

- **Vercel Integrations:** https://vercel.com/integrations
- **Sentry Astro Guide:** https://docs.sentry.io/platforms/javascript/guides/astro/
- **Playwright Testing:** https://playwright.dev/
- **GitHub Actions:** https://docs.github.com/en/actions

---

## ✅ Current Status

- [x] Husky pre-commit hooks (placeholder for linting)
- [x] Husky pre-push hooks (build validation)
- [x] GitHub Actions CI/CD workflow
- [x] Deployment test script
- [x] Health check endpoint
- [ ] Sentry error tracking (recommended)
- [ ] Playwright E2E tests (recommended)
- [ ] Uptime monitoring (recommended)

**Next Steps:** Add Sentry integration + Playwright E2E tests for comprehensive coverage.
