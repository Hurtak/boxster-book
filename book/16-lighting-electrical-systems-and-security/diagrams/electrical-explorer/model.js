import * as THREE from 'three';
import {
  assembly, part, materials, box, cylinder, tube, annulus, mesh, beam, sphere, gear,
} from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'electrical-explorer',
  title: 'From the car to its electrics',
  location: 'The battery is under a cover in the front luggage area. The starter and alternator are on the engine behind the seats; positive cables and body/engine earth connections bridge that distance.',
  overview: 'Follow starting power from the front battery to the rear starter, charging power from the alternator, a protected lamp branch, and the earth return. Driver requests and starting authorisation have a separate control role.',
  assembled: 'The starter pinion engages the flywheel drive for cranking. The running engine drives the alternator by belt. The lamp branch has circuit protection; its return connection is as necessary as its feed.',
  exploded: 'The separated groups expose terminals, the starter drive, alternator windings and pulley, lamp reflector and protected branch. Offsets and cutaways explain relationships, not a removal or electrical testing procedure.',
  focus: 'battery',
  hideCarParts: [],
  reuseCarParts: { headlamp: ['headlamp-1', 'headlamp-cover-1', 'headlamp-cover-1-walls', 'front-lamp-1', 'front-lamp-1-walls', 'lower-light-details-1'] },
  finishInstallation(model) {
    const m = materials(), lamp = model.getObjectByName('headlamp');
    for (const name of ['projector-1', 'high-beam-reflector-1']) {
      const optic = lamp.getObjectByName(name);
      cylinder(optic, .011, .035, m.black, [0, 0, -.045], [Math.PI / 2, 0, 0]);
      sphere(optic, .015, m.glass, [0, 0, -.02], [.7, .7, 1.3]);
      tube(optic, [[-.003, 0, -.006], [0, .003, -.004], [.003, 0, -.006]], .0012, m.warm);
    }
  },
  direction: [1.15, 0.9, 1.65],
  note: 'Standard halogen, left-hand-drive layout. UK right-hand-drive controls, fuse carrier and cables differ. Harness routes, distributor mounting, fuse count and lamp/internal geometry are illustrative; no pinouts or ratings are supplied.',
  connections: [
    { from: 'battery', to: 'positive-feed', label: 'Positive terminal supplies the high-current feed', kind: 'electrical' },
    { from: 'positive-feed', to: 'starter-drive', label: 'High-current branch supplies the starter for cranking', kind: 'electrical' },
    { from: 'alternator-drive', to: 'positive-feed', label: 'Generated DC supplies loads and can recharge the battery', kind: 'electrical' },
    { from: 'positive-feed', to: 'distribution', label: 'Supply branches to circuit protection', kind: 'electrical' },
    { from: 'distribution', to: 'headlamp', label: 'Protected branch supplies the lighting load', kind: 'electrical' },
    { from: 'headlamp', to: 'earth-return', label: 'Lamp current returns through earth connections', kind: 'electrical' },
    { from: 'starter-drive', to: 'earth-return', label: 'Starter case and engine connect to the return network', kind: 'electrical' },
    { from: 'alternator-drive', to: 'earth-return', label: 'Alternator case shares the engine earth connection', kind: 'electrical' },
    { from: 'earth-return', to: 'battery', label: 'Return network connects to battery negative', kind: 'electrical' },
    { from: 'request-controls', to: 'starter-drive', label: 'Authorised starting request controls cranking', kind: 'signal' },
    { from: 'request-controls', to: 'headlamp', label: 'Lighting request is distinct from the lamp power path', kind: 'signal' },
    { from: 'distribution', to: 'request-controls', label: 'Control functions also need a power supply', kind: 'electrical' },
  ],
};

const longitudinal = [Math.PI / 2, 0, 0];

function ringZ(parent, outer, inner, depth, surface, position) {
  const ring = annulus(parent, outer, inner, depth, surface, position);
  ring.rotation.set(0, 0, 0);
  return ring;
}

function lug(parent, position, surface) {
  ringZ(parent, .019, .009, .008, surface, position);
}

function winding(parent, radius, y, length, surface) {
  const points = Array.from({ length: 81 }, (_, i) => {
    const t = i / 80, angle = t * Math.PI * 12;
    return [Math.cos(angle) * radius, y + Math.sin(angle) * radius, (t - .5) * length];
  });
  tube(parent, points, .0025, surface);
}

