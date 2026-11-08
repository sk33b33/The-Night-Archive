/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // The app asks before activating an update (see src/app/UpdatePrompt.tsx),
      // so a stale tab never runs new code against an older page mid-session.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'The Night Archive',
        short_name: 'Night Archive',
        description:
          'An investigation game set in a government records facility. Every file has a story.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0d1117',
        theme_color: '#0d1117',
        categories: ['games', 'entertainment'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // Everything the game needs is in the build; cache it all for offline play.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,glb}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    // The 3D engine (three.js) is one lazily loaded chunk of about 1 MB (270 KB gzipped).
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // React and other dependencies change far less often than the game.
        // A separate chunk means an update only re-downloads the game's code.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          // React and the small libraries the first screen needs. The 3D engine
          // is left out on purpose: it is split off with the lazily loaded
          // reading room, so the title screen never waits for it.
          return /node_modules\/(react|react-dom|scheduler|workbox-window)\//.test(id) ? 'vendor' : undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
