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
  await page.locator('html.reader-enhanced').waitFor();
  const figure = page.locator(`[data-diagram="${name}"]`);
  if (!await figure.isVisible()) {
    await figure.evaluate((element) => { location.hash = element.closest('section.level2').id; });
    await figure.waitFor({ state: 'visible' });
  }
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
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
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
    for (const figure of await page.locator('[data-diagram]').all()) {
      assert.equal(await figure.locator('img').isVisible(), true);
      assert.ok(await figure.locator('img').evaluate((element) => element.complete && element.naturalWidth > 0));
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
    await page.locator('html.reader-enhanced').waitFor();
    await figure.evaluate((element) => { location.hash = element.closest('section.level2').id; });
    await figure.waitFor({ state: 'visible' });
    await figure.scrollIntoViewIfNeeded();
    await figure.locator('.diagram-notice').waitFor();
    assert.equal(await figure.locator('.diagram-static img').isVisible(), true);
    assert.equal(await figure.getByRole('button', { name: 'Try again' }).count(), 1);
    assert.equal(await figure.locator('canvas').count(), 0);
  } finally { await page.close(); }
});

test('reader navigation, sources and browser history preserve chapter context', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  try {
    await page.goto(site);
    await page.locator('html.reader-enhanced').waitFor();
    assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Porsche Boxster 2.9');
    await page.getByRole('navigation', { name: 'Written chapters' }).getByRole('link', { name: 'Brakes and stability systems', exact: true }).click();
    const chapter = page.locator('#book > section.level2:not([hidden])');
    assert.match(await chapter.locator('h1').innerText(), /Brakes and stability/);
    await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
    await page.getByRole('link', { name: 'Skip to reading' }).focus();
    await page.getByRole('link', { name: 'Skip to reading' }).press('Enter');
    await page.waitForURL(/#book$/);
    assert.match(await chapter.locator('h1').innerText(), /Brakes and stability/);
    assert.equal(await page.locator('.book-sidebar [aria-current="page"]').count(), 1);
    assert.ok(await page.getByRole('navigation', { name: 'Chapter sections' }).isVisible());
    const notes = chapter.locator('details.chapter-notes');
    assert.equal(await notes.evaluate((element) => element.open), false);
    await page.getByRole('navigation', { name: 'Chapter sections' }).getByRole('link', { name: 'Notes and sources', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#book > .level2:not([hidden]) .chapter-notes')?.open);
    await notes.locator('summary').click();
    assert.equal(await notes.evaluate((element) => element.open), false);
    const firstNote = chapter.locator('.footnote-ref').first();
    const noteId = (await firstNote.getAttribute('href')).slice(1);
    const referenceId = await firstNote.getAttribute('id');
    await firstNote.click();
    assert.equal(new URL(page.url()).hash, `#${noteId}`);
    assert.ok(await chapter.locator(`[id="${noteId}"]`).isVisible());
    await chapter.locator(`[id="${noteId}"] .footnote-back`).first().click();
    assert.equal(new URL(page.url()).hash, `#${referenceId}`);
    await page.getByRole('navigation', { name: 'Adjacent chapters' }).getByRole('link').first().click();
    await page.waitForFunction(() => document.querySelector('#book > .level2:not([hidden]) .chapter-meta')?.textContent.includes('Chapter 12 '));
    assert.match(await chapter.locator('.chapter-meta').innerText(), /Chapter 12 of 18 · \d+ min read/);
    assert.doesNotMatch(await chapter.innerText(), /This chapter is planned/);
    await page.goBack();
    await page.waitForFunction((id) => !document.getElementById(id).closest('.level2').hidden, referenceId);
    assert.equal(await page.locator('h1:visible').count(), 1);
    await page.goto(site + `#${noteId}`);
    await page.locator(`[id="${noteId}"]`).waitFor({ state: 'visible' });
    assert.match(await page.title(), /Brakes and stability/);
    await page.emulateMedia({ media: 'print' });
    for (const section of await page.locator('#book > section.level2').all()) assert.ok(await section.isVisible());
  } finally { await page.close(); }
});

test('chapter sources start collapsed, toggle by keyboard and expand for printing without losing their state', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(portable);
    await page.locator('html.reader-enhanced').waitFor();
    assert.equal(await page.locator('details.chapter-notes').count(), 18);
    assert.equal(await page.locator('details.chapter-notes[open]').count(), 0);
    await page.getByRole('navigation', { name: 'Written chapters' }).getByRole('link', { name: 'Brakes and stability systems', exact: true }).click();
    const notes = page.locator('#book > .level2:not([hidden]) details.chapter-notes');
    const summary = notes.locator('summary');
    assert.equal(await notes.locator('ol').isVisible(), false);
    await summary.focus();
    await summary.press('Enter');
    assert.equal(await notes.locator('ol').isVisible(), true);
    await summary.press('Space');
    assert.equal(await notes.locator('ol').isVisible(), false);
    await notes.screenshot({ path: resolve(previews, 'sources-collapsed-phone.png') });
    await page.emulateMedia({ media: 'print' });
    await page.waitForFunction(() => document.querySelectorAll('details.chapter-notes[open]').length === 18);
    for (const list of await page.locator('.chapter-notes ol').all()) assert.ok(await list.isVisible());
    await page.emulateMedia({ media: 'screen' });
    await page.waitForFunction(() => document.querySelectorAll('details.chapter-notes[open]').length === 0);
    await page.locator('#book > .level2:not([hidden]) .footnote-ref').first().click();
    await notes.locator('ol').waitFor({ state: 'visible' });
    await page.emulateMedia({ media: 'print' });
    await page.waitForFunction(() => document.querySelectorAll('details.chapter-notes[open]').length === 18);
    await page.emulateMedia({ media: 'screen' });
    await page.waitForFunction(() => document.querySelectorAll('details.chapter-notes[open]').length === 1);
    assert.ok(await notes.evaluate((element) => element.open), 'Printing must retain a section the reader had opened');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally { await page.close(); }
});

test('phone contents traps focus, closes with Escape and opens the chosen chapter', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(site);
    await page.getByRole('button', { name: 'Contents', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Contents', exact: true });
    assert.ok(await dialog.isVisible());
    for (let index = 0; index < 21; index++) {
      await page.keyboard.press('Tab');
      // Native dialogs may send Tab to browser chrome (reported as body).
      // Background page controls must remain inert while the modal is open.
      assert.ok(await dialog.evaluate((element) => document.activeElement === document.body || element.contains(document.activeElement)), 'Background controls must not receive focus while contents is open');
    }
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.ok(await page.getByRole('button', { name: 'Contents', exact: true }).evaluate((element) => element === document.activeElement));
    await page.getByRole('button', { name: 'Contents', exact: true }).click();
    await dialog.getByRole('link', { name: 'Brakes and stability systems', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('heading', { level: 1, name: 'Brakes and stability systems' }).waitFor();
    assert.equal(await page.locator('.book-sidebar nav').count(), 1);
    const before = await page.locator('#book > section.level2:not([hidden]) > p:not(.chapter-meta)').first().evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    await page.getByRole('button', { name: 'Increase text size' }).click();
    const after = await page.locator('#book > section.level2:not([hidden]) > p:not(.chapter-meta)').first().evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    assert.equal(after, before + 1);
    await page.reload();
    await page.locator('html.reader-enhanced').waitFor();
    assert.equal(await page.locator('body').evaluate((element) => parseFloat(getComputedStyle(element).fontSize)), after);
  } finally { await page.close(); }
});

test('cover and chapter reflow from a small phone to a wide desktop, with offline fonts', async () => {
  const context = await browser.newContext({ offline: true });
  try {
    await context.addInitScript(() => { try { localStorage.removeItem('boxster-reading-size'); } catch {} });
    const page = await context.newPage();
    for (const width of [320, 390, 600, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(portable);
      await page.locator('html.reader-enhanced').waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.ok(await page.evaluate(() => document.fonts.check('20px "Source Serif 4"') && document.fonts.check('16px "Source Sans 3"')), 'Bundled reading fonts should work offline');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Cover overflows at ${width}px`);
      await page.getByRole('navigation', { name: 'Written chapters' }).getByRole('link', { name: 'Brakes and stability systems', exact: true }).click();
      await page.locator('#book > section.level2:not([hidden])').waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Chapter overflows at ${width}px`);
      await page.getByRole('button', { name: 'Increase text size' }).click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Larger text overflows at ${width}px`);
      if (width === 320 || width === 768) {
        for (const name of ['brake-explorer', 'caliper-pressure', 'braking-energy']) {
          await ready(page, name);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Interactive ${name} overflows at ${width}px`);
        }
      }
    }
  } finally { await context.close(); }
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

test('all eighteen chapters have offline illustrations and chapter-local source links', async () => {
  const context = await browser.newContext({ offline: true, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto(portable);
    const written = page.getByRole('navigation', { name: 'Written chapters' });
    await written.waitFor();
    assert.equal(await written.getByRole('link').count(), 18);
    const titles = await written.getByRole('link').allTextContents();
    assert.match(await page.locator('[data-draft-status]').innerText(), /All 18 chapters drafted/);
    await page.getByRole('link', { name: 'Start reading', exact: false }).click();
    await page.getByRole('heading', { level: 1, name: titles[0], exact: true }).waitFor();
    for (const title of titles) {
      await page.locator('.book-name').click();
      await written.getByRole('link', { name: title, exact: true }).click();
      const chapter = page.locator('#book > .level2:not([hidden])');
      assert.equal(await chapter.locator('h1').innerText(), title);
      assert.doesNotMatch(await chapter.locator('.chapter-meta').innerText(), /Planned/);
      const photos = chapter.locator('img[src^="data:image/jpeg"], img[src^="data:image/png"], img[src^="data:image/webp"]');
      if (title !== 'Brakes and stability systems') assert.ok(await photos.count() >= 1, `${title} needs a real photograph`);
      assert.ok(await chapter.locator('figure').count() >= 3, `${title} needs explanatory illustrations`);
      let hasLargeImage = false;
      for (const photo of await photos.all()) {
        const image = await photo.evaluate((element) => ({ loaded: element.complete && element.naturalWidth > 0, width: element.naturalWidth }));
        assert.ok(image.loaded, `${title} has a broken image`);
        hasLargeImage ||= image.width >= 200;
      }
      if (await photos.count()) assert.ok(hasLargeImage, `${title} needs an image large enough to examine`);
      const reference = chapter.locator('.footnote-ref').first();
      const noteId = (await reference.getAttribute('href')).slice(1);
      await reference.click();
      await page.waitForURL((url) => url.hash === `#${noteId}`);
      assert.ok(await chapter.locator(`[id="${noteId}"]`).isVisible());
      assert.equal(await chapter.locator('h1').innerText(), title, 'Opening a source note must retain the owning chapter');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${title} overflows on a phone`);
    }
  } finally { await context.close(); }
});

test('cross-chapter explanations navigate to the owning section and every book fragment resolves', async () => {
  for (const edition of [portable, site]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    try {
      await page.goto(edition);
      await page.locator('html.reader-enhanced').waitFor();
      const broken = await page.locator('#book a[href]').evaluateAll((links) => links.flatMap((link) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') && href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1)))) return [href];
        if (/index\.md(?:#|$)/.test(href)) return [href];
        return [];
      }));
      assert.deepEqual(broken, [], 'Every internal manuscript link must resolve in the reading edition');
      await page.getByRole('navigation', { name: 'Written chapters' }).getByRole('link', { name: 'Brakes and stability systems', exact: true }).click();
      await page.locator('#book > .level2:not([hidden])').getByRole('link', { name: 'unsprung mass', exact: true }).click();
      await page.getByRole('heading', { level: 1, name: 'Suspension and wheel geometry', exact: true }).waitFor();
      await page.waitForURL((url) => url.hash.endsWith('__compliance-and-unsprung-mass'));
      assert.ok(await page.getByRole('heading', { name: 'Compliance and unsprung mass', exact: true }).isVisible());
      await page.goBack();
      await page.getByRole('heading', { level: 1, name: 'Brakes and stability systems', exact: true }).waitFor();
    } finally { await page.close(); }
  }
});

test('family and option comparisons keep the 2.9 baseline while changing the selected configuration', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(portable);
    const family = await ready(page, 'family-variant-selector');
    assert.equal(await family.locator('.diagram-interactive').getAttribute('data-family-power-ps'), '255');
    await family.getByRole('button', { name: 'S', exact: true }).click();
    assert.equal(await family.locator('.diagram-interactive').getAttribute('data-family-power-ps'), '310');
    await family.getByRole('button', { name: 'Spyder', exact: true }).click();
    assert.equal(await family.locator('.diagram-interactive').getAttribute('data-family-power-ps'), '320');
    assert.match(await family.locator('.diagram-explanation').innerText(), /February 2010/);
    await family.getByRole('button', { name: 'Black Edition', exact: true }).click();
    assert.match(await family.locator('.diagram-explanation').innerText(), /March 2011/);
    const options = await ready(page, 'specification-option-links');
    await options.getByRole('button', { name: 'Differential + wheels', exact: true }).click();
    assert.match(await options.locator('.diagram-explanation').innerText(), /18.*19/);
    await options.getByRole('button', { name: 'Chrono Plus + PCM', exact: true }).click();
    assert.match(await options.locator('.diagram-explanation').innerText(), /PCM/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally { await page.close(); }
});

test('every interactive illustration mounts, responds to native controls and fits a phone', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(portable);
    const names = await page.locator('[data-diagram]').evaluateAll((figures) => figures.map((figure) => figure.dataset.diagram));
    assert.ok(names.length >= 23, 'The completed manuscript should retain its interactive illustrations');
    for (const name of names) {
      const figure = await ready(page, name);
      assert.ok(await figure.locator('.diagram-explanation').innerText(), `${name} needs a textual explanation`);
      for (const range of await figure.getByRole('slider').all()) {
        await range.focus();
        await range.press('End');
        assert.equal(await range.inputValue(), await range.getAttribute('max'), `${name} must respond to the keyboard`);
        await range.press('Home');
        assert.equal(await range.inputValue(), await range.getAttribute('min'));
      }
      for (const select of await figure.getByRole('combobox').all()) {
        const value = await select.locator('option').last().getAttribute('value');
        await select.selectOption(value);
        assert.equal(await select.inputValue(), value);
      }
      for (const checkbox of await figure.getByRole('checkbox').all()) {
        await checkbox.check();
        assert.ok(await checkbox.isChecked());
        await checkbox.uncheck();
      }
      const buttons = figure.getByRole('button');
      if (await buttons.count()) await buttons.last().click();
      assert.equal(await figure.locator('.diagram-notice').count(), 0, `${name} must not fall back after a runtime error`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflows a phone`);
      await figure.screenshot({
        path: resolve(previews, `all-${name}-phone.png`),
        style: '.viewer-bar, .skip-link { visibility: hidden !important; }',
      });
    }
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('engine feedback corrects the mixture without removing the leak, while cooling controls distinguish air and liquid flow', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(portable);
    const mixture = await ready(page, 'engine-mixture-feedback');
    await mixture.getByRole('slider', { name: 'Additional unmetered air', exact: true }).fill('10');
    await mixture.getByRole('slider', { name: 'Feedback correction step', exact: true }).fill('1');
    const model = mixture.locator('.diagram-interactive');
    assert.equal(Number(await model.getAttribute('data-fuel-correction')), 6);
    assert.ok(Math.abs(Number(await model.getAttribute('data-lambda')) - 1.1 / 1.06) < 1e-6);
    await mixture.getByRole('slider', { name: 'Feedback correction step', exact: true }).fill('8');
    assert.ok(Math.abs(Number(await model.getAttribute('data-lambda')) - 1) < 0.001);
    assert.match(await mixture.locator('.diagram-explanation').innerText(), /leak still exists/);
    await mixture.getByRole('slider', { name: 'Additional unmetered air', exact: true }).fill('0');
    assert.equal(Number(await model.getAttribute('data-lambda')), 1);
    assert.equal(Number(await model.getAttribute('data-fuel-correction')), 0);
    const cooling = await ready(page, 'fluid-cooling-path');
    await cooling.getByRole('button', { name: 'Warm in traffic', exact: true }).click();
    assert.equal(await cooling.locator('.diagram-interactive').getAttribute('data-cooling-condition'), '2');
    assert.match(await cooling.locator('.diagram-explanation').innerText(), /fans provide airflow/);
    await cooling.getByRole('button', { name: 'Warming up', exact: true }).click();
    assert.match(await cooling.locator('.diagram-explanation').innerText(), /short return path/);
  } finally { await page.close(); }
});

test('PDK selection prepares an unloaded path and transfers drive through controlled clutch states', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(portable);
    const pdk = await ready(page, 'pdk-power-path');
    const model = pdk.locator('.diagram-interactive');
    const stage = pdk.getByRole('slider', { name: 'Shift stage', exact: true });
    assert.equal(await model.getAttribute('data-pdk-k1'), 'closed');
    assert.equal(await model.getAttribute('data-pdk-k2'), 'open');
    assert.equal(await model.getAttribute('data-pdk-even-gear'), '2');
    await stage.fill('1');
    assert.equal(await model.getAttribute('data-pdk-k1'), 'releasing');
    assert.equal(await model.getAttribute('data-pdk-k2'), 'applying');
    await stage.fill('3');
    assert.equal(await model.getAttribute('data-pdk-k1'), 'open');
    assert.equal(await model.getAttribute('data-pdk-k2'), 'closed');
    assert.equal(await model.getAttribute('data-pdk-odd-gear'), '3');
    await pdk.getByRole('combobox', { name: 'Gear change', exact: true }).selectOption('3');
    assert.equal(await stage.inputValue(), '0');
    assert.equal(await model.getAttribute('data-pdk-k2'), 'closed');
    await stage.fill('3');
    assert.equal(await model.getAttribute('data-pdk-k1'), 'closed');
    assert.equal(await model.getAttribute('data-pdk-k2'), 'open');
    assert.equal(await model.getAttribute('data-pdk-even-gear'), '2');
  } finally { await page.close(); }
});

test('cabin demisting combines the air controls and electrical loads require a complete circuit', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(portable);
    const cabin = await ready(page, 'cabin-air-route');
    await cabin.getByRole('button', { name: 'Demisting principle', exact: true }).click();
    const air = cabin.locator('.diagram-interactive');
    for (const [name, value] of Object.entries({ source: 'fresh', outlet: 'screen', heat: '2', ac: 'on' })) {
      assert.equal(await air.getAttribute(`data-air-${name}`), value);
    }
    await cabin.getByRole('button', { name: 'Cooling principle', exact: true }).click();
    assert.equal(await air.getAttribute('data-air-heat'), '0');
    assert.equal(await air.getAttribute('data-air-outlet'), 'face');
    const circuit = await ready(page, 'electrical-current-path');
    const model = circuit.locator('.diagram-interactive');
    assert.equal(Number(await model.getAttribute('data-electrical-current')), 2);
    await circuit.getByRole('button', { name: 'Two parallel lamps', exact: true }).click();
    assert.equal(Number(await model.getAttribute('data-electrical-current')), 4);
    await circuit.getByRole('button', { name: 'Open earth', exact: true }).click();
    assert.equal(Number(await model.getAttribute('data-electrical-current')), 0);
    await circuit.getByRole('button', { name: 'Intact circuit', exact: true }).click();
    assert.equal(Number(await model.getAttribute('data-electrical-current')), 4);
    await circuit.getByRole('button', { name: 'Switch open', exact: true }).click();
    assert.equal(Number(await model.getAttribute('data-electrical-current')), 0);
  } finally { await page.close(); }
});

