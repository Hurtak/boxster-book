import * as THREE from 'three';
import { assembly, part, materials, mesh, box, cylinder, tube, annulus, beam, sphere, coil } from '../../../../interactive/three/component-geometry.js';

import { roadWheel } from '../../../../interactive/models/boxster/wheel.js';

export const config = {
  id: 'suspension-explorer',
  title: 'From the car to the front suspension',
  location: 'This is the front-left corner of the standard 2010 2.9. The hub sits inside the wheel; the coil-over strut rises to the body above it.',
  overview: 'The strut, lower arm and fore/aft guide locate the carrier. The steering tie rod turns it. The anti-roll bar connects movement across the axle through its drop links.',
  assembled: 'Follow the shared joints: carrier to strut and lower arm, guide to lower arm, steering tie rod to carrier, and drop link to strut. The front hub has a retaining bolt, not a driven half-shaft. The translucent wheel exposes these connections.',
  exploded: 'Separating the groups reveals the spring seats, protective bellows and auxiliary stop around the damper rod, plus the thrust bearing below the body mount. The hub and its speed sensor stay with the carrier group. These offsets do not show a service sequence.',
  focus: 'coilover',
  hideCarParts: ['chassis', 'wheel-fl'],
  ghostParts: ['wheel'],
  direction: [1.8, .8, 1.1],
  note: 'Passive front chassis; PASM is optional. Geometry, joint centres, wheel style and fasteners are illustrative. Body-reference pieces are not a removable assembly; no alignment or load values are prescribed.',
  connections: [
    { from: 'wheel', to: 'carrier', label: 'Wheel mounts to the rotating hub; bearing locates it within the carrier', kind: 'mechanical' },
    { from: 'carrier', to: 'coilover', label: 'Carrier attaches to the structural strut', kind: 'structure' },
    { from: 'coilover', to: 'body-mounts', label: 'Upper mounting transfers spring and strut loads to the body', kind: 'structure' },
    { from: 'carrier', to: 'lower-arm', label: 'Outer ball joint connects the carrier to the lower arm', kind: 'structure' },
    { from: 'lower-arm', to: 'body-mounts', label: 'Inboard bush connects the arm to the front structure', kind: 'structure' },
    { from: 'guide-link', to: 'lower-arm', label: 'Separate guide constrains fore/aft movement through the lower arm', kind: 'structure' },
    { from: 'guide-link', to: 'body-mounts', label: 'Guide bush joins the front structure', kind: 'structure' },
    { from: 'steering-link', to: 'carrier', label: 'Rack movement reaches the carrier through the steering tie rod', kind: 'mechanical' },
    { from: 'steering-link', to: 'body-mounts', label: 'Rack housing is supported by the front structure', kind: 'structure' },
    { from: 'anti-roll-bar', to: 'coilover', label: 'Left drop link joins the bar arm to the strut', kind: 'mechanical' },
    { from: 'anti-roll-bar', to: 'body-mounts', label: 'Body bushes support the bar while allowing rotation', kind: 'structure' },
  ],
};

function cylinderAlong(parent, position, radius, depth, surface, direction) {
  const result = mesh(parent, new THREE.CylinderGeometry(radius, radius, depth, 32), surface, position);
  result.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...direction).normalize());
  return result;
}

function joint(parent, point, m, radius = .023) {
  sphere(parent, radius, m.black, point, [1, .8, 1]);
  cylinder(parent, radius * .45, radius * 1.7, m.metal, [point[0], point[1] + radius * .3, point[2]], [0, 0, 0]);
}

