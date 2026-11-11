import * as THREE from 'three';
import {
  annulus,
  assembly,
  beam,
  box,
  cylinder,
  materials,
  mesh,
  part,
  sphere,
  tube,
} from '../../../../interactive/three/component-geometry.ts';
import type { ExplorerConfig } from '../../../../interactive/types';

import { steeringWheel } from '../../../../interactive/models/boxster/cabin.ts';
import { palette } from '../../../../interactive/models/boxster/surfaces.ts';

export const config: ExplorerConfig = {
  id: 'steering-explorer',
  title: 'From the car to the steering',
  location:
    'The steering gear sits across the front axle region. The column reaches it in this left-hand-drive layout; hydraulic lines run to the engine-driven pump behind the seats. UK right-hand-drive gear and line variants differ.',
  overview:
    'The column turns the pinion, the rack moves both track rods, and the front carriers steer. The pump assists that mechanical path. The rim supports the tyre at its bead seats; the tyre meets the road.',
  assembled:
    'The rack, joints and steering arms form a continuous mechanical connection. Supply and return lines add hydraulic assistance; the wheel rotates in its carrier while the carrier sets its direction.',
  exploded:
    'The display separates steering, assistance and the front-left rolling assembly. Rim and tyre move apart to expose their bead-seat relationship; these offsets are not steering movement or a removal sequence.',
  focus: 'rack',
  hideCarParts: ['chassis', 'wheel-fl', 'tan-steering-wheel', 'steering-column-context'],
  direction: [1.35, 1, 1.25],
  note: 'Factory parts relationships: PET 403-000/001/003/005, 401-005 and 601-000. Rack cutaway, belt segment and fluid paths are schematic. Standard front size: 7J×17, ET55, 205/55 ZR17 tyre. Cooler, brakes, suspension arms and optional TPM are omitted; small fittings and tread are illustrative.',
  connections: [
    { from: 'column', to: 'rack', label: 'Column rotation drives the pinion', kind: 'mechanical' },
    {
      from: 'pump',
      to: 'hydraulic-lines',
      label: 'Pump supplies fluid and receives the return',
      kind: 'fluid',
    },
    {
      from: 'hydraulic-lines',
      to: 'rack',
      label: 'Pressure and return connect the steering assistance circuit',
      kind: 'fluid',
    },
    {
      from: 'rack',
      to: 'left-link',
      label: 'Rack travel moves the left track rod and steering arm',
      kind: 'mechanical',
    },
    {
      from: 'rack',
      to: 'right-link',
      label: 'Rack travel moves the right track rod and steering arm',
      kind: 'mechanical',
    },
    {
      from: 'left-link',
      to: 'rim',
      label: 'The hub supports and locates the bolted wheel',
      kind: 'mechanical',
    },
    { from: 'rim', to: 'tyre', label: 'Tyre beads seat against the rim', kind: 'structure' },
  ],
};

function ballJoint(
  parent: THREE.Object3D,
  position: readonly number[],
  surface: THREE.MeshStandardMaterial,
  black: THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[],
) {
  sphere(parent, 0.022, surface, position);
  cylinder(parent, 0.014, 0.045, black, [position[0], position[1] + 0.018, position[2]], [0, 0, 0]);
}

