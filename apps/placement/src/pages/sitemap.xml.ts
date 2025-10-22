import type { APIRoute } from 'astro';
import { initializeSql, getRecentArticles } from '@quest/db';

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  // Initialize database
  const databaseUrl = import.meta.env.DATABASE_URL;
  if (!databaseUrl) {
    return new Response('DATABASE_URL not configured', { status: 500 });
  }

  initializeSql(databaseUrl);

  // Get site info
  const siteName = (import.meta.env.SITE_NAME?.split(' ')[0] || 'placement').toLowerCase();
  const baseUrl = site?.toString() || `https://${siteName}.quest`;

  // Fetch all published articles
  const articles = await getRecentArticles(siteName, 1000);

  // Build sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Articles Page -->
  <url>
    <loc>${baseUrl}/articles</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Individual Articles -->
${articles.map((article) => `  <url>
    <loc>${baseUrl}/${article.slug}</loc>
    <lastmod>${article.updated_at || article.created_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
