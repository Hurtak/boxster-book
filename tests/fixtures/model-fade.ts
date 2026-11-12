import * as THREE from 'three';
import { loadModel, opacity, scene3D } from '../../interactive/three/scene';

const host = document.querySelector<HTMLElement>('#stage')!;
const input = document.querySelector<HTMLInputElement>('input')!;
const controller = new AbortController();
const samples: Uint8ClampedArray[] = [];
let car: THREE.Object3D | undefined;
let amount = 1;
const covers: THREE.Mesh[] = [];
const view = scene3D(host, {
  signal: controller.signal,
  onRender({ camera, renderer }) {
    if (!car) return;
    const canvas = renderer.domElement;
    const bright: number[] = [];
    const difference = covers.map((cover, index) => {
      const box = new THREE.Box3().setFromObject(cover);
      const points = [box.min.x, box.max.x].flatMap((x) =>
        [box.min.y, box.max.y].flatMap((y) =>
          [box.min.z, box.max.z].map((z) => new THREE.Vector3(x, y, z).project(camera)),
        ),
      );
      const left = Math.floor(Math.min(...points.map((p) => ((p.x + 1) * canvas.width) / 2)));
      const top = Math.floor(Math.min(...points.map((p) => ((1 - p.y) * canvas.height) / 2)));
      const width = Math.ceil(Math.max(...points.map((p) => ((p.x + 1) * canvas.width) / 2))) - left;
      const height = Math.ceil(Math.max(...points.map((p) => ((1 - p.y) * canvas.height) / 2))) - top;
      const crop = new OffscreenCanvas(width, height);
      const context = crop.getContext('2d')!;
      context.drawImage(canvas, left, top, width, height, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      samples[index] ??= pixels.slice();
      let error = 0;
      let white = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        for (let channel = 0; channel < 3; channel++)
          error += Math.abs(pixels[i + channel] - samples[index][i + channel]);
        if ((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3 > 200) white++;
      }
      bright.push(white / (width * height));
      return error / (width * height * 3);
    });
    host.dataset.image = canvas.toDataURL();
    host.dataset.difference = JSON.stringify(difference);
    host.dataset.bright = JSON.stringify(bright);
    host.dataset.covers = JSON.stringify(
      covers.map((cover) => {
        const material = cover.material as THREE.MeshPhysicalMaterial;
        return { opacity: material.opacity, transmission: material.transmission };
      }),
    );
    host.dataset.amount = String(amount);
  },
});
async function mount() {
  car = await loadModel(host.dataset.model!, controller.signal);
  for (const side of [-1, 1]) {
    const cover = car.getObjectByName(`headlamp-cover-${side}`);
    if (!(cover instanceof THREE.Mesh)) throw new Error('Missing headlamp cover');
    covers.push(cover);
  }
  view.scene.add(car);
  view.camera.position.set(2.6, 1.7, 4.2);
  view.controls.target.set(0, 0.55, 0.8);
  view.controls.update();
  opacity(car, 1);
  view.render();
  input.oninput = () => {
    amount = Number(input.value) / 1000;
    opacity(car!, amount);
    view.render();
  };
}
void mount();
window.addEventListener('pagehide', () => controller.abort(), { once: true });
