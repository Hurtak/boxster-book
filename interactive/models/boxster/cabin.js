import * as THREE from 'three';
import { group, mesh, cylinder } from '../geometry.js';
import { rounded, ellipsoid, line3, patch, profile } from './surfaces.js';

function seat(parent, p, side) {
  const root = group(side < 0 ? 'driver-seat' : 'passenger-seat', parent, [
    side * 0.345,
    0,
    0,
  ]);
  rounded(root, [0.435, 0.105, 0.49], p.tan, [0, 0.47, -0.16], 0.045);
  rounded(root, [0.305, 0.055, 0.37], p.insert, [0, 0.521, -0.13], 0.024);
  for (const x of [-0.184, 0.184]) {
    ellipsoid(root, [0.058, 0.085, 0.235], p.tan, [x, 0.53, -0.17]);
    ellipsoid(
      root,
      [0.055, 0.235, 0.08],
      p.tan,
      [x, 0.77, -0.36],
      [-0.15, 0, 0]
    );
  }
  patch(
    root,
    'integrated-seat-back',
    (u, v) => {
      const y = 0.535 + 0.635 * v,
        a = u * Math.PI * 2;
      const w = profile(
        [
          [0.535, 0.16],
          [0.65, 0.205],
          [0.87, 0.2],
          [0.98, 0.145],
          [1.1, 0.14],
          [1.15, 0.1],
          [1.17, 0],
        ],
        y
      );
      const depth = 0.078 * Math.min(1, w / 0.14);
      return [
        w * Math.cos(a),
        y,
        -0.37 - (y - 0.535) * 0.15 + depth * Math.sin(a),
      ];
    },
    64,
    64,
    p.tan
  );
  patch(
    root,
    'contoured-seat-insert',
    (u, v) => {
      const y = 0.59 + 0.345 * v,
        x = (u * 2 - 1) * 0.142;
      const w = profile(
        [
          [0.535, 0.16],
          [0.65, 0.205],
          [0.87, 0.2],
          [0.98, 0.145],
        ],
        y
      );
      return [
        x,
        y,
        -0.37 -
          (y - 0.535) * 0.15 +
          0.079 * Math.sqrt(Math.max(0, 1 - (x / w) ** 2)) +
          0.002,
      ];
    },
    32,
    48,
    p.insert
  );
  for (const x of [-0.145, 0.145]) {
    line3(
      root,
      [
        [x, 0.58, -0.29],
        [x, 0.76, -0.3],
        [x * 0.96, 0.95, -0.33],
      ],
      0.0005,
      p.stitch
    );
    line3(
      root,
      [
        [x, 0.553, 0.03],
        [x, 0.553, -0.17],
        [x, 0.553, -0.28],
      ],
      0.0005,
      p.stitch
    );
  }
  for (let i = 0; i < 4; i++) {
    const y = 0.66 + i * 0.076,
      z = -0.295 - (y - 0.66) * 0.15;
    line3(
      root,
      [
        [-0.132, y, z],
        [0, y - 0.004, z + 0.004],
        [0.132, y, z],
      ],
      0.0005,
      p.stitch
    );
  }
  const dots = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.0009, 4, 3),
      new THREE.MeshStandardMaterial({ color: '#87643d', roughness: 1 }),
      187
    ),
    matrix = new THREE.Matrix4();
  for (let row = 0; row < 17; row++)
    for (let col = 0; col < 11; col++) {
      const y = 0.64 + row * 0.018;
      matrix.makeTranslation(
        -0.112 + col * 0.022,
        y,
        -0.286 - (y - 0.64) * 0.15
      );
      dots.setMatrixAt(row * 11 + col, matrix);
    }
  root.add(dots);
  line3(
    root,
    [
      [side * 0.21, 1.02, -0.49],
      [side * 0.24, 0.81, -0.41],
      [side * 0.2, 0.53, -0.33],
    ],
    0.01,
    p.black
  );
  rounded(
    root,
    [0.034, 0.05, 0.025],
    p.black,
    [-side * 0.245, 0.51, -0.28],
    0.007
  );
  rounded(
    root,
    [0.025, 0.012, 0.025],
    new THREE.MeshStandardMaterial({ color: '#8e1720' }),
    [-side * 0.245, 0.538, -0.28],
    0.002
  );
}

function instruments(parent, p) {
  patch(
    parent,
    'instrument-binnacle',
    (u, v) => {
      const a = u * Math.PI;
      return [
        -0.345 + 0.198 * Math.cos(a),
        0.82 + 0.1 * Math.sin(a),
        0.41 + v * 0.145,
      ];
    },
    48,
    20,
    p.tan
  );
  ellipsoid(parent, [0.198, 0.1, 0.06], p.tan, [-0.345, 0.82, 0.55]);
  const cluster = group('five-dial-instruments', parent, [-0.345, 0.82, 0.45]);
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
  const steering = group('tan-steering-wheel', parent, [-0.345, 0.795, 0.197]);
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
      [-0.37, 0.73, 0.45],
      [-0.34, 0.75, 0.24],
    ],
    0.022,
    p.black
  );
}

export function windscreen(body, p) {
  const sample = (u, v) => {
    const t = u * 2 - 1;
    return [
      t * (0.727 - 0.068 * v),
      0.813 + 0.428 * v - 0.028 * t * t,
      0.675 - 0.458 * v + 0.07 * t * t,
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
  rounded(body, [0.19, 0.055, 0.034], p.black, [0, 1.153, 0.27], 0.015);
  rounded(body, [0.173, 0.04, 0.003], p.chrome, [0, 1.153, 0.25], 0.01);
  line3(
    body,
    [
      [0, 1.21, 0.25],
      [0, 1.173, 0.27],
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
    const hoop = Array.from({ length: 51 }, (_, i) => {
      const a = (Math.PI * i) / 50;
      return [
        side * 0.345 + 0.175 * Math.cos(a),
        0.945 + 0.235 * Math.sin(a),
        -0.65,
      ];
    });
    line3(interior, hoop, 0.035, p.tan);
    line3(
      interior,
      hoop.map(([x, y, z]) => [x, y - 0.017, z - 0.012]),
      0.022,
      p.black
    );
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
