import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve('dist');
const portable = pathToFileURL(resolve(root, 'book.html')).href;
const previews = resolve(root, 'previews');
let browser, server, web, site;

before(async () => {
  await mkdir(previews, { recursive: true });
  server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    // Mount the Pages artifact under the same project prefix used in production.
    const resource = pathname.startsWith('/boxster-book/') ? `/site${pathname.slice('/boxster-book'.length)}` : pathname;
    const file = resolve(root, `.${resource.endsWith('/') ? resource + 'index.html' : resource}`);
    if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    try {
      const data = await readFile(file);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.txt': 'text/plain' };
      response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }).end(data);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  web = `http://127.0.0.1:${server.address().port}/web/book.html`;
  site = `http://127.0.0.1:${server.address().port}/boxster-book/`;
  browser = await chromium.launch({
    ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : { channel: 'chrome' }),
    headless: true,
    args: ['--enable-unsafe-swiftshader'],
  });
});

after(async () => {
  await browser?.close();
  await new Promise((done) => server ? server.close(done) : done());
});

async function ready(page, name) {
  const figure = page.locator(`[data-diagram="${name}"]`);
  await figure.scrollIntoViewIfNeeded();
  await page.waitForFunction((name) => document.querySelector(`[data-diagram="${name}"]`).classList.contains('diagram-ready'), name);
  return figure;
}

