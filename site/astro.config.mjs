// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script',
        manifest: {
          name: 'Receitas da Wivian',
          short_name: 'Wivian',
          description: 'Coleção de receitas deliciosas',
          theme_color: '#7c3aed',
          background_color: '#f5f3ff',
          display: 'standalone',
          start_url: '/',
          lang: 'pt-BR',
          icons: [
            { src: 'images/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png' },
            { src: 'images/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
            { src: 'images/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
            { src: 'images/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
            { src: 'images/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
            { src: 'images/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'images/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
            { src: 'images/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{html,css,js,svg,png,ico,woff,woff2}'],
          navigateFallback: '/',
        },
      }),
    ],
  },
});
