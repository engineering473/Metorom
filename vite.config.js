import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const root = import.meta.dirname;
const site = 'concepts/monochrome/sculptural-v3';
const pages = ['index', 'product', 'contact', 'event', 'philosophy'];
const inlinePages = { design: 'architecture', specifications: 'measurements' };
const legacyPages = ['index', 'contact', 'event', 'philosophy'];
const publicPath = page => page === 'index' ? '/product/' : `/${page}/`;

function writeRedirect(path, destination) {
  const target = resolve(root, 'dist', path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Metorom</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${destination}"><script>const next=new URL(${JSON.stringify(destination)},location.origin);next.search=location.search;if(!next.hash)next.hash=location.hash;location.replace(next.href)</script></head><body><a href="${destination}">Continue to Metorom</a></body></html>`);
}
// Preserve all studies in source; publish only the selected site and its assets.
function selectedSiteAssets() {
  return { name: 'metorom-selected-site', closeBundle() {
    const files = [
      'CNAME',
      'images/concepts/speaker-render-front-v3.webp', 'images/concepts/speaker-interactive-front-v3.webp',
      'images/taste-v2/metorom-logo.webp',
      'images/concepts/speaker-exploded-study-v3.webp', 'images/concepts/horn-assembly-study-v3.webp',
      'drawings/horn-design-proposal.pdf',
      ...readdirSync(resolve(root,'public/images/gallery-speakers')).filter(name => name.endsWith('.webp')).map(name => `images/gallery-speakers/${name}`),
      ...['home','contact','event','philosophy','design'].map(page => `content/sculptural-v3-${page}.json`),
      ...['speaker-sub-explode-go','speaker-sub-explode-return','speaker-mid-left-explode-go','speaker-mid-left-explode-return','speaker-tweeter-explode-go-v2','speaker-tweeter-explode-return-v2','speaker-sub','speaker-sub-reverse','speaker-mid-left','speaker-mid-left-reverse','speaker-mid-right','speaker-mid-right-reverse','speaker-tweeter','speaker-tweeter-reverse'].map(name => `videos/${name}.mp4`),
    ];
    for(const file of new Set(files)) {
      const target=resolve(root,'dist',file);
      mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(root,'public',file),target);
    }
    writeFileSync(resolve(root,'dist/.nojekyll'),'');
    for(const [page,anchor] of Object.entries(inlinePages)) {
      writeRedirect(`${site}/${page}.html`, `/product/#${anchor}`);
    }
    for(const page of legacyPages) {
      writeRedirect(`${site}/${page}.html`, publicPath(page));
      writeRedirect(`concepts/monochrome/sculptural-v2/${page}.html`, publicPath(page));
    }
  }};
}
export default defineConfig(({command})=>({base:'/',publicDir:command==='serve'?'public':false,plugins:[react(),tailwindcss(),selectedSiteAssets()],resolve:{alias:{'@':root}},server:{port:5173},build:{rollupOptions:{input:{home:resolve(root,'index.html'),...Object.fromEntries(pages.filter(page=>page!=='index').map(page=>[`metorom-${page}`,resolve(root,`${page}/index.html`)]))}}}}));
