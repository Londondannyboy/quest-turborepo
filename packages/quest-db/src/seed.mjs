import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

const homepageContent = [
  {
    target_site: 'placement',
    headline: 'Navigate the Evolving Landscape of Investment Placement',
    content: '<p>Explore cutting-edge insights into private equity placement, LP/GP relationships, and fundraising strategies shaping the investment industry.</p>'
  },
  {
    target_site: 'relocation',
    headline: 'Transforming Corporate Mobility in a Hybrid World',
    content: '<p>Stay ahead of global mobility trends, talent relocation strategies, and remote work policies redefining corporate relocation.</p>'
  },
  {
    target_site: 'mba',
    headline: 'Chart Your Path to Business Leadership',
    content: '<p>Discover MBA program rankings, ROI analysis, and career guidance to make informed decisions about your business education journey.</p>'
  },
  {
    target_site: 'graduation',
    headline: 'Launch Your Career with Confidence',
    content: '<p>Navigate graduate hiring trends, explore career pivots, and develop the skills that top employers are seeking in today\'s job market.</p>'
  },
  {
    target_site: 'thechief',
    headline: 'Leadership Intelligence for Modern Executives',
    content: '<p>Essential insights on CEO strategies, board governance, and executive compensation for C-suite leaders navigating today\'s business landscape.</p>'
  },
  {
    target_site: 'consultancy',
    headline: 'Insights from the Front Lines of Business Transformation',
    content: '<p>Track consulting firm strategies, project delivery innovations, and industry trends shaping the management consulting landscape.</p>'
  },
  {
    target_site: 'pvc',
    headline: 'Tracking the Pulse of Venture Capital',
    content: '<p>Follow VC funding rounds, startup ecosystem dynamics, and emerging sectors capturing private venture capital attention.</p>'
  },
  {
    target_site: 'rainmaker',
    headline: 'Build Your Reputation as a Revenue Driver',
    content: '<p>Master business development, client acquisition, and sales leadership strategies that define successful rainmakers across industries.</p>'
  }
];

console.log('🚀 Seeding Neon with homepage hero content for 8 Quest sites...\n');

try {
  for (const site of homepageContent) {
    const result = await sql`
      INSERT INTO articles (
        target_site,
        content_type,
        slug,
        title,
        content,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${site.target_site},
        'hero',
        'home',
        ${site.headline},
        ${site.content},
        'published',
        NOW(),
        NOW()
      )
      ON CONFLICT ON CONSTRAINT unique_slug_per_site
      DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        updated_at = NOW()
      RETURNING target_site, title;
    `;

    console.log(`✅ ${site.target_site}.quest: ${result[0].title}`);
  }

  console.log('\n✨ All 8 homepage hero contents created successfully!');
  console.log('\nNext: Test placement app locally, then deploy to Vercel');

} catch (error) {
  console.error('❌ Error seeding Neon:', error);
  process.exit(1);
}
