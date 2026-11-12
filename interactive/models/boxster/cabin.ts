import * as THREE from 'three';
import { cylinder, group, mesh } from '../geometry.ts';
import { radioUnit } from './radio.ts';
import { centreWindbreak, rollHoop, seat } from './seats.ts';
import type { Palette } from './surfaces';
import { ellipsoid, line3, patch, rounded } from './surfaces.ts';
import { windscreenFrame, windscreenGlass, windscreenPoint } from './windscreen.ts';

function instruments(parent: THREE.Object3D, p: Palette) {
  patch(
    parent,
    'instrument-binnacle',
    (u: number, v: number) => {
      const a = u * Math.PI;
      return [0.345 + 0.198 * Math.cos(a), 0.82 + 0.1 * Math.sin(a), 0.41 + v * 0.145];
    },
    48,
    20,
    p.tan,
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
    mesh(dial, new THREE.CircleGeometry(r, 48), p.black, [0, 0, -0.033], [0, Math.PI, 0]);
    mesh(dial, new THREE.TorusGeometry(r, 0.0025, 6, 48), p.silver, [0, 0, -0.035]);
    for (let j = 0; j < 15; j++) {
      const a = (0.72 + j * 0.115) * Math.PI;
      line3(
        dial,
        [
          [Math.cos(a) * r * 0.77, Math.sin(a) * r * 0.77, -0.036],
          [Math.cos(a) * r * 0.91, Math.sin(a) * r * 0.91, -0.036],
        ],
        0.0007,
        p.white,
      );
    }
    line3(
      dial,
      [
        [0, 0, -0.038],
        [r * 0.6, r * 0.32, -0.038],
      ],
      0.0013,
      new THREE.MeshStandardMaterial({ color: '#bd3e2e' }),
    );
  }
  steeringWheel(parent, p);
  const column = group('steering-column-context', parent);
  column.userData.carPart = true;
  line3(
    column,
    [
      [0.37, 0.73, 0.45],
      [0.34, 0.75, 0.24],
    ],
    0.022,
    p.black,
  );
}

export function steeringWheel(parent: THREE.Object3D, p: Palette) {
  const steering = group('tan-steering-wheel', parent, [0.345, 0.795, 0.197]);
  steering.rotation.x = -0.28;
  mesh(steering, new THREE.TorusGeometry(0.143, 0.016, 12, 80), p.tan);
  for (const a of [0, Math.PI, Math.PI * 1.5]) {
    const spoke = rounded(
      steering,
      [0.11, 0.028, 0.024],
      p.silver,
      [Math.cos(a) * 0.075, Math.sin(a) * 0.075, 0],
      0.008,
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
    [0, 0, -0.034],
  );
  steering.userData.carPart = true;
  return steering;
}

export function manualGearLever(parent: THREE.Object3D, p: Palette) {
  const lever = group('gear-lever', parent);
  lever.userData.carPart = true;
  rounded(lever, [0.145, 0.035, 0.18], p.black, [0, 0.572, -0.017], 0.023);
  ellipsoid(lever, [0.045, 0.045, 0.055], p.tan, [0, 0.6, -0.015]);
  cylinder(lever, 0.009, 0.083, p.chrome, [0, 0.656, -0.015], [0, 0, 0]);
  ellipsoid(lever, [0.027, 0.029, 0.035], p.tan, [0, 0.696, -0.015]);
  return lever;
}

export function windscreen(body: THREE.Object3D, p: Palette) {
  const sample = windscreenPoint;
  windscreenGlass(body, p);
  windscreenFrame(body, p);
  for (const [x, length] of [
    [-0.43, 0.43],
    [0.11, 0.42],
  ] as const) {
    const wiper = sample((x / 0.727 + 1) / 2, 0.035);
    line3(
      body,
      [
        [x - 0.11, wiper[1] + 0.01, wiper[2] + 0.015],
        [x + 0.08, wiper[1] + 0.025, wiper[2] - 0.04],
      ],
      0.004,
      p.black,
    );
    line3(
      body,
      [
        [x - 0.14, wiper[1] + 0.025, wiper[2] - 0.025],
        [x + length - 0.14, wiper[1] + 0.018, wiper[2] - 0.03],
      ],
      0.006,
      p.black,
    );
  }
  const header = windscreenPoint(0.5, 1);
  const mirrorZ = header[2] + 0.07;
  rounded(body, [0.19, 0.055, 0.034], p.black, [0, 1.1, mirrorZ], 0.015);
  rounded(body, [0.173, 0.04, 0.003], p.chrome, [0, 1.1, mirrorZ - 0.02], 0.01);
  line3(
    body,
    [
      [0, header[1] - 0.015, header[2] + 0.02],
      [0, 1.12, mirrorZ],
    ],
    0.008,
    p.black,
  );
}

export function cabin(parent: THREE.Object3D, p: Palette) {
  const interior = group('interior', parent);
  rounded(interior, [1.25, 0.08, 1.12], p.black, [0, 0.36, -0.1], 0.04);
  rounded(interior, [0.21, 0.22, 0.92], p.tan, [0, 0.46, -0.1], 0.045);
  for (const side of [-1, 1]) {
    seat(interior, p, side);
    rounded(interior, [0.045, 0.31, 0.91], p.tan, [side * 0.654, 0.6, -0.04], 0.02);
    rounded(interior, [0.055, 0.07, 0.91], p.black, [side * 0.661, 0.778, -0.04], 0.02);
    rounded(interior, [0.08, 0.04, 0.28], p.tan, [side * 0.618, 0.61, -0.08], 0.013);
    rounded(interior, [0.018, 0.027, 0.095], p.chrome, [side * 0.622, 0.682, 0.06], 0.008);
    rollHoop(interior, p, side);
  }
  rounded(interior, [1.26, 0.17, 0.1], p.black, [0, 0.71, -0.595], 0.04);
  centreWindbreak(interior, p);
  patch(
    interior,
    'curved-tan-dashboard',
    (u: number, v: number) => {
      const x = (u * 2 - 1) * 0.64,
        z = 0.315 + v * 0.37;
      return [x, 0.79 + 0.04 * Math.sin(v * Math.PI) - 0.025 * (x / 0.64) ** 2, z];
    },
    60,
    24,
    p.tan,
  );
  rounded(interior, [1.24, 0.11, 0.09], p.tan, [0, 0.746, 0.35], 0.03);
  for (const x of [-0.575, 0.575, -0.066, 0.066]) {
    const y = Math.abs(x) > 0.5 ? 0.76 : 0.816;
    cylinder(interior, 0.033, 0.024, p.black, [x, y, 0.307], [Math.PI / 2, 0, 0]);
    mesh(interior, new THREE.TorusGeometry(0.033, 0.003, 6, 40), p.silver, [x, y, 0.292]);
    for (let i = -2; i <= 2; i++) rounded(interior, [0.049, 0.002, 0.004], p.black, [x, y + i * 0.008, 0.287], 0.001);
  }
  const console = group('centre-console', interior, [0, 0.66, 0.275]);
  console.userData.carPart = true;
  console.rotation.x = -0.2;
  rounded(console, [0.218, 0.27, 0.065], p.tan, [0, 0, 0], 0.025);
  radioUnit(interior, {
    metal: p.silver,
    dark: p.black,
    black: p.black,
    blue: new THREE.MeshStandardMaterial({ color: '#11292b', roughness: 0.25 }),
  });
  manualGearLever(interior, p);
  rounded(interior, [0.13, 0.045, 0.21], p.tan, [0, 0.596, -0.36], 0.024);
  instruments(interior, p);
  return interior;
}
