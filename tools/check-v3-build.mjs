import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]);
}
const files = walk('dist').map(path => relative('dist', path).replaceAll('\\', '/'));
const pages = ['index', 'contact', 'event', 'philosophy'];
const expected = ['index.html', ...pages.flatMap(page => [`concepts/monochrome/sculptural-v3/${page}.html`, `concepts/monochrome/sculptural-v2/${page}.html`])].sort();
assert.deepEqual(files.filter(path => path.endsWith('.html')).sort(), expected, 'Only v3 pages and explicit redirects may be published');
for (const page of pages) assert.match(readFileSync(`dist/concepts/monochrome/sculptural-v2/${page}.html`, 'utf8'), /location\.replace/, 'Old URLs must redirect rather than serve the archived site');
assert.equal(files.filter(path => path.startsWith('videos/')).length, 10, 'All ten interactive clips must ship');
assert.equal(files.filter(path => path.startsWith('content/')).length, 4, 'Only v3 published copy must ship');
for (const file of files.filter(path => path.endsWith('.html'))) {
  const html = readFileSync(join('dist', file), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="\/Metorom\/([^"?#]+)"/g)) assert.ok(files.includes(match[1]), `Missing ${match[1]} referenced by ${file}`);
}
for (const image of ['speaker-render-front-v3.webp', 'speaker-interactive-front-v3.webp']) assert.ok(statSync(`dist/images/concepts/${image}`).size < 100000, 'Prepared image must remain optimized');
console.log('V3 build checks passed: 4 site pages, root and legacy redirects, 10 films, no published studies.');
