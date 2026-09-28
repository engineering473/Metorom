import { defineConfig } from 'vite';
import { resolve } from 'node:path';

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
        ...conceptInputs
      }
    }
  }
});
