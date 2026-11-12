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
        [side * 0.218, 1.005, -0.539],
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
  [-0.184, 0.9],
  [-0.16, 1.05],
  [-0.135, 1.15],
  [-0.112, 1.183],
  [-0.085, 1.194],
  [0, 1.197],
  [0.085, 1.194],
  [0.112, 1.183],
  [0.135, 1.15],
  [0.16, 1.05],
  [0.184, 0.9],
  [0.192, 0.745],
];
export const hoopDepth = (y: number) => -0.547 - (y - 0.745) * 0.105;

// PET 812-001 separates the mesh side inserts from this clear centre panel.
export function centreWindbreak(parent: THREE.Object3D, p: Palette) {
  const root = group('centre-windbreak', parent);
  root.userData.carPart = true;
  const outline = new THREE.Shape();
  outline.moveTo(-0.225, 1.184);
  outline.quadraticCurveTo(-0.21, 1.08, -0.19, 0.945);
  outline.quadraticCurveTo(0, 0.93, 0.19, 0.945);
  outline.quadraticCurveTo(0.21, 1.08, 0.225, 1.184);
  outline.quadraticCurveTo(0.11, 1.193, 0.04, 1.177);
  outline.lineTo(-0.04, 1.177);
  outline.quadraticCurveTo(-0.11, 1.193, -0.225, 1.184);
  const geometry = new THREE.ShapeGeometry(outline, 32);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) positions.setZ(i, hoopDepth(positions.getY(i)) - 0.005);
  geometry.computeVertexNormals();
  const clear = p.glass.clone();
  clear.name = 'Clear centre windbreak';
  clear.opacity = 0.22;
  mesh(root, geometry, clear).name = 'centre-windbreak-pane';
  line3(
    root,
    outline.getPoints(80).map((point) => [point.x, point.y, hoopDepth(point.y) - 0.005]),
    0.003,
    p.black,
    true,
  );
  return root;
}

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
  mesh(root, smoothBand, trim).name = `roll-hoop-shell-${side}`;
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
  // Derive the opening from the same crown and sloping legs as the trim.
  // A separate semicircular screen profile previously left the upper mesh low.
  const inner = Array.from({ length: 161 }, (_, i) => {
    const t = i / 160,
      point = path.getPoint(t),
      tangent = path.getTangent(t);
    const length = Math.hypot(tangent.x, tangent.y);
    return new THREE.Vector2(point.x + (0.029 * tangent.y) / length, point.y - (0.029 * tangent.x) / length);
  }).filter((point) => point.y >= 0.78);
  const opening = new THREE.Shape(inner);
  const screenGeometry = new THREE.ShapeGeometry(opening, 32);
  const positions = screenGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) positions.setZ(i, zAt(positions.getY(i)) - 0.008);
  screenGeometry.computeVertexNormals();
  mesh(root, screenGeometry, screen).name = `roll-hoop-screen-${side}`;
  const span = (axis: 'x' | 'y', value: number) => {
    const other = axis === 'x' ? 'y' : 'x';
    const hits = inner.flatMap((a, i) => {
      const b = inner[(i + 1) % inner.length];
      if (a[axis] > value === b[axis] > value) return [];
      return [a[other] + ((value - a[axis]) / (b[axis] - a[axis])) * (b[other] - a[other])];
    });
    return [Math.min(...hits), Math.max(...hits)];
  };
  for (let i = 0; i < 51; i++) {
    const x = -0.15 + i * 0.006,
      [bottom, top] = span('x', x);
    if (!Number.isFinite(bottom + top)) continue;
    line3(
      root,
      [
        [x, bottom, zAt(bottom) - 0.009],
        [x, top, zAt(top) - 0.009],
      ],
      0.00038,
      p.black,
    );
  }
  for (let i = 0; i < 65; i++) {
    const y = 0.785 + i * 0.006,
      [left, right] = span('y', y);
    if (!Number.isFinite(left + right)) continue;
    line3(
      root,
      [
        [left, y, zAt(y) - 0.009],
        [right, y, zAt(y) - 0.009],
      ],
      0.00038,
      p.black,
    );
  }
  return root;
}
