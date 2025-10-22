#!/usr/bin/env node
/**
 * 🎨 QUEST UNIVERSAL IMAGE GENERATOR
 *
 * Generates ALL image types for articles:
 * - Hero images (article headers)
 * - Featured images (card thumbnails)
 * - Content images 1-3 (inline article images)
 *
 * Uses: Replicate AI (Flux Schnell) + Cloudinary CDN
 * Updates: Neon PostgreSQL database
 *
 * TEMPLATE: Save this for all Quest projects
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Replicate from 'replicate';
import { v2 as cloudinary } from 'cloudinary';
import { neon } from '@neondatabase/serverless';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

// Configuration
const DATABASE_URL = process.env.DATABASE_URL;
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Validate
if (!REPLICATE_API_KEY || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('❌ Missing required environment variables');
  console.error('Required: REPLICATE_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  process.exit(1);
}

// Initialize
const sql = neon(DATABASE_URL);
const replicate = new Replicate({ auth: REPLICATE_API_KEY });
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Generate image prompts based on article and image type
 */
function generatePrompt(article, imageType) {
  const title = article.title;
  const contentType = article.content_type;

  const baseStyle = "professional, high quality, photorealistic, sharp focus, natural lighting, 8k resolution";

  // Company profile images
  if (contentType === 'company_profile') {
    const prompts = {
      hero: `Wide panoramic view of modern corporate headquarters building, sleek glass architecture, impressive business district skyline, professional corporate atmosphere, ${baseStyle}`,
      featured: `Modern office building exterior, corporate headquarters, financial district, professional architecture, ${baseStyle}`,
      content_1: `Professional business meeting room, modern office interior, corporate boardroom, executive setting, ${baseStyle}`,
      content_2: `Business professionals in modern office, team collaboration, corporate environment, diverse team meeting, ${baseStyle}`,
      content_3: `City skyline with modern office buildings, financial district aerial view, urban business center, ${baseStyle}`,
    };
    return prompts[imageType];
  }

  // Article images (placement agents, fundraising, etc.)
  const articlePrompts = {
    hero: `Professional business concept for "${title}", modern corporate office, sophisticated financial environment, wide banner format, ${baseStyle}`,
    featured: `Business concept representing "${title}", professional corporate scene, investment banking atmosphere, thumbnail friendly, ${baseStyle}`,
    content_1: `Businesspeople discussing ${title.toLowerCase()}, modern office meeting, professional attire, collaboration scene, ${baseStyle}`,
    content_2: `Financial charts and data visualization related to ${title.toLowerCase()}, modern analytics dashboard, professional presentation, ${baseStyle}`,
    content_3: `Corporate handshake and partnership concept for ${title.toLowerCase()}, professional business agreement, modern office background, ${baseStyle}`,
  };

  return articlePrompts[imageType];
}

/**
 * Generate image using Replicate
 */
async function generateImage(prompt, aspectRatio = '16:9') {
  console.log(`  🎨 Generating (${aspectRatio})...`);

  try {
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: aspectRatio,
          output_format: "webp",
          output_quality: 90,
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;
    console.log(`  ✅ Generated`);
    return imageUrl;
  } catch (error) {
    console.error(`  ❌ Generation failed:`, error.message);
    throw error;
  }
}

/**
 * Upload to Cloudinary
 */
async function uploadToCloudinary(imageUrl, publicId, folder = 'quest') {
  console.log(`  ☁️  Uploading...`);

  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
    });

    console.log(`  ✅ Uploaded`);
    return result.secure_url;
  } catch (error) {
    console.error(`  ❌ Upload failed:`, error.message);
    throw error;
  }
}

/**
 * Update article in database with all image URLs
 */
async function updateArticleImages(id, images) {
  console.log(`  💾 Updating database...`);

  try {
    await sql`
      UPDATE articles
      SET
        hero_image_url = ${images.hero || null},
        featured_image_url = ${images.featured || null},
        content_image_1_url = ${images.content_1 || null},
        content_image_2_url = ${images.content_2 || null},
        content_image_3_url = ${images.content_3 || null},
        updated_at = NOW()
      WHERE id = ${id}
    `;
    console.log(`  ✅ Database updated with ${Object.keys(images).length} images`);
  } catch (error) {
    console.error(`  ❌ Database update failed:`, error.message);
    throw error;
  }
}

