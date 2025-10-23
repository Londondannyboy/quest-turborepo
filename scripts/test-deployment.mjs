#!/usr/bin/env node

/**
 * Deployment Testing Script
 *
 * Tests a deployed Vercel preview or production URL to ensure:
 * 1. Database connectivity works
 * 2. Article pages render correctly
 * 3. No 500 errors on published articles
 *
 * Usage:
 *   DEPLOYMENT_URL=https://turbo-p.vercel.app node scripts/test-deployment.mjs
 */

import { neon } from '@neondatabase/serverless';

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://turbo-p.vercel.app';
const DATABASE_URL = process.env.DATABASE_URL;
const TEST_ARTICLE_COUNT = 5;

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, icon, message) {
  console.log(`${colors[color]}${icon} ${message}${colors.reset}`);
}

async function testHealthEndpoint() {
  log('blue', '🏥', `Testing health endpoint: ${DEPLOYMENT_URL}/api/health`);

  try {
    const response = await fetch(`${DEPLOYMENT_URL}/api/health`);
    const data = await response.json();

    if (response.status === 200 && data.status === 'healthy') {
      log('green', '✅', `Health check passed - ${data.articleCount} articles available`);
      log('blue', '⏱️', `Response time: ${data.responseTime}`);
      return { success: true, data };
    } else {
      log('red', '❌', `Health check failed: ${data.message || 'Unknown error'}`);
      return { success: false, error: data.message };
    }
  } catch (error) {
    log('red', '❌', `Health endpoint error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function getRandomArticleSlugs() {
  if (!DATABASE_URL) {
    log('yellow', '⚠️', 'DATABASE_URL not set, using default test articles');
    return [
      'top-private-equity-placement-agents-london',
      'private-equity-placement-agent-fees-and-pricing',
      'apollos-25b-infrastructure-fund-signals-new-era-for-placement-agents-oct-2025'
    ];
  }

  try {
    const sql = neon(DATABASE_URL);
    const articles = await sql`
      SELECT slug FROM articles
      WHERE target_site = 'placement'
      AND status = 'published'
      ORDER BY RANDOM()
      LIMIT ${TEST_ARTICLE_COUNT}
    `;

    return articles.map(a => a.slug);
  } catch (error) {
    log('red', '❌', `Database query failed: ${error.message}`);
    throw error;
  }
}

async function testArticle(slug) {
  const url = `${DEPLOYMENT_URL}/${slug}`;
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      redirect: 'manual', // Don't follow redirects automatically
    });

    const responseTime = Date.now() - startTime;

    // Check if it's a redirect (should not be for valid articles)
    if (response.status === 301 || response.status === 302 || response.status === 307) {
      log('red', '❌', `Article redirects: ${url} → ${response.headers.get('location')}`);
      return {
        slug,
        url,
        success: false,
        status: response.status,
        error: 'Unexpected redirect',
        responseTime
      };
    }

    // Check status code
    if (response.status !== 200) {
      log('red', '❌', `Article failed (${response.status}): ${url}`);
      return {
        slug,
        url,
        success: false,
        status: response.status,
        error: `HTTP ${response.status}`,
        responseTime
      };
    }

    // Check content
    const html = await response.text();

    // Validate HTML contains expected elements
    const hasTitle = html.includes('<h1') || html.includes('headline');
    const hasContent = html.length > 5000; // Articles should be substantial
    const hasError = html.includes('Internal Server Error') ||
                     html.includes('500') ||
                     html.includes('Error fetching article');

    if (hasError) {
      log('red', '❌', `Article has error: ${url}`);
      return {
        slug,
        url,
        success: false,
        status: 200,
        error: 'Error in content',
        responseTime
      };
    }

    if (!hasTitle || !hasContent) {
      log('yellow', '⚠️', `Article missing content: ${url} (length: ${html.length})`);
      return {
        slug,
        url,
        success: false,
        status: 200,
        error: 'Missing content',
        responseTime
      };
    }

    log('green', '✅', `Article OK (${responseTime}ms): ${url}`);
    return {
      slug,
      url,
      success: true,
      status: 200,
      responseTime
    };

  } catch (error) {
    log('red', '❌', `Network error: ${url} - ${error.message}`);
    return {
      slug,
      url,
      success: false,
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log('blue', '🧪', `Testing Deployment: ${DEPLOYMENT_URL}`);
  console.log('='.repeat(60) + '\n');

  const results = {
    health: null,
    articles: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      avgResponseTime: 0
    }
  };

  // Test 1: Health endpoint
  log('blue', '📋', 'Step 1: Health Check');
  results.health = await testHealthEndpoint();
  console.log();

  if (!results.health.success) {
    log('red', '💥', 'Health check failed - aborting further tests');
    process.exit(1);
  }

  // Test 2: Article rendering
  log('blue', '📋', `Step 2: Testing ${TEST_ARTICLE_COUNT} Random Articles`);

  try {
    const slugs = await getRandomArticleSlugs();
    log('blue', '📄', `Testing articles: ${slugs.join(', ')}`);
    console.log();

    for (const slug of slugs) {
      const result = await testArticle(slug);
      results.articles.push(result);
    }
  } catch (error) {
    log('red', '💥', `Failed to get articles: ${error.message}`);
    process.exit(1);
  }

  // Calculate summary
  console.log('\n' + '='.repeat(60));
  log('blue', '📊', 'Test Summary');
  console.log('='.repeat(60) + '\n');

  results.summary.total = results.articles.length;
  results.summary.passed = results.articles.filter(a => a.success).length;
  results.summary.failed = results.summary.total - results.summary.passed;
  results.summary.avgResponseTime = Math.round(
    results.articles.reduce((sum, a) => sum + (a.responseTime || 0), 0) / results.summary.total
  );

  log('blue', '📈', `Total tests: ${results.summary.total}`);
  log('green', '✅', `Passed: ${results.summary.passed}`);
  log('red', '❌', `Failed: ${results.summary.failed}`);
  log('blue', '⏱️', `Avg response time: ${results.summary.avgResponseTime}ms`);

  // List failures
  if (results.summary.failed > 0) {
    console.log('\n' + '='.repeat(60));
    log('red', '💥', 'Failed Tests:');
    console.log('='.repeat(60) + '\n');

    results.articles
      .filter(a => !a.success)
      .forEach(a => {
        log('red', '❌', `${a.slug}`);
        log('red', '  ', `  Error: ${a.error}`);
        log('red', '  ', `  URL: ${a.url}`);
      });
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Exit with appropriate code
  if (results.summary.failed > 0) {
    log('red', '💥', 'DEPLOYMENT TEST FAILED');
    process.exit(1);
  } else {
    log('green', '🎉', 'ALL TESTS PASSED');
    process.exit(0);
  }
}

// Run tests
main().catch(error => {
  log('red', '💥', `Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
