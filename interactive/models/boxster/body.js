import * as THREE from 'three';
import { group, mesh } from '../geometry.js';
import {
  rounded,
  ellipsoid,
  line3,
  surfaceLine,
  smooth2,
  mappedShape,
  patch,
} from './surfaces.js';
import {
  front,
  rear,
  width,
  deckHeight,
  shoulder,
  flank,
  capBoundary,
} from './shape.js';
import { frontBumper, rearBumper } from './bumpers.js';
import { headlights, tailLights } from './lights.js';

function bodySide(parent, side, p) {
  const outline = [];
  for (let i = 0; i <= 160; i++) {
    const z = front + ((rear - front) * i) / 160;
    outline.push(new THREE.Vector2(z, shoulder(z)));
  }
  outline.push(new THREE.Vector2(rear, 0.2));
  for (const axle of [-1.2075, 1.2075]) {
    outline.push(
      new THREE.Vector2(axle - 0.354, 0.195),
      new THREE.Vector2(axle - 0.354, 0.329)
    );
    for (let i = 0; i <= 64; i++) {
      const a = Math.PI - (i * Math.PI) / 64;
      outline.push(
        new THREE.Vector2(
          axle + 0.354 * Math.cos(a),
          0.329 + 0.354 * Math.sin(a)
        )
      );
    }
    outline.push(new THREE.Vector2(axle + 0.354, 0.195));
  }
  outline.push(new THREE.Vector2(front, 0.195));
  const intake = smooth2(
    [
      [-0.565, 0.68],
      [-0.69, 0.716],
      [-0.82, 0.683],
      [-0.78, 0.43],
      [-0.71, 0.405],
      [-0.63, 0.49],
    ],
    96
  );
  mappedShape(
    parent,
    `quarter-and-door-${side}`,
    outline,
    [intake],
    (z, y) => [flank(side, z, y), y, z],
    p.paint
  );
  // A dark recessed opening, a bright rim and four transverse silver vanes.
  mappedShape(
    parent,
    `side-intake-${side}`,
    intake,
    [],
    (z, y) => [flank(side, z, y) - side * 0.018, y, z],
    p.black
  );
  line3(
    parent,
    intake.map((v) => [flank(side, v.x, v.y) + side * 0.002, v.y, v.x]),
    0.004,
    p.silver,
    true
  );
  for (let i = 0; i < 4; i++) {
    const y = 0.455 + i * 0.062;
    const z0 = -0.8 - i * 0.007,
      z1 = -0.665 + i * 0.022;
    line3(
      parent,
      [
        [flank(side, z0, y) + side * 0.002, y, z0],
        [
          flank(side, (z0 + z1) / 2, y) + side * 0.008,
          y + 0.004,
          (z0 + z1) / 2,
        ],
        [flank(side, z1, y) + side * 0.002, y, z1],
      ],
      0.008,
      p.silver
    );
  }
  // Door shut line and flush handle.
  const seam = [
    [0.47, 0.73],
    [0.48, 0.59],
    [0.43, 0.31],
    [0.32, 0.255],
    [-0.41, 0.25],
    [-0.53, 0.31],
    [-0.53, 0.58],
    [-0.49, 0.71],
  ];
  surfaceLine(
    parent,
    seam,
    (z, y) => [flank(side, z, y) + side * 0.0018, y, z],
    0.0016,
    p.black
  );
  const handle = group(`door-handle-${side}`, parent, [
    flank(side, -0.37, 0.69) + side * 0.002,
    0.69,
    -0.37,
  ]);
  rounded(handle, [0.014, 0.043, 0.135], p.black, [0, 0, 0], 0.018);
  rounded(
    handle,
    [0.018, 0.022, 0.112],
    p.paint,
    [side * 0.009, 0.007, -0.004],
    0.009
  );
  for (const axle of [-1.2075, 1.2075]) {
    const arch = [];
    for (let i = 0; i <= 80; i++) {
      const a = (Math.PI * i) / 80;
      const z = axle + 0.355 * Math.cos(a),
        y = 0.329 + 0.355 * Math.sin(a);
      arch.push([flank(side, z, y) + side * 0.002, y, z]);
    }
    line3(parent, arch, 0.006, p.paint);
    line3(
      parent,
      arch.map(([x, y, z]) => [x - side * 0.015, y - 0.007, z]),
      0.011,
      p.rubber
    );
    mesh(
      parent,
      new THREE.CylinderGeometry(0.355, 0.355, 0.24, 72, 1, true, 0, Math.PI),
      p.rubber,
      [side * 0.73, 0.329, axle],
      [0, 0, Math.PI / 2]
    );
  }
  // Lower sill has a curved, painted ridge rather than a separate rectangular slab.
  const sill = [];
  for (let i = 0; i <= 45; i++) {
    const z = -0.82 + (i * 1.63) / 45,
      y = 0.205 + 0.016 * Math.cos(z * 1.6);
    sill.push([flank(side, z, y) + side * 0.004, y, z]);
  }
  line3(parent, sill, 0.017, p.paint);
  const indicator = group(`clear-side-repeater-${side}`, parent, [
    flank(side, 1.62, 0.51) + side * 0.006,
    0.51,
    1.62,
  ]);
  rounded(indicator, [0.009, 0.028, 0.135], p.chrome, [0, 0, 0], 0.01);
  rounded(
    indicator,
    [0.012, 0.023, 0.125],
    p.lens,
    [side * 0.005, 0, 0],
    0.009
  );
}

