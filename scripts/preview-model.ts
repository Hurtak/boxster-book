import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const destination = resolve('dist/model-preview');
await mkdir(destination, { recursive: true });
await build({
  entryPoints: [resolve(import.meta.dirname, 'model-preview-client.ts')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  minify: true,
  outfile: resolve(destination, 'viewer.js'),
  loader: { '.glb': 'file' },
  assetNames: '[name]-[hash]',
});
await writeFile(
  resolve(destination, 'index.html'),
  `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Boxster model inspection</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f2f4f7;color:#141414;font:15px/1.5 system-ui,sans-serif}
header{padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
h1{font-size:20px;margin:0}nav{display:flex;gap:8px;flex-wrap:wrap}button{font:inherit;border:0;padding:10px 16px;background:white;cursor:pointer}
button[aria-pressed=true]{background:#141414;color:white}#stage{height:calc(100vh - 90px);min-height:480px}canvas{display:block;width:100%;height:100%}
</style>
<header><h1>Green and tan Boxster</h1><nav aria-label="Model views">
<button data-view="front">Front</button><button data-view="rear">Rear</button><button data-view="side">Side</button><button data-view="low">Low front</button><button data-view="cabin">Cabin</button><button data-view="headOn">Head on</button>
</nav></header><main id="stage"></main><script type="module" src="viewer.js"></script></html>`,
);
console.log('Model inspection: run npm run build:preview and open /model-preview/');
