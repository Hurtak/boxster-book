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
} from '../../../../interactive/three/component-geometry.ts';
import type { ExplorerConfig } from '../../../../interactive/types';

export const config: ExplorerConfig = {
  id: 'drivetrain-explorer',
  title: 'From the car to the rear drive',
  location:
    'The 2010 2.9 has its engine behind the seats, a transaxle extending rearwards and a short CV shaft to each rear hub.',
  overview:
    'The gearbox drives the differential, then two jointed shafts turn the rear hubs. A forward engine mount and two transmission supports connect the joined power unit to the body.',
  assembled:
    'The differential is inside the transaxle. Each inner CV joint bolts to an output flange; the outer splines and nut secure the hub. Output seals retain gearbox lubricant, while joint boots retain grease.',
  exploded:
    'The cutaway case, differential, shafts and hubs separate to reveal the drive path and its supports. These offsets illustrate relationships, not a removal order or suspension movement.',
  focus: 'differential',
  hideCarParts: ['engine', 'gearbox', 'chassis'],
  direction: [1.4, 0.95, 1.35],
  note: 'Manual baseline with a generic open differential. Gear teeth, bearing sections, mount shapes and positions are illustrative; the PDK has different internals and supports.',
  connections: [
    {
      from: 'engine',
      to: 'transaxle',
      label: 'Drive passes through the clutch and selected gearbox ratio',
      kind: 'mechanical',
    },
    {
      from: 'transaxle',
      to: 'differential',
      label: 'Final reduction drives the differential carrier',
      kind: 'mechanical',
    },
    {
      from: 'differential',
      to: 'left-shaft',
      label: 'Left output flange bolts to the inner CV joint',
      kind: 'mechanical',
    },
    {
      from: 'differential',
      to: 'right-shaft',
      label: 'Right output flange bolts to the inner CV joint',
      kind: 'mechanical',
    },
    {
      from: 'left-shaft',
      to: 'left-hub',
      label: 'Splined outer end turns the hub',
      kind: 'mechanical',
    },
    {
      from: 'right-shaft',
      to: 'right-hub',
      label: 'Splined outer end turns the hub',
      kind: 'mechanical',
    },
    {
      from: 'engine',
      to: 'front-mount',
      label: 'Compliant support carries weight and housing reaction',
      kind: 'structure',
    },
    {
      from: 'engine',
      to: 'transaxle',
      label: 'Bolted housings form one supported power unit',
      kind: 'structure',
    },
  ],
};

function boot(parent: THREE.Object3D, centre: number, surface: THREE.Material, clipSurface: THREE.Material) {
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const radius = 0.026 + Math.sin(t * Math.PI) * 0.021;
    mesh(
      parent,
      new THREE.TorusGeometry(radius, 0.007, 8, 28),
      surface,
      [centre + (t - 0.5) * 0.098, 0, 0],
      [0, Math.PI / 2, 0],
    );
  }
  for (const offset of [-0.049, 0.049]) annulus(parent, 0.035, 0.026, 0.006, clipSurface, [centre + offset, 0, 0]);
}

