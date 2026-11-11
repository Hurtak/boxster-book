import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { group, mesh } from '../geometry.ts';
import type { Palette } from './surfaces';
import { ellipsoid, line3, patch, profile, rounded } from './surfaces.ts';

// Integrated head restraints, a broad shoulder and a low cushion. The section
// remains continuous across the bolsters instead of adding tall side pillows.
const backWidth = (y: number) =>
  profile(
    [
      [0.47, 0.153],
      [0.58, 0.19],
      [0.77, 0.205],
      [0.84, 0.203],
      [0.915, 0.155],
      [0.95, 0.128],
      [1.065, 0.126],
      [1.105, 0.102],
      [1.125, 0],
    ],
    y,
  );
const backCentre = (y: number) => -0.325 - (y - 0.47) * 0.24;
const backFront = (x: number, y: number) => {
  const w = Math.max(1e-8, backWidth(y)),
    round = Math.sqrt(Math.max(0, 1 - (x / w) ** 2));
  const bolster =
    0.048 *
    Math.exp(-(((Math.abs(x) - 0.171) / 0.035) ** 2)) *
    Math.sin(Math.PI * Math.min(1, Math.max(0, (y - 0.47) / 0.45)));
  return backCentre(y) + (0.062 + bolster) * round;
};

export function seat(parent: THREE.Object3D, p: Palette, side: number, { belt = true } = {}) {
  const root = group(side > 0 ? 'driver-seat' : 'passenger-seat', parent, [side * 0.345, 0, 0]);
  root.userData.carPart = true;
  rounded(root, [0.435, 0.095, 0.47], p.tan, [0, 0.425, -0.115], 0.04).name = 'seat-cushion';
  rounded(root, [0.302, 0.04, 0.365], p.insert, [0, 0.471, -0.09], 0.018).name = 'seat-cushion-insert';
  for (const x of [-0.185, 0.185])
    ellipsoid(root, [0.045, 0.061, 0.214], p.tan, [x, 0.476, -0.12]).name = `seat-cushion-bolster-${x}`;
  patch(
    root,
    'integrated-seat-back',
    (u: number, v: number) => {
      const y = 0.47 + 0.655 * v,
        a = u * Math.PI * 2,
        x = backWidth(y) * Math.cos(a);
      const depth =
        (Math.sin(a) >= 0 ? backFront(x, y) - backCentre(y) : 0.045 * Math.sin(a)) * Math.min(1, backWidth(y) / 0.1);
      return [x, y, backCentre(y) + depth];
    },
    80,
    80,
    p.tan,
  );
  const insertWidth = (y: number) =>
    profile(
      [
        [0.535, 0.125],
        [0.7, 0.139],
        [0.83, 0.135],
        [0.91, 0.102],
      ],
      y,
    );
  patch(
    root,
    'contoured-seat-insert',
    (u: number, v: number) => {
      const y = 0.535 + 0.375 * v,
        x = (u * 2 - 1) * insertWidth(y);
      return [x, y, backFront(x, y) + 0.0015];
    },
    36,
    48,
    p.insert,
  );
  for (const side of [-1, 1]) {
    const seam = Array.from({ length: 35 }, (_, i) => {
      const y = 0.54 + (i / 34) * 0.364,
        x = side * insertWidth(y);
      return [x, y, backFront(x, y) + 0.002];
    });
    line3(root, seam, 0.0006, p.stitch);
    line3(
      root,
      [
        [side * 0.143, 0.494, 0.07],
        [side * 0.143, 0.494, -0.1],
        [side * 0.143, 0.494, -0.255],
      ],
      0.0006,
      p.stitch,
    );
  }
  for (const y of [0.615, 0.69, 0.765, 0.84]) {
    const seam = Array.from({ length: 20 }, (_, i) => {
      const x = ((i / 19) * 2 - 1) * insertWidth(y) * 0.97;
      return [x, y, backFront(x, y) + 0.002];
    });
    line3(root, seam, 0.0005, p.stitch);
  }
  const dots = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.0008, 4, 3),
    new THREE.MeshStandardMaterial({ color: '#87643d', roughness: 1 }),
    187,
  );
  const matrix = new THREE.Matrix4();
  for (let row = 0; row < 17; row++)
    for (let col = 0; col < 11; col++) {
      const y = 0.56 + row * 0.019,
        x = -0.107 + col * 0.0214;
      matrix.makeTranslation(x, y, backFront(x, y) + 0.002);
      dots.setMatrixAt(row * 11 + col, matrix);
    }
  root.add(dots);
  if (belt) {
    const restraint = group(`seat-belt-${side}`, parent, [side * 0.345, 0, 0]);
    restraint.userData.carPart = true;
    line3(
      restraint,
      [
        [side * 0.218, 1.005, -0.604],
        [side * 0.24, 0.79, -0.42],
        [side * 0.21, 0.49, -0.29],
      ],
      0.009,
      p.black,
    );
    rounded(restraint, [0.034, 0.05, 0.025], p.black, [-side * 0.238, 0.48, -0.25], 0.007);
    rounded(
      restraint,
      [0.025, 0.012, 0.025],
      new THREE.MeshStandardMaterial({ color: '#8e1720' }),
      [-side * 0.238, 0.508, -0.25],
      0.002,
    );
  }
  return root;
}

