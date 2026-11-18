import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: './',
  plugins: [vue()],
  // Avoid unnecessary Windows realpath calls in restricted workspaces.
  resolve: { preserveSymlinks: true },
  build: {
    target: 'esnext',
    minify: 'terser',
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: { manualChunks: { three: ['three', 'three/addons/controls/OrbitControls.js'], astronomy: ['astronomy-engine'] } },
    },
  },
});