test('audio routes enforce their equipment dependencies and system scenarios preserve separate responsibilities', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(portable);
    const audio = await ready(page, 'audio-source-path');
    const path = audio.locator('.diagram-interactive');
    assert.equal(await path.getAttribute('data-audio-available'), 'true');
    await audio.getByRole('combobox', { name: 'Programme source', exact: true }).selectOption('usb');
    assert.equal(await path.getAttribute('data-audio-available'), 'false');
    await audio.getByRole('combobox', { name: 'Head unit', exact: true }).selectOption('pcm');
    assert.equal(await path.getAttribute('data-audio-available'), 'false');
    await audio.getByRole('checkbox', { name: 'Universal audio interface (870) fitted', exact: true }).check();
    assert.equal(await path.getAttribute('data-audio-available'), 'true');
    await audio.getByRole('combobox', { name: 'Programme source', exact: true }).selectOption('dvd');
    assert.equal(await path.getAttribute('data-audio-available'), 'false');
    await audio.getByRole('combobox', { name: 'Sound system', exact: true }).selectOption('bose');
    assert.equal(await path.getAttribute('data-audio-available'), 'true');
    const integration = await ready(page, 'protection-system-scenarios');
    const systems = integration.locator('.diagram-interactive');
    await integration.getByRole('combobox', { name: 'Situation', exact: true }).selectOption('shift');
    await integration.getByRole('combobox', { name: 'Transmission', exact: true }).selectOption('pdk');
    assert.equal(await systems.getAttribute('data-protection-systems'), 'pdk,dme');
    await integration.getByRole('combobox', { name: 'Situation', exact: true }).selectOption('grip');
    assert.equal(await systems.getAttribute('data-protection-systems'), 'psm,dme');
    assert.equal(await systems.getAttribute('data-protection-fixed-structure'), 'present');
    assert.equal(await systems.getAttribute('data-protection-deploys'), 'not-predicted');
  } finally { await page.close(); }
});

