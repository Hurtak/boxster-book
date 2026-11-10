import * as THREE from 'three';
import { material, group, mesh, box, cylinder, wheel, annulus } from '../../../../interactive/models/geometry.js';

// Nominal front disc envelope is 318 × 28 mm. Other geometry is illustrative.
export function brakeAssembly() {
  const root = group('front-brake-assembly');
  root.userData = { units: 'metres', kind: 'educational schematic', discDiameterMm: 318, discThicknessMm: 28 };
  const steel = material('#abb5c2', 0.75, 0.4);
  const black = material('#24272c', 0.25, 0.45);
  const padMaterial = material('#8f6546', 0.05, 0.9);
  wheel(root, 'wheel', [0, 0, 0], steel);
  const rotor = group('disc', root);
  annulus(rotor, 0.159, 0.079, 0.009, steel, [-0.0095, 0, 0], true);
  annulus(rotor, 0.159, 0.079, 0.009, steel, [0.0095, 0, 0], true);
  for (let i = 0; i < 30; i++) {
    const angle = i * Math.PI * 2 / 30;
    box(rotor, [0.01, 0.065, 0.003], steel, [0, Math.cos(angle) * 0.116, Math.sin(angle) * 0.116], [angle, 0, 0]);
  }
  annulus(rotor, 0.08, 0.035, 0.022, steel);
  const hub = group('hub', root, [-0.04, 0, 0]);
  cylinder(hub, 0.065, 0.065, steel, [0, 0, 0]);
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    cylinder(hub, 0.007, 0.12, steel, [0.025, Math.sin(angle) * 0.05, Math.cos(angle) * 0.05]);
  }
  for (const [name, x] of [['inner-pad', -0.024], ['outer-pad', 0.024]]) {
    const pad = group(name, root, [x, 0, 0.12]);
    box(pad, [0.014, 0.145, 0.055], padMaterial);
    box(pad, [0.005, 0.155, 0.06], steel, [Math.sign(x) * 0.01, 0, 0]);
  }
  const caliper = group('caliper', root, [0, 0, 0.13]);
  for (const side of [-1, 1]) box(caliper, [0.04, 0.185, 0.07], black, [side * 0.064, 0, 0.005]);
  box(caliper, [0.17, 0.055, 0.035], black, [0, 0, 0.064]);
  for (const y of [-0.074, 0.074]) box(caliper, [0.17, 0.035, 0.04], black, [0, y, 0.054]);
  const pistons = group('pistons', root, [0, 0, 0.12]);
  for (const side of [-1, 1]) for (const y of [-0.048, 0.048]) {
    const piston = cylinder(pistons, 0.022, 0.026, steel, [side * 0.042, y, 0]);
    piston.name = `piston-${side < 0 ? 'inboard' : 'outboard'}-${y < 0 ? 'lower' : 'upper'}`;
  }
  return root;
}
