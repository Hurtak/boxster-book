import * as THREE from 'three';
import { group } from '../geometry.ts';
import type { ShellSurface } from './shell';
import type { Palette } from './surfaces';
import { line3, rounded } from './surfaces.ts';

// These photo-guided panel outlines sit on the actual curved shell. Rear-facing
// control points let the luggage lid wrap down between the lamps rather than
// ending in an oval drawn exclusively on the horizontal deck.
export function rearDeck(parent: THREE.Object3D, p: Palette, surface: ShellSurface) {
  const top = (x: number, z: number) => surface.requireHit([x, 1.6, z], [0, -1, 0]).point;
  const back = (x: number, y: number) => surface.requireHit([x, y, -3], [0, 0, 1]).point;
  const outward = new THREE.Vector3(0, 0.65, -0.76).normalize();
  const draw = (name: string, controls: THREE.Vector3[], closed = false) => {
    const path = new THREE.CatmullRomCurve3(controls, closed, 'centripetal');
    const points = path
      .getPoints(320)
      .map((point) =>
        surface.on(point.clone().addScaledVector(outward, 0.5).toArray(), outward.clone().negate().toArray(), 0.0013),
      );
    const seam = line3(parent, points, 0.0017, p.black, closed);
    seam.name = name;
    return seam;
  };
  draw(
    'rear-boot-seam',
    [
      top(-0.63, -0.98),
      top(-0.635, -1.16),
      top(-0.61, -1.5),
      top(-0.57, -1.72),
      back(-0.505, 0.766),
      back(-0.488, 0.732),
      back(-0.46, 0.722),
      back(-0.34, 0.721),
      back(0, 0.721),
      back(0.34, 0.721),
      back(0.46, 0.722),
      back(0.488, 0.732),
      back(0.505, 0.766),
      top(0.57, -1.72),
      top(0.61, -1.5),
      top(0.635, -1.16),
      top(0.63, -0.98),
      top(0.4, -0.962),
      top(0, -0.95),
      top(-0.4, -0.962),
    ],
    true,
  );
  for (const side of [-1, 1])
    draw(`roof-compartment-seam-${side}`, [
      top(side * 0.72, -0.38),
      top(side * 0.74, -0.6),
      top(side * 0.69, -0.86),
      top(side * 0.63, -0.98),
    ]);

  // PET 905-005 item 10 and the rear photographs identify this as the additional
  // brake light, not an engine-air grille. The unlit lens is clear in the photos.
  const hit = surface.requireHit([0, 1.6, -1.045], [0, -1, 0]);
  const lamp = group('high-mounted-stop-lamp', parent, hit.point.clone().addScaledVector(hit.normal, 0.008).toArray());
  lamp.userData.carPart = true;
  lamp.lookAt(lamp.position.clone().add(new THREE.Vector3(0, 0.25, -0.97)));
  rounded(lamp, [0.46, 0.052, 0.014], p.black, [0, 0, 0], 0.018);
  rounded(lamp, [0.423, 0.025, 0.015], p.tailClear, [0, 0, 0.005], 0.009);
  for (let i = 0; i < 18; i++) rounded(lamp, [0.012, 0.013, 0.002], p.silver, [-0.195 + i * 0.023, 0, 0.013], 0.002);
}
