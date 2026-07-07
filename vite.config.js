import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/MesProjets/FnUs2/',
  plugins: [vue()],
  test: {
    environment: 'node',
  },
});