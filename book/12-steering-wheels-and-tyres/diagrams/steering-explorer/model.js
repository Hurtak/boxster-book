import * as THREE from 'three';
import { assembly, part, materials, group, box, cylinder, annulus, mesh, beam, tube, sphere } from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'steering-explorer',
  title: 'From the car to the steering',
  location: 'The steering gear sits across the front axle region. The column reaches it in this left-hand-drive layout; hydraulic lines run to the engine-driven pump behind the seats. UK right-hand-drive gear and line variants differ.',
  overview: 'The column turns the pinion, the rack moves both track rods, and the front carriers steer. The pump assists that mechanical path. The rim supports the tyre at its bead seats; the tyre meets the road.',
  assembled: 'The rack, joints and steering arms form a continuous mechanical connection. Supply and return lines add hydraulic assistance; the wheel rotates in its carrier while the carrier sets its direction.',
  exploded: 'The display separates steering, assistance and the front-left rolling assembly. Rim and tyre move apart to expose their bead-seat relationship; these offsets are not steering movement or a removal sequence.',
  focus: 'rack',
  hideCarParts: ['chassis', 'wheel-fl'],
  direction: [1.35, 1, 1.25],
  note: 'Factory parts relationships: PET 403-000/001/003/005, 401-005 and 601-000. Rack cutaway, belt segment and fluid paths are schematic. Standard front size: 7J×17, ET55, 205/55 ZR17 tyre. Cooler, brakes, suspension arms and optional TPM are omitted; small fittings and tread are illustrative.',
  connections: [
    { from: 'column', to: 'rack', label: 'Column rotation drives the pinion', kind: 'mechanical' },
    { from: 'pump', to: 'hydraulic-lines', label: 'Pump supplies fluid and receives the return', kind: 'fluid' },
    { from: 'hydraulic-lines', to: 'rack', label: 'Pressure and return connect the steering assistance circuit', kind: 'fluid' },
    { from: 'rack', to: 'left-link', label: 'Rack travel moves the left track rod and steering arm', kind: 'mechanical' },
    { from: 'rack', to: 'right-link', label: 'Rack travel moves the right track rod and steering arm', kind: 'mechanical' },
    { from: 'left-link', to: 'rim', label: 'The hub supports and locates the bolted wheel', kind: 'mechanical' },
    { from: 'rim', to: 'tyre', label: 'Tyre beads seat against the rim', kind: 'structure' },
  ],
};

