/**
 * @quest/seo - Shared SEO utilities for all Quest apps
 * Optimized for AI search engines (ChatGPT, Perplexity, etc.)
 */

export * from './schemas';

/**
 * Site configuration interface
 * Each app should provide this configuration
 */
export interface SiteConfig {
  name: string;
  url: string;
  description: string;
  logo?: string;
  defaultImage?: string;
  twitterHandle?: string;
  author: string;
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(config: {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  return {
    title: config.title,
    description: config.description,
    canonical: config.url,
    openGraph: {
      type: config.type || 'website',
      url: config.url,
      title: config.title,
      description: config.description,
      ...(config.image && { image: config.image }),
      ...(config.publishedTime && { publishedTime: config.publishedTime }),
      ...(config.modifiedTime && { modifiedTime: config.modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      url: config.url,
      title: config.title,
      description: config.description,
      ...(config.image && { image: config.image }),
    }
  };
}
