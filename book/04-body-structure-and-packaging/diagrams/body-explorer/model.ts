import * as THREE from 'three';
import { assembly, beam, box, materials, mesh, part } from '../../../../interactive/three/component-geometry.ts';
import type { ExplorerConfig } from '../../../../interactive/types';

import { palette } from '../../../../interactive/models/boxster/surfaces.ts';
import { windscreenFrame } from '../../../../interactive/models/boxster/windscreen.ts';

export const config: ExplorerConfig = {
  id: 'body-explorer',
  title: 'From the car to the body shell',
  location:
    'The 2010 2.9 carries its occupants within a joined shell between the axles. The sills run below the door openings; the floor and tunnel connect the open passenger compartment.',
  overview:
    'Follow the lower shell, seat-support frames, bulkheads and reinforced windscreen frame. The rear cabin wall has a separate engine-access cover behind its trim; the fabric hood and luggage lids are other closures.',
  assembled:
    'The formed floor and raised tunnel connect the sills. A seat-support frame sits on each side of the tunnel. The front bulkhead and rear cabin wall complete the cabin boundaries; a small removable cover closes a service opening in the rear wall.',
  exploded:
    'The floor, tunnel, reinforced sills, seat supports and bulkheads are joined body regions. The separate rear-wall access cover is a service part. Offsets distinguish these relationships without specifying cuts, joints or removal order.',
  focus: 'floor',
  hideCarParts: ['chassis', 'windscreen-frame'],
  direction: [1.2, 1.05, 1.5],
  note: 'PET-backed assembly identities; shapes and positions are illustrative. Glazing, trim, outer closures and roof mechanism are omitted. The rear-wall service cover is shown separately. No seam map, cutting sequence or structural performance prediction.',
  connections: [
    {
      from: 'floor',
      to: 'left-sill',
      label: 'Floor and transverse members join the left side structure',
      kind: 'structure',
    },
    {
      from: 'floor',
      to: 'right-sill',
      label: 'Floor and transverse members join the right side structure',
      kind: 'structure',
    },
    {
      from: 'floor',
      to: 'tunnel',
      label: 'Formed centre region connects the two floor areas',
      kind: 'structure',
    },
    {
      from: 'front-bulkhead',
      to: 'left-sill',
      label: 'Front cabin region joins the left sill',
      kind: 'structure',
    },
    {
      from: 'front-bulkhead',
      to: 'right-sill',
      label: 'Front cabin region joins the right sill',
      kind: 'structure',
    },
    {
      from: 'rear-bulkhead',
      to: 'floor',
      label: 'Rear cabin wall joins the lower shell',
      kind: 'structure',
    },
    {
      from: 'windscreen-frame',
      to: 'front-bulkhead',
      label: 'Reinforced frame continues into the front cabin structure',
      kind: 'structure',
    },
    {
      from: 'tunnel',
      to: 'front-bulkhead',
      label: 'Centre tunnel meets the front transverse region',
      kind: 'structure',
    },
    {
      from: 'rear-bulkhead',
      to: 'left-sill',
      label: 'Rear transverse region joins the side structure',
      kind: 'structure',
    },
    {
      from: 'rear-bulkhead',
      to: 'right-sill',
      label: 'Rear transverse region joins the side structure',
      kind: 'structure',
    },
    {
      from: 'seat-supports',
      to: 'floor',
      label: 'Left and right seat-support frames join the floor beside the tunnel',
      kind: 'structure',
    },
    {
      from: 'rear-service-cover',
      to: 'rear-bulkhead',
      label: 'Removable cover closes the rear-wall service opening behind the cabin trim',
      kind: 'mechanical',
    },
  ],
};

// Hollow formed section. This teaches section depth, not Porsche's exact profile.
function sillSection(
  parent: THREE.Object3D<THREE.Object3DEventMap>,
  surface: THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[],
) {
  const outline = [
    [-0.075, -0.08],
    [0.075, -0.08],
    [0.09, 0.05],
    [0.045, 0.13],
    [-0.045, 0.13],
    [-0.09, 0.05],
  ];
  const shape = new THREE.Shape();
  outline.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const opening = new THREE.Path();
  [...outline]
    .reverse()
    .forEach(([x, y], i) => (i ? opening.lineTo(x * 0.65, y * 0.65) : opening.moveTo(x * 0.65, y * 0.65)));
  opening.closePath();
  shape.holes.push(opening);
  const section = new THREE.ExtrudeGeometry(shape, { depth: 1.55, steps: 1, bevelEnabled: false });
  section.translate(0, 0, -0.775);
  mesh(parent, section, surface);
  // Joining flange and an inner longitudinal reinforcement remain visible.
  box(parent, [0.026, 0.018, 1.55], surface, [-0.09, -0.065, 0]);
  box(parent, [0.026, 0.018, 1.55], surface, [0.09, -0.065, 0]);
}

