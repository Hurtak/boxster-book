import * as THREE from 'three';
import { assembly, part, materials, box, cylinder, annulus, mesh, beam, gear } from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'drivetrain-explorer',
  title: 'From the car to the rear drive',
  location: 'The 2010 2.9 has its engine behind the seats, a transaxle extending rearwards and a short CV shaft to each rear hub.',
  overview: 'The gearbox drives the differential, then two jointed shafts turn the rear hubs. A forward engine mount and two transmission supports connect the joined power unit to the body.',
  assembled: 'The two shafts lie across the rear axle. The differential is inside the transaxle; its carrier drives the bevel gears and output flanges. Mounts support the housings, while hub bearings carry wheel loads.',
  exploded: 'The cutaway case, differential, shafts and hubs separate to reveal the drive path and its supports. These offsets illustrate relationships, not a removal order or suspension movement.',
  focus: 'differential',
  hideCarParts: ['engine', 'gearbox', 'chassis', 'wheel-rl', 'wheel-rr'],
  direction: [1.4, .95, 1.35],
  note: 'Manual baseline with a generic open differential. Gear teeth, bearing sections, mount shapes and positions are illustrative; the PDK has different internals and supports.',
  connections: [
    { from: 'engine', to: 'transaxle', label: 'Drive passes through the clutch and selected gearbox ratio', kind: 'mechanical' },
    { from: 'transaxle', to: 'differential', label: 'Final reduction drives the differential carrier', kind: 'mechanical' },
    { from: 'differential', to: 'left-shaft', label: 'Left output flange delivers torque', kind: 'mechanical' },
    { from: 'differential', to: 'right-shaft', label: 'Right output flange delivers torque', kind: 'mechanical' },
    { from: 'left-shaft', to: 'left-hub', label: 'Splined outer end turns the hub', kind: 'mechanical' },
    { from: 'right-shaft', to: 'right-hub', label: 'Splined outer end turns the hub', kind: 'mechanical' },
    { from: 'engine', to: 'front-mount', label: 'Compliant support carries weight and housing reaction', kind: 'structure' },
    { from: 'engine', to: 'transaxle', label: 'Bolted housings form one supported power unit', kind: 'structure' },
  ],
};

function boot(parent, centre, surface) {
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const radius = .026 + Math.sin(t * Math.PI) * .021;
    mesh(parent, new THREE.TorusGeometry(radius, .007, 8, 28), surface, [centre + (t - .5) * .098, 0, 0], [0, Math.PI / 2, 0]);
  }
}

function shaft(parent, side, m) {
  cylinder(parent, .021, .39, m.metal);
  for (const x of [-.2, .2]) {
    cylinder(parent, .055, .052, m.metal, [x, 0, 0]);
    boot(parent, x * .66, m.black);
    for (const dx of [-.023, .023]) annulus(parent, .058, .043, .007, m.dark, [x + dx, 0, 0]);
  }
  cylinder(parent, .029, .15, m.metal, [side * .245, 0, 0]);
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    box(parent, [.09, .006, .006], m.dark, [side * .27, Math.cos(angle) * .029, Math.sin(angle) * .029], [angle, 0, 0]);
  }
}

function hubAndCarrier(parent, side, m) {
  // Carrier and outer bearing ring stay with the suspension, not the shaft.
  annulus(parent, .10, .061, .09, m.green);
  for (const z of [-.075, .075]) beam(parent, [0, .04, z * .45], [0, .14, z], .024, m.green);
  beam(parent, [0, -.06, 0], [-side * .025, -.14, -.045], .025, m.green);
  for (const [y, z] of [[.14, -.075], [.14, .075], [-.14, -.045]]) cylinder(parent, .032, .055, m.green, [0, y, z]);
  annulus(parent, .059, .037, .075, m.metal);
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    mesh(parent, new THREE.SphereGeometry(.008, 10, 8), m.warm, [side * .035, Math.cos(angle) * .048, Math.sin(angle) * .048]);
  }
  cylinder(parent, .035, .15, m.metal, [side * .025, 0, 0]);
  const flange = new THREE.Shape();
  flange.absarc(0, 0, .087, 0, Math.PI * 2, false);
  const centre = new THREE.Path();
  centre.absarc(0, 0, .032, 0, Math.PI * 2, true);
  flange.holes.push(centre);
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    const hole = new THREE.Path();
    hole.absarc(Math.cos(angle) * .065, Math.sin(angle) * .065, .0065, 0, Math.PI * 2, true);
    flange.holes.push(hole);
  }
  const geometry = new THREE.ExtrudeGeometry(flange, { depth: .018, bevelEnabled: false, curveSegments: 24 });
  geometry.translate(0, 0, -.009);
  mesh(parent, geometry, m.metal, [side * .07, 0, 0], [0, Math.PI / 2, 0]);
  mesh(parent, new THREE.CylinderGeometry(.028, .028, .018, 6), m.dark, [side * .09, 0, 0], [0, 0, Math.PI / 2]);
}

