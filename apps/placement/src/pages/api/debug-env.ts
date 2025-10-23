export const prerender = false;

export async function GET() {
  return new Response(
    JSON.stringify({
      hasDatabaseUrl: !!import.meta.env.DATABASE_URL,
      siteName: import.meta.env.SITE_NAME || 'NOT SET',
      nodeEnv: import.meta.env.NODE_ENV || 'NOT SET',
      extractedSite: (import.meta.env.SITE_NAME?.split(' ')[0] || 'placement').toLowerCase(),
    }, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
