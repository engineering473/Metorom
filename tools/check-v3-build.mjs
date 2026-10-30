import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]);
}
const files = walk('dist').map(path => relative('dist', path).replaceAll('\\', '/'));
const pages = ['index', 'contact', 'event', 'philosophy'];
const inlinePages = { design: 'architecture', specifications: 'measurements' };
const legacyPages = ['index', 'contact', 'event', 'philosophy'];
const expected = ['index.html', ...pages.map(page => `concepts/monochrome/sculptural-v3/${page}.html`), ...Object.keys(inlinePages).map(page => `concepts/monochrome/sculptural-v3/${page}.html`), ...legacyPages.map(page => `concepts/monochrome/sculptural-v2/${page}.html`)].sort();
assert.deepEqual(files.filter(path => path.endsWith('.html')).sort(), expected, 'Only v3 pages and explicit redirects may be published');
for (const page of legacyPages) assert.match(readFileSync(`dist/concepts/monochrome/sculptural-v2/${page}.html`, 'utf8'), /location\.replace/, 'Old URLs must redirect rather than serve the archived site');
for (const [page,anchor] of Object.entries(inlinePages)) {
  const html = readFileSync(`dist/concepts/monochrome/sculptural-v3/${page}.html`, 'utf8');
  assert.match(html, /location\.replace/, 'Design and specifications must be integrated into home');
  assert.ok(html.includes(`index.html#${anchor}`), 'Previous page URLs must link to their home sections');
}
assert.equal(files.filter(path => path.startsWith('videos/')).length, 12, 'All twelve interactive clips must ship');
for (const clip of ['speaker-sub-explode-go', 'speaker-sub-explode-return']) assert.ok(statSync(`dist/videos/${clip}.mp4`).size > 0, 'Subwoofer open and return films must ship');
assert.equal(files.filter(path => path.startsWith('content/')).length, 5, 'Only copy used by the v3 pages and inline design may ship');
for (const asset of ['images/concepts/speaker-exploded-study-v3.webp', 'images/concepts/horn-assembly-study-v3.webp', 'drawings/horn-design-proposal.pdf']) assert.ok(statSync(`dist/${asset}`).size > 0, `Design asset must ship: ${asset}`);
assert.ok(!files.includes('images/spl.png') && !files.includes('images/directivity.png'), 'Removed measurement images must not ship');
for (const file of files.filter(path => path.endsWith('.html'))) {
  const html = readFileSync(join('dist', file), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="\/Metorom\/([^"?#]+)"/g)) assert.ok(files.includes(match[1]), `Missing ${match[1]} referenced by ${file}`);
}
for (const image of ['speaker-render-front-v3.webp', 'speaker-interactive-front-v3.webp']) assert.ok(statSync(`dist/images/concepts/${image}`).size < 100000, 'Prepared image must remain optimized');
console.log('V3 build checks passed: 4 site pages, integrated design/specification redirects, 12 films, supplied design drawings, no published studies.');
