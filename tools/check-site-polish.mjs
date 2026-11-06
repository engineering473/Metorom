import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/anton/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:5182/';
const output = resolve(import.meta.dirname, '../.impeccable/review/site-polish');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
const visualOnly = process.argv.includes('--visual-only');

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
async function ready(page) {
  await page.locator('.sc-preloader').waitFor({ state: 'hidden', timeout: 26000 });
}
async function capture(page, name) { await page.screenshot({ path: resolve(output, name + '.png') }); }
async function language(page, requested) {
  if (await page.evaluate(() => document.documentElement.lang) === requested) return;
  await page.locator('.sc-language-toggle:visible, .sc-mobile-language:visible').first().click();
  await page.waitForFunction(language => document.documentElement.lang === language, requested);
}
async function scrollGallery(page, progress) {
  await page.locator('#listening-design').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#listening-design')?.dataset.galleryState === 'ready', null, { timeout: 25000 });
  await page.evaluate(progress => {
    const gallery = document.querySelector('#listening-design');
    const stage = gallery.querySelector('.sc-speaker-gallery__stage');
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const start = gallery.getBoundingClientRect().top + scrollY - top;
    const distance = gallery.getBoundingClientRect().height - stage.getBoundingClientRect().height;
    scrollTo({ top: start + progress * distance, behavior: 'instant' });
  }, progress);
  await page.waitForTimeout(220);
}
const galleryState = page => page.evaluate(() => {
  const gallery = document.querySelector('#listening-design');
  const stage = gallery.querySelector('.sc-speaker-gallery__stage');
  const preview = gallery.querySelector('.liquid-glass-carousel__preview');
  const image = preview?.querySelector('[data-preview-active="true"]');
  return { progress: Number(gallery.dataset.scrollProgress), driven: gallery.dataset.scrollDriven === 'true',
    y: scrollY, top: stage.getBoundingClientRect().top, preview: !!preview,
    counter: gallery.querySelector('.liquid-glass-carousel__controls > span')?.textContent,
    source: image?.getAttribute('src'), opacity: image ? getComputedStyle(image).opacity : null,
    transition: image ? getComputedStyle(image).transitionProperty : null };
});

async function touchDrag(page, start, end) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start.x, y: start.y }] });
  for (let step = 1; step <= 10; step++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (end.x - start.x) * step / 10, y: start.y + (end.y - start.y) * step / 10 }] });
    await wait(18);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

