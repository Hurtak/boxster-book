import * as THREE from 'three';
import { group, mesh, cylinder } from '../geometry.js';
import { rounded, ellipsoid, line3, patch } from './surfaces.js';
import {seat,rollHoop} from './seats.js';

function instruments(parent, p) {
  patch(
    parent,
    'instrument-binnacle',
    (u, v) => {
      const a = u * Math.PI;
      return [
        0.345 + 0.198 * Math.cos(a),
        0.82 + 0.1 * Math.sin(a),
        0.41 + v * 0.145,
      ];
    },
    48,
    20,
    p.tan
  );
  ellipsoid(parent, [0.198, 0.1, 0.06], p.tan, [0.345, 0.82, 0.55]);
  const cluster = group('five-dial-instruments', parent, [0.345, 0.82, 0.45]);
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.064,
      y = Math.abs(i - 2) * -0.006,
      r = i === 2 ? 0.05 : 0.039;
    const dial = group(`instrument-${i}`, cluster, [x, y, 0]);
    dial.rotation.x = -0.22;
    cylinder(dial, r + 0.007, 0.06, p.black, [0, 0, 0], [Math.PI / 2, 0, 0]);
    mesh(
      dial,
      new THREE.CircleGeometry(r, 48),
      p.black,
      [0, 0, -0.033],
      [0, Math.PI, 0]
    );
    mesh(
      dial,
      new THREE.TorusGeometry(r, 0.0025, 6, 48),
      p.silver,
      [0, 0, -0.035]
    );
    for (let j = 0; j < 15; j++) {
      const a = (0.72 + j * 0.115) * Math.PI;
      line3(
        dial,
        [
          [Math.cos(a) * r * 0.77, Math.sin(a) * r * 0.77, -0.036],
          [Math.cos(a) * r * 0.91, Math.sin(a) * r * 0.91, -0.036],
        ],
        0.0007,
        p.white
      );
    }
    line3(
      dial,
      [
        [0, 0, -0.038],
        [r * 0.6, r * 0.32, -0.038],
      ],
      0.0013,
      new THREE.MeshStandardMaterial({ color: '#bd3e2e' })
    );
  }
  const steering = group('tan-steering-wheel', parent, [0.345, 0.795, 0.197]);
  steering.rotation.x = -0.28;
  mesh(steering, new THREE.TorusGeometry(0.143, 0.016, 12, 80), p.tan);
  for (const a of [0, Math.PI, Math.PI * 1.5]) {
    const spoke = rounded(
      steering,
      [0.11, 0.028, 0.024],
      p.silver,
      [Math.cos(a) * 0.075, Math.sin(a) * 0.075, 0],
      0.008
    );
    spoke.rotation.z = a;
  }
  rounded(steering, [0.1, 0.083, 0.044], p.tan, [0, 0, -0.009], 0.025);
  ellipsoid(
    steering,
    [0.012, 0.016, 0.002],
    new THREE.MeshStandardMaterial({
      color: '#b39a54',
      metalness: 0.6,
      roughness: 0.5,
    }),
    [0, 0, -0.034]
  );
  line3(
    parent,
    [
      [0.37, 0.73, 0.45],
      [0.34, 0.75, 0.24],
    ],
    0.022,
    p.black
  );
}

export function windscreen(body, p) {
  const sample = (u, v) => {
    const t = u * 2 - 1;
    return [
      t * (0.727 - 0.078 * v),
      0.84 + 0.335 * v - 0.02 * t * t,
      0.64 - 0.52 * v + 0.06 * t * t,
    ];
  };
  patch(body, 'curved-windscreen', sample, 72, 32, p.glass);
  for (const v of [0, 1]) {
    const edge = Array.from({ length: 61 }, (_, i) => sample(i / 60, v));
    line3(body, edge, 0.026, p.paint);
    line3(
      body,
      edge.map(([x, y, z]) => [x, y - 0.007, z - 0.004]),
      0.009,
      p.black
    );
  }
  for (const u of [0, 1]) {
    const edge = Array.from({ length: 41 }, (_, i) => sample(u, i / 40));
    line3(body, edge, 0.027, p.paint);
    line3(
      body,
      edge.map(([x, y, z]) => [x + (u === 0 ? 0.009 : -0.009), y, z]),
      0.008,
      p.black
    );
  }
  for (const [x, length] of [
    [-0.43, 0.43],
    [0.11, 0.42],
  ]) {
    const wiper = sample((x / 0.727 + 1) / 2, 0.035);
    line3(
      body,
      [
        [x - 0.11, wiper[1] + 0.01, wiper[2] + 0.015],
        [x + 0.08, wiper[1] + 0.025, wiper[2] - 0.04],
      ],
      0.004,
      p.black
    );
    line3(
      body,
      [
        [x - 0.14, wiper[1] + 0.025, wiper[2] - 0.025],
        [x + length - 0.14, wiper[1] + 0.018, wiper[2] - 0.03],
      ],
      0.006,
      p.black
    );
  }
  rounded(body, [0.19, 0.055, 0.034], p.black, [0, 1.1, 0.19], 0.015);
  rounded(body, [0.173, 0.04, 0.003], p.chrome, [0, 1.1, 0.17], 0.01);
  line3(
    body,
    [
      [0, 1.16, 0.14],
      [0, 1.12, 0.19],
    ],
    0.008,
    p.black
  );
}

