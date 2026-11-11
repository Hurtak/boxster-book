import * as THREE from 'three';
import { group, mesh } from '../geometry.ts';
import { centreIntakeOutline, frontDetails, frontIntakeOutline, frontLampOutline, rearDetails } from './bumpers.ts';
import {
  headlamp,
  headlampFrame,
  headlampOutline,
  tailLamp,
  tailLampBandOutline,
  tailLampLedOutline,
  tailLampOutline,
} from './lights.ts';
import { archRadius, axles } from './shape.ts';
import type { ShellSurface, SurfaceFrame } from './shell';
import { buildShell, frame, sdf } from './shell.ts';
import type { Palette } from './surfaces';
import { ellipsoid, line3, rounded } from './surfaces.ts';

function arch(axle: number) {
  const r = archRadius(axle);
  return (a: number, b: number) => (b > 0.329 ? Math.hypot(a - axle, b - 0.329) - r : Math.abs(a - axle) - r);
}

// Inner wheel-house wall so the arches never show daylight through the car.
function wheelHouse(parent: THREE.Object3D, p: Palette, side: number, axle: number) {
  const r = archRadius(axle) + 0.01;
  const shape = new THREE.Shape();
  shape.moveTo(-r, 0.16 - 0.329);
  shape.lineTo(-r, 0);
  shape.absarc(0, 0, r, Math.PI, 0, true);
  shape.lineTo(r, 0.16 - 0.329);
  shape.closePath();
  mesh(parent, new THREE.ShapeGeometry(shape, 24), p.rubber, [side * 0.5, 0.329, axle], [0, Math.PI / 2, 0]);
  mesh(
    parent,
    new THREE.CylinderGeometry(r, r, 0.34, 48, 1, true, 0, Math.PI),
    p.rubber,
    [side * 0.67, 0.329, axle],
    [0, 0, Math.PI / 2],
  );
}

// Outline given as approximate 3D points, projected into a frame.
const outline = (f: SurfaceFrame, points: number[][]) =>
  sdf.polygon(points.map((point) => f.to(new THREE.Vector3(...point))));
const frontFrame = frame([0, 0, 0], [0, 0, 1]);
const rearFrame = frame([0, 0, 0], [0, 0, -1]);
const sideFrame = (side: number) => frame([0, 0, 0], [side, 0, 0]);
const planFrame = frame([0, 0, 0], [0, 1, 0], new THREE.Vector3(0, 0, -1));
const leftDiffuser = sdf.roundedBox(-0.58, 0.245, 0.3, 0.052, 0.033);
const rightDiffuser = sdf.roundedBox(0.58, 0.245, 0.3, 0.052, 0.033);

