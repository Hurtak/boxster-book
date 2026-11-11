import * as THREE from 'three';
import { assembly, part, materials, box, mesh, tube, beam } from '../../../../interactive/three/component-geometry.js';

import { windscreenFrame } from '../../../../interactive/models/boxster/windscreen.js';
import { palette } from '../../../../interactive/models/boxster/surfaces.js';

export const config = {
  id: 'body-explorer',
  title: 'From the car to the body shell',
  location: 'The 2010 2.9 carries its occupants within a joined shell between the axles. The sills run below the door openings; the floor and tunnel connect the open passenger compartment.',
  overview: 'Follow the lower shell, seat-support frames, bulkheads and reinforced windscreen frame. The rear cabin wall has a separate engine-access cover behind its trim; the fabric hood and luggage lids are other closures.',
  assembled: 'The formed floor and raised tunnel connect the sills. A seat-support frame sits on each side of the tunnel. The front bulkhead and rear cabin wall complete the cabin boundaries; a small removable cover closes a service opening in the rear wall.',
  exploded: 'The floor, tunnel, reinforced sills, seat supports and bulkheads are joined body regions. The separate rear-wall access cover is a service part. Offsets distinguish these relationships without specifying cuts, joints or removal order.',
  focus: 'floor',
  hideCarParts: ['chassis', 'windscreen-frame'],
  direction: [1.2, 1.05, 1.5],
  note: 'PET-backed assembly identities; shapes and positions are illustrative. Glazing, trim, outer closures and roof mechanism are omitted. The rear-wall service cover is shown separately. No seam map, cutting sequence or structural performance prediction.',
  connections: [
    { from: 'floor', to: 'left-sill', label: 'Floor and transverse members join the left side structure', kind: 'structure' },
    { from: 'floor', to: 'right-sill', label: 'Floor and transverse members join the right side structure', kind: 'structure' },
    { from: 'floor', to: 'tunnel', label: 'Formed centre region connects the two floor areas', kind: 'structure' },
    { from: 'front-bulkhead', to: 'left-sill', label: 'Front cabin region joins the left sill', kind: 'structure' },
    { from: 'front-bulkhead', to: 'right-sill', label: 'Front cabin region joins the right sill', kind: 'structure' },
    { from: 'rear-bulkhead', to: 'floor', label: 'Rear cabin wall joins the lower shell', kind: 'structure' },
    { from: 'windscreen-frame', to: 'front-bulkhead', label: 'Reinforced frame continues into the front cabin structure', kind: 'structure' },
    { from: 'tunnel', to: 'front-bulkhead', label: 'Centre tunnel meets the front transverse region', kind: 'structure' },
    { from: 'rear-bulkhead', to: 'left-sill', label: 'Rear transverse region joins the side structure', kind: 'structure' },
    { from: 'rear-bulkhead', to: 'right-sill', label: 'Rear transverse region joins the side structure', kind: 'structure' },
    { from: 'seat-supports', to: 'floor', label: 'Left and right seat-support frames join the floor beside the tunnel', kind: 'structure' },
    { from: 'rear-service-cover', to: 'rear-bulkhead', label: 'Removable cover closes the rear-wall service opening behind the cabin trim', kind: 'mechanical' },
  ],
};

// Hollow formed section. This teaches section depth, not Porsche's exact profile.
function sillSection(parent, surface) {
  const outline = [[-.075, -.08], [.075, -.08], [.09, .05], [.045, .13], [-.045, .13], [-.09, .05]];
  const shape = new THREE.Shape();
  outline.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  const opening = new THREE.Path();
  [...outline].reverse().forEach(([x, y], i) => i ? opening.lineTo(x * .65, y * .65) : opening.moveTo(x * .65, y * .65));
  opening.closePath();
  shape.holes.push(opening);
  const section = new THREE.ExtrudeGeometry(shape, { depth: 1.55, steps: 1, bevelEnabled: false });
  section.translate(0, 0, -.775);
  mesh(parent, section, surface);
  // Joining flange and an inner longitudinal reinforcement remain visible.
  box(parent, [.026, .018, 1.55], surface, [-.09, -.065, 0]);
  box(parent, [.026, .018, 1.55], surface, [.09, -.065, 0]);
}

// The rear access cover has a lower clearance notch in PET 807-005, item 10.
// Its outline here preserves that distinction without copying factory dimensions.
function accessOutline(target, inset = 0) {
  target.moveTo(-.26 + inset, .025);
  target.lineTo(-.1, .025);
  target.quadraticCurveTo(-.1, .15, 0, .15);
  target.quadraticCurveTo(.1, .15, .1, .025);
  target.lineTo(.26 - inset, .025);
  target.lineTo(.26 - inset, .29);
  target.lineTo(.2, .35 - inset);
  target.lineTo(-.2, .35 - inset);
  target.lineTo(-.26 + inset, .29);
  target.closePath();
}

function formedWall(parent, surface, width, height, access = false) {
  if (access) {
    const wall = new THREE.Shape();
    wall.moveTo(-width / 2, 0);
    wall.lineTo(width / 2, 0);
    wall.lineTo(width / 2, height);
    wall.lineTo(-width / 2, height);
    wall.closePath();
    const opening = new THREE.Path();
    accessOutline(opening, .012);
    wall.holes.push(opening);
    mesh(parent, new THREE.ExtrudeGeometry(wall, { depth: .022, bevelEnabled: false }), surface);
  } else {
    box(parent, [width, height, .022], surface, [0, height / 2, 0]);
  }
  box(parent, [width, .055, .09], surface, [0, 0, -.025]);
  box(parent, [width, .07, .085], surface, [0, height, -.025]);
  for (const x of [-.46, -.23, .23, .46]) {
    if (access && Math.abs(x) < .3) continue;
    box(parent, [.028, height * .78, .042], surface, [x, height / 2, -.028]);
  }
}

