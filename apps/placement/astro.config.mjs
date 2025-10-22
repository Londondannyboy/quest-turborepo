import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind({
    applyBaseStyles: false, // We'll handle this in global.css
  })],
});
