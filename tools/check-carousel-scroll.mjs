import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/anton/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fixtureUrl = new URL(process.argv[2] || 'http://127.0.0.1:5178/');
// This fixture exercises the English accessible control names explicitly.
fixtureUrl.searchParams.set('lang', 'en');
const base = fixtureUrl.href;
const output = resolve(import.meta.dirname, '../.impeccable/review/carousel');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
const failures = [];

const snapshot = page => page.evaluate(() => {
  const gallery = document.querySelector('#listening-design');
  const stage = gallery.querySelector('.sc-speaker-gallery__stage');
  const stageRect = stage.getBoundingClientRect();
  return {
    progress: Number(gallery.dataset.scrollProgress), ready: gallery.dataset.galleryState,
    driven: gallery.dataset.scrollDriven === 'true', top: stageRect.top, height: stageRect.height,
    viewport: innerHeight, width: innerWidth, documentWidth: document.documentElement.scrollWidth,
    counter: gallery.querySelector('.liquid-glass-carousel__controls > span')?.textContent?.trim(),
    loader: !!gallery.querySelector('.sc-gallery-loader')?.classList.contains('is-visible'),
    buttonCount: gallery.querySelectorAll('[data-part]').length,
    busy: stage.getAttribute('aria-busy'),
  };
});

async function releasePageLoader(page) {
  await page.locator('.sc-preloader').waitFor({ state: 'hidden', timeout: 26000 });
}

async function scrollTo(page, progress, extra = 0) {
  await page.evaluate(({ progress, extra }) => {
    const gallery = document.querySelector('#listening-design');
    const stage = gallery.querySelector('.sc-speaker-gallery__stage');
    const top = Number.parseFloat(getComputedStyle(stage).top) || 0;
    const start = gallery.getBoundingClientRect().top + scrollY - top;
    const distance = gallery.getBoundingClientRect().height - stage.getBoundingClientRect().height;
    window.scrollTo({ top: start + progress * distance + extra, behavior: 'instant' });
  }, { progress, extra });
}