test('suspension illustrations distinguish damping velocity from spring deflection and anti-roll twist', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(portable);
    const spring = await ready(page, 'suspension-spring-damper');
    await spring.getByRole('slider', { name: 'Extra spring compression', exact: true }).fill('20');
    const velocity = spring.getByRole('slider', { name: 'Compression velocity', exact: true });
    await velocity.fill('0');
    const values = () => spring.locator('.diagram-interactive').evaluate((element) => ({ spring: Number(element.dataset.springForceN), damper: Number(element.dataset.damperForceN) }));
    const stationary = await values();
    assert.equal(stationary.spring, 400);
    assert.equal(stationary.damper, 0);
    await velocity.fill('0.1');
    const moving = await values();
    assert.equal(moving.spring, stationary.spring, 'Velocity alone must not change the spring force');
    assert.equal(Math.abs(moving.damper), 150);
    await spring.screenshot({ path: resolve(previews, 'suspension-spring-damper-phone.png') });
    const bar = await ready(page, 'suspension-anti-roll');
    await bar.getByRole('button', { name: 'Both wheels rise', exact: true }).click();
    assert.equal(Number(await bar.locator('.diagram-interactive').getAttribute('data-bar-twist-input-mm')), 0);
    await bar.getByRole('slider', { name: 'Left wheel bump travel', exact: true }).fill('30');
    await bar.getByRole('slider', { name: 'Right wheel bump travel', exact: true }).fill('-30');
    assert.equal(Number(await bar.locator('.diagram-interactive').getAttribute('data-bar-twist-input-mm')), 60);
    await bar.screenshot({ path: resolve(previews, 'suspension-anti-roll-phone.png') });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally { await page.close(); }
});