try {
  for (const spec of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'phone', width: 390, height: 844, mobile: true },
    { name: 'tablet', width: 800, height: 720 },
    { name: 'fallback', width: 1440, height: 900, fallback: true },
    { name: 'reduced', width: 390, height: 844, mobile: true, reduced: true },
  ].filter(spec => !visualOnly || ['desktop', 'phone'].includes(spec.name))) {
    const context = await browser.newContext({ viewport: { width: spec.width, height: spec.height }, isMobile: !!spec.mobile,
      hasTouch: !!spec.mobile, reducedMotion: spec.reduced ? 'reduce' : 'no-preference', deviceScaleFactor: 1 });
    if (spec.fallback) await context.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(kind, ...args) { return /webgl/i.test(kind) ? null : original.call(this, kind, ...args); };
    });
    const page = await context.newPage();
    const result = { name: spec.name, errors: [] };
    page.on('pageerror', error => result.errors.push(error.message));
    try {
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await ready(page);
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'ja', 'Fresh visits must default to Japanese');
      assert.equal(await page.locator('.sc-language-toggle:visible, .sc-mobile-language:visible').first().innerText(), 'English');
      result.hero = await page.evaluate(() => {
        const statement = document.querySelector('.sc-hero__statement').getBoundingClientRect();
        const img = document.querySelector('.sc-hero__render img');
        const image = img.getBoundingClientRect();
        const center = image.top + (586 + 1286) / 3200 * image.height;
        return { textCenter: statement.top + statement.height / 2, opticalCenter: center,
          difference: Math.abs(statement.top + statement.height / 2 - center), naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
      });
      if (!spec.mobile) assert.ok(result.hero.difference < (spec.width < 1000 ? 12 : 8), 'Desktop hero text and visible speaker center align');
      if (['desktop', 'phone', 'tablet'].includes(spec.name)) await capture(page, spec.name + '-hero-ja');
      await language(page, 'en');
      if (spec.name === 'desktop') {
        await capture(page, 'desktop-hero-en');
        await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page);
        assert.equal(await page.evaluate(() => document.documentElement.lang), 'en', 'English selection persists on reload');
        await page.goto(base + '?lang=ja', { waitUntil: 'domcontentloaded' }); await ready(page);
        assert.equal(await page.evaluate(() => document.documentElement.lang), 'ja', 'Explicit query overrides stored English');
        await language(page, 'en');
      }
      if (!visualOnly) {
      await scrollGallery(page, .3);
      const open = () => page.getByRole('button', { name: 'View photograph', exact: true }).click();
      const expanded = page.locator('.liquid-glass-carousel__preview');
      await open(); await expanded.waitFor({ state: 'visible' });
      const image = page.locator('.liquid-glass-carousel__preview img[data-preview-active="true"]');
      await image.click();
      assert.equal(await expanded.count(), 1, 'Clicking the photograph keeps preview open');
      const previewBox = await expanded.boundingBox();
      await page.mouse.click(previewBox.x + 5, previewBox.y + 5);
      await expanded.waitFor({ state: 'detached' });
      await open();
      const before = await galleryState(page);
      const imageBox = await page.locator('.liquid-glass-carousel__preview img[data-preview-active="true"]').boundingBox();
      const start = { x: imageBox.x + imageBox.width * .78, y: imageBox.y + imageBox.height * .5 };
      const end = { x: imageBox.x + imageBox.width * .22, y: start.y };
      if (spec.mobile) await touchDrag(page, start, end);
      else { await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.mouse.move(end.x, end.y, { steps: 12 }); await page.mouse.up(); }
      await page.waitForTimeout(350);
      result.swipe = await galleryState(page);
      assert.equal(result.swipe.preview, true, 'Horizontal swipe stays in slideshow');
      assert.notEqual(result.swipe.source, before.source, 'Horizontal swipe advances photograph');
      assert.equal(result.swipe.opacity, '1');
      assert.equal(result.swipe.transition, 'opacity');
      if (['desktop', 'phone'].includes(spec.name)) await capture(page, spec.name + '-preview');
      const counter = result.swipe.counter;
      await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
      await page.waitForTimeout(280);
      assert.notEqual((await galleryState(page)).counter, counter, 'Slideshow arrows advance photograph');
      await page.keyboard.press('Escape'); await expanded.waitFor({ state: 'detached' });
      await open();
      const beforeLeaving = await galleryState(page);
      if (spec.mobile) {
        const box = await expanded.boundingBox();
        await touchDrag(page, { x: box.x + box.width / 2, y: box.y + box.height * .6 }, { x: box.x + box.width / 2, y: box.y + box.height * .25 });
      } else await page.mouse.wheel(0, 150);
      await expanded.waitFor({ state: 'detached', timeout: 4000 });
      await page.waitForTimeout(220);
      result.scrollExit = await galleryState(page);
      assert.ok(result.scrollExit.y > beforeLeaving.y + 80, 'Vertical scroll leaves the preview');
      if (!spec.reduced) {
        assert.equal(result.scrollExit.progress, 1, 'Preview scroll skips the unseen revolution');
        assert.ok(result.scrollExit.top < beforeLeaving.top - 50, 'Stage releases immediately');
      }
      }
      await page.locator('#measurements').scrollIntoViewIfNeeded();
      const spread = page.locator('.frc-card--drivers .frc-card__variance');
      await spread.waitFor({ state: 'visible' });
      result.measurement = await spread.innerText();
      assert.match(result.measurement, /±\s*7\.3 dB/);
      assert.match(result.measurement, /Midpoint 55\.4 dB/);
      assert.match(await spread.getAttribute('aria-label'), /48\.073.*62\.674/);
      assert.match(await page.locator('.frc-card--system').innerText(), /MODEL|[Ii]llustrative|[Mm]odeled/);
      await page.waitForTimeout(1000);
      if (['desktop', 'phone'].includes(spec.name)) await capture(page, spec.name + '-measurements');
      await page.locator('.sc-object__hotspot--right').scrollIntoViewIfNeeded();
      await page.locator('.sc-object__hotspot--right').click();
      const graph = page.locator(`.sc-object__driver-graph--${spec.mobile ? 'mobile' : 'desktop'}.is-visible .sc-driver-response`);
      await graph.waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForFunction(() => document.querySelector('.sc-object__media')?.dataset.explosionState === 'open', null, { timeout: 10000 });
      const driverSpread = graph.locator('.sc-driver-response__range strong');
      await driverSpread.waitFor({ state: 'visible', timeout: 10000 });
      assert.match(await driverSpread.innerText(), /±7\.3 dB/);
      await page.waitForTimeout(500);
      result.driverBounds = await graph.evaluate(element => {
        const rect = element.getBoundingClientRect();
        const media = document.querySelector('.sc-object__media').getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: rect.height, mediaTop: media.top, mediaBottom: media.bottom, viewport: innerHeight };
      });
      if (['desktop', 'phone'].includes(spec.name)) await capture(page, spec.name + '-driver-spread');
      await page.keyboard.press('Escape');
      await page.locator('.sc-footer__wordmark').scrollIntoViewIfNeeded();
      const letter = page.locator('.sc-footer__wordmark .text-cursor-proximity__letter').nth(3);
      await page.waitForTimeout(250);
      result.footerBefore = await letter.evaluate(element => ({ color: getComputedStyle(element).color, transform: getComputedStyle(element).transform }));
      await letter.hover(); await page.waitForTimeout(260);
      result.footerAfter = await letter.evaluate(element => ({ color: getComputedStyle(element).color, transform: getComputedStyle(element).transform }));
      if (spec.mobile || spec.reduced) assert.equal(result.footerAfter.color, 'rgb(16, 29, 143)', 'Coarse/reduced motion uses static wordmark');
      else {
        assert.notEqual(result.footerAfter.color, result.footerBefore.color);
        const rgb = result.footerAfter.color.match(/[\d.]+/g).map(Number);
        assert.ok(rgb[0] < 15 && rgb[1] > 50 && rgb[1] < 90 && rgb[2] < 75, 'Hover reaches deep green');
        assert.notEqual(result.footerAfter.transform, result.footerBefore.transform);
      }
      if (spec.name === 'desktop') await capture(page, 'desktop-footer-hover');
      result.overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(result.overflow <= 1, 'No horizontal page overflow');
      assert.deepEqual(result.errors, []);
      result.passed = true;
    } catch (error) {
      result.passed = false; result.failure = error.stack;
      result.lastGallery = await galleryState(page).catch(() => null);
      await capture(page, spec.name + '-failure').catch(() => {});
    }
    results.push(result); console.log(JSON.stringify(result));
    await context.close();
  }
  const context = await browser.newContext();
  await context.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }); });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded' }); await ready(page);
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'ja', 'Blocked storage retains Japanese default');
  results.push({ name: 'blocked-storage', passed: true });
  for (const route of ['contact', 'event', 'philosophy']) {
    await page.goto(base + route + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.lang === 'ja');
    const toggle = page.locator('.sc-language-toggle:visible, .sc-mobile-language:visible').first();
    assert.equal(await toggle.innerText(), 'English');
    results.push({ name: route + '-japanese-default', passed: true });
  }
  await context.close();
} finally {
  await browser.close();
  await writeFile(resolve(output, visualOnly ? 'visual-results.json' : 'results.json'), JSON.stringify({ base, results }, null, 2));
}
if (results.some(result => !result.passed)) process.exitCode = 1;
