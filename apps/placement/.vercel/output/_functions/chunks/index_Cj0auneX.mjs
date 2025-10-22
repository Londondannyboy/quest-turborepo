import { e as createComponent, f as createAstro, h as addAttribute, n as renderHead, o as renderSlot, r as renderTemplate } from './astro/server_BhI68pf5.mjs';
import { neon } from '@neondatabase/serverless';

const $$Astro = createAstro();
const $$Base = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Base;
  const { title, description } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title><meta name="description"${addAttribute(description, "content")}>${renderHead()}</head> <body class="min-h-screen bg-white dark:bg-gray-900"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/dankeegan/turbo-clean/packages/quest-ui/src/layouts/base.astro", void 0);

let sqlInstance = null;
function initializeSql(connectionString) {
  sqlInstance = neon(connectionString);
}
function getSql() {
  if (!sqlInstance) {
    throw new Error("SQL not initialized. Call initializeSql() first.");
  }
  return sqlInstance;
}
async function getArticles(site, options) {
  const sql = getSql();
  const { contentType, limit = 100, offset = 0 } = options || {};
  let query = `
    SELECT * FROM articles
    WHERE target_site = $1
    AND status = 'published'
  `;
  const params = [site];
  let paramIndex = 2;
  if (contentType) {
    query += ` AND content_type = $${paramIndex}`;
    params.push(contentType);
    paramIndex++;
  }
  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);
  return await sql(query, params);
}
async function getArticleBySlug(site, slug) {
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
async function getRecentArticles(site, limit = 10) {
  return getArticles(site, { limit });
}

export { $$Base as $, getRecentArticles as a, getArticleBySlug as g, initializeSql as i };
