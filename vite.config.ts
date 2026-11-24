import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative asset paths: the site must work both at a domain root and under
  // a GitHub Pages project path like /KidsVidz/.
  base: './',
  plugins: [react(), tailwindcss()],
});
