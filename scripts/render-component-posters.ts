import { build } from 'esbuild';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
// Render the chapter's actual procedural assembly, then add vector location and
// part labels. Posters are source assets; the normal book build needs no browser.
const root = resolve(import.meta.dirname, '..');
const requested = new Set(process.argv.slice(2));
const models = [];
for (const chapter of (await readdir(join(root, 'book'))).sort()) {
  const directory = join(root, 'book', chapter, 'diagrams');
  for (const entry of await readdir(directory).catch((error) =>
    error.code === 'ENOENT' ? [] : Promise.reject(error),
  )) {
    if (requested.size && !requested.has(entry)) continue;
    const file = join(directory, entry, 'model.ts');
    const source = await readFile(file, 'utf8').catch((error) =>
      error.code === 'ENOENT' ? '' : Promise.reject(error),
    );
    if (source.includes('export const config') && source.includes('export function createAssembly'))
      models.push({ id: entry, file, directory: join(directory, entry) });
  }
}
if (!models.length) throw new Error('No component assemblies found');
const temporary = await mkdtemp(join(tmpdir(), 'boxster-posters-'));
const imports = models
  .map((model, i) => `import {config as c${i}, createAssembly as m${i}} from ${JSON.stringify(model.file)};`)
  .join('\n');
const entry = `
import { initializePosterRenderer } from ${JSON.stringify(join(root, 'scripts/component-poster-client.ts'))};
${imports}
initializePosterRenderer({${models.map((m, i) => `${JSON.stringify(m.id)}:{config:c${i},create:m${i}}`).join(',')}});
`;
const result = await build({
  stdin: { contents: entry, resolveDir: root },
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'iife',
  target: 'es2022',
  loader: { '.glb': 'binary' },
});
await writeFile(
  join(temporary, 'fixture.html'),
  `<meta charset="utf-8"><script>${result.outputFiles![0]!.text.replaceAll('</script', '<\\/script')}</script>`,
);
const escape = (value: string) =>
  String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const wrap = (text: string, length: number) => {
  const lines = [];
  for (const word of text.split(/\s+/)) {
    if (!lines.length || lines.at(-1)!.length + word.length + 1 > length) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  return lines;
};
const textLines = (text: string, x: number, y: number, limit: number, size = 26, leading = 31) =>
  wrap(text, limit)
    .map((line, i) => `<text x="${x}" y="${y + i * leading}" font-size="${size}">${escape(line)}</text>`)
    .join('');
const browser = await chromium.launch({
  ...(process.env.BROWSER_EXECUTABLE_PATH
    ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH }
    : { channel: 'chrome' }),
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(join(temporary, 'fixture.html')).href);
  for (const model of models) {
    const { config, parts, installed, image } = await page.evaluate((id) => window.renderPoster(id), model.id);
    const titles = wrap(config.title, 36);
    const planY = 80 + titles.length * 30;
    const renderY = planY + Math.max(220, wrap(config.location, 28).length * 29 + 60);
    const legendY = renderY + 420;
    const rows = Math.ceil(parts.length / 2);
    const overviewY = legendY + rows * 70 + 15;
    const overview = wrap(config.overview, 43);
    const height = overviewY + overview.length * 31 + 85;
    const focusNumber = parts.find((p) => p.name === config.focus)!.number;
    const pinX = 100 + installed[0] * 40,
      pinY = planY + 108 - installed[2] * 36;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${height}" viewBox="0 0 600 ${height}" role="img" aria-labelledby="title desc"><title id="title">${escape(config.title)}</title><desc id="desc">${escape(`${config.location} ${config.overview} Numbered parts: ${parts.map((p) => `${p.number} ${p.label}`).join('; ')}. Explanatory separation, not a workshop sequence.`)}</desc><rect width="600" height="${height}" fill="#f2f4f7"/><g font-family="Arial,sans-serif" fill="#263f35">`;
    svg += textLines(config.title, 20, 38, 36, 28, 32);
    svg += `<path d="M65 ${planY + 30} Q100 ${planY + 6} 135 ${planY + 30} L147 ${planY + 163} Q100 ${planY + 190} 53 ${planY + 163} Z" fill="#dbe5df" stroke="#6d887b" stroke-width="2"/><rect x="66" y="${planY + 77}" width="68" height="65" rx="10" fill="#f2f4f7"/><path d="M61 ${planY + 62} H139 M57 ${planY + 153} H143" stroke="#a9b9ae" stroke-width="6"/><text x="100" y="${planY + 4}" text-anchor="middle" font-size="22">Front</text><circle cx="${pinX}" cy="${pinY}" r="16" fill="#2165a6"/><text x="${pinX}" y="${pinY + 8}" text-anchor="middle" font-size="24" fill="white">${focusNumber}</text>`;
    svg += textLines(config.location, 185, planY + 36, 28, 25, 29);
    svg += `<image x="0" y="${renderY}" width="600" height="400" href="${image}"/>`;
    const placed: { x: number; y: number }[] = [];
    for (const p of parts) {
      const offsets = [
        [0, -25],
        [-35, -20],
        [35, -20],
        [-35, 25],
        [35, 25],
        [0, 45],
        [-65, -35],
        [65, 35],
      ];
      const [dx, dy] = offsets.find(
        ([dx, dy]) =>
          p.x + dx >= 18 &&
          p.x + dx <= 582 &&
          p.y + dy >= 18 &&
          p.y + dy <= 382 &&
          placed.every((q) => Math.hypot(p.x + dx - q.x, p.y + dy - q.y) >= 36),
      ) ?? [0, 0];
      const x = p.x + dx,
        y = p.y + dy;
      placed.push({ x, y });
      svg += `<path d="M${p.x} ${renderY + p.y} L${x} ${renderY + y}" stroke="#526159"/><circle cx="${x}" cy="${renderY + y}" r="16" fill="#34443e"/><text x="${x}" y="${renderY + y + 8}" text-anchor="middle" font-size="24" fill="white">${p.number}</text>`;
      const col = (p.number - 1) % 2,
        row = Math.floor((p.number - 1) / 2);
      svg += textLines(`${p.number} ${p.label}`, 20 + col * 295, legendY + row * 70, 20, 26, 29);
    }
    svg += textLines(config.overview, 20, overviewY, 43);
    svg += `<text x="20" y="${height - 39}" font-size="22">Location and separation are schematic.</text><text x="20" y="${height - 12}" font-size="22">2010 2.9 · details and limits in chapter text.</text></g></svg>\n`;
    await writeFile(join(model.directory, 'poster.svg'), svg);
    console.log(`${model.id}: ${parts.length} parts, ${Math.round(svg.length / 1024)} KiB poster`);
  }
} finally {
  await browser.close();
  await rm(temporary, { recursive: true, force: true });
}
