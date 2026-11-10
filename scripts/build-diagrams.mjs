import { build } from 'esbuild';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, basename } from 'node:path';

const [mode, destination, ...chapterFiles] = process.argv.slice(2);
if (!['portable', 'web'].includes(mode) || !destination) throw new Error('Expected mode, output folder and chapter paths');
const modules = new Map();
for (const file of chapterFiles) {
  const directory = join(resolve(file, '..'), 'diagrams');
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (modules.has(entry.name)) throw new Error(`Duplicate diagram name: ${entry.name}`);
    const module = join(directory, entry.name, 'index.js');
    await readFile(module); // A missing authoring file is a build error.
    modules.set(entry.name, module);
  }
}
await mkdir(destination, { recursive: true });
if (!modules.size) {
  console.log(JSON.stringify({ ids: [], script: null, css: null }));
} else {
  const entry = join(destination, 'entry.mjs');
  const runtime = resolve('interactive/runtime.js');
  const registry = [...modules].map(([id, path]) => `${JSON.stringify(id)}: () => import(${JSON.stringify(path)})`).join(',\n');
  await writeFile(entry, `import { boot } from ${JSON.stringify(runtime)};\nboot({${registry}});\n`);
  const result = await build({
    entryPoints: { reader: entry },
    outdir: join(destination, 'assets'),
    bundle: true,
    splitting: mode === 'web',
    format: mode === 'web' ? 'esm' : 'iife',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    metafile: true,
    entryNames: '[name]-[hash]',
    chunkNames: 'chunks/[name]-[hash]',
    assetNames: 'models/[name]-[hash]',
    loader: { '.glb': mode === 'web' ? 'file' : 'binary' },
    define: mode === 'portable' ? { 'import.meta.url': '"file:///"' } : {},
    legalComments: 'inline',
    logLevel: 'warning',
  });
  const output = Object.entries(result.metafile.outputs).find(([path, data]) => data.entryPoint && path.endsWith('.js') && basename(path).startsWith('reader-'));
  const packages = new Set(Object.keys(result.metafile.inputs).map((path) => path.match(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1]).filter(Boolean));
  const notices = [];
  for (const name of [...packages].sort()) {
    const directory = resolve('node_modules', name);
    const metadata = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
    const licenses = (await readdir(directory)).filter((name) => /^(license|copying)(\.|$)/i.test(name));
    if (!licenses.length) throw new Error(`Missing license notice for ${name}`);
    notices.push(`${metadata.name} ${metadata.version}\n${(await Promise.all(licenses.map((name) => readFile(join(directory, name), 'utf8')))).join('\n')}`);
  }
  const noticeFile = join(destination, 'assets', 'THIRD_PARTY_NOTICES.txt');
  await writeFile(noticeFile, notices.join('\n\n--------------------\n\n'));
  console.log(JSON.stringify({ ids: [...modules.keys()], script: resolve(output[0]), css: output[1].cssBundle ? resolve(output[1].cssBundle) : null, assets: join(destination, 'assets'), notices: noticeFile }));
}
