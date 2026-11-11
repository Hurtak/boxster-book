import * as THREE from 'three';
import { group, mesh } from '../geometry.ts';
import type { ShellSurface } from './shell';
import type { Palette } from './surfaces';
import { line3, rounded } from './surfaces.ts';

const ahead = [0, 0, -1],
  behind = [0, 0, 1];

// Registration plate standing off the bumper along the local surface normal.
function mount(parent: THREE.Object3D, name: string, hit: NonNullable<ReturnType<ShellSurface['hit']>>, offset = 0) {
  const root = group(name, parent, hit.point.clone().addScaledVector(hit.normal, offset).toArray());
  root.lookAt(root.position.clone().add(new THREE.Vector3(hit.normal.x * 0.15, 0, hit.normal.z).normalize()));
  return root;
}

// Front openings of the 987.2 bumper in front view [x, y], traced from two
// calibrated photographs. Each outer intake is a D: a straight top edge carrying
// the LED lamp, a rounded outboard side, and an inboard edge stepping in below
// the lamp's pointed tip. The centre intake is a wide slot below the plate.
const intake = [
  [0.712, 0.437],
  [0.6, 0.438],
  [0.51, 0.428],
  [0.462, 0.405],
  [0.425, 0.36],
  [0.385, 0.325],
  [0.39, 0.28],
  [0.425, 0.245],
  [0.5, 0.228],
  [0.6, 0.226],
  [0.665, 0.23],
  [0.718, 0.255],
  [0.755, 0.305],
  [0.766, 0.37],
  [0.757, 0.425],
];
// Slightly proud of the intake's top edge, so no sliver of opening shows above it.
const lamp = [
  [0.742, 0.44],
  [0.62, 0.448],
  [0.52, 0.447],
  [0.45, 0.432],
  [0.411, 0.404],
  [0.43, 0.393],
  [0.53, 0.4],
  [0.65, 0.403],
  [0.746, 0.398],
  [0.773, 0.405],
];
const centre = [
  [-0.25, 0.293],
  [0, 0.298],
  [0.25, 0.293],
  [0.325, 0.247],
  [0.285, 0.224],
  [0.14, 0.217],
  [0, 0.215],
  [-0.14, 0.217],
  [-0.285, 0.224],
  [-0.325, 0.247],
];
const placed = (points: number[][], side: number = 1) => points.map(([x, y]) => [side * x, y, 0]);
export const frontIntakeOutline = (side: number) => placed(intake, side);
export const frontLampOutline = (side: number) => placed(lamp, side);
export const centreIntakeOutline = () => placed(centre);

// Horizontal span of a closed outline at height y, inset from its edges.
function span(points: number[][], y: number, inset: number) {
  const ring = new THREE.CatmullRomCurve3(
    points.map((point) => new THREE.Vector3(...point)),
    true,
    'centripetal',
  ).getPoints(160);
  const xs: number[] = [];
  ring.forEach((a, i) => {
    const b = ring[(i + 1) % ring.length];
    if (a.y > y !== b.y > y) xs.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
  });
  return [Math.min(...xs) + inset, Math.max(...xs) - inset];
}

function slats(parent: THREE.Object3D, p: Palette, surface: ShellSurface, outline: number[][], heights: number[]) {
  for (const y of heights) {
    const [x0, x1] = span(outline, y, 0.012);
    const points = [];
    for (let i = 0; i <= 12; i++) points.push(surface.on([x0 + ((x1 - x0) * i) / 12, y, 3], ahead, -0.02));
    line3(parent, points, 0.0055, p.black);
    line3(
      parent,
      points.map(([x, py, z]) => [x, py + 0.005, z + 0.002]),
      0.0012,
      p.silver,
    );
  }
}

export function frontDetails(parent: THREE.Object3D, p: Palette, surface: ShellSurface) {
  plate(parent, p, mount(parent, 'front-registration', surface.requireHit([0, 0.4, 3], ahead), 0.008));
  const led = new THREE.MeshStandardMaterial({
    color: '#f4f8ff',
    emissive: '#9aa6b8',
    roughness: 0.3,
  });
  for (const side of [-1, 1]) {
    slats(parent, p, surface, frontIntakeOutline(side), [0.343, 0.303, 0.263]);
    const details = group(`lower-light-details-${side}`, parent);
    details.userData.carPart = true;
    // Daytime-running LED strip in the outer lamp section, then the indicator divider.
    const strip = [];
    for (let i = 0; i <= 12; i++)
      strip.push(surface.on([side * (0.54 + (0.2 * i) / 12), 0.408 - 0.004 * (i / 12), 3], ahead, -0.014));
    line3(details, strip, 0.0045, led);
    line3(
      details,
      [
        [0.52, 0.43],
        [0.52, 0.372],
      ].map(([x, y]) => surface.on([side * x, y, 3], ahead, -0.006)),
      0.0018,
      p.chrome,
    );
  }
  slats(parent, p, surface, centreIntakeOutline(), [0.27, 0.244]);
  // Lip along the bottom of the bumper face, with its shadow line beneath.
  const lip = [];
  for (let i = 0; i <= 40; i++) {
    const x = -0.7 + (1.4 * i) / 40;
    lip.push(surface.on([x, 0.186 + 0.012 * (x / 0.7) ** 4, 3], ahead, 0.002));
  }
  line3(parent, lip, 0.006, p.paint);
  line3(
    parent,
    lip.map(([x, y, z]) => [x, y - 0.008, z - 0.004]),
    0.0022,
    p.black,
  );
}

