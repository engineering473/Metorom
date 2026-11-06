import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/anton/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = new URL(process.argv[2] || 'http://127.0.0.1:5184/');
base.pathname = '/'; base.search = ''; base.hash = '';
const output = resolve(import.meta.dirname, '../.impeccable/review/landing');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];

async function ready(page) {
  await page.locator('.mt-landing').waitFor({ state: 'visible', timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(650);
}

async function capture(page, name) {
  await page.screenshot({ path: resolve(output, `${name}.png`) });
}

async function setLanguage(page, language) {
  if (await page.evaluate(() => document.documentElement.lang) !== language) {
    await page.locator('.sc-language-toggle:visible').click();
    await page.waitForFunction(value => document.documentElement.lang === value, language);
    await page.waitForTimeout(100);
  }
}

async function assertNoOverflow(page, context) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(overflow <= 1, `${context}: no horizontal page overflow (found ${overflow}px)`);
  return overflow;
}

async function content(page, language) {
  const text = await page.locator('.mt-landing').innerText();
  const checks = language === 'ja' ? [
    /音響空間/, /刺激社会/, /オフスイッチ/, /人間らしさ/, /CNC/, /3D/, /手仕事/, /伝統芸術/, /持続可能性/,
    /モジュラー音響設計/, /Play/, /Replay/, /Perform/, /日本/, /京料理/, /あたたかな周波数/,
  ] : [
    /acoustic space/i, /stimulation society/i, /ears have\s+no off switch/i, /humanity/i, /CNC/, /3D printing/i,
    /handcraftsmanship/i, /traditional arts/i, /sustainability/i, /Modular Acoustic Design/, /Play/, /Replay/, /Perform/,
    /Japan/, /Kyoto cuisine/, /warm frequencies/i,
  ];
  for (const check of checks) assert.match(text, check, `${language}: supplied concept is present`);
  for (const id of ['concept', 'values', 'vision', 'japan', 'product-preview']) {
    assert.equal(await page.locator(`#${id}`).count(), 1, `${id}: one addressable section`);
  }
  assert.equal(await page.locator('h1').count(), 1, 'One semantic page title');
  assert.equal(await page.locator('.icsa-light').getAttribute('aria-hidden'), 'true', 'Inverted duplicate is hidden from assistive technology');
}

async function section(page, id, screenshot) {
  await page.locator(`#${id}`).evaluate(element => {
    scrollTo({ top: element.getBoundingClientRect().top + scrollY - 110, behavior: 'instant' });
  });
  await page.waitForTimeout(id === 'concept' ? 1800 : 800);
  await assertNoOverflow(page, id);
  if (screenshot) await capture(page, screenshot);
}

async function circleAt(page, viewportLengths) {
  await page.locator('.icsa-track').evaluate((track, amount) => {
    const hero = track.querySelector('.icsa-hero');
    scrollTo({ top: track.getBoundingClientRect().top + scrollY + hero.getBoundingClientRect().height * amount, behavior: 'instant' });
  }, viewportLengths);
  await page.waitForTimeout(140);
  return page.locator('.icsa-hero').evaluate(hero => {
    const stage = hero.getBoundingClientRect();
    const ball = hero.querySelector('.icsa-ball').getBoundingClientRect();
    return {
      heroTop: stage.top, heroHeight: stage.height, width: innerWidth, height: innerHeight,
      ball: { left: ball.left, top: ball.top, right: ball.right, bottom: ball.bottom, width: ball.width, height: ball.height },
    };
  });
}

try {
  for (const spec of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'phone', width: 390, height: 844, mobile: true },
  ]) {
    const context = await browser.newContext({ viewport: { width: spec.width, height: spec.height }, isMobile: !!spec.mobile,
      hasTouch: !!spec.mobile, reducedMotion: 'no-preference', deviceScaleFactor: 1 });
    const page = await context.newPage();
    const result = { name: spec.name, errors: [] };
    page.on('pageerror', error => result.errors.push(error.message));
    try {
      await page.goto(base.href, { waitUntil: 'domcontentloaded' });
      await ready(page);
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'ja', 'First visit defaults to Japanese');
      assert.equal(await page.locator('.sc-language-toggle:visible').innerText(), 'English');
      await content(page, 'ja');
      result.japaneseOverflow = await assertNoOverflow(page, `${spec.name} Japanese hero`);
      await capture(page, `${spec.name}-hero-ja`);
      if (!spec.mobile) await page.keyboard.press('Tab');
      async function focusContrast(phase) {
        for (const selector of ['.icsa-dark .icsa-action', '.icsa-dark .icsa-scroll']) {
          const link = page.locator(selector);
          await link.evaluate(element => element.focus({ preventScroll: true }));
          const style = await link.evaluate(element => { const s = getComputedStyle(element); return { visible: element.matches(':focus-visible'), color: s.outlineColor, width: s.outlineWidth, shadow: s.boxShadow }; });
          assert.ok(style.visible && style.color === 'rgb(255, 255, 255)' && style.width === '2px' && style.shadow !== 'none', `${phase}: hero link has a dual-color keyboard focus indicator`);
          if (selector.endsWith('.icsa-action')) await capture(page, `${spec.name}-focus-${phase}`);
          await link.blur();
        }
      }
      if (!spec.mobile) await focusContrast('before');
      result.circleCentered = await circleAt(page, 1);
      assert.ok(Math.abs(result.circleCentered.heroTop) <= 3, 'Hero stays pinned as circle arrives');
      const center = (result.circleCentered.ball.top + result.circleCentered.ball.bottom) / 2;
      assert.ok(Math.abs(center - result.circleCentered.heroHeight / 2) <= 12, 'Circle arrives at the viewport center');
      await capture(page, `${spec.name}-circle-centered`);
      if (!spec.mobile) await focusContrast('during');
      result.circleFilled = await circleAt(page, 2);
      assert.ok(Math.abs(result.circleFilled.heroTop) <= 3, 'Hero stays pinned through the inversion');
      const circle = result.circleFilled.ball;
      assert.ok(circle.left <= 1 && circle.top <= 1 && circle.right >= spec.width - 1 && circle.bottom >= spec.height - 1, 'Expanded circle covers the viewport');
      await capture(page, `${spec.name}-inversion`);
      if (!spec.mobile) await focusContrast('after');
      await setLanguage(page, 'en');
      await content(page, 'en');
      result.englishOverflow = await assertNoOverflow(page, `${spec.name} English`);
      await section(page, 'concept', spec.mobile ? undefined : 'desktop-concept-en');
      await section(page, 'values', `${spec.name}-values`);
      await section(page, 'vision', spec.mobile ? undefined : 'desktop-vision');
      await section(page, 'japan', `${spec.name}-japan`);
      await section(page, 'product-preview');
      assert.ok(await page.locator('#product-preview a[href^="/product/"]').count() > 0, 'Closing product invitation links to the existing experience');
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(250);
      await page.screenshot({ path: resolve(output, `${spec.name}.png`), fullPage: true });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await ready(page);
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'en', 'English choice persists on reload');
      if (spec.mobile) {
        const menuButton = page.locator('.sc-menu-button');
        await menuButton.click();
        await page.locator('#sc-mobile-menu').waitFor({ state: 'visible' });
        await page.keyboard.press('Escape');
        await page.locator('#sc-mobile-menu').waitFor({ state: 'detached' });
        assert.equal(await menuButton.getAttribute('aria-expanded'), 'false', 'Escape closes the mobile menu');
        await menuButton.click();
        await page.locator('#sc-mobile-menu a[href="#values"]').click();
        await page.locator('#sc-mobile-menu').waitFor({ state: 'detached' });
        assert.equal(new URL(page.url()).hash, '#values', 'Mobile section link reaches its section');
        await menuButton.click();
        await page.locator('#sc-mobile-menu a[href^="/product/"]').click();
      } else {
        await page.locator('.sc-desktop-nav a[href^="/product/"]').click();
      }
      await page.waitForURL(url => url.pathname === '/product/');
      await page.locator('.sc-hero__render img').waitFor({ state: 'attached', timeout: 15000 });
      assert.equal(await page.locator('#listening-design').count(), 1, 'Product route preserves the existing gallery');
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'en', 'Language carries through to the product');
      assert.equal(await page.locator('.sc-brand').getAttribute('href'), '/', 'Product navbar returns to the landing page');
      result.productUrl = page.url();
      if (!spec.mobile) {
        await page.goto(new URL('/?lang=en#measurements', base).href, { waitUntil: 'domcontentloaded' });
        await page.waitForURL(url => url.pathname === '/product/' && url.hash === '#measurements');
        assert.equal(new URL(page.url()).searchParams.get('lang'), 'en', 'Old product section links retain the requested language');
      }
      assert.deepEqual(result.errors, [], 'No uncaught browser errors');
      result.passed = true;
    } catch (error) {
      result.passed = false; result.failure = error.stack;
      result.url = page.url();
      await capture(page, `${spec.name}-failure`).catch(() => {});
    }
    results.push(result); console.log(JSON.stringify(result));
    await context.close();
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  await context.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }); });
  const page = await context.newPage();
  const reduced = { name: 'reduced-motion-and-blocked-storage', errors: [] };
  page.on('pageerror', error => reduced.errors.push(error.message));
  try {
    await page.goto(base.href, { waitUntil: 'domcontentloaded' });
    await ready(page);
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'ja', 'Blocked storage retains Japanese default');
    await content(page, 'ja');
    reduced.trackHeight = await page.locator('.icsa-track').evaluate(element => element.getBoundingClientRect().height);
    assert.ok(reduced.trackHeight <= 844 * 1.5, 'Reduced motion has no long pinned scroll track');
    await capture(page, 'reduced');
    await section(page, 'concept');
    await section(page, 'values');
    await setLanguage(page, 'en');
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'en', 'Language remains usable when storage is blocked');
    reduced.overflow = await assertNoOverflow(page, 'Reduced motion');
    assert.deepEqual(reduced.errors, [], 'Reduced motion has no uncaught browser errors');
    reduced.passed = true;
  } catch (error) {
    reduced.passed = false; reduced.failure = error.stack;
    await capture(page, 'reduced-failure').catch(() => {});
  }
  results.push(reduced); console.log(JSON.stringify(reduced));
  await context.close();
} finally {
  await browser.close();
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ base: base.href, results }, null, 2));
}
if (results.some(result => !result.passed)) process.exitCode = 1;
