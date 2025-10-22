/**
 * Theme Utility for Quest Sites
 * Determines which DaisyUI theme to apply based on THEME_VARIANT env variable
 */

export type ThemeVariant = 'financial' | 'relocation' | 'education';

export interface ThemeConfig {
  light: string;
  dark: string;
  heroImage?: string;
  heroVideo?: string;
}

/**
 * Default theme configurations
 */
export const THEME_CONFIGS: Record<ThemeVariant, ThemeConfig> = {
  financial: {
    light: 'financial',
    dark: 'financial-dark',
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80', // Corporate office
  },
  relocation: {
    light: 'relocation',
    dark: 'relocation-dark',
    heroImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80', // City skyline
  },
  education: {
    light: 'education',
    dark: 'education-dark',
    heroImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80', // Campus/university
  },
};

/**
 * Get theme configuration for the current site
 * Reads from THEME_VARIANT environment variable
 */
export function getThemeConfig(themeVariant?: string): ThemeConfig {
  const variant = (themeVariant?.toLowerCase() || 'financial') as ThemeVariant;
  return THEME_CONFIGS[variant] || THEME_CONFIGS.financial;
}

/**
 * Get the current theme name (light or dark)
 * This will be used in the data-theme attribute
 */
export function getThemeName(themeVariant?: string, isDark = false): string {
  const config = getThemeConfig(themeVariant);
  return isDark ? config.dark : config.light;
}

/**
 * Get hero content (image or video) with fallback chain:
 * 1. HERO_VIDEO_URL (if provided)
 * 2. HERO_IMAGE_URL (if provided)
 * 3. Default theme-based image
 */
export function getHeroContent(env: {
  THEME_VARIANT?: string;
  HERO_VIDEO_URL?: string;
  HERO_IMAGE_URL?: string;
}): { type: 'video' | 'image'; url: string } {
  if (env.HERO_VIDEO_URL) {
    return { type: 'video', url: env.HERO_VIDEO_URL };
  }

  if (env.HERO_IMAGE_URL) {
    return { type: 'image', url: env.HERO_IMAGE_URL };
  }

  const config = getThemeConfig(env.THEME_VARIANT);
  return {
    type: 'image',
    url: config.heroImage || THEME_CONFIGS.financial.heroImage!,
  };
}
