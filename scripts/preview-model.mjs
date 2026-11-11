import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const destination = resolve('dist/model-preview');
await mkdir(destination, { recursive: true });
await build({
  stdin: {
    resolveDir: process.cwd(),
    contents: `
    import reference from './interactive/models/reference-car.glb';
    import { scene3D, loadModel } from './interactive/three/scene.js';
    const controller=new AbortController();
    const view=scene3D(document.querySelector('#stage'),{signal:controller.signal});
    const car=await loadModel(reference,controller.signal,import.meta.url);
    view.scene.add(car);
    const poses={
      front:[[-3.4,2.2,4.4],[0,.57,0]],
      rear:[[3.4,2.2,-4.4],[0,.57,-.1]],
      side:[[-5.5,1.25,0],[0,.55,0]],
      low:[[-3.6,1.05,4.3],[0,.57,0]],
      cabin:[[-1.8,2.0,1.3],[0,.73,-.05]],
      headOn:[[0,1.22,5.3],[0,.54,.2]],
    };
    const setView=name=>{
      const [position,target]=poses[name];
      view.camera.position.fromArray(position);view.controls.target.fromArray(target);view.controls.update();view.render();
      document.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===name)));
    };
    document.querySelectorAll('button').forEach(button=>button.onclick=()=>setView(button.dataset.view));
    window.modelPreview={view,car,setView};
    setView('front');
    document.documentElement.dataset.ready='true';
  `,
  },
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
</nav></header><main id="stage"></main><script type="module" src="viewer.js"></script></html>`
);
console.log('Model inspection: run npm run build:preview and open /model-preview/');