function frontLink(root: THREE.Object3D, side: number, m: ReturnType<typeof materials>) {
  const label = side > 0 ? 'Left rod and carrier' : 'Right rod and carrier';
  const name = side > 0 ? 'left-link' : 'right-link';
  const base = [side * 0.6, 0.329, 1.2075];
  const object = part(
    root,
    name,
    label,
    base,
    [side * 0.3, 0.04, 0.2],
    'The inner joint under the protective bellows joins the rack to the threaded rod; the outer ball-jointed end turns the carrier through its steering arm. The carrier locates the bearing; the hub and wheel rotate within it. PET 403-000 items 2/6/8 and 401-005 items 1/2/9 identify these parts. Suspension arms and the brake are omitted.',
  );
  const local = ([x, y, z]: readonly number[]) => [x - base[0], y - base[1], z - base[2]];
  const inner = [side * 0.43, 0.33, 1.19],
    outer = [side * 0.675, 0.33, 1.09];
  beam(object, local(inner), local(outer), 0.012, m.metal);
  // PET 403-000 item 6: an articulated inner connection, protected by item 2.
  sphere(object, 0.021, m.dark, local([side * 0.435, 0.33, 1.188]));
  for (let i = 0; i < 7; i++) {
    const x = side * (0.425 + i * 0.011);
    cylinder(object, 0.032 - i * 0.0015, 0.009, m.black, local([x, 0.33, 1.19 - i * 0.002]));
  }
  ballJoint(object, local(outer), m.metal, m.black);
  cylinder(object, 0.018, 0.025, m.warm, local([side * 0.575, 0.33, 1.13]));
  const bearing = local([side * 0.74, 0.329, 1.2075]);
  annulus(object, 0.083, 0.045, 0.065, m.metal, bearing);
  cylinder(object, 0.041, 0.105, m.dark, local([side * 0.765, 0.329, 1.2075]));
  annulus(object, 0.073, 0.033, 0.018, m.metal, local([side * 0.815, 0.329, 1.2075]));
  beam(object, local(outer), local([side * 0.715, 0.34, 1.17]), 0.022, m.green);
  beam(object, local([side * 0.72, 0.29, 1.21]), local([side * 0.69, 0.48, 1.2]), 0.028, m.green);
  annulus(object, 0.047, 0.029, 0.07, m.green, local([side * 0.69, 0.48, 1.2])).rotation.set(Math.PI / 2, 0, 0);
  for (const y of [0.29, 0.37]) box(object, [0.07, 0.025, 0.035], m.green, local([side * 0.71, y, 1.15]));
  return object;
}

