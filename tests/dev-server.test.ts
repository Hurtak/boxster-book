import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright-core';
import { createServer, type ViteDevServer } from 'vite-plus';
import { test } from 'vite-plus/test';
import { root } from '../scripts/build';

test('a cold Vite+ development server hydrates once and loads car diagrams without React errors', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'boxster-dev-cache-'));
  let server: ViteDevServer | undefined;
  let browser: Browser | undefined;
  try {
    server = await createServer({
      configFile: join(root, 'vite.config.ts'),
      mode: 'development',
      define: { 'process.env.NODE_ENV': JSON.stringify('development') },
      cacheDir,
      server: { port: 0 },
    });
    await server.listen();
    browser = await chromium.launch({
      ...(process.env.BROWSER_EXECUTABLE_PATH
        ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH }
        : { channel: 'chrome' }),
      headless: true,
      args: ['--enable-unsafe-swiftshader'],
    });
    const url = server.resolvedUrls!.local[0];
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      try {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
          if (message.type() === 'error') errors.push(message.text());
        });
        await page.goto(url);
        await page.locator('html.reader-enhanced:not([data-reader-pending])').waitFor();
        assert.equal(await page.locator('#title').isVisible(), true);
        const chapter = await page.locator('section.level2:has([data-diagram="roof-explorer"])').getAttribute('id');
        assert.ok(chapter);
        await page.evaluate((id) => {
          location.hash = id;
        }, chapter);
        const figure = page.locator('[data-diagram="roof-explorer"]');
        await figure.waitFor({ state: 'visible' });
        await figure.scrollIntoViewIfNeeded();
        await page.locator('[data-diagram="roof-explorer"].diagram-ready').waitFor();
        assert.equal(await figure.locator('canvas').count(), 1);
        await figure.getByRole('button', { name: 'Exploded', exact: true }).click();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        assert.deepEqual(errors, [], `Browser errors at ${width}px`);
        for (const fragment of ['brakes/sources/hardware', 'manual-transmission/references/ratios/2']) {
          let release!: () => void;
          const entry = new Promise<void>((resolve) => {
            release = resolve;
          });
          await page.route(
            '**/src/entry-client.tsx',
            async (route) => {
              await entry;
              await route.continue();
            },
            { times: 1 },
          );
          try {
            await page.goto(url + '#' + fragment, { waitUntil: 'commit' });
            // Native fragment navigation can open a disclosure before React runs.
            await page.waitForFunction((id) => document.getElementById(id)?.closest('details')?.open, fragment);
          } finally {
            release();
          }
          await page.waitForFunction(
            (id) => !document.documentElement.hasAttribute('data-reader-pending') && document.activeElement?.id === id,
            fragment,
          );
          assert.ok(await page.locator(`[id="${fragment}"]`).evaluate((node) => node.closest('details')?.open));
          assert.deepEqual(errors, [], `Direct disclosure link ${fragment} at ${width}px`);
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser?.close();
    await server?.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
});
