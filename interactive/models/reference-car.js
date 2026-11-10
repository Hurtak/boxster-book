import * as THREE from 'three';
import { material, group, mesh, box, cylinder, tube, wheel } from './geometry.js';

// Educational roadster envelope, in metres. It is not a Porsche CAD model.
export function referenceCar() {
  const car = group('reference-car');
  car.userData = { units: 'metres', kind: 'educational schematic', reference: '2010 Boxster 2.9' };
  const silver = material('#b7c0c9', 0.55, 0.38);
  const dark = material('#28313c');
  const bodyPaint = material('#c7cfd5', 0.55, 0.3);
  const body = group('body', car);
  const chassis = group('chassis', car);
  const interior = group('interior', car);
  box(chassis, [1.38, 0.08, 3.55], dark, [0, 0.25, 0]);
  for (const z of [-1.2075, 1.2075]) box(chassis, [1.53, 0.06, 0.1], silver, [0, 0.33, z]);
  const loft = (sections) => {
    const positions = [];
    const indices = [];
    for (const [z, width, height] of sections) {
      for (const [fraction, rise] of [[-1, -0.18], [-1, -0.02], [-0.8, 0.04], [-0.4, 0.07], [0, 0.08], [0.4, 0.07], [0.8, 0.04], [1, -0.02], [1, -0.18]]) {
        positions.push(width * fraction, height + rise, z);
      }
    }
    for (let row = 0; row < sections.length - 1; row++) for (let col = 0; col < 8; col++) {
      const a = row * 9 + col;
      indices.push(a, a + 9, a + 1, a + 1, a + 9, a + 10);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const paint = bodyPaint.clone();
    paint.side = THREE.DoubleSide;
    mesh(body, geometry, paint);
  };
  loft([[2.12, 0.63, 0.48], [1.85, 0.83, 0.61], [1.3, 0.88, 0.73], [0.72, 0.77, 0.72]]);
  loft([[-0.62, 0.77, 0.76], [-1.2, 0.88, 0.75], [-1.85, 0.84, 0.67], [-2.12, 0.65, 0.49]]);
  for (const side of [-1, 1]) {
    box(body, [0.15, 0.34, 1.35], bodyPaint, [side * 0.76, 0.56, 0.02]);
    box(body, [0.015, 0.12, 0.24], dark, [side * 0.842, 0.61, -0.52], [0.12, 0, -side * 0.18]);
    const light = mesh(body, new THREE.SphereGeometry(1, 20, 12), material('#eef2ee', 0.2, 0.2), [side * 0.61, 0.73, 1.67]);
    light.scale.set(0.16, 0.045, 0.2);
    const rearLight = mesh(body, new THREE.SphereGeometry(1, 20, 8), material('#8b2430', 0.15, 0.3), [side * 0.61, 0.62, -1.96]);
    rearLight.scale.set(0.21, 0.045, 0.065);
    box(body, [0.27, 0.09, 0.035], dark, [side * 0.52, 0.43, 2.09]);
    const seat = group(`seat-${side}`, interior, [side * 0.35, 0.47, -0.05]);
    box(seat, [0.42, 0.13, 0.48], dark, [0, 0.08, 0]);
    box(seat, [0.41, 0.49, 0.12], dark, [0, 0.36, -0.21], [-0.1, 0, 0]);
    box(seat, [0.23, 0.16, 0.13], dark, [0, 0.65, -0.24]);
    tube(interior, [[side * 0.35 - 0.14, 0.8, -0.52], [side * 0.35 - 0.13, 1.03, -0.52], [side * 0.35 + 0.13, 1.03, -0.52], [side * 0.35 + 0.14, 0.8, -0.52]], 0.025, silver);
  }
  box(interior, [1.33, 0.14, 0.24], dark, [0, 0.79, 0.54]);
  const windshield = new THREE.BufferGeometry();
  windshield.setAttribute('position', new THREE.Float32BufferAttribute([-0.68, 0.78, 0.65, 0.68, 0.78, 0.65, -0.6, 1.2, 0.28, 0.6, 1.2, 0.28], 3));
  windshield.setIndex([0, 1, 2, 1, 3, 2]);
  windshield.computeVertexNormals();
  mesh(body, windshield, new THREE.MeshStandardMaterial({ color: '#a9c6ce', transparent: true, opacity: 0.45, side: THREE.DoubleSide, roughness: 0.1 }));
  tube(body, [[-0.68, 0.78, 0.65], [-0.6, 1.2, 0.28], [0.6, 1.2, 0.28], [0.68, 0.78, 0.65]], 0.025, silver);
  for (const [name, x, z] of [['wheel-fl', -0.76, 1.2075], ['wheel-fr', 0.76, 1.2075], ['wheel-rl', -0.76, -1.2075], ['wheel-rr', 0.76, -1.2075]]) {
    const result = wheel(car, name, [x, 0.329, z], silver);
    if (x < 0) result.rotation.y = Math.PI;
  }
  const engine = group('engine', car, [0, 0.52, -0.7]);
  box(engine, [0.62, 0.25, 0.62], silver);
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) cylinder(engine, 0.075, 0.22, silver, [side * 0.36, 0, -0.2 + i * 0.2]);
  const gearbox = group('gearbox', car, [0, 0.4, -1.48]);
  cylinder(gearbox, 0.13, 0.55, silver, [0, 0, 0], [Math.PI / 2, 0, 0]);
  const lines = group('hydraulics', car);
  const blue = material('#1d5fbf', 0.1, 0.4);
  const master = group('master-cylinder', lines, [0.28, 0.68, 0.75]);
  cylinder(master, 0.045, 0.25, blue, [0, 0, 0], [Math.PI / 2, 0, 0]);
  box(master, [0.11, 0.08, 0.12], material('#e5e9e9'), [0, 0.08, 0]);
  for (const x of [-0.76, 0.76]) for (const z of [-1.2075, 1.2075]) {
    tube(lines, [[0.28, 0.68, 0.75], [0.12, 0.35, 0.55], [0.12, 0.3, z], [x, 0.33, z]], 0.009, blue);
  }
  return car;
}