try {
  for (const spec of [
    { name: 'desktop', width: 1440, height: 900, delayed: true },
    { name: 'phone', width: 390, height: 844, mobile: true },
    { name: 'landscape', width: 844, height: 390, mobile: true },
    { name: 'reduced-motion', width: 390, height: 844, mobile: true, reduced: true },
    { name: 'webgl-fallback', width: 1440, height: 900, fallback: true },
    { name: 'single-photo-failure', width: 1440, height: 900, photoFailure: 'single' },
    { name: 'all-photo-failure', width: 390, height: 844, mobile: true, photoFailure: 'all' },
  ].filter(spec => process.argv[3] !== '--failures-only' || spec.photoFailure)) {
    const context = await browser.newContext({ viewport: { width: spec.width, height: spec.height },
      isMobile: !!spec.mobile, hasTouch: !!spec.mobile, deviceScaleFactor: 1,
      reducedMotion: spec.reduced ? 'reduce' : 'no-preference' });
    if (spec.fallback) await context.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
        return /webgl/i.test(kind) ? null : getContext.call(this, kind, ...args);
      };
    });
    let releasePhotos;
    const photoGate = new Promise(resolve => { releasePhotos = resolve; });
    if (spec.delayed) await context.route('**/images/gallery-speakers/*', async route => {
      await photoGate;
      await route.continue();
    });
    if (spec.photoFailure) await context.route('**/images/gallery-speakers/*', route => {
      return spec.photoFailure === 'all' || route.request().url().includes('dscf2928-')
        ? route.abort('failed') : route.continue();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const result = { name: spec.name, samples: [], errors };
    try {
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await releasePageLoader(page);
      await page.locator('#listening-design').scrollIntoViewIfNeeded();
      if (spec.delayed) {
        await page.locator('.sc-gallery-loader.is-visible').waitFor({ state: 'visible' });
        result.loading = await snapshot(page);
        assert.equal(result.loading.busy, 'true');
        assert.equal(await page.locator('.sc-gallery-loader .sc-preloader__newton').count(), 1);
        await page.screenshot({ path: resolve(output, 'desktop-loading.png') });
        releasePhotos();
      }
      await page.waitForFunction(() => document.querySelector('#listening-design')?.dataset.galleryState === 'ready', null, { timeout: 25000 });
      assert.equal(await page.locator('#listening-design [data-part]').count(), 0, 'Removed part buttons must stay absent');
      if (spec.photoFailure) {
        await scrollTo(page, 0);
        await page.waitForTimeout(400);
        result.initial = await snapshot(page);
        assert.equal(result.initial.loader, false, 'Photo failures must release the loading gate');
        assert.equal(result.initial.busy, 'false');
        await page.getByText('This photograph could not load. Try the previous or next photograph.', { exact: true }).waitFor({ state: 'visible' });
        await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('.liquid-glass-carousel__controls > span')?.textContent?.trim() === '05 / 08');
        result.afterArrow = await snapshot(page);
        assert.equal(result.afterArrow.loader, false, 'Recovery navigation stays prepared');
        if (spec.photoFailure === 'single') {
          assert.equal(await page.getByRole('button', { name: 'View photograph', exact: true }).isEnabled(), true);
        } else {
          await page.getByText('This photograph could not load. Try the previous or next photograph.', { exact: true }).waitFor({ state: 'visible' });
        }
        await page.screenshot({ path: resolve(output, `${spec.name}.png`) });
        await scrollTo(page, 1, 180);
        await page.waitForTimeout(250);
        result.released = await snapshot(page);
        assert.ok(result.released.top < result.initial.top - 150, 'Failed photos must not trap page scrolling');
      } else if (!spec.reduced) {
        for (let step = 0; step <= 8; step++) {
          await scrollTo(page, step / 8);
          const expected = String(((3 + step) % 8) + 1).padStart(2, '0') + ' / 08';
          await page.waitForFunction(expected => document.querySelector('.liquid-glass-carousel__controls > span')?.textContent?.trim() === expected,
            expected, { timeout: 3500 });
          await page.waitForTimeout(140);
          const state = await snapshot(page);
          result.samples.push(state);
          assert.equal(state.ready, 'ready', 'Loader must not return between prepared photographs');
          assert.equal(state.loader, false);
          assert.ok(Math.abs(state.top - result.samples[0].top) < 2, 'Gallery stage must stay pinned for the full revolution');
          assert.ok(Math.abs(state.progress - step / 8) < .002);
        }
        assert.equal(new Set(result.samples.slice(0, 8).map(state => state.counter)).size, 8, 'Every photograph is visited');
        assert.equal(result.samples[8].counter, result.samples[0].counter, 'Full revolution returns to the initial photograph');
        await scrollTo(page, .5);
        await page.waitForTimeout(250);
        if (['desktop', 'phone', 'landscape'].includes(spec.name)) await page.screenshot({ path: resolve(output, `${spec.name}.png`) });
        await scrollTo(page, 1, 180);
        await page.waitForTimeout(200);
        result.released = await snapshot(page);
        assert.ok(result.released.top < result.samples[0].top - 150, 'Page continues after one revolution');
        await scrollTo(page, 0);
        await page.waitForTimeout(200);
        await page.mouse.move(spec.width / 2, result.samples[0].top + result.samples[0].height / 2);
        const beforeWheel = await page.evaluate(() => scrollY);
        await page.mouse.wheel(0, 150);
        await page.waitForTimeout(400);
        result.wheelMovement = await page.evaluate(() => scrollY) - beforeWheel;
        assert.ok(result.wheelMovement > 100, 'Vertical wheel must keep native page scrolling');
        await scrollTo(page, .375);
        await page.waitForTimeout(300);
        const old = await snapshot(page);
        await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
        await page.waitForTimeout(450);
        result.arrow = await snapshot(page);
        assert.ok(result.arrow.progress > old.progress + .1, 'Arrow follows the same scroll track');
        await page.getByRole('button', { name: 'View photograph', exact: true }).click();
        await page.waitForTimeout(900);
        assert.equal(await page.getByRole('button', { name: 'Close photograph', exact: true }).getAttribute('aria-pressed'), 'true');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(900);
        assert.equal(await page.getByRole('button', { name: 'View photograph', exact: true }).getAttribute('aria-pressed'), 'false');
      } else {
        result.initial = await snapshot(page);
        assert.equal(result.initial.driven, false, 'Reduced motion has ordinary gallery height');
        await page.getByRole('button', { name: 'Next photograph', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('.liquid-glass-carousel__controls > span')?.textContent?.trim() === '05 / 08');
        result.afterArrow = await snapshot(page);
      }
      assert.equal(errors.length, 0, 'No uncaught browser errors');
      result.passed = true;
    } catch (error) {
      releasePhotos?.();
      result.passed = false;
      result.failure = error.message;
      result.lastState = await snapshot(page).catch(() => null);
      failures.push(`${spec.name}: ${error.message}`);
      await page.screenshot({ path: resolve(output, `${spec.name}-failure.png`) }).catch(() => {});
    }
    results.push(result);
    console.log(JSON.stringify(result));
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(resolve(output, process.argv[3] === '--failures-only' ? 'failures.json' : 'results.json'), JSON.stringify({ base, results, failures }, null, 2));
}
if (failures.length) process.exitCode = 1;
