import questUIConfig from '@quest/ui/tailwind.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  ...questUIConfig,
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    '../../packages/quest-ui/src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
};