export function createAssembly() {
  const root = assembly('front-left-suspension');
  const m = materials();
  const wheel = part(root, 'wheel', 'Wheel and tyre', [.76, .329, 1.2075], [.43, 0, 0], 'The wheel bolts to the hub and turns with it. Its tyre transmits road forces. The translucent teaching wheel exposes the suspension; its style and dimensions are not a fitment specification.');
  roadWheel(wheel, 'road-wheel', [0, 0, 0], m.metal);

  const carrier = part(root, 'carrier', 'Hub and carrier', [.73, .329, 1.2075], [.16, -.08, -.1], 'The hub rotates in its bearing, while the carrier follows suspension and steering movement. A central retaining bolt and nut secure the front hub; no driveshaft drives it. The small wheel-speed sensor is fixed to the carrier. Separate ears connect the carrier to the strut, lower-arm ball joint and steering tie rod.');
  annulus(carrier, .077, .041, .055, m.dark, [-.015, 0, 0]);
  annulus(carrier, .057, .029, .06, m.metal, [.015, 0, 0]);
  annulus(carrier, .044, .026, .07, m.metal, [.05, 0, 0]);
  annulus(carrier, .091, .026, .017, m.metal, [.085, 0, 0]);
  // PET 401-005 items 3/5/6: sensor and front retaining bolt/nut, not a driveshaft.
  cylinder(carrier, .013, .15, m.metal, [.012, 0, 0]).name = 'front-hub-retaining-bolt';
  cylinder(carrier, .037, .012, m.metal, [-.068, 0, 0]);
  mesh(carrier, new THREE.CylinderGeometry(.022, .022, .017, 6), m.dark, [.096, 0, 0], [0, 0, Math.PI / 2]).name = 'front-hub-retaining-nut';
  box(carrier, [.022, .027, .031], m.black, [-.053, .048, .045]).name = 'wheel-speed-sensor';
  tube(carrier, [[-.053, .059, .045], [-.065, .083, .068], [-.08, .118, .069]], .003, m.black).name = 'wheel-speed-sensor-tail';
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    cylinder(carrier, .007, .018, m.black, [.096, Math.cos(a) * .065, Math.sin(a) * .065]);
  }
  beam(carrier, [-.035, .015, 0], [-.04, .101, 0], .031, m.metal);
  cylinder(carrier, .045, .075, m.metal, [-.04, .101, 0], [0, 0, 0]);
  cylinder(carrier, .03, .079, m.black, [-.04, .101, 0], [0, 0, 0]);
  beam(carrier, [-.027, -.03, 0], [-.04, -.089, 0], .025, m.metal);
  joint(carrier, [-.04, -.089, 0], m);
  beam(carrier, [-.03, -.005, -.025], [-.08, -.029, -.1475], .019, m.metal);
  joint(carrier, [-.08, -.029, -.1475], m, .017);

  const strut = part(root, 'coilover', 'Spring and strut', [.69, .43, 1.2075], [.14, .17, .16], 'The coil spring sits between seats around the hydraulic damper. Protective bellows and a compressible auxiliary stop surround the rod; a thrust bearing below the top mount permits steering rotation. The structural strut also guides the carrier. This shows the passive chassis, with no electronic damping actuator.');
  const axis = [-.12, .29, -.0575];
  const at = t => axis.map(v => v * t);
  beam(strut, at(0), at(.64), .026, m.dark);
  beam(strut, at(.55), at(1), .013, m.metal);
  cylinderAlong(strut, at(.28), .079, .013, m.dark, axis).name = 'lower-spring-seat';
  cylinderAlong(strut, at(.86), .077, .014, m.dark, axis).name = 'upper-spring-seat';
  coil(strut, at(.3), at(.85), .064, .0065, m.warm, 6);
  // PET 402-000 items 8/9/11: gaiter, auxiliary compression stop, thrust bearing.
  cylinderAlong(strut, at(.655), .025, .14, m.black, axis).name = 'protective-bellows';
  for (const t of [.54, .58, .62, .66, .7, .74, .78]) cylinderAlong(strut, at(t), .029, .009, m.black, axis);
  cylinderAlong(strut, at(.82), .026, .03, m.tan, axis).name = 'auxiliary-compression-stop';
  cylinderAlong(strut, at(.91), .056, .016, m.metal, axis).name = 'front-thrust-bearing';
  beam(strut, [-.03, .08, -.0075], [-.03, .08, -.03], .013, m.metal);

  const body = part(root, 'body-mounts', 'Body and mountings', [.57, .72, 1.15], [0, .35, -.18], 'The top mount connects the strut to the body tower. The front crossmember supports the lower-arm bushes and rack; the separate guide reaches a forward body mounting. Anti-roll-bar bushes also join the front structure. These separated reference pieces locate that common support; their shapes are schematic.');
  cylinder(body, .081, .028, m.green, [0, .025, 0], [0, 0, 0]);
  cylinder(body, .052, .035, m.black, [0, .004, 0], [0, 0, 0]);
  cylinder(body, .018, .043, m.metal, [0, .032, 0], [0, 0, 0]);
  for (let i = 0; i < 3; i++) {
    const angle = i * Math.PI * 2 / 3;
    cylinder(body, .006, .032, m.metal, [Math.cos(angle) * .065, .038, Math.sin(angle) * .065], [0, 0, 0]);
  }
  box(body, [.25, .025, .2], m.green, [0, .047, 0]);
  box(body, [.78, .045, .09], m.green, [-.39, -.46, .07]);
  box(body, [.78, .035, .08], m.green, [-.39, -.44, .26]);
  for (const x of [-.28, -.86]) box(body, [.09, .07, .09], m.green, [x, -.42, -.095]);
  box(body, [.09, .07, .1], m.green, [-.34, -.42, .47]);
  for (const x of [-.22, -.92]) {
    cylinder(body, .03, .065, m.black, [x, -.43, .26]);
    box(body, [.08, .02, .07], m.metal, [x, -.46, .26]);
  }

  const arm = part(root, 'lower-arm', 'Lower control arm', [.41, .26, 1.22], [.04, -.22, 0], 'The lower arm joins the carrier through an outer ball joint and the structure through an inboard bush. A separate guide attaches farther along it to control fore/aft movement.');
  beam(arm, [-.13, 0, 0], [.28, -.02, -.0125], .025, m.metal);
  beam(arm, [-.09, .018, -.045], [.23, -.01, -.027], .018, m.metal);
  beam(arm, [-.09, .018, .045], [.23, -.01, .005], .018, m.metal);
  box(arm, [.23, .018, .085], m.metal, [.04, -.005, 0]);
  const bush = annulus(arm, .038, .016, .065, m.black, [-.13, 0, 0]);
  bush.rotation.set(0, 0, 0);
  cylinder(arm, .016, .068, m.metal, [-.13, 0, 0], [Math.PI / 2, 0, 0]);
  cylinder(arm, .031, .035, m.black, [.01, .012, 0], [0, 0, 0]);
  joint(arm, [.28, -.02, -.0125], m);

  const guide = part(root, 'guide-link', 'Fore/aft guide', [.42, .26, 1.22], [-.15, -.1, .24], 'This separate link joins the lower arm to a body mounting ahead of it. It contributes fore/aft location while its joints allow suspension movement; it is not the steering tie rod.');
  beam(guide, [0, .012, 0], [-.19, .04, .4], .024, m.metal);
  beam(guide, [-.02, .012, .035], [-.17, .045, .35], .012, m.metal);
  cylinder(guide, .033, .075, m.black, [-.19, .04, .4]);
  cylinder(guide, .016, .083, m.metal, [-.19, .04, .4]);
  cylinder(guide, .024, .028, m.metal, [0, .012, 0], [0, 0, 0]);

  const steering = part(root, 'steering-link', 'Steering tie rod', [0, .30, 1.06], [0, -.05, -.3], 'The steering rack moves the tie rod, which turns the carrier through its steering arm. The flexible gaiter protects the inner joint. This steering connection differs from the wheel-guiding lower arm and guide.');
  cylinder(steering, .034, .55, m.dark, [-.035, .01, 0]);
  cylinder(steering, .016, .30, m.metal, [.38, 0, 0]);
  beam(steering, [.52, 0, 0], [.65, 0, 0], .013, m.metal);
  for (let i = 0; i < 8; i++) cylinder(steering, .027 - Math.abs(i - 3.5) * .002, .011, m.black, [.22 + i * .012, .01, 0]);
  cylinder(steering, .019, .026, m.dark, [.49, 0, 0]);
  joint(steering, [.65, 0, 0], m, .017);

  const bar = part(root, 'anti-roll-bar', 'Anti-roll bar and link', [0, .29, 1.41], [-.03, -.19, .27], 'The transverse bar rotates in body bushes and twists when its ends move differently. The visible left drop link connects its arm to the strut; the opposite suspension connection is outside this single-corner view.');
  tube(bar, [[-.57, 0, -.15], [-.50, 0, -.12], [-.46, 0, .01], [-.35, 0, 0], [.35, 0, 0], [.46, 0, .01], [.50, 0, -.12], [.57, 0, -.15]], .014, m.dark);
  beam(bar, [.57, 0, -.15], [.66, .22, -.21], .009, m.metal);
  joint(bar, [.57, 0, -.15], m, .017);
  joint(bar, [.66, .22, -.21], m, .017);
  return root;
}
