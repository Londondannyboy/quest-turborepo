import type { APIRoute } from 'astro';
import { neon } from '@neondatabase/serverless';

export const prerender = false;

/**
 * Health check endpoint for deployment validation
 * Tests database connectivity and article availability
 */
export const GET: APIRoute = async () => {
  const startTime = Date.now();

  try {
    // Check DATABASE_URL
    const databaseUrl = import.meta.env.DATABASE_URL;
    if (!databaseUrl) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'DATABASE_URL not configured',
        timestamp: new Date().toISOString(),
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test database connection
    const sql = neon(databaseUrl);
    const result = await sql`
      SELECT COUNT(*) as count
      FROM articles
      WHERE target_site = 'placement'
      AND status = 'published'
    `;

    const articleCount = result[0]?.count || 0;
    const responseTime = Date.now() - startTime;

    // Get a sample article to verify schema
    const sampleArticle = await sql`
      SELECT slug, title, created_at
      FROM articles
      WHERE target_site = 'placement'
      AND status = 'published'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return new Response(JSON.stringify({
      status: 'healthy',
      database: 'connected',
      articleCount: Number(articleCount),
      sampleArticle: sampleArticle[0] || null,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      environment: {
        hasDatabase: !!databaseUrl,
        siteName: import.meta.env.SITE_NAME || 'Placement Quest',
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    return new Response(JSON.stringify({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
