/**
 * Quest Geo-Location Types
 * Universal geo-detection and currency system for all Quest sites
 */

export type Region = 'US' | 'UK' | 'EU' | 'ASIA' | 'OTHER';

export type Currency = 'USD' | 'GBP' | 'EUR' | 'SGD' | 'HKD' | 'AUD';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  decimals: number;
}

export interface RegionConfig {
  region: Region;
  currency: Currency;
  timezone: string;
  dateFormat: string;
  numberFormat: 'US' | 'EU';
}

export interface GeoLocation {
  country: string;
  countryCode: string;
  region: Region;
  city?: string;
  currency: Currency;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

export interface UserPreferences {
  currency: Currency;
  region: Region;
  locale: string;
}