export function rearDetails(parent: THREE.Object3D, p: Palette, surface: ShellSurface) {
  plate(parent, p, mount(parent, 'rear-registration', surface.requireHit([0, 0.49, -3], behind), -0.022));
  const centre = surface.requireHit([0, 0.29, -3], behind).point;
  const outlets = group('exhaust-outlets', parent);
  outlets.userData.carPart = true;
  for (const x of [-0.058, 0.058]) {
    const pipe = group(`exhaust-tip-${x}`, outlets, [x, 0.288, centre.z + 0.005]);
    mesh(
      pipe,
      new THREE.CylinderGeometry(0.047, 0.044, 0.14, 48, 1, true),
      p.chrome,
      [0, 0, 0.04],
      [Math.PI / 2, 0, 0],
    );
    mesh(pipe, new THREE.CylinderGeometry(0.04, 0.04, 0.12, 48, 1, true), p.black, [0, 0, 0.05], [Math.PI / 2, 0, 0]);
    mesh(pipe, new THREE.TorusGeometry(0.0435, 0.0045, 8, 48), p.chrome, [0, 0, -0.03]);
    mesh(pipe, new THREE.CircleGeometry(0.04, 32), p.rubber, [0, 0, 0.05], [0, Math.PI, 0]);
  }
  // Parking sensors in the painted bumper.
  for (const x of [-0.66, -0.4, 0.4, 0.66]) {
    const hit = surface.requireHit([x, 0.39, -3], behind);
    const sensor = group('parking-sensor', parent, hit.point.toArray());
    sensor.lookAt(hit.point.clone().add(hit.normal));
    mesh(sensor, new THREE.CircleGeometry(0.012, 24), p.paint, [0, 0, 0.0015]);
    mesh(sensor, new THREE.TorusGeometry(0.012, 0.0014, 4, 24), p.black, [0, 0, 0.001]);
  }
}

// The photographed registration is modelled as geometry; no photograph/background is baked in.
function plate(parent: THREE.Object3D, p: Palette, root: THREE.Object3D<THREE.Object3DEventMap>) {
  rounded(root, [0.538, 0.12, 0.009], p.black, [0, 0, 0], 0.009);
  rounded(root, [0.516, 0.108, 0.006], p.white, [0, 0, 0.006], 0.006);
  const blue = new THREE.MeshStandardMaterial({
    color: '#164b9e',
    roughness: 0.7,
  });
  rounded(root, [0.045, 0.104, 0.002], blue, [-0.231, 0, 0.01], 0.001);
  const gold = new THREE.MeshStandardMaterial({
    color: '#d5b65c',
    metalness: 0.4,
    roughness: 0.5,
  });
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    mesh(root, new THREE.CircleGeometry(0.0018, 5), gold, [
      -0.231 + 0.012 * Math.cos(a),
      0.021 + 0.012 * Math.sin(a),
      0.012,
    ]);
  }
  const glyphs: Record<string, number[][][]> = {
    2: [
      [
        [0, 1],
        [0.65, 1],
        [0.78, 0.85],
        [0.78, 0.61],
        [0, 0],
        [0.8, 0],
      ],
    ],
    T: [
      [
        [0, 1],
        [0.8, 1],
      ],
      [
        [0.4, 1],
        [0.4, 0],
      ],
    ],
    Z: [
      [
        [0, 1],
        [0.8, 1],
        [0, 0],
        [0.8, 0],
      ],
    ],
    8: [
      [
        [0.15, 0],
        [0, 0.12],
        [0, 0.87],
        [0.15, 1],
        [0.64, 1],
        [0.78, 0.87],
        [0.78, 0.12],
        [0.64, 0],
        [0.15, 0],
      ],
      [
        [0, 0.5],
        [0.78, 0.5],
      ],
    ],
    0: [
      [
        [0.15, 0],
        [0, 0.15],
        [0, 0.85],
        [0.15, 1],
        [0.63, 1],
        [0.78, 0.85],
        [0.78, 0.15],
        [0.63, 0],
        [0.15, 0],
      ],
    ],
    5: [
      [
        [0.78, 1],
        [0, 1],
        [0, 0.54],
        [0.63, 0.54],
        [0.78, 0.4],
        [0.78, 0.12],
        [0.64, 0],
        [0, 0],
      ],
    ],
    7: [
      [
        [0, 1],
        [0.8, 1],
        [0.2, 0],
      ],
    ],
  };
  const characters = '2TZ8057';
  for (let i = 0; i < characters.length; i++)
    for (const stroke of glyphs[characters[i]]) {
      const x = -0.184 + i * 0.06 + (i >= 3 ? 0.015 : 0);
      // Straight stroke segments preserve the narrow registration-letter proportions.
      for (let j = 0; j < stroke.length - 1; j++) {
        const a = new THREE.Vector3(x + stroke[j][0] * 0.044, -0.035 + stroke[j][1] * 0.071, 0.013);
        const b = new THREE.Vector3(x + stroke[j + 1][0] * 0.044, -0.035 + stroke[j + 1][1] * 0.071, 0.013);
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, a.distanceTo(b), 6), p.black);
        bar.position.copy(a).add(b).multiplyScalar(0.5);
        bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        root.add(bar);
      }
    }
}
