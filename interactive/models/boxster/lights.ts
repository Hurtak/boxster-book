import * as THREE from 'three';
import { group, mesh } from '../geometry.ts';
import type { ShellSurface, SurfaceFrame } from './shell';
import { frame, sdf } from './shell.ts';
import type { Palette } from './surfaces';
import { ellipsoid, line3 } from './surfaces.ts';

// 987.2 headlamp: a rounded triangular cover following the sloping wing.
export function headlampFrame(surface: ShellSurface, side: number) {
  const normal = new THREE.Vector3(side * 0.12, 0.66, 0.74).normalize();
  const hit = surface.requireHit([side * 0.625, 0.68, 1.78], normal.clone().negate().toArray());
  return frame(hit.point.toArray(), normal.toArray());
}

function lampPoints(side: number) {
  const tilt = 0.28;
  const axis = [side * Math.sin(tilt), Math.cos(tilt)];
  const across = [axis[1], -axis[0]];
  // Rounded triangular 987.2 perimeter: a fuller leading end and a tapered
  // outboard/rear end. Cover, seal and wing cutout share these photo-guided points.
  return [
    [0, 0.245],
    [-0.057, 0.236],
    [-0.103, 0.19],
    [-0.127, 0.105],
    [-0.133, 0],
    [-0.12, -0.11],
    [-0.081, -0.2],
    [-0.015, -0.247],
    [0.055, -0.242],
    [0.116, -0.19],
    [0.14, -0.09],
    [0.135, 0.025],
    [0.105, 0.14],
    [0.06, 0.22],
  ].map(([u, v]) => [axis[0] * v + across[0] * side * u, axis[1] * v + across[1] * side * u]);
}
export const headlampOutline = (side: number) => sdf.polygon(lampPoints(side), 128);

function lampBoundary(side: number) {
  return new THREE.CatmullRomCurve3(
    lampPoints(side).map(([a, b]) => new THREE.Vector3(a, b, 0)),
    true,
    'centripetal',
  )
    .getPoints(128)
    .slice(0, -1);
}