// The rear access cover has a lower clearance notch in PET 807-005, item 10.
// Its outline here preserves that distinction without copying factory dimensions.
function accessOutline(target: THREE.Path, inset = 0) {
  target.moveTo(-0.26 + inset, 0.025);
  target.lineTo(-0.1, 0.025);
  target.quadraticCurveTo(-0.1, 0.15, 0, 0.15);
  target.quadraticCurveTo(0.1, 0.15, 0.1, 0.025);
  target.lineTo(0.26 - inset, 0.025);
  target.lineTo(0.26 - inset, 0.29);
  target.lineTo(0.2, 0.35 - inset);
  target.lineTo(-0.2, 0.35 - inset);
  target.lineTo(-0.26 + inset, 0.29);
  target.closePath();
}

function formedWall(
  parent: THREE.Object3D<THREE.Object3DEventMap>,
  surface: THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[],
  width: number,
  height: number,
  access = false,
) {
  if (access) {
    const wall = new THREE.Shape();
    wall.moveTo(-width / 2, 0);
    wall.lineTo(width / 2, 0);
    wall.lineTo(width / 2, height);
    wall.lineTo(-width / 2, height);
    wall.closePath();
    const opening = new THREE.Path();
    accessOutline(opening, 0.012);
    wall.holes.push(opening);
    mesh(parent, new THREE.ExtrudeGeometry(wall, { depth: 0.022, bevelEnabled: false }), surface);
  } else {
    box(parent, [width, height, 0.022], surface, [0, height / 2, 0]);
  }
  box(parent, [width, 0.055, 0.09], surface, [0, 0, -0.025]);
  box(parent, [width, 0.07, 0.085], surface, [0, height, -0.025]);
  for (const x of [-0.46, -0.23, 0.23, 0.46]) {
    if (access && Math.abs(x) < 0.3) continue;
    box(parent, [0.028, height * 0.78, 0.042], surface, [x, height / 2, -0.028]);
  }
}