export function createAssembly() {
  const root = assembly('steering-and-front-wheel');
  const m = materials();
  const column = part(
    root,
    'column',
    'Wheel and column',
    [0, 0, 0],
    [0.2, 0.32, -0.1],
    'The driver turns a shaft through the steering column and articulated intermediate shaft. PET 403-005 items 1/2 identify the standard manual-car assembly; 403-004 treats optional PDK wheel controls separately. This left-hand-drive illustration reaches the pinion mechanically; the column is not an electric-assistance unit.',
  );
  steeringWheel(column, palette());
  const joints = [
    [0.345, 0.795, 0.225],
    [0.3, 0.58, 0.62],
    [0.2, 0.375, 1.155],
  ];
  for (let i = 1; i < joints.length; i++) {
    beam(column, joints[i - 1], joints[i], 0.018, m.metal);
    sphere(column, 0.025, m.dark, joints[i]);
  }
  box(column, [0.08, 0.06, 0.13], m.dark, [0.32, 0.64, 0.48], [-0.6, 0, 0]);

  const rack = part(
    root,
    'rack',
    'Rack and assistance',
    [0, 0.33, 1.19],
    [0, -0.12, 0.36],
    'The pinion converts column rotation into transverse rack travel. A fluid-pressure difference across the rack piston supplies assistance. The open half casing exposes that principle rather than Porsche’s exact internal machining.',
  );
  cylinder(rack, 0.018, 0.87, m.metal);
  for (const x of [-0.31, 0.31]) {
    annulus(rack, 0.055, 0.023, 0.19, m.dark, [x, 0, 0]);
    annulus(rack, 0.065, 0.053, 0.025, m.metal, [x + Math.sign(x) * 0.065, 0, 0]);
    box(rack, [0.055, 0.04, 0.095], m.green, [x, -0.052, 0]);
  }
  mesh(
    rack,
    new THREE.CylinderGeometry(0.052, 0.052, 0.43, 32, 1, true, 0, Math.PI),
    m.metal,
    [0, 0, 0],
    [0, 0, Math.PI / 2],
  );
  cylinder(rack, 0.046, 0.025, m.blue, [-0.11, 0, 0]);
  for (const x of [-0.18, -0.15, -0.12, -0.09, -0.06, -0.03, 0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18])
    box(rack, [0.016, 0.016, 0.025], m.metal, [x, 0.02, 0]);
  cylinder(rack, 0.043, 0.1, m.dark, [0.2, 0.045, -0.035], [0.9, 0, 0]);
  for (const x of [-0.2, 0.25]) {
    cylinder(rack, 0.012, 0.045, m.warm, [x, 0.052, -0.025], [0, 0, 0]);
    tube(
      rack,
      [
        [x, 0.07, -0.025],
        [x, 0.08, -0.06],
        [0.2, 0.075, -0.08],
      ],
      0.006,
      m.warm,
    );
  }

  const pump = part(
    root,
    'pump',
    'Pump and reservoir',
    [0.25, 0.6, -0.58],
    [0.32, 0.2, -0.25],
    'An engine-driven belt turns the hydraulic pump. The reservoir mounts directly above it, with a cover and sealed connection; PET 403-003 identifies these separately from the pulley and support. Pressure and return lines connect the rear power unit to the front steering gear. The belt shown is only a drive indication.',
  );
  cylinder(pump, 0.055, 0.11, m.metal, [0, 0, 0], [Math.PI / 2, 0, 0]);
  cylinder(pump, 0.075, 0.018, m.black, [0, 0, 0.073], [Math.PI / 2, 0, 0]);
  for (const z of [0.064, 0.069, 0.074, 0.079]) cylinder(pump, 0.076, 0.002, m.dark, [0, 0, z], [Math.PI / 2, 0, 0]);
  // Broad reservoir over a narrower connection follows PET 403-003 item 1.
  box(pump, [0.16, 0.065, 0.13], m.black, [0, 0.11, -0.025]);
  cylinder(pump, 0.027, 0.055, m.black, [0, 0.055, -0.025], [0, 0, 0]);
  cylinder(pump, 0.028, 0.035, m.dark, [0.018, 0.156, 0.005], [0, 0, 0]);
  cylinder(pump, 0.036, 0.013, m.black, [0.018, 0.18, 0.005], [0, 0, 0]);
  for (const x of [-0.065, 0.065]) box(pump, [0.025, 0.09, 0.04], m.metal, [x, -0.045, -0.02]);
  tube(
    pump,
    [
      [-0.068, 0.03, 0.083],
      [-0.09, -0.1, 0.083],
      [-0.11, -0.18, 0.083],
    ],
    0.009,
    m.black,
  );
  tube(
    pump,
    [
      [0.067, 0.03, 0.083],
      [0.05, -0.1, 0.083],
      [0.03, -0.18, 0.083],
    ],
    0.009,
    m.black,
  );

  const lines = part(
    root,
    'hydraulic-lines',
    'Supply and return',
    [0, 0.3, 0.25],
    [0, -0.18, 0],
    'PET 403-001 separates the long pressure/return sections, flexible engine-end sections, holders and a pump-to-heat-exchanger return connection. Orange denotes pressure supply and blue return. The heat exchanger is omitted; line bends and locations are schematic, and UK right-hand-drive listings differ.',
    [0.18, -0.015, 0.15],
  );
  tube(
    lines,
    [
      [0.182, 0.33, -0.747],
      [0.2, 0.08, -0.6],
      [0.18, -0.015, -0.3],
      [0.18, -0.015, 0.6],
      [0.24, 0.05, 0.9],
      [0.25, 0.1, 0.915],
    ],
    0.012,
    m.warm,
  );
  tube(
    lines,
    [
      [-0.2, 0.1, 0.915],
      [-0.12, 0.035, 0.7],
      [-0.12, -0.015, -0.3],
      [-0.12, 0.03, -0.65],
      [0.14, 0.2, -0.84],
      [0.317, 0.33, -0.747],
    ],
    0.012,
    m.blue,
  );
  for (const z of [-0.3, 0.1, 0.5])
    for (const x of [-0.12, 0.18]) cylinder(lines, 0.017, 0.035, m.metal, [x, -0.015, z], [Math.PI / 2, 0, 0]);

  frontLink(root, 1, m);
  frontLink(root, -1, m);

  const rim = part(
    root,
    'rim',
    '17-inch front rim',
    [0.76, 0.329, 1.2075],
    [0.52, 0.06, 0.15],
    'The standard front rim is 7J×17 ET55: 7 inches between flange faces, a 17-inch bead-seat diameter and a mounting face 55 mm outboard of its centre plane. PET 601-000 lists the wheel, valve and balance weights separately. The hub centre locates the wheel; five wheel bolts clamp it to the hub. Valve position, spoke form and balance weight are illustrative. Optional TPM sensor hardware is not shown.',
  );
  annulus(rim, 0.216, 0.204, 0.1778, m.metal);
  // 7 inches is the separation of the inner flange faces, not flange centrelines.
  for (const x of [-0.0949, 0.0949]) annulus(rim, 0.227, 0.202, 0.012, m.metal, [x, 0, 0]);
  const face = new THREE.Shape();
  face.absarc(0, 0, 0.076, 0, Math.PI * 2, false);
  const centreHole = new THREE.Path();
  centreHole.absarc(0, 0, 0.033, 0, Math.PI * 2, true);
  face.holes.push(centreHole);
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const hole = new THREE.Path();
    hole.absarc(Math.cos(angle) * 0.065, Math.sin(angle) * 0.065, 0.0075, 0, Math.PI * 2, true);
    face.holes.push(hole);
    box(rim, [0.025, 0.145, 0.035], m.metal, [0.04, Math.cos(angle) * 0.139, Math.sin(angle) * 0.139], [angle, 0, 0]);
  }
  const flange = new THREE.ExtrudeGeometry(face, {
    depth: 0.02,
    bevelEnabled: false,
    curveSegments: 24,
  });
  flange.translate(0, 0, -0.01);
  mesh(rim, flange, m.metal, [0.055, 0, 0], [0, Math.PI / 2, 0]);
  // Ordinary valve (item 2) and an adhesive balance weight (item 3), not TPM.
  cylinder(rim, 0.006, 0.032, m.black, [0.099, -0.153, 0.139]);
  box(rim, [0.018, 0.01, 0.035], m.dark, [-0.055, -0.206, 0]);

  const tyre = part(
    root,
    'tyre',
    'Front tyre and beads',
    [0.76, 0.329, 1.2075],
    [0.95, 0.06, 0.15],
    'The nominal 205/55 front tyre seats on a 17-inch rim. Reinforced beads locate its inner edges; the sidewall flexes and the tread meets the road. This unladen geometric model does not predict loaded radius, grip or an exact footprint.',
  );
  const casing = new THREE.TorusGeometry(0.272275, 0.056375, 16, 72);
  casing.rotateY(Math.PI / 2);
  casing.scale(0.205 / 0.11275, 1, 1);
  mesh(tyre, casing, m.black);
  for (const x of [-0.083, 0.083]) {
    const bead = new THREE.TorusGeometry(0.216, 0.0045, 8, 64);
    bead.rotateY(Math.PI / 2);
    mesh(tyre, bead, m.warm, [x, 0, 0]);
  }
  for (let i = 0; i < 72; i++) {
    const angle = (i * Math.PI * 2) / 72;
    box(tyre, [0.16, 0.005, 0.018], m.dark, [0, Math.cos(angle) * 0.326, Math.sin(angle) * 0.326], [angle, 0, 0]);
  }
  return root;
}
