declare global {
  interface Window {
    __menuScroll?: number[];
    __bookPrint?: {
      title: string;
      notes: number;
      images: boolean;
      dialog: boolean;
    };
  }
}
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createServer, type Server } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { build } from 'esbuild';
import { Browser, chromium, Page } from 'playwright-core';
import { afterAll as after, afterEach, beforeAll as before, test } from 'vite-plus/test';
const root = resolve('dist');
const previews = resolve(root, 'previews');
const chapterCount = (await readdir(resolve('book'))).filter((name) => /^\d{2,}-/.test(name)).length;
let browser: Browser, server: Server, preview: string, site: string;
before(async () => {
  await mkdir(previews, { recursive: true });
  server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    // Mount the Pages artifact under the same project prefix used in production.
    const resource = pathname.startsWith('/boxster-book/')
      ? `/site${pathname.slice('/boxster-book'.length)}`
      : pathname;
    const file = resolve(root, `.${resource.endsWith('/') ? resource + 'index.html' : resource}`);
    if (!file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    try {
      const data = await readFile(file);
      const types: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.glb': 'model/gltf-binary',
        '.woff2': 'font/woff2',
        '.txt': 'text/plain',
      };
      response
        .writeHead(200, {
          'Content-Type': types[extname(file)] ?? 'application/octet-stream',
        })
        .end(data);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done));
  preview = `http://127.0.0.1:${(server.address() as import('node:net').AddressInfo).port}/site/`;
  site = `http://127.0.0.1:${(server.address() as import('node:net').AddressInfo).port}/boxster-book/`;
  browser = await chromium.launch({
    ...(process.env.BROWSER_EXECUTABLE_PATH
      ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH }
      : { channel: 'chrome' }),
    headless: true,
    args: ['--enable-unsafe-swiftshader'],
  });
});
after(async () => {
  await browser?.close();
  await new Promise<void>((done) => (server ? server.close(() => done()) : done()));
});
afterEach(async () => {
  // A Vitest timeout does not cancel outstanding Playwright operations. Close
  // their contexts before the next test can compete with a leftover renderer.
  await Promise.all(browser?.contexts().map((context) => context.close()) ?? []);
});
async function ready(page: Page, name: string | undefined) {
  await page.locator('html.reader-enhanced:not([data-reader-pending])').waitFor();
  const figure = page.locator(`[data-diagram="${name}"]`);
  if (!(await figure.isVisible())) {
    await figure.evaluate((element) => {
      location.hash = element.closest('section.level2')!.id;
    });
    await figure.waitFor({ state: 'visible' });
  }
  await figure.scrollIntoViewIfNeeded();
  await page.waitForFunction(
    (name) => document.querySelector<HTMLElement>(`[data-diagram="${name}"]`)!.classList.contains('diagram-ready'),
    name,
  );
  return figure;
}
test('the colour theme follows the device, remembers an override and can return to automatic', async () => {
  const context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(site);
    await page.locator('html.reader-enhanced').waitFor();
    const theme = () => page.locator('html').getAttribute('data-theme');
    const choose = async (name: string) => {
      await page.getByRole('button', { name: 'Theme', exact: true }).click();
      await page.getByRole('radio', { name, exact: true }).check();
      await page.keyboard.press('Escape');
      assert.ok(
        await page.getByRole('button', { name: 'Theme', exact: true }).evaluate((e) => e === document.activeElement),
      );
    };
    assert.equal(await theme(), 'dark');
    assert.equal(await page.evaluate(() => localStorage.getItem('boxster-theme')), null);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await choose('Dark');
    assert.equal(await theme(), 'dark');
    assert.equal(await page.evaluate(() => localStorage.getItem('boxster-theme')), 'dark');
    await page.reload();
    await page.locator('html.reader-enhanced').waitFor();
    assert.equal(await theme(), 'dark');
    await page.emulateMedia({ colorScheme: 'dark' });
    await choose('Light');
    assert.equal(await theme(), 'light', 'A light override takes precedence over a dark device');
    await choose('Device setting');
    assert.equal(await theme(), 'dark');
    assert.equal(await page.evaluate(() => localStorage.getItem('boxster-theme')), null);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    const other = await context.newPage();
    await other.goto(site);
    await other.evaluate(() => localStorage.setItem('boxster-theme', 'dark'));
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await other.evaluate(() => localStorage.setItem('boxster-theme', 'invalid'));
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
test('tapping a theme label survives a blur without a focus destination', async () => {
  const context = await browser.newContext({
    colorScheme: 'light',
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  try {
    const page = await context.newPage();
    await page.goto(site);
    await page.locator('html.reader-enhanced:not([data-reader-pending])').waitFor();
    const summary = page.getByRole('button', { name: 'Theme', exact: true });
    const picker = page.locator('.theme-picker');
    await summary.tap();
    for (const [label, preference] of [
      ['Dark', 'dark'],
      ['Light', 'light'],
    ]) {
      await summary.focus();
      const option = picker.locator('label').filter({ hasText: new RegExp(`^${label}$`) });
      // Safari blurs the summary before a tapped label activates its radio,
      // with no relatedTarget because the label itself is not focusable.
      await option.evaluate((element) => {
        element.addEventListener('pointerdown', () => (document.activeElement as HTMLElement).blur(), { once: true });
      });
      await option.tap();
      assert.equal(await page.locator('html').getAttribute('data-theme'), preference);
      assert.equal(await page.evaluate(() => localStorage.getItem('boxster-theme')), preference);
      assert.equal(await picker.evaluate((element) => (element as HTMLDetailsElement).open), true);
    }
    await page.locator('.book-name').tap();
    assert.equal(await picker.evaluate((element) => (element as HTMLDetailsElement).open), false);
    await summary.tap();
    await page.getByRole('radio', { name: 'Dark', exact: true }).focus();
    await page.keyboard.press('Tab');
    assert.equal(await picker.evaluate((element) => (element as HTMLDetailsElement).open), false);
  } finally {
    await context.close();
  }
});
test('a saved dark theme is applied before the reader bundle loads', async () => {
  const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1440, height: 900 } });
  let release!: () => void;
  const delayed = new Promise<void>((done) => (release = done));
  try {
    await context.addInitScript(() => localStorage.setItem('boxster-theme', 'dark'));
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.route('**/reader-*.js', async (route) => {
      await delayed;
      await route.continue();
    });
    await page.goto(site, { waitUntil: 'commit' });
    await page.locator('#reader-loading').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('html').evaluate((e) => e.classList.contains('reader-enhanced')), false);
    assert.equal(await page.locator('body').evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(17, 24, 21)');
    assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'), '#111815');
    await page.screenshot({ path: resolve(previews, 'dark-before-hydration.png') });
    release();
    await page.locator('html.reader-enhanced:not([data-reader-pending])').waitFor();
    await page.getByRole('button', { name: 'Theme', exact: true }).click();
    assert.equal(await page.getByRole('radio', { name: 'Dark', exact: true }).isChecked(), true);
    assert.deepEqual(errors, []);
  } finally {
    release();
    await context.close();
  }
});
test('the colour theme works without storage and the no-JavaScript and print editions remain readable', async () => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  try {
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('Storage blocked', 'SecurityError');
        },
      });
    });
    const page = await context.newPage();
    await page.goto(site);
    await page.locator('html.reader-enhanced:not([data-reader-pending])').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.getByRole('button', { name: 'Theme', exact: true }).click();
    await page.getByRole('radio', { name: 'Light', exact: true }).check();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.getByRole('radio', { name: 'Dark', exact: true }).check();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('body').evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(255, 255, 255)');
    assert.equal(await page.locator('body').evaluate((e) => getComputedStyle(e).color), 'rgb(28, 40, 35)');
    assert.equal(await page.locator('#book > section.level2:visible').count(), chapterCount);
    assert.equal(await page.locator('.viewer-bar').isVisible(), false);
    await page.emulateMedia({ media: 'screen' });
    assert.equal(await page.locator('body').evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(17, 24, 21)');
  } finally {
    await context.close();
  }
  const staticContext = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark' });
  try {
    const page = await staticContext.newPage();
    await page.goto(site);
    assert.equal(await page.locator('body').evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(17, 24, 21)');
    assert.equal(await page.locator('#book > section.level2:visible').count(), chapterCount);
    assert.equal(await page.locator('.theme-picker').isVisible(), false);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('body').evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(255, 255, 255)');
  } finally {
    await staticContext.close();
  }
});
test('the dark reader, theme picker and diagrams fit phone, tablet and desktop layouts', async () => {
  const context = await browser.newContext({ colorScheme: 'dark', reducedMotion: 'reduce' });
  try {
    for (const width of [320, 390, 768, 1440]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(site);
      await page.locator('html.reader-enhanced:not([data-reader-pending])').waitFor();
      const theme = page.getByRole('button', { name: 'Theme', exact: true });
      await theme.click();
      assert.equal(await page.getByRole('radio', { name: 'Device setting', exact: true }).isChecked(), true);
      const popup = await page.getByRole('group', { name: 'Colour theme', exact: true }).boundingBox();
      assert.ok(popup && popup.x >= 0 && popup.x + popup.width <= width, `Theme picker clipped at ${width}px`);
      const contrast = await page.evaluate(() => {
        const luminance = (colour: string) => {
          const values = colour
            .match(/[\d.]+/g)!
            .slice(0, 3)
            .map(Number)
            .map((n) => {
              const s = n / 255;
              return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
          return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
        };
        return ['.theme-picker summary', '.theme-options label', '#title h1', '.cover-subtitle', '.start-reading'].map(
          (selector) => {
            const element = document.querySelector(selector)!;
            let parent: Element | null = element;
            let background = 'rgba(0, 0, 0, 0)';
            while (parent && background === 'rgba(0, 0, 0, 0)') {
              background = getComputedStyle(parent).backgroundColor;
              parent = parent.parentElement;
            }
            const a = luminance(getComputedStyle(element).color),
              b = luminance(background);
            return { selector, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
          },
        );
      });
      for (const { selector, ratio } of contrast) assert.ok(ratio >= 4.5, `${selector}: contrast ${ratio}`);
      await page.screenshot({ path: resolve(previews, `dark-cover-${width}.png`) });
      await page.keyboard.press('Escape');
      await page
        .getByRole('navigation', { name: 'Written chapters' })
        .getByRole('link', { name: 'Brakes and stability systems', exact: true })
        .click();
      const chapter = page.locator('#book > section.level2:not([hidden])');
      await chapter.waitFor();
      await page.locator('html:not([data-reader-pending])').waitFor();
      assert.equal(await chapter.evaluate((e) => getComputedStyle(e).color), 'rgb(229, 236, 231)');
      assert.equal(await page.locator('#book').evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(24, 32, 28)');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: resolve(previews, `dark-chapter-${width}.png`) });
      for (const name of ['brake-explorer', 'caliper-pressure']) {
        const figure = await ready(page, name);
        const stage = figure.locator('.diagram-stage');
        assert.equal(await stage.evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(241, 243, 242)');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (width === 390 || width === 1440)
          await figure.screenshot({ path: resolve(previews, `dark-${name}-${width}.png`) });
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await context.close();
  }
});
test('readers can switch between posters and live diagrams without losing their controls', async () => {
  for (const [url, width] of [
    [preview, 390],
    [site, 1440],
  ] as const) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    try {
      const page = await context.newPage();
      (await page.goto(url))!;
      for (const id of ['body-explorer', 'caliper-pressure']) {
        const figure = await ready(page, id);
        const choice = figure.getByRole('tablist', { name: 'Diagram view' });
        assert.equal(await choice.count(), 1, 'Every interactive diagram offers its static poster');
        const slider = figure.getByRole('slider').first();
        await slider.focus();
        await slider.press('End');
        const value = await slider.inputValue();
        const chapter = await figure.evaluate((element) => element.closest('section.level2')!.id);
        const interactive = choice.getByRole('tab', { name: 'Interactive', exact: true });
        const poster = choice.getByRole('tab', { name: 'Static diagram', exact: true });
        await interactive.focus();
        await interactive.press('ArrowLeft');
        await figure.locator('.diagram-static img').waitFor({ state: 'visible' });
        assert.equal((await poster.getAttribute('aria-selected'))!, 'true');
        assert.equal(await poster.evaluate((element) => element === document.activeElement), true);
        assert.equal(await interactive.getAttribute('tabindex'), '-1');
        const panel = figure.getByRole('tabpanel', { name: 'Static diagram', exact: true });
        assert.equal(await panel.getAttribute('id'), await poster.getAttribute('aria-controls'));
        assert.equal(await panel.getAttribute('aria-labelledby'), await poster.getAttribute('id'));
        assert.equal(await figure.locator('.diagram-interactive').evaluate((element) => element.childElementCount), 0);
        assert.equal(await figure.locator('.diagram-loading').isVisible(), false);
        await page.emulateMedia({ media: 'print' });
        assert.equal(await choice.isVisible(), false);
        assert.equal(await figure.locator('.diagram-static img').isVisible(), true);
        await page.emulateMedia({ media: 'screen' });
        await page.evaluate(() => {
          location.hash = 'title';
        });
        await page.locator('#title').waitFor({ state: 'visible' });
        await page.evaluate((chapter) => {
          location.hash = chapter;
        }, chapter);
        await figure.waitFor({ state: 'visible' });
        await figure.scrollIntoViewIfNeeded();
        assert.equal(
          (await poster.getAttribute('aria-selected'))!,
          'true',
          'Poster choice survives chapter navigation',
        );
        assert.equal(await figure.locator('.diagram-interactive').evaluate((element) => element.childElementCount), 0);
        if (id === 'body-explorer') await page.screenshot({ path: resolve(previews, `poster-choice-${width}.png`) });
        await poster.focus();
        await poster.press('Home');
        await ready(page, id);
        assert.equal(await interactive.evaluate((element) => element === document.activeElement), true);
        assert.equal(await figure.getByRole('tabpanel', { name: 'Interactive', exact: true }).count(), 1);
        assert.equal(
          await figure.getByRole('slider').first().inputValue(),
          value,
          'Switching views retains diagram state',
        );
        assert.equal(await figure.locator('.diagram-static img').isVisible(), false);
        if (id === 'caliper-pressure' && width === 390) {
          await interactive.press('End');
          assert.equal(await poster.getAttribute('aria-selected'), 'true');
          await poster.press('ArrowRight');
          await ready(page, id);
          assert.equal(await interactive.getAttribute('aria-selected'), 'true');
          await interactive.press('Tab');
          assert.equal(
            await figure
              .getByRole('tabpanel', { name: 'Interactive', exact: true })
              .evaluate((element) => element === document.activeElement),
            true,
          );
        }
      }
    } finally {
      await context.close();
    }
  }
});
test('chapter re-entry survives suspending a reserved diagram before its live view remounts', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(preview);
    const figure = await ready(page, 'engine-timing-lift');
    const chapter = await figure.evaluate((element) => element.closest('section.level2')!.id);
    await page.locator('.book-name').click();
    await page.locator('#title').waitFor({ state: 'visible' });
    await figure.locator('.diagram-stage').waitFor({ state: 'detached' });
    await page.evaluate((chapter) => {
      const suspend = (event: Event) => {
        const element = event.target;
        if (!(element instanceof HTMLElement) || element.dataset.diagram !== 'engine-timing-lift') return;
        document.removeEventListener('diagram-prepare', suspend, true);
        // Cancel between activation and the cached module's asynchronous mount.
        queueMicrotask(() => element.dispatchEvent(new Event('diagram-suspend')));
      };
      document.addEventListener('diagram-prepare', suspend, true);
      location.hash = chapter;
    }, chapter);
    await figure.waitFor({ state: 'visible' });
    assert.equal(await figure.getAttribute('data-layout-ready'), 'true');
    await ready(page, 'engine-timing-lift');
    assert.equal(await figure.getByRole('slider').count(), 1);
  } finally {
    await page.close();
  }
});
test('the static poster is available while a car model is still downloading', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requested!: () => void;
  const modelRequested = new Promise<void>((resolve) => {
    requested = resolve;
  });
  try {
    await page.route('**/*.glb', async (route) => {
      requested();
      await gate;
      await route.continue();
    });
    (await page.goto(preview))!;
    const figure = page.locator('[data-diagram="body-explorer"]');
    await figure.evaluate((element) => {
      location.hash = element.closest('section.level2')!.id;
    });
    await figure.waitFor({ state: 'visible' });
    await figure.scrollIntoViewIfNeeded();
    const poster = figure.getByRole('tab', { name: 'Static diagram', exact: true });
    assert.equal(await poster.count(), 1);
    await modelRequested;
    await poster.click();
    await figure.locator('.diagram-static img').waitFor({ state: 'visible' });
    assert.equal((await figure.getAttribute('aria-busy'))!, 'false');
    const response = page.waitForResponse((response) => response.url().endsWith('.glb'));
    release();
    await (await response).finished();
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );
    assert.equal(await figure.locator('canvas').count(), 0, 'A late model download must not replace the chosen poster');
    assert.equal((await poster.getAttribute('aria-selected'))!, 'true');
  } finally {
    release();
    await page.close();
  }
});
test('a slow chapter reload does not flash the cover before the reader hydrates', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  try {
    await page.route('**/reader-*.js', async (route) => {
      await gate;
      await route.continue();
    });
    const id = 'book__13-brakes-and-stability-systems__index.md__brakes-and-stability-systems';
    (await page.goto(preview + '#' + id, { waitUntil: 'commit' }))!;
    await page.locator('#title').waitFor({ state: 'attached' });
    assert.equal(
      await page.locator('#title').isVisible(),
      false,
      'The cover must stay hidden while a chapter is loading',
    );
    await page.screenshot({ path: resolve(previews, 'reader-loading-phone.png') });
    release();
    await page.locator('html.reader-enhanced').waitFor();
    await page.locator(`[id="${id}"]`).waitFor({ state: 'visible' });
    assert.equal(await page.locator('#title').isVisible(), false);
  } finally {
    release();
    await page.close();
  }
});
test('car diagrams reserve their complete panels before models arrive on phones and desktops', async () => {
  const measurements = [];
  for (const width of [390, 1440])
    for (const id of ['brake-explorer', 'fluids-explorer']) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      try {
        await page.route('**/*.glb', async (route) => {
          await gate;
          await route.continue();
        });
        (await page.goto(preview))!;
        await page.locator('html.reader-enhanced').waitFor();
        const figure = page.locator(`[data-diagram="${id}"]`);
        await figure.evaluate((element) => {
          location.hash = element.closest('section.level2')!.id;
        });
        await figure.waitFor({ state: 'visible' });
        await figure.scrollIntoViewIfNeeded();
        await figure.evaluate((element) => scrollTo(0, element.getBoundingClientRect().top + scrollY - 90));
        const before = await figure.evaluate((element) => ({
          height: element.getBoundingClientRect().height,
          next: element.getBoundingClientRect().bottom + scrollY,
        }));
        await page.screenshot({ path: resolve(previews, `${id}-${width}-loading.png`) });
        release();
        await page.waitForFunction(
          (id) => document.querySelector<HTMLElement>(`[data-diagram="${id}"]`)!.classList.contains('diagram-ready'),
          id,
        );
        const after = await figure.evaluate((element) => ({
          height: element.getBoundingClientRect().height,
          next: element.getBoundingClientRect().bottom + scrollY,
        }));
        await page.screenshot({ path: resolve(previews, `${id}-${width}-loaded.png`) });
        assert.ok(
          Math.abs(after.height - before.height) <= 1,
          `Car diagram height changed from ${before.height} to ${after.height}`,
        );
        assert.ok(
          Math.abs(after.next - before.next) <= 1,
          'Loading the car must not move the following reading content',
        );
        measurements.push({ width, id, before, after });
      } finally {
        release();
        await page.close();
      }
    }
  await writeFile(resolve(previews, 'loading-layout.json'), JSON.stringify(measurements, null, 2));
});
test('prerendered images reserve their intrinsic aspect ratio before decoding', async () => {
  const page = await browser.newPage();
  try {
    (await page.goto(preview))!;
    const missing = await page
      .locator('#book img')
      .evaluateAll((elements: HTMLImageElement[]) =>
        elements
          .filter((image) => !image.hasAttribute('width') || !image.hasAttribute('height'))
          .map((image) => image.alt),
      );
    assert.equal(missing.length, 0, `${missing.length} images have no intrinsic reservation; first: ${missing[0]}`);
    // SVGs with only a viewBox can report the browser's 300×150 natural-size
    // default. Their reserved geometry is exercised by the delayed-image test.
    const wrong = await page
      .locator('#book img')
      .evaluateAll((images: HTMLImageElement[]) =>
        images
          .filter(
            (image: HTMLImageElement) =>
              !image.dataset.bookAsset?.endsWith('.svg') &&
              Math.abs(
                Number(image.getAttribute('width')!) * image.naturalHeight -
                  Number(image.getAttribute('height')!) * image.naturalWidth,
              ) > Math.max(image.naturalWidth, image.naturalHeight),
          )
          .map((image) => image.alt),
      );
    assert.deepEqual(wrong, [], 'Reserved aspect ratios must match the actual images');
  } finally {
    await page.close();
  }
});
test('a delayed chapter photograph does not move the text when it decodes', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  try {
    await page.route('**/media/**', async (route) => {
      await gate;
      await route.continue();
    });
    (await page.goto(preview, { waitUntil: 'domcontentloaded' }))!;
    const chapter = page.locator('#book > section.level2').first();
    await chapter.evaluate((element) => {
      location.hash = element.id;
    });
    await chapter.waitFor({ state: 'visible' });
    const images = chapter.locator('figure:not(.diagram-static) img');
    const selected = [images.nth(0), images.nth(1)];
    const before = await Promise.all(selected.map((image) => image.boundingBox()));
    assert.ok(before.every((box) => box && box.height > 0));
    release();
    await Promise.all(selected.map((image) => image.evaluate((image: HTMLImageElement) => image.decode())));
    const after = await Promise.all(selected.map((image) => image.boundingBox()));
    for (let i = 0; i < selected.length; i++) {
      assert.ok(Math.abs(before[i]!.height - after[i]!.height) <= 1);
      assert.ok(Math.abs(before[i]!.y - after[i]!.y) <= 1);
    }
  } finally {
    release();
    await page.close();
  }
});
test('a failed reader script still leaves a readable static book', async () => {
  const page = await browser.newPage();
  try {
    await page.route('**/reader-*.js', (route) => route.abort());
    (await page.goto(preview))!;
    await page.locator('#book > section.level2').first().waitFor({ state: 'visible' });
    assert.equal(await page.locator('#reader-loading').isVisible(), false);
  } finally {
    await page.close();
  }
});
test('headlamp optics remain visible when the shared car begins fading and restore their refractive covers', async () => {
  const bundle = await build({
    entryPoints: [resolve('tests/fixtures/model-fade.ts')],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2022',
  });
  const car = await readFile(resolve('interactive/models/reference-car.glb'));
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  try {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.route('**/fade-car.glb', (route) => route.fulfill({ contentType: 'model/gltf-binary', body: car }));
    await page.route('**/headlamp-fixture', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<main id="stage" data-model="./fade-car.glb" style="width:900px;height:650px"></main><input type="range" aria-label="Opacity" min="0" max="1000" value="1000">',
      }),
    );
    await page.goto(`${preview}headlamp-fixture`);
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const stage = page.locator('#stage');
    const waitForAmount = (amount: string) =>
      page.waitForFunction(
        (amount) => document.querySelector<HTMLElement>('#stage')!.dataset.amount === amount,
        amount,
      );
    const saveFrame = async (name: string) => {
      const data = (await stage.getAttribute('data-image'))!.split(',')[1];
      await writeFile(resolve(previews, `headlamp-fade-${name}.png`), Buffer.from(data, 'base64'));
    };
    await waitForAmount('1');
    const originals = await stage.getAttribute('data-covers');
    const originalBright = JSON.parse((await stage.getAttribute('data-bright'))!) as number[];
    await saveFrame('full');
    await page.getByRole('slider', { name: 'Opacity' }).fill('999');
    await waitForAmount('0.999');
    await saveFrame('start');
    const bright = JSON.parse((await stage.getAttribute('data-bright'))!) as number[];
    bright.forEach((value, i) =>
      assert.ok(
        value < originalBright[i] + 0.08,
        `A 0.1% fade must not wash out the optics: bright headlamp pixels increased from ${(originalBright[i] * 100).toFixed(1)}% to ${(value * 100).toFixed(1)}%`,
      ),
    );
    await page.getByRole('slider', { name: 'Opacity' }).fill('500');
    await waitForAmount('0.5');
    await saveFrame('half');
    await page.getByRole('slider', { name: 'Opacity' }).fill('0');
    await waitForAmount('0');
    await saveFrame('hidden');
    await page.getByRole('slider', { name: 'Opacity' }).fill('1000');
    await waitForAmount('1');
    assert.equal(
      await stage.getAttribute('data-covers'),
      originals,
      'Returning to the whole car restores the original glass',
    );
    const restored = JSON.parse((await stage.getAttribute('data-difference'))!) as number[];
    assert.ok(
      restored.every((difference) => difference < 0.05),
      'Reset restores the original refracted image',
    );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
test('3D camera gestures pan without rotating or zooming and preserve plain orbit and wheel zoom', async () => {
  const bundle = await build({
    entryPoints: [resolve('tests/fixtures/scene-controls.ts')],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2022',
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  try {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setContent('<main id="stage" style="width:800px;height:600px"></main>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.waitForFunction(() => document.querySelector<HTMLElement>('#stage')!.dataset.pose);
    const stage = page.locator('#stage');
    interface Pose {
      position: number[];
      target: number[];
      orientation: number[];
    }
    const pose = async () => JSON.parse((await stage.getAttribute('data-pose'))!) as Pose;
    const delta = (a: number[], b: number[]) => a.map((value, i) => value - b[i]);
    const magnitude = (v: number[]) => Math.hypot(...v);
    const distance = (p: Pose) => magnitude(delta(p.position, p.target));
    const gesture = async (button: 'left' | 'middle', modifier?: 'Meta' | 'Control') => {
      const before = await stage.getAttribute('data-pose');
      await page.mouse.move(400, 300);
      if (modifier) await page.keyboard.down(modifier);
      await page.mouse.down({ button });
      await page.mouse.move(500, 350, { steps: 5 });
      await page.mouse.up({ button });
      if (modifier) await page.keyboard.up(modifier);
      await page.waitForFunction(
        (before) => document.querySelector<HTMLElement>('#stage')!.dataset.pose !== before,
        before,
      );
    };
    for (const modifier of ['Meta', 'Control', undefined] as const) {
      const before = await pose();
      await gesture(modifier ? 'left' : 'middle', modifier);
      const after = await pose();
      const moved = delta(after.target, before.target);
      assert.ok(magnitude(moved) > 0.1, `${modifier ?? 'Middle'} drag must move the orbit target`);
      assert.ok(magnitude(delta(delta(after.position, before.position), moved)) < 1e-8);
      assert.ok(magnitude(delta(after.orientation, before.orientation)) < 1e-8, 'Panning must preserve orientation');
      assert.ok(Math.abs(distance(after) - distance(before)) < 1e-8, 'Panning must preserve zoom');
    }
    const beforeOrbit = await pose();
    await gesture('left');
    const afterOrbit = await pose();
    assert.ok(magnitude(delta(afterOrbit.target, beforeOrbit.target)) < 1e-8, 'Plain drag keeps the orbit target');
    assert.ok(magnitude(delta(afterOrbit.position, beforeOrbit.position)) > 0.1);
    assert.ok(Math.abs(distance(afterOrbit) - distance(beforeOrbit)) < 1e-8);
    const beforeZoom = await stage.getAttribute('data-pose');
    await page.mouse.wheel(0, 240);
    await page.waitForFunction(
      (before) => document.querySelector<HTMLElement>('#stage')!.dataset.pose !== before,
      beforeZoom,
    );
    const afterZoom = await pose();
    assert.ok(distance(afterZoom) > distance(afterOrbit) + 0.1, 'Wheel scrolling still zooms out');
    assert.ok(magnitude(delta(afterZoom.target, afterOrbit.target)) < 1e-8);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
test('3D transitions retarget smoothly, yield to gestures, honour reduced motion and stop rendering when idle or disposed', async () => {
  const bundle = await build({
    entryPoints: [resolve('tests/fixtures/scene-controls.ts')],
    bundle: true,
    write: false,
    format: 'iife',
    target: 'es2022',
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: 'no-preference' });
  try {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
    await page.setContent('<main id="stage" style="width:800px;height:600px"></main>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.waitForFunction(() => document.querySelector<HTMLElement>('#stage')!.dataset.pose);
    await page.clock.pauseAt('2030-01-01T01:00:00Z');
    const stage = page.locator('#stage');
    const pose = () => stage.getAttribute('data-pose');
    const click = (name: string) =>
      page.getByRole('button', { name, exact: true }).evaluate((button) => (button as HTMLButtonElement).click());
    const original = await pose();
    await click('Near');
    assert.equal(await stage.getAttribute('data-transitioning'), 'true');
    assert.equal(await pose(), original, 'The first frame keeps the displayed camera pose');
    await page.clock.runFor(200);
    const middle = await pose();
    assert.notEqual(middle, original);
    const progress = Number(await stage.getAttribute('data-progress'));
    assert.ok(progress > 0 && progress < 1, 'The assembly must also have an intermediate state');
    await click('Far');
    assert.equal(await pose(), middle, 'Retargeting must not snap to the previous destination');
    assert.equal(Number(await stage.getAttribute('data-progress')), progress);
    await page.clock.runFor(700);
    assert.equal(await stage.getAttribute('data-transitioning'), 'false');
    assert.equal(await stage.getAttribute('data-progress'), '0');
    const frames = await stage.getAttribute('data-frames');
    await page.clock.runFor(200);
    assert.equal(await stage.getAttribute('data-frames'), frames, 'An idle viewer must not keep rendering');
    await click('Near');
    await page.clock.runFor(160);
    await page.mouse.move(400, 300);
    await page.mouse.down({ button: 'middle' });
    await page.mouse.move(500, 350, { steps: 3 });
    await page.mouse.up({ button: 'middle' });
    await page.clock.runFor(20);
    const panned = await pose();
    await page.clock.runFor(700);
    assert.equal(await pose(), panned, 'An interrupted transition must not fight manual camera movement');
    assert.equal(await stage.getAttribute('data-progress'), '1', 'Parts still reach their destination');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await click('Far');
    assert.equal(await stage.getAttribute('data-transitioning'), 'false');
    assert.equal(await stage.getAttribute('data-progress'), '0');
    await page.clock.runFor(20);
    const destination = JSON.parse((await pose())!) as { position: number[]; target: number[] };
    destination.position.forEach((value, i) => assert.ok(Math.abs(value - [3, 2, 5][i]) < 1e-8));
    assert.ok(destination.target.every((value) => Math.abs(value) < 1e-8));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await click('Near');
    await page.clock.runFor(100);
    await click('Dispose');
    const disposedFrames = await stage.getAttribute('data-frames');
    await page.clock.runFor(1000);
    assert.equal(await stage.locator('canvas').count(), 0);
    assert.equal(await stage.getAttribute('data-transitioning'), 'false');
    assert.equal(await stage.getAttribute('data-frames'), disposedFrames);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
test.each([
  { width: 390, id: 'brake-explorer' },
  { width: 390, id: 'roof-explorer' },
  { width: 1440, id: 'brake-explorer' },
  { width: 1440, id: 'roof-explorer' },
])('stage and part buttons animate the real brake and component tours ($id, $width px)', async ({ width, id }) => {
  const page = await browser.newPage({ viewport: { width, height: 1100 }, reducedMotion: 'no-preference' });
  try {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
    await page.goto(preview);
    const figure = await ready(page, id);
    await page.clock.pauseAt('2030-01-01T01:00:00Z');
    const stage = figure.locator('.diagram-stage');
    await figure.locator('canvas').evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      const request = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (callback) =>
        request((now) => {
          callback(now);
          canvas.dataset.frameImage = canvas.toDataURL();
        });
    });
    const imageHash = async () =>
      createHash('sha256')
        .update((await figure.locator('canvas').getAttribute('data-frame-image'))!)
        .digest('hex');
    const click = (name: string) =>
      figure.getByRole('button', { name, exact: true }).evaluate((button) => (button as HTMLButtonElement).click());
    const scrub = async (value: string) => {
      await figure.getByRole('slider', { name: 'Explore the assembly' }).evaluate((input, value) => {
        (input as HTMLInputElement).value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }, value);
      await page.clock.fastForward(20);
    };
    // Capture each image after a controlled draw, before the browser clears
    // the non-preserved WebGL back buffer for compositing.
    await scrub('0');
    const original = await imageHash();
    await click('Exploded');
    assert.equal(await stage.getAttribute('data-transitioning'), 'true');
    // Sample the required frames rather than PNG-encoding every intervening
    // software-rendered frame on the Ubuntu runner.
    await page.clock.fastForward(250);
    const halfway = await imageHash();
    assert.notEqual(halfway, original, `${id} at ${width}px must show an intermediate view`);
    await page.clock.fastForward(450);
    const exploded = await imageHash();
    assert.notEqual(exploded, halfway, `${id} at ${width}px must continue to the final view`);
    assert.equal(await stage.getAttribute('data-transitioning'), 'false');
    const part =
      id === 'brake-explorer'
        ? figure.getByRole('button', { name: 'Caliper body', exact: true })
        : figure.locator('button[data-part]').last();
    await part.evaluate((button) => (button as HTMLButtonElement).click());
    assert.equal(await stage.getAttribute('data-transitioning'), 'true');
    await page.clock.fastForward(250);
    const focusHalfway = await imageHash();
    await page.clock.fastForward(450);
    assert.notEqual(await imageHash(), focusHalfway, 'A component selection must animate its camera zoom');
    assert.equal(await stage.getAttribute('data-transitioning'), 'false');
    await click('Whole car');
    await page.clock.fastForward(100);
    await scrub('40');
    assert.equal(await stage.getAttribute('data-transitioning'), 'false', 'Direct slider input is immediate');
    const scrubbed = await imageHash();
    await page.clock.fastForward(700);
    assert.equal(await imageHash(), scrubbed, 'A cancelled transition must not override slider input');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await click('Reset view');
    assert.equal(await stage.getAttribute('data-transitioning'), 'false');
    assert.equal(await figure.getByRole('slider').inputValue(), '0');
    await page.clock.fastForward(20);
    assert.equal(await imageHash(), original, `${id} at ${width}px: reduced-motion reset restores the first frame`);
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
test('car tours can pan and Reset view restores their original framing', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
  try {
    await page.goto(preview);
    for (const id of ['brake-explorer', 'roof-explorer']) {
      const figure = await ready(page, id);
      const canvas = figure.locator('canvas');
      assert.match((await canvas.getAttribute('aria-label'))!, /Cmd\/Ctrl/);
      const imageHash = async () =>
        createHash('sha256')
          .update(await canvas.screenshot())
          .digest('hex');
      const original = await imageHash();
      const bounds = (await canvas.boundingBox())!;
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await page.mouse.down({ button: 'middle' });
      await page.mouse.move(bounds.x + bounds.width / 2 + 80, bounds.y + bounds.height / 2 + 30, { steps: 5 });
      await page.mouse.up({ button: 'middle' });
      assert.notEqual(await imageHash(), original, `${id} must render the panned view`);
      await figure.getByRole('button', { name: 'Reset view', exact: true }).click();
      assert.equal(await imageHash(), original, `${id} must restore its authored view after panning`);
    }
  } finally {
    await page.close();
  }
});
test('keyboard and part controls survive leaving the page section', async () => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  try {
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    (await page.goto(preview))!;
    const figure = await ready(page, 'brake-explorer');
    assert.equal(await figure.locator('canvas').count(), 1);
    await figure.screenshot({ path: resolve(previews, 'whole-car.png') });
    const slider = figure.getByRole('slider', { name: 'Explore the assembly' });
    await slider.focus();
    await slider.press('Home');
    await slider.press('ArrowRight');
    assert.equal(await slider.inputValue(), '1');
    await slider.press('End');
    assert.equal((await figure.locator('.diagram-interactive').getAttribute('data-exploded'))!, '1.000');
    await figure.screenshot({ path: resolve(previews, 'exploded-brake.png') });
    await figure.getByRole('button', { name: 'Caliper body', exact: true }).click();
    assert.match((await figure.locator('.diagram-explanation').textContent())!, /stays in one piece/);
    await figure.locator('.diagram-stage[data-transitioning="false"]').waitFor();
    await figure.screenshot({ path: resolve(previews, 'caliper-detail.png') });
    const occupiedHeight = await figure.evaluate((element) => element.clientHeight);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await figure.locator('canvas').waitFor({ state: 'detached' });
    assert.equal(
      await figure.evaluate((element) => element.clientHeight),
      occupiedHeight,
      'Releasing a diagram must preserve the surrounding reading layout',
    );
    await page.emulateMedia({ media: 'print' });
    assert.ok(
      await figure.locator('.diagram-static img').isVisible(),
      'A released view must retain its printable fallback',
    );
    await page.emulateMedia({ media: 'screen' });
    await ready(page, 'brake-explorer');
    assert.equal(await figure.getByRole('slider').inputValue(), '100');
    assert.equal(
      (await figure.getByRole('button', { name: 'Caliper body', exact: true }).getAttribute('aria-pressed'))!,
      'true',
    );
    await figure.getByRole('button', { name: 'Reset view', exact: true }).click();
    assert.equal(await figure.getByRole('slider').inputValue(), '0');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
test('D3 diagrams explain pressure and the fourfold energy increase at twice the speed', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  try {
    (await page.goto(preview))!;
    const caliper = await ready(page, 'caliper-pressure');
    await caliper.getByRole('slider', { name: 'Relative hydraulic pressure' }).fill('100');
    assert.equal(Number((await caliper.locator('.diagram-interactive').getAttribute('data-relative-pressure'))!), 1);
    assert.match((await caliper.locator('.diagram-explanation').textContent())!, /100%/);
    await caliper.screenshot({ path: resolve(previews, 'hydraulic-pressure.png') });
    const energy = await ready(page, 'braking-energy');
    const value = () => energy.locator('.diagram-interactive').getAttribute('data-energy-kj')!.then(Number);
    const reference = await value();
    await energy.getByRole('slider', { name: 'Speed', exact: true }).fill('200');
    assert.equal(await value(), reference * 4);
    assert.match((await energy.locator('.diagram-explanation').textContent())!, /4.00 times/);
    await energy.getByRole('slider', { name: 'Illustrative total mass' }).fill('1000');
    assert.ok(Math.abs((await value()) - 1543.20987654) < 1e-6);
    const massCurve = energy.locator('path[data-energy-curve="selected"]');
    const referenceCurve = energy.locator('path[data-energy-curve="reference"]');
    const curveBefore = (await massCurve.getAttribute('d'))!;
    const fixedReference = (await referenceCurve.getAttribute('d'))!;
    const ticks = () =>
      energy.locator('[data-energy-axis="energy"] .tick').evaluateAll((elements) =>
        elements.map((element) => ({
          text: element.textContent,
          position: element.getAttribute('transform')!,
        })),
      );
    const fixedScale = await ticks();
    const lowerMassEnergy = await value();
    await energy.getByRole('slider', { name: 'Illustrative total mass' }).fill('1800');
    assert.ok(Math.abs((await value()) / lowerMassEnergy - 1.8) < 1e-10);
    assert.notEqual((await massCurve.getAttribute('d'))!, curveBefore, 'Mass must visibly move the curve');
    assert.equal((await referenceCurve.getAttribute('d'))!, fixedReference);
    assert.deepEqual(await ticks(), fixedScale, 'Changing mass must not disguise the change by rescaling the axis');
    await energy.screenshot({ path: resolve(previews, 'kinetic-energy.png') });
    await page.emulateMedia({ media: 'print' });
    assert.equal(await energy.locator('.diagram-interactive').isVisible(), false);
    assert.equal(await energy.locator('.diagram-static img').isVisible(), true);
  } finally {
    await page.close();
  }
});
test('preview edition loads models on approach and reads correctly at a phone width', async () => {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  try {
    const models = [],
      errors: string[] = [];
    page.on('request', (request: { url: () => string }) => {
      if (request.url().endsWith('.glb')) models.push(request.url());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    (await page.goto(preview))!;
    await page.waitForLoadState('networkidle');
    assert.equal(models.length, 0, 'Models should not load at the start of the book');
    const figure = await ready(page, 'brake-explorer');
    assert.equal(models.length, 2);
    await figure.getByRole('button', { name: 'Exploded', exact: true }).click();
    await figure.screenshot({
      path: resolve(previews, 'mobile-exploded.png'),
      style: '.viewer-bar { visibility: hidden; }',
    });
    for (const id of ['brake-explorer', 'caliper-pressure', 'braking-energy']) {
      const current = await ready(page, id);
      assert.ok(await current.getByRole('slider').first().isVisible());
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${id} overflows horizontally`,
      );
    }
    await page.screenshot({ path: resolve(previews, 'mobile-energy.png') });
    await ready(page, 'brake-explorer');
    assert.equal(models.length, 2, 'Recently used models should be reused after leaving the viewport');
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
test('static diagrams remain readable without JavaScript or WebGL', async () => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    (await page.goto(preview))!;
    for (const figure of await page.locator('[data-diagram]').all()) {
      assert.equal(await figure.locator('img').isVisible(), true);
      assert.ok(
        await figure
          .locator('img')
          .evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0),
      );
      assert.equal(await figure.locator('canvas').count(), 0);
      assert.equal(await figure.locator('.diagram-view-controls').count(), 0);
    }
  } finally {
    await context.close();
  }
  const page = await browser.newPage();
  try {
    await page.addInitScript(() => {
      // Preserve each native overload; only WebGL is unavailable in this fixture.
      const original = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'getContext')!
        .value as HTMLCanvasElement['getContext'];
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, options?: object) {
        // Invoke the native method with this canvas, not the prototype.
        return /webgl/.test(kind) ? null : Reflect.apply(original, this, [kind, options]);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    (await page.goto(preview))!;
    const figure = page.locator('[data-diagram="brake-explorer"]');
    await page.locator('html.reader-enhanced').waitFor();
    await figure.evaluate((element) => {
      location.hash = element.closest('section.level2')!.id;
    });
    await figure.waitFor({ state: 'visible' });
    await figure.scrollIntoViewIfNeeded();
    await figure.locator('.diagram-notice').waitFor();
    assert.equal(await figure.locator('.diagram-static img').isVisible(), true);
    assert.equal(await figure.getByRole('button', { name: 'Try again' }).count(), 1);
    assert.equal(await figure.locator('canvas').count(), 0);
  } finally {
    await page.close();
  }
});
test('the prerendered book preserves the manuscript, tables, figures and published note links at both URL mounts', async () => {
  const baseline = JSON.parse(await readFile(resolve('tests/fixtures/manuscript-baseline.json'), 'utf8'));
  const normal = (value: string) =>
    value
      .normalize('NFKC')
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[^\p{L}\p{N}]/gu, '');
  const hash = (value: string) => createHash('sha256').update(normal(value)).digest('hex');
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const edition of [preview, site]) {
      (await page.goto(edition))!;
      await page
        .locator('#book img')
        .evaluateAll((images: HTMLImageElement[]) => Promise.all(images.map((image) => image.decode())));
      const actual = await page.evaluate(() => {
        const clean = (element: Element) => {
          const clone = element.cloneNode(true) as HTMLElement;
          clone
            .querySelectorAll<HTMLElement>('.footnote-ref,.footnote-back,.chapter-notes')
            .forEach((node) => node.remove());
          return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
        };
        return [...document.querySelectorAll<HTMLElement>('#book > section.level2')].map((chapter) => ({
          id: chapter.id,
          text: clean(chapter),
          headings: [...chapter.querySelectorAll<HTMLElement>('section[id]')].map((node) => node.id),
          tables: [...chapter.querySelectorAll<HTMLElement>('table')].map(clean),
          figures: [...chapter.querySelectorAll<HTMLElement>('figure')].map((node) => ({
            alt: node.querySelector<HTMLImageElement>('img')!.alt,
            caption: clean(node.querySelector<HTMLElement>('figcaption')!),
          })),
          notes: [...chapter.querySelectorAll<HTMLAnchorElement>('.footnote-ref')].map((reference) => ({
            id: reference.hash.slice(1),
            reference: reference.id,
            text: clean(document.getElementById(reference.hash.slice(1))!),
          })),
        }));
      });
      assert.equal(actual.length, baseline.chapters.length);
      for (let i = 0; i < actual.length; i++) {
        const after = actual[i],
          before = baseline.chapters[i],
          label = `${edition}: ${before.title}`;
        assert.equal(after.id, before.id, label);
        assert.equal(hash(after.text), before.textHash, `${label}: prose and captions`);
        assert.deepEqual(
          after.headings,
          before.headings.map((h: { id: string }) => h.id),
          `${label}: legacy section IDs`,
        );
        assert.deepEqual(after.tables.map(hash), before.tables, `${label}: table cells`);
        assert.deepEqual(
          after.figures.map((f) => [normal(f.alt), hash(f.caption)]),
          before.figures.map((f: { alt: string; captionHash: string }) => [normal(f.alt), f.captionHash]),
          `${label}: captions and descriptive alternatives`,
        );
        assert.deepEqual(
          after.notes.map((n) => ({ id: n.id, reference: n.reference, textHash: hash(n.text) })),
          before.notes,
          `${label}: repeated notes and backlinks`,
        );
      }
    }
  } finally {
    await context.close();
  }
});
test('the book hydrates without warnings, missing assets or premature model downloads at both URL mounts', async () => {
  for (const edition of [preview, site]) {
    const page = await browser.newPage(),
      errors: string[] = [],
      models: string[] = [];
    try {
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error' || /hydration|did not match/i.test(message.text())) errors.push(message.text());
      });
      page.on('response', (response) => {
        if (response.status() >= 400 && !response.url().endsWith('/favicon.ico'))
          errors.push(`${response.status()} ${response.url()}`);
      });
      page.on('request', (request) => {
        if (request.url().endsWith('.glb')) models.push(request.url());
      });
      (await page.goto(edition))!;
      await page.locator('html.reader-enhanced').waitFor();
      await page.waitForLoadState('networkidle');
      assert.deepEqual(models, []);
      const notices = await page
        .locator('#third-party-notices')
        .evaluate((element: HTMLTemplateElement) => element.content.textContent!);
      assert.match(notices, /react-dom 19\./);
      assert.match(notices, /react 19\./);
      assert.match(notices, /SIL OPEN FONT LICENSE/);
      await page
        .getByRole('navigation', { name: 'Written chapters' })
        .getByRole('link', { name: 'Brakes and stability systems', exact: true })
        .click();
      await page.getByRole('heading', { level: 1, name: 'Brakes and stability systems', exact: true }).waitFor();
      assert.deepEqual(errors, [], edition);
    } finally {
      await page.close();
    }
  }
});
test.each(
  [
    { mount: 'local', width: 390 },
    { mount: 'project-prefixed', width: 1440 },
  ].flatMap((edition) => [1, 2].map((batch) => ({ ...edition, batch }))),
)(
  'every diagram and model loads at local and project-prefixed URLs ($mount, batch $batch)',
  async ({ mount, width, batch }) => {
    const edition = mount === 'local' ? preview : site;
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' }),
      errors: string[] = [];
    try {
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('response', (response) => {
        if (response.status() >= 400 && !response.url().endsWith('/favicon.ico'))
          errors.push(`${response.status()} ${response.url()}`);
      });
      (await page.goto(edition))!;
      const names = await page
        .locator('[data-diagram]')
        .evaluateAll((figures: HTMLElement[]) => figures.map((figure) => figure.dataset.diagram));
      const batchSize = Math.ceil(names.length / 2);
      assert.ok(names.length >= 24, 'Both URL mounts must retain the full diagram inventory');
      for (const name of names.slice((batch - 1) * batchSize, batch * batchSize)) {
        assert.ok(name, 'Every interactive figure has a diagram ID');
        const figure = await ready(page, name);
        assert.ok(await figure.locator('.diagram-explanation').innerText(), name);
        assert.equal(await figure.locator('.diagram-notice').count(), 0, name);
      }
      assert.deepEqual(errors, [], edition);
    } finally {
      await page.close();
    }
  },
);
test.each([390, 1024, 1440])(
  'chapter menus scroll smoothly after layout, respect reduced motion and retain history (%i px)',
  async (width) => {
    const chapter = 'book__13-brakes-and-stability-systems__index.md__brakes-and-stability-systems';
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
      try {
        await page.goto(site + '#' + chapter);
        await page.locator('html.reader-enhanced').waitFor();
        await page.waitForFunction(() => !document.documentElement.hasAttribute('data-reader-pending'));
        const openMenu = async () => {
          if (width === 390) {
            await page.getByRole('button', { name: 'Contents', exact: true }).click();
            return page.getByRole('dialog', { name: 'Contents', exact: true });
          }
          return page.locator(width === 1440 ? '.chapter-outline' : '.book-sidebar');
        };
        const link = (await openMenu()).getByRole('link', { name: 'ABS and PSM', exact: true });
        const fragment = (await link.getAttribute('href'))!;
        const start = await page.evaluate(() => {
          window.__menuScroll = [scrollY];
          addEventListener('scroll', () => window.__menuScroll!.push(scrollY));
          return scrollY;
        });
        if (width === 1440) {
          await link.focus();
          await link.press('Enter');
        } else await link.click();
        await page.waitForURL((url) => url.hash === fragment);
        await page.waitForFunction((id) => {
          const target = document.getElementById(id)!;
          return (
            Math.abs(
              target.getBoundingClientRect().top -
                parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
            ) < 2
          );
        }, fragment.slice(1));
        const { end, samples, focused } = await page.evaluate(() => ({
          end: scrollY,
          samples: window.__menuScroll!,
          focused: document.activeElement?.id,
        }));
        assert.equal(focused, fragment.slice(1));
        assert.ok(Math.abs(end - start) > 500, 'The destination must require a substantial page scroll');
        const intermediate = samples.filter((y) => y > Math.min(start, end) + 2 && y < Math.max(start, end) - 2);
        if (reducedMotion === 'reduce')
          assert.equal(intermediate.length, 0, 'Reduced motion jumps directly to the destination');
        else assert.ok(intermediate.length > 1, 'Menu navigation must visibly traverse intermediate scroll positions');
        assert.equal(await page.locator('dialog[open]').count(), 0);

        await page.goBack();
        await page.waitForURL((url) => url.hash === '#' + chapter);
        await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
        await page.waitForFunction(() => scrollY < 100);

        await page.evaluate(() => scrollTo(0, 800));
        if (width === 390) await page.getByRole('button', { name: 'Contents', exact: true }).click();
        const contents = width === 390 ? page.locator('.contents-dialog') : page.locator('.book-sidebar');
        await contents.getByRole('link', { name: 'Steering, wheels and tyres', exact: true }).click();
        await page.getByRole('heading', { level: 1, name: 'Steering, wheels and tyres', exact: true }).waitFor();
        await page.waitForFunction(
          () => !document.documentElement.hasAttribute('data-reader-pending') && scrollY < 100,
        );
        assert.equal(await page.locator('dialog[open]').count(), 0);
        assert.equal(
          (await page.locator('.book-sidebar [aria-current="page"]').textContent())?.trim(),
          'Steering, wheels and tyres',
        );
      } finally {
        await page.close();
      }
    }
  },
);
test('reader navigation, sources and browser history preserve chapter context', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  try {
    (await page.goto(site))!;
    await page.locator('html.reader-enhanced').waitFor();
    assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), 'Porsche Boxster 2.9');
    await page
      .getByRole('navigation', { name: 'Written chapters' })
      .getByRole('link', { name: 'Brakes and stability systems', exact: true })
      .click();
    const chapter = page.locator('#book > section.level2:not([hidden])');
    await chapter.locator('h1').waitFor({ state: 'visible' });
    assert.match(await chapter.locator('h1').innerText(), /Brakes and stability/);
    await page.waitForFunction(() => document.activeElement?.tagName === 'H1');
    await page.getByRole('link', { name: 'Skip to reading' }).focus();
    await page.getByRole('link', { name: 'Skip to reading' }).press('Enter');
    await page.waitForURL(/#book$/);
    assert.match(await chapter.locator('h1').innerText(), /Brakes and stability/);
    assert.equal(await page.locator('.book-sidebar [aria-current="page"]').count(), 1);
    assert.ok(await page.getByRole('navigation', { name: 'Chapter sections' }).isVisible());
    const notes = chapter.locator('details.chapter-notes');
    assert.equal(await notes.evaluate((element: HTMLDetailsElement) => element.open), false);
    await page
      .getByRole('navigation', { name: 'Chapter sections' })
      .getByRole('link', { name: 'Notes and sources', exact: true })
      .click();
    await page.waitForFunction(
      () => document.querySelector<HTMLDetailsElement>('#book > .level2:not([hidden]) .chapter-notes')?.open,
    );
    await notes.locator('summary').click();
    assert.equal(await notes.evaluate((element: HTMLDetailsElement) => element.open), false);
    const firstNote = chapter.locator('.footnote-ref').first();
    const noteId = (await firstNote.getAttribute('href'))!.slice(1);
    const referenceId = (await firstNote.getAttribute('id'))!;
    await firstNote.click();
    assert.equal(new URL(page.url()).hash, `#${noteId}`);
    assert.ok(await chapter.locator(`[id="${noteId}"]`).isVisible());
    await chapter.locator(`[id="${noteId}"] .footnote-back`).first().click();
    assert.equal(new URL(page.url()).hash, `#${referenceId}`);
    await page.getByRole('navigation', { name: 'Adjacent chapters' }).getByRole('link').first().click();
    await page.waitForFunction(() =>
      document
        .querySelector<HTMLElement>('#book > .level2:not([hidden]) .chapter-meta')
        ?.textContent?.includes('Chapter 12 '),
    );
    await chapter.locator('.chapter-meta').waitFor({ state: 'visible' });
    assert.match(
      await chapter.locator('.chapter-meta').innerText(),
      new RegExp(`Chapter 12 of ${chapterCount} · \\d+ min read`),
    );
    assert.doesNotMatch(await chapter.innerText(), /This chapter is planned/);
    await page.goBack();
    await page.waitForFunction(
      (id: string) => !document.getElementById(id)!.closest<HTMLElement>('.level2')!.hidden,
      referenceId,
    );
    await page.locator('h1:visible').waitFor();
    assert.equal(await page.locator('h1:visible').count(), 1);
    (await page.goto(site + `#${noteId}`))!;
    await page.locator(`[id="${noteId}"]`).waitFor({ state: 'visible' });
    assert.match(await page.title(), /Brakes and stability/);
    await page.emulateMedia({ media: 'print' });
    for (const section of await page.locator('#book > section.level2').all()) assert.ok(await section.isVisible());
  } finally {
    await page.close();
  }
});
test('chapter sources start collapsed, toggle by keyboard and expand for printing without losing their state', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(preview))!;
    await page.locator('html.reader-enhanced').waitFor();
    assert.equal(await page.locator('details.chapter-notes').count(), chapterCount);
    assert.equal(await page.locator('details.chapter-notes[open]').count(), 0);
    await page
      .getByRole('navigation', { name: 'Written chapters' })
      .getByRole('link', { name: 'Brakes and stability systems', exact: true })
      .click();
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
    await page.waitForFunction(
      (expected) => document.querySelectorAll<HTMLDetailsElement>('details.chapter-notes[open]').length === expected,
      chapterCount,
    );
    for (const list of await page.locator('.chapter-notes ol').all()) assert.ok(await list.isVisible());
    await page.emulateMedia({ media: 'screen' });
    await page.waitForFunction(
      () => document.querySelectorAll<HTMLDetailsElement>('details.chapter-notes[open]').length === 0,
    );
    await page.locator('#book > .level2:not([hidden]) .footnote-ref').first().click();
    await notes.locator('ol').waitFor({ state: 'visible' });
    await page.emulateMedia({ media: 'print' });
    await page.waitForFunction(
      (expected) => document.querySelectorAll<HTMLDetailsElement>('details.chapter-notes[open]').length === expected,
      chapterCount,
    );
    await page.emulateMedia({ media: 'screen' });
    await page.waitForFunction(
      () => document.querySelectorAll<HTMLDetailsElement>('details.chapter-notes[open]').length === 1,
    );
    assert.ok(
      await notes.evaluate((element: HTMLDetailsElement) => element.open),
      'Printing must retain a section the reader had opened',
    );
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally {
    await page.close();
  }
});
test('Print whole book prepares every image from the cover and phone contents', async () => {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    try {
      await page.addInitScript(() => {
        window.print = () => {
          dispatchEvent(new Event('beforeprint'));
          window.__bookPrint = {
            title: document.title,
            notes: document.querySelectorAll<HTMLDetailsElement>('details.chapter-notes[open]').length,
            images: [...document.querySelectorAll<HTMLImageElement>('#book img')].every(
              (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
            ),
            dialog: !!document.querySelector<HTMLElement>('dialog[open]')!,
          };
          dispatchEvent(new Event('afterprint'));
        };
      });
      await page.goto(
        site +
          (width < 1000 ? '#book__13-brakes-and-stability-systems__index.md__brakes-and-stability-systems' : '#title'),
      );
      await page
        .getByRole('heading', {
          level: 1,
          name: width < 1000 ? 'Brakes and stability systems' : 'Porsche Boxster 2.9',
          exact: true,
        })
        .waitFor();
      assert.equal(await page.locator('.viewer-bar').getByRole('button', { name: 'Print whole book' }).count(), 0);
      const title = await page.title(),
        hash = new URL(page.url()).hash;
      if (width < 1000) await page.getByRole('button', { name: 'Contents', exact: true }).click();
      await page.getByRole('button', { name: 'Print whole book', exact: true }).filter({ visible: true }).click();
      await page.waitForFunction(() => window.__bookPrint);
      const printed = await page.evaluate(() => window.__bookPrint!);
      assert.equal(printed.title, 'Porsche Boxster 2.9 — Complete book');
      assert.equal(printed.notes, chapterCount);
      assert.equal(printed.images, true);
      assert.equal(printed.dialog, false);
      assert.equal(await page.title(), title);
      assert.equal(new URL(page.url()).hash, hash);
      assert.equal(await page.locator('details.chapter-notes[open]').count(), 0);
    } finally {
      await page.close();
    }
  }
});
test('browser PDF export includes the cover, contents, every chapter, sources and static diagrams', async () => {
  const measurements = [];
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({
      javaScriptEnabled,
      viewport: { width: 794, height: 1123 },
    });
    try {
      const page = await context.newPage();
      (await page.goto(site + '#book__13-brakes-and-stability-systems__index.md__brakes-and-stability-systems'))!;
      if (javaScriptEnabled)
        await page.getByRole('heading', { level: 1, name: 'Brakes and stability systems', exact: true }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page
        .locator('#book img')
        .evaluateAll((images: HTMLImageElement[]) =>
          Promise.all(images.map((image: HTMLImageElement) => image.decode())),
        );
      const before = javaScriptEnabled
        ? await page
            .locator('details.chapter-notes, details.technical-detail')
            .evaluateAll((nodes: HTMLDetailsElement[]) => nodes.map((node: HTMLDetailsElement) => node.open))
        : [];
      await page.emulateMedia({ media: 'print' });
      assert.equal(await page.locator('#title').isVisible(), true);
      assert.equal(await page.locator('.available-chapters').isVisible(), true);
      for (const chapter of await page.locator('#book > section.level2').all())
        assert.equal(await chapter.isVisible(), true);
      for (const notes of await page.locator('.chapter-notes ol, .technical-detail > :not(summary)').all())
        assert.equal(await notes.isVisible(), true);
      for (const image of await page.locator('.diagram-static img').all()) assert.equal(await image.isVisible(), true);
      assert.equal(await page.locator('.viewer-bar').isVisible(), false);
      assert.equal(await page.locator('.diagram-view-controls:visible').count(), 0);
      const clipped = await page.locator('#book table').evaluateAll((tables) =>
        tables
          .filter((table) => {
            const bounds = table.getBoundingClientRect(),
              book = document.getElementById('book')!.getBoundingClientRect();
            return bounds.right > book.right + 1 || bounds.left < book.left - 1;
          })
          .map((table) => table.textContent.slice(0, 100)),
      );
      assert.deepEqual(clipped, [], 'Printed tables must fit the page width');
      const path = resolve(previews, javaScriptEnabled ? 'whole-book.pdf' : 'whole-book-no-js.pdf');
      const pdf = await page.pdf({
        path,
        preferCSSPageSize: true,
        printBackground: true,
        tagged: true,
        outline: true,
      });
      const bytes = pdf.toString('latin1'),
        pages = (bytes.match(/\/Type\s*\/Page\b/g) || []).length;
      assert.ok(pages > chapterCount, `The full book needs more than ${chapterCount} printed pages; got ${pages}`);
      assert.match(bytes, /\/Outlines\b/);
      assert.match(bytes, /\/StructTreeRoot\b/);
      measurements.push({ javaScriptEnabled, pages, chapters: chapterCount, path });
      await page.emulateMedia({ media: 'screen' });
      if (javaScriptEnabled) {
        assert.deepEqual(
          await page
            .locator('details.chapter-notes, details.technical-detail')
            .evaluateAll((nodes: HTMLDetailsElement[]) => nodes.map((node: HTMLDetailsElement) => node.open)),
          before,
        );
        assert.equal(await page.locator('#book > section.level2:visible').count(), 1);
      }
    } finally {
      await context.close();
    }
  }
  await writeFile(resolve(previews, 'whole-book-print.json'), JSON.stringify(measurements, null, 2));
});
test('phone contents traps focus, closes with Escape and opens the chosen chapter', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(site))!;
    await page.getByRole('button', { name: 'Contents', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Contents', exact: true });
    assert.ok(await dialog.isVisible());
    for (let index = 0; index < 21; index++) {
      await page.keyboard.press('Tab');
      // Native dialogs may send Tab to browser chrome (reported as body).
      // Background page controls must remain inert while the modal is open.
      assert.ok(
        await dialog.evaluate(
          (element) => document.activeElement === document.body || element.contains(document.activeElement),
        ),
        'Background controls must not receive focus while contents is open',
      );
    }
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.ok(
      await page
        .getByRole('button', { name: 'Contents', exact: true })
        .evaluate((element: Element | null) => element === document.activeElement),
    );
    await page.getByRole('button', { name: 'Contents', exact: true }).click();
    await dialog.getByRole('link', { name: 'Brakes and stability systems', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('heading', { level: 1, name: 'Brakes and stability systems' }).waitFor();
    assert.equal(await page.locator('.book-sidebar nav').count(), 1);
  } finally {
    await page.close();
  }
});
test('chapters number their own notes, list their sections in the contents and offer a way back in', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(preview))!;
    await page.locator('html.reader-enhanced').waitFor();
    assert.equal(await page.locator('[data-continue-reading]').isVisible(), false);
    await page
      .getByRole('navigation', { name: 'Written chapters' })
      .getByRole('link', { name: 'Brakes and stability systems', exact: true })
      .click();
    const chapter = page.locator('#book > .level2:not([hidden])');
    await chapter.locator('h1').waitFor({ state: 'visible' });
    assert.equal(await chapter.locator('.footnote-ref').first().innerText(), '1');
    assert.equal(
      await chapter
        .locator('.chapter-notes ol > li')
        .first()
        .evaluate((element: HTMLInputElement) => element.value),
      1,
    );
    assert.match(await chapter.locator('.notes-count').innerText(), /^\d+ notes$/);
    await page.getByRole('button', { name: 'Contents', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Contents', exact: true });
    const sections = dialog.locator('.chapter-sections a');
    assert.equal(await sections.count(), await chapter.locator(':scope > .level3, :scope > .chapter-notes').count());
    await dialog.getByRole('link', { name: 'ABS and PSM', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.waitForFunction(
      () =>
        document.querySelector<HTMLElement>('.chapter-sections [aria-current="location"]')?.textContent ===
        'ABS and PSM',
    );
    assert.ok(
      await page
        .locator('.reading-bar span')
        .evaluate((element: Element) => new DOMMatrix(getComputedStyle(element).transform).a > 0),
    );
    await page.locator('.book-name').click();
    const resume = page.locator('[data-continue-reading]');
    await resume.waitFor();
    assert.match(await resume.innerText(), /Chapter 13: Brakes and stability systems/);
    await resume.click();
    await page.getByRole('heading', { name: 'ABS and PSM', exact: true }).waitFor();
    await page.setViewportSize({ width: 1024, height: 768 });
    assert.ok(await page.locator('.book-sidebar').isVisible(), 'A landscape tablet keeps the contents beside the page');
    assert.equal(await page.getByRole('button', { name: 'Contents', exact: true }).isVisible(), false);
  } finally {
    await page.close();
  }
});
test('cover and chapter reflow from a small phone to a wide desktop, with bundled fonts', async () => {
  const context = await browser.newContext({});
  try {
    await context.addInitScript(() => {
      try {
        // Old reader preferences must not override the responsive typography.
        localStorage.setItem('boxster-reading-size', '24');
      } catch {}
    });
    const page = await context.newPage();
    for (const width of [320, 390, 600, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      (await page.goto(preview))!;
      await page.locator('html.reader-enhanced').waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.getByRole('button', { name: /(?:Increase|Decrease) text size/ }).count(), 0);
      assert.equal(
        await page.locator('body').evaluate((element: Element) => parseFloat(getComputedStyle(element).fontSize)),
        width <= 600 ? 16 : 18,
        'Legacy text-size preferences must not override the responsive reading size',
      );
      assert.ok(
        await page.evaluate(
          () => document.fonts.check('20px "Source Serif 4"') && document.fonts.check('16px "Source Sans 3"'),
        ),
        'Reading fonts must be bundled with the book',
      );
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Cover overflows at ${width}px`,
      );
      await page
        .getByRole('navigation', { name: 'Written chapters' })
        .getByRole('link', { name: 'Brakes and stability systems', exact: true })
        .click();
      await page.locator('#book > section.level2:not([hidden])').waitFor();
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Chapter overflows at ${width}px`,
      );
      if (width === 320 || width === 768) {
        for (const name of ['brake-explorer', 'caliper-pressure', 'braking-energy']) {
          await ready(page, name);
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            `Interactive ${name} overflows at ${width}px`,
          );
        }
      }
    }
  } finally {
    await context.close();
  }
});
test('Pages index loads interactive code and models under the project URL', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  try {
    const errors: string[] = [],
      assets: {
        url: string;
        status: number;
      }[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (/\.(js|glb)$/.test(new URL(response.url()).pathname)) {
        assets.push({ url: response.url(), status: response.status() });
      }
    });
    const response = (await page.goto(site))!;
    assert.equal(response.status(), 200);
    assert.equal(await page.title(), 'Porsche Boxster 2.9');
    const car = await ready(page, 'brake-explorer');
    await car.getByRole('button', { name: 'Exploded', exact: true }).click();
    assert.equal(await car.getByRole('slider').inputValue(), '100');
    const energy = await ready(page, 'braking-energy');
    await energy.getByRole('slider', { name: 'Speed', exact: true }).fill('200');
    assert.match((await energy.locator('.diagram-explanation').textContent())!, /4.00 times/);
    assert.equal(assets.filter((asset) => asset.url.endsWith('.glb')).length, 2);
    assert.ok(
      assets.every((asset) => asset.status === 200 && asset.url.startsWith(`${site}index-assets/`)),
      JSON.stringify(assets),
    );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }
});
test.each(Array.from({ length: Math.ceil(chapterCount / 4) }, (_, index) => index + 1))(
  'every chapter and the reference appendix have locally served illustrations and local source links (batch %i)',
  async (batch) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    try {
      const page = await context.newPage();
      (await page.goto(preview))!;
      const written = page.getByRole('navigation', { name: 'Written chapters' });
      await written.waitFor();
      assert.equal(await written.getByRole('link').count(), chapterCount);
      const titles = await written.getByRole('link').allTextContents();
      assert.match(
        await page.locator('[data-draft-status]').innerText(),
        new RegExp(`All ${chapterCount} chapters drafted`),
      );
      await page.getByRole('link', { name: 'Start reading', exact: false }).click();
      await page.getByRole('heading', { level: 1, name: titles[0], exact: true }).waitFor();
      for (const title of titles.slice((batch - 1) * 4, batch * 4)) {
        await page.locator('.book-name').click();
        await written.getByRole('link', { name: title, exact: true }).click();
        const chapter = page.locator('#book > .level2:not([hidden])');
        await chapter.locator('h1').waitFor({ state: 'visible' });
        assert.equal(await chapter.locator('h1').innerText(), title);
        assert.doesNotMatch(await chapter.locator('.chapter-meta').innerText(), /Planned/);
        const photos = chapter.locator(
          'img[data-book-asset$=".jpg"], img[data-book-asset$=".jpeg"], img[data-book-asset$=".png"], img[data-book-asset$=".webp"]',
        );
        if (title !== 'Brakes and stability systems')
          assert.ok((await photos.count()) >= 1, `${title} needs a real photograph`);
        assert.ok((await chapter.locator('figure').count()) >= 3, `${title} needs explanatory illustrations`);
        let hasLargeImage = false;
        for (const photo of await photos.all()) {
          const image = await photo.evaluate((element: HTMLImageElement) => ({
            loaded: element.complete && element.naturalWidth > 0,
            width: element.naturalWidth,
          }));
          assert.ok(image.loaded, `${title} has a broken image`);
          hasLargeImage ||= image.width >= 200;
        }
        if (await photos.count()) assert.ok(hasLargeImage, `${title} needs an image large enough to examine`);
        const reference = chapter.locator('.footnote-ref').first();
        const noteId = (await reference.getAttribute('href'))!.slice(1);
        await reference.click();
        await page.waitForURL((url: { hash: string }) => url.hash === `#${noteId}`);
        assert.ok(await chapter.locator(`[id="${noteId}"]`).isVisible());
        assert.equal(
          await chapter.locator('h1').innerText(),
          title,
          'Opening a source note must retain the owning chapter',
        );
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${title} overflows on a phone`,
        );
      }
    } finally {
      await context.close();
    }
  },
);
test('cross-chapter explanations navigate to the owning section and every book fragment resolves', async () => {
  for (const edition of [preview, site]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    try {
      (await page.goto(edition))!;
      await page.locator('html.reader-enhanced').waitFor();
      const broken = await page.locator('#book a[href]').evaluateAll((links) =>
        links.flatMap((link) => {
          const href = link.getAttribute('href')!;
          if (href.startsWith('#') && href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1)))!)
            return [href];
          if (/index\.mdx?(?:#|$)/.test(href)) return [href];
          return [];
        }),
      );
      assert.deepEqual(broken, [], 'Every internal manuscript link must resolve in the reading edition');
      await page
        .getByRole('navigation', { name: 'Written chapters' })
        .getByRole('link', { name: 'Brakes and stability systems', exact: true })
        .click();
      await page
        .locator('#book > .level2:not([hidden])')
        .getByRole('link', { name: 'unsprung mass', exact: true })
        .click();
      await page.getByRole('heading', { level: 1, name: 'Suspension and wheel geometry', exact: true }).waitFor();
      await page.waitForURL((url: { hash: string }) => url.hash.endsWith('__compliance-and-unsprung-mass'));
      assert.ok(await page.getByRole('heading', { name: 'Compliance and unsprung mass', exact: true }).isVisible());
      await page.goBack();
      await page.getByRole('heading', { level: 1, name: 'Brakes and stability systems', exact: true }).waitFor();
    } finally {
      await page.close();
    }
  }
});
test('wheel dimension arrowheads terminate exactly at their dimension endpoints', async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(await readFile(resolve('book/12-steering-wheels-and-tyres/images/wheel-offset.svg'), 'utf8'));
    const measurements = await page.evaluate(() =>
      [...document.querySelectorAll<SVGPathElement>('path[marker-start][marker-end]')].map((path) => {
        const id = path.getAttribute('marker-end')!.match(/#([^)'"\s]+)/)![1];
        const marker = document.querySelector<SVGMarkerElement>(`marker[id="${id}"]`)!;
        const shape = marker.querySelector<SVGPathElement>('path')!.getBBox();
        const scale =
          (marker.markerWidth.baseVal.value / marker.viewBox.baseVal.width) *
          parseFloat(getComputedStyle(path).strokeWidth);
        const dx = (shape.x + shape.width - marker.refX.baseVal.value) * scale;
        const dy = (shape.y + shape.height / 2 - marker.refY.baseVal.value) * scale;
        const start = path.getPointAtLength(0);
        const end = path.getPointAtLength(path.getTotalLength());
        return {
          start: [start.x - dx, start.y + dy],
          end: [end.x + dx, end.y + dy],
          expectedStart: [start.x, start.y],
          expectedEnd: [end.x, end.y],
          orientation: marker.getAttribute('orient'),
        };
      }),
    );
    assert.equal(measurements.length, 4, 'Cover both offset and rim-width dimensions in both sections');
    for (const measurement of measurements) {
      assert.equal(measurement.orientation, 'auto-start-reverse');
      assert.deepEqual(measurement.start, measurement.expectedStart, 'The start tip must touch its extension line');
      assert.deepEqual(measurement.end, measurement.expectedEnd, 'The end tip must touch its extension line');
    }
  } finally {
    await page.close();
  }
});
test('every static SVG has an accessible explanation and keeps its labels within a phone-sized canvas', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    const files = (await readdir(resolve('book'), { recursive: true })).filter((file) => file.endsWith('.svg')).sort();
    assert.ok(files.length >= 59, 'Cover standalone illustrations and every interactive fallback');
    for (const file of files) {
      const source = await readFile(resolve('book', file), 'utf8');
      const result = await page.evaluate((source: string) => {
        const xml = new DOMParser().parseFromString(source, 'image/svg+xml');
        const error = xml.querySelector<HTMLElement>('parsererror')!;
        if (error) return { error: error.textContent };
        const svg = document.importNode(xml.documentElement, true);
        svg.style.width = '342px';
        svg.style.height = 'auto';
        document.body.replaceChildren(svg);
        const bounds = svg.getBoundingClientRect();
        const clipped = [...svg.querySelectorAll<HTMLElement>('text')]
          .filter((text) => {
            const box = text.getBoundingClientRect();
            return (
              box.width &&
              (box.left < bounds.left - 2 ||
                box.right > bounds.right + 2 ||
                box.top < bounds.top - 2 ||
                box.bottom > bounds.bottom + 2)
            );
          })
          .map((text) => text.textContent);
        return {
          title: svg.querySelector<HTMLElement>('title')?.textContent.trim(),
          description: svg.querySelector<HTMLElement>('desc')?.textContent.trim(),
          clipped,
        };
      }, source);
      assert.equal(result.error, undefined, `${file} must be valid SVG XML`);
      assert.ok(result.title && result.description, `${file} needs an accessible title and description`);
      assert.deepEqual(result.clipped, [], `${file} clips labels at phone width`);
    }
  } finally {
    await page.close();
  }
});
test('family and option comparisons keep the 2.9 baseline while changing the selected configuration', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(preview))!;
    const family = await ready(page, 'family-variant-selector');
    assert.equal((await family.locator('.diagram-interactive').getAttribute('data-family-power-ps'))!, '255');
    await family.getByRole('button', { name: 'S', exact: true }).click();
    assert.equal((await family.locator('.diagram-interactive').getAttribute('data-family-power-ps'))!, '310');
    await family.getByRole('button', { name: 'Spyder', exact: true }).click();
    assert.equal((await family.locator('.diagram-interactive').getAttribute('data-family-power-ps'))!, '320');
    assert.match(await family.locator('.diagram-explanation').innerText(), /February 2010/);
    await family.getByRole('button', { name: 'Black Edition', exact: true }).click();
    assert.match(await family.locator('.diagram-explanation').innerText(), /March 2011/);
    const options = await ready(page, 'specification-option-links');
    await options.getByRole('button', { name: 'Differential + wheels', exact: true }).click();
    assert.match(await options.locator('.diagram-explanation').innerText(), /18.*19/);
    await options.getByRole('button', { name: 'Chrono Plus + PCM', exact: true }).click();
    assert.match(await options.locator('.diagram-explanation').innerText(), /PCM/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally {
    await page.close();
  }
});
test.each([320, 390, 768, 1440].flatMap((width) => [1, 2].map((batch) => ({ width, batch }))))(
  'every interactive illustration responds to native controls and fits phone, tablet and desktop canvases ($width px, batch $batch)',
  async ({ width, batch }) => {
    // These snapshots inspect settled layouts; timed transitions are tested separately.
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      (await page.goto(preview))!;
      const names = await page
        .locator('[data-diagram]')
        .evaluateAll((figures: HTMLElement[]) => figures.map((figure) => figure.dataset.diagram!));
      assert.ok(names.length >= 24, 'The completed manuscript should retain its interactive illustrations');
      const batchSize = Math.ceil(names.length / 2);
      for (const name of names.slice((batch - 1) * batchSize, batch * batchSize)) {
        assert.ok(name, 'Every interactive figure has a diagram ID');
        const figure = await ready(page, name);
        const checkLabels = async () => {
          const clipped = await figure.evaluate(async (element) => {
            const svg = element.querySelector<SVGSVGElement>('.diagram-stage svg')!;
            if (!svg) return [];
            // Controls can resize the stage; allow its ResizeObserver and redraw to finish.
            await new Promise(requestAnimationFrame);
            await new Promise(requestAnimationFrame);
            const bounds = svg.getBoundingClientRect();
            return [...svg.querySelectorAll<HTMLElement>('text')]
              .filter((text) => {
                const box = text.getBoundingClientRect();
                return (
                  box.width &&
                  (box.left < bounds.left - 2 ||
                    box.right > bounds.right + 2 ||
                    box.top < bounds.top - 2 ||
                    box.bottom > bounds.bottom + 2)
                );
              })
              .map((text) => text.textContent);
          });
          assert.deepEqual(clipped, [], `${name} clips its live labels at ${width}px`);
        };
        assert.ok(await figure.locator('.diagram-explanation').innerText(), `${name} needs a textual explanation`);
        await checkLabels();
        for (const range of await figure.getByRole('slider').all()) {
          await range.focus();
          await range.press('End');
          assert.equal(
            await range.inputValue(),
            (await range.getAttribute('max'))!,
            `${name} must respond to the keyboard`,
          );
          await checkLabels();
          await range.press('Home');
          assert.equal(await range.inputValue(), (await range.getAttribute('min'))!);
          await checkLabels();
        }
        for (const select of await figure.getByRole('combobox').all()) {
          for (const option of await select.locator('option').all()) {
            const value = (await option.getAttribute('value'))!;
            await select.selectOption(value);
            assert.equal(await select.inputValue(), value);
            await checkLabels();
          }
        }
        for (const checkbox of await figure.getByRole('checkbox').all()) {
          await checkbox.check();
          assert.ok(await checkbox.isChecked());
          await checkLabels();
          await checkbox.uncheck();
          await checkLabels();
        }
        const buttons = figure.locator('.diagram-interactive').getByRole('button');
        for (const button of await buttons.all()) {
          await button.click();
          await checkLabels();
        }
        const overwideTables = await figure
          .locator('.diagram-interactive table')
          .evaluateAll((tables) =>
            tables
              .filter(
                (table: { scrollWidth: number; clientWidth: number }) => table.scrollWidth > table.clientWidth + 1,
              )
              .map((table) => table.textContent),
          );
        assert.deepEqual(overwideTables, [], `${name} needs a readable comparison without sideways table scrolling`);
        assert.equal(
          await figure.locator('.diagram-notice').count(),
          0,
          `${name} must not fall back after a runtime error`,
        );
        assert.ok(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${name} overflows the ${width}px viewport`,
        );
        await figure.screenshot({
          path: resolve(
            previews,
            `all-${name}-${width === 320 ? 'small-phone' : width === 390 ? 'phone' : width === 768 ? 'tablet' : 'desktop'}.png`,
          ),
          style: '.viewer-bar, .skip-link { visibility: hidden !important; }',
        });
      }
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  },
);
test.each([390, 1440].flatMap((width) => [1, 2].map((batch) => ({ width, batch }))))(
  'component tours locate, connect, separate and focus their parts while retaining state across chapters ($width px, batch $batch)',
  async ({ width, batch }) => {
    const names = [
      'body',
      'engine',
      'intake',
      'fluids',
      'manual',
      'pdk',
      'drivetrain',
      'suspension',
      'steering',
      'roof',
      'cabin',
      'electrical',
      'audio',
      'protection',
    ].map((name) => `${name}-explorer`);
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      (await page.goto(preview))!;
      const batchSize = Math.ceil(names.length / 2);
      for (const name of names.slice((batch - 1) * batchSize, batch * batchSize)) {
        assert.ok(name, 'Every interactive figure has a diagram ID');
        const figure = await ready(page, name);
        assert.equal(await figure.locator('canvas').count(), 1);
        const host = figure.locator('.diagram-interactive');
        for (const [label, progress] of [
          ['Connections', '30'],
          ['Assembly', '65'],
          ['Exploded', '100'],
        ]) {
          await figure.getByRole('button', { name: label, exact: true }).click();
          assert.equal((await host.getAttribute('data-progress'))!, progress);
          await figure.locator('.component-marker:not([hidden])').first().waitFor();
          await figure.screenshot({
            path: resolve(previews, `tour-${name}-${label.toLowerCase()}-${width}.png`),
            style: '.viewer-bar, .skip-link { visibility: hidden !important; }',
          });
        }
        const part = figure.locator('button[data-part]').last();
        const selected = (await part.getAttribute('data-part'))!;
        await part.click();
        assert.equal((await host.getAttribute('data-part'))!, selected);
        assert.equal((await part.getAttribute('aria-pressed'))!, 'true');
        assert.equal((await host.getAttribute('data-focus-part'))!, 'true');
        assert.ok((await figure.locator('.diagram-connections').textContent())!.length > 40);
        await figure.getByRole('checkbox', { name: 'Show connections' }).uncheck();
        await page.locator('.book-name').click();
        await figure.locator('canvas').waitFor({ state: 'detached' });
        await ready(page, name);
        assert.equal(
          (await host.getAttribute('data-part'))!,
          selected,
          `${name}: preserve the inspected part after returning`,
        );
        assert.equal((await host.getAttribute('data-focus-part'))!, 'true');
        assert.equal(await figure.getByRole('checkbox', { name: 'Show connections' }).isChecked(), false);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  },
);
test('the grip budget retains force requests beyond capacity and restores them after remounting', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    (await page.goto(preview))!;
    let figure = await ready(page, 'tyre-grip-budget');
    await figure.getByRole('button', { name: 'Too much demand', exact: true }).click();
    assert.equal((await figure.locator('.diagram-interactive').getAttribute('data-grip-within'))!, 'false');
    assert.equal(await figure.getByRole('slider', { name: 'Cornering force demand', exact: true }).inputValue(), '90');
    assert.match(await figure.locator('.diagram-explanation').innerText(), /exceeds the envelope/);
    await figure.getByRole('button', { name: 'Reduced capacity', exact: true }).click();
    assert.equal((await figure.locator('.diagram-interactive').getAttribute('data-grip-capacity'))!, '70');
    assert.equal((await figure.locator('.diagram-interactive').getAttribute('data-grip-within'))!, 'false');
    await page.evaluate(() => {
      location.hash = document.querySelector<HTMLElement>('#book > section.level2')!.id;
    });
    await figure.locator('.diagram-stage svg').waitFor({ state: 'detached' });
    figure = await ready(page, 'tyre-grip-budget');
    assert.equal(await figure.getByRole('slider', { name: 'Available grip capacity', exact: true }).inputValue(), '70');
    await figure.getByRole('button', { name: 'Straight braking', exact: true }).click();
    assert.equal((await figure.locator('.diagram-interactive').getAttribute('data-grip-within'))!, 'true');
    assert.equal(Number((await figure.locator('.diagram-interactive').getAttribute('data-grip-remaining'))!), 0);
  } finally {
    await context.close();
  }
});
test('the reference atlas and optional calculations print without losing disclosure state', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    (await page.goto(preview))!;
    const written = page.getByRole('navigation', { name: 'Written chapters' });
    await written.getByRole('link', { name: 'Reference atlas and index', exact: true }).click();
    await page.getByRole('heading', { level: 1, name: 'Reference atlas and index', exact: true }).waitFor();
    const chapter = page.locator('#book > .level2:not([hidden])');
    assert.equal(await chapter.locator('.reference-atlas.wheels figure').count(), 10);
    assert.equal(await chapter.locator('.reference-atlas.seats figure').count(), 3);
    assert.equal(await chapter.locator('.reference-atlas.swatches figure').count(), 31);
    for (const image of await chapter.locator('.reference-atlas img').all()) {
      assert.ok(await image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0));
      const bounds = (await image.boundingBox())!;
      assert.ok(bounds.width >= 100 && bounds.x >= 0 && bounds.x + bounds.width <= 390);
    }
    assert.match(await chapter.innerText(), /September 2010 at the earliest/);
    assert.match(await chapter.innerText(), /U · annual UK component revisions/);
    await chapter.getByRole('link', { name: 'PDK', exact: true }).first().click();
    await page.getByRole('heading', { level: 1, name: 'PDK transmission', exact: true }).waitFor();
    await page.locator('.book-name').click();
    await written.getByRole('link', { name: 'Engine construction and valve gear', exact: true }).click();
    const detail = page.locator('#book > .level2:not([hidden]) details.technical-detail');
    await detail.waitFor({ state: 'visible' });
    assert.equal(await detail.evaluate((element: HTMLDetailsElement) => element.open), false);
    await detail.locator('summary').focus();
    await detail.locator('summary').press('Enter');
    assert.ok(await detail.evaluate((element: HTMLDetailsElement) => element.open));
    await page.emulateMedia({ media: 'print' });
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLDetailsElement>('details.technical-detail')].every(
        (element: HTMLDetailsElement) => element.open,
      ),
    );
    for (const disclosure of await page.locator('details.technical-detail').all())
      assert.ok(await disclosure.evaluate((element: HTMLDetailsElement) => element.open));
    await page.emulateMedia({ media: 'screen' });
    await page.waitForFunction(
      () => document.querySelectorAll<HTMLDetailsElement>('details.technical-detail[open]').length === 1,
    );
    assert.ok(
      await detail.evaluate((element: HTMLDetailsElement) => element.open),
      'Keep the calculation the reader opened',
    );
    assert.equal(await page.locator('details.technical-detail[open]').count(), 1);
    await page.locator('.book-name').click();
    await written.getByRole('link', { name: 'Manual transmission and clutch', exact: true }).click();
    await page.getByRole('heading', { level: 1, name: 'Manual transmission and clutch', exact: true }).waitFor();
    const manualDetail = page.locator('#book > .level2:not([hidden]) details.technical-detail');
    await manualDetail.locator('summary').click();
    const reference = manualDetail.locator('.footnote-ref').first();
    const referenceId = (await reference.getAttribute('id'))!;
    const noteId = (await reference.getAttribute('href'))!.slice(1);
    await reference.click();
    await page.waitForURL((url) => url.hash === `#${noteId}`);
    await manualDetail.evaluate((element: HTMLDetailsElement) => {
      element.open = false;
    });
    await page.locator(`[id="${noteId}"] a[href="#${referenceId}"]`).click();
    await page.waitForFunction((id) => document.getElementById(id)!.closest('details')!.open, referenceId);
    assert.ok(await reference.isVisible(), 'A source backlink must reopen its optional calculation');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally {
    await context.close();
  }
});
test('engine feedback corrects the mixture without removing the leak, while cooling controls distinguish air and liquid flow', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(preview))!;
    const mixture = await ready(page, 'engine-mixture-feedback');
    await mixture.getByRole('slider', { name: 'Additional unmetered air', exact: true }).fill('10');
    await mixture.getByRole('slider', { name: 'Feedback correction step', exact: true }).fill('1');
    const model = mixture.locator('.diagram-interactive');
    assert.equal(Number((await model.getAttribute('data-fuel-correction'))!), 6);
    assert.ok(Math.abs(Number((await model.getAttribute('data-lambda'))!) - 1.1 / 1.06) < 1e-6);
    await mixture.getByRole('slider', { name: 'Feedback correction step', exact: true }).fill('8');
    assert.ok(Math.abs(Number((await model.getAttribute('data-lambda'))!) - 1) < 0.001);
    assert.match(await mixture.locator('.diagram-explanation').innerText(), /cannot close the leak/);
    await mixture.getByRole('slider', { name: 'Additional unmetered air', exact: true }).fill('0');
    assert.equal(Number((await model.getAttribute('data-lambda'))!), 1);
    assert.equal(Number((await model.getAttribute('data-fuel-correction'))!), 0);
    const cooling = await ready(page, 'fluid-cooling-path');
    await cooling.getByRole('button', { name: 'Warm in traffic', exact: true }).click();
    assert.equal((await cooling.locator('.diagram-interactive').getAttribute('data-cooling-condition'))!, '2');
    assert.match(await cooling.locator('.diagram-explanation').innerText(), /fans now assist airflow/);
    await cooling.getByRole('button', { name: 'Warming up', exact: true }).click();
    assert.match(await cooling.locator('.diagram-explanation').innerText(), /engine and short bypass/);
  } finally {
    await page.close();
  }
});
test('PDK selection prepares an unloaded path and transfers drive through controlled clutch states', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(preview))!;
    const pdk = await ready(page, 'pdk-power-path');
    const model = pdk.locator('.diagram-interactive');
    const stage = pdk.getByRole('slider', { name: 'Shift stage', exact: true });
    assert.equal((await model.getAttribute('data-pdk-k1'))!, 'closed');
    assert.equal((await model.getAttribute('data-pdk-k2'))!, 'open');
    assert.equal((await model.getAttribute('data-pdk-even-gear'))!, '2');
    await stage.fill('1');
    assert.equal((await model.getAttribute('data-pdk-k1'))!, 'releasing');
    assert.equal((await model.getAttribute('data-pdk-k2'))!, 'applying');
    await stage.fill('3');
    assert.equal((await model.getAttribute('data-pdk-k1'))!, 'open');
    assert.equal((await model.getAttribute('data-pdk-k2'))!, 'closed');
    assert.equal((await model.getAttribute('data-pdk-odd-gear'))!, '3');
    await pdk.getByRole('combobox', { name: 'Gear change', exact: true }).selectOption('3');
    assert.equal(await stage.inputValue(), '0');
    assert.equal((await model.getAttribute('data-pdk-k2'))!, 'closed');
    await stage.fill('3');
    assert.equal((await model.getAttribute('data-pdk-k1'))!, 'closed');
    assert.equal((await model.getAttribute('data-pdk-k2'))!, 'open');
    assert.equal((await model.getAttribute('data-pdk-even-gear'))!, '2');
  } finally {
    await page.close();
  }
});
test('open differential displays fractional output speeds and respects the weaker tyre torque limit', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(preview))!;
    const figure = await ready(page, 'drivetrain-open-differential');
    const model = figure.locator('.diagram-interactive');
    await figure.getByRole('slider', { name: 'Carrier speed', exact: true }).fill('50');
    await figure.getByRole('slider', { name: 'Speed difference about the mean', exact: true }).fill('5');
    assert.equal(Number((await model.getAttribute('data-drivetrain-left-rpm'))!), 47.5);
    assert.equal(Number((await model.getAttribute('data-drivetrain-right-rpm'))!), 52.5);
    assert.match((await figure.locator('svg').textContent())!, /47\.5 \+ 52\.5 = 2 × 50/);
    await figure.getByRole('button', { name: 'Unequal grip', exact: true }).click();
    await figure.getByRole('slider', { name: 'Requested axle torque', exact: true }).fill('800');
    const grip = figure.getByRole('slider', { name: 'Left tyre torque capacity', exact: true });
    await grip.fill('0');
    assert.equal(Number((await model.getAttribute('data-drivetrain-total-nm'))!), 0);
    await grip.fill('600');
    assert.equal(Number((await model.getAttribute('data-drivetrain-each-nm'))!), 400);
    assert.equal(Number((await model.getAttribute('data-drivetrain-total-nm'))!), 800);
  } finally {
    await page.close();
  }
});
test('cabin demisting combines the air controls and electrical loads require a complete circuit', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(preview))!;
    const cabin = await ready(page, 'cabin-air-route');
    await cabin.getByRole('button', { name: 'Demisting principle', exact: true }).click();
    const air = cabin.locator('.diagram-interactive');
    for (const [name, value] of Object.entries({
      source: 'fresh',
      outlet: 'screen',
      heat: '2',
      ac: 'on',
    })) {
      assert.equal((await air.getAttribute(`data-air-${name}`))!, value);
    }
    await cabin.getByRole('button', { name: 'Cooling principle', exact: true }).click();
    assert.equal((await air.getAttribute('data-air-heat'))!, '0');
    assert.equal((await air.getAttribute('data-air-outlet'))!, 'face');
    const circuit = await ready(page, 'electrical-current-path');
    const model = circuit.locator('.diagram-interactive');
    assert.equal(Number((await model.getAttribute('data-electrical-current'))!), 2);
    await circuit.getByRole('button', { name: 'Two parallel lamps', exact: true }).click();
    assert.equal(Number((await model.getAttribute('data-electrical-current'))!), 4);
    await circuit.getByRole('button', { name: 'Open earth', exact: true }).click();
    assert.equal(Number((await model.getAttribute('data-electrical-current'))!), 0);
    await circuit.getByRole('button', { name: 'Intact circuit', exact: true }).click();
    assert.equal(Number((await model.getAttribute('data-electrical-current'))!), 4);
    await circuit.getByRole('button', { name: 'Switch open', exact: true }).click();
    assert.equal(Number((await model.getAttribute('data-electrical-current'))!), 0);
  } finally {
    await page.close();
  }
});
test('audio routes enforce their equipment dependencies and system scenarios preserve separate responsibilities', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(preview))!;
    const audio = await ready(page, 'audio-source-path');
    const path = audio.locator('.diagram-interactive');
    assert.equal((await path.getAttribute('data-audio-available'))!, 'true');
    await audio.getByRole('combobox', { name: 'Programme source', exact: true }).selectOption('usb');
    assert.equal((await path.getAttribute('data-audio-available'))!, 'false');
    await audio.getByRole('combobox', { name: 'Head unit', exact: true }).selectOption('pcm');
    assert.equal((await path.getAttribute('data-audio-available'))!, 'false');
    await audio.getByRole('checkbox', { name: 'Universal audio interface (870) fitted', exact: true }).check();
    assert.equal((await path.getAttribute('data-audio-available'))!, 'true');
    await audio.getByRole('combobox', { name: 'Programme source', exact: true }).selectOption('dvd');
    assert.equal((await path.getAttribute('data-audio-available'))!, 'false');
    await audio.getByRole('combobox', { name: 'Sound system', exact: true }).selectOption('bose');
    assert.equal((await path.getAttribute('data-audio-available'))!, 'true');
    const integration = await ready(page, 'protection-system-scenarios');
    const systems = integration.locator('.diagram-interactive');
    await integration.getByRole('combobox', { name: 'Situation', exact: true }).selectOption('shift');
    await integration.getByRole('combobox', { name: 'Transmission', exact: true }).selectOption('pdk');
    assert.equal((await systems.getAttribute('data-protection-systems'))!, 'pdk,dme');
    await integration.getByRole('combobox', { name: 'Situation', exact: true }).selectOption('grip');
    assert.equal((await systems.getAttribute('data-protection-systems'))!, 'psm,dme');
    assert.equal((await systems.getAttribute('data-protection-fixed-structure'))!, 'present');
    assert.equal((await systems.getAttribute('data-protection-deploys'))!, 'not-predicted');
  } finally {
    await page.close();
  }
});
test('suspension illustrations distinguish damping velocity from spring deflection and anti-roll twist', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(preview))!;
    const spring = await ready(page, 'suspension-spring-damper');
    await spring.getByRole('slider', { name: 'Extra spring compression', exact: true }).fill('20');
    const velocity = spring.getByRole('slider', { name: 'Compression velocity', exact: true });
    await velocity.fill('0');
    const values = () =>
      spring.locator('.diagram-interactive').evaluate((element) => ({
        spring: Number(element.dataset.springForceN),
        damper: Number(element.dataset.damperForceN),
        body: Number(element.dataset.damperBodyForceN),
      }));
    const stationary = await values();
    assert.equal(stationary.spring, 400);
    assert.equal(stationary.damper, 0);
    assert.equal(stationary.body, 0);
    await velocity.fill('0.1');
    const moving = await values();
    assert.equal(moving.spring, stationary.spring, 'Velocity alone must not change the spring force');
    assert.equal(Math.abs(moving.damper), 150);
    assert.equal(moving.body, 150, 'Bump pushes up on the body while the damper resists compression');
    await velocity.fill('-0.1');
    assert.equal((await values()).body, -150, 'Rebound reverses the damper reaction on the body');
    await spring.screenshot({ path: resolve(previews, 'suspension-spring-damper-phone.png') });
    const bar = await ready(page, 'suspension-anti-roll');
    await bar.getByRole('button', { name: 'Both wheels rise', exact: true }).click();
    assert.equal(Number((await bar.locator('.diagram-interactive').getAttribute('data-bar-twist-input-mm'))!), 0);
    await bar.getByRole('slider', { name: 'Left wheel bump travel', exact: true }).fill('30');
    await bar.getByRole('slider', { name: 'Right wheel bump travel', exact: true }).fill('-30');
    assert.equal(Number((await bar.locator('.diagram-interactive').getAttribute('data-bar-twist-input-mm'))!), 60);
    await bar.screenshot({ path: resolve(previews, 'suspension-anti-roll-phone.png') });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally {
    await page.close();
  }
});
test('engine illustrations connect the four strokes, half-speed cams and separate timing/lift changes', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    (await page.goto(preview))!;
    const cycle = await ready(page, 'engine-four-stroke');
    const angle = cycle.getByRole('slider', { name: 'Crankshaft angle', exact: true });
    for (const [degrees, stroke] of [
      [90, 'intake'],
      [270, 'compression'],
      [450, 'power'],
      [630, 'exhaust'],
    ] as const) {
      await angle.fill(String(degrees));
      assert.equal((await cycle.locator('.diagram-interactive').getAttribute('data-engine-stroke'))!, stroke);
      assert.equal(
        Number((await cycle.locator('.diagram-interactive').getAttribute('data-engine-cam-angle'))!),
        degrees / 2,
      );
    }
    // One complete cycle returns to the initial valve state after two crank turns.
    const cylinder = cycle.locator('.diagram-interactive');
    for (const [degrees, inlet, exhaust] of [
      [0, true, false],
      [180, false, false],
      [360, false, false],
      [540, false, true],
      [720, true, false],
    ] as const) {
      await angle.fill(String(degrees));
      assert.equal((await cylinder.getAttribute('data-engine-inlet-open'))!, String(inlet));
      assert.equal((await cylinder.getAttribute('data-engine-exhaust-open'))!, String(exhaust));
      assert.equal(Number((await cylinder.getAttribute('data-engine-cam-angle'))!), degrees / 2);
    }
    assert.equal((await cylinder.getAttribute('data-engine-stroke'))!, 'intake');
    await cycle.screenshot({ path: resolve(previews, 'engine-four-stroke-phone.png') });
    const valves = await ready(page, 'engine-timing-lift');
    await valves.getByRole('slider', { name: 'Illustrative inlet advance', exact: true }).fill('20');
    await valves.getByRole('button', { name: /High lift/ }).click();
    assert.equal(Number((await valves.locator('.diagram-interactive').getAttribute('data-engine-advance'))!), 20);
    assert.equal(Number((await valves.locator('.diagram-interactive').getAttribute('data-engine-lift-mm'))!), 10);
    await valves.getByRole('button', { name: /Low lift/ }).click();
    assert.equal(Number((await valves.locator('.diagram-interactive').getAttribute('data-engine-lift-mm'))!), 3.6);
    assert.equal(
      Number((await valves.locator('.diagram-interactive').getAttribute('data-engine-advance'))!),
      20,
      'Selecting lift must not silently change the requested timing',
    );
    await valves.screenshot({ path: resolve(previews, 'engine-timing-lift-phone.png') });
    await page.locator('.book-name').click();
    await page.locator('#title').waitFor({ state: 'visible' });
    await valves.locator('.diagram-stage').waitFor({ state: 'detached' });
    assert.equal(
      await valves.locator('.diagram-interactive').evaluate((host) => host.childElementCount),
      0,
      'React retains an empty host after the drawing is disposed',
    );
    await ready(page, 'engine-timing-lift');
    assert.equal(
      await valves.getByRole('slider').inputValue(),
      '20',
      'Changing chapters must retain the illustration state',
    );
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  } finally {
    await context.close();
  }
});
test('water amounts visibly change the pool and flow in both clear and blocked drainage views', async () => {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1100 }, reducedMotion: 'reduce' });
    try {
      await page.goto(preview);
      const figure = await ready(page, 'roof-drainage');
      const amount = figure.getByRole('slider', { name: 'Illustrative water added', exact: true });
      for (const outlet of ['Clear drain', 'Blocked drain']) {
        await figure.getByRole('button', { name: outlet, exact: true }).click();
        const levels: number[] = [];
        const strokes: number[] = [];
        for (const value of ['20', '50', '90']) {
          await amount.fill(value);
          levels.push(Number(await figure.locator('rect[clip-path][fill="#78b6d1"]').getAttribute('y')));
          strokes.push(Number(await figure.locator('path[stroke="#22779e"]').first().getAttribute('stroke-width')));
          await figure.locator('.diagram-stage').screenshot({
            path: resolve(previews, `drainage-${outlet.split(' ')[0].toLowerCase()}-${value}-${width}.png`),
          });
        }
        assert.ok(
          levels[0] > levels[1] && levels[1] > levels[2],
          `${outlet}: Low, Medium and High need different visible water depths`,
        );
        assert.ok(
          strokes[0] < strokes[1] && strokes[1] < strokes[2],
          `${outlet}: added water must also change the visible stream`,
        );
        await amount.fill('0');
        assert.equal(await figure.locator('rect[clip-path][fill="#78b6d1"]').count(), 0);
        assert.equal(await figure.locator('path[stroke="#22779e"]').count(), 0);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
    } finally {
      await page.close();
    }
  }
});
test('roof illustrations separate opening sequence from drainage and retain clear/blocked states', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    (await page.goto(preview))!;
    const opening = await ready(page, 'roof-opening');
    const stage = opening.getByRole('slider', { name: 'Opening stage', exact: true });
    const roof = opening.locator('.diagram-interactive');
    for (const [position, cover, header, glass] of [
      [0, 'closed', 'latched', 'visible'],
      [1, 'closed', 'released', 'visible'],
      [2, 'clear', 'released', 'visible'],
      [3, 'clear', 'released', 'visible'],
      [4, 'closed', 'released', 'stowed'],
    ] as const) {
      await stage.fill(String(position));
      assert.equal((await roof.getAttribute('data-roof-cover'))!, cover);
      assert.equal((await roof.getAttribute('data-roof-header'))!, header);
      assert.equal((await roof.getAttribute('data-roof-glass'))!, glass);
      assert.equal((await roof.getAttribute('data-roof-door-glass'))!, position === 0 ? 'raised' : 'lowered');
    }
    await stage.fill('4');
    assert.equal((await opening.locator('.diagram-interactive').getAttribute('data-roof-stage'))!, '4');
    await stage.fill('0');
    assert.equal((await opening.locator('.diagram-interactive').getAttribute('data-roof-stage'))!, '0');
    await opening.screenshot({ path: resolve(previews, 'roof-opening-phone.png') });
    const drain = await ready(page, 'roof-drainage');
    await drain.getByRole('slider', { name: 'Illustrative water added', exact: true }).fill('100');
    await drain.getByRole('button', { name: 'Clear drain', exact: true }).click();
    assert.equal((await drain.locator('.diagram-interactive').getAttribute('data-drain-state'))!, 'clear');
    assert.equal((await drain.locator('.diagram-interactive').getAttribute('data-water-outcome'))!, 'drained');
    await drain.getByRole('button', { name: 'Blocked drain', exact: true }).click();
    assert.equal((await drain.locator('.diagram-interactive').getAttribute('data-drain-state'))!, 'blocked');
    assert.equal((await drain.locator('.diagram-interactive').getAttribute('data-water-outcome'))!, 'overflow');
    await drain.screenshot({ path: resolve(previews, 'roof-drainage-phone.png') });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.emulateMedia({ media: 'print' });
    for (const figure of [opening, drain]) {
      assert.equal(await figure.locator('.diagram-interactive').isVisible(), false);
      assert.equal(await figure.locator('.diagram-static img').isVisible(), true);
      assert.ok(
        await figure
          .locator('.diagram-static img')
          .evaluate((image) => image.getBoundingClientRect().height <= (220 * 96) / 25.4 + 1),
        'Tall fallback artwork must fit a printed page',
      );
    }
  } finally {
    await page.close();
  }
});
