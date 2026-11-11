import * as THREE from 'three';
import {
  annulus,
  assembly,
  beam,
  box,
  coil,
  cylinder,
  materials,
  mesh,
  part,
  sphere,
  tube,
} from '../../../../interactive/three/component-geometry.ts';
import type { ExplorerConfig } from '../../../../interactive/types';

import { roadWheel } from '../../../../interactive/models/boxster/wheel.ts';

export const config: ExplorerConfig = {
  id: 'suspension-explorer',
  title: 'From the car to the front suspension',
  location:
    'This is the front-left corner of the standard 2010 2.9. The hub sits inside the wheel; the coil-over strut rises to the body above it.',
  overview:
    'The strut, lower arm and fore/aft guide locate the carrier. The steering tie rod turns it. The anti-roll bar connects movement across the axle through its drop links.',
  assembled:
    'Follow the shared joints: carrier to strut and lower arm, guide to lower arm, steering tie rod to carrier, and drop link to strut. The front hub has a retaining bolt, not a driven half-shaft. The translucent wheel exposes these connections.',
  exploded:
    'Separating the groups reveals the spring seats, protective bellows and auxiliary stop around the damper rod, plus the thrust bearing below the body mount. The hub and its speed sensor stay with the carrier group. These offsets do not show a service sequence.',
  focus: 'coilover',
  hideCarParts: ['chassis', 'wheel-fl'],
  ghostParts: ['wheel'],
  direction: [1.8, 0.8, 1.1],
  note: 'Passive front chassis; PASM is optional. Geometry, joint centres, wheel style and fasteners are illustrative. Body-reference pieces are not a removable assembly; no alignment or load values are prescribed.',
  connections: [
    {
      from: 'wheel',
      to: 'carrier',
      label: 'Wheel mounts to the rotating hub; bearing locates it within the carrier',
      kind: 'mechanical',
    },
    {
      from: 'carrier',
      to: 'coilover',
      label: 'Carrier attaches to the structural strut',
      kind: 'structure',
    },
    {
      from: 'coilover',
      to: 'body-mounts',
      label: 'Upper mounting transfers spring and strut loads to the body',
      kind: 'structure',
    },
    {
      from: 'carrier',
      to: 'lower-arm',
      label: 'Outer ball joint connects the carrier to the lower arm',
      kind: 'structure',
    },
    {
      from: 'lower-arm',
      to: 'body-mounts',
      label: 'Inboard bush connects the arm to the front structure',
      kind: 'structure',
    },
    {
      from: 'guide-link',
      to: 'lower-arm',
      label: 'Separate guide constrains fore/aft movement through the lower arm',
      kind: 'structure',
    },
    {
      from: 'guide-link',
      to: 'body-mounts',
      label: 'Guide bush joins the front structure',
      kind: 'structure',
    },
    {
      from: 'steering-link',
      to: 'carrier',
      label: 'Rack movement reaches the carrier through the steering tie rod',
      kind: 'mechanical',
    },
    {
      from: 'steering-link',
      to: 'body-mounts',
      label: 'Rack housing is supported by the front structure',
      kind: 'structure',
    },
    {
      from: 'anti-roll-bar',
      to: 'coilover',
      label: 'Left drop link joins the bar arm to the strut',
      kind: 'mechanical',
    },
    {
      from: 'anti-roll-bar',
      to: 'body-mounts',
      label: 'Body bushes support the bar while allowing rotation',
      kind: 'structure',
    },
  ],
};

function cylinderAlong(
  parent: THREE.Object3D<THREE.Object3DEventMap>,
  position: readonly number[] | undefined,
  radius: number | undefined,
  depth: number | undefined,
  surface: THREE.MeshStandardMaterial,
  direction: number[],
) {
  const result = mesh(parent, new THREE.CylinderGeometry(radius, radius, depth, 32), surface, position);
  result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...direction).normalize());
  return result;
}

function joint(parent: THREE.Object3D, point: number[], m: ReturnType<typeof materials>, radius = 0.023) {
  sphere(parent, radius, m.black, point, [1, 0.8, 1]);
  cylinder(parent, radius * 0.45, radius * 1.7, m.metal, [point[0], point[1] + radius * 0.3, point[2]], [0, 0, 0]);
}

