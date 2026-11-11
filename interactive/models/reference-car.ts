import * as THREE from 'three';
import { exterior } from './boxster/body.ts';
import { cabin, windscreen } from './boxster/cabin.ts';
import { palette } from './boxster/surfaces.ts';
import { box, cylinder, group, material, tube, wheel } from './geometry.ts';

// Original photo-guided mesh. Metres; +Z is the front, +Y up, so +X is the car's
// left: the driver's side of this left-hand-drive car.
export function referenceCar() {
  const car = group('reference-car');
  car.userData = {
    units: 'metres',
    kind: 'photo-guided educational model',
    reference: '2010 Boxster 2.9',
    paint: 'deep metallic green',
    interior: 'tan',
    revision: 4,
  };
  const p = palette();
  const body = exterior(car, p);
  windscreen(body, p);
  cabin(car, p);
  const chassis = group('chassis', car);
  box(chassis, [1.28, 0.055, 3.32], p.black, [0, 0.245, 0]);
  for (const z of [-1.2075, 1.2075]) {
    box(chassis, [1.42, 0.045, 0.08], p.silver, [0, 0.31, z]);
    for (const side of [-1, 1]) {
      const hub = group(`brake-${z > 0 ? 'f' : 'r'}${side > 0 ? 'l' : 'r'}`, chassis, [side * 0.76, 0.329, z]);
      hub.userData.carPart = true;
      cylinder(hub, z > 0 ? 0.159 : 0.1495, z > 0 ? 0.028 : 0.024, p.silver);
      box(hub, [0.065, 0.14, 0.055], p.black, [0, 0, 0.13]);
      tube(
        chassis,
        [
          [side * 0.3, 0.28, z - 0.16],
          [side * 0.52, 0.25, z - 0.11],
          [side * 0.73, 0.32, z],
        ],
        0.015,
        p.silver,
      );
      tube(
        chassis,
        [
          [side * 0.65, 0.33, z],
          [side * 0.57, 0.67, z - 0.06],
        ],
        0.022,
        p.black,
      );
    }
  }
  for (const [name, x, z] of [
    ['wheel-fl', 0.76, 1.2075],
    ['wheel-fr', -0.76, 1.2075],
    ['wheel-rl', 0.76, -1.2075],
    ['wheel-rr', -0.76, -1.2075],
  ] as const) {
    const result = wheel(car, name, [x, 0.329, z], p.silver);
    if (x < 0) result.rotation.y = Math.PI;
  }
  const engine = group('engine', car, [0, 0.52, -0.86]);
  box(engine, [0.62, 0.25, 0.62], p.silver);
  for (const side of [-1, 1])
    for (let i = 0; i < 3; i++) cylinder(engine, 0.075, 0.22, p.silver, [side * 0.36, 0, -0.2 + i * 0.2]);
  const gearbox = group('gearbox', car, [0, 0.4, -1.48]);
  cylinder(gearbox, 0.13, 0.55, p.silver, [0, 0, 0], [Math.PI / 2, 0, 0]);
  const lines = group('hydraulics', car),
    blue = material('#1d5fbf', 0.1, 0.4);
  const master = group('master-cylinder', lines, [0.28, 0.59, 0.75]);
  cylinder(master, 0.045, 0.25, blue, [0, 0, 0], [Math.PI / 2, 0, 0]);
  box(master, [0.11, 0.08, 0.12], material('#e5e9e9'), [0, 0.08, 0]);
  for (const x of [-0.76, 0.76])
    for (const z of [-1.2075, 1.2075])
      tube(
        lines,
        [
          [0.28, 0.59, 0.75],
          [0.12, 0.35, 0.55],
          [0.12, 0.3, z],
          [x, 0.33, z],
        ],
        0.009,
        blue,
      );
  // The book fades complete subsystems independently. Do not share their materials.
  for (const subsystem of car.children) {
    const clones = new Map();
    subsystem.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const clone = (surface: THREE.Material) => {
        if (!clones.has(surface)) clones.set(surface, surface.clone());
        return clones.get(surface);
      };
      object.material = Array.isArray(object.material) ? object.material.map(clone) : clone(object.material);
    });
  }
  return car;
}
