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
  integrations: [
    vue(),
    sitemap({
      // TODO (content-needed): add custom sitemap entries for priority/changefreq
      // when real content is in place
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
