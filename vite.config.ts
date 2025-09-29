import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),

    quasar(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use 'sass:map';
          @use '@/styles/style.scss' as *;
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