function steeringWheel(parent, surface) {
  const wheel = group('steering-wheel-form', parent);
  wheel.rotation.x = -.4;
  mesh(wheel, new THREE.TorusGeometry(.174, .018, 12, 48), surface);
  cylinder(wheel, .057, .05, surface, [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (const angle of [-Math.PI / 6, Math.PI * 7 / 6, Math.PI / 2]) {
    beam(wheel, [Math.cos(angle) * .045, Math.sin(angle) * .045, 0], [Math.cos(angle) * .16, Math.sin(angle) * .16, 0], .018, surface);
  }
}

function ballJoint(parent, position, surface, black) {
  sphere(parent, .022, surface, position);
  cylinder(parent, .014, .045, black, [position[0], position[1] + .018, position[2]], [0, 0, 0]);
}

function frontLink(root, side, m) {
  const label = side > 0 ? 'Left rod and carrier' : 'Right rod and carrier';
  const name = side > 0 ? 'left-link' : 'right-link';
  const base = [side * .6, .329, 1.2075];
  const object = part(root, name, label, base, [side * .3, .04, .2], 'The inner joint under the protective bellows joins the rack to the threaded rod; the outer ball-jointed end turns the carrier through its steering arm. The carrier locates the bearing; the hub and wheel rotate within it. PET 403-000 items 2/6/8 and 401-005 items 1/2/9 identify these parts. Suspension arms and the brake are omitted.');
  const local = ([x, y, z]) => [x - base[0], y - base[1], z - base[2]];
  const inner = [side * .43, .33, 1.19], outer = [side * .675, .33, 1.09];
  beam(object, local(inner), local(outer), .012, m.metal);
  // PET 403-000 item 6: an articulated inner connection, protected by item 2.
  sphere(object, .021, m.dark, local([side * .435, .33, 1.188]));
  for (let i = 0; i < 7; i++) {
    const x = side * (.425 + i * .011);
    cylinder(object, .032 - i * .0015, .009, m.black, local([x, .33, 1.19 - i * .002]));
  }
  ballJoint(object, local(outer), m.metal, m.black);
  cylinder(object, .018, .025, m.warm, local([side * .575, .33, 1.13]));
  const bearing = local([side * .74, .329, 1.2075]);
  annulus(object, .083, .045, .065, m.metal, bearing);
  cylinder(object, .041, .105, m.dark, local([side * .765, .329, 1.2075]));
  annulus(object, .073, .033, .018, m.metal, local([side * .815, .329, 1.2075]));
  beam(object, local(outer), local([side * .715, .34, 1.17]), .022, m.green);
  beam(object, local([side * .72, .29, 1.21]), local([side * .69, .48, 1.2]), .028, m.green);
  annulus(object, .047, .029, .07, m.green, local([side * .69, .48, 1.2])).rotation.set(Math.PI / 2, 0, 0);
  for (const y of [.29, .37]) box(object, [.07, .025, .035], m.green, local([side * .71, y, 1.15]));
  return object;
}

export function createAssembly() {
  const root = assembly('steering-and-front-wheel');
  const m = materials();
  const column = part(root, 'column', 'Wheel and column', [.43, .88, .47], [.2, .32, -.1], 'The driver turns a shaft through the steering column and articulated intermediate shaft. PET 403-005 items 1/2 identify the standard manual-car assembly; 403-004 treats optional PDK wheel controls separately. This left-hand-drive illustration reaches the pinion mechanically; the column is not an electric-assistance unit.');
  steeringWheel(column, m.black);
  beam(column, [0, 0, .035], [-.05, -.32, .37], .018, m.metal);
  beam(column, [-.05, -.32, .37], [-.23, -.52, .66], .015, m.metal);
  for (const position of [[-.05, -.32, .37], [-.23, -.52, .66]]) {
    sphere(column, .025, m.dark, position);
    box(column, [.04, .025, .045], m.metal, position);
  }
  box(column, [.08, .06, .13], m.dark, [-.025, -.16, .19], [-.6, 0, 0]);

  const rack = part(root, 'rack', 'Rack and assistance', [0, .33, 1.19], [0, -.12, .36], 'The pinion converts column rotation into transverse rack travel. A fluid-pressure difference across the rack piston supplies assistance. The open half casing exposes that principle rather than Porsche’s exact internal machining.');
  cylinder(rack, .018, .87, m.metal);
  for (const x of [-.31, .31]) {
    annulus(rack, .055, .023, .19, m.dark, [x, 0, 0]);
    annulus(rack, .065, .053, .025, m.metal, [x + Math.sign(x) * .065, 0, 0]);
    box(rack, [.055, .04, .095], m.green, [x, -.052, 0]);
  }
  mesh(rack, new THREE.CylinderGeometry(.052, .052, .43, 32, 1, true, 0, Math.PI), m.metal, [0, 0, 0], [0, 0, Math.PI / 2]);
  cylinder(rack, .046, .025, m.blue, [-.11, 0, 0]);
  for (const x of [-.18, -.15, -.12, -.09, -.06, -.03, 0, .03, .06, .09, .12, .15, .18]) box(rack, [.016, .016, .025], m.metal, [x, .02, 0]);
  cylinder(rack, .043, .1, m.dark, [.2, .045, -.035], [.9, 0, 0]);
  for (const x of [-.2, .25]) {
    cylinder(rack, .012, .045, m.warm, [x, .052, -.025], [0, 0, 0]);
    tube(rack, [[x, .07, -.025], [x, .08, -.06], [.2, .075, -.08]], .006, m.warm);
  }

  const pump = part(root, 'pump', 'Pump and reservoir', [.25, .65, -.58], [.32, .2, -.25], 'An engine-driven belt turns the hydraulic pump. The reservoir mounts directly above it, with a cover and sealed connection; PET 403-003 identifies these separately from the pulley and support. Pressure and return lines connect the rear power unit to the front steering gear. The belt shown is only a drive indication.');
  cylinder(pump, .055, .11, m.metal, [0, 0, 0], [Math.PI / 2, 0, 0]);
  cylinder(pump, .075, .018, m.black, [0, 0, .073], [Math.PI / 2, 0, 0]);
  for (const z of [.064, .069, .074, .079]) cylinder(pump, .076, .002, m.dark, [0, 0, z], [Math.PI / 2, 0, 0]);
  // Broad reservoir over a narrower connection follows PET 403-003 item 1.
  box(pump, [.16, .065, .13], m.black, [0, .11, -.025]);
  cylinder(pump, .027, .055, m.black, [0, .055, -.025], [0, 0, 0]);
  cylinder(pump, .028, .035, m.dark, [.018, .156, .005], [0, 0, 0]);
  cylinder(pump, .036, .013, m.black, [.018, .180, .005], [0, 0, 0]);
  for (const x of [-.065, .065]) box(pump, [.025, .09, .04], m.metal, [x, -.045, -.02]);
  tube(pump, [[-.068, .03, .083], [-.09, -.1, .083], [-.11, -.18, .083]], .009, m.black);
  tube(pump, [[.067, .03, .083], [.05, -.1, .083], [.03, -.18, .083]], .009, m.black);

  const lines = part(root, 'hydraulic-lines', 'Supply and return', [0, .3, .25], [0, -.18, 0], 'PET 403-001 separates the long pressure/return sections, flexible engine-end sections, holders and a pump-to-heat-exchanger return connection. Orange denotes pressure supply and blue return. The heat exchanger is omitted; line bends and locations are schematic, and UK right-hand-drive listings differ.');
  tube(lines, [[.25, .35, -.83], [.2, .08, -.6], [.18, -.015, -.3], [.18, -.015, .6], [.24, .05, .9], [.25, .1, .915]], .012, m.warm);
  tube(lines, [[-.2, .1, .915], [-.12, .035, .7], [-.12, -.015, -.3], [-.12, .03, -.65], [.14, .2, -.84], [.25, .39, -.83]], .012, m.blue);
  for (const z of [-.3, .1, .5]) for (const x of [-.12, .18]) cylinder(lines, .017, .035, m.metal, [x, -.015, z], [Math.PI / 2, 0, 0]);

  frontLink(root, 1, m);
  frontLink(root, -1, m);

  const rim = part(root, 'rim', '17-inch front rim', [.76, .329, 1.2075], [.52, .06, .15], 'The standard front rim is 7J×17 ET55: 7 inches between flange faces, a 17-inch bead-seat diameter and a mounting face 55 mm outboard of its centre plane. PET 601-000 lists the wheel, valve and balance weights separately. The hub centre locates the wheel; five wheel bolts clamp it to the hub. Valve position, spoke form and balance weight are illustrative. Optional TPM sensor hardware is not shown.');
  annulus(rim, .216, .204, .1778, m.metal);
  // 7 inches is the separation of the inner flange faces, not flange centrelines.
  for (const x of [-.0949, .0949]) annulus(rim, .227, .202, .012, m.metal, [x, 0, 0]);
  const face = new THREE.Shape();
  face.absarc(0, 0, .076, 0, Math.PI * 2, false);
  const centreHole = new THREE.Path();
  centreHole.absarc(0, 0, .033, 0, Math.PI * 2, true);
  face.holes.push(centreHole);
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    const hole = new THREE.Path();
    hole.absarc(Math.cos(angle) * .065, Math.sin(angle) * .065, .0075, 0, Math.PI * 2, true);
    face.holes.push(hole);
    box(rim, [.025, .145, .035], m.metal, [.04, Math.cos(angle) * .139, Math.sin(angle) * .139], [angle, 0, 0]);
  }
  const flange = new THREE.ExtrudeGeometry(face, { depth: .02, bevelEnabled: false, curveSegments: 24 });
  flange.translate(0, 0, -.01);
  mesh(rim, flange, m.metal, [.055, 0, 0], [0, Math.PI / 2, 0]);
  // Ordinary valve (item 2) and an adhesive balance weight (item 3), not TPM.
  cylinder(rim, .006, .032, m.black, [.099, -.153, .139]);
  box(rim, [.018, .01, .035], m.dark, [-.055, -.206, 0]);

  const tyre = part(root, 'tyre', 'Front tyre and beads', [.76, .329, 1.2075], [.95, .06, .15], 'The nominal 205/55 front tyre seats on a 17-inch rim. Reinforced beads locate its inner edges; the sidewall flexes and the tread meets the road. This unladen geometric model does not predict loaded radius, grip or an exact footprint.');
  const casing = new THREE.TorusGeometry(.272275, .056375, 16, 72);
  casing.rotateY(Math.PI / 2);
  casing.scale(.205 / .11275, 1, 1);
  mesh(tyre, casing, m.black);
  for (const x of [-.083, .083]) {
    const bead = new THREE.TorusGeometry(.216, .0045, 8, 64);
    bead.rotateY(Math.PI / 2);
    mesh(tyre, bead, m.warm, [x, 0, 0]);
  }
  for (let i = 0; i < 72; i++) {
    const angle = i * Math.PI * 2 / 72;
    box(tyre, [.16, .005, .018], m.dark, [0, Math.cos(angle) * .326, Math.sin(angle) * .326], [angle, 0, 0]);
  }
  return root;
}
