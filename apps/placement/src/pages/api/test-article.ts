export const prerender = false;

import { initializeSql, getArticleBySlug } from '@quest/db';

export async function GET() {
  try {
    const databaseUrl = import.meta.env.DATABASE_URL;
    if (!databaseUrl) {
      return new Response(
        JSON.stringify({ error: 'DATABASE_URL not set' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    initializeSql(databaseUrl);

    const testSlug = 'top-private-equity-placement-agents-london';
    const article = await getArticleBySlug('placement', testSlug);

    return new Response(
      JSON.stringify({
        success: true,
        found: !!article,
        slug: testSlug,
        title: article?.title || 'N/A',
        hasContent: !!article?.content,
        contentLength: article?.content?.length || 0,
      }, null, 2),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
