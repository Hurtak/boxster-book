import * as THREE from 'three';
import { assembly, part, materials, box, mesh, tube, beam } from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'body-explorer',
  title: 'From the car to the body shell',
  location: 'The 2010 2.9 carries its occupants within a joined shell between the axles. The sills run below the door openings; the floor and tunnel connect the open passenger compartment.',
  overview: 'Follow the lower shell, front and rear bulkheads, and reinforced windscreen frame. These members share loads through their joints; the fabric hood and luggage lids are closures.',
  assembled: 'The floor joins the sides through its formed panels and transverse members. The front bulkhead and rear cabin wall close those lower paths across the car; the windscreen frame rises from the front region.',
  exploded: 'The separated regions reveal how the floor, tunnel, sills and bulkheads belong to one joined shell. The seams and offsets are explanatory, not detachable service modules or a cutting sequence.',
  focus: 'floor',
  hideCarParts: ['chassis', 'interior'],
  direction: [1.2, 1.05, 1.5],
  note: 'Joined-shell concept; openings and formed sections are simplified. Glazing, trim and closures are omitted. The view supplies no seam map, cutting sequence or structural performance prediction.',
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

function formedWall(parent, surface, width, height) {
  box(parent, [width, height, .022], surface, [0, height / 2, 0]);
  box(parent, [width, .055, .09], surface, [0, 0, -.025]);
  box(parent, [width, .07, .085], surface, [0, height, -.025]);
  for (const x of [-.46, -.23, .23, .46]) {
    box(parent, [.028, height * .78, .042], surface, [x, height / 2, -.028]);
  }
}

export function createAssembly() {
  const root = assembly('body-shell');
  const m = materials();
  const floor = part(root, 'floor', 'Floor and crossmembers', [0, .255, .1], [0, -.28, 0], 'Formed floor panels and transverse members connect the two sides of the passenger cell and support the seat regions. The shallow ribs and deeper crossmembers illustrate section shape; their count and positions are not a factory pressing or weld map.');
  for (const side of [-1, 1]) {
    box(floor, [.52, .025, 1.55], m.metal, [side * .38, 0, 0]);
    box(floor, [.02, .065, 1.55], m.green, [side * .64, .025, 0]);
    for (const x of [.23, .38, .53]) box(floor, [.022, .018, 1.28], m.metal, [side * x, .022, .015]);
  }
  for (const z of [-.59, -.17, .2, .65]) {
    box(floor, [1.28, .055, .065], m.green, [0, .03, z]);
    box(floor, [1.3, .014, .095], m.metal, [0, .063, z]);
  }
  const left = part(root, 'left-sill', 'Left sill', [.705, .34, .1], [.43, 0, 0], 'The left sill is a deep side structure below the door opening. Its connections to the floor and front and rear cabin regions help loads pass around the open roof. The visible hollow section is illustrative.');
  sillSection(left, m.green);
  const right = part(root, 'right-sill', 'Right sill', [-.705, .34, .1], [-.43, 0, 0], 'The right sill forms the corresponding lower side of the shell. The floor and transverse connections join it to the opposite side; neither sill acts as an isolated beam.');
  sillSection(right, m.green);
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
  const rear = part(root, 'rear-bulkhead', 'Rear cabin wall', [0, .285, -.675], [0, .15, -.42], 'The wall behind the occupants closes the cabin against the engine region and meets the floor and side structure. Access covers, seals and trim belong to that boundary, but the simplified stiffening shapes here do not specify a removal opening.');
  formedWall(rear, m.warm, 1.42, .47);
  for (const side of [-1, 1]) box(rear, [.31, .1, .075], m.metal, [side * .35, .27, .035]);
  const frame = part(root, 'windscreen-frame', 'Windscreen frame', [0, .605, .875], [0, .38, .1], 'The windscreen frame contains a reinforced steel element and continues into the front cabin structure. This is the metal frame: glass and decorative trim are omitted. It is not a folding roof bow.');
  tube(frame, [[-.69, 0, 0], [-.66, .14, -.09], [-.59, .47, -.36], [-.53, .55, -.4], [0, .57, -.42], [.53, .55, -.4], [.59, .47, -.36], [.66, .14, -.09], [.69, 0, 0]], .028, m.green);
  beam(frame, [-.69, 0, 0], [.69, 0, 0], .026, m.green);
  for (const side of [-1, 1]) box(frame, [.08, .09, .07], m.metal, [side * .66, .015, -.015]);
  return root;
}
