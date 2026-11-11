import * as THREE from 'three';
import { assembly, part, materials, box, cylinder, annulus, mesh, tube, beam, sphere, coil, gear, group } from '../../../../interactive/three/component-geometry.js';

import { manualGearLever } from '../../../../interactive/models/boxster/cabin.js';
import { palette } from '../../../../interactive/models/boxster/surfaces.js';

export const config = {
  id: 'manual-explorer',
  title: 'From the car to the manual gearbox',
  location: 'The standard six-speed manual sits behind the 2010 2.9 engine. Its clutch faces the engine; the final drive sends torque sideways to the rear wheels.',
  overview: 'Follow engine torque through the flywheel, single dry clutch and gearbox. Pedal, master cylinder and hydraulic line command a separate slave/lever release; the cabin lever selects gears through two cables.',
  assembled: 'The clutch and gearbox input share a longitudinal axis. The final drive belongs to the same transaxle and connects to the rear half-shafts. The open housing exposes representative gear pairs.',
  exploded: 'Separation reveals one driven plate, pressure assembly, bearing/guide sleeve and the pedal-to-slave circuit. The synchroniser is lifted from one example gear path; offsets are not working travel or dismantling order.',
  focus: 'clutch',
  hideCarParts: ['gearbox', 'chassis', 'gear-lever'],
  direction: [1.3, .9, -1.6],
  note: 'G87/10 concept checked against PET 102-000, 301-000/005, 302-000/005, 501-005, 701-000 and 702-000/008. Two pairs are not a six-ratio shaft plan. Geometry/routing and the LHD pedal location are illustrative; UK/RHD feed pipes differ. No S-model X-Tend is assigned.',
  connections: [
    { from: 'engine-interface', to: 'flywheel', label: 'Crankshaft drives the engine-side flywheel mass', kind: 'mechanical' },
    { from: 'flywheel', to: 'clutch', label: 'Flywheel face and pressure plate clamp one driven disc', kind: 'mechanical' },
    { from: 'clutch', to: 'geartrain', label: 'Disc hub transmits torque to the input shaft', kind: 'mechanical' },
    { from: 'pedal-hydraulics', to: 'release', label: 'Pedal-driven master sends fluid pressure to the separate slave', kind: 'fluid' },
    { from: 'release', to: 'clutch', label: 'Slave, lever and bearing relieve the diaphragm clamp', kind: 'mechanical' },
    { from: 'selector', to: 'synchroniser', label: 'Two cables command selector and fork movement', kind: 'mechanical' },
    { from: 'synchroniser', to: 'geartrain', label: 'Sleeve locks a selected gear to its shaft after speed matching', kind: 'mechanical' },
    { from: 'geartrain', to: 'final-drive', label: 'Selected drive reaches final reduction and differential', kind: 'mechanical' },
  ],
};

// Axial stack along Z. The generic section is deliberately open for inspection.
const zAxis = [Math.PI / 2, 0, 0];
function axialRing(parent, outer, inner, depth, material, z = 0) {
  const result = annulus(parent, outer, inner, depth, material, [0, 0, z]);
  result.rotation.set(0, 0, 0);
  return result;
}

