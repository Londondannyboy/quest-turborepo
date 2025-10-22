const questUIConfig = require('@quest/ui/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...questUIConfig,
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    '../../packages/quest-ui/src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
};