function headlampCover(parent: THREE.Object3D, p: Palette, f: SurfaceFrame, side: number, surface: ShellSurface) {
  // Use the same sampled outline as the shell cutout. Both surfaces meet the
  // same wing; only the interior of the clear cover rises above it.
  const ring = lampBoundary(side);
  if (side < 0) ring.reverse();
  const rings = 16,
    count = ring.length;
  const positions: number[] = [];
  const project = (a: number, b: number, lift: number) =>
    surface.requireHit(f.from(a, b, 0.3).toArray(), f.n.clone().negate().toArray()).point.addScaledVector(f.n, lift);
  const centre = project(0, 0, 0.0135);
  positions.push(...centre.toArray());
  for (let r = 1; r <= rings; r++) {
    const radius = r / rings;
    for (const point of ring) {
      const lift = 0.0015 + 0.012 * (1 - radius * radius) ** 2;
      positions.push(...project(point.x * radius, point.y * radius, lift).toArray());
    }
  }
  const frontCount = positions.length / 3;
  for (let i = 0; i < frontCount; i++) {
    positions.push(
      ...new THREE.Vector3()
        .fromArray(positions, i * 3)
        .addScaledVector(f.n, -0.0035)
        .toArray(),
    );
  }
  const index = (r: number, i: number) => 1 + (r - 1) * count + (i % count);
  const triangles: number[] = [];
  for (let i = 0; i < count; i++) triangles.push(0, index(1, i), index(1, i + 1));
  for (let r = 1; r < rings; r++) {
    for (let i = 0; i < count; i++) {
      const a = index(r, i),
        b = index(r + 1, i),
        c = index(r + 1, i + 1),
        d = index(r, i + 1);
      triangles.push(a, b, c, a, c, d);
    }
  }
  const frontTriangles = triangles.slice();
  for (let i = 0; i < frontTriangles.length; i += 3) {
    triangles.push(
      frontCount + frontTriangles[i],
      frontCount + frontTriangles[i + 2],
      frontCount + frontTriangles[i + 1],
    );
  }
  for (let i = 0; i < count; i++) {
    const a = index(rings, i),
      b = index(rings, i + 1);
    triangles.push(a, a + frontCount, b + frontCount, a, b + frontCount, b);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(triangles);
  geometry.computeVertexNormals();
  const cover = mesh(parent, geometry, p.headlampGlass);
  cover.name = `headlamp-cover-${side}`;
}

export function headlamp(parent: THREE.Object3D, p: Palette, f: SurfaceFrame, side: number, surface: ShellSurface) {
  headlampCover(parent, p, f, side, surface);
  const root = group(`headlamp-${side}`, parent);
  root.userData.carPart = true;
  const n = f.n.clone();
  const at = (a: number, b: number, depth: number) => f.from(a, b, depth).toArray();
  const ring = lampBoundary(side).map((point) => [point.x, point.y]);
  const inward = n.clone().negate().toArray();
  line3(
    root,
    ring.map(([a, b]) => surface.on(at(a, b, 0.3), inward, 0.002)),
    0.0045,
    p.black,
    true,
  );
  line3(
    root,
    ring.map(([a, b]) => surface.on(at(a * 0.978, b * 0.978, 0.3), inward, 0.003)),
    0.0015,
    p.chrome,
    true,
  );
  const tilt = 0.28;
  const axis = [side * Math.sin(tilt), Math.cos(tilt)];
  const lamps: [number, number, boolean][] = [
    [0.11, 0.074, true],
    [-0.075, 0.052, false],
  ] as const;
  for (const [offset, radius, main] of lamps) {
    const hit = surface.requireHit(at(axis[0] * offset, axis[1] * offset, 0.3), inward);
    const point = hit.point
      .clone()
      .add(new THREE.Vector3(0, main ? -0.08 : -0.065, -0.035))
      .addScaledVector(n, main ? -0.025 : 0)
      .toArray();
    const unit = group(`${main ? 'projector' : 'high-beam-reflector'}-${side}`, root, point);
    // The optics aim along the road; only the outer cover follows the wing.
    unit.lookAt(new THREE.Vector3(...point).add(new THREE.Vector3(side * 0.025, -0.005, 1)));
    // Reflector bowls flare behind the round optical units, rather than
    // leaving bare rings standing in a deep, featureless cavity.
    const bowl = [
      [0.8, 0.006],
      [0.9, -0.02],
      [1.03, -0.043],
      [1.22, -0.032],
      [1.34, -0.008],
      [1.35, 0.007],
    ].map(([r, z]) => new THREE.Vector2(radius * r, z));
    mesh(unit, new THREE.LatheGeometry(bowl, 64), p.silver, [0, 0, 0], [Math.PI / 2, 0, 0]).name =
      `headlamp-reflector-${main ? 'main' : 'high'}-${side}`;
    mesh(unit, new THREE.TorusGeometry(radius, 0.005, 8, 48), p.chrome, [0, 0, 0.012]);
    mesh(unit, new THREE.CircleGeometry(radius * 0.92, 48), p.black, [0, 0, 0.004]);
    mesh(unit, new THREE.RingGeometry(radius * 0.64, radius * 0.92, 48), p.silver, [0, 0, 0.007]);
    mesh(unit, new THREE.TorusGeometry(radius * 0.65, 0.002, 8, 48), p.chrome, [0, 0, 0.009]);
    const glass = new THREE.MeshPhysicalMaterial({
      color: main ? '#33434b' : '#a1adb5',
      metalness: main ? 0.1 : 0.7,
      roughness: 0.065,
      clearcoat: 1,
    });
    ellipsoid(unit, [radius * 0.62, radius * 0.62, radius * (main ? 0.18 : 0.12)], glass, [0, 0, 0.01]).name =
      `headlamp-optic-${main ? 'main' : 'high'}-${side}`;
    if (!main)
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        line3(
          unit,
          [
            [Math.cos(a) * radius * 0.66, Math.sin(a) * radius * 0.66, 0.008],
            [Math.cos(a) * radius * 0.9, Math.sin(a) * radius * 0.9, 0.006],
          ],
          0.0012,
          p.chrome,
        );
      }
  }
  const across = [axis[1], -axis[0]];
  const indicatorPoint = (u: number, v: number) =>
    surface.on(
      at(
        axis[0] * (-0.185 + v) + across[0] * side * (0.04 + u),
        axis[1] * (-0.185 + v) + across[1] * side * (0.04 + u),
        0.3,
      ),
      inward,
      -0.028,
    );
  const panel = new THREE.PlaneGeometry(0.1, 0.026, 12, 4);
  const vertices = panel.getAttribute('position');
  for (let i = 0; i < vertices.count; i++)
    vertices.setXYZ(i, ...(indicatorPoint(vertices.getX(i), vertices.getY(i)) as [number, number, number]));
  panel.computeVertexNormals();
  mesh(root, panel, p.silver).name = `headlamp-indicator-${side}`;
  // Fine flutes in the rectangular lower indicator field, behind the cover.
  for (let i = 0; i <= 12; i++) {
    const u = -0.048 + (i / 12) * 0.096;
    line3(
      root,
      [-0.011, 0, 0.011].map((v) => indicatorPoint(u, v)),
      0.00065,
      p.chrome,
    );
  }
  return root;
}

