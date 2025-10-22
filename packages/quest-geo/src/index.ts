/**
 * @quest/geo - Universal Geo-Location and Currency System
 *
 * Auto-detects user location and currency preferences for all Quest sites.
 * Supports manual currency selection with persistent preferences.
 *
 * @example
 * ```ts
 * // In Astro SSR
 * import { detectGeo, formatCurrency } from '@quest/geo';
 *
 * const geo = detectGeo(Astro.request);
 * const price = formatCurrency(150000, geo.currency); // "£150,000" or "$150,000"
 * ```
 */

export * from './types';
export * from './detect';
export * from './currency';

import { detectGeoFromRequest, getUserPreferences, mergeGeoWithPreferences } from './detect';
import type { UserPreferences, Region } from './types';

/**
 * Site-specific region overrides
 * Some Quest sites can enforce a specific region regardless of user location
 */
export interface SiteConfig {
  /** Force a specific region for this site (optional) */
  forceRegion?: Region;
  /** Default currency if geo-detection fails */
  defaultCurrency?: string;
  /** Show currency selector UI */
  showCurrencySelector?: boolean;
}

/**
 * All-in-one geo detection with site config support
 *
 * @param request - Astro/Vercel Request object
 * @param siteConfig - Optional site-specific overrides
 * @param cookies - Optional cookie object for user preferences
 * @returns User preferences (currency, region, locale)
 */
export function detectGeo(
  request: Request,
  siteConfig?: SiteConfig,
  cookies?: Record<string, string>
): UserPreferences {
  // Detect from IP
  const detected = detectGeoFromRequest(request);

  // Get user preferences from cookies
  const preferences = getUserPreferences(cookies);

  // Merge detected + preferences
  let final = mergeGeoWithPreferences(detected, preferences);

  // Apply site-specific overrides
  if (siteConfig?.forceRegion) {
    final = {
      ...final,
      region: siteConfig.forceRegion,
    };
  }

  return final;
}