test('engine illustrations connect the four strokes, half-speed cams and separate timing/lift changes', async () => {
  const context = await browser.newContext({ offline: true, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto(portable);
    const cycle = await ready(page, 'engine-four-stroke');
    const angle = cycle.getByRole('slider', { name: 'Crankshaft angle', exact: true });
    for (const [degrees, stroke] of [[90, 'intake'], [270, 'compression'], [450, 'power'], [630, 'exhaust']]) {
      await angle.fill(String(degrees));
      assert.equal(await cycle.locator('.diagram-interactive').getAttribute('data-engine-stroke'), stroke);
      assert.equal(Number(await cycle.locator('.diagram-interactive').getAttribute('data-engine-cam-angle')), degrees / 2);
    }
    await cycle.screenshot({ path: resolve(previews, 'engine-four-stroke-phone.png') });
    const valves = await ready(page, 'engine-timing-lift');
    await valves.getByRole('slider', { name: 'Illustrative inlet advance', exact: true }).fill('20');
    await valves.getByRole('button', { name: /High lift/ }).click();
    assert.equal(Number(await valves.locator('.diagram-interactive').getAttribute('data-engine-advance')), 20);
    assert.equal(Number(await valves.locator('.diagram-interactive').getAttribute('data-engine-lift-mm')), 10);
    await valves.getByRole('button', { name: /Low lift/ }).click();
    assert.equal(Number(await valves.locator('.diagram-interactive').getAttribute('data-engine-lift-mm')), 3.6);
    assert.equal(Number(await valves.locator('.diagram-interactive').getAttribute('data-engine-advance')), 20, 'Selecting lift must not silently change the requested timing');
    await valves.screenshot({ path: resolve(previews, 'engine-timing-lift-phone.png') });
    await page.locator('.book-name').click();
    await page.locator('#title').waitFor({ state: 'visible' });
    await valves.locator('.diagram-interactive').waitFor({ state: 'detached' });
    await ready(page, 'engine-timing-lift');
    assert.equal(await valves.getByRole('slider').inputValue(), '20', 'Changing chapters must retain the illustration state');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally { await context.close(); }
});

test('roof illustrations separate opening sequence from drainage and retain clear/blocked states', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(portable);
    const opening = await ready(page, 'roof-opening');
    const stage = opening.getByRole('slider', { name: 'Opening stage', exact: true });
    await stage.fill('4');
    assert.equal(await opening.locator('.diagram-interactive').getAttribute('data-roof-stage'), '4');
    await stage.fill('0');
    assert.equal(await opening.locator('.diagram-interactive').getAttribute('data-roof-stage'), '0');
    await opening.screenshot({ path: resolve(previews, 'roof-opening-phone.png') });
    const drain = await ready(page, 'roof-drainage');
    await drain.getByRole('slider', { name: 'Illustrative rain input', exact: true }).fill('100');
    await drain.getByRole('button', { name: 'Clear drain', exact: true }).click();
    assert.equal(await drain.locator('.diagram-interactive').getAttribute('data-drain-state'), 'clear');
    assert.equal(await drain.locator('.diagram-interactive').getAttribute('data-water-outcome'), 'drained');
    await drain.getByRole('button', { name: 'Blocked drain', exact: true }).click();
    assert.equal(await drain.locator('.diagram-interactive').getAttribute('data-drain-state'), 'blocked');
    assert.equal(await drain.locator('.diagram-interactive').getAttribute('data-water-outcome'), 'overflow');
    await drain.screenshot({ path: resolve(previews, 'roof-drainage-phone.png') });
    await page.emulateMedia({ media: 'print' });
    for (const figure of [opening, drain]) {
      assert.equal(await figure.locator('.diagram-interactive').isVisible(), false);
      assert.equal(await figure.locator('.diagram-static img').isVisible(), true);
    }
  } finally { await page.close(); }
});
