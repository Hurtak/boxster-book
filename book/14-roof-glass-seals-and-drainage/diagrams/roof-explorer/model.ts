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

import { palette } from '../../../../interactive/models/boxster/surfaces.ts';
import { windscreenFrame, windscreenPoint } from '../../../../interactive/models/boxster/windscreen.ts';

export const config: ExplorerConfig = {
  id: 'roof-explorer',
  title: 'From the car to the folding roof',
  location:
    'The ordinary 2010 2.9 roof spans the cabin. Its drive, side linkages and stowage well sit behind the occupants, ahead of the rear boot.',
  overview:
    'The manual front latch and centring journals meet the fixed header. Frame members support cloth and rigid heated glass; one motor drives both side gearboxes. Separate seals limit entry, while filtered side pans collect runoff.',
  assembled:
    'This closed-roof cutaway places the supporting frame below the cloth, the rear glass in its aperture, and the drive beside the stowage well. The separate opening diagram explains their movement.',
  exploded:
    'The cloth, frame, glass, seals, drive and collection areas separate for identification. This is a spatial breakdown, not a roof-opening position or a removal sequence. The rear glass remains one rigid pane.',
  focus: 'roof-frame',
  hideCarParts: ['windscreen-frame'],
  direction: [1.25, 0.9, 1.45],
  note: 'Ordinary powered roof, not the Spyder sunshield. Frame sections, bow count, pivots, hidden routing and all separations are illustrative. The frame is shown closed; the glass does not fold.',
  connections: [
    {
      from: 'header',
      to: 'roof-frame',
      label: 'Manual front latch retains the roof against the header',
      kind: 'mechanical',
    },
    {
      from: 'roof-frame',
      to: 'covering',
      label: 'Frame and bows establish the cloth enclosure shape',
      kind: 'structure',
    },
    {
      from: 'covering',
      to: 'rear-glass',
      label: 'The rear aperture holds a rigid heated glass pane',
      kind: 'structure',
    },
    {
      from: 'motor-shafts',
      to: 'side-drives',
      label: 'Two flexible shafts carry rotation to left and right gearboxes',
      kind: 'mechanical',
    },
    {
      from: 'side-drives',
      to: 'roof-frame',
      label: 'Levers and articulated rods move the folding frame',
      kind: 'mechanical',
    },
    {
      from: 'side-drives',
      to: 'cover-well',
      label: 'Side guide arms and rods coordinate the compartment cover',
      kind: 'mechanical',
    },
    {
      from: 'covering',
      to: 'drainage',
      label: 'Runoff reaching the wet collection areas can drain outside',
      kind: 'fluid',
    },
    {
      from: 'cover-well',
      to: 'drainage',
      label: 'Collection components manage water around the roof compartment',
      kind: 'fluid',
    },
    {
      from: 'roof-frame',
      to: 'roof-seals',
      label: 'Retaining strips hold the separate roof seals against the frame',
      kind: 'structure',
    },
    {
      from: 'cover-well',
      to: 'roof-seals',
      label: 'The compartment has a separate perimeter seal and drainage hoses',
      kind: 'structure',
    },
  ],
};

function panel(
  parent: THREE.Object3D<THREE.Object3DEventMap>,
  vertices: number[][],
  surface: THREE.MeshStandardMaterial,
) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flat(), 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return mesh(parent, geometry, surface);
}

function roofSurface(u: number, t: number) {
  const front = windscreenPoint(u, 1),
    halfWidth = 0.649 - t * 0.119;
  const edgeHeight = 1.155 + Math.sin(t * Math.PI) * 0.055 + t * 0.05;
  return [
    (u * 2 - 1) * halfWidth,
    (1 - t) * (front[1] + 0.024) + t * edgeHeight + Math.sin(u * Math.PI) * 0.04 * t,
    (1 - t) * front[2] - t * 0.62,
  ];
}