function regions(p: Palette, surface: ShellSurface) {
  const list = [];
  for (const side of [-1, 1]) {
    const lamp = headlampFrame(surface, side);
    list.push({
      name: `headlamp-cover-${side}`,
      frame: lamp,
      sdf: headlampOutline(side),
      applies: (q: { z: number; x: number; y: number }) => q.z > 1.35 && q.x * side > 0.3 && q.y > 0.45,
      material: p.lens,
      recess: { depth: 0.15, walls: p.chrome, floor: p.silver },
    });
    const tail = frame([side * 0.7, 0.74, -1.85], [side * 0.55, 0.3, -0.8]);
    const tailOutline = outline(tail, tailLampOutline(side));
    const inLamp =
      (inner: {
        (a: number, b: number): number;
        (a: number, b: number): number;
        (arg0: number, arg1: number): number;
      }) =>
      (a: number, b: number) =>
        Math.max(tailOutline(a, b), inner(a, b));
    list.push({
      name: `tail-lamp-clear-${side}`,
      frame: tail,
      sdf: inLamp(outline(tail, tailLampBandOutline(side))),
      applies: (q: { z: number; x: number; y: number }) => q.z < -1.45 && q.x * side > 0.35 && q.y > 0.6,
      material: p.tailClear,
    });
    list.push({
      name: `tail-lamp-led-${side}`,
      frame: tail,
      sdf: inLamp(outline(tail, tailLampLedOutline(side))),
      applies: (q: { z: number; x: number; y: number }) => q.z < -1.45 && q.x * side > 0.35 && q.y > 0.6,
      material: p.tailLed,
    });
    list.push({
      name: `tail-lamp-${side}`,
      frame: tail,
      sdf: tailOutline,
      applies: (q: { z: number; x: number; y: number }) => q.z < -1.45 && q.x * side > 0.35 && q.y > 0.6,
      material: p.red,
    });
    for (const axle of axles)
      list.push({
        name: `wheel-arch-${side}-${axle > 0 ? 'front' : 'rear'}`,
        frame: sideFrame(side),
        sdf: (a: number, b: number) => arch(axle)(-side * a, b),
        applies: (q: { x: number; y: number }) => q.x * side > 0.42 && q.y < 0.8,
        material: null,
        recess: { depth: 0.06, walls: p.rubber },
      });
    const intake = sideFrame(side);
    list.push({
      name: `side-intake-${side}`,
      frame: intake,
      sdf: outline(intake, [
        [side, 0.628, -0.72],
        [side, 0.632, -0.6],
        [side, 0.628, -0.535],
        [side, 0.5, -0.49],
        [side, 0.385, -0.452],
        [side, 0.365, -0.49],
        [side, 0.42, -0.58],
        [side, 0.54, -0.67],
      ]),
      applies: (q: { x: number; y: number }) => q.x * side > 0.6 && q.y > 0.3 && q.y < 0.7,
      material: null,
      recess: { depth: 0.045, walls: p.black, floor: p.rubber },
    });
    // The lamp claims its faces first; its walls lean up so they never coincide
    // with the intake walls below it.
    list.push({
      name: `front-lamp-${side}`,
      frame: frontFrame,
      sdf: outline(frontFrame, frontLampOutline(side)),
      applies: (q: { z: number; y: number }) => q.z > 1.8 && q.y > 0.3 && q.y < 0.5,
      material: p.lens,
      recess: { depth: 0.03, walls: p.chrome, floor: p.silver, direction: [0, 0.2, -1] },
    });
    list.push({
      name: `front-intake-${side}`,
      frame: frontFrame,
      sdf: outline(frontFrame, frontIntakeOutline(side)),
      applies: (q: { z: number; y: number }) => q.z > 1.8 && q.y < 0.5,
      material: null,
      recess: { depth: 0.06, walls: p.black, floor: p.rubber },
    });
  }
  list.push(
    {
      name: 'front-centre-intake',
      frame: frontFrame,
      sdf: outline(frontFrame, centreIntakeOutline()),
      applies: (q: { z: number; y: number }) => q.z > 1.9 && q.y < 0.4,
      material: null,
      recess: { depth: 0.06, walls: p.black, floor: p.rubber },
    },
    {
      name: 'cockpit',
      frame: planFrame,
      sdf: sdf.roundedBox(0, 0.03, 0.655, 0.69, 0.16),
      applies: (q: { y: number }) => q.y > 0.62,
      material: null,
      recess: { depth: 0.32, walls: p.black },
    },
    {
      name: 'folded-roof-cover',
      frame: planFrame,
      sdf: sdf.roundedBox(0, 0.84, 0.62, 0.15, 0.1),
      applies: (q: { y: number }) => q.y > 0.7,
      material: p.black,
    },
    {
      name: 'rear-plate-recess',
      frame: rearFrame,
      sdf: sdf.roundedBox(0, 0.475, 0.35, 0.108, 0.07),
      applies: (q: { z: number; y: number }) => q.z < -1.9 && q.y < 0.65,
      material: null,
      recess: { depth: 0.035, walls: p.paint, floor: p.black },
    },
    {
      name: 'exhaust-opening',
      frame: rearFrame,
      sdf: sdf.roundedBox(0, 0.285, 0.145, 0.068, 0.06),
      applies: (q: { z: number; y: number }) => q.z < -1.9 && q.y < 0.4,
      material: null,
      recess: { depth: 0.12, walls: p.black, floor: p.rubber },
    },
    {
      name: 'rear-diffuser',
      frame: rearFrame,
      sdf: (a: number, b: number) => Math.min(b - 0.2, leftDiffuser(a, b), rightDiffuser(a, b)),
      applies: (q: { z: number }) => q.z < -1.7,
      material: p.black,
    },
  );
  return list;
}

