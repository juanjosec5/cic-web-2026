// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ciclaboratorios.com',
  output: 'static',
  adapter: vercel(),
  // Origin checking is done in src/middleware.ts against x-forwarded-host;
  // Astro's built-in check compares against the serverless function's internal
  // origin (localhost on Vercel) and 403s every legitimate browser POST.
  security: { checkOrigin: false },
  // Astro 7 defaults to 'jsx' whitespace collapsing, which can drop spaces
  // between inline elements; keep the v5/v6 behavior.
  compressHTML: true,
  integrations: [
    vue(),
    sitemap({
      changefreq: 'weekly',
      filter: (page) =>
        !page.includes('/estados-financieros') &&
        !page.includes('/nosotros/historia'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