export function createAssembly() {
  const root = assembly('front-left-suspension');
  const m = materials();
  const wheel = part(
    root,
    'wheel',
    'Wheel and tyre',
    [0.76, 0.329, 1.2075],
    [0.43, 0, 0],
    'The wheel bolts to the hub and turns with it. Its tyre transmits road forces. The translucent teaching wheel exposes the suspension; its style and dimensions are not a fitment specification.',
  );
  roadWheel(wheel, 'road-wheel', [0, 0, 0], m.metal);

  const carrier = part(
    root,
    'carrier',
    'Hub and carrier',
    [0.73, 0.329, 1.2075],
    [0.16, -0.08, -0.1],
    'The hub rotates in its bearing, while the carrier follows suspension and steering movement. A central retaining bolt and nut secure the front hub; no driveshaft drives it. The small wheel-speed sensor is fixed to the carrier. Separate ears connect the carrier to the strut, lower-arm ball joint and steering tie rod.',
  );
  annulus(carrier, 0.077, 0.041, 0.055, m.dark, [-0.015, 0, 0]);
  annulus(carrier, 0.057, 0.029, 0.06, m.metal, [0.015, 0, 0]);
  annulus(carrier, 0.044, 0.026, 0.07, m.metal, [0.05, 0, 0]);
  annulus(carrier, 0.091, 0.026, 0.017, m.metal, [0.085, 0, 0]);
  // PET 401-005 items 3/5/6: sensor and front retaining bolt/nut, not a driveshaft.
  cylinder(carrier, 0.013, 0.15, m.metal, [0.012, 0, 0]).name = 'front-hub-retaining-bolt';
  cylinder(carrier, 0.037, 0.012, m.metal, [-0.068, 0, 0]);
  mesh(carrier, new THREE.CylinderGeometry(0.022, 0.022, 0.017, 6), m.dark, [0.096, 0, 0], [0, 0, Math.PI / 2]).name =
    'front-hub-retaining-nut';
  box(carrier, [0.022, 0.027, 0.031], m.black, [-0.053, 0.048, 0.045]).name = 'wheel-speed-sensor';
  tube(
    carrier,
    [
      [-0.053, 0.059, 0.045],
      [-0.065, 0.083, 0.068],
      [-0.08, 0.118, 0.069],
    ],
    0.003,
    m.black,
  ).name = 'wheel-speed-sensor-tail';
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    cylinder(carrier, 0.007, 0.018, m.black, [0.096, Math.cos(a) * 0.065, Math.sin(a) * 0.065]);
  }
  beam(carrier, [-0.035, 0.015, 0], [-0.04, 0.101, 0], 0.031, m.metal);
  cylinder(carrier, 0.045, 0.075, m.metal, [-0.04, 0.101, 0], [0, 0, 0]);
  cylinder(carrier, 0.03, 0.079, m.black, [-0.04, 0.101, 0], [0, 0, 0]);
  beam(carrier, [-0.027, -0.03, 0], [-0.04, -0.089, 0], 0.025, m.metal);
  joint(carrier, [-0.04, -0.089, 0], m);
  beam(carrier, [-0.03, -0.005, -0.025], [-0.08, -0.029, -0.1475], 0.019, m.metal);
  joint(carrier, [-0.08, -0.029, -0.1475], m, 0.017);

  const strut = part(
    root,
    'coilover',
    'Spring and strut',
    [0.69, 0.43, 1.2075],
    [0.14, 0.17, 0.16],
    'The coil spring sits between seats around the hydraulic damper. Protective bellows and a compressible auxiliary stop surround the rod; a thrust bearing below the top mount permits steering rotation. The structural strut also guides the carrier. This shows the passive chassis, with no electronic damping actuator.',
  );
  const axis = [-0.12, 0.29, -0.0575];
  const at = (t: number) => axis.map((v) => v * t);
  beam(strut, at(0), at(0.64), 0.026, m.dark);
  beam(strut, at(0.55), at(1), 0.013, m.metal);
  cylinderAlong(strut, at(0.28), 0.079, 0.013, m.dark, axis).name = 'lower-spring-seat';
  cylinderAlong(strut, at(0.86), 0.077, 0.014, m.dark, axis).name = 'upper-spring-seat';
  coil(strut, at(0.3), at(0.85), 0.064, 0.0065, m.warm, 6);
  // PET 402-000 items 8/9/11: gaiter, auxiliary compression stop, thrust bearing.
  cylinderAlong(strut, at(0.655), 0.025, 0.14, m.black, axis).name = 'protective-bellows';
  for (const t of [0.54, 0.58, 0.62, 0.66, 0.7, 0.74, 0.78]) cylinderAlong(strut, at(t), 0.029, 0.009, m.black, axis);
  cylinderAlong(strut, at(0.82), 0.026, 0.03, m.tan, axis).name = 'auxiliary-compression-stop';
  cylinderAlong(strut, at(0.91), 0.056, 0.016, m.metal, axis).name = 'front-thrust-bearing';
  beam(strut, [-0.03, 0.08, -0.0075], [-0.03, 0.08, -0.03], 0.013, m.metal);

  const body = part(
    root,
    'body-mounts',
    'Body and mountings',
    [0.57, 0.72, 1.15],
    [0, 0.35, -0.18],
    'The top mount connects the strut to the body tower. The front crossmember supports the lower-arm bushes and rack; the separate guide reaches a forward body mounting. Anti-roll-bar bushes also join the front structure. These separated reference pieces locate that common support; their shapes are schematic.',
  );
  cylinder(body, 0.081, 0.028, m.green, [0, 0.025, 0], [0, 0, 0]);
  cylinder(body, 0.052, 0.035, m.black, [0, 0.004, 0], [0, 0, 0]);
  cylinder(body, 0.018, 0.043, m.metal, [0, 0.032, 0], [0, 0, 0]);
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    cylinder(body, 0.006, 0.032, m.metal, [Math.cos(angle) * 0.065, 0.038, Math.sin(angle) * 0.065], [0, 0, 0]);
  }
  box(body, [0.25, 0.025, 0.2], m.green, [0, 0.047, 0]);
  box(body, [0.78, 0.045, 0.09], m.green, [-0.39, -0.46, 0.07]);
  box(body, [0.78, 0.035, 0.08], m.green, [-0.39, -0.44, 0.26]);
  for (const x of [-0.28, -0.86]) box(body, [0.09, 0.07, 0.09], m.green, [x, -0.42, -0.095]);
  box(body, [0.09, 0.07, 0.1], m.green, [-0.34, -0.42, 0.47]);
  for (const x of [-0.22, -0.92]) {
    cylinder(body, 0.03, 0.065, m.black, [x, -0.43, 0.26]);
    box(body, [0.08, 0.02, 0.07], m.metal, [x, -0.46, 0.26]);
  }

  const arm = part(
    root,
    'lower-arm',
    'Lower control arm',
    [0.41, 0.26, 1.22],
    [0.04, -0.22, 0],
    'The lower arm joins the carrier through an outer ball joint and the structure through an inboard bush. A separate guide attaches farther along it to control fore/aft movement.',
  );
  beam(arm, [-0.13, 0, 0], [0.28, -0.02, -0.0125], 0.025, m.metal);
  beam(arm, [-0.09, 0.018, -0.045], [0.23, -0.01, -0.027], 0.018, m.metal);
  beam(arm, [-0.09, 0.018, 0.045], [0.23, -0.01, 0.005], 0.018, m.metal);
  box(arm, [0.23, 0.018, 0.085], m.metal, [0.04, -0.005, 0]);
  const bush = annulus(arm, 0.038, 0.016, 0.065, m.black, [-0.13, 0, 0]);
  bush.rotation.set(0, 0, 0);
  cylinder(arm, 0.016, 0.068, m.metal, [-0.13, 0, 0], [Math.PI / 2, 0, 0]);
  cylinder(arm, 0.031, 0.035, m.black, [0.01, 0.012, 0], [0, 0, 0]);
  joint(arm, [0.28, -0.02, -0.0125], m);

  const guide = part(
    root,
    'guide-link',
    'Fore/aft guide',
    [0.42, 0.26, 1.22],
    [-0.15, -0.1, 0.24],
    'This separate link joins the lower arm to a body mounting ahead of it. It contributes fore/aft location while its joints allow suspension movement; it is not the steering tie rod.',
  );
  beam(guide, [0, 0.012, 0], [-0.19, 0.04, 0.4], 0.024, m.metal);
  beam(guide, [-0.02, 0.012, 0.035], [-0.17, 0.045, 0.35], 0.012, m.metal);
  cylinder(guide, 0.033, 0.075, m.black, [-0.19, 0.04, 0.4]);
  cylinder(guide, 0.016, 0.083, m.metal, [-0.19, 0.04, 0.4]);
  cylinder(guide, 0.024, 0.028, m.metal, [0, 0.012, 0], [0, 0, 0]);

  const steering = part(
    root,
    'steering-link',
    'Steering tie rod',
    [0, 0.3, 1.06],
    [0, -0.05, -0.3],
    'The steering rack moves the tie rod, which turns the carrier through its steering arm. The flexible gaiter protects the inner joint. This steering connection differs from the wheel-guiding lower arm and guide.',
  );
  cylinder(steering, 0.034, 0.55, m.dark, [-0.035, 0.01, 0]);
  cylinder(steering, 0.016, 0.3, m.metal, [0.38, 0, 0]);
  beam(steering, [0.52, 0, 0], [0.65, 0, 0], 0.013, m.metal);
  for (let i = 0; i < 8; i++)
    cylinder(steering, 0.027 - Math.abs(i - 3.5) * 0.002, 0.011, m.black, [0.22 + i * 0.012, 0.01, 0]);
  cylinder(steering, 0.019, 0.026, m.dark, [0.49, 0, 0]);
  joint(steering, [0.65, 0, 0], m, 0.017);

  const bar = part(
    root,
    'anti-roll-bar',
    'Anti-roll bar and link',
    [0, 0.29, 1.41],
    [-0.03, -0.19, 0.27],
    'The transverse bar rotates in body bushes and twists when its ends move differently. The visible left drop link connects its arm to the strut; the opposite suspension connection is outside this single-corner view.',
  );
  tube(
    bar,
    [
      [-0.57, 0, -0.15],
      [-0.5, 0, -0.12],
      [-0.46, 0, 0.01],
      [-0.35, 0, 0],
      [0.35, 0, 0],
      [0.46, 0, 0.01],
      [0.5, 0, -0.12],
      [0.57, 0, -0.15],
    ],
    0.014,
    m.dark,
  );
  beam(bar, [0.57, 0, -0.15], [0.66, 0.22, -0.21], 0.009, m.metal);
  joint(bar, [0.57, 0, -0.15], m, 0.017);
  joint(bar, [0.66, 0.22, -0.21], m, 0.017);
  return root;
}
