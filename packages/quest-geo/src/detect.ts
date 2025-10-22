/**
 * Geo-Location Detection
 * Server-side IP-based detection + client-side preference management
 */

import type { GeoLocation, Region, Currency, UserPreferences } from './types';

/**
 * Country code to region mapping
 */
const COUNTRY_TO_REGION: Record<string, Region> = {
  // North America
  'US': 'US',
  'CA': 'US', // Canada uses USD in many contexts
  'MX': 'US',

  // United Kingdom
  'GB': 'UK',
  'IE': 'UK', // Ireland often grouped with UK

  // Europe
  'DE': 'EU', 'FR': 'EU', 'IT': 'EU', 'ES': 'EU', 'NL': 'EU',
  'BE': 'EU', 'AT': 'EU', 'PT': 'EU', 'GR': 'EU', 'FI': 'EU',
  'SE': 'EU', 'DK': 'EU', 'NO': 'EU', 'CH': 'EU', 'PL': 'EU',
  'CZ': 'EU', 'HU': 'EU', 'RO': 'EU', 'BG': 'EU',

  // Asia-Pacific
  'SG': 'ASIA', 'HK': 'ASIA', 'CN': 'ASIA', 'JP': 'ASIA',
  'KR': 'ASIA', 'IN': 'ASIA', 'AU': 'ASIA', 'NZ': 'ASIA',
  'MY': 'ASIA', 'TH': 'ASIA', 'ID': 'ASIA', 'PH': 'ASIA',
  'VN': 'ASIA', 'TW': 'ASIA',
};

/**
 * Region to default currency mapping
 */
const REGION_TO_CURRENCY: Record<Region, Currency> = {
  'US': 'USD',
  'UK': 'GBP',
  'EU': 'EUR',
  'ASIA': 'USD', // USD is common in Asia
  'OTHER': 'USD',
};

/**
 * Country-specific currency overrides
 */
const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  'SG': 'SGD',
  'HK': 'HKD',
  'AU': 'AUD',
  'NZ': 'AUD',
  'GB': 'GBP',
  'IE': 'EUR',
};

/**
 * Detect geo-location from Vercel request headers
 * Works with Vercel Edge Network's geo-detection
 */
export function detectGeoFromHeaders(headers: Headers): GeoLocation {
  const country = headers.get('x-vercel-ip-country') || 'US';
  const countryCode = country.toUpperCase();
  const city = headers.get('x-vercel-ip-city');
  const latitude = parseFloat(headers.get('x-vercel-ip-latitude') || '0');
  const longitude = parseFloat(headers.get('x-vercel-ip-longitude') || '0');
  const timezone = headers.get('x-vercel-ip-timezone') || 'America/New_York';

  const region = COUNTRY_TO_REGION[countryCode] || 'OTHER';
  const currency = COUNTRY_TO_CURRENCY[countryCode] || REGION_TO_CURRENCY[region];

  return {
    country: countryCode,
    countryCode,
    region,
    city: city || undefined,
    currency,
    timezone,
    latitude: latitude || undefined,
    longitude: longitude || undefined,
  };
}

/**
 * Detect geo-location from Request object (Astro SSR)
 */
export function detectGeoFromRequest(request: Request): GeoLocation {
  return detectGeoFromHeaders(request.headers);
}

/**
 * Get user preferences from cookies/localStorage
 */
export function getUserPreferences(cookies?: Record<string, string>): UserPreferences | null {
  if (!cookies) return null;

  const currency = cookies['quest-currency'] as Currency;
  const region = cookies['quest-region'] as Region;
  const locale = cookies['quest-locale'] || 'en-US';

  if (!currency || !region) return null;

  return { currency, region, locale };
}

/**
 * Merge detected geo with user preferences (preferences take priority)
 */
export function mergeGeoWithPreferences(
  geo: GeoLocation,
  preferences: UserPreferences | null
): UserPreferences {
  return {
    currency: preferences?.currency || geo.currency,
    region: preferences?.region || geo.region,
    locale: preferences?.locale || getLocaleForRegion(geo.region),
  };
}

/**
 * Get locale string for region
 */
function getLocaleForRegion(region: Region): string {
  switch (region) {
    case 'US': return 'en-US';
    case 'UK': return 'en-GB';
    case 'EU': return 'en-EU';
    case 'ASIA': return 'en-SG';
    default: return 'en-US';
  }
}

/**
 * Browser-only: Detect timezone from Intl API
 */
export function detectClientTimezone(): string {
  if (typeof Intl === 'undefined') return 'America/New_York';
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Browser-only: Detect locale from navigator
 */
export function detectClientLocale(): string {
  if (typeof navigator === 'undefined') return 'en-US';
  return navigator.language || 'en-US';
}