export function createAssembly() {
  const root = assembly('manual-transaxle');
  const m = materials();
  const engine = part(root, 'engine-interface', 'Engine interface', [0, .47, -1.03], [0, 0, .31], 'The rear crankshaft flange drives the flywheel. This small engine-end section locates the connection; the flat-six itself is explained in the engine chapter.');
  cylinder(engine, .075, .115, m.metal, [0, 0, .045], zAxis);
  cylinder(engine, .112, .018, m.dark, [0, 0, -.016], zAxis);
  for (const a of [0, 1, 2, 3, 4, 5]) {
    const angle = a * Math.PI / 3;
    cylinder(engine, .008, .02, m.metal, [Math.cos(angle) * .087, Math.sin(angle) * .087, -.029], zAxis);
  }

  const flywheel = part(root, 'flywheel', 'Dual-mass flywheel', [0, .47, -1.14], [0, .2, .2], 'Engine-side and clutch-side masses remain connected through torsional springs. Their relative movement is angular; the displayed separation only exposes the concept.');
  axialRing(flywheel, .145, .039, .024, m.dark, .017);
  axialRing(flywheel, .131, .04, .018, m.metal, -.014);
  axialRing(flywheel, .039, .016, .076, m.metal, .046);
  const starterRing = gear(flywheel, .142, .014, m.metal, [0, 0, .025], 40);
  starterRing.name = 'starter-ring-concept';
  for (const side of [-1, 1]) {
    coil(flywheel, [-.065, side * .078, .001], [.065, side * .078, .001], .012, .004, m.warm, 9);
  }

  const clutch = part(root, 'clutch', 'Dry clutch', [0, .47, -1.1855], [0, .4, -.04], 'One driven plate has friction lining on both faces. The pressure plate clamps it against the flywheel; its central splined hub drives the gearbox input.');
  axialRing(clutch, .115, .045, .009, m.dark, .015);
  axialRing(clutch, .113, .066, .003, m.warm, .021);
  axialRing(clutch, .113, .066, .003, m.warm, .009);
  axialRing(clutch, .032, .018, .028, m.metal, .015);
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    box(clutch, [.012, .005, .022], m.metal, [Math.cos(angle) * .025, Math.sin(angle) * .025, .015], [0, 0, angle]);
  }
  axialRing(clutch, .12, .052, .018, m.metal, -.0015);
  axialRing(clutch, .127, .116, .044, m.green, -.022);
  // Spokes stand for the diaphragm fingers, not a factory finger/bolt count.
  for (let i = 0; i < 14; i++) {
    const angle = i * Math.PI * 2 / 14;
    beam(clutch, [Math.cos(angle) * .038, Math.sin(angle) * .038, -.045], [Math.cos(angle) * .095, Math.sin(angle) * .095, -.027], .005, m.dark);
  }

  const release = part(root, 'release', 'Clutch release', [0, .47, -1.245], [.42, .14, .01], 'A separate slave pushes the pivoted lever. The release bearing slides on a guide sleeve around the input shaft and acts on the diaphragm; it relieves spring clamping force. PET 301-000 items 3–5 and 10; 301-005 item 1.');
  axialRing(release, .042, .021, .027, m.metal);
  // The stationary sleeve fits inside the sliding bearing, clear of the shaft.
  axialRing(release, .0205, .0185, .075, m.dark, -.021);
  for (const y of [-.036, .036]) beam(release, [.026, y, -.003], [.145, y * .4, -.025], .009, m.green);
  beam(release, [.145, -.018, -.025], [.145, .075, -.085], .012, m.green);
  sphere(release, .016, m.metal, [.145, -.018, -.025]);
  cylinder(release, .025, .1, m.metal, [.145, .075, -.16], zAxis);
  beam(release, [.145, .075, -.11], [.145, .075, -.085], .009, m.metal);
  tube(release, [[.145, .075, -.2], [.17, .12, -.18], [.18, .16, -.11]], .009, m.blue);

  const pedal = part(root, 'pedal-hydraulics', 'Pedal and master', [.48, .43, .52], [.18, .34, .1], 'The pedal drives the master cylinder; a separate feed supplies brake-reservoir fluid and a pressure line reaches the slave. The pedal also has an assist spring. PET 702-000/008; LHD position and pipe paths are illustrative.');
  beam(pedal, [0, .13, .08], [0, -.12, -.025], .012, m.metal);
  cylinder(pedal, .018, .08, m.dark, [0, .13, .08]);
  box(pedal, [.07, .055, .018], m.black, [0, -.12, -.025], [-.25, 0, 0]);
  beam(pedal, [0, .085, .06], [0, .1, .1], .006, m.metal);
  cylinder(pedal, .023, .12, m.metal, [0, .1, .16], zAxis);
  box(pedal, [.08, .06, .10], m.glass, [0, .29, .16]);
  cylinder(pedal, .019, .015, m.dark, [0, .3275, .16], [0, 0, 0]);
  tube(pedal, [[0, .26, .16], [.025, .21, .15], [.025, .12, .14]], .007, m.blue);
  coil(pedal, [.045, .14, .07], [.045, .065, .015], .014, .003, m.warm, 7);
  box(pedal, [.06, .025, .08], m.green, [.015, .145, .07]);
  tube(pedal, [[0, .1, .22], [-.06, -.1, .1], [-.28, -.13, -.4], [-.30, -.13, -1.6], [-.30, .20, -1.875]], .007, m.blue);

  const transmission = part(root, 'geartrain', 'Gearbox and input', [0, .47, -1.55], [0, -.08, -.25], 'Two representative constant-mesh pairs show an input and a selected output path. They do not reproduce all six ratios, reverse, or the real G87/10 shaft and bearing layout.');
  beam(transmission, [0, 0, .39], [0, 0, -.235], .018, m.metal);
  beam(transmission, [.17, 0, .19], [.17, 0, -.235], .021, m.metal);
  for (const [z, a, b] of [[.09, .065, .105], [-.09, .095, .075]]) {
    gear(transmission, a, .035, m.metal, [0, 0, z]);
    gear(transmission, b, .035, m.warm, [.17, 0, z]);
  }
  box(transmission, [.43, .025, .5], m.green, [.065, -.125, -.015]);
  for (const x of [-.15, .28]) {
    box(transmission, [.025, .105, .5], m.metal, [x, -.085, -.015]);
    for (const z of [-.2, -.1, 0, .1, .2]) box(transmission, [.04, .13, .012], m.green, [x, -.08, z]);
  }
  const housingFront = group('open-bellhousing', transmission, [0, .035, .275]);
  for (const side of [-1, 1]) beam(housingFront, [side * .145, -.085, .03], [side * .12, -.1, -.09], .018, m.metal);
  beam(housingFront, [-.145, -.085, .03], [.145, -.085, .03], .016, m.metal);

  const synchroniser = part(root, 'synchroniser', 'Synchroniser and fork', [.17, .47, -1.55], [.35, .32, -.17], 'A shaft-linked hub carries a sliding sleeve. Cone friction matches speed before dog teeth lock the selected gear; the fork moves the sleeve, not the working gear pair out of mesh.');
  axialRing(synchroniser, .052, .021, .025, m.dark);
  axialRing(synchroniser, .061, .047, .031, m.blue);
  axialRing(synchroniser, .057, .026, .012, m.warm, .033);
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    box(synchroniser, [.012, .008, .02], m.metal, [Math.cos(angle) * .049, Math.sin(angle) * .049, .043], [0, 0, angle]);
  }
  for (const side of [-1, 1]) beam(synchroniser, [side * .055, .005, -.002], [side * .055, .085, -.002], .007, m.green);
  beam(synchroniser, [-.055, .085, -.002], [.055, .085, -.002], .009, m.green);
  beam(synchroniser, [0, .085, -.15], [0, .085, .15], .009, m.metal);

  const selector = part(root, 'selector', 'Lever and cables', [0, 0, 0], [0, .25, .18], 'The cabin lever sends cross-gate and fore-and-aft commands through two cables to the gearbox selector. Brackets retain the cable housings; the inner cables move. PET 701-000 items 1, 3, 25–26; routes and joints are schematic.');
  manualGearLever(selector, palette());
  sphere(selector, .024, m.metal, [0, .57, -.015]);
  for (const x of [-.034, .034]) {
    tube(selector, [[x, .56, -.075], [x, .37, -.18], [x + .03, .34, -.78], [.17 + x, .555, -1.53]], .008, m.black);
    cylinder(selector, .014, .055, m.metal, [.17 + x, .555, -1.53], zAxis);
    box(selector, [.036, .012, .045], m.green, [.17 + x, .537, -1.53]);
  }

  const final = part(root, 'final-drive', 'Final drive and shafts', [0, .329, -1.2075], [0, -.23, -.13], 'The transaxle final drive turns longitudinal input into drive for the rear differential and half-shafts. The two shafts reach rotating hubs; their articulated joints accommodate suspension movement.');
  cylinder(final, .082, .24, m.dark);
  const ring = gear(final, .115, .027, m.metal, [.105, 0, 0], 28);
  ring.rotation.y = Math.PI / 2;
  for (const side of [-1, 1]) {
    beam(final, [side * .12, 0, 0], [side * .74, 0, 0], .019, m.metal);
    for (const x of [.2, .65]) {
      sphere(final, .044, m.dark, [side * x, 0, 0], [1.35, 1, 1]);
      for (let j = 0; j < 4; j++) cylinder(final, .04 - j * .003, .012, m.black, [side * (x + (j - 1.5) * .011), 0, 0]);
    }
    cylinder(final, .075, .035, m.metal, [side * .76, 0, 0]);
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5;
      cylinder(final, .006, .012, m.dark, [side * .783, Math.cos(angle) * .049, Math.sin(angle) * .049]);
    }
  }
  return root;
}