export function createAssembly() {
  const root = assembly('electrical-systems');
  const m = materials();
  const battery = part(root, 'battery', 'Battery and cover', [0, .66, 1.1], [0, .32, .2],
    'The front battery stores energy and supplies cranking power. Its positive and negative terminals connect to different sides of the circuit. The cover is cut back here to expose those connections.');
  box(battery, [.31, .19, .18], m.black);
  box(battery, [.325, .025, .195], m.dark, [0, .105, 0]);
  for (const side of [-1, 1]) {
    cylinder(battery, .014, .025, m.metal, [side * .115, .13, .045], [0, 0, 0]);
    box(battery, [.047, .025, .04], side > 0 ? m.red : m.black, [side * .115, .12, .045]);
    box(battery, [.018, .018, .025], m.metal, [side * .115, .142, .042]);
  }
  // A partial cover and side flanges retain the under-cover location.
  box(battery, [.36, .022, .08], m.black, [0, .17, -.08]);
  for (const x of [-.175, .175]) box(battery, [.015, .07, .23], m.dark, [x, .14, 0]);
  box(battery, [.18, .008, .06], m.metal, [0, -.098, 0]);
  for (const x of [-.13, .13]) beam(battery, [x, -.1, -.075], [x, -.1, .075], .006, m.metal);

  const positive = part(root, 'positive-feed', 'Positive feed and distributor', [0, .3, 0], [-.3, -.08, 0],
    'Battery positive feeds a power distributor with fuse elements, distinct from the footwell fuse carrier. A long cable reaches the covered engine connection point and starter/alternator wire set. Distributor position, link count and cable route are schematic.');
  tube(positive, [[.115, .5, 1.145], [.16, .24, .9], [.18, .015, .55], [.18, .015, -.55], [.13, .18, -.95]], .011, m.red);
  tube(positive, [[.13, .18, -.95], [.16, .23, -1.05], [.185, .215, -1.05]], .01, m.red);
  tube(positive, [[.13, .18, -.95], [.16, .21, -.7], [.12, .35, -.55]], .009, m.red);
  for (const p of [[.115, .5, 1.145], [.13, .18, -.95]]) {
    lug(positive, p, m.metal);
    box(positive, [.05, .04, .035], m.red, [p[0], p[1] - .025, p[2]]);
  }
  for (const z of [-.55, 0, .55]) ringZ(positive, .017, .012, .012, m.black, [.18, .015, z]);
  // PET 902-005 identifies the distributor/fuse links, not their exact mounting coordinates.
  box(positive, [.13, .15, .045], m.black, [.16, .24, .9]);
  box(positive, [.11, .11, .015], m.dark, [.16, .24, .928]);
  for (const y of [.21, .25, .29]) {
    box(positive, [.067, .014, .009], m.warm, [.16, y, .941]);
    for (const x of [.12, .2]) cylinder(positive, .006, .014, m.metal, [x, y, .946], longitudinal);
  }
  box(positive, [.12, .075, .01], m.blue, [.16, .218, .958]);
  box(positive, [.065, .012, .055], m.metal, [.13, .145, -.95]);
  cylinder(positive, .008, .03, m.warm, [.13, .18, -.95]);

  const distribution = part(root, 'distribution', 'Protection and distribution', [.57, .44, .62], [.28, .17, .15],
    'The driver-footwell fuse panel protects individual circuits. This small set of coloured fuse shapes illustrates protected branches, not the actual fuse count, assignments or ratings. The starter feed is shown separately.');
  box(distribution, [.15, .2, .035], m.black);
  box(distribution, [.13, .18, .012], m.dark, [0, 0, .025]);
  for (let i = 0; i < 6; i++) {
    const x = (i % 3 - 1) * .037, y = (Math.floor(i / 3) - .5) * .065;
    box(distribution, [.025, .036, .022], i % 2 ? m.blue : m.warm, [x, y, .045]);
    for (const dx of [-.006, .006]) box(distribution, [.004, .012, .01], m.metal, [x + dx, y - .025, .04]);
  }
  for (const side of [-1, 1]) tube(distribution, [[side * .05, -.1, .01], [side * .06, -.15, .01], [side * .09, -.18, 0]], .006, side > 0 ? m.red : m.black);

  const earth = part(root, 'earth-return', 'Body and engine earth', [0, .27, 0], [.3, -.1, 0],
    'Battery negative connects to the body, and a separate earth strap joins the engine to the body. Conductive joints complete return paths. The visible rails stand for body continuity, not dedicated return cables running their full length.');
  for (const x of [-.54, .54]) beam(earth, [x, 0, -1.2], [x, 0, 1.15], .014, m.metal);
  beam(earth, [-.54, 0, .7], [.54, 0, .7], .014, m.metal);
  beam(earth, [-.54, 0, -.9], [.54, 0, -.9], .014, m.metal);
  tube(earth, [[-.115, .53, 1.145], [-.21, .33, 1.09], [-.38, .05, 1.07], [-.54, 0, 1.07]], .012, m.black);
  // Parallel strands suggest a flexible bonding strap, not a harness pinout.
  for (const dy of [-.006, 0, .006]) tube(earth, [[.54, dy, -.88], [.42, .04 + dy, -.87], [.28, .13 + dy, -.87]], .003, m.warm);
  for (const p of [[-.54, 0, 1.07], [.54, 0, -.88], [.28, .13, -.87]]) lug(earth, p, m.metal);

  const starter = part(root, 'starter-drive', 'Starter and flywheel drive', [0, .55, -1.18], [.36, .09, -.22],
    'The solenoid engages a small pinion with the flywheel ring gear; the electric motor turns the engine for cranking. The high-current connection is shown beside the cutaway motor. The pinion does not stay engaged once starting is complete.');
  ringZ(starter, .16, .117, .018, m.metal, [0, -.035, 0]);
  for (let i = 0; i < 42; i++) {
    const angle = i * Math.PI * 2 / 42;
    box(starter, [.016, .012, .018], m.metal, [Math.cos(angle) * .161, -.035 + Math.sin(angle) * .161, 0], [0, 0, angle]);
  }
  ringZ(starter, .117, .045, .012, m.dark, [0, -.035, -.012]);
  gear(starter, .025, .032, m.warm, [.186, -.035, 0], 12);
  cylinder(starter, .014, .24, m.metal, [.186, -.035, .11], longitudinal);
  mesh(starter, new THREE.CylinderGeometry(.055, .055, .18, 32, 1, true, 0, Math.PI * 1.4), m.dark, [.186, -.035, .12], longitudinal);
  for (const z of [.025, .215]) cylinder(starter, .056, .015, m.metal, [.186, -.035, z], longitudinal);
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI * 2 / 6;
    beam(starter, [.186 + Math.cos(angle) * .032, -.035 + Math.sin(angle) * .032, .045], [.186 + Math.cos(angle) * .032, -.035 + Math.sin(angle) * .032, .19], .006, m.warm);
  }
  cylinder(starter, .027, .105, m.metal, [.186, .052, .12], longitudinal);
  for (const x of [.175, .2]) cylinder(starter, .006, .018, m.warm, [x, .052, .182], longitudinal);
  box(starter, [.045, .015, .07], m.dark, [.186, .012, .12]);

  const alternator = part(root, 'alternator-drive', 'Alternator and belt drive', [.12, .65, -.57], [-.36, .28, -.15],
    'The engine belt turns the alternator pulley and rotor. Windings generate AC; rectification supplies DC to the vehicle. This cutaway omits most casing and shows only part of the accessory belt circuit.');
  mesh(alternator, new THREE.CylinderGeometry(.076, .076, .125, 40, 1, true, 0, Math.PI * 1.35), m.metal, [0, 0, 0], longitudinal);
  for (const z of [-.071, .071]) ringZ(alternator, .077, .023, .012, m.metal, [0, 0, z]);
  cylinder(alternator, .024, .19, m.dark, [0, 0, .025], longitudinal);
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI * 2 / 8;
    const x = Math.cos(angle) * .052, y = Math.sin(angle) * .052;
    beam(alternator, [x, y, -.055], [x, y, .055], .009, m.warm);
  }
  winding(alternator, .025, 0, .09, m.warm);
  cylinder(alternator, .05, .03, m.dark, [0, 0, .112], longitudinal);
  for (const z of [.101, .11, .119]) ringZ(alternator, .052, .045, .004, m.metal, [0, 0, z]);
  cylinder(alternator, .082, .025, m.dark, [-.12, -.19, .112], longitudinal);
  cylinder(alternator, .032, .027, m.dark, [.11, -.12, .112], longitudinal);
  tube(alternator, [[-.18, -.14, .116], [-.19, -.21, .116], [-.12, -.27, .116], [.1, -.155, .116], [.14, -.12, .116], [.045, .025, .116], [0, .052, .116], [-.045, .025, .116], [-.18, -.14, .116]], .007, m.black);
  box(alternator, [.07, .035, .025], m.black, [0, -.052, -.088]);
  for (let i = 0; i < 5; i++) box(alternator, [.004, .026, .023], m.metal, [-.027 + i * .013, -.05, -.106]);

  const headlamp = part(root, 'headlamp', 'Halogen and lower light unit', [.68, .61, 1.65], [.26, .18, .2],
    'The standard main headlamp contains separate H7 and H9 halogen road-light bulbs and a direction-indicator bulb. A carrier and connector locate the assembly. The lower module combines a rectangular fog lamp with an LED position-light module. These optics are illustrative.');
  const reflector = m.metal.clone();
  reflector.side = THREE.DoubleSide;
  const profile = [[.014, -.055], [.035, -.048], [.07, -.025], [.105, .02], [.12, .06]].map(([r, y]) => new THREE.Vector2(r, y));
  const mainReflector = mesh(headlamp, new THREE.LatheGeometry(profile, 40), reflector, [.032, .027, .01], longitudinal);
  mainReflector.scale.setScalar(.65);
  const secondReflector = mesh(headlamp, new THREE.LatheGeometry(profile, 32), reflector, [-.055, -.051, .025], longitudinal);
  secondReflector.scale.setScalar(.36);
  sphere(headlamp, .122, m.glass, [0, 0, .068], [1, 1, .24]);
  for (const [x, y] of [[.032, .027], [-.055, -.051]]) {
    cylinder(headlamp, .011, .035, m.black, [x, y, -.013], longitudinal);
    sphere(headlamp, .015, m.glass, [x, y, .015], [.7, .7, 1.3]);
    for (const dx of [-.003, .003]) beam(headlamp, [x + dx, y, 0], [x + dx, y, .026], .0012, m.metal);
    tube(headlamp, [[x - .003, y, .026], [x, y + .003, .028], [x + .003, y, .026]], .0012, m.warm);
  }
  box(headlamp, [.075, .015, .014], m.warm, [.018, -.086, .052]);
  ringZ(headlamp, .125, .118, .018, m.black, [0, 0, .06]);
  box(headlamp, [.23, .012, .13], m.dark, [0, -.13, -.018]);
  box(headlamp, [.04, .028, .025], m.black, [0, -.1, -.05]);
  box(headlamp, [.2, .06, .06], m.dark, [0, -.19, .095]);
  box(headlamp, [.075, .032, .011], m.metal, [-.052, -.19, .128]);
  box(headlamp, [.065, .022, .006], m.glass, [-.052, -.19, .137]);
  for (let i = 0; i < 5; i++) box(headlamp, [.018, .012, .008], m.glass, [-.02 + i * .027, -.18, .129]);

  const controls = part(root, 'request-controls', 'Ignition and lighting controls', [.43, .7, .51], [.13, .34, 0],
    'The ignition system checks the code in the key’s transponder before permitting starting; a separate circuit requests cranking. The lighting switch requests a lighting mode. These controls and symbolic electronics do not depict module brackets, CAN topology or security procedures.');
  cylinder(controls, .028, .035, m.metal, [0, 0, 0], longitudinal);
  box(controls, [.013, .008, .05], m.metal, [0, 0, .04]);
  sphere(controls, .03, m.black, [0, 0, .076], [1, .72, .33]);
  box(controls, [.018, .01, .009], m.blue, [0, 0, .086]);
  box(controls, [.085, .065, .025], m.dark, [.13, 0, 0]);
  cylinder(controls, .024, .02, m.black, [.13, 0, .025], longitudinal);
  box(controls, [.008, .019, .005], m.metal, [.13, .005, .037]);
  for (const x of [.103, .13, .157]) box(controls, [.004, .005, .003], m.metal, [x, .026, .017]);
  box(controls, [.11, .055, .035], m.blue, [.055, -.075, -.03]);
  for (let i = 0; i < 5; i++) box(controls, [.009, .009, .013], m.metal, [.02 + i * .017, -.11, -.03]);
  tube(controls, [[0, 0, -.02], [.015, -.04, -.035], [.035, -.075, -.035]], .004, m.blue);
  tube(controls, [[.13, -.035, 0], [.11, -.055, -.02], [.075, -.075, -.035]], .004, m.blue);
  return root;
}