function seam(
  surface: ShellSurface,
  parent: THREE.Object3D,
  points: number[][],
  direction: number[],
  material: THREE.Material,
  radius = 0.0018,
) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((point) => new THREE.Vector3(...point)),
    false,
    'centripetal',
  );
  line3(
    parent,
    curve.getPoints(points.length * 10).map((point) => surface.on(point.toArray(), direction, 0.0012)),
    radius,
    material,
  );
}

function sideDetails(body: THREE.Object3D, p: Palette, surface: ShellSurface, side: number) {
  const out = [side, 0, 0];
  const onSide = (z: number, y: number) => [side * 1.2, y, z];
  seam(
    surface,
    body,
    [
      [0.705, 0.836],
      [0.712, 0.7],
      [0.708, 0.5],
      [0.69, 0.32],
      [0.65, 0.235],
      [0.55, 0.215],
      [-0.2, 0.215],
      [-0.29, 0.24],
      [-0.36, 0.32],
      [-0.43, 0.43],
      [-0.48, 0.55],
      [-0.52, 0.67],
      [-0.56, 0.78],
      [-0.575, 0.836],
    ].map(([z, y]) => onSide(z, y)),
    [-side, 0, 0],
    p.black,
  );
  // Flush handle in a shallow dished recess.
  const at = surface.requireHit(onSide(-0.42, 0.668), [-side, 0, 0]);
  const handle = group(`door-handle-${side}`, body, at.point.toArray());
  handle.lookAt(at.point.clone().add(at.normal));
  ellipsoid(handle, [0.12, 0.028, 0.012], p.black, [0, 0, -0.004]);
  rounded(handle, [0.2, 0.026, 0.02], p.paint, [0, 0, 0.006], 0.012);
  ellipsoid(handle, [0.012, 0.012, 0.004], p.silver, [side * 0.085, 0, 0.016]);
  // Clear side indicator in the front bumper ahead of the wheel.
  const repeater = surface.requireHit(onSide(1.635, 0.51), [-side, 0, 0]);
  const marker = group(`clear-side-repeater-${side}`, body, repeater.point.toArray());
  marker.lookAt(repeater.point.clone().add(repeater.normal));
  rounded(marker, [0.17, 0.026, 0.012], p.chrome, [0, 0, 0], 0.012);
  rounded(marker, [0.16, 0.02, 0.014], p.lens, [0, 0, 0.004], 0.009);
  const inlet = group(`side-inlet-details-${side}`, body);
  inlet.userData.carPart = true;
  // Five slats across the side intake.
  for (let i = 0; i < 5; i++) {
    const y = 0.405 + i * 0.047;
    const z0 = -0.47 - (y - 0.37) * 0.36 - 0.02,
      z1 = -0.72 + (0.628 - y) * 0.62 + 0.01;
    const a = surface.on(onSide(z0, y), [-side, 0, 0], -0.02),
      b = surface.on(onSide(z1, y), [-side, 0, 0], -0.02);
    line3(inlet, [a, b], 0.0065, p.silver);
  }
  // Mirror on the door top; stalk, painted shell and a dark glass face.
  const mirror = group(`mirror-${side}`, body, [side * 0.84, 0.875, 0.44]);
  rounded(mirror, [0.09, 0.03, 0.05], p.black, [-side * 0.04, -0.045, 0.02], 0.012, [0, 0, side * 0.35]);
  ellipsoid(mirror, [0.085, 0.052, 0.1], p.paint, [side * 0.05, 0, 0], [0, -side * 0.12, 0]);
  ellipsoid(mirror, [0.07, 0.042, 0.006], p.chrome, [side * 0.055, 0, -0.088], [0, -side * 0.1, 0]);
  void out;
}

