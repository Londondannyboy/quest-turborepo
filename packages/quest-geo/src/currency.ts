/**
 * Currency Formatting and Conversion
 * Universal currency utilities for all Quest sites
 */

import currency from 'currency.js';
import type { Currency, CurrencyConfig } from './types';

/**
 * Currency configurations
 */
export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    decimals: 2,
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    decimals: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    decimals: 2,
  },
};

/**
 * Approximate exchange rates (static fallback)
 * In production, these should come from an API
 */
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,
  GBP: 0.79,
  EUR: 0.92,
  SGD: 1.34,
  HKD: 7.83,
  AUD: 1.52,
};

/**
 * Format amount in target currency
 */
export function formatCurrency(
  amount: number,
  targetCurrency: Currency = 'USD',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    precision?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    precision,
  } = options;

  const config = CURRENCIES[targetCurrency];
  const decimals = precision ?? config.decimals;

  const formatted = currency(amount, {
    symbol: showSymbol ? config.symbol : '',
    precision: decimals,
  }).format();

  return showCode ? `${formatted} ${config.code}` : formatted;
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

/**
 * Format and convert in one step
 */
export function formatAndConvert(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  options?: Parameters<typeof formatCurrency>[2]
): string {
  const converted = convertCurrency(amount, fromCurrency, toCurrency);
  return formatCurrency(converted, toCurrency, options);
}

/**
 * Format large numbers (K, M, B suffix)
 */
export function formatLargeNumber(
  amount: number,
  targetCurrency?: Currency,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
  } = {}
): string {
  const { showSymbol = true, showCode = false } = options;

  const absAmount = Math.abs(amount);
  let value: number;
  let suffix: string;

  if (absAmount >= 1e9) {
    value = amount / 1e9;
    suffix = 'B';
  } else if (absAmount >= 1e6) {
    value = amount / 1e6;
    suffix = 'M';
  } else if (absAmount >= 1e3) {
    value = amount / 1e3;
    suffix = 'K';
  } else {
    value = amount;
    suffix = '';
  }

  const config = targetCurrency ? CURRENCIES[targetCurrency] : null;
  const symbol = showSymbol && config ? config.symbol : '';
  const code = showCode && config ? ` ${config.code}` : '';

  const formatted = value.toFixed(value >= 100 ? 0 : 1);

  return `${symbol}${formatted}${suffix}${code}`;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string, sourceCurrency: Currency = 'USD'): number {
  const config = CURRENCIES[sourceCurrency];
  return currency(value, {
    symbol: config.symbol,
  }).value;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: Currency): string {
  return CURRENCIES[currencyCode].symbol;
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES);
}
