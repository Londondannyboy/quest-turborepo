# @quest/geo - Universal Geo-Location System

Auto-detects user location, currency, and regional preferences for all Quest sites.

## Features

✅ **IP-based geo-detection** using Vercel Edge Network
✅ **Automatic currency detection** (USD, GBP, EUR, SGD, HKD, AUD)
✅ **User preference persistence** via cookies
✅ **Site-specific region overrides** (force UK for certain sites)
✅ **Currency conversion** with formatting utilities
✅ **React UI components** for currency selector

---

## Quick Start

### 1. Install

Already included in turbo-clean monorepo.

### 2. Use in Astro Pages

```astro
---
// apps/placement/src/pages/index.astro
import { detectGeo, formatCurrency, formatLargeNumber } from '@quest/geo';
import { CurrencySelector } from '@quest/ui/components/CurrencySelector';

// Auto-detect user's location and currency
const userPrefs = detectGeo(Astro.request, {
  // Optional: Force specific region for this site
  forceRegion: 'UK', // or 'US', 'EU', 'ASIA'
  showCurrencySelector: true,
});

const { currency, region, locale } = userPrefs;
---

<html>
  <body>
    <!-- Show currency selector in header -->
    <CurrencySelector client:load initialCurrency={currency} />

    <!-- Display prices in user's currency -->
    <p>Management Fee: {formatCurrency(150000, currency)}</p>
    <!-- Output: "£150,000" (UK) or "$150,000" (US) -->

    <p>Fund Size: {formatLargeNumber(500000000, currency)}</p>
    <!-- Output: "£500M" or "$500M" -->
  </body>
</html>
```

### 3. Site-Specific Configuration

```typescript
// apps/placement/src/config.ts
import type { SiteConfig } from '@quest/geo';

export const GEO_CONFIG: SiteConfig = {
  // Optional: Force UK for placement.quest
  forceRegion: 'UK',

  // Show currency selector
  showCurrencySelector: true,

  // Fallback if geo-detection fails
  defaultCurrency: 'GBP',
};
```

### 4. Convert Between Currencies

```typescript
import { convertCurrency, formatAndConvert } from '@quest/geo/currency';

// Convert $1M USD to GBP
const gbpAmount = convertCurrency(1000000, 'USD', 'GBP'); // ~£790,000

// Convert and format in one step
const formatted = formatAndConvert(1000000, 'USD', 'EUR'); // "€920,000"
```

---

## API Reference

### `detectGeo(request, siteConfig?, cookies?)`

Main function to detect user's geo-location and preferences.

**Parameters:**
- `request` - Astro Request object
- `siteConfig` - Optional site-specific overrides
- `cookies` - Optional cookie object

**Returns:** `UserPreferences { currency, region, locale }`

**Example:**
```typescript
const prefs = detectGeo(Astro.request, {
  forceRegion: 'UK',
  showCurrencySelector: true,
});
```

---

### `formatCurrency(amount, currency, options?)`

Format number as currency string.

**Parameters:**
- `amount` - Number to format
- `currency` - Target currency code
- `options` - Optional formatting config

**Returns:** Formatted string

**Example:**
```typescript
formatCurrency(150000, 'GBP'); // "£150,000"
formatCurrency(150000, 'USD', { showCode: true }); // "$150,000 USD"
```

---

### `formatLargeNumber(amount, currency?, options?)`

Format large numbers with K/M/B suffixes.

**Example:**
```typescript
formatLargeNumber(1500000, 'USD'); // "$1.5M"
formatLargeNumber(25000000000, 'GBP'); // "£25B"
```

---

### `convertCurrency(amount, from, to)`

Convert between currencies using approximate exchange rates.

**Example:**
```typescript
convertCurrency(1000, 'USD', 'GBP'); // ~790
convertCurrency(1000, 'GBP', 'EUR'); // ~1164
```

---

## Supported Currencies

| Code | Symbol | Name |
|------|--------|------|
| USD | $ | US Dollar |
| GBP | £ | British Pound |
| EUR | € | Euro |
| SGD | S$ | Singapore Dollar |
| HKD | HK$ | Hong Kong Dollar |
| AUD | A$ | Australian Dollar |

---

## How It Works

### 1. Server-Side Detection (SSR)

On initial page load, Vercel's Edge Network provides geo headers:
- `x-vercel-ip-country` → Country code (US, GB, FR, etc.)
- `x-vercel-ip-city` → City name
- `x-vercel-ip-timezone` → Timezone

These are automatically mapped to:
- **Region:** US, UK, EU, ASIA, OTHER
- **Currency:** USD, GBP, EUR, SGD, HKD, AUD

### 2. User Preferences (Cookies)

When user manually selects currency via `<CurrencySelector>`:
- Sets `quest-currency` cookie
- Reloads page with new currency
- All prices update automatically

### 3. Priority Order

1. **User's cookie preference** (if exists)
2. **Site-specific override** (if configured)
3. **IP-based detection** (fallback)

---

## Examples

### Placement.quest (UK-focused)

```astro
---
const prefs = detectGeo(Astro.request, {
  forceRegion: 'UK', // Always show £ prices
});
---

<p>Typical placement fee: {formatCurrency(2500000, prefs.currency)}</p>
<!-- Output: "£2.5M" for all users -->
```

### Relocation.quest (Global)

```astro
---
const prefs = detectGeo(Astro.request, {
  // No force - auto-detect user's location
  showCurrencySelector: true,
});
---

<CurrencySelector client:load initialCurrency={prefs.currency} />

<p>Average relocation cost: {formatCurrency(15000, prefs.currency)}</p>
<!-- Output: "$15,000" (US), "£15,000" (UK), "€15,000" (EU) -->
```

### MBA.quest (US-focused)

```astro
---
const prefs = detectGeo(Astro.request, {
  forceRegion: 'US', // MBA costs typically in USD
});
---

<p>Tuition: {formatCurrency(75000, 'USD')}</p>
<!-- Always show USD -->
```

---

## Future Enhancements

- [ ] Real-time exchange rate API (currently uses static rates)
- [ ] More currencies (JPY, CNY, INR, etc.)
- [ ] Date/time formatting based on region
- [ ] Number formatting (1,000 vs 1.000)
- [ ] A/B testing different currency defaults

---

## Testing

```bash
# Test with different geo headers
curl -H "x-vercel-ip-country: GB" https://placement.quest
# Should detect UK region, show £ prices

curl -H "x-vercel-ip-country: US" https://relocation.quest
# Should detect US region, show $ prices
```

---

**Questions?** This system is now baked into ALL Quest sites at the turbo-clean level.