function shaft(parent: THREE.Object3D, side: number, m: ReturnType<typeof materials>) {
  cylinder(parent, 0.021, 0.39, m.metal);
  for (const x of [-0.2, 0.2]) {
    cylinder(parent, 0.055, 0.052, m.metal, [x, 0, 0]);
    boot(parent, x * 0.66, m.black, m.dark);
    for (const dx of [-0.023, 0.023]) annulus(parent, 0.058, 0.043, 0.007, m.dark, [x + dx, 0, 0]);
  }
  // PET 501-005: the inner joint has a bolted flange and an end cap;
  // the wheel end uses splines and a nut instead of a second bolt circle.
  cylinder(parent, 0.045, 0.006, m.dark, [-side * 0.229, 0, 0]).name = 'inner-joint-end-cap';
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    cylinder(parent, 0.0065, 0.013, m.dark, [
      -side * 0.235,
      Math.cos(angle) * 0.044,
      Math.sin(angle) * 0.044,
    ]).name = `inner-joint-bolt-${i + 1}`;
  }
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    beam(
      parent,
      [-side * 0.225, Math.cos(angle) * 0.044, Math.sin(angle) * 0.044],
      [-side * 0.225, Math.cos(angle + Math.PI / 3) * 0.044, Math.sin(angle + Math.PI / 3) * 0.044],
      0.0035,
      m.metal,
    ).name = `paired-bolt-spacer-${i + 1}`;
  }
  cylinder(parent, 0.029, 0.15, m.metal, [side * 0.245, 0, 0]);
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    box(
      parent,
      [0.09, 0.006, 0.006],
      m.dark,
      [side * 0.27, Math.cos(angle) * 0.029, Math.sin(angle) * 0.029],
      [angle, 0, 0],
    );
  }
}

function hubAndCarrier(parent: THREE.Object3D, side: number, m: ReturnType<typeof materials>) {
  // Carrier and outer bearing ring stay with the suspension, not the shaft.
  annulus(parent, 0.1, 0.061, 0.09, m.green);
  for (const z of [-0.075, 0.075]) beam(parent, [0, 0.04, z * 0.45], [0, 0.14, z], 0.024, m.green);
  beam(parent, [0, -0.06, 0], [-side * 0.025, -0.14, -0.045], 0.025, m.green);
  for (const [y, z] of [
    [0.14, -0.075],
    [0.14, 0.075],
    [-0.14, -0.045],
  ] as const)
    cylinder(parent, 0.032, 0.055, m.green, [0, y, z]);
  annulus(parent, 0.059, 0.037, 0.075, m.metal);
  annulus(parent, 0.102, 0.061, 0.008, m.metal, [side * 0.051, 0, 0]).name = 'bearing-retaining-cover';
  for (const y of [-0.062, 0.062])
    for (const z of [-0.062, 0.062]) {
      cylinder(parent, 0.0075, 0.011, m.dark, [side * 0.058, y, z]);
    }
  // The stationary speed sensor belongs to the carrier; its wiring route is omitted.
  box(parent, [0.025, 0.02, 0.025], m.black, [-side * 0.045, 0.091, -0.018]).name = 'wheel-speed-sensor';
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    mesh(parent, new THREE.SphereGeometry(0.008, 10, 8), m.warm, [
      side * 0.035,
      Math.cos(angle) * 0.048,
      Math.sin(angle) * 0.048,
    ]);
  }
  cylinder(parent, 0.035, 0.15, m.metal, [side * 0.025, 0, 0]);
  const flange = new THREE.Shape();
  flange.absarc(0, 0, 0.087, 0, Math.PI * 2, false);
  const centre = new THREE.Path();
  centre.absarc(0, 0, 0.032, 0, Math.PI * 2, true);
  flange.holes.push(centre);
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const hole = new THREE.Path();
    hole.absarc(Math.cos(angle) * 0.065, Math.sin(angle) * 0.065, 0.0065, 0, Math.PI * 2, true);
    flange.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(flange, {
    depth: 0.018,
    bevelEnabled: false,
    curveSegments: 24,
  });
  geometry.translate(0, 0, -0.009);
  mesh(parent, geometry, m.metal, [side * 0.07, 0, 0], [0, Math.PI / 2, 0]);
  mesh(parent, new THREE.CylinderGeometry(0.028, 0.028, 0.018, 6), m.dark, [side * 0.09, 0, 0], [0, 0, Math.PI / 2]);
}

