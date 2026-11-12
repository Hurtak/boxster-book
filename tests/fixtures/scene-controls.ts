import * as THREE from 'three';
import { scene3D } from '../../interactive/three/scene';

const host = document.querySelector<HTMLElement>('#stage')!;
const controller = new AbortController();
const view = scene3D(host, {
  signal: controller.signal,
  onRender({ camera }) {
    host.dataset.pose = JSON.stringify({
      position: camera.position.toArray(),
      target: view.controls.target.toArray(),
      orientation: camera.quaternion.toArray(),
    });
  },
});
view.scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()));
view.camera.position.set(3, 2, 5);
view.controls.update();
view.render();
window.addEventListener('pagehide', () => controller.abort(), { once: true });
