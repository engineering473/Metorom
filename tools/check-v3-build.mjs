import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]);
}
const files = walk('dist').map(path => relative('dist', path).replaceAll('\\', '/'));
assert.equal(readFileSync('dist/CNAME', 'utf8').trim(), 'www.metorom.com', 'Every deployment must preserve the configured custom domain');
const pages = ['index', 'product', 'contact', 'event', 'philosophy'];
const inlinePages = { design: 'architecture', specifications: 'measurements' };
const legacyPages = ['index', 'contact', 'event', 'philosophy'];
const cleanPages = ['index.html', ...pages.filter(page => page !== 'index').map(page => `${page}/index.html`)];
const expected = [...cleanPages, ...legacyPages.map(page => `concepts/monochrome/sculptural-v3/${page}.html`), ...Object.keys(inlinePages).map(page => `concepts/monochrome/sculptural-v3/${page}.html`), ...legacyPages.map(page => `concepts/monochrome/sculptural-v2/${page}.html`)].sort();
assert.deepEqual(files.filter(path => path.endsWith('.html')).sort(), expected, 'Only v3 pages and explicit redirects may be published');
for (const version of ['sculptural-v2', 'sculptural-v3']) for (const page of legacyPages) {
  const html = readFileSync(`dist/concepts/monochrome/${version}/${page}.html`, 'utf8');
  const destination = page === 'index' ? '/product/' : `/${page}/`;
  assert.match(html, /location\.replace/, 'Old URLs must redirect rather than serve the archived site');
  assert.ok(html.includes(`url=${destination}"`), 'Old URLs must redirect directly to clean public paths');
  assert.ok(html.includes('next.search=location.search') && html.includes('next.hash=location.hash'), 'Legacy redirects must preserve language, editor parameters and deep links');
}
for (const [page,anchor] of Object.entries(inlinePages)) {
  const html = readFileSync(`dist/concepts/monochrome/sculptural-v3/${page}.html`, 'utf8');
  assert.match(html, /location\.replace/, 'Design and specifications must be integrated into the product page');
  assert.ok(html.includes(`/product/#${anchor}`), 'Previous page URLs must link to their product sections');
}
assert.equal(files.filter(path => path.startsWith('videos/')).length, 14, 'All fourteen interactive clips must ship');
const speakerPhotos = files.filter(path => path.startsWith('images/gallery-speakers/') && path.endsWith('.webp'));
const editedSpeakerPhotos = ['2852', '2862', '2889', '2928', '2936', '2999', '3008', '3021'].map(id => `images/gallery-speakers/dscf${id}-edited.webp`);
assert.deepEqual(speakerPhotos.sort(), editedSpeakerPhotos.sort(), 'Only the eight replacement speaker photographs may ship');
for (const photo of speakerPhotos) {
  const size = statSync(join('dist', photo)).size;
  assert.ok(size > 0 && size < 550000, `Carousel photo must be present and optimized: ${photo}`);
}
for (const driver of ['sub', 'mid-left', 'tweeter']) {
  for (const direction of ['go', 'return']) assert.ok(statSync(`dist/videos/speaker-${driver}-explode-${direction}${driver === 'tweeter' ? '-v2' : ''}.mp4`).size > 0, `${driver} open and return films must ship`);
}
assert.ok(!files.includes('videos/speaker-tweeter-explode-go.mp4') && !files.includes('videos/speaker-tweeter-explode-return.mp4'), 'Only the new split tweeter clips may be published');
assert.equal(files.filter(path => path.startsWith('content/')).length, 5, 'Only copy used by the v3 pages and inline design may ship');
for (const asset of ['images/concepts/speaker-exploded-study-v3.webp', 'images/concepts/horn-assembly-study-v3.webp', 'drawings/horn-design-proposal.pdf']) assert.ok(statSync(`dist/${asset}`).size > 0, `Design asset must ship: ${asset}`);
assert.ok(!files.includes('images/spl.png') && !files.includes('images/directivity.png'), 'Removed measurement images must not ship');
for (const file of files.filter(path => path.endsWith('.html'))) {
  const html = readFileSync(join('dist', file), 'utf8');
  assert.ok(!html.includes('/Metorom/'), `Custom-domain pages must not use the old repository prefix: ${file}`);
  for (const match of html.matchAll(/(?:src|href)="\/([^"?#]+)"/g)) assert.ok(files.includes(match[1].endsWith('/') ? `${match[1]}index.html` : match[1]), `Missing ${match[1]} referenced by ${file}`);
  if (cleanPages.includes(file)) {
    assert.match(html, /src="\/assets\/[^"?#]+\.js"/, `Site page must load its script from the custom-domain root: ${file}`);
    assert.ok(html.includes('id="root"') && !html.includes('location.replace'), `Clean public pages must render directly without redirecting: ${file}`);
  }
}
for (const image of ['speaker-render-front-v3.webp', 'speaker-interactive-front-v3.webp']) assert.ok(statSync(`dist/images/concepts/${image}`).size < 100000, 'Prepared image must remain optimized');
console.log('V3 build checks passed: 5 clean public pages, preserved product redirects, 14 films including the split tweeter clip, supplied design drawings, no published studies.');
