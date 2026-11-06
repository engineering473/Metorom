import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import react from '@vitejs/plugin-react';
import { createServer, normalizePath } from 'vite';

const root = normalizePath(resolve(import.meta.dirname, '..'));
const source = readFileSync(resolve(root, 'data/measurements/alpha-6a-1m-0deg.txt'));
const rows = source.toString('utf8').split(/\r?\n/)
  .filter(line => line.trim() && !line.trimStart().startsWith('*'))
  .map((line, index) => {
    const values = line.trim().split(/\s+/).map(Number);
    assert.equal(values.length, 3, `Source row ${index + 1} must retain frequency, SPL and phase`);
    assert.ok(values.every(Number.isFinite), `Source row ${index + 1} must contain finite numbers`);
    return { hz: values[0], db: values[1], phase: values[2] };
  });

// The language module reads these globals during import. Restore every original
// descriptor even on assertion failure; no browser or production server is used.
const previousGlobals = new Map(['window', 'document', 'localStorage'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
const storage = { getItem: () => null, setItem() {} };
Object.defineProperties(globalThis, {
  window: { configurable: true, writable: true, value: { location: { search: '?lang=en' }, localStorage: storage } },
  document: { configurable: true, writable: true, value: { documentElement: { lang: 'en' } } },
  localStorage: { configurable: true, writable: true, value: storage },
});

let server;
try {
  // Bypass the site's build config: closing this SSR loader must not invoke its
  // production closeBundle asset-copy or compatibility-redirect hooks.
  server = await createServer({
    root,
    configFile: false,
    logLevel: 'error',
    plugins: [react()],
    resolve: { alias: { '@': root } },
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
  });
  const { ALPHA_6A_MEASUREMENT: metadata, ALPHA_6A_MEASUREMENT_POINTS: points } = await server.ssrLoadModule('/data/measurements/alpha-6a-1m-0deg.ts');
  const { driverResponseSeries, driverResponseSpread, responseSpread, responseValueAt } = await server.ssrLoadModule('/concepts/monochrome/sculptural-v3/frequency-response-cards.tsx');
  const { DEFAULT_COPY: copy } = await server.ssrLoadModule('/concepts/monochrome/sculptural-v3/site-copy.ts');

  assert.equal(createHash('sha256').update(source).digest('hex'), metadata.sourceSha256, 'The archived REW source must retain its original bytes');
  assert.equal(rows.length, 13108, 'All recorded frequency/SPL/phase rows must be retained');
  assert.equal(points.length, rows.length, 'The plotted series must retain every recorded sample');
  assert.equal(metadata.sampleCount, rows.length);
  assert.equal(metadata.minimumHz, rows[0].hz);
  assert.equal(metadata.maximumHz, rows.at(-1).hz);
  assert.equal(metadata.minimumHz, 199.951157);
  assert.equal(metadata.maximumHz, 4999.877524);
  assert.equal(metadata.minimumDb, Math.min(...rows.map(point => point.db)));
  assert.equal(metadata.maximumDb, Math.max(...rows.map(point => point.db)));
  assert.equal(metadata.distanceMeters, 1);
  assert.equal(metadata.angleDegrees, 0);
  assert.equal(metadata.sourceSmoothing, 'None');
  assert.match(metadata.measurementName, /^R Alpha 6A/);
  assert.match(metadata.traceSharing, /not two independent measurements/);

  for (let index = 0; index < rows.length; index++) {
    const point = points[index];
    const original = rows[index];
    assert.ok(Number.isFinite(point.hz) && Number.isFinite(point.db), `Plotted row ${index + 1} must remain finite`);
    assert.equal(point.hz, original.hz, `Frequency changed at source row ${index + 1}`);
    assert.equal(point.db, original.db, `SPL changed or normalized at source row ${index + 1}`);
    assert.equal(responseValueAt(points, original.hz), original.db, `Native sample lookup changed at source row ${index + 1}`);
    if (index === 0) continue;
    const previous = points[index - 1];
    assert.ok(point.hz > previous.hz, `Frequencies must strictly increase at row ${index + 1}`);
    const halfwayOnLogAxis = Math.sqrt(previous.hz * point.hz);
    const interpolated = responseValueAt(points, halfwayOnLogAxis);
    assert.ok(interpolated >= Math.min(previous.db, point.db) - 1e-9 && interpolated <= Math.max(previous.db, point.db) + 1e-9, `Interpolation overshot adjacent samples at row ${index + 1}`);
    assert.ok(Math.abs(interpolated - (previous.db + point.db) / 2) < 1e-9, `Log-axis interpolation changed at row ${index + 1}`);
  }
  for (const hz of [20, 100, metadata.minimumHz - .000001, metadata.maximumHz + .000001, 5000, 20000]) {
    assert.equal(responseValueAt(points, hz), null, `Measured data must not extend outside the export at ${hz} Hz`);
  }
  assert.equal(responseValueAt([], 1000), null);

  const left = driverResponseSeries('mid', copy);
  const right = driverResponseSeries('right', copy);
  assert.equal(left.measured, true);
  assert.equal(right.measured, true);
  assert.strictEqual(left.data, points, 'Left view must reuse the original recording without processing');
  assert.strictEqual(right.data, points, 'Right view must reuse the original recording without processing');
  const measuredSpread = driverResponseSpread('mid', left);
  assert.equal(measuredSpread.minimumDb, 48.073, 'Spread must include the low-level recorded band edge');
  assert.equal(measuredSpread.maximumDb, 62.674, 'Spread must include the actual recorded maximum');
  assert.equal(measuredSpread.minimumHz, metadata.minimumHz);
  assert.equal(measuredSpread.maximumHz, metadata.maximumHz);
  assert.ok(Math.abs(measuredSpread.midpointDb - 55.3735) < 1e-10);
  assert.ok(Math.abs(measuredSpread.deviationDb - 7.3005) < 1e-10);
  assert.ok(Math.abs(measuredSpread.peakToPeakDb - 14.601) < 1e-10);
  assert.deepEqual(driverResponseSpread('right', right), measuredSpread, 'Both views must report the same recording spread');
  for (const point of rows) {
    assert.ok(Math.abs(point.db - measuredSpread.midpointDb) <= measuredSpread.deviationDb + 1e-10, 'Every original sample must lie within the exact min/max envelope');
  }
  assert.equal(responseSpread([], 200, 5000), null);
  assert.equal(responseSpread(points, 6000, 20000), null, 'A spread must not invent a band outside the recording');
  assert.deepEqual(responseSpread(points, 20, 20000), measuredSpread, 'Requested wider bands must clamp to recorded data');
  for (const driver of ['sub', 'tweeter']) {
    const other = driverResponseSeries(driver, copy);
    assert.equal(Boolean(other.measured), false, `${driver} must remain labeled illustrative`);
    assert.notStrictEqual(other.data, points, `${driver} must not use the Alpha 6A recording`);
    const band = driver === 'sub' ? [60, 150] : [2500, 15000];
    const spread = driverResponseSpread(driver, other);
    const values = [responseValueAt(other.data, band[0]), responseValueAt(other.data, band[1]), ...other.data.filter(point => point.hz >= band[0] && point.hz <= band[1]).map(point => point.db)];
    assert.equal(spread.minimumDb, Math.min(...values), 'Model spread must include the drawn line at both band edges');
    assert.equal(spread.maximumDb, Math.max(...values));
  }

  const { default: DriverResponseGraph } = await server.ssrLoadModule('/concepts/monochrome/sculptural-v3/driver-response-graph.tsx');
  for (const driver of ['mid', 'right']) for (const compact of [false, true]) {
    const html = renderToStaticMarkup(React.createElement(DriverResponseGraph, { driver, copy, compact }));
    assert.ok(html.includes('MEASURED RIGHT DRIVER · SHARED L/R'), `${driver} graph must identify the shared right-driver capture`);
    assert.ok(html.includes('200 Hz – 5 kHz'), `${driver} graph must show the recorded frequency range`);
    assert.ok(html.includes('1 m · 0°'), `${driver} graph must show the supplied measurement position`);
    assert.ok(html.includes('preserveAspectRatio="xMidYMid meet"'), `${driver} graph must avoid stretching text`);
    assert.ok(!html.includes(copy.chartDataNote), `${driver} recording must not be labeled illustrative`);
    assert.ok(html.includes('Spread ±7.3 dB'), `${driver} must show the measured full-band spread`);
    assert.ok(html.includes('Midpoint 55.4 dB'), `${driver} must show the reference for the symmetric spread`);
    assert.ok(html.includes('48.073–62.674 dB'), `${driver} accessible description must identify the exact recorded limits`);
    assert.ok(html.includes('frc-plot__spread'), `${driver} must draw the min/max envelope`);
  }

} finally {
  try {
    if (server) await server.close();
  } finally {
    for (const [name, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  }
}

for (const [name, descriptor] of previousGlobals) assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis, name), descriptor, `${name} must be restored after SSR verification`);
console.log('Alpha 6A checks passed: original SHA, all 13,108 exact samples, bounded lookup, shared L/R recording, exact 48.073–62.674 dB envelope (±7.3005 dB about 55.3735 dB), model band-edge calculations, visible spread/reference labels, and restored SSR globals.');