export function exterior(parent, p) {
  const body = group('body', parent);
  for (const [name, start, end] of [
    ['front-deck', 0.5, front],
    ['rear-deck', -0.68, rear],
  ]) {
    const outline = [];
    for (let i = 0; i <= 120; i++) {
      const z = start + ((end - start) * i) / 120;
      outline.push(new THREE.Vector2(-width(z), z));
    }
    for (const { x, z } of capBoundary(name === 'rear-deck').slice(1))
      outline.push(new THREE.Vector2(x, z));
    for (let i = 119; i >= 0; i--) {
      const z = start + ((end - start) * i) / 120;
      outline.push(new THREE.Vector2(width(z), z));
    }
    const holes =
      name === 'front-deck'
        ? [-1, 1].map((side) =>
            Array.from({ length: 96 }, (_, i) => {
              const a = (i * Math.PI * 2) / 96;
              return new THREE.Vector2(
                side * 0.645 + 0.143 * Math.cos(a),
                1.62 + 0.235 * Math.sin(a)
              );
            })
          )
        : [];
    mappedShape(
      body,
      name,
      outline,
      holes,
      (x, z) => [x, deckHeight(x, z), z],
      p.paint
    );
  }
  // Narrow upper door rails surround the actual open cockpit.
  for (const side of [-1, 1]) {
    patch(
      body,
      `cockpit-rail-${side}`,
      (u, v) => {
        const z = -0.68 + 1.18 * v,
          outer = width(z),
          inner = 0.635 + 0.02 * Math.cos(z * 3),
          x = side * (inner + (outer - inner) * u);
        return [x, deckHeight(x, z), z];
      },
      20,
      100,
      p.paint
    );
    bodySide(body, side, p);
    headlights(body, p, side);
    tailLights(body, p, side);
    const seam = [];
    for (const [x, z] of [
      [0, 1.985],
      [0.32, 1.96],
      [0.49, 1.83],
      [0.53, 1.2],
      [0.56, 0.72],
      [0.62, 0.57],
    ])
      seam.push([side * x, z]);
    surfaceLine(
      body,
      seam,
      (x, z) => [x, deckHeight(x, z) + 0.002, z],
      0.0016,
      p.black
    );
    const trunk = [];
    for (const [x, z] of [
      [0, -2.09],
      [0.36, -2.06],
      [0.53, -1.94],
      [0.61, -1.5],
      [0.62, -0.94],
      [0.55, -0.79],
    ])
      trunk.push([side * x, z]);
    surfaceLine(
      body,
      trunk,
      (x, z) => [x, deckHeight(x, z) + 0.003, z],
      0.0016,
      p.black
    );
    const mirror = group(`mirror-${side}`, body, [side * 0.8, 0.81, 0.37]);
    rounded(
      mirror,
      [0.1, 0.035, 0.05],
      p.black,
      [side * 0.02, -0.025, -0.005],
      0.014,
      [0, 0, side * 0.3]
    );
    ellipsoid(
      mirror,
      [0.105, 0.058, 0.082],
      p.paint,
      [side * 0.105, 0.015, 0],
      [0, side * 0.16, 0]
    );
    ellipsoid(
      mirror,
      [0.078, 0.04, 0.006],
      p.chrome,
      [side * 0.11, 0.014, -0.069],
      [0, side * 0.12, 0]
    );
    line3(
      body,
      [
        [side * 0.64, 0.78, -0.67],
        [side * 0.73, 0.77, -0.85],
        [side * 0.75, 0.77, -1.02],
      ],
      0.002,
      p.black
    );
  }
  frontBumper(body, p);
  rearBumper(body, p);
  const rearSeam = [];
  for (let i = 0; i <= 60; i++) {
    const x = -0.56 + (i * 1.12) / 60,
      z = -0.8 - 0.06 * (x / 0.56) ** 2;
    rearSeam.push([x, deckHeight(x, z) + 0.004, z]);
  }
  line3(body, rearSeam, 0.002, p.black);
  const spoiler = [];
  for (let i = 0; i <= 80; i++) {
    const x = -0.61 + (1.22 * i) / 80,
      z = -1.96 + 0.11 * (x / 0.61) ** 2;
    spoiler.push([x, deckHeight(x, z) + 0.003, z]);
  }
  line3(body, spoiler, 0.002, p.black);
  // Fuel flap on the right front wing.
  const fuel = [];
  for (let i = 0; i < 80; i++) {
    const a = (i * Math.PI * 2) / 80,
      x = 0.765 + 0.061 * Math.cos(a),
      z = 0.91 + 0.071 * Math.sin(a);
    fuel.push([x, deckHeight(x, z) + 0.003, z]);
  }
  line3(body, fuel, 0.0015, p.black, true);
  const crest = new THREE.Shape([
    new THREE.Vector2(-0.018, 0.025),
    new THREE.Vector2(0.018, 0.025),
    new THREE.Vector2(0.014, -0.009),
    new THREE.Vector2(0, -0.025),
    new THREE.Vector2(-0.014, -0.009),
  ]);
  const gold = new THREE.MeshStandardMaterial({
    color: '#b69a52',
    metalness: 0.65,
    roughness: 0.28,
    side: THREE.DoubleSide,
  });
  mesh(
    body,
    new THREE.ShapeGeometry(crest),
    gold,
    [0, deckHeight(0, 1.94) + 0.003, 1.94],
    [-Math.PI / 2, 0, 0]
  );
  return body;
}