export function createAssembly() {
  const root = assembly('rear-drivetrain');
  const m = materials();
  const engine = part(root, 'engine', 'Engine', [0, .48, -.78], [0, .3, .3], 'The flat-six sits ahead of the rear axle. Its crankshaft supplies the clutch and gearbox; the bolted engine and transmission housings move together on compliant supports.');
  box(engine, [.48, .23, .49], m.metal);
  for (const side of [-1, 1]) {
    box(engine, [.13, .22, .52], m.dark, [side * .34, 0, 0]);
    for (const z of [-.16, 0, .16]) cylinder(engine, .07, .15, m.metal, [side * .245, 0, z]);
    for (let i = 0; i < 7; i++) box(engine, [.15, .014, .52], m.metal, [side * .34, -.085 + i * .028, 0]);
  }
  const mount = part(root, 'front-mount', 'Front engine mount', [0, .48, -.46], [0, .1, .5], 'A bracket and compliant support connect the forward engine region to the body. The mount carries weight and torque reaction while isolating some vibration; it is not a rotating drive component.');
  annulus(mount, .082, .063, .15, m.metal);
  annulus(mount, .061, .022, .135, m.black);
  cylinder(mount, .022, .2, m.metal);
  for (const side of [-1, 1]) {
    box(mount, [.07, .13, .07], m.green, [side * .13, -.015, -.025]);
    box(mount, [.12, .025, .12], m.green, [side * .2, -.08, -.025]);
    beam(mount, [side * .1, .025, 0], [side * .2, -.06, -.025], .018, m.metal);
  }
  const transaxle = part(root, 'transaxle', 'Gearbox and mounts', [0, .37, -1.43], [0, .15, -.4], 'The gearbox and final drive share a case behind the engine. The cutaway exposes their relationship; two transmission-end supports carry housing loads into the body. The illustrated teeth are not a factory gear layout.');
  // Open left/top case shows the final drive; ribs retain an identifiable housing.
  box(transaxle, [.34, .025, .73], m.metal, [0, -.12, .02]);
  box(transaxle, [.025, .23, .73], m.metal, [-.17, -.005, .02]);
  for (const z of [-.29, -.16, -.03, .10, .23]) {
    box(transaxle, [.035, .27, .025], m.dark, [-.18, .005, z]);
    box(transaxle, [.35, .035, .025], m.dark, [0, -.13, z]);
  }
  mesh(transaxle, new THREE.TorusGeometry(.20, .025, 10, 40, Math.PI * 1.5), m.metal, [0, .015, .35]);
  cylinder(transaxle, .13, .04, m.metal, [0, 0, -.35], [Math.PI / 2, 0, 0]);
  cylinder(transaxle, .023, .56, m.dark, [.045, -.015, -.03], [Math.PI / 2, 0, 0]);
  for (const z of [-.24, -.12]) gear(transaxle, .074, .035, m.warm, [.045, -.015, z], 14);
  for (const side of [-1, 1]) {
    beam(transaxle, [side * .14, -.015, -.15], [side * .34, .035, -.15], .028, m.metal);
    cylinder(transaxle, .065, .045, m.black, [side * .34, .055, -.15], [0, 0, 0]);
    cylinder(transaxle, .071, .012, m.metal, [side * .34, .083, -.15], [0, 0, 0]);
    box(transaxle, [.14, .02, .11], m.green, [side * .34, .10, -.15]);
  }
  const differential = part(root, 'differential', 'Open differential', [0, .329, -1.2075], [0, .38, -.1], 'The final-drive ring turns the carrier. Its bevel pinions connect two side gears and output flanges, allowing different wheel speeds. This open unit omits the optional locking differential’s friction packs.');
  annulus(differential, .165, .121, .028, m.warm, [-.105, 0, 0]);
  for (let i = 0; i < 28; i++) {
    const angle = i * Math.PI * 2 / 28;
    box(differential, [.035, .022, .026], m.warm, [-.105, Math.cos(angle) * .161, Math.sin(angle) * .161], [angle, 0, 0]);
  }
  for (const side of [-1, 1]) {
    annulus(differential, .106, .08, .02, m.metal, [side * .105, 0, 0]);
    cylinder(differential, .045, .105, m.metal, [side * .167, 0, 0]);
    cylinder(differential, .063, .018, m.dark, [side * .22, 0, 0]);
    mesh(differential, new THREE.CylinderGeometry(.034, .067, .037, 24), m.warm, [side * .058, 0, 0], [0, 0, side * Math.PI / 2]);
    for (const z of [-.08, .08]) beam(differential, [-.1, .04, z], [.1, .04, z], .012, m.metal);
  }
  cylinder(differential, .012, .17, m.dark, [0, 0, 0], [0, 0, 0]);
  for (const side of [-1, 1]) mesh(differential, new THREE.CylinderGeometry(.022, .045, .036, 20), m.warm, [0, side * .054, 0], [side > 0 ? Math.PI : 0, 0, 0]);
  const leftShaft = part(root, 'left-shaft', 'Left CV shaft', [.45, .329, -1.2075], [.34, -.1, .12], 'The left shaft carries drive through a CV joint at each end. Flexible boots retain grease and exclude dirt; joint articulation and plunge accommodate changing suspension and power-unit positions.');
  shaft(leftShaft, 1, m);
  const rightShaft = part(root, 'right-shaft', 'Right CV shaft', [-.45, .329, -1.2075], [-.34, -.1, -.12], 'The right shaft performs the same drive function on the opposite side. This symmetric teaching shape does not establish equal factory shaft lengths or interchangeability between manual and PDK applications.');
  shaft(rightShaft, -1, m);
  const leftHub = part(root, 'left-hub', 'Left hub and carrier', [.76, .329, -1.2075], [.67, .04, .24], 'The splined hub rotates with the wheel and disc. Its bearing transfers wheel loads into the stationary carrier, which the suspension locates. The five flange openings receive wheel bolts, not fixed studs.');
  hubAndCarrier(leftHub, 1, m);
  const rightHub = part(root, 'right-hub', 'Right hub and carrier', [-.76, .329, -1.2075], [-.67, .04, -.24], 'The opposite hub rotates inside its wheel bearing while the carrier follows suspension movement. The cutaway separates the road-load support from the rotating torque path; discs and wheels are omitted here.');
  hubAndCarrier(rightHub, -1, m);
  return root;
}