export function createAssembly() {
  const root = assembly('rear-drivetrain');
  const m = materials();
  const engine = part(
    root,
    'engine',
    'Engine',
    [0, 0.48, -0.78],
    [0, 0.3, 0.3],
    'The flat-six sits ahead of the rear axle. Its crankshaft supplies the clutch and gearbox; the bolted engine and transmission housings move together on compliant supports.',
  );
  box(engine, [0.48, 0.23, 0.49], m.metal);
  for (const side of [-1, 1]) {
    box(engine, [0.13, 0.22, 0.52], m.dark, [side * 0.34, 0, 0]);
    for (const z of [-0.16, 0, 0.16]) cylinder(engine, 0.07, 0.15, m.metal, [side * 0.245, 0, z]);
    for (let i = 0; i < 7; i++) box(engine, [0.15, 0.014, 0.52], m.metal, [side * 0.34, -0.085 + i * 0.028, 0]);
  }
  const mount = part(
    root,
    'front-mount',
    'Front engine mount',
    [0, 0.48, -0.46],
    [0, 0.1, 0.5],
    'A bracket and mounting console connect the forward engine region to the body. Two stops flank the central support, with a separate vibration damper beside it. This assembly carries weight and housing reaction; its shape and compliance are illustrative.',
  );
  annulus(mount, 0.082, 0.063, 0.15, m.metal);
  annulus(mount, 0.061, 0.022, 0.135, m.black);
  cylinder(mount, 0.022, 0.2, m.metal);
  for (const side of [-1, 1]) {
    annulus(mount, 0.075, 0.023, 0.012, m.black, [side * 0.085, 0, 0]).name =
      side < 0 ? 'mount-stop-left' : 'mount-stop-right';
  }
  cylinder(mount, 0.028, 0.018, m.dark, [-0.118, -0.042, 0.028]).name = 'separate-vibration-damper';
  for (const side of [-1, 1]) {
    box(mount, [0.07, 0.13, 0.07], m.green, [side * 0.13, -0.015, -0.025]);
    box(mount, [0.12, 0.025, 0.12], m.green, [side * 0.2, -0.08, -0.025]);
    beam(mount, [side * 0.1, 0.025, 0], [side * 0.2, -0.06, -0.025], 0.018, m.metal);
  }
  const transaxle = part(
    root,
    'transaxle',
    'Gearbox and mounts',
    [0, 0.37, -1.43],
    [0, 0.15, -0.4],
    'The gearbox and final drive share a case behind the engine. The cutaway exposes their relationship; two transmission-end supports carry housing loads into the body. The illustrated teeth are not a factory gear layout.',
  );
  // Open left/top case shows the final drive; ribs retain an identifiable housing.
  box(transaxle, [0.34, 0.025, 0.73], m.metal, [0, -0.12, 0.02]);
  box(transaxle, [0.025, 0.23, 0.73], m.metal, [-0.17, -0.005, 0.02]);
  for (const z of [-0.29, -0.16, -0.03, 0.1, 0.23]) {
    box(transaxle, [0.035, 0.27, 0.025], m.dark, [-0.18, 0.005, z]);
    box(transaxle, [0.35, 0.035, 0.025], m.dark, [0, -0.13, z]);
  }
  mesh(transaxle, new THREE.TorusGeometry(0.2, 0.025, 10, 40, Math.PI * 1.5), m.metal, [0, 0.015, 0.35]);
  cylinder(transaxle, 0.13, 0.04, m.metal, [0, 0, -0.35], [Math.PI / 2, 0, 0]);
  cylinder(transaxle, 0.023, 0.56, m.dark, [0.045, -0.015, -0.03], [Math.PI / 2, 0, 0]);
  for (const z of [-0.24, -0.12]) gear(transaxle, 0.074, 0.035, m.warm, [0.045, -0.015, z], 14);
  for (const side of [-1, 1]) {
    beam(transaxle, [side * 0.14, -0.015, -0.15], [side * 0.34, 0.035, -0.15], 0.028, m.metal);
    cylinder(transaxle, 0.065, 0.045, m.black, [side * 0.34, 0.055, -0.15], [0, 0, 0]);
    cylinder(transaxle, 0.071, 0.012, m.metal, [side * 0.34, 0.083, -0.15], [0, 0, 0]);
    box(transaxle, [0.14, 0.02, 0.11], m.green, [side * 0.34, 0.1, -0.15]);
    annulus(transaxle, 0.068, 0.046, 0.012, m.black, [side * 0.173, -0.041, 0.2225]).name =
      side < 0 ? 'right-output-seal' : 'left-output-seal';
  }
  const differential = part(
    root,
    'differential',
    'Open differential',
    [0, 0.329, -1.2075],
    [0, 0.38, -0.1],
    'The final-drive ring turns the carrier. Its bevel pinions connect two side gears and output flanges, allowing different wheel speeds. This open unit omits the optional locking differential’s friction packs.',
  );
  annulus(differential, 0.165, 0.121, 0.028, m.warm, [-0.105, 0, 0]);
  for (let i = 0; i < 28; i++) {
    const angle = (i * Math.PI * 2) / 28;
    box(
      differential,
      [0.035, 0.022, 0.026],
      m.warm,
      [-0.105, Math.cos(angle) * 0.161, Math.sin(angle) * 0.161],
      [angle, 0, 0],
    );
  }
  for (const side of [-1, 1]) {
    annulus(differential, 0.106, 0.08, 0.02, m.metal, [side * 0.105, 0, 0]);
    cylinder(differential, 0.045, 0.105, m.metal, [side * 0.167, 0, 0]);
    cylinder(differential, 0.063, 0.018, m.dark, [side * 0.22, 0, 0]);
    mesh(
      differential,
      new THREE.CylinderGeometry(0.034, 0.067, 0.037, 24),
      m.warm,
      [side * 0.058, 0, 0],
      [0, 0, (side * Math.PI) / 2],
    );
    for (const z of [-0.08, 0.08]) beam(differential, [-0.1, 0.04, z], [0.1, 0.04, z], 0.012, m.metal);
  }
  cylinder(differential, 0.012, 0.17, m.dark, [0, 0, 0], [0, 0, 0]);
  for (const side of [-1, 1])
    mesh(
      differential,
      new THREE.CylinderGeometry(0.022, 0.045, 0.036, 20),
      m.warm,
      [0, side * 0.054, 0],
      [side > 0 ? Math.PI : 0, 0, 0],
    );
  const leftShaft = part(
    root,
    'left-shaft',
    'Left CV shaft',
    [0.45, 0.329, -1.2075],
    [0.34, -0.1, 0.12],
    'The inner CV joint bolts to the transmission drive flange, while the outer splines engage the hub. Boots seal joint grease; articulation and plunge accommodate changing suspension and power-unit positions. The two shaft shapes are illustrative and symmetric.',
  );
  shaft(leftShaft, 1, m);
  const rightShaft = part(
    root,
    'right-shaft',
    'Right CV shaft',
    [-0.45, 0.329, -1.2075],
    [-0.34, -0.1, -0.12],
    'The right shaft performs the same drive function on the opposite side. This symmetric teaching shape does not establish equal factory shaft lengths or interchangeability between manual and PDK applications.',
  );
  shaft(rightShaft, -1, m);
  const leftHub = part(
    root,
    'left-hub',
    'Left hub and carrier',
    [0.76, 0.329, -1.2075],
    [0.67, 0.04, 0.24],
    'The splined hub rotates with the wheel and disc. A bearing and retaining cover locate it in the stationary carrier; the nearby wheel-speed sensor measures rotation. The outer shaft nut secures the hub connection, and five flange openings receive wheel bolts.',
  );
  hubAndCarrier(leftHub, 1, m);
  const rightHub = part(
    root,
    'right-hub',
    'Right hub and carrier',
    [-0.76, 0.329, -1.2075],
    [-0.67, 0.04, -0.24],
    'The opposite hub rotates inside its wheel bearing while the carrier follows suspension movement. The retaining cover and speed sensor belong to the carrier side. The cutaway separates road-load support from the rotating torque path; discs, wheels and sensor wiring are omitted.',
  );
  hubAndCarrier(rightHub, -1, m);
  return root;
}
