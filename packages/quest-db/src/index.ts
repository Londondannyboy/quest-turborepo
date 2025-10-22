import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Export neon for direct use in apps
export { neon };

// SQL instance holder
let sqlInstance: NeonQueryFunction<boolean, boolean> | null = null;

/**
 * Initialize SQL connection with connection string
 * Call this before using any query functions
 */
export function initializeSql(connectionString: string) {
  sqlInstance = neon(connectionString);
}

/**
 * Get SQL instance (must call initializeSql first)
 */
export function getSql(): NeonQueryFunction<boolean, boolean> {
  if (!sqlInstance) {
    throw new Error('SQL not initialized. Call initializeSql() first.');
  }
  return sqlInstance;
}

/**
 * Article interface matching Neon database schema
 */
export interface Article {
  id: string; // UUID
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  hero_image_url?: string;
  target_site: string;
  status: string;
  quality_score?: number;
  reading_time_minutes?: number;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
  content_image_1_url?: string;
  content_image_2_url?: string;
  content_image_3_url?: string;
  target_archetype?: string;
  surface_template?: string;
  modules_used?: string[];
  eeat_score?: number;
  cluster_id?: number;
  cluster_research_id?: number;
  research_cost?: number;
  content_type?: string;
  country?: string;
  new_slug?: string;
  quality_tier?: string;
  featured_image_url?: string;
  published_url?: string;
  industry?: string;
  industries?: string[];
  vertical?: string;
  verticals?: string[];
  tags?: string[];
}

/**
 * Get articles for a specific site
 */
export async function getArticles(
  site: string,
  options?: {
    contentType?: string;
    limit?: number;
    offset?: number;
    excludeHero?: boolean; // Exclude hero articles from results
  }
): Promise<Article[]> {
  const sql = getSql();
  const { contentType, limit = 100, offset = 0, excludeHero = false } = options || {};

  let query = `
    SELECT * FROM articles
    WHERE target_site = $1
    AND status = 'published'
  `;

  const params: any[] = [site];
  let paramIndex = 2;

  // Exclude hero articles if requested
  if (excludeHero) {
    query += ` AND (content_type IS NULL OR content_type != 'hero')`;
  }

  if (contentType) {
    query += ` AND content_type = $${paramIndex}`;
    params.push(contentType);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  return await sql(query, params);
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(
  site: string,
  slug: string
): Promise<Article | null> {
  const sql = getSql();
  const results = await sql`
    SELECT * FROM articles
    WHERE target_site = ${site}
    AND slug = ${slug}
    AND status = 'published'
    LIMIT 1
  `;

  return results[0] || null;
}

/**
 * Get recent articles for homepage (excludes hero articles)
 */
export async function getFeaturedArticles(
  site: string,
  limit: number = 5
): Promise<Article[]> {
  return getArticles(site, { limit, excludeHero: true });
}

/**
 * Get recent articles (excludes hero articles)
 */
export async function getRecentArticles(
  site: string,
  limit: number = 10
): Promise<Article[]> {
  return getArticles(site, { limit, excludeHero: true });
}

/**
 * Get hero content for homepage
 */
export async function getHeroContent(site: string): Promise<Article | null> {
  return getArticleBySlug(site, 'home');
}

/**
 * Sanitize slug to prevent XML sitemap errors
 * - Replace multiple consecutive hyphens with single hyphen
 * - Remove leading/trailing hyphens
 *
 * CRITICAL: Double hyphens (--) break XML comments and sitemaps
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .replace(/-{2,}/g, '-')  // Replace 2+ hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get all articles for sitemap generation
 * Automatically sanitizes slugs to prevent XML errors
 */
export async function getAllArticleSlugs(site: string): Promise<string[]> {
  const sql = getSql();
  const results = await sql`
    SELECT slug FROM articles
    WHERE target_site = ${site}
    AND status = 'published'
    ORDER BY created_at DESC
  `;

  return results.map((r: any) => sanitizeSlug(r.slug));
}
