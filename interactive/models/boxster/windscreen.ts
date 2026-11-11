import type * as THREE from 'three';
import { group } from '../geometry.ts';
import type { Palette } from './surfaces';
import { line3, patch } from './surfaces.ts';

// One installed surface for the car, body cutaway and roof's fixed header.
// Metres, car axes. These are photo-guided surfaces, not fitting dimensions.
export function windscreenPoint(u: number, v: number) {
  const t = u * 2 - 1;
  return [t * (0.727 - 0.078 * v), 0.84 + 0.335 * v - 0.02 * t * t, 0.64 - 0.52 * v + 0.06 * t * t];
}

export function windscreenFrame(parent: THREE.Object3D, p: Pick<Palette, 'paint' | 'black'>) {
  const root = group('windscreen-frame', parent);
  root.userData.carPart = true;
  for (const v of [0, 1]) {
    const edge = Array.from({ length: 61 }, (_, i) => windscreenPoint(i / 60, v));
    line3(root, edge, 0.026, p.paint);
    line3(
      root,
      edge.map(([x, y, z]) => [x, y - 0.007, z - 0.004]),
      0.009,
      p.black,
    );
  }
  for (const u of [0, 1]) {
    const edge = Array.from({ length: 41 }, (_, i) => windscreenPoint(u, i / 40));
    line3(root, edge, 0.027, p.paint);
    line3(
      root,
      edge.map(([x, y, z]) => [x + (u === 0 ? 0.009 : -0.009), y, z]),
      0.008,
      p.black,
    );
  }
  return root;
}

export function windscreenGlass(parent: THREE.Object3D, p: { glass: THREE.Material }) {
  return patch(parent, 'curved-windscreen', windscreenPoint, 72, 32, p.glass);
}
