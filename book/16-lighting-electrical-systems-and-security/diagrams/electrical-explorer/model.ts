import * as THREE from 'three';
import {
  annulus,
  assembly,
  beam,
  box,
  cylinder,
  gear,
  materials,
  mesh,
  part,
  sphere,
  tube,
} from '../../../../interactive/three/component-geometry.ts';
import type { ExplorerConfig } from '../../../../interactive/types';

export const config: ExplorerConfig = {
  id: 'electrical-explorer',
  title: 'From the car to its electrics',
  location:
    'The battery is under a cover in the front luggage area. The starter and alternator are on the engine behind the seats; positive cables and body/engine earth connections bridge that distance.',
  overview:
    'Follow starting power from the front battery to the rear starter, charging power from the alternator, a protected lamp branch, and the earth return. Driver requests and starting authorisation have a separate control role.',
  assembled:
    'The starter pinion engages the flywheel drive for cranking. The running engine drives the alternator by belt. The lamp branch has circuit protection; its return connection is as necessary as its feed.',
  exploded:
    'The separated groups expose terminals, the starter drive, alternator windings and pulley, lamp reflector and protected branch. Offsets and cutaways explain relationships, not a removal or electrical testing procedure.',
  focus: 'battery',
  hideCarParts: [],
  reuseCarParts: {
    headlamp: [
      'headlamp-1',
      'headlamp-cover-1',
      'headlamp-cover-1-walls',
      'headlamp-cover-1-floor',
      'front-lamp-1',
      'front-lamp-1-walls',
      'lower-light-details-1',
    ],
  },
  finishInstallation(model) {
    const m = materials(),
      lamp = model.getObjectByName('headlamp')!;
    for (const name of ['projector-1', 'high-beam-reflector-1']) {
      const optic = lamp.getObjectByName(name)!;
      cylinder(optic, 0.011, 0.035, m.black, [0, 0, -0.045], [Math.PI / 2, 0, 0]);
      sphere(optic, 0.015, m.glass, [0, 0, -0.02], [0.7, 0.7, 1.3]);
      tube(
        optic,
        [
          [-0.003, 0, -0.006],
          [0, 0.003, -0.004],
          [0.003, 0, -0.006],
        ],
        0.0012,
        m.warm,
      );
    }
  },
  direction: [1.15, 0.9, 1.65],
  note: 'Standard halogen, left-hand-drive layout. UK right-hand-drive controls, fuse carrier and cables differ. Harness routes, distributor mounting, fuse count and lamp/internal geometry are illustrative; no pinouts or ratings are supplied.',
  connections: [
    {
      from: 'battery',
      to: 'positive-feed',
      label: 'Positive terminal supplies the high-current feed',
      kind: 'electrical',
    },
    {
      from: 'positive-feed',
      to: 'starter-drive',
      label: 'High-current branch supplies the starter for cranking',
      kind: 'electrical',
    },
    {
      from: 'alternator-drive',
      to: 'positive-feed',
      label: 'Generated DC supplies loads and can recharge the battery',
      kind: 'electrical',
    },
    {
      from: 'positive-feed',
      to: 'distribution',
      label: 'Supply branches to circuit protection',
      kind: 'electrical',
    },
    {
      from: 'distribution',
      to: 'headlamp',
      label: 'Protected branch supplies the lighting load',
      kind: 'electrical',
    },
    {
      from: 'headlamp',
      to: 'earth-return',
      label: 'Lamp current returns through earth connections',
      kind: 'electrical',
    },
    {
      from: 'starter-drive',
      to: 'earth-return',
      label: 'Starter case and engine connect to the return network',
      kind: 'electrical',
    },
    {
      from: 'alternator-drive',
      to: 'earth-return',
      label: 'Alternator case shares the engine earth connection',
      kind: 'electrical',
    },
    {
      from: 'earth-return',
      to: 'battery',
      label: 'Return network connects to battery negative',
      kind: 'electrical',
    },
    {
      from: 'request-controls',
      to: 'starter-drive',
      label: 'Authorised starting request controls cranking',
      kind: 'signal',
    },
    {
      from: 'request-controls',
      to: 'headlamp',
      label: 'Lighting request is distinct from the lamp power path',
      kind: 'signal',
    },
    {
      from: 'distribution',
      to: 'request-controls',
      label: 'Control functions also need a power supply',
      kind: 'electrical',
    },
  ],
};

