# Quest Scripts

## Generate Article Images

Automatically generate AI images for articles missing featured images using Replicate AI and Cloudinary.

### Setup

1. Install dependencies:
```bash
pnpm add replicate cloudinary
```

2. Set environment variables in `.env`:
```bash
# Replicate API (get from https://replicate.com/account/api-tokens)
REPLICATE_API_KEY=r8_...

# Cloudinary (get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Database URL (already configured)
DATABASE_URL=postgresql://...
```

### Usage

Generate images for all placement articles:
```bash
node scripts/generate-article-images.mjs placement
```

Generate images for first 5 articles (testing):
```bash
node scripts/generate-article-images.mjs placement 5
```

Generate for other sites:
```bash
node scripts/generate-article-images.mjs relocation
node scripts/generate-article-images.mjs mba
```

### What it does

1. **Queries database** - Finds all articles without `featured_image_url`
2. **Generates AI images** - Uses Replicate Flux Schnell model (fast & free tier available)
3. **Uploads to Cloudinary** - Professional CDN hosting
4. **Updates database** - Sets `featured_image_url` for each article

### Image Generation

- **Company profiles**: Modern corporate office buildings, financial districts
- **Articles**: Professional business scenes related to article topic
- **Format**: 16:9 aspect ratio, WebP format, 90% quality
- **Naming**: Uses article slug as Cloudinary public_id

### Rate Limiting

The script includes a 2-second delay between articles to avoid rate limits.

### Error Handling

- Continues processing even if individual articles fail
- Shows summary report at the end
- Lists failed articles with error messages
