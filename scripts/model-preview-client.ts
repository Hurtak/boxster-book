import type { Object3D } from 'three';
import type { scene3D as createScene } from '../interactive/three/scene';

declare global {
  interface Window {
    modelPreview: {
      view: ReturnType<typeof createScene>;
      car: Object3D;
      setView: (name: string) => void;
    };
  }
}

import reference from '../interactive/models/reference-car.glb';
import { scene3D, loadModel } from '../interactive/three/scene.ts';
const controller = new AbortController();
const host = document.querySelector<HTMLElement>('#stage');
if (!host) throw new Error('Missing model-preview stage');
const view = scene3D(host, { signal: controller.signal });
const car = await loadModel(reference, controller.signal, import.meta.url);
view.scene.add(car);
const poses: Record<string, [number[], number[]]> = {
  front: [
    [-3.4, 2.2, 4.4],
    [0, 0.57, 0],
  ],
  rear: [
    [3.4, 2.2, -4.4],
    [0, 0.57, -0.1],
  ],
  side: [
    [-5.5, 1.25, 0],
    [0, 0.55, 0],
  ],
  low: [
    [-3.6, 1.05, 4.3],
    [0, 0.57, 0],
  ],
  cabin: [
    [-1.8, 2.0, 1.3],
    [0, 0.73, -0.05],
  ],
  headOn: [
    [0, 1.22, 5.3],
    [0, 0.54, 0.2],
  ],
};
const setView = (name: string) => {
  if (!poses[name]) throw new Error(`Unknown model view: ${name}`);
  const [position, target] = poses[name];
  view.camera.position.fromArray(position);
  view.controls.target.fromArray(target);
  view.controls.update();
  view.render();
  document
    .querySelectorAll('button')
    .forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === name)));
};
document.querySelectorAll('button').forEach((button) => (button.onclick = () => setView(button.dataset.view!)));
window.modelPreview = { view, car, setView };
setView('front');
document.documentElement.dataset.ready = 'true';
