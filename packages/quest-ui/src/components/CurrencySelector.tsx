/**
 * Currency Selector Component
 * Universal currency/region selector for all Quest sites
 */

import { useState, useEffect } from 'react';
import type { Currency } from '@quest/geo';
import { CURRENCIES, getCurrencySymbol } from '@quest/geo/currency';

interface CurrencySelectorProps {
  /** Initial currency (from SSR geo-detection) */
  initialCurrency?: Currency;
  /** Callback when currency changes */
  onCurrencyChange?: (currency: Currency) => void;
  /** Show as dropdown or button group */
  variant?: 'dropdown' | 'buttons';
  /** Custom CSS class */
  className?: string;
}

export function CurrencySelector({
  initialCurrency = 'USD',
  onCurrencyChange,
  variant = 'dropdown',
  className = '',
}: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initialCurrency);
  const [isOpen, setIsOpen] = useState(false);

  // Persist currency preference in cookie
  useEffect(() => {
    if (selectedCurrency !== initialCurrency) {
      document.cookie = `quest-currency=${selectedCurrency}; path=/; max-age=31536000`; // 1 year
      onCurrencyChange?.(selectedCurrency);

      // Reload page to apply currency change
      window.location.reload();
    }
  }, [selectedCurrency, initialCurrency, onCurrencyChange]);

  const currencies = Object.values(CURRENCIES);

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {currencies.map((currency) => (
          <button
            key={currency.code}
            onClick={() => setSelectedCurrency(currency.code)}
            className={`
              px-3 py-1 rounded text-sm font-medium transition-colors
              ${selectedCurrency === currency.code
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            aria-label={`Select ${currency.name}`}
          >
            {currency.symbol} {currency.code}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Select currency"
        aria-expanded={isOpen}
      >
        <span className="font-semibold">{getCurrencySymbol(selectedCurrency)}</span>
        <span>{selectedCurrency}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 z-20 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="py-1">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    setSelectedCurrency(currency.code);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-left text-sm flex items-center justify-between
                    ${selectedCurrency === currency.code
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{currency.symbol}</span>
                    <span>{currency.name}</span>
                  </span>
                  {selectedCurrency === currency.code && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Explanation */}
            <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
              Prices shown in your selected currency
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Inline currency badge (read-only display)
 */
export function CurrencyBadge({ currency = 'USD' }: { currency?: Currency }) {
  return (
    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">
      {getCurrencySymbol(currency)} {currency}
    </span>
  );
}
