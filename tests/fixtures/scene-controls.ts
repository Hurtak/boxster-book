import * as THREE from 'three';
import { scene3D } from '../../interactive/three/scene';

const host = document.querySelector<HTMLElement>('#stage')!;
const controller = new AbortController();
const view = scene3D(host, {
  signal: controller.signal,
  onRender({ camera }) {
    host.dataset.frames = String(Number(host.dataset.frames ?? 0) + 1);
    host.dataset.pose = JSON.stringify({
      position: camera.position.toArray(),
      target: view.controls.target.toArray(),
      orientation: camera.quaternion.toArray(),
    });
  },
});
const subject = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
view.scene.add(subject);
view.camera.position.set(3, 2, 5);
view.controls.update();
view.render();
let progress = 0;
for (const [label, destination] of [
  ['Near', 1],
  ['Far', 0],
] as const) {
  const button = document.createElement('button');
  button.textContent = label;
  button.onclick = () => {
    const start = view.camera.position.clone();
    const startTarget = view.controls.target.clone();
    const startProgress = progress;
    const position = new THREE.Vector3(...(destination ? [1, 1, 2] : [3, 2, 5]));
    view.transition((amount, moveCamera) => {
      progress = THREE.MathUtils.lerp(startProgress, destination, amount);
      subject.position.y = progress;
      host.dataset.progress = String(progress);
      if (moveCamera) {
        view.camera.position.copy(start).lerp(position, amount);
        view.controls.target.copy(startTarget).lerp(new THREE.Vector3(0, destination, 0), amount);
        view.controls.update();
      }
    }, true);
  };
  host.after(button);
}
const dispose = document.createElement('button');
dispose.textContent = 'Dispose';
dispose.onclick = () => controller.abort();
host.after(dispose);
window.addEventListener('pagehide', () => controller.abort(), { once: true });
