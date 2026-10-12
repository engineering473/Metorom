import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const conceptInputs = Object.fromEntries(
  ['monochrome', 'warm', 'colour', 'haze', 'dark'].flatMap((family) =>
    ['impeccable', 'taste'].map((variant) => [
      `concept-${family}-${variant}`,
      resolve(import.meta.dirname, `concepts/${family}/${variant}/index.html`)
    ])
  )
);

export default defineConfig({
  base: '/Metorom/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': import.meta.dirname } },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      input: {
        gallery: resolve(import.meta.dirname, 'index.html'),
        atelier: resolve(import.meta.dirname, 'versions/atelier/index.html'),
        atelierEvent: resolve(import.meta.dirname, 'versions/atelier/event.html'),
        signal: resolve(import.meta.dirname, 'versions/signal/index.html'),
        signalEvent: resolve(import.meta.dirname, 'versions/signal/event.html'),
        journey: resolve(import.meta.dirname, 'versions/journey/index.html'),
        journeyEvent: resolve(import.meta.dirname, 'versions/journey/event.html'),
        conceptGallery: resolve(import.meta.dirname, 'concepts/index.html'),
        conceptColourTasteV2: resolve(import.meta.dirname, 'concepts/colour/taste-v2/index.html'),
        conceptColourTasteV2Contact: resolve(import.meta.dirname, 'concepts/colour/taste-v2/contact.html'),
        conceptSculpturalV2: resolve(import.meta.dirname, 'concepts/monochrome/sculptural-v2/index.html'),
        conceptSculpturalV2Contact: resolve(import.meta.dirname, 'concepts/monochrome/sculptural-v2/contact.html'),
        conceptSculpturalV2Event: resolve(import.meta.dirname, 'concepts/monochrome/sculptural-v2/event.html'),
        conceptSculpturalV2Future: resolve(import.meta.dirname, 'concepts/monochrome/sculptural-v2/future.html'),
        ...conceptInputs
      }
    }
  }
});