export const hoopOutline = [
  [-0.192, 0.745],
  [-0.181, 0.9],
  [-0.151, 1.033],
  [-0.109, 1.099],
  [0, 1.126],
  [0.109, 1.099],
  [0.151, 1.033],
  [0.181, 0.9],
  [0.192, 0.745],
];
export const hoopDepth = (y: number) => -0.612 - (y - 0.745) * 0.105;

// Flattened, slightly rearward leaning hoops closely follow the head restraints.
// The reference rear photograph has a silver rear face and tan front trim.
export function rollHoop(parent: THREE.Object3D, p: Palette, side: number) {
  const root = group(`roll-hoop-${side}`, parent, [side * 0.345, 0, 0]);
  root.userData.carPart = true;
  const outline = hoopOutline;
  const zAt = hoopDepth;
  const path = new THREE.CatmullRomCurve3(
    outline.map(([x, y]) => new THREE.Vector3(x, y, zAt(y))),
    false,
    'centripetal',
  );
  // A flattened oval section gives a smooth crown without a faceted tube.
  const band = new THREE.Shape();
  band.absellipse(0, 0, 0.026, 0.018, 0, Math.PI * 2, false, 0);
  const extruded = new THREE.ExtrudeGeometry(band, {
    steps: 110,
    extrudePath: path,
    curveSegments: 12,
    bevelEnabled: false,
  });
  extruded.deleteAttribute('normal');
  extruded.deleteAttribute('uv');
  const smoothBand = mergeVertices(extruded, 1e-6);
  smoothBand.computeVertexNormals();
  extruded.dispose();
  const trim = p.silver.clone();
  trim.name = 'Aluminium-look hoop trim';
  trim.roughness = 0.4;
  trim.metalness = 0.6;
  mesh(root, smoothBand, trim).name = 'roll-hoop-shell';
  const tanPath = path.getPoints(120).map((point) => [point.x, point.y, point.z + 0.016]);
  line3(root, tanPath, 0.008, p.tan);
  const screen = new THREE.MeshStandardMaterial({
    color: '#13191a',
    transparent: true,
    opacity: 0.3,
    roughness: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const opening = new THREE.Shape();
  opening.moveTo(-0.159, 0.77);
  opening.lineTo(-0.146, 0.98);
  opening.bezierCurveTo(-0.13, 1.073, -0.08, 1.1, 0, 1.101);
  opening.bezierCurveTo(0.08, 1.1, 0.13, 1.073, 0.146, 0.98);
  opening.lineTo(0.159, 0.77);
  opening.closePath();
  const screenGeometry = new THREE.ShapeGeometry(opening, 32);
  const positions = screenGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) positions.setZ(i, zAt(positions.getY(i)) - 0.008);
  screenGeometry.computeVertexNormals();
  mesh(root, screenGeometry, screen).name = 'roll-hoop-screen';
  const half = (y: number) =>
    profile(
      [
        [0.77, 0.158],
        [0.98, 0.146],
        [1.055, 0.109],
        [1.09, 0.052],
        [1.101, 0],
      ],
      y,
    );
  for (let i = 0; i < 49; i++) {
    const x = -0.144 + i * 0.006;
    let y = 1.1;
    while (y > 0.78 && half(y) < Math.abs(x)) y -= 0.002;
    line3(
      root,
      [
        [x, 0.775, zAt(0.775) - 0.009],
        [x, y, zAt(y) - 0.009],
      ],
      0.00038,
      p.black,
    );
  }
  for (let i = 0; i < 53; i++) {
    const y = 0.78 + i * 0.006,
      w = half(y);
    line3(
      root,
      [
        [-w, y, zAt(y) - 0.009],
        [w, y, zAt(y) - 0.009],
      ],
      0.00038,
      p.black,
    );
  }
  return root;
}
