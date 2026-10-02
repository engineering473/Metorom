import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] ?? 'http://127.0.0.1:5173/Metorom/concepts/monochrome/sculptural-v2/index.html';
const output = resolve(import.meta.dirname, '../.impeccable/review');
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await mobile.goto(base, { waitUntil: 'networkidle' });
  await mobile.waitForFunction(() => getComputedStyle(document.querySelector('.sc-object__sprite')).opacity === '1');
  const initial = await mobile.evaluate(() => ({
    videos: document.querySelectorAll('.sc-object__video').length,
    frame: document.querySelector('.sc-object__sprite-frame').style.backgroundPosition,
    progress: document.querySelector('.sc-progress-outline__active').getAttribute('stroke-dasharray'),
  }));
  if (initial.videos !== 0) throw new Error('Mobile still loads the film');
  await mobile.screenshot({ path: resolve(output, 'mobile.png') });
  await mobile.evaluate(() => {
    const section = document.querySelector('.sc-object');
    window.scrollTo({ top: section.offsetTop + (section.offsetHeight - innerHeight) * 0.55, behavior: 'instant' });
  });
  await mobile.waitForTimeout(250);
  const mid = await mobile.evaluate(() => ({
    frame: document.querySelector('.sc-object__sprite-frame').style.backgroundPosition,
    progress: document.querySelector('.sc-progress-outline__active').getAttribute('stroke-dasharray'),
    label: document.querySelector('.sc-object__stage-label').textContent,
    scrollY: window.scrollY,
    sectionTop: document.querySelector('.sc-object').getBoundingClientRect().top,
  }));
  if (mid.frame === initial.frame) throw new Error('Mobile frame did not rotate with scroll');
  await mobile.screenshot({ path: resolve(output, 'mobile-object.png') });
  const progressSamples = [];
  for (const fraction of [0.2, 0.4, 0.6, 0.8]) {
    progressSamples.push(await mobile.evaluate((value) => {
      window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * value, behavior: 'instant' });
      return new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(Number(document.querySelector('.sc-progress-outline__active').getAttribute('stroke-dasharray').split(' ')[0])))));
    }, fraction));
  }
  if (progressSamples.some((value, index) => index > 0 && value <= progressSamples[index - 1])) {
    throw new Error(`Navbar progress was not monotonic: ${progressSamples}`);
  }

  const editor = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await editor.goto(`${base}?edit=1`, { waitUntil: 'networkidle' });
  await editor.getByLabel('Hero headline').fill('A different sound.');
  await editor.getByLabel('Display font').selectOption('Barlow Condensed');
  await editor.getByLabel('Accent color').fill('#b24a35');
  const edited = await editor.evaluate(() => ({
    title: document.querySelector('#sc-hero-title').textContent,
    font: getComputedStyle(document.querySelector('#sc-hero-title')).fontFamily,
    accent: document.documentElement.style.getPropertyValue('--sc-accent'),
  }));
  if (edited.title !== 'A different sound.' || !edited.font.includes('Barlow Condensed') || edited.accent !== '#b24a35') {
    throw new Error(`Live editor did not update the page: ${JSON.stringify(edited)}`);
  }
  await editor.screenshot({ path: resolve(output, 'desktop-editor.png') });
  await editor.reload({ waitUntil: 'networkidle' });
  if (await editor.locator('#sc-hero-title').textContent() !== 'A different sound.') throw new Error('Editor did not persist after reload');
  await editor.goto(base, { waitUntil: 'networkidle' });
  if (await editor.locator('#sc-hero-title').textContent() !== 'Sound, given\na shape.') throw new Error('Preview edits leaked into the public view');
  await editor.screenshot({ path: resolve(output, 'desktop.png') });

  const small = await browser.newPage({ viewport: { width: 320, height: 700 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await small.goto(`${base}?edit=1`, { waitUntil: 'networkidle' });
  const overflow = await small.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`320px viewport has ${overflow}px horizontal overflow`);
  await small.screenshot({ path: resolve(output, 'mobile-editor.png') });

  process.stdout.write(JSON.stringify({ initial, mid, progressSamples, edited, persisted: true, publicViewUnchanged: true, overflow }) + '\n');
} finally {
  await browser.close();
}