export function exterior(parent: THREE.Object3D, p: Palette) {
  const body = group('body', parent);
  const surface = buildShell(body, p.paint, (surface: ShellSurface) => regions(p, surface));
  for (const side of [-1, 1]) {
    for (const axle of axles) wheelHouse(body, p, side, axle);
    headlamp(body, p, headlampFrame(surface, side), side, surface);
    tailLamp(body, p, surface, side);
    sideDetails(body, p, surface, side);
  }
  const down = [0, -1, 0];
  const plan = (x: number, z: number) => [x, 1.5, z];
  // Bonnet: front edge above the bumper, sides along the inner wing edges.
  seam(
    surface,
    body,
    [
      [-0.6, 0.75],
      [-0.585, 1.2],
      [-0.55, 1.6],
      [-0.47, 1.86],
      [-0.4, 1.97],
      [-0.25, 2.018],
      [0, 2.035],
      [0.25, 2.018],
      [0.4, 1.97],
      [0.47, 1.86],
      [0.55, 1.6],
      [0.585, 1.2],
      [0.6, 0.75],
    ].map(([x, z]) => plan(x, z)),
    down,
    p.black,
  );
  // Rear lid; the spoiler is omitted from this reference model.
  seam(
    surface,
    body,
    [
      [-0.6, -0.99],
      [-0.6, -1.4],
      [-0.56, -1.73],
      [-0.47, -1.88],
      [-0.25, -1.94],
      [0, -1.955],
      [0.25, -1.94],
      [0.47, -1.88],
      [0.56, -1.73],
      [0.6, -1.4],
      [0.6, -0.99],
      [0, -0.99],
      [-0.6, -0.99],
    ].map(([x, z]) => plan(x, z)),
    down,
    p.black,
  );
  // Black engine-air grille across the front of the rear lid.
  const grille = surface.requireHit(plan(0, -1.05), down);
  const vent = group('rear-lid-grille', body, grille.point.toArray());
  vent.up.set(0, 0, -1);
  vent.lookAt(grille.point.clone().add(grille.normal));
  rounded(vent, [0.42, 0.05, 0.01], p.rubber, [0, 0, 0], 0.02);
  for (let i = 0; i < 9; i++) rounded(vent, [0.004, 0.036, 0.012], p.black, [-0.18 + i * 0.045, 0, 0.002], 0.002);
  // Fuel flap on the right front wing (-X; +X is the car's left).
  const fuel = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    fuel.push(surface.on([-1.2, 0.7 + 0.045 * Math.sin(a), 1.04 + 0.085 * Math.cos(a)], [1, 0, 0], 0.0012));
  }
  line3(body, fuel, 0.0016, p.black, true);
  const crest = surface.requireHit(plan(0, 1.955), down);
  const badge = group('bonnet-crest', body, crest.point.toArray());
  badge.up.set(0, 0, -1);
  badge.lookAt(crest.point.clone().add(crest.normal));
  const shield = new THREE.Shape([
    new THREE.Vector2(-0.018, 0.025),
    new THREE.Vector2(0.018, 0.025),
    new THREE.Vector2(0.014, -0.009),
    new THREE.Vector2(0, -0.025),
    new THREE.Vector2(-0.014, -0.009),
  ]);
  mesh(
    badge,
    new THREE.ShapeGeometry(shield),
    new THREE.MeshStandardMaterial({ color: '#b69a52', metalness: 0.65, roughness: 0.28 }),
    [0, 0, 0.002],
  );
  frontDetails(body, p, surface);
  rearDetails(body, p, surface);
  return body;
}