/**
 * Process a single article - generate ALL images
 */
async function processArticle(article, index, total, targetSite) {
  console.log(`\n[${ index + 1}/${total}] 📄 ${article.title}`);
  console.log(`  Slug: ${article.slug}`);
  console.log(`  Type: ${article.content_type}`);

  const images = {};
  const imageTypes = ['hero', 'featured', 'content_1', 'content_2', 'content_3'];

  try {
    for (const imageType of imageTypes) {
      console.log(`\n  📸 Generating ${imageType} image...`);

      // Generate prompt
      const prompt = generatePrompt(article, imageType);
      console.log(`  📝 Prompt: ${prompt.substring(0, 80)}...`);

      // Determine aspect ratio
      const aspectRatio = imageType === 'hero' ? '21:9' : imageType === 'featured' ? '16:9' : '4:3';

      // Generate image
      const generatedUrl = await generateImage(prompt, aspectRatio);

      // Upload to Cloudinary
      const publicId = `${targetSite}/${article.slug}-${imageType}`;
      const cloudinaryUrl = await uploadToCloudinary(generatedUrl, publicId, targetSite);

      images[imageType] = cloudinaryUrl;
      console.log(`  ✨ ${imageType}: Success`);

      // Small delay between images to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Update database with all images
    await updateArticleImages(article.id, images);

    console.log(`\n  🎉 Article complete! Generated ${Object.keys(images).length} images`);

    return {
      success: true,
      article: article.title,
      images_generated: Object.keys(images).length,
      images
    };

  } catch (error) {
    console.error(`\n  ❌ Failed: ${error.message}`);
    return {
      success: false,
      article: article.title,
      error: error.message,
      images_generated: Object.keys(images).length
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 QUEST UNIVERSAL IMAGE GENERATOR\n');
  console.log('═'.repeat(60));

  // Get arguments
  const targetSite = process.argv[2] || 'placement';
  const limitArg = process.argv[3];
  const limit = limitArg ? parseInt(limitArg, 10) : null;

  console.log(`📍 Target: ${targetSite}.quest`);
  if (limit) console.log(`🔢 Limit: ${limit} articles`);
  console.log('═'.repeat(60));

  // Fetch articles missing images
  let articles;
  if (limit) {
    articles = await sql`
      SELECT id, slug, title, content_type, excerpt
      FROM articles
      WHERE target_site = ${targetSite}
        AND status = 'published'
        AND content_type != 'hero'
        AND (hero_image_url IS NULL OR featured_image_url IS NULL)
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  } else {
    articles = await sql`
      SELECT id, slug, title, content_type, excerpt
      FROM articles
      WHERE target_site = ${targetSite}
        AND status = 'published'
        AND content_type != 'hero'
        AND (hero_image_url IS NULL OR featured_image_url IS NULL)
      ORDER BY created_at DESC
    `;
  }

  console.log(`\n📊 Found ${articles.length} articles needing images\n`);

  if (articles.length === 0) {
    console.log('✅ All articles already have images!');
    return;
  }

  // Process articles
  const results = [];
  for (let i = 0; i < articles.length; i++) {
    const result = await processArticle(articles[i], i, articles.length, targetSite);
    results.push(result);

    // Delay between articles
    if (i < articles.length - 1) {
      console.log('\n⏳ Waiting 3s before next article...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalImages = results.reduce((sum, r) => sum + (r.images_generated || 0), 0);

  console.log(`✅ Successful articles: ${successful}`);
  console.log(`❌ Failed articles: ${failed}`);
  console.log(`🎨 Total images generated: ${totalImages}`);

  if (failed > 0) {
    console.log('\n❌ Failed articles:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  • ${r.article}: ${r.error}`);
    });
  }

  console.log('\n🎉 Image generation complete!\n');
  console.log(`🌐 View at: https://${targetSite}.quest\n`);
}

// Run
main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