const mirrored = (side: number, points: number[][]) => points.map(([x, y, z]) => [side * x, y, z]);

// 987.2 tail lamp, traced on the shell from two calibrated rear photographs: a
// tall, blunt inner end beside the rear lid, a top edge along the wing crest
// and a point wrapping onto the flank.
export const tailLampOutline = (side: number) =>
  mirrored(side, [
    [0.5, 0.735, -1.965],
    [0.525, 0.766, -1.895],
    [0.555, 0.787, -1.83],
    [0.6, 0.799, -1.772],
    [0.65, 0.804, -1.727],
    [0.72, 0.798, -1.683],
    [0.785, 0.776, -1.619],
    [0.838, 0.738, -1.552],
    [0.838, 0.716, -1.597],
    [0.833, 0.687, -1.672],
    [0.822, 0.666, -1.752],
    [0.809, 0.66, -1.852],
    [0.778, 0.661, -1.91],
    [0.72, 0.666, -1.955],
    [0.64, 0.673, -1.985],
    [0.57, 0.68, -2.0],
    [0.515, 0.688, -2.003],
    [0.498, 0.706, -1.99],
  ]);

// Clear reversing and indicator band inside a thin red rim along the lower
// edge, narrowing to nothing on the flank.
const bandTop = [
  [0.79, 0.706, -1.8],
  [0.725, 0.716, -1.894],
  [0.62, 0.717, -1.95],
  [0.548, 0.715, -1.976],
  [0.512, 0.713, -1.982],
];
export const tailLampBandOutline = (side: number) =>
  mirrored(side, [
    ...bandTop,
    [0.509, 0.701, -1.99],
    [0.528, 0.695, -1.996],
    [0.57, 0.69, -1.994],
    [0.64, 0.683, -1.979],
    [0.72, 0.676, -1.949],
    [0.775, 0.672, -1.905],
    [0.799, 0.673, -1.85],
    [0.809, 0.687, -1.775],
  ]);

// Darker LED cluster in the upper outer corner of the red lens.
export const tailLampLedOutline = (side: number) =>
  mirrored(side, [
    [0.689, 0.783, -1.779],
    [0.784, 0.77, -1.632],
    [0.811, 0.739, -1.632],
    [0.8, 0.712, -1.76],
    [0.73, 0.725, -1.87],
    [0.697, 0.751, -1.864],
  ]);

// Black rim and a bright divider above the clear band.
export function tailLamp(parent: THREE.Object3D, p: Palette, surface: ShellSurface, side: number) {
  const root = group(`tail-lamp-detail-${side}`, parent);
  const n = new THREE.Vector3(side * 0.55, 0.3, -0.8).normalize();
  const project = (point: number[], lift: number) =>
    surface.on(new THREE.Vector3(...point).addScaledVector(n, 0.4).toArray(), n.clone().negate().toArray(), lift);
  const curve = (points: number[][], closed: boolean, count: number) =>
    new THREE.CatmullRomCurve3(
      points.map((point) => new THREE.Vector3(...point)),
      closed,
      'centripetal',
    )
      .getPoints(count)
      .map((point) => point.toArray());
  line3(
    root,
    curve(tailLampOutline(side), true, 140).map((point) => project(point, 0.002)),
    0.0045,
    p.black,
    true,
  );
  line3(
    root,
    curve(mirrored(side, bandTop), false, 60).map((point) => project(point, 0.003)),
    0.0022,
    p.chrome,
  );
  return root;
}
