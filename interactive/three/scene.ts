import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, smooth } from '../math';

export const cameraHelp = 'Drag to rotate; Cmd/Ctrl + drag or middle-drag to move the view; pinch or scroll to zoom.';

interface CachedModel {
  size: number;
  promise: Promise<ArrayBuffer>;
}
const bytes = new Map<string | Uint8Array, CachedModel>();
const byteBudget = 32 * 1024 * 1024;
let cachedByteCount = 0;

function modelBytes(source: string | Uint8Array): Promise<ArrayBuffer> {
  const cached = bytes.get(source);
  if (cached) {
    bytes.delete(source);
    bytes.set(source, cached);
    return cached.promise;
  }
  const request =
    typeof source === 'string'
      ? fetch(source).then((response) => {
          if (!response.ok) throw new Error(`Cannot load model: ${response.status}`);
          return response.arrayBuffer();
        })
      : Promise.resolve(new Uint8Array(source).buffer);
  const entry: CachedModel = {
    size: 0,
    promise: request
      .then((buffer) => {
        entry.size = buffer.byteLength;
        cachedByteCount += entry.size;
        for (const [key, cached] of bytes) {
          if (cachedByteCount <= byteBudget) break;
          if (!cached.size) continue;
          bytes.delete(key);
          cachedByteCount -= cached.size;
        }
        return buffer;
      })
      .catch((error: unknown) => {
        bytes.delete(source);
        throw error;
      }),
  };
  bytes.set(source, entry);
  return entry.promise;
}

export function isRenderable(object: THREE.Object3D): object is THREE.Mesh | THREE.Line | THREE.Points {
  return object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points;
}

export function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    if (!isRenderable(object)) return;
    if (object.geometry) geometries.add(object.geometry);
    for (const material of [object.material].flat().filter(Boolean)) materials.add(material);
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => {
    for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
    material.dispose();
  });
}

// Both a bundled Uint8Array (portable HTML) and an asset URL (web edition) work.
// Models must be uncompressed GLBs with their resources embedded in the GLB.
export async function loadModel(source: string | Uint8Array, signal: AbortSignal, base = location.href) {
  if (typeof source === 'string') source = new URL(source, base).href;
  const data = await modelBytes(source);
  signal.throwIfAborted();
  const gltf = await new GLTFLoader().parseAsync(data, '');
  gltf.scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = [object.material].flat();
    for (const surface of materials)
      if (surface.transparent) {
        surface.forceSinglePass = true;
        surface.depthWrite = false;
      }
    object.castShadow = materials.every(
      (surface) => !surface.transparent && !(surface instanceof THREE.MeshPhysicalMaterial && surface.transmission > 0),
    );
    object.receiveShadow = true;
  });
  if (signal.aborted) {
    disposeObject(gltf.scene);
    signal.throwIfAborted();
  }
  return gltf.scene;
}

export function scene3D(
  host: HTMLElement,
  {
    signal,
    onRender = () => {},
    onResize = () => {},
  }: {
    signal: AbortSignal;
    onRender?: (view: { camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer }) => void;
    onResize?: (view: { camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer }) => void;
  },
) {
  host.classList.add('diagram-stage-3d');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f2f4f7');
  const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 60);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
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
  renderer.domElement.setAttribute('aria-label', `3D diagram. ${cameraHelp}`);
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      const figure = host.closest('[data-diagram]');
      figure?.classList.remove('diagram-ready');
      figure?.querySelectorAll<HTMLElement>('.diagram-static').forEach((node) => {
        node.hidden = false;
      });
    },
    { signal },
  );
  host.append(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.enablePan = true;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
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
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let animation:
    | { start: number; update: (amount: number, moveCamera: boolean) => void; moveCamera: boolean }
    | undefined;
  const setAnimating = (active: boolean) => {
    host.dataset.transitioning = String(active);
  };
  const render = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame((now) => {
      if (disposed) return;
      if (animation) {
        const amount = reducedMotion.matches ? 1 : clamp((now - animation.start) / 650);
        animation.update(smooth(amount), animation.moveCamera);
        if (amount === 1) {
          animation = undefined;
          setAnimating(false);
        }
      }
      renderer.render(scene, camera);
      onRender({ camera, renderer });
      frame = 0;
      if (animation) render();
    });
  };
  // A new destination starts at the currently displayed state. Direct gestures
  // take ownership of the camera while the parts finish moving into place.
  const transition = (update: (amount: number, moveCamera: boolean) => void, animate = false) => {
    if (disposed) return;
    animation = undefined;
    setAnimating(animate && !reducedMotion.matches);
    if (animate && !reducedMotion.matches) {
      animation = { start: performance.now(), update, moveCamera: true };
      update(0, true);
    } else update(1, true);
    render();
  };
  controls.addEventListener('start', () => {
    if (animation) animation.moveCamera = false;
  });
  setAnimating(false);
  controls.addEventListener('change', render);
  const resize = new ResizeObserver(() => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    // Preserve room horizontally on a narrow reading column.
    camera.fov = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(18)) * Math.max(1, 1.35 / camera.aspect)),
    );
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    onResize({ camera, renderer });
    render();
  });
  resize.observe(host);
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    animation = undefined;
    setAnimating(false);
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
  return { scene, camera, controls, renderer, render, transition, dispose };
}

export function opacity(root: THREE.Object3D, amount: number) {
  root.traverse((object) => {
    if (!isRenderable(object)) return;
    for (const material of [object.material].flat().filter(Boolean)) {
      material.userData.originalOpacity ??= material.opacity;
      const value = amount * material.userData.originalOpacity;
      if (material.transparent !== value < 1) material.needsUpdate = true;
      material.transparent = value < 1;
      material.opacity = value;
      material.depthWrite = value > 0.5;
    }
    if (object instanceof THREE.Mesh)
      object.castShadow = [object.material]
        .flat()
        .every(
          (surface) =>
            surface.opacity > 0.95 && !(surface instanceof THREE.MeshPhysicalMaterial && surface.transmission > 0),
        );
  });
  root.visible = amount > 0.01;
}
