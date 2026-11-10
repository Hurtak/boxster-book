import * as THREE from 'three';
import { group, mesh } from '../geometry.js';
import {
  rounded,
  ellipsoid,
  line3,
  smooth2,
  mappedShape,
  patch,
} from './surfaces.js';
import {
  front,
  rear,
  deckHeight,
  cap,
  frontZ,
  rearZ,
  capBoundary,
} from './shape.js';

export function frontBumper(parent, p) {
  const outline = [];
  for (const { x, z } of capBoundary()) {
    outline.push(new THREE.Vector2(x, deckHeight(x, z)));
  }
  for (let i = 0; i <= 120; i++) {
    const x = 0.84 - (1.68 * i) / 120;
    outline.push(new THREE.Vector2(x, 0.19 + 0.015 * (x / 0.84) ** 2));
  }
  const hole = (side) =>
    smooth2(
      [
        [side * 0.37, 0.47],
        [side * 0.7, 0.49],
        [side * 0.795, 0.42],
        [side * 0.75, 0.255],
        [side * 0.4, 0.245],
        [side * 0.345, 0.32],
      ],
      90
    );
  const left = hole(-1),
    right = hole(1);
  const centre = smooth2(
    [
      [-0.28, 0.39],
      [0.28, 0.39],
      [0.29, 0.235],
      [-0.29, 0.235],
    ],
    64
  );
  mappedShape(
    parent,
    'front-bumper',
    outline,
    [left, right, centre],
    (x, y) => [cap(x, y).x, y, frontZ(x, y)],
    p.paint
  );
  for (const [i, opening] of [left, right, centre].entries()) {
    mappedShape(
      parent,
      `front-intake-depth-${i}`,
      opening,
      [],
      (x, y) => [cap(x, y).x, y, frontZ(x, y) - 0.05],
      p.black
    );
    patch(
      parent,
      `front-intake-wall-${i}`,
      (u, v) => {
        const index = u * opening.length,
          a = opening[Math.floor(index) % opening.length],
          b = opening[(Math.floor(index) + 1) % opening.length],
          t = index % 1;
        const x = THREE.MathUtils.lerp(a.x, b.x, t),
          y = THREE.MathUtils.lerp(a.y, b.y, t);
        return [cap(x, y).x, y, frontZ(x, y) - v * 0.052];
      },
      opening.length,
      3,
      p.black
    );
  }
  for (const side of [-1, 1]) {
    for (let row = 0; row < 3; row++) {
      const y = 0.285 + row * 0.056;
      line3(
        parent,
        [
          [cap(side * 0.39, y).x, y, frontZ(side * 0.39, y) - 0.005],
          [cap(side * 0.58, y).x, y - 0.003, frontZ(side * 0.58, y) - 0.005],
          [cap(side * 0.755, y).x, y + 0.004, frontZ(side * 0.755, y) - 0.005],
        ],
        0.006,
        p.black
      );
    }
    const strip = [];
    for (let i = 0; i <= 25; i++) {
      const x = side * (0.39 + (0.355 * i) / 25),
        y = 0.475 + 0.018 * Math.sin((i * Math.PI) / 25);
      strip.push([x, y, frontZ(x, y) + 0.013]);
    }
    line3(parent, strip, 0.025, p.chrome);
    line3(
      parent,
      strip.map(([x, y, z]) => [x, y + 0.004, z + 0.009]),
      0.019,
      p.lens
    );
    for (let i = 0; i < 6; i++) {
      const x = side * (0.415 + i * 0.058),
        y = 0.483;
      ellipsoid(parent, [0.014, 0.018, 0.008], p.chrome, [
        x,
        y,
        frontZ(x, y) + 0.023,
      ]);
    }
  }
  for (let i = 0; i < 5; i++) {
    const y = 0.25 + i * 0.024;
    line3(
      parent,
      [
        [-0.275, y, frontZ(-0.275, y) - 0.015],
        [0, y, frontZ(0, y) - 0.015],
        [0.275, y, frontZ(0.275, y) - 0.015],
      ],
      0.003,
      p.black
    );
  }
  const lip = [];
  for (let i = 0; i <= 100; i++) {
    const x = -0.83 + (1.66 * i) / 100,
      y = 0.2 + 0.015 * (x / 0.84) ** 2;
    lip.push([x, y, frontZ(x, y) + 0.012]);
  }
  line3(parent, lip, 0.014, p.paint);
  plate(parent, p, [0, 0.472, 2.232], false);
}

export function rearBumper(parent, p) {
  const outline = [];
  for (const { x, z } of capBoundary(true)) {
    outline.push(new THREE.Vector2(x, deckHeight(x, z)));
  }
  for (let i = 0; i <= 120; i++) {
    const x = 0.86 - (1.72 * i) / 120;
    outline.push(new THREE.Vector2(x, 0.21));
  }
  mappedShape(
    parent,
    'rear-bumper',
    outline,
    [],
    (x, y) => [cap(x, y, true).x, y, rearZ(x, y)],
    p.paint
  );
  rounded(parent, [0.64, 0.165, 0.025], p.black, [0, 0.446, -2.194], 0.045);
  plate(parent, p, [0, 0.446, -2.217], true);
  const diffuser = [];
  for (let i = 0; i <= 80; i++) {
    const x = -0.78 + (i * 1.56) / 80,
      y = 0.23 + 0.025 * Math.cos(x * 3);
    diffuser.push([x, y, rearZ(x, y) - 0.012]);
  }
  line3(parent, diffuser, 0.027, p.black);
  for (const x of [-0.083, 0.083]) {
    const pipe = group('exhaust-tip', parent, [x, 0.235, -2.215]);
    mesh(
      pipe,
      new THREE.CylinderGeometry(0.071, 0.067, 0.13, 64, 1, true),
      p.chrome,
      [0, 0, 0],
      [Math.PI / 2, 0, 0]
    );
    mesh(
      pipe,
      new THREE.CylinderGeometry(0.059, 0.059, 0.12, 64),
      p.black,
      [0, 0, 0.009],
      [Math.PI / 2, 0, 0]
    );
    mesh(
      pipe,
      new THREE.TorusGeometry(0.065, 0.006, 8, 64),
      p.chrome,
      [0, 0, -0.067]
    );
  }
  for (const x of [-0.69, -0.43, 0.43, 0.69]) {
    const y = 0.5,
      z = rearZ(x, y) - 0.006;
    mesh(
      parent,
      new THREE.CircleGeometry(0.012, 32),
      p.paint,
      [x, y, z],
      [0, Math.PI, 0]
    );
    mesh(
      parent,
      new THREE.TorusGeometry(0.012, 0.0013, 4, 32),
      p.black,
      [x, y, z - 0.001],
      [0, Math.PI, 0]
    );
  }
}

// The photographed registration is modelled as geometry; no photograph/background is baked in.
function plate(parent, p, position, rear) {
  const root = group(
    rear ? 'rear-registration' : 'front-registration',
    parent,
    position
  );
  if (rear) root.rotation.y = Math.PI;
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
  const glyphs = {
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
        const a = new THREE.Vector3(
          x + stroke[j][0] * 0.044,
          -0.035 + stroke[j][1] * 0.071,
          0.013
        );
        const b = new THREE.Vector3(
          x + stroke[j + 1][0] * 0.044,
          -0.035 + stroke[j + 1][1] * 0.071,
          0.013
        );
        const bar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0035, 0.0035, a.distanceTo(b), 6),
          p.black
        );
        bar.position.copy(a).add(b).multiplyScalar(0.5);
        bar.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          b.clone().sub(a).normalize()
        );
        root.add(bar);
      }
    }
}