export function cabin(parent, p) {
  const interior = group('interior', parent);
  rounded(interior, [1.25, 0.08, 1.12], p.black, [0, 0.36, -0.1], 0.04);
  rounded(interior, [0.21, 0.22, 0.92], p.tan, [0, 0.46, -0.1], 0.045);
  for (const side of [-1, 1]) {
    seat(interior, p, side);
    rounded(
      interior,
      [0.045, 0.31, 0.91],
      p.tan,
      [side * 0.654, 0.57, -0.04],
      0.02
    );
    rounded(
      interior,
      [0.055, 0.07, 0.91],
      p.black,
      [side * 0.661, 0.748, -0.04],
      0.02
    );
    rounded(
      interior,
      [0.08, 0.04, 0.28],
      p.tan,
      [side * 0.618, 0.61, -0.08],
      0.013
    );
    rounded(
      interior,
      [0.018, 0.027, 0.095],
      p.chrome,
      [side * 0.622, 0.682, 0.06],
      0.008
    );
    rollHoop(interior, p, side);
  }
  rounded(interior, [1.26, 0.17, 0.1], p.black, [0, 0.71, -0.66], 0.04);
  const deflectorMaterial = new THREE.MeshStandardMaterial({
    color: '#0a1011',
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });
  rounded(
    interior,
    [0.35, 0.23, 0.009],
    deflectorMaterial,
    [0, 0.94, -0.665],
    0.004
  );
  for (let i = 0; i < 18; i++)
    line3(
      interior,
      [
        [-0.165 + i * 0.019, 0.835, -0.67],
        [-0.165 + i * 0.019, 1.045, -0.67],
      ],
      0.0008,
      p.black
    );
  for (let i = 0; i < 11; i++)
    line3(
      interior,
      [
        [-0.165, 0.84 + i * 0.019, -0.67],
        [0.165, 0.84 + i * 0.019, -0.67],
      ],
      0.0008,
      p.black
    );
  patch(
    interior,
    'curved-tan-dashboard',
    (u, v) => {
      const x = (u * 2 - 1) * 0.64,
        z = 0.315 + v * 0.37;
      return [
        x,
        0.79 + 0.04 * Math.sin(v * Math.PI) - 0.025 * (x / 0.64) ** 2,
        z,
      ];
    },
    60,
    24,
    p.tan
  );
  rounded(interior, [1.24, 0.11, 0.09], p.tan, [0, 0.746, 0.35], 0.03);
  for (const x of [-0.575, 0.575, -0.066, 0.066]) {
    const y = Math.abs(x) > 0.5 ? 0.76 : 0.816;
    cylinder(
      interior,
      0.033,
      0.024,
      p.black,
      [x, y, 0.307],
      [Math.PI / 2, 0, 0]
    );
    mesh(interior, new THREE.TorusGeometry(0.033, 0.003, 6, 40), p.silver, [
      x,
      y,
      0.292,
    ]);
    for (let i = -2; i <= 2; i++)
      rounded(
        interior,
        [0.049, 0.002, 0.004],
        p.black,
        [x, y + i * 0.008, 0.287],
        0.001
      );
  }
  const console = group('centre-console', interior, [0, 0.66, 0.275]);
  console.rotation.x = -0.2;
  rounded(console, [0.218, 0.27, 0.065], p.tan, [0, 0, 0], 0.025);
  rounded(console, [0.177, 0.111, 0.006], p.black, [0, 0.04, -0.037], 0.006);
  rounded(
    console,
    [0.126, 0.071, 0.002],
    new THREE.MeshStandardMaterial({ color: '#11292b', roughness: 0.25 }),
    [0, 0.046, -0.042],
    0.002
  );
  for (const x of [-0.079, 0.079])
    for (const y of [0.079, -0.039])
      cylinder(
        console,
        0.009,
        0.012,
        p.silver,
        [x, y, -0.045],
        [Math.PI / 2, 0, 0]
      );
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 5; col++)
      rounded(
        console,
        [0.022, 0.009, 0.005],
        p.black,
        [-0.056 + col * 0.028, -0.046 - row * 0.02, -0.038],
        0.002
      );
  rounded(interior, [0.145, 0.035, 0.18], p.black, [0, 0.572, -0.017], 0.023);
  ellipsoid(interior, [0.045, 0.045, 0.055], p.tan, [0, 0.6, -0.015]);
  cylinder(interior, 0.009, 0.083, p.chrome, [0, 0.656, -0.015], [0, 0, 0]);
  ellipsoid(interior, [0.027, 0.029, 0.035], p.tan, [0, 0.696, -0.015]);
  rounded(interior, [0.13, 0.045, 0.21], p.tan, [0, 0.596, -0.36], 0.024);
  instruments(interior, p);
  return interior;
}
