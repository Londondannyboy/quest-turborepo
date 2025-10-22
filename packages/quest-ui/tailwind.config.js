/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Financial theme (default)
        primary: {
          DEFAULT: '#0161ef',
          dark: '#0154cf',
        },
        accent: '#6d28d9',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