function clothSurface(parent: THREE.Object3D<THREE.Object3DEventMap>, surface: THREE.MeshStandardMaterial) {
  // A curved upper sheet, open rear aperture, and side quarters. Counts and
  // seams are schematic; the mesh never animates a false folding-glass motion.
  const vertices = [],
    indices = [];
  const rows = 10,
    columns = 20;
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    for (let column = 0; column <= columns; column++) {
      const u = column / columns;
      vertices.push(...roofSurface(u, t));
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column;
        indices.push(a, a + 1, a + columns + 2, a, a + columns + 2, a + columns + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  mesh(parent, geometry, surface);
  const rear = (x: number, t: number) => [x, 1.205 - t * 0.36, -0.62 - t * 0.38];
  panel(parent, [rear(-0.53, 0), rear(0.53, 0), rear(0.45, 0.2), rear(-0.45, 0.2)], surface);
  panel(parent, [rear(-0.45, 0.8), rear(0.45, 0.8), rear(0.53, 1), rear(-0.53, 1)], surface);
  panel(parent, [rear(-0.53, 0.2), rear(-0.385, 0.2), rear(-0.385, 0.8), rear(-0.53, 0.8)], surface);
  panel(parent, [rear(0.385, 0.2), rear(0.53, 0.2), rear(0.53, 0.8), rear(0.385, 0.8)], surface);
  for (const side of [-1, 1])
    panel(
      parent,
      [
        [side * 0.55, 1.18, -0.4],
        [side * 0.53, 1.205, -0.62],
        [side * 0.53, 0.845, -1],
        [side * 0.62, 0.81, -0.76],
      ],
      surface,
    );
}

export function createAssembly() {
  const root = assembly('ordinary-roof-assembly'),
    m = materials();
  const fabric = new THREE.MeshStandardMaterial({
    color: '#353b3d',
    roughness: 0.95,
    side: THREE.DoubleSide,
  });
  const lining = new THREE.MeshStandardMaterial({
    color: '#b5aa96',
    roughness: 0.95,
    side: THREE.DoubleSide,
  });
  const header = part(
    root,
    'header',
    'Windscreen header',
    [0, 0, 0],
    [0, 0.1, 0.4],
    'The fixed metal windscreen frame provides the roof’s front contact and latch receiver. Glass and trim are omitted so the header and its relationship to the front roof edge remain visible.',
    [0, 1.16, 0.12],
  );
  windscreenFrame(header, palette());
  box(header, [0.065, 0.022, 0.035], m.metal, [0, 1.16, 0.12]);

  const frame = part(
    root,
    'roof-frame',
    'Frame and front latch',
    [0, 0, 0],
    [0, 0.3, 0],
    'Articulated side members and bows support the roof. A manual catch and paired centring journals travel with its front edge: the journals locate it at the fixed header and the catch retains it. Bow count and joint geometry are illustrative.',
  );
  for (const side of [-1, 1]) {
    const edge = (t: number) => roofSurface(side > 0 ? 1 : 0, t).map((n, axis) => n - (axis === 1 ? 0.024 : 0));
    const points = [edge(0), edge(0.45), edge(0.85), [side * 0.52, 0.98, -0.77], [side * 0.56, 0.76, -0.87]];
    for (let i = 0; i < points.length - 1; i++) beam(frame, points[i], points[i + 1], 0.018, m.metal);
    for (const point of points.slice(1, -1)) cylinder(frame, 0.028, 0.035, m.warm, point);
  }
  for (const t of [0, 0.45, 0.85])
    tube(
      frame,
      Array.from({ length: 61 }, (_, i) => roofSurface(i / 60, t).map((n, axis) => n - (axis === 1 ? 0.022 : 0))),
      0.016,
      m.metal,
    );
  box(frame, [0.15, 0.022, 0.04], m.dark, [0, 1.17, 0.115]);
  cylinder(frame, 0.015, 0.13, m.metal, [0, 1.15, 0.115]);
  beam(frame, [0, 1.15, 0.115], [0, 1.12, 0.045], 0.012, m.black);
  tube(
    frame,
    [
      [0, 1.155, 0.1],
      [0, 1.17, 0.14],
      [0, 1.185, 0.14],
      [0, 1.185, 0.12],
    ],
    0.008,
    m.warm,
  );
  for (const side of [-1, 1]) beam(frame, [side * 0.45, 1.166, 0.115], [side * 0.45, 1.166, 0.15], 0.012, m.warm);

  const covering = part(
    root,
    'covering',
    'Fabric and lining',
    [0, 0, 0],
    [0, 0.68, 0.04],
    'The outer covering and moulded headliner are separate parts. Tension wires guide the cloth edges; these do not rotate like the motor’s drive shafts. The rear opening accommodates a rigid pane. Cloth edges, wire paths and seams are simplified.',
  );
  clothSurface(covering, fabric);
  panel(
    covering,
    [
      [-0.49, 1.17, 0.1],
      [0.49, 1.17, 0.1],
      [0.46, 1.2, -0.49],
      [-0.46, 1.2, -0.49],
    ],
    lining,
  );
  for (const side of [-1, 1])
    tube(
      covering,
      [...Array.from({ length: 31 }, (_, i) => roofSurface(side > 0 ? 1 : 0, i / 30)), [side * 0.53, 0.845, -1]],
      0.005,
      m.black,
    );

  const glass = part(
    root,
    'rear-glass',
    'Rigid heated rear glass',
    [0, 0, 0],
    [0, 0.17, -0.44],
    'The rear window stays one rigid pane while the surrounding roof folds. Its separate heating loom supplies resistance elements, independently of the roof motor. Element pattern and the short wire shown are illustrative, not factory wiring or routing.',
  );
  const glassPoint = (x: number, t: number) => [x, 1.205 - t * 0.36, -0.62 - t * 0.38 - 0.003];
  panel(
    glass,
    [glassPoint(-0.385, 0.2), glassPoint(0.385, 0.2), glassPoint(0.385, 0.8), glassPoint(-0.385, 0.8)],
    m.glass,
  );
  tube(
    glass,
    [
      glassPoint(-0.385, 0.2),
      glassPoint(0.385, 0.2),
      glassPoint(0.385, 0.8),
      glassPoint(-0.385, 0.8),
      glassPoint(-0.385, 0.2),
    ],
    0.009,
    m.black,
  );
  for (let i = 0; i < 7; i++)
    beam(glass, glassPoint(-0.36, 0.27 + i * 0.075), glassPoint(0.36, 0.27 + i * 0.075), 0.0014, m.warm);
  for (const side of [-1, 1]) beam(glass, glassPoint(side * 0.36, 0.24), glassPoint(side * 0.36, 0.76), 0.004, m.warm);
  tube(glass, [glassPoint(0.36, 0.73), [0.43, 0.9, -0.95], [0.51, 0.84, -0.99]], 0.005, m.black);
  box(glass, [0.025, 0.015, 0.03], m.dark, [0.51, 0.84, -0.99]);

  const motor = part(
    root,
    'motor-shafts',
    'Motor and two shafts',
    [0, 0.72, -1.06],
    [0, -0.25, -0.15],
    'One reversible electric motor supplies both sides. Two flexible rotary shafts transmit its turning motion to separate gearboxes; they are not pull cables. Their visible curves identify connectivity rather than the installed route.',
  );
  cylinder(motor, 0.045, 0.19, m.dark, [0, 0, 0]);
  box(motor, [0.13, 0.065, 0.07], m.metal, [0, -0.035, 0.045]);
  for (const side of [-1, 1]) {
    cylinder(motor, 0.018, 0.04, m.warm, [side * 0.115, 0, 0]);
    tube(
      motor,
      [
        [side * 0.125, 0, 0],
        [side * 0.31, 0.02, 0.025],
        [side * 0.48, 0.015, 0.16],
        [side * 0.57, 0.025, 0.23],
      ],
      0.013,
      m.black,
    );
    cylinder(motor, 0.02, 0.035, m.metal, [side * 0.57, 0.025, 0.23]);
  }

  const drives = part(
    root,
    'side-drives',
    'Side gearboxes and rods',
    [0, 0, 0],
    [0, -0.16, 0.4],
    'Each side gearbox reduces speed and drives levers with jointed rods. These paths move the folding frame and compartment cover together. Left and right must remain coordinated; the displayed pivots are not setting positions.',
  );
  for (const side of [-1, 1]) {
    const x = side * 0.57,
      y = 0.745,
      z = -0.83;
    cylinder(drives, 0.085, 0.035, m.dark, [x, y, z]);
    cylinder(drives, 0.055, 0.04, m.metal, [x, y, z]);
    cylinder(drives, 0.021, 0.05, m.warm, [x, y, z]);
    box(drives, [0.055, 0.075, 0.055], m.dark, [x, y + 0.035, z - 0.06]);
    const pivot = [x + side * 0.035, y, z];
    const frontEnd = [x + side * 0.035, y + 0.035, z + 0.115];
    const rearEnd = [x + side * 0.035, y + 0.1, z - 0.125];
    beam(drives, frontEnd, pivot, 0.014, m.warm);
    beam(drives, pivot, rearEnd, 0.014, m.warm);
    beam(drives, frontEnd, [side * 0.56, 0.76, -0.87], 0.009, m.metal);
    beam(drives, rearEnd, [side * 0.6, 0.81, -1.27], 0.009, m.metal);
    for (const point of [pivot, frontEnd, rearEnd, [side * 0.56, 0.76, -0.87], [side * 0.6, 0.81, -1.27]] as const)
      sphere(drives, 0.018, m.warm, point);
    beam(drives, [side * 0.63, 0.79, -0.87], [side * 0.61, 0.8, -1.1], 0.015, m.green);
  }

  const well = part(
    root,
    'cover-well',
    'Cover and stowage well',
    [0, 0.61, -1.1],
    [0, 0.03, -0.54],
    'The moving compartment cover conceals a well immediately behind the occupants. It is separate from the rear boot lid. The well is shown as an open cutaway; the folded roof is not represented inside this closed-roof view.',
  );
  box(well, [1.22, 0.025, 0.43], m.black, [0, -0.015, 0]);
  for (const side of [-1, 1]) box(well, [0.025, 0.15, 0.43], m.dark, [side * 0.61, 0.045, 0]);
  box(well, [1.22, 0.15, 0.025], m.dark, [0, 0.045, -0.215]);
  for (const side of [-1, 1])
    panel(
      well,
      [
        [side * 0.48, 0.19, 0.17],
        [side * 0.69, 0.18, 0.17],
        [side * 0.69, 0.18, -0.25],
        [side * 0.48, 0.19, -0.25],
      ],
      m.green,
    );
  panel(
    well,
    [
      [-0.69, 0.18, -0.25],
      [0.69, 0.18, -0.25],
      [0.59, 0.205, -0.39],
      [-0.59, 0.205, -0.39],
    ],
    m.green,
  );
  for (const side of [-1, 1]) beam(well, [side * 0.57, 0.11, -0.17], [side * 0.6, 0.2, -0.27], 0.012, m.metal);

  const drains = part(
    root,
    'drainage',
    'Side pans and drains',
    [0, 0, 0],
    [0, -0.32, 0.05],
    'Left and right drip pans have separate filter elements and drain pipes. The filters intercept debris but still need inspection and cleaning. Separate drive-area drain plates and compartment-seal hoses also appear in PET. These simplified drops do not map all concealed routes.',
  );
  for (const side of [-1, 1]) {
    const x = side * 0.66;
    const floor = new THREE.Shape();
    floor.moveTo(-0.08, -0.225);
    floor.lineTo(0.08, -0.225);
    floor.lineTo(0.08, 0.225);
    floor.lineTo(-0.08, 0.225);
    floor.closePath();
    const outlet = new THREE.Path();
    outlet.absarc(0, 0.15, 0.019, 0, Math.PI * 2, true);
    floor.holes.push(outlet);
    const panFloor = new THREE.ExtrudeGeometry(floor, {
      depth: 0.015,
      bevelEnabled: false,
      curveSegments: 24,
    });
    panFloor.rotateX(-Math.PI / 2);
    mesh(drains, panFloor, m.blue, [x, 0.6725, -0.84]);
    for (const edge of [-1, 1]) box(drains, [0.015, 0.065, 0.45], m.blue, [x + edge * 0.075, 0.71, -0.84]);
    box(drains, [0.16, 0.065, 0.015], m.blue, [x, 0.71, -0.615]);
    annulus(drains, 0.028, 0.018, 0.03, m.dark, [x, 0.66, -0.99]).rotation.set(-Math.PI / 2, 0, 0);
    // Open filter grille above the outlet: water can pass through its gaps.
    annulus(drains, 0.035, 0.029, 0.008, m.dark, [x, 0.7, -0.99]).rotation.set(-Math.PI / 2, 0, 0);
    for (const offset of [-0.016, 0, 0.016]) {
      beam(drains, [x - 0.025, 0.702, -0.99 + offset], [x + 0.025, 0.702, -0.99 + offset], 0.002, m.metal);
      beam(drains, [x + offset, 0.702, -1.015], [x + offset, 0.702, -0.965], 0.002, m.metal);
    }
    tube(
      drains,
      [
        [x, 0.66, -0.99],
        [x + side * 0.02, 0.53, -1.02],
        [x + side * 0.035, 0.34, -1.05],
        [x + side * 0.055, 0.24, -1.08],
      ],
      0.016,
      m.black,
    );
  }

  const seals = part(
    root,
    'roof-seals',
    'Roof and compartment seals',
    [0, 0, 0],
    [0.25, 0.18, 0.22],
    'Separate roof-frame, B-pillar and roof-arch seals meet neighbouring surfaces; retaining strips hold them to the frame. The stowage box has its own seal. Contact paths are schematic, with no seal profile, adjustment dimension or concealed drainage route implied.',
  );
  tube(
    seals,
    Array.from({ length: 61 }, (_, i) => windscreenPoint(i / 60, 1).map((n, axis) => n - (axis === 1 ? 0.008 : 0))),
    0.013,
    m.black,
  );
  for (const side of [-1, 1]) {
    tube(
      seals,
      Array.from({ length: 31 }, (_, i) =>
        roofSurface(side > 0 ? 1 : 0, (i / 30) * 0.85).map((n, axis) => n - (axis === 1 ? 0.034 : 0)),
      ),
      0.012,
      m.black,
    );
    tube(
      seals,
      [
        [side * 0.55, 1.165, -0.4],
        [side * 0.52, 0.98, -0.77],
        [side * 0.56, 0.8, -0.87],
      ],
      0.016,
      m.black,
    );
  }
  tube(
    seals,
    [
      [-0.56, 0.82, -0.87],
      [-0.3, 0.83, -1.01],
      [0, 0.83, -1.05],
      [0.3, 0.83, -1.01],
      [0.56, 0.82, -0.87],
    ],
    0.012,
    m.black,
  );
  tube(
    seals,
    [
      [-0.62, 0.78, -0.93],
      [-0.62, 0.78, -1.31],
      [0, 0.79, -1.36],
      [0.62, 0.78, -1.31],
      [0.62, 0.78, -0.93],
    ],
    0.011,
    m.black,
  );
  return root;
}