export function createAssembly() {
  const root = assembly('body-shell');
  const m = materials();
  const floor = part(
    root,
    'floor',
    'Floor and crossmembers',
    [0, 0.255, 0.1],
    [0, -0.28, 0],
    'PET 801-020 separates the formed floor from the left and right seat-support frames. Its raised centre is the tunnel, shown separately here to explain the section. Ribs, dimensions and seams remain illustrative rather than a factory pressing or weld map.',
  );
  for (const side of [-1, 1]) {
    box(floor, [0.52, 0.025, 1.55], m.metal, [side * 0.38, 0, 0]);
    box(floor, [0.02, 0.065, 1.55], m.green, [side * 0.64, 0.025, 0]);
    for (const x of [0.23, 0.38, 0.53]) box(floor, [0.022, 0.018, 1.28], m.metal, [side * x, 0.022, 0.015]);
  }
  for (const z of [-0.68, 0.68]) {
    box(floor, [1.28, 0.055, 0.065], m.green, [0, 0.03, z]);
    box(floor, [1.3, 0.014, 0.095], m.metal, [0, 0.063, z]);
  }
  const supports = part(
    root,
    'seat-supports',
    'Seat-support frames',
    [0, 0.285, 0.1],
    [0, 0.24, 0.1],
    'PET 801-020, item 2, identifies separate left and right formed seat-support frames beside the centre tunnel. Their open shapes support the seat mounting regions above the floor. They are joined body parts; the separation here does not imply bolt-on removal.',
  );
  for (const side of [-1, 1]) {
    const centre = side * 0.38;
    for (const x of [-0.225, 0.225]) box(supports, [0.045, 0.065, 1.02], m.warm, [centre + x, 0.025, 0]);
    for (const z of [-0.49, 0.03, 0.49]) box(supports, [0.49, 0.065, 0.055], m.warm, [centre, 0.025, z]);
  }
  const left = part(
    root,
    'left-sill',
    'Left sill',
    [0.705, 0.34, 0.1],
    [0.43, 0, 0],
    'The left sill contains more than an outer skin: PET 801-050 distinguishes the sill and its inner reinforcement. Its floor and pillar connections share loads around the open roof. This hollow section and inner web illustrate those layers without specifying their production profiles.',
  );
  sillSection(left, m.green);
  box(left, [0.014, 0.14, 1.48], m.metal, [0, 0.015, 0]);
  const right = part(
    root,
    'right-sill',
    'Right sill',
    [-0.705, 0.34, 0.1],
    [-0.43, 0, 0],
    'The right sill forms the corresponding lower side of the shell. The floor and transverse connections join it to the opposite side; neither sill acts as an isolated beam.',
  );
  sillSection(right, m.green);
  box(right, [0.014, 0.14, 1.48], m.metal, [0, 0.015, 0]);
  const tunnel = part(
    root,
    'tunnel',
    'Centre tunnel',
    [0, 0.285, 0.1],
    [0, 0.3, 0],
    'The raised centre tunnel is a formed region of the lower shell. It joins the floor areas and transverse regions; it is not a separate ladder chassis. Trim above it is not represented.',
  );
  box(tunnel, [0.19, 0.025, 1.55], m.green, [0, 0.145, 0]);
  for (const side of [-1, 1]) {
    box(tunnel, [0.025, 0.145, 1.55], m.green, [side * 0.095, 0.065, 0]);
    box(tunnel, [0.055, 0.015, 1.55], m.metal, [side * 0.12, 0, 0]);
  }
  for (const z of [-0.5, -0.15, 0.2, 0.55]) box(tunnel, [0.2, 0.018, 0.03], m.metal, [0, 0.166, z]);
  const front = part(
    root,
    'front-bulkhead',
    'Front bulkhead region',
    [0, 0.285, 0.875],
    [0, 0.12, 0.4],
    'Ahead of the footwells, the front bulkhead region joins the lower cabin, the side structures and the base of the windscreen frame. Its transverse connection is part of the shell rather than a luggage lid.',
  );
  formedWall(front, m.warm, 1.42, 0.32);
  // Two shallow toe-board slopes connect the wall to the floor.
  for (const side of [-1, 1]) box(front, [0.49, 0.024, 0.25], m.metal, [side * 0.36, 0.035, -0.11], [0.18, 0, 0]);
  const rear = part(
    root,
    'rear-bulkhead',
    'Rear cabin wall',
    [0, 0.285, -0.675],
    [0, 0.15, -0.42],
    'The rear cabin wall meets the floor and side structure. PET 807-005 distinguishes its rear-panel trim, crossmember trim and small engine-access cover from the larger cover above the engine. The opening and stiffeners are simplified; the wall is not a removable engine cover.',
  );
  formedWall(rear, m.warm, 1.42, 0.47, true);
  const service = part(
    root,
    'rear-service-cover',
    'Rear-wall service cover',
    [0, 0.285, -0.642],
    [0.58, 0.58, 0.25],
    'The separate rear-wall engine-access cover is PET 807-005, item 10, behind cabin trim items 11 and 12. It is different from the top engine cover, item 5, and its seal, item 7. The lower notch and stiffening ribs are schematic; no removal sequence or seal specification is inferred.',
  );
  const cover = new THREE.Shape();
  accessOutline(cover);
  mesh(service, new THREE.ExtrudeGeometry(cover, { depth: 0.018, bevelEnabled: false }), m.metal);
  for (const side of [-1, 1]) {
    beam(service, [side * 0.16, 0.07, 0.025], [side * 0.13, 0.27, 0.025], 0.012, m.green);
  }
  const frame = part(
    root,
    'windscreen-frame',
    'Windscreen frame',
    [0, 0, 0],
    [0, 0.38, 0.1],
    'The windscreen frame contains a reinforced steel element and continues into the front cabin structure. Its outer shape is shared with the car; the internal steel reinforcement is not separately sectioned. Glass stays with the fading car context. This is not a folding roof bow.',
  );
  windscreenFrame(frame, palette());
  return root;
}
