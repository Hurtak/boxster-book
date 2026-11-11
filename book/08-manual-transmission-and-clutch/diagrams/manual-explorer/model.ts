import * as THREE from 'three';
import {
  annulus,
  assembly,
  beam,
  box,
  coil,
  cylinder,
  gear,
  group,
  materials,
  part,
  sphere,
  tube,
} from '../../../../interactive/three/component-geometry.ts';
import type { ExplorerConfig } from '../../../../interactive/types';

import { manualGearLever } from '../../../../interactive/models/boxster/cabin.ts';
import { palette } from '../../../../interactive/models/boxster/surfaces.ts';

export const config: ExplorerConfig = {
  id: 'manual-explorer',
  title: 'From the car to the manual gearbox',
  location:
    'The standard six-speed manual sits behind the 2010 2.9 engine. Its clutch faces the engine; the final drive sends torque sideways to the rear wheels.',
  overview:
    'Follow engine torque through the flywheel, single dry clutch and gearbox. Pedal, master cylinder and hydraulic line command a separate slave/lever release; the cabin lever selects gears through two cables.',
  assembled:
    'The clutch and gearbox input share a longitudinal axis. The final drive belongs to the same transaxle and connects to the rear half-shafts. The open housing exposes representative gear pairs.',
  exploded:
    'Separation reveals one driven plate, pressure assembly, bearing/guide sleeve and the pedal-to-slave circuit. The synchroniser is lifted from one example gear path; offsets are not working travel or dismantling order.',
  focus: 'clutch',
  hideCarParts: ['gearbox', 'chassis', 'gear-lever'],
  direction: [1.3, 0.9, -1.6],
  note: 'G87/10 concept checked against PET 102-000, 301-000/005, 302-000/005, 501-005, 701-000 and 702-000/008. Two pairs are not a six-ratio shaft plan. Geometry/routing and the LHD pedal location are illustrative; UK/RHD feed pipes differ. No S-model X-Tend is assigned.',
  connections: [
    {
      from: 'engine-interface',
      to: 'flywheel',
      label: 'Crankshaft drives the engine-side flywheel mass',
      kind: 'mechanical',
    },
    {
      from: 'flywheel',
      to: 'clutch',
      label: 'Flywheel face and pressure plate clamp one driven disc',
      kind: 'mechanical',
    },
    {
      from: 'clutch',
      to: 'geartrain',
      label: 'Disc hub transmits torque to the input shaft',
      kind: 'mechanical',
    },
    {
      from: 'pedal-hydraulics',
      to: 'release',
      label: 'Pedal-driven master sends fluid pressure to the separate slave',
      kind: 'fluid',
    },
    {
      from: 'release',
      to: 'clutch',
      label: 'Slave, lever and bearing relieve the diaphragm clamp',
      kind: 'mechanical',
    },
    {
      from: 'selector',
      to: 'synchroniser',
      label: 'Two cables command selector and fork movement',
      kind: 'mechanical',
    },
    {
      from: 'synchroniser',
      to: 'geartrain',
      label: 'Sleeve locks a selected gear to its shaft after speed matching',
      kind: 'mechanical',
    },
    {
      from: 'geartrain',
      to: 'final-drive',
      label: 'Selected drive reaches final reduction and differential',
      kind: 'mechanical',
    },
  ],
};

// Axial stack along Z. The generic section is deliberately open for inspection.
const zAxis = [Math.PI / 2, 0, 0];
function axialRing(
  parent: THREE.Object3D<THREE.Object3DEventMap>,
  outer: number,
  inner: number,
  depth: number,
  material: THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[],
  z = 0,
) {
  const result = annulus(parent, outer, inner, depth, material, [0, 0, z]);
  result.rotation.set(0, 0, 0);
  return result;
}

