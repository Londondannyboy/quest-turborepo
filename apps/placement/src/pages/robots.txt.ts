import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ site }) => {
  // Get site info
  const siteName = (import.meta.env.SITE_NAME?.split(' ')[0] || 'placement').toLowerCase();
  const baseUrl = site?.toString() || `https://${siteName}.quest`;

  const robotsTxt = `# Robots.txt for ${siteName}.quest
User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
};
