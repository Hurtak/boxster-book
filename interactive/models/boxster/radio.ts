import type * as THREE from 'three';
import { annulus, box, cylinder, group } from '../geometry.ts';

// CDR-30 face and case, fitted to the existing centre-console aperture.
export function radioUnit(
  parent: THREE.Object3D,
  m: { metal: THREE.Material; dark: THREE.Material; black: THREE.Material; blue: THREE.Material },
) {
  const root = group('radio-unit', parent, [0, 0.7, 0.32]);
  root.rotation.x = -0.2;
  root.userData.carPart = true;
  box(root, [0.205, 0.012, 0.175], m.metal, [0, -0.065, 0]);
  box(root, [0.012, 0.13, 0.175], m.metal, [-0.097, 0, 0]);
  box(root, [0.205, 0.13, 0.012], m.metal, [0, 0, 0.083]);
  box(root, [0.215, 0.145, 0.014], m.black, [0, 0, -0.088]);
  box(root, [0.13, 0.066, 0.003], m.blue, [0, 0.012, -0.097]).name = 'monochrome-screen';
  for (const x of [-0.085, 0.085]) {
    cylinder(root, 0.015, 0.012, m.dark, [x, -0.045, -0.101], [Math.PI / 2, 0, 0]);
    cylinder(root, 0.011, 0.013, m.metal, [x, -0.045, -0.104], [Math.PI / 2, 0, 0]);
    for (const y of [-0.016, 0.002, 0.02, 0.038]) box(root, [0.022, 0.009, 0.006], m.dark, [x, y, -0.099]);
  }
  box(root, [0.15, 0.004, 0.005], m.metal, [0, 0.059, -0.098]).name = 'cd-slot';
  box(root, [0.16, 0.006, 0.135], m.dark, [0, 0.016, 0.005]).name = 'single-disc-drive';
  const disc = annulus(root, 0.055, 0.008, 0.002, m.metal, [0, 0.021, 0.008]);
  disc.rotation.set(-Math.PI / 2, 0, 0);
  for (let i = 0; i < 6; i++) box(root, [0.012, 0.014, 0.03], m.dark, [-0.062 + i * 0.025, -0.042, 0.045]);

  return root;
}