test('portable HTML works offline; keyboard and part controls survive leaving the page section', async () => {
  const context = await browser.newContext({ offline: true, viewport: { width: 1440, height: 1100 } });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(portable);
    const figure = await ready(page, 'brake-explorer');
    assert.equal(await figure.locator('canvas').count(), 1);
    await figure.screenshot({ path: resolve(previews, 'whole-car.png') });
    const slider = figure.getByRole('slider', { name: 'Explore the assembly' });
    await slider.focus();
    await slider.press('Home');
    await slider.press('ArrowRight');
    assert.equal(await slider.inputValue(), '1');
    await slider.press('End');
    assert.equal(await figure.locator('.diagram-interactive').getAttribute('data-exploded'), '1.000');
    await figure.screenshot({ path: resolve(previews, 'exploded-brake.png') });
    await figure.getByRole('button', { name: 'Caliper body', exact: true }).click();
    assert.match(await figure.locator('.diagram-explanation').textContent(), /stays in one piece/);
    await figure.screenshot({ path: resolve(previews, 'caliper-detail.png') });
    const occupiedHeight = await figure.evaluate((element) => element.clientHeight);
    await page.evaluate(() => window.scrollTo(0, 0));
    await figure.locator('canvas').waitFor({ state: 'detached' });
    assert.equal(await figure.evaluate((element) => element.clientHeight), occupiedHeight, 'Releasing a diagram must preserve the surrounding reading layout');
    await ready(page, 'brake-explorer');
    assert.equal(await figure.getByRole('slider').inputValue(), '100');
    assert.equal(await figure.getByRole('button', { name: 'Caliper body', exact: true }).getAttribute('aria-pressed'), 'true');
    await figure.getByRole('button', { name: 'Reset view', exact: true }).click();
    assert.equal(await figure.getByRole('slider').inputValue(), '0');
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('D3 diagrams explain pressure and the fourfold energy increase at twice the speed', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  try {
    await page.goto(portable);
    const caliper = await ready(page, 'caliper-pressure');
    await caliper.getByRole('slider', { name: 'Pedal input' }).fill('100');
    assert.equal(Number(await caliper.locator('.diagram-interactive').getAttribute('data-relative-pressure')), 1);
    assert.match(await caliper.locator('.diagram-explanation').textContent(), /100%/);
    await caliper.screenshot({ path: resolve(previews, 'hydraulic-pressure.png') });
    const energy = await ready(page, 'braking-energy');
    const value = () => energy.locator('.diagram-interactive').getAttribute('data-energy-kj').then(Number);
    const reference = await value();
    await energy.getByRole('slider', { name: 'Speed', exact: true }).fill('200');
    assert.equal(await value(), reference * 4);
    assert.match(await energy.locator('.diagram-explanation').textContent(), /4.00 times/);
    await energy.getByRole('slider', { name: 'Illustrative total mass' }).fill('1000');
    assert.ok(Math.abs(await value() - 1543.20987654) < 1e-6);
    await energy.screenshot({ path: resolve(previews, 'kinetic-energy.png') });
    await page.emulateMedia({ media: 'print' });
    assert.equal(await energy.locator('.diagram-interactive').isVisible(), false);
    assert.equal(await energy.locator('.diagram-static img').isVisible(), true);
  } finally { await page.close(); }
});

test('web edition loads models on approach and reads correctly at a phone width', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  try {
    const models = [], errors = [];
    page.on('request', (request) => { if (request.url().endsWith('.glb')) models.push(request.url()); });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(web);
    await page.waitForLoadState('networkidle');
    assert.equal(models.length, 0, 'Models should not load at the start of the book');
    const figure = await ready(page, 'brake-explorer');
    assert.equal(models.length, 2);
    await figure.getByRole('button', { name: 'Exploded', exact: true }).click();
    await figure.screenshot({ path: resolve(previews, 'mobile-exploded.png'), style: '.viewer-bar { visibility: hidden; }' });
    for (const id of ['brake-explorer', 'caliper-pressure', 'braking-energy']) {
      const current = await ready(page, id);
      assert.ok(await current.getByRole('slider').first().isVisible());
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${id} overflows horizontally`);
    }
    await page.screenshot({ path: resolve(previews, 'mobile-energy.png') });
    await ready(page, 'brake-explorer');
    assert.equal(models.length, 2, 'Recently used models should be reused after leaving the viewport');
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('static diagrams remain readable without JavaScript or WebGL', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(portable);
    for (const id of ['brake-explorer', 'caliper-pressure', 'braking-energy']) {
      const figure = page.locator(`[data-diagram="${id}"]`);
      assert.equal(await figure.locator('img').isVisible(), true);
      assert.equal(await figure.locator('canvas').count(), 0);
    }
  } finally { await context.close(); }
  const page = await browser.newPage();
  try {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
        return /webgl/.test(kind) ? null : original.call(this, kind, ...args);
      };
    });
    await page.goto(portable);
    const figure = page.locator('[data-diagram="brake-explorer"]');
    await figure.scrollIntoViewIfNeeded();
    await figure.locator('.diagram-notice').waitFor();
    assert.equal(await figure.locator('.diagram-static img').isVisible(), true);
    assert.equal(await figure.getByRole('button', { name: 'Try again' }).count(), 1);
    assert.equal(await figure.locator('canvas').count(), 0);
  } finally { await page.close(); }
});

test('Pages index loads interactive code and models under the project URL', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  try {
    const errors = [], assets = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (/\.(js|glb)$/.test(new URL(response.url()).pathname)) {
        assets.push({ url: response.url(), status: response.status() });
      }
    });
    const response = await page.goto(site);
    assert.equal(response.status(), 200);
    assert.equal(await page.title(), 'Porsche Boxster 2.9');
    const car = await ready(page, 'brake-explorer');
    await car.getByRole('button', { name: 'Exploded', exact: true }).click();
    assert.equal(await car.getByRole('slider').inputValue(), '100');
    const energy = await ready(page, 'braking-energy');
    await energy.getByRole('slider', { name: 'Speed', exact: true }).fill('200');
    assert.match(await energy.locator('.diagram-explanation').textContent(), /4.00 times/);
    assert.equal(assets.filter((asset) => asset.url.endsWith('.glb')).length, 2);
    assert.ok(assets.every((asset) => asset.status === 200 && asset.url.startsWith(`${site}index-assets/`)), JSON.stringify(assets));
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});
