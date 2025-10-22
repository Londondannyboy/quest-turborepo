#!/usr/bin/env node
/**
 * Generate Category Hero Images for Quest Sites
 * Uses Replicate Ideogram V3 Turbo → Cloudinary
 *
 * Category Images:
 * - /articles → "Latest Articles" hero banner
 * - /cities → "Global Cities" hero banner
 * - /top-agents → "Top Placement Agents" hero banner
 */

import Replicate from 'replicate';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Replicate (requires REPLICATE_API_KEY env var)
if (!process.env.REPLICATE_API_KEY) {
  console.error('❌ REPLICATE_API_KEY environment variable is required');
  process.exit(1);
}
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY
});

// Initialize Cloudinary (requires env vars)
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables are required');
  process.exit(1);
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Category definitions per site
const CATEGORIES = {
  placement: [
    {
      slug: 'articles',
      title: 'Latest Articles',
      description: 'Professional business news banner with neon outline accents',
      theme: 'modern financial district skyline with data visualizations and neon outline highlights',
    },
    {
      slug: 'cities',
      title: 'Global Financial Centers',
      description: 'World map with major financial cities highlighted',
      theme: 'world map with glowing city markers, professional financial aesthetic with neon outline accents',
    },
    {
      slug: 'top-agents',
      title: 'Top Placement Agents',
      description: 'Professional network visualization banner',
      theme: 'corporate office boardroom with network connections and neon outline highlights',
    },
  ],
  relocation: [
    {
      slug: 'articles',
      title: 'Relocation Insights',
      description: 'International city skyline banner',
      theme: 'modern international cityscape with travel elements and neon outline glow accents',
    },
    {
      slug: 'cities',
      title: 'Global Cities Guide',
      description: 'World destinations with landmarks',
      theme: 'world map with famous landmarks and glowing city markers, neon outline aesthetic',
    },
  ],
  rainmaker: [
    {
      slug: 'articles',
      title: 'Rainmaker Insights',
      description: 'Entrepreneurial business growth banner',
      theme: 'entrepreneurial office scene with growth charts and neon outline highlights',
    },
  ],
};

/**
 * Generate a single category image
 */
async function generateCategoryImage(site, category) {
  const { slug, title, description, theme } = category;

  console.log(`\n🎨 Generating ${site}/${slug} hero image...`);

  // Build prompt with neon aesthetic
  const prompt = `
Photorealistic professional ${theme}.
Banner image with bold neon text overlay reading "${title}".
Text placement: center, large bold font, glowing neon effect.
Composition: ultra-wide 3:1 aspect ratio, hero banner style.
Aesthetic: subtle neon outline glow on key subjects, cyberpunk-inspired rim lighting.
Professional, modern, futuristic aesthetic.
NO faces looking at camera, NO people in foreground, NO text besides "${title}".
  `.trim();

  const negativePrompt = "faces to camera, people in foreground, unwanted text, random words, watermark, logo, unrelated typography, low quality, blurry, distorted, amateur, cartoon, illustration, drawing, 3d render";

  try {
    // Generate with Ideogram V3 Turbo (latest version)
    const output = await replicate.run(
      "ideogram-ai/ideogram-v3-turbo",
      {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          aspect_ratio: "3:1", // Ultra-wide hero banner
          magic_prompt_option: "Auto"
        }
      }
    );

    console.log(`✅ Image generated`);

    // Handle FileOutput (ReadableStream) from Replicate
    let imageUrl;
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      // If array, take first element
      const firstOutput = output[0];
      imageUrl = typeof firstOutput === 'string' ? firstOutput : firstOutput.url();
    } else if (output && typeof output.url === 'function') {
      // FileOutput has a url() method
      imageUrl = output.url();
    } else {
      throw new Error('Unable to extract image URL from Replicate output');
    }

    // Convert URL object to string if needed
    const imageUrlString = typeof imageUrl === 'string' ? imageUrl : imageUrl.toString();
    console.log(`📥 Downloading from:`, imageUrlString);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageUrlString, {
      folder: `quest/${site}/categories`,
      public_id: `${slug}-hero`,
      overwrite: true,
      resource_type: 'image',
    });

    console.log(`☁️  Uploaded to Cloudinary:`, uploadResult.secure_url);

    return {
      site,
      slug,
      title,
      cloudinaryUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (error) {
    console.error(`❌ Error generating ${site}/${slug}:`, error.message);
    return null;
  }
}

/**
 * Generate all category images for a site
 */
async function generateSiteCategories(site) {
  const categories = CATEGORIES[site];
  if (!categories) {
    console.log(`⚠️  No categories defined for ${site}`);
    return [];
  }

  console.log(`\n🚀 Generating category images for ${site}...`);

  const results = [];
  for (const category of categories) {
    const result = await generateCategoryImage(site, category);
    if (result) {
      results.push(result);
    }
    // Rate limit: wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  const targetSite = process.argv[2] || 'placement';

  console.log(`\n🎯 Quest Category Image Generator`);
  console.log(`   Target Site: ${targetSite}`);

  const results = await generateSiteCategories(targetSite);

  console.log(`\n✅ Generated ${results.length} category images:`);
  results.forEach(r => {
    console.log(`   ${r.site}/${r.slug}: ${r.cloudinaryUrl}`);
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateCategoryImage, generateSiteCategories };
