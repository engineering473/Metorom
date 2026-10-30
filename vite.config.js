import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const root = import.meta.dirname;
const site = 'concepts/monochrome/sculptural-v3';
const pages = ['index', 'contact', 'event', 'philosophy'];
const inlinePages = { design: 'architecture', specifications: 'measurements' };
const legacyPages = ['index', 'contact', 'event', 'philosophy'];
// Preserve all studies in source; publish only the selected site and its assets.
function selectedSiteAssets() {
  return { name: 'metorom-selected-site', closeBundle() {
    const files = [
      'images/concepts/speaker-render-front-v3.webp', 'images/concepts/speaker-interactive-front-v3.webp',
      'images/concepts/speaker-wireframe-poster.png', 'images/taste-v2/metorom-logo.webp',
      'images/concepts/speaker-exploded-study-v3.webp', 'images/concepts/horn-assembly-study-v3.webp',
      'drawings/horn-design-proposal.pdf',
      ...['home','contact','event','philosophy','design'].map(page => `content/sculptural-v3-${page}.json`),
      ...['speaker-sub-explode-go','speaker-sub-explode-return','speaker-mid-left-explode-go','speaker-mid-left-explode-return','speaker-sub','speaker-sub-reverse','speaker-mid-left','speaker-mid-left-reverse','speaker-mid-right','speaker-mid-right-reverse','speaker-tweeter','speaker-tweeter-reverse'].map(name => `videos/${name}.mp4`),
    ];
    const content = JSON.parse(readFileSync(resolve(root,'public/content/sculptural-v3-home.json'),'utf8'));
    for (const copy of [content.en,content.ja]) for(let slot=1;slot<=5;slot++) {
      const source=copy?.[`galleryImage${slot}`];
      if(typeof source==='string' && source.startsWith('/Metorom/images/')) files.push(source.slice('/Metorom/'.length));
    }
    for(const file of new Set(files)) {
      const target=resolve(root,'dist',file);
      mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(root,'public',file),target);
    }
    writeFileSync(resolve(root,'dist/.nojekyll'),'');
    for(const [page,anchor] of Object.entries(inlinePages)) {
      const target=resolve(root,`dist/${site}/${page}.html`);
      const destination=`./index.html#${anchor}`;
      mkdirSync(dirname(target),{recursive:true});
      writeFileSync(target,`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Metorom</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${destination}"><script>const next=new URL('./index.html',location.href);next.search=location.search;next.hash=${JSON.stringify(anchor)};location.replace(next.href)</script></head><body><a href="${destination}">Continue to Metorom</a></body></html>`);
    }
    for(const page of legacyPages) {
      const target=resolve(root,`dist/concepts/monochrome/sculptural-v2/${page}.html`);
      const destination=`../sculptural-v3/${page}.html`;
      mkdirSync(dirname(target),{recursive:true});
      writeFileSync(target,`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Metorom</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${destination}"><script>location.replace(${JSON.stringify(destination)}+location.search+location.hash)</script></head><body><a href="${destination}">Continue to Metorom</a></body></html>`);
    }
  }};
}
export default defineConfig(({command})=>({base:'/Metorom/',publicDir:command==='serve'?'public':false,plugins:[react(),tailwindcss(),selectedSiteAssets()],resolve:{alias:{'@':root}},server:{port:5173},build:{rollupOptions:{input:{home:resolve(root,'index.html'),...Object.fromEntries(pages.map(page=>[`metorom-${page}`,resolve(root,`${site}/${page}.html`)]))}}}}));
