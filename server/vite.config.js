import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: 'server.js', // Adjust to your server's main file
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'server.js' // Output file name
      }
    }
  }
});