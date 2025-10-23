# Quest TurboRepo - Universal Template 1.0

Professional multi-site platform for Quest domains (placement.quest, relocation.quest, etc.) built with Astro, TurboRepo, and Neon PostgreSQL.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build all apps
pnpm build

# Generate article images
pnpm generate-images
```

## 📁 Project Structure

```
quest-turborepo/
├── apps/
│   └── placement/          # placement.quest site
│       ├── src/
│       │   ├── pages/
│       │   │   ├── [...slug].astro    # Dynamic article routes
│       │   │   ├── api/health.ts      # Health check endpoint
│       │   │   ├── index.astro        # Homepage
│       │   │   └── articles.astro     # Article listing
│       │   └── layouts/
│       └── astro.config.mjs
│
├── packages/
│   ├── quest-db/          # Database queries (Neon)
│   ├── quest-ui/          # Shared UI components
│   ├── quest-seo/         # SEO utilities
│   └── quest-geo/         # Geo-location & currency
│
├── scripts/
│   ├── test-deployment.mjs          # Deployment testing
│   └── generate-article-images.mjs  # Image generation
│
├── .github/workflows/
│   └── test-preview.yml   # CI/CD pipeline
│
└── .husky/                # Git hooks
    ├── pre-commit         # Linting (placeholder)
    └── pre-push           # Build validation
```

## 🧪 Testing & Deployment

### Local Testing
```bash
# Test health endpoint
curl http://localhost:4321/api/health

# Test article page
curl http://localhost:4321/top-private-equity-placement-agents-london
```

### Deployment Testing
```bash
# Run automated tests against production
DEPLOYMENT_URL=https://turbo-p.vercel.app \
DATABASE_URL=$DATABASE_URL \
node scripts/test-deployment.mjs
```

### Git Workflow
```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Commit (runs pre-commit hooks)
git commit -m "feat: my feature"

# 4. Push (runs pre-push build validation)
git push origin feature/my-feature

# 5. Create PR
# GitHub Actions will:
# - Build TurboRepo
# - Deploy to Vercel preview
# - Run deployment tests
# - Comment on PR with results

# 6. Merge when tests pass
```

## 🏥 Health Check Endpoint

**URL:** `/api/health`

**Response:**
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
  "timestamp": "2025-10-23T14:22:19Z"
}
```

## 🔧 Environment Variables

### Required (Vercel + GitHub)
```bash
DATABASE_URL=postgresql://...           # Neon database connection
SITE_NAME="Placement Quest"            # Site branding
VERCEL_TOKEN=...                       # For GitHub Actions
VERCEL_ORG_ID=team_...                # Your Vercel team
VERCEL_PROJECT_ID=prj_...             # Project ID
```

### Optional (Image Generation)
```bash
REPLICATE_API_KEY=r8_...              # For article images
CLOUDINARY_CLOUD_NAME=...             # Image hosting
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 🤖 CI/CD Pipeline

### GitHub Actions Workflow

Every PR triggers:
1. ✅ **Build Validation** - TurboRepo builds all packages
2. ✅ **Vercel Preview** - Deploy to preview URL
3. ✅ **Health Check** - Test database connectivity
4. ✅ **Article Tests** - Validate 5 random articles render correctly
5. ✅ **PR Comment** - Post results with preview link

### Pre-commit Hooks (Husky)
- ✅ Lint-staged (placeholder for future linting)

### Pre-push Hooks (Husky)
- ✅ TurboRepo build validation
- ✅ Prevents pushing broken code

## 📊 Monitoring Recommendations

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive monitoring setup.

### 1. Sentry (Recommended)
**Why:** Catches 404s, 500 errors, slow queries in production

```bash
pnpm add -w @sentry/astro
```

### 2. Playwright (Recommended)
**Why:** E2E tests validate actual user experience

```bash
pnpm add -D -w @playwright/test
npx playwright install
```

### 3. Vercel Analytics
**Why:** Track page views, performance metrics

Enable in Vercel dashboard → Analytics tab

## 🐛 Troubleshooting

### Articles Return "Internal Server Error"

**Check:**
1. Is `DATABASE_URL` set in Vercel?
2. Test health endpoint: `curl https://turbo-p.vercel.app/api/health`
3. Check Vercel deployment logs
4. Verify article slug exists in database

### Build Fails Locally

```bash
# Clear cache and rebuild
rm -rf node_modules .turbo
pnpm install
pnpm build
```

### Tests Pass but Production Fails

**Possible causes:**
- Environment variables missing in Vercel
- Cached serverless functions
- Database connection timeout

**Solution:**
```bash
# Force clean deployment
vercel --prod --force
```

## 🎯 Why This Approach?

### Problem
Articles were breaking randomly because:
- No validation before deployment
- Manual testing required
- No way to catch regressions early

### Solution
**Multi-layer testing:**
1. **Pre-push hooks** - Catch build errors locally
2. **GitHub Actions** - Test preview deployments automatically
3. **Health checks** - Validate database connectivity
4. **Article tests** - Ensure pages render correctly

### Result
✅ No broken articles reach production
✅ Fast feedback loop (PR comments)
✅ Automated testing saves time
✅ Confidence in deployments

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide
  - Testing strategies
  - Monitoring setup (Sentry, Playwright, etc.)
  - Troubleshooting guide
  - Best practices

## 🏗️ Tech Stack

- **Framework:** Astro 5.x (SSR mode)
- **Deployment:** Vercel (Serverless)
- **Database:** Neon PostgreSQL (Serverless)
- **Monorepo:** TurboRepo + pnpm workspaces
- **CI/CD:** GitHub Actions
- **Testing:** Custom deployment tests
- **Git Hooks:** Husky

## 🚦 Current Status

- [x] Dynamic article routes ([...slug].astro)
- [x] Health check endpoint
- [x] Deployment test script
- [x] GitHub Actions CI/CD
- [x] Pre-commit/pre-push hooks
- [x] Comprehensive documentation
- [ ] Sentry error tracking (recommended)
- [ ] Playwright E2E tests (recommended)
- [ ] Production monitoring (recommended)

## 🔗 Links

- **Production:** https://turbo-p.vercel.app
- **Vercel Project:** https://vercel.com/londondannyboys-projects/turbo-p
- **GitHub Repo:** https://github.com/Londondannyboy/quest-turborepo
- **Database:** Neon PostgreSQL

## 📝 License

Private - Quest Platform

---

**Questions?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides or check [GitHub Issues](https://github.com/Londondannyboy/quest-turborepo/issues).
