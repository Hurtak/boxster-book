import * as THREE from 'three';
import { group, material, mesh } from '../models/geometry.ts';

export { annulus, box, cylinder, group, mesh, tube } from '../models/geometry.ts';

// Chapter assemblies use the reference car's axes: +X left, +Y up, +Z front.
export function assembly(name: string) {
  const root = group(name);
  root.userData = { units: 'metres', kind: 'educational component assembly' };
  return root;
}

export function part(
  root: THREE.Object3D,
  name: string,
  label: string,
  position: readonly number[],
  explode: number[],
  description: string,
  anchor?: readonly [number, number, number],
) {
  const object = group(name, root, position);
  object.userData = { label, explode, description, ...(anchor ? { anchor: [...anchor] } : {}) };
  return object;
}

export function materials() {
  return {
    metal: material('#b5c2c7', 0.65, 0.35),
    dark: material('#34443e', 0.35, 0.45),
    black: material('#252c30', 0.05, 0.7),
    green: material('#346557', 0.45, 0.35),
    tan: material('#bd9363', 0.05, 0.8),
    blue: material('#3d7da7', 0.25, 0.45),
    warm: material('#b97c45', 0.45, 0.45),
    red: material('#a44a3b', 0.1, 0.6),
    glass: new THREE.MeshStandardMaterial({
      color: '#b2d0d8',
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  };
}

export function beam(
  parent: THREE.Object3D,
  start: readonly number[],
  end: readonly number[],
  radius: number,
  surface: THREE.Material | THREE.Material[],
) {
  const a = new THREE.Vector3(...start),
    b = new THREE.Vector3(...end);
  const delta = b.clone().sub(a);
  const object = mesh(
    parent,
    new THREE.CylinderGeometry(radius, radius, delta.length(), 16),
    surface,
    a.clone().add(b).multiplyScalar(0.5).toArray(),
  );
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return object;
}

export function sphere(
  parent: THREE.Object3D,
  radius: number,
  surface: THREE.Material | THREE.Material[],
  position: readonly number[],
  scale = [1, 1, 1],
) {
  const object = mesh(parent, new THREE.SphereGeometry(radius, 24, 16), surface, position);
  object.scale.fromArray(scale);
  return object;
}

export function coil(
  parent: THREE.Object3D,
  start: readonly number[],
  end: readonly number[],
  radius: number,
  wire: number,
  surface: THREE.Material | THREE.Material[],
  turns = 7,
) {
  const a = new THREE.Vector3(...start),
    b = new THREE.Vector3(...end);
  const length = a.distanceTo(b);
  const points = Array.from({ length: 161 }, (_, i) => {
    const t = i / 160,
      angle = t * turns * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * radius, t * length, Math.sin(angle) * radius);
  });
  const result = mesh(
    parent,
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 160, wire, 8, false),
    surface,
    start,
  );
  result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
  return result;
}

export function gear(
  parent: THREE.Object3D,
  radius: number,
  width: number,
  surface: THREE.Material | THREE.Material[],
  position: readonly number[] = [0, 0, 0],
  teeth = 18,
) {
  const root = group('gear', parent, position);
  // Gear axis is longitudinal (+Z); teeth explain engagement, not a tooth form.
  mesh(
    root,
    new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, width, 32),
    surface,
    [0, 0, 0],
    [Math.PI / 2, 0, 0],
  );
  for (let i = 0; i < teeth; i++) {
    const angle = (i * Math.PI * 2) / teeth;
    mesh(
      root,
      new THREE.BoxGeometry(radius * 0.22, radius * 0.2, width),
      surface,
      [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
      [0, 0, angle],
    );
  }
  return root;
}