const longitudinal = [Math.PI / 2, 0, 0];

function ringZ(
  parent: THREE.Object3D<THREE.Object3DEventMap>,
  outer: number,
  inner: number,
  depth: number,
  surface: THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[],
  position?: readonly number[],
) {
  const ring = annulus(parent, outer, inner, depth, surface, position);
  ring.rotation.set(0, 0, 0);
  return ring;
}

function lug(
  parent: THREE.Group<THREE.Object3DEventMap>,
  position: readonly number[],
  surface: THREE.MeshStandardMaterial,
) {
  ringZ(parent, 0.019, 0.009, 0.008, surface, position);
}

function winding(
  parent: THREE.Object3D<THREE.Object3DEventMap>,
  radius: number,
  y: number,
  length: number,
  surface: THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[],
) {
  const points = Array.from({ length: 81 }, (_, i) => {
    const t = i / 80,
      angle = t * Math.PI * 12;
    return [Math.cos(angle) * radius, y + Math.sin(angle) * radius, (t - 0.5) * length];
  });
  tube(parent, points, 0.0025, surface);
}

export function createAssembly() {
  const root = assembly('electrical-systems');
  const m = materials();
  const battery = part(
    root,
    'battery',
    'Battery and cover',
    [0, 0.66, 1.1],
    [0, 0.32, 0.2],
    'The front battery stores energy and supplies cranking power. Its positive and negative terminals connect to different sides of the circuit. The cover is cut back here to expose those connections.',
  );
  box(battery, [0.31, 0.19, 0.18], m.black);
  box(battery, [0.325, 0.025, 0.195], m.dark, [0, 0.105, 0]);
  for (const side of [-1, 1]) {
    cylinder(battery, 0.014, 0.025, m.metal, [side * 0.115, 0.13, 0.045], [0, 0, 0]);
    box(battery, [0.047, 0.025, 0.04], side > 0 ? m.red : m.black, [side * 0.115, 0.12, 0.045]);
    box(battery, [0.018, 0.018, 0.025], m.metal, [side * 0.115, 0.142, 0.042]);
  }
  // A partial cover and side flanges retain the under-cover location.
  box(battery, [0.36, 0.022, 0.08], m.black, [0, 0.17, -0.08]);
  for (const x of [-0.175, 0.175]) box(battery, [0.015, 0.07, 0.23], m.dark, [x, 0.14, 0]);
  box(battery, [0.18, 0.008, 0.06], m.metal, [0, -0.098, 0]);
  for (const x of [-0.13, 0.13]) beam(battery, [x, -0.1, -0.075], [x, -0.1, 0.075], 0.006, m.metal);

  const positive = part(
    root,
    'positive-feed',
    'Positive feed and distributor',
    [0, 0.3, 0],
    [-0.3, -0.08, 0],
    'Battery positive feeds a power distributor with fuse elements, distinct from the footwell fuse carrier. A long cable reaches the covered engine connection point and starter/alternator wire set. Distributor position, link count and cable route are schematic.',
    [0.16, 0.24, 0.963],
  );
  tube(
    positive,
    [
      [0.115, 0.5, 1.145],
      [0.16, 0.24, 0.9],
      [0.18, 0.015, 0.55],
      [0.18, 0.015, -0.55],
      [0.13, 0.18, -0.95],
    ],
    0.011,
    m.red,
  );
  tube(
    positive,
    [
      [0.13, 0.18, -0.95],
      [0.16, 0.23, -1.05],
      [0.185, 0.215, -1.05],
    ],
    0.01,
    m.red,
  );
  tube(
    positive,
    [
      [0.13, 0.18, -0.95],
      [0.16, 0.21, -0.7],
      [0.12, 0.35, -0.55],
    ],
    0.009,
    m.red,
  );
  for (const p of [
    [0.115, 0.5, 1.145],
    [0.13, 0.18, -0.95],
  ] as const) {
    lug(positive, p, m.metal);
    box(positive, [0.05, 0.04, 0.035], m.red, [p[0], p[1] - 0.025, p[2]]);
  }
  for (const z of [-0.55, 0, 0.55]) ringZ(positive, 0.017, 0.012, 0.012, m.black, [0.18, 0.015, z]);
  // PET 902-005 identifies the distributor/fuse links, not their exact mounting coordinates.
  box(positive, [0.13, 0.15, 0.045], m.black, [0.16, 0.24, 0.9]);
  box(positive, [0.11, 0.11, 0.015], m.dark, [0.16, 0.24, 0.928]);
  for (const y of [0.21, 0.25, 0.29]) {
    box(positive, [0.067, 0.014, 0.009], m.warm, [0.16, y, 0.941]);
    for (const x of [0.12, 0.2]) cylinder(positive, 0.006, 0.014, m.metal, [x, y, 0.946], longitudinal);
  }
  box(positive, [0.12, 0.075, 0.01], m.blue, [0.16, 0.218, 0.958]);
  box(positive, [0.065, 0.012, 0.055], m.metal, [0.13, 0.145, -0.95]);
  cylinder(positive, 0.008, 0.03, m.warm, [0.13, 0.18, -0.95]);

  const distribution = part(
    root,
    'distribution',
    'Protection and distribution',
    [0.57, 0.44, 0.62],
    [0.28, 0.17, 0.15],
    'The driver-footwell fuse panel protects individual circuits. This small set of coloured fuse shapes illustrates protected branches, not the actual fuse count, assignments or ratings. The starter feed is shown separately.',
  );
  box(distribution, [0.15, 0.2, 0.035], m.black);
  box(distribution, [0.13, 0.18, 0.012], m.dark, [0, 0, 0.025]);
  for (let i = 0; i < 6; i++) {
    const x = ((i % 3) - 1) * 0.037,
      y = (Math.floor(i / 3) - 0.5) * 0.065;
    box(distribution, [0.025, 0.036, 0.022], i % 2 ? m.blue : m.warm, [x, y, 0.045]);
    for (const dx of [-0.006, 0.006]) box(distribution, [0.004, 0.012, 0.01], m.metal, [x + dx, y - 0.025, 0.04]);
  }
  for (const side of [-1, 1])
    tube(
      distribution,
      [
        [side * 0.05, -0.1, 0.01],
        [side * 0.06, -0.15, 0.01],
        [side * 0.09, -0.18, 0],
      ],
      0.006,
      side > 0 ? m.red : m.black,
    );

  const earth = part(
    root,
    'earth-return',
    'Body and engine earth',
    [0, 0.27, 0],
    [0.3, -0.1, 0],
    'Battery negative connects to the body, and a separate earth strap joins the engine to the body. Conductive joints complete return paths. The visible rails stand for body continuity, not dedicated return cables running their full length.',
  );
  for (const x of [-0.54, 0.54]) beam(earth, [x, 0, -1.2], [x, 0, 1.15], 0.014, m.metal);
  beam(earth, [-0.54, 0, 0.7], [0.54, 0, 0.7], 0.014, m.metal);
  beam(earth, [-0.54, 0, -0.9], [0.54, 0, -0.9], 0.014, m.metal);
  tube(
    earth,
    [
      [-0.115, 0.53, 1.145],
      [-0.21, 0.33, 1.09],
      [-0.38, 0.05, 1.07],
      [-0.54, 0, 1.07],
    ],
    0.012,
    m.black,
  );
  // Parallel strands suggest a flexible bonding strap, not a harness pinout.
  for (const dy of [-0.006, 0, 0.006])
    tube(
      earth,
      [
        [0.54, dy, -0.88],
        [0.42, 0.04 + dy, -0.87],
        [0.28, 0.13 + dy, -0.87],
      ],
      0.003,
      m.warm,
    );
  for (const p of [
    [-0.54, 0, 1.07],
    [0.54, 0, -0.88],
    [0.28, 0.13, -0.87],
  ] as const)
    lug(earth, p, m.metal);

  const starter = part(
    root,
    'starter-drive',
    'Starter and flywheel drive',
    [0, 0.55, -1.18],
    [0.36, 0.09, -0.22],
    'The solenoid engages a small pinion with the flywheel ring gear; the electric motor turns the engine for cranking. The high-current connection is shown beside the cutaway motor. The pinion does not stay engaged once starting is complete.',
  );
  ringZ(starter, 0.16, 0.117, 0.018, m.metal, [0, -0.035, 0]);
  for (let i = 0; i < 42; i++) {
    const angle = (i * Math.PI * 2) / 42;
    box(
      starter,
      [0.016, 0.012, 0.018],
      m.metal,
      [Math.cos(angle) * 0.161, -0.035 + Math.sin(angle) * 0.161, 0],
      [0, 0, angle],
    );
  }
  ringZ(starter, 0.117, 0.045, 0.012, m.dark, [0, -0.035, -0.012]);
  gear(starter, 0.025, 0.032, m.warm, [0.186, -0.035, 0], 12);
  cylinder(starter, 0.014, 0.24, m.metal, [0.186, -0.035, 0.11], longitudinal);
  mesh(
    starter,
    new THREE.CylinderGeometry(0.055, 0.055, 0.18, 32, 1, true, 0, Math.PI * 1.4),
    m.dark,
    [0.186, -0.035, 0.12],
    longitudinal,
  );
  for (const z of [0.025, 0.215]) cylinder(starter, 0.056, 0.015, m.metal, [0.186, -0.035, z], longitudinal);
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    beam(
      starter,
      [0.186 + Math.cos(angle) * 0.032, -0.035 + Math.sin(angle) * 0.032, 0.045],
      [0.186 + Math.cos(angle) * 0.032, -0.035 + Math.sin(angle) * 0.032, 0.19],
      0.006,
      m.warm,
    );
  }
  cylinder(starter, 0.027, 0.105, m.metal, [0.186, 0.052, 0.12], longitudinal);
  for (const x of [0.175, 0.2]) cylinder(starter, 0.006, 0.018, m.warm, [x, 0.052, 0.182], longitudinal);
  box(starter, [0.045, 0.015, 0.07], m.dark, [0.186, 0.012, 0.12]);

  const alternator = part(
    root,
    'alternator-drive',
    'Alternator and belt drive',
    [0.12, 0.65, -0.57],
    [-0.36, 0.28, -0.15],
    'The engine belt turns the alternator pulley and rotor. Windings generate AC; rectification supplies DC to the vehicle. This cutaway omits most casing and shows only part of the accessory belt circuit.',
  );
  mesh(
    alternator,
    new THREE.CylinderGeometry(0.076, 0.076, 0.125, 40, 1, true, 0, Math.PI * 1.35),
    m.metal,
    [0, 0, 0],
    longitudinal,
  );
  for (const z of [-0.071, 0.071]) ringZ(alternator, 0.077, 0.023, 0.012, m.metal, [0, 0, z]);
  cylinder(alternator, 0.024, 0.19, m.dark, [0, 0, 0.025], longitudinal);
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const x = Math.cos(angle) * 0.052,
      y = Math.sin(angle) * 0.052;
    beam(alternator, [x, y, -0.055], [x, y, 0.055], 0.009, m.warm);
  }
  winding(alternator, 0.025, 0, 0.09, m.warm);
  cylinder(alternator, 0.05, 0.03, m.dark, [0, 0, 0.112], longitudinal);
  for (const z of [0.101, 0.11, 0.119]) ringZ(alternator, 0.052, 0.045, 0.004, m.metal, [0, 0, z]);
  cylinder(alternator, 0.082, 0.025, m.dark, [-0.12, -0.19, 0.112], longitudinal);
  cylinder(alternator, 0.032, 0.027, m.dark, [0.11, -0.12, 0.112], longitudinal);
  tube(
    alternator,
    [
      [-0.18, -0.14, 0.116],
      [-0.19, -0.21, 0.116],
      [-0.12, -0.27, 0.116],
      [0.1, -0.155, 0.116],
      [0.14, -0.12, 0.116],
      [0.045, 0.025, 0.116],
      [0, 0.052, 0.116],
      [-0.045, 0.025, 0.116],
      [-0.18, -0.14, 0.116],
    ],
    0.007,
    m.black,
  );
  box(alternator, [0.07, 0.035, 0.025], m.black, [0, -0.052, -0.088]);
  for (let i = 0; i < 5; i++) box(alternator, [0.004, 0.026, 0.023], m.metal, [-0.027 + i * 0.013, -0.05, -0.106]);

  const headlamp = part(
    root,
    'headlamp',
    'Halogen and lower light unit',
    [0.68, 0.61, 1.65],
    [0.26, 0.18, 0.2],
    'The standard main headlamp contains separate H7 and H9 halogen road-light bulbs and a direction-indicator bulb. A carrier and connector locate the assembly. The lower module combines a rectangular fog lamp with an LED position-light module. These optics are illustrative.',
  );
  const reflector = m.metal.clone();
  reflector.side = THREE.DoubleSide;
  const profile = [
    [0.014, -0.055],
    [0.035, -0.048],
    [0.07, -0.025],
    [0.105, 0.02],
    [0.12, 0.06],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const mainReflector = mesh(
    headlamp,
    new THREE.LatheGeometry(profile, 40),
    reflector,
    [0.032, 0.027, 0.01],
    longitudinal,
  );
  mainReflector.scale.setScalar(0.65);
  const secondReflector = mesh(
    headlamp,
    new THREE.LatheGeometry(profile, 32),
    reflector,
    [-0.055, -0.051, 0.025],
    longitudinal,
  );
  secondReflector.scale.setScalar(0.36);
  sphere(headlamp, 0.122, m.glass, [0, 0, 0.068], [1, 1, 0.24]);
  for (const [x, y] of [
    [0.032, 0.027],
    [-0.055, -0.051],
  ]) {
    cylinder(headlamp, 0.011, 0.035, m.black, [x, y, -0.013], longitudinal);
    sphere(headlamp, 0.015, m.glass, [x, y, 0.015], [0.7, 0.7, 1.3]);
    for (const dx of [-0.003, 0.003]) beam(headlamp, [x + dx, y, 0], [x + dx, y, 0.026], 0.0012, m.metal);
    tube(
      headlamp,
      [
        [x - 0.003, y, 0.026],
        [x, y + 0.003, 0.028],
        [x + 0.003, y, 0.026],
      ],
      0.0012,
      m.warm,
    );
  }
  box(headlamp, [0.075, 0.015, 0.014], m.warm, [0.018, -0.086, 0.052]);
  ringZ(headlamp, 0.125, 0.118, 0.018, m.black, [0, 0, 0.06]);
  box(headlamp, [0.23, 0.012, 0.13], m.dark, [0, -0.13, -0.018]);
  box(headlamp, [0.04, 0.028, 0.025], m.black, [0, -0.1, -0.05]);
  box(headlamp, [0.2, 0.06, 0.06], m.dark, [0, -0.19, 0.095]);
  box(headlamp, [0.075, 0.032, 0.011], m.metal, [-0.052, -0.19, 0.128]);
  box(headlamp, [0.065, 0.022, 0.006], m.glass, [-0.052, -0.19, 0.137]);
  for (let i = 0; i < 5; i++) box(headlamp, [0.018, 0.012, 0.008], m.glass, [-0.02 + i * 0.027, -0.18, 0.129]);

  const controls = part(
    root,
    'request-controls',
    'Ignition and lighting controls',
    [0.43, 0.7, 0.51],
    [0.13, 0.34, 0],
    'The ignition system checks the code in the key’s transponder before permitting starting; a separate circuit requests cranking. The lighting switch requests a lighting mode. These controls and symbolic electronics do not depict module brackets, CAN topology or security procedures.',
  );
  cylinder(controls, 0.028, 0.035, m.metal, [0, 0, 0], longitudinal);
  box(controls, [0.013, 0.008, 0.05], m.metal, [0, 0, 0.04]);
  sphere(controls, 0.03, m.black, [0, 0, 0.076], [1, 0.72, 0.33]);
  box(controls, [0.018, 0.01, 0.009], m.blue, [0, 0, 0.086]);
  box(controls, [0.085, 0.065, 0.025], m.dark, [0.13, 0, 0]);
  cylinder(controls, 0.024, 0.02, m.black, [0.13, 0, 0.025], longitudinal);
  box(controls, [0.008, 0.019, 0.005], m.metal, [0.13, 0.005, 0.037]);
  for (const x of [0.103, 0.13, 0.157]) box(controls, [0.004, 0.005, 0.003], m.metal, [x, 0.026, 0.017]);
  box(controls, [0.11, 0.055, 0.035], m.blue, [0.055, -0.075, -0.03]);
  for (let i = 0; i < 5; i++) box(controls, [0.009, 0.009, 0.013], m.metal, [0.02 + i * 0.017, -0.11, -0.03]);
  tube(
    controls,
    [
      [0, 0, -0.02],
      [0.015, -0.04, -0.035],
      [0.035, -0.075, -0.035],
    ],
    0.004,
    m.blue,
  );
  tube(
    controls,
    [
      [0.13, -0.035, 0],
      [0.11, -0.055, -0.02],
      [0.075, -0.075, -0.035],
    ],
    0.004,
    m.blue,
  );
  return root;
}