export function createAssembly() {
  const root = assembly('manual-transaxle');
  const m = materials();
  const engine = part(
    root,
    'engine-interface',
    'Engine interface',
    [0, 0.47, -1.03],
    [0, 0, 0.31],
    'The rear crankshaft flange drives the flywheel. This small engine-end section locates the connection; the flat-six itself is explained in the engine chapter.',
  );
  cylinder(engine, 0.075, 0.115, m.metal, [0, 0, 0.045], zAxis);
  cylinder(engine, 0.112, 0.018, m.dark, [0, 0, -0.016], zAxis);
  for (const a of [0, 1, 2, 3, 4, 5]) {
    const angle = (a * Math.PI) / 3;
    cylinder(engine, 0.008, 0.02, m.metal, [Math.cos(angle) * 0.087, Math.sin(angle) * 0.087, -0.029], zAxis);
  }

  const flywheel = part(
    root,
    'flywheel',
    'Dual-mass flywheel',
    [0, 0.47, -1.14],
    [0, 0.2, 0.2],
    'Engine-side and clutch-side masses remain connected through torsional springs. Their relative movement is angular; the displayed separation only exposes the concept.',
  );
  axialRing(flywheel, 0.145, 0.039, 0.024, m.dark, 0.017);
  axialRing(flywheel, 0.131, 0.04, 0.018, m.metal, -0.014);
  axialRing(flywheel, 0.039, 0.016, 0.076, m.metal, 0.046);
  const starterRing = gear(flywheel, 0.142, 0.014, m.metal, [0, 0, 0.025], 40);
  starterRing.name = 'starter-ring-concept';
  for (const side of [-1, 1]) {
    coil(flywheel, [-0.065, side * 0.078, 0.001], [0.065, side * 0.078, 0.001], 0.012, 0.004, m.warm, 9);
  }

  const clutch = part(
    root,
    'clutch',
    'Dry clutch',
    [0, 0.47, -1.1855],
    [0, 0.4, -0.04],
    'One driven plate has friction lining on both faces. The pressure plate clamps it against the flywheel; its central splined hub drives the gearbox input.',
  );
  axialRing(clutch, 0.115, 0.045, 0.009, m.dark, 0.015);
  axialRing(clutch, 0.113, 0.066, 0.003, m.warm, 0.021);
  axialRing(clutch, 0.113, 0.066, 0.003, m.warm, 0.009);
  axialRing(clutch, 0.032, 0.018, 0.028, m.metal, 0.015);
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    box(
      clutch,
      [0.012, 0.005, 0.022],
      m.metal,
      [Math.cos(angle) * 0.025, Math.sin(angle) * 0.025, 0.015],
      [0, 0, angle],
    );
  }
  axialRing(clutch, 0.12, 0.052, 0.018, m.metal, -0.0015);
  axialRing(clutch, 0.127, 0.116, 0.044, m.green, -0.022);
  // Spokes stand for the diaphragm fingers, not a factory finger/bolt count.
  for (let i = 0; i < 14; i++) {
    const angle = (i * Math.PI * 2) / 14;
    beam(
      clutch,
      [Math.cos(angle) * 0.038, Math.sin(angle) * 0.038, -0.045],
      [Math.cos(angle) * 0.095, Math.sin(angle) * 0.095, -0.027],
      0.005,
      m.dark,
    );
  }

  const release = part(
    root,
    'release',
    'Clutch release',
    [0, 0.47, -1.245],
    [0.42, 0.14, 0.01],
    'A separate slave pushes the pivoted lever. The release bearing slides on a guide sleeve around the input shaft and acts on the diaphragm; it relieves spring clamping force. PET 301-000 items 3–5 and 10; 301-005 item 1.',
  );
  axialRing(release, 0.042, 0.021, 0.027, m.metal);
  // The stationary sleeve fits inside the sliding bearing, clear of the shaft.
  axialRing(release, 0.0205, 0.0185, 0.075, m.dark, -0.021);
  for (const y of [-0.036, 0.036]) beam(release, [0.026, y, -0.003], [0.145, y * 0.4, -0.025], 0.009, m.green);
  beam(release, [0.145, -0.018, -0.025], [0.145, 0.075, -0.085], 0.012, m.green);
  sphere(release, 0.016, m.metal, [0.145, -0.018, -0.025]);
  cylinder(release, 0.025, 0.1, m.metal, [0.145, 0.075, -0.16], zAxis);
  beam(release, [0.145, 0.075, -0.11], [0.145, 0.075, -0.085], 0.009, m.metal);
  tube(
    release,
    [
      [0.145, 0.075, -0.2],
      [0.17, 0.12, -0.18],
      [0.18, 0.16, -0.11],
    ],
    0.009,
    m.blue,
  );

  const pedal = part(
    root,
    'pedal-hydraulics',
    'Pedal and master',
    [0.48, 0.43, 0.52],
    [0.18, 0.34, 0.1],
    'The pedal drives the master cylinder; a separate feed supplies brake-reservoir fluid and a pressure line reaches the slave. The pedal also has an assist spring. PET 702-000/008; LHD position and pipe paths are illustrative.',
  );
  beam(pedal, [0, 0.13, 0.08], [0, -0.12, -0.025], 0.012, m.metal);
  cylinder(pedal, 0.018, 0.08, m.dark, [0, 0.13, 0.08]);
  box(pedal, [0.07, 0.055, 0.018], m.black, [0, -0.12, -0.025], [-0.25, 0, 0]);
  beam(pedal, [0, 0.085, 0.06], [0, 0.1, 0.1], 0.006, m.metal);
  cylinder(pedal, 0.023, 0.12, m.metal, [0, 0.1, 0.16], zAxis);
  box(pedal, [0.08, 0.06, 0.1], m.glass, [0, 0.29, 0.16]);
  cylinder(pedal, 0.019, 0.015, m.dark, [0, 0.3275, 0.16], [0, 0, 0]);
  tube(
    pedal,
    [
      [0, 0.26, 0.16],
      [0.025, 0.21, 0.15],
      [0.025, 0.12, 0.14],
    ],
    0.007,
    m.blue,
  );
  coil(pedal, [0.045, 0.14, 0.07], [0.045, 0.065, 0.015], 0.014, 0.003, m.warm, 7);
  box(pedal, [0.06, 0.025, 0.08], m.green, [0.015, 0.145, 0.07]);
  tube(
    pedal,
    [
      [0, 0.1, 0.22],
      [-0.06, -0.1, 0.1],
      [-0.28, -0.13, -0.4],
      [-0.3, -0.13, -1.6],
      [-0.3, 0.2, -1.875],
    ],
    0.007,
    m.blue,
  );

  const transmission = part(
    root,
    'geartrain',
    'Gearbox and input',
    [0, 0.47, -1.55],
    [0, -0.08, -0.25],
    'Two representative constant-mesh pairs show an input and a selected output path. They do not reproduce all six ratios, reverse, or the real G87/10 shaft and bearing layout.',
  );
  beam(transmission, [0, 0, 0.39], [0, 0, -0.235], 0.018, m.metal);
  beam(transmission, [0.17, 0, 0.19], [0.17, 0, -0.235], 0.021, m.metal);
  for (const [z, a, b] of [
    [0.09, 0.065, 0.105],
    [-0.09, 0.095, 0.075],
  ] as const) {
    gear(transmission, a, 0.035, m.metal, [0, 0, z]);
    gear(transmission, b, 0.035, m.warm, [0.17, 0, z]);
  }
  box(transmission, [0.43, 0.025, 0.5], m.green, [0.065, -0.125, -0.015]);
  for (const x of [-0.15, 0.28]) {
    box(transmission, [0.025, 0.105, 0.5], m.metal, [x, -0.085, -0.015]);
    for (const z of [-0.2, -0.1, 0, 0.1, 0.2]) box(transmission, [0.04, 0.13, 0.012], m.green, [x, -0.08, z]);
  }
  const housingFront = group('open-bellhousing', transmission, [0, 0.035, 0.275]);
  for (const side of [-1, 1])
    beam(housingFront, [side * 0.145, -0.085, 0.03], [side * 0.12, -0.1, -0.09], 0.018, m.metal);
  beam(housingFront, [-0.145, -0.085, 0.03], [0.145, -0.085, 0.03], 0.016, m.metal);

  const synchroniser = part(
    root,
    'synchroniser',
    'Synchroniser and fork',
    [0.17, 0.47, -1.55],
    [0.35, 0.32, -0.17],
    'A shaft-linked hub carries a sliding sleeve. Cone friction matches speed before dog teeth lock the selected gear; the fork moves the sleeve, not the working gear pair out of mesh.',
  );
  axialRing(synchroniser, 0.052, 0.021, 0.025, m.dark);
  axialRing(synchroniser, 0.061, 0.047, 0.031, m.blue);
  axialRing(synchroniser, 0.057, 0.026, 0.012, m.warm, 0.033);
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    box(
      synchroniser,
      [0.012, 0.008, 0.02],
      m.metal,
      [Math.cos(angle) * 0.049, Math.sin(angle) * 0.049, 0.043],
      [0, 0, angle],
    );
  }
  for (const side of [-1, 1])
    beam(synchroniser, [side * 0.055, 0.005, -0.002], [side * 0.055, 0.085, -0.002], 0.007, m.green);
  beam(synchroniser, [-0.055, 0.085, -0.002], [0.055, 0.085, -0.002], 0.009, m.green);
  beam(synchroniser, [0, 0.085, -0.15], [0, 0.085, 0.15], 0.009, m.metal);

  const selector = part(
    root,
    'selector',
    'Lever and cables',
    [0, 0, 0],
    [0, 0.25, 0.18],
    'The cabin lever sends cross-gate and fore-and-aft commands through two cables to the gearbox selector. Brackets retain the cable housings; the inner cables move. PET 701-000 items 1, 3, 25–26; routes and joints are schematic.',
  );
  manualGearLever(selector, palette());
  sphere(selector, 0.024, m.metal, [0, 0.57, -0.015]);
  for (const x of [-0.034, 0.034]) {
    tube(
      selector,
      [
        [x, 0.56, -0.075],
        [x, 0.37, -0.18],
        [x + 0.03, 0.34, -0.78],
        [0.17 + x, 0.555, -1.53],
      ],
      0.008,
      m.black,
    );
    cylinder(selector, 0.014, 0.055, m.metal, [0.17 + x, 0.555, -1.53], zAxis);
    box(selector, [0.036, 0.012, 0.045], m.green, [0.17 + x, 0.537, -1.53]);
  }

  const final = part(
    root,
    'final-drive',
    'Final drive and shafts',
    [0, 0.329, -1.2075],
    [0, -0.23, -0.13],
    'The transaxle final drive turns longitudinal input into drive for the rear differential and half-shafts. The two shafts reach rotating hubs; their articulated joints accommodate suspension movement.',
  );
  cylinder(final, 0.082, 0.24, m.dark);
  const ring = gear(final, 0.115, 0.027, m.metal, [0.105, 0, 0], 28);
  ring.rotation.y = Math.PI / 2;
  for (const side of [-1, 1]) {
    beam(final, [side * 0.12, 0, 0], [side * 0.74, 0, 0], 0.019, m.metal);
    for (const x of [0.2, 0.65]) {
      sphere(final, 0.044, m.dark, [side * x, 0, 0], [1.35, 1, 1]);
      for (let j = 0; j < 4; j++)
        cylinder(final, 0.04 - j * 0.003, 0.012, m.black, [side * (x + (j - 1.5) * 0.011), 0, 0]);
    }
    cylinder(final, 0.075, 0.035, m.metal, [side * 0.76, 0, 0]);
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      cylinder(final, 0.006, 0.012, m.dark, [side * 0.783, Math.cos(angle) * 0.049, Math.sin(angle) * 0.049]);
    }
  }
  return root;
}
