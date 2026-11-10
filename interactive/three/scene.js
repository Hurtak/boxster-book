import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const bytes = new Map();
const byteBudget = 32 * 1024 * 1024;
let cachedByteCount = 0;

function modelBytes(source) {
  if (bytes.has(source)) {
    const entry = bytes.get(source);
    bytes.delete(source);
    bytes.set(source, entry);
    return entry.promise;
  }
  const entry = { size: 0 };
  bytes.set(source, entry);
  const request = typeof source === 'string'
    ? fetch(source).then((response) => {
        if (!response.ok) throw new Error(`Cannot load model: ${response.status}`);
        return response.arrayBuffer();
      })
    : Promise.resolve(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
  entry.promise = request.then((buffer) => {
    entry.size = buffer.byteLength;
    cachedByteCount += entry.size;
    for (const [key, cached] of bytes) {
      if (cachedByteCount <= byteBudget) break;
      if (!cached.size) continue; // A shared request is still in flight.
      bytes.delete(key);
      cachedByteCount -= cached.size;
    }
    return buffer;
  }).catch((error) => { bytes.delete(source); throw error; });
  return entry.promise;
}

export function disposeObject(root) {
  const geometries = new Set();
  const materials = new Set();
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of [object.material].flat().filter(Boolean)) materials.add(material);
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => {
    for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
    material.dispose();
  });
}

// Both a bundled Uint8Array (portable HTML) and an asset URL (web edition) work.
// Models must be uncompressed GLBs with their resources embedded in the GLB.
export async function loadModel(source, signal, base = location.href) {
  if (typeof source === 'string') source = new URL(source, base).href;
  const data = await modelBytes(source);
  signal.throwIfAborted();
  const gltf = await new GLTFLoader().parseAsync(data, '');
  gltf.scene.traverse(object => {
    if (!object.isMesh) return;
    const materials = [object.material].flat();
    for (const surface of materials) if (surface.transparent) {
      surface.forceSinglePass = true;
      surface.depthWrite = false;
    }
    object.castShadow = materials.every(surface => !surface.transparent && !surface.transmission);
    object.receiveShadow = true;
  });
  if (signal.aborted) { disposeObject(gltf.scene); signal.throwIfAborted(); }
  return gltf.scene;
}

export function scene3D(host, { signal, onRender = () => {} }) {
  host.classList.add('diagram-stage-3d');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f2f4f7');
  const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 60);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  const studio = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(studio, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.45;
  studio.dispose();
  generator.dispose();
  renderer.domElement.setAttribute('aria-label', '3D diagram. Drag to rotate; use the controls below to explore.');
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    const figure = host.closest('[data-diagram]');
    figure?.classList.remove('diagram-ready');
    figure?.querySelectorAll('.diagram-static').forEach((node) => { node.hidden = false; });
  }, { signal });
  host.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.enablePan = false;
  controls.minDistance = 0.35;
  controls.maxDistance = 10;
  scene.add(new THREE.HemisphereLight(0xf7f8ff, 0x7b8584, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(-3, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 18 });
  key.shadow.bias = -0.00015;
  key.shadow.normalBias = 0.006;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.4);
  rim.position.set(3, 3, -4);
  scene.add(rim);
  let frame = 0;
  let disposed = false;
  const render = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (disposed) return;
      renderer.render(scene, camera);
      onRender({ camera, renderer });
    });
  };
  controls.addEventListener('change', render);
  const resize = new ResizeObserver(() => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    // Preserve room horizontally on a narrow reading column.
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(18)) * Math.max(1, 1.35 / camera.aspect)));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  });
  resize.observe(host);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    controls.dispose();
    disposeObject(scene);
    environment.dispose();
    key.shadow.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
  signal.addEventListener('abort', dispose, { once: true });
  return { scene, camera, controls, render, dispose };
}

export function opacity(root, amount) {
  root.traverse((object) => {
    for (const material of [object.material].flat().filter(Boolean)) {
      material.userData.originalOpacity ??= material.opacity;
      const value = amount * material.userData.originalOpacity;
      if (material.transparent !== (value < 1)) material.needsUpdate = true;
      material.transparent = value < 1;
      material.opacity = value;
      material.depthWrite = value > 0.5;
    }
    if (object.isMesh) object.castShadow = [object.material].flat().every(surface => surface.opacity > 0.95 && !surface.transmission);
  });
  root.visible = amount > 0.01;
}
