/**
 * JSON-LD Schema generators for AI SEO
 * Based on Schema.org and optimized for AI search engines
 */

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description: string;
  sameAs?: string[]; // Social media URLs
}

export interface ArticleSchema {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  image?: string;
  url: string;
}

export interface WebsiteSchema {
  name: string;
  url: string;
  description: string;
}

/**
 * Generate Organization JSON-LD schema
 */
export function generateOrganizationSchema(org: OrganizationSchema): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": org.name,
    "url": org.url,
    "description": org.description,
    ...(org.logo && { "logo": org.logo }),
    ...(org.sameAs && org.sameAs.length > 0 && { "sameAs": org.sameAs })
  };

  return JSON.stringify(schema);
}

/**
 * Generate Article JSON-LD schema for blog posts
 */
export function generateArticleSchema(article: ArticleSchema): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline,
    "description": article.description,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "author": {
      "@type": "Organization",
      "name": article.author
    },
    ...(article.image && {
      "image": {
        "@type": "ImageObject",
        "url": article.image
      }
    }),
    "url": article.url
  };

  return JSON.stringify(schema);
}

/**
 * Generate Website JSON-LD schema
 */
export function generateWebsiteSchema(site: WebsiteSchema): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": site.name,
    "url": site.url,
    "description": site.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${site.url}/blog?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return JSON.stringify(schema);
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return JSON.stringify(schema);
}
