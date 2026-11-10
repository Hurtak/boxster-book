import * as THREE from 'three';
import { group, mesh } from '../geometry.js';
import { ellipsoid, line3, smooth2, mappedShape, patch } from './surfaces.js';
import { deckHeight } from './shape.js';

export function headlights(parent, p, side) {
  const cx = side * 0.645,
    cz = 1.62;
  const point = (a, r = 1, lift = 0) => {
    const x = cx + 0.143 * Math.cos(a) * r,
      z = cz + 0.235 * Math.sin(a) * r;
    return [x, deckHeight(x, z) + 0.007 + lift, z];
  };
  const outline = Array.from({ length: 100 }, (_, i) =>
    point((i * Math.PI * 2) / 100)
  );
  const ring = line3(parent, outline, 0.006, p.black, true);
  ring.name = `headlamp-seal-${side}`;
  line3(
    parent,
    Array.from({ length: 100 }, (_, i) =>
      point((i * Math.PI * 2) / 100, 0.96, 0.003)
    ),
    0.004,
    p.chrome,
    true
  );
  patch(
    parent,
    `headlamp-reflector-${side}`,
    (u, v) => {
      const a = u * Math.PI * 2,
        r = v * 0.94;
      const q = point(a, r);
      q[1] -= 0.03 * (1 - r * r);
      return q;
    },
    80,
    12,
    p.chrome
  );
  for (const [z, radius] of [
    [1.51, 0.062],
    [1.72, 0.044],
  ]) {
    const x = cx,
      y = deckHeight(x, z) + 0.004;
    const lens = group(`projector-${side}-${z}`, parent, [x, y, z]);
    lens.rotation.x = 0.46;
    mesh(
      lens,
      new THREE.CylinderGeometry(radius, radius * 0.83, 0.025, 64),
      p.black,
      [0, -0.012, 0]
    );
    mesh(
      lens,
      new THREE.TorusGeometry(radius, 0.004, 8, 64),
      p.chrome,
      [0, 0.005, 0],
      [Math.PI / 2, 0, 0]
    );
    mesh(
      lens,
      new THREE.CircleGeometry(radius * 0.85, 64),
      p.black,
      [0, 0.007, 0],
      [-Math.PI / 2, 0, 0]
    );
    ellipsoid(
      lens,
      [radius * 0.8, 0.015, radius * 0.8],
      p.glass,
      [0, 0.012, 0]
    );
    const optical = new THREE.MeshPhysicalMaterial({
      color: z < 1.6 ? '#172633' : '#a9b2b6',
      metalness: z < 1.6 ? 0.35 : 0.92,
      roughness: 0.12,
      clearcoat: 1,
    });
    ellipsoid(
      lens,
      [radius * 0.77, 0.012, radius * 0.77],
      optical,
      [0, 0.011, 0]
    );
    if (z > 1.6)
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8;
        line3(
          lens,
          [
            [Math.cos(a) * radius * 0.38, 0.025, Math.sin(a) * radius * 0.38],
            [Math.cos(a) * radius * 0.76, 0.018, Math.sin(a) * radius * 0.76],
          ],
          0.001,
          p.chrome
        );
      }
  }
  patch(
    parent,
    `headlamp-cover-${side}`,
    (u, v) => {
      const a = u * Math.PI * 2,
        r = v * 0.985,
        q = point(a, r, 0.012);
      q[1] += 0.024 * (1 - r * r);
      return q;
    },
    80,
    18,
    p.lens
  );
}

export function tailLights(parent, p, side) {
  const points = smooth2(
    [
      [0.42, -2.08],
      [0.53, -1.91],
      [0.78, -1.65],
      [0.855, -1.71],
      [0.825, -1.96],
      [0.65, -2.115],
    ],
    100
  );
  const map = (x, z) => [side * x, deckHeight(side * x, z) + 0.009, z];
  mappedShape(parent, `tail-lamp-${side}`, points, [], map, p.red);
  line3(
    parent,
    points.map((v) => map(v.x, v.y)),
    0.005,
    p.chrome,
    true
  );
  const clear = smooth2(
    [
      [0.44, -2.075],
      [0.65, -2.102],
      [0.82, -1.95],
      [0.818, -1.985],
      [0.66, -2.13],
      [0.47, -2.1],
    ],
    90
  );
  mappedShape(
    parent,
    `tail-lamp-clear-strip-${side}`,
    clear,
    [],
    (x, z) => {
      const a = map(x, z);
      a[1] += 0.006;
      return a;
    },
    p.lens
  );
  for (let band = 0; band < 2; band++) {
    const points = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30,
        x = 0.52 + 0.285 * t,
        z = -2.04 + 0.29 * t + band * 0.035;
      points.push([side * x, deckHeight(side * x, z) + 0.018, z]);
    }
    line3(parent, points, 0.009, p.red);
  }
}
