import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { frameBounds, geometryCorners } from '../interactive/three/component-explorer';
import { disposeObject, loadModel } from '../interactive/three/scene';
import { installAssembly } from '../interactive/three/installed-assembly';
import { surfaceAnchor } from '../interactive/three/anchors';
import reference from '../interactive/models/reference-car.glb';
import type { ExplorerConfig } from '../interactive/types';
interface PosterPart {
  number: number;
  name: string;
  label: string;
  x: number;
  y: number;
}
interface PosterResult {
  config: ExplorerConfig;
  parts: PosterPart[];
  installed: number[];
  image: string;
}
declare global {
  interface Window {
    renderPoster: (id: string) => Promise<PosterResult>;
  }
}

interface PosterModel {
  config: ExplorerConfig;
  create: () => THREE.Object3D;
}
export function initializePosterRenderer(models: Record<string, PosterModel>) {
  window.renderPoster = async (id: string): Promise<PosterResult> => {
    const selected = models[id];
    if (!selected) throw new Error(`Unknown poster model: ${id}`);
    const { config, create } = selected;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f2f4f7');
    const model = create();
    scene.add(model);
    let car: THREE.Object3D | undefined, disposeReplaced: (() => void) | undefined;
    if (config.reuseCarParts) {
      car = await loadModel(reference, new AbortController().signal, '');
      disposeReplaced = installAssembly(car, config, model);
    }
    const parts = model.children.filter((p) => p.userData.label);
    const focus = model.getObjectByName(config.focus);
    if (!focus) throw new Error(`Missing poster focus: ${config.focus}`);
    const installed = new THREE.Box3().setFromObject(focus).getCenter(new THREE.Vector3());
    for (const p of parts) p.position.add(new THREE.Vector3(...(p.userData.explode as number[])));
    const camera = new THREE.PerspectiveCamera(36, 1.5, 0.01, 60);
    const direction = new THREE.Vector3(...(config.direction ?? [1.25, 0.85, 1.65])).normalize();
    const pose = frameBounds(new THREE.Box3().setFromObject(model), camera, direction, 1.12, geometryCorners(model));
    camera.position.fromArray(pose.position);
    camera.lookAt(new THREE.Vector3(...pose.target));
    camera.updateMatrixWorld();
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(900, 600);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    const studio = new RoomEnvironment(),
      generator = new THREE.PMREMGenerator(renderer),
      environment = generator.fromScene(studio, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.45;
    studio.dispose();
    generator.dispose();
    scene.add(new THREE.HemisphereLight(0xf7f8ff, 0x7b8584, 0.85));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(-3, 6, 5);
    scene.add(light);
    const rim = new THREE.DirectionalLight(0xffffff, 1.4);
    rim.position.set(3, 3, -4);
    scene.add(rim);
    const centres = parts.map((part, i) => {
      const point = surfaceAnchor(part).project(camera);
      return {
        number: i + 1,
        name: part.name,
        label: String(part.userData.label),
        x: (point.x + 1) * 300,
        y: (1 - point.y) * 200,
      };
    });
    renderer.render(scene, camera);
    const image = renderer.domElement.toDataURL('image/png');
    disposeObject(scene);
    if (car) disposeObject(car);
    disposeReplaced?.();
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    return { config, parts: centres, installed: installed.toArray(), image };
  };
}
