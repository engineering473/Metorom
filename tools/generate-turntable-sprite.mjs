import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.argv[2] ?? 'http://127.0.0.1:5173/Metorom/tools/turntable-capture.html';
const output = resolve(import.meta.dirname, '../public/images/concepts/speaker-turntable.webp');
const columns = 5;
const rows = 5;
const frameWidth = 480;
const frameHeight = 570;

const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 640, height: 760 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body.dataset.status === 'ready', undefined, { timeout: 120000 });

  const base64 = await page.evaluate(({ columns, rows, frameWidth, frameHeight }) => {
    const atlas = document.createElement('canvas');
    atlas.width = columns * frameWidth;
    atlas.height = rows * frameHeight;
    const context = atlas.getContext('2d', { alpha: false });
    const source = document.getElementById('canvas');
    if (!context || !(source instanceof HTMLCanvasElement)) throw new Error('Turntable canvas unavailable');

    const count = columns * rows;
    for (let index = 0; index < count; index += 1) {
      if (!window.captureAt(index / (count - 1))) throw new Error(`Frame ${index} did not render`);
      context.drawImage(source, (index % columns) * frameWidth, Math.floor(index / columns) * frameHeight, frameWidth, frameHeight);
    }
    const data = atlas.toDataURL('image/webp', 0.82);
    if (!data.startsWith('data:image/webp;base64,')) throw new Error('WebP encoding unavailable');
    return data.split(',')[1];
  }, { columns, rows, frameWidth, frameHeight });

  const bytes = Buffer.from(base64, 'base64');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, bytes);
  process.stdout.write(JSON.stringify({ output, frames: columns * rows, columns, rows, frameWidth, frameHeight, bytes: bytes.length }) + '\n');
} finally {
  await browser.close();
}