export function createAssembly() {
  const root = assembly('body-shell');
  const m = materials();
  const floor = part(root, 'floor', 'Floor and crossmembers', [0, .255, .1], [0, -.28, 0], 'PET 801-020 separates the formed floor from the left and right seat-support frames. Its raised centre is the tunnel, shown separately here to explain the section. Ribs, dimensions and seams remain illustrative rather than a factory pressing or weld map.');
  for (const side of [-1, 1]) {
    box(floor, [.52, .025, 1.55], m.metal, [side * .38, 0, 0]);
    box(floor, [.02, .065, 1.55], m.green, [side * .64, .025, 0]);
    for (const x of [.23, .38, .53]) box(floor, [.022, .018, 1.28], m.metal, [side * x, .022, .015]);
  }
  for (const z of [-.68, .68]) {
    box(floor, [1.28, .055, .065], m.green, [0, .03, z]);
    box(floor, [1.3, .014, .095], m.metal, [0, .063, z]);
  }
  const supports = part(root, 'seat-supports', 'Seat-support frames', [0, .285, .1], [0, .24, .1], 'PET 801-020, item 2, identifies separate left and right formed seat-support frames beside the centre tunnel. Their open shapes support the seat mounting regions above the floor. They are joined body parts; the separation here does not imply bolt-on removal.');
  for (const side of [-1, 1]) {
    const centre = side * .38;
    for (const x of [-.225, .225]) box(supports, [.045, .065, 1.02], m.warm, [centre + x, .025, 0]);
    for (const z of [-.49, .03, .49]) box(supports, [.49, .065, .055], m.warm, [centre, .025, z]);
  }
  const left = part(root, 'left-sill', 'Left sill', [.705, .34, .1], [.43, 0, 0], 'The left sill contains more than an outer skin: PET 801-050 distinguishes the sill and its inner reinforcement. Its floor and pillar connections share loads around the open roof. This hollow section and inner web illustrate those layers without specifying their production profiles.');
  sillSection(left, m.green);
  box(left, [.014, .14, 1.48], m.metal, [0, .015, 0]);
  const right = part(root, 'right-sill', 'Right sill', [-.705, .34, .1], [-.43, 0, 0], 'The right sill forms the corresponding lower side of the shell. The floor and transverse connections join it to the opposite side; neither sill acts as an isolated beam.');
  sillSection(right, m.green);
  box(right, [.014, .14, 1.48], m.metal, [0, .015, 0]);
  const tunnel = part(root, 'tunnel', 'Centre tunnel', [0, .285, .1], [0, .3, 0], 'The raised centre tunnel is a formed region of the lower shell. It joins the floor areas and transverse regions; it is not a separate ladder chassis. Trim above it is not represented.');
  box(tunnel, [.19, .025, 1.55], m.green, [0, .145, 0]);
  for (const side of [-1, 1]) {
    box(tunnel, [.025, .145, 1.55], m.green, [side * .095, .065, 0]);
    box(tunnel, [.055, .015, 1.55], m.metal, [side * .12, 0, 0]);
  }
  for (const z of [-.5, -.15, .2, .55]) box(tunnel, [.2, .018, .03], m.metal, [0, .166, z]);
  const front = part(root, 'front-bulkhead', 'Front bulkhead region', [0, .285, .875], [0, .12, .4], 'Ahead of the footwells, the front bulkhead region joins the lower cabin, the side structures and the base of the windscreen frame. Its transverse connection is part of the shell rather than a luggage lid.');
  formedWall(front, m.warm, 1.42, .32);
  // Two shallow toe-board slopes connect the wall to the floor.
  for (const side of [-1, 1]) box(front, [.49, .024, .25], m.metal, [side * .36, .035, -.11], [.18, 0, 0]);
  const rear = part(root, 'rear-bulkhead', 'Rear cabin wall', [0, .285, -.675], [0, .15, -.42], 'The rear cabin wall meets the floor and side structure. PET 807-005 distinguishes its rear-panel trim, crossmember trim and small engine-access cover from the larger cover above the engine. The opening and stiffeners are simplified; the wall is not a removable engine cover.');
  formedWall(rear, m.warm, 1.42, .47, true);
  const service = part(root, 'rear-service-cover', 'Rear-wall service cover', [0, .285, -.642], [.58, .58, .25], 'The separate rear-wall engine-access cover is PET 807-005, item 10, behind cabin trim items 11 and 12. It is different from the top engine cover, item 5, and its seal, item 7. The lower notch and stiffening ribs are schematic; no removal sequence or seal specification is inferred.');
  const cover = new THREE.Shape();
  accessOutline(cover);
  mesh(service, new THREE.ExtrudeGeometry(cover, { depth: .018, bevelEnabled: false }), m.metal);
  for (const side of [-1, 1]) {
    beam(service, [side * .16, .07, .025], [side * .13, .27, .025], .012, m.green);
  }
  const frame = part(root, 'windscreen-frame', 'Windscreen frame', [0, 0, 0], [0, .38, .1], 'The windscreen frame contains a reinforced steel element and continues into the front cabin structure. Its outer shape is shared with the car; the internal steel reinforcement is not separately sectioned. Glass stays with the fading car context. This is not a folding roof bow.');
  windscreenFrame(frame, palette());
  return root;
}
