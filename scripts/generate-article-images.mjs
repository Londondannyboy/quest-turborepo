#!/usr/bin/env node
/**
 * Generate AI images for articles missing featured images
 * Uses Replicate AI to generate professional images
 * Uploads to Cloudinary and updates Neon database
 */

import Replicate from 'replicate';
import { v2 as cloudinary } from 'cloudinary';
import { neon } from '@neondatabase/serverless';

// Configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Q9VMTIX2eHws@ep-steep-wildflower-abrkgyqu-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Validate environment variables
if (!REPLICATE_API_KEY) {
  console.error('❌ REPLICATE_API_KEY is required');
  process.exit(1);
}

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary credentials are required (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
  process.exit(1);
}

// Initialize services
const sql = neon(DATABASE_URL);
const replicate = new Replicate({ auth: REPLICATE_API_KEY });

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

/**
 * Generate image prompt from article title and excerpt
 */
function generatePrompt(article) {
  const title = article.title;
  const contentType = article.content_type;

  let basePrompt = '';

  if (contentType === 'company_profile') {
    basePrompt = `Professional corporate office building, modern financial district, sleek glass architecture, business district skyline, high-end investment firm atmosphere, sophisticated and elegant, photorealistic, high quality, sharp focus, natural lighting, 8k resolution`;
  } else {
    // For articles about placement agents, fundraising, private equity
    basePrompt = `Professional business scene related to "${title}", modern financial office, sophisticated corporate environment, investment banking atmosphere, elegant and professional, photorealistic, high quality, sharp focus, natural lighting, business people in professional attire, 8k resolution`;
  }

  return basePrompt;
}

/**
 * Generate image using Replicate (Flux Schnell - fast and free)
 */
async function generateImage(prompt) {
  console.log(`  🎨 Generating image...`);

  try {
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "16:9",
          output_format: "webp",
          output_quality: 90,
        }
      }
    );

    // Output is an array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;
    console.log(`  ✅ Image generated: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error(`  ❌ Error generating image:`, error.message);
    throw error;
  }
}

/**
 * Upload image to Cloudinary
 */
async function uploadToCloudinary(imageUrl, slug) {
  console.log(`  ☁️  Uploading to Cloudinary...`);

  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'placement-quest',
      public_id: slug,
      overwrite: true,
      resource_type: 'image',
    });

    console.log(`  ✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`  ❌ Error uploading to Cloudinary:`, error.message);
    throw error;
  }
}

/**
 * Update article in database
 */
async function updateArticle(id, imageUrl) {
  console.log(`  💾 Updating database...`);

  try {
    await sql`
      UPDATE articles
      SET featured_image_url = ${imageUrl},
          updated_at = NOW()
      WHERE id = ${id}
    `;
    console.log(`  ✅ Database updated`);
  } catch (error) {
    console.error(`  ❌ Error updating database:`, error.message);
    throw error;
  }
}

/**
 * Process a single article
 */
async function processArticle(article, index, total) {
  console.log(`\n[${index + 1}/${total}] Processing: ${article.title}`);
  console.log(`  Slug: ${article.slug}`);

  try {
    // Generate prompt
    const prompt = generatePrompt(article);
    console.log(`  📝 Prompt: ${prompt.substring(0, 100)}...`);

    // Generate image
    const generatedImageUrl = await generateImage(prompt);

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(generatedImageUrl, article.slug);

    // Update database
    await updateArticle(article.id, cloudinaryUrl);

    console.log(`  ✨ Success!`);
    return { success: true, article: article.title };
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return { success: false, article: article.title, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting AI Image Generation for Placement Quest\n');

  // Get target site from args or default to 'placement'
  const targetSite = process.argv[2] || 'placement';
  const limitArg = process.argv[3];
  const limit = limitArg ? parseInt(limitArg, 10) : null;

  console.log(`Target site: ${targetSite}`);
  if (limit) {
    console.log(`Limit: ${limit} articles\n`);
  }

  // Fetch articles without images
  let query = sql`
    SELECT id, slug, title, content_type, excerpt
    FROM articles
    WHERE target_site = ${targetSite}
      AND (featured_image_url IS NULL OR featured_image_url = '')
      AND status = 'published'
      AND content_type != 'hero'
    ORDER BY created_at DESC
  `;

  if (limit) {
    query = sql`
      SELECT id, slug, title, content_type, excerpt
      FROM articles
      WHERE target_site = ${targetSite}
        AND (featured_image_url IS NULL OR featured_image_url = '')
        AND status = 'published'
        AND content_type != 'hero'
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }

  const articles = await query;

  console.log(`Found ${articles.length} articles without images\n`);

  if (articles.length === 0) {
    console.log('✅ All articles already have images!');
    return;
  }

  // Process articles
  const results = [];
  for (let i = 0; i < articles.length; i++) {
    const result = await processArticle(articles[i], i, articles.length);
    results.push(result);

    // Small delay between requests to avoid rate limiting
    if (i < articles.length - 1) {
      console.log('  ⏳ Waiting 2s before next article...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed articles:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.article}: ${r.error}`);
    });
  }

  console.log('\n🎉 Done!\n');
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
