# 🎨 Image Generation Handoff to quest-platform

## Status: Ready for quest-platform Implementation

The turbo-clean Universal Template 1.0 is **deployed and live** with enhanced homepage design. Images need to be generated via the existing quest-platform workflows.

---

## ✅ What's Complete in turbo-clean

### Homepage Enhancements (LIVE on placement.quest)
- ✅ **Stats Section** - Industry-leading coverage metrics
- ✅ **What We Cover** - 4 topic cards with icons
- ✅ **Enhanced Company Cards** - Gradient backgrounds, better hover effects
- ✅ **Improved Hero** - Better tagline and visual hierarchy
- ✅ **Generic Components** - Reusable for all Quest sites

### Components Created
```
packages/quest-ui/src/components/
├── StatsSection.astro (generic, prop-based)
└── WhatWeCover.astro (generic, prop-based)
```

### Per-Site Customization Example (placement)
```typescript
// apps/placement/src/pages/index.astro
const placementStats = [
  { number: '50+', label: 'Placement Agents Profiled', icon: 'building' },
  { number: '150+', label: 'Expert Insights & Guides', icon: 'document' },
  // ... customized per site
];

<StatsSection
  stats={placementStats}
  heading="Industry-Leading Placement Agent Coverage"
  subheading="Your comprehensive resource..."
/>
```

---

## 🎯 What Needs to Be Done in quest-platform

### Image Requirements

**Neon Database Schema:**
```sql
articles table:
├── hero_image_url          -- Article header (21:9 aspect)
├── featured_image_url      -- Card thumbnails (16:9 aspect)
├── content_image_1_url     -- Inline image 1 (4:3 aspect)
├── content_image_2_url     -- Inline image 2 (4:3 aspect)
└── content_image_3_url     -- Inline image 3 (4:3 aspect)
```

**Articles Needing Images:**
```sql
SELECT slug, title, content_type
FROM articles
WHERE target_site = 'placement'
  AND status = 'published'
  AND content_type != 'hero'
  AND (hero_image_url IS NULL OR featured_image_url IS NULL);

-- Returns: ~15 articles including:
-- - Company profiles (UBS O'Connor, Greenhill, etc.)
-- - Guides (Top Agents London, France, etc.)
-- - News articles (Apollo $25B fund, Blackstone raise, etc.)
```

### Image Generation Strategy

**For Company Profiles:**
```
Hero: Wide panoramic corporate headquarters, glass architecture, skyline
Featured: Modern office building, financial district
Content 1: Business meeting room, boardroom
Content 2: Team collaboration, diverse professionals
Content 3: City skyline, financial district aerial view
```

**For Articles/Guides:**
```
Hero: Professional business concept related to title, wide banner
Featured: Business scene, thumbnail-friendly
Content 1: Businesspeople in discussion related to topic
Content 2: Financial charts/data visualization
Content 3: Corporate handshake/partnership scene
```

### Recommended quest-platform Approach

**Option 1: Batch DBOS Workflow**
```python
@DBOS.workflow()
async def backfill_article_images(target_site: str = "placement"):
    """Generate all missing images for existing articles"""

    # 1. Query articles missing images
    articles = await get_articles_needing_images(target_site)

    # 2. For each article, generate 5 images in parallel
    for article in articles:
        image_tasks = [
            generate_hero_image(article),
            generate_featured_image(article),
            generate_content_image(article, 1),
            generate_content_image(article, 2),
            generate_content_image(article, 3),
        ]
        images = await asyncio.gather(*image_tasks)

        # 3. Update article with all image URLs
        await update_article_images(article.id, images)
```

**Option 2: Use Existing Image Agent**
If quest-platform already has an ImageAgent, just call it for each article:
```python
from app.agents.image_agent import ImageAgent

async def backfill_images():
    articles = await sql("""
        SELECT * FROM articles
        WHERE target_site = 'placement'
        AND hero_image_url IS NULL
    """)

    for article in articles:
        await ImageAgent.generate_all_images(article)
```

---

## 🔧 API Credentials

All required credentials are already configured in quest-platform/.env:
- ✅ REPLICATE_API_KEY
- ✅ CLOUDINARY_CLOUD_NAME
- ✅ CLOUDINARY_API_KEY
- ✅ CLOUDINARY_API_SECRET
- ✅ DATABASE_URL

See `/Users/dankeegan/quest-credentials.md` for full credentials.

---

## 📊 Expected Output

After running image generation in quest-platform:

**Immediate Results:**
- 15 articles × 5 images = **75 total images generated**
- All uploaded to Cloudinary under `placement/` folder
- All `articles` table rows updated with URLs

**Visual Results on placement.quest:**
- ✅ Hero images on article pages
- ✅ Featured images on homepage cards
- ✅ Featured images on /articles page
- ✅ Featured images on /top-agents page
- ✅ Content images within article bodies

---

## 🚀 Next Steps

1. **Go to quest-platform directory**
   ```bash
   cd /Users/dankeegan/quest-platform
   ```

2. **Run backfill workflow** (or create one if needed)
   ```bash
   python -m app.scripts.backfill_images --site=placement
   ```

3. **Verify on placement.quest**
   - Check homepage company cards have images
   - Check article pages have hero images
   - Check /articles page has thumbnails

4. **Repeat for other sites**
   ```bash
   # Once placement works, apply to all sites:
   for site in relocation mba rainmaker graduation thechief consultancy pvc
   do
     python -m app.scripts.backfill_images --site=$site
   done
   ```

---

## 📝 Cost Estimate

**Per Article:**
- 5 images × $0.003 (Replicate Flux Schnell) = **$0.015/article**

**For 15 placement articles:**
- 75 images × $0.003 = **$0.23 total**

**For all Quest sites (~100 articles):**
- 500 images × $0.003 = **$1.50 total**

**Cloudinary:** Free tier (plenty of bandwidth)

---

## ✅ Turbo-Clean Template Ready

The Universal Template 1.0 is production-ready and generic:

**To use for relocation.quest, mba.quest, etc:**
1. Customize stats in `apps/{site}/src/pages/index.astro`
2. Customize topics in the same file
3. Deploy!

**Example for mba.quest:**
```typescript
const mbaStats = [
  { number: '100+', label: 'MBA Programs Profiled', icon: 'building' },
  { number: '200+', label: 'Career Insights', icon: 'document' },
  // ...
];

const mbaTopics = [
  { title: 'MBA Rankings', description: '...', icon: 'users' },
  { title: 'Career Outcomes', description: '...', icon: 'strategy' },
  // ...
];
```

---

**Status:** Handoff Complete ✅
**Next:** Image generation in quest-platform
**Then:** Replicate across all 8 Quest sites
