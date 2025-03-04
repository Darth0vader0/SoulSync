import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Ensures 'global' is defined
    'process.env': {}, // Fix process-related issues
  },
  resolve: {
    alias: {
      buffer: 'buffer/', // Ensure Buffer is polyfilled
      process: 'process/browser', // Polyfill process for browser use
    },
  },
});
