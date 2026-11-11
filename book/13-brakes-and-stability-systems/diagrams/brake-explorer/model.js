import * as THREE from 'three';
import { material, group, mesh, box, cylinder, wheel, annulus, tube } from '../../../../interactive/models/geometry.js';

// Nominal front friction-ring envelope is 318 × 28 mm. Other geometry is illustrative.
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
    box(rotor, [0.01, 0.076, 0.003], steel, [0, Math.cos(angle) * 0.119, Math.sin(angle) * 0.119], [angle, 0, 0]);
  }
  annulus(rotor, 0.08, 0.035, 0.022, steel);
  const hub = group('hub', root, [-0.036, 0, 0]);
  cylinder(hub, 0.033, 0.066, steel);
  // This car uses removable wheel bolts, not studs protruding from the hub.
  // The holes and flange proportions show the relationship, not a bolt-circle measurement.
  const flange = new THREE.Shape();
  flange.absarc(0, 0, 0.065, 0, Math.PI * 2, false);
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    const hole = new THREE.Path();
    hole.absarc(-Math.sin(angle) * 0.043, Math.cos(angle) * 0.043, 0.007, 0, Math.PI * 2, true);
    flange.holes.push(hole);
  }
  const flangeGeometry = new THREE.ExtrudeGeometry(flange, { depth: 0.024, bevelEnabled: false, curveSegments: 32 });
  flangeGeometry.translate(0, 0, -0.012);
  mesh(hub, flangeGeometry, steel, [0.012, 0, 0], [0, Math.PI / 2, 0]);
  for (const [name, x] of [['inner-pad', -0.024], ['outer-pad', 0.024]]) {
    const pad = group(name, root, [x, 0, 0.12]);
    box(pad, [0.014, 0.135, 0.045], padMaterial);
    box(pad, [0.005, 0.14, 0.045], steel, [Math.sign(x) * 0.01, 0, 0]);
  }
  const caliper = group('caliper', root, [0, 0, 0.13]);
  for (const side of [-1, 1]) box(caliper, [0.04, 0.185, 0.07], black, [side * 0.064, 0, 0.005]);
  box(caliper, [0.17, 0.055, 0.035], black, [0, 0, 0.064]);
  for (const y of [-0.074, 0.074]) box(caliper, [0.17, 0.035, 0.04], black, [0, y, 0.054]);
  const pistons = group('pistons', root, [0, 0, 0.12]);
  for (const side of [-1, 1]) for (const y of [-0.043, 0.043]) {
    const piston = cylinder(pistons, 0.022, 0.026, steel, [side * 0.042, y, 0]);
    piston.name = `piston-${side < 0 ? 'inboard' : 'outboard'}-${y < 0 ? 'lower' : 'upper'}`;
  }
  // PET 602-000 item 3: a stationary cover behind the disc, open around the caliper.
  // The outline is an explanatory sector, not a tracing or a measured clearance.
  const cover = group('cover-plate', root, [-0.028, 0, 0]);
  const coverShape = new THREE.Shape();
  coverShape.absarc(0, 0, 0.151, -Math.PI * 0.8, Math.PI * 0.8, false);
  coverShape.absarc(0, 0, 0.075, Math.PI * 0.8, -Math.PI * 0.8, true);
  coverShape.closePath();
  const coverGeometry = new THREE.ExtrudeGeometry(coverShape, { depth: 0.002, bevelEnabled: false, curveSegments: 32 });
  coverGeometry.translate(0, 0, -0.001);
  mesh(cover, coverGeometry, material('#59616a', 0.45, 0.65), [0, 0, 0], [0, Math.PI / 2, 0]);

  // PET 602-000 item 15 groups the pin, spring and securing hardware.
  const retainers = group('pad-retainers', root, [0, 0, 0.177]);
  cylinder(retainers, 0.0035, 0.15, steel);
  box(retainers, [0.072, 0.057, 0.002], steel, [0, 0, 0.003]);
  for (const side of [-1, 1]) box(retainers, [0.02, 0.057, 0.002], steel, [side * 0.043, 0, -0.003], [0, side * 0.4, 0]);

  // Separate electrical wear lead and hydraulic supply: colours identify function.
  const wearLead = group('wear-lead', root);
  const wire = material('#496a42', 0.1, 0.7);
  tube(wearLead, [[0.029, 0.05, 0.14], [0.09, 0.08, 0.17], [0.08, 0.13, 0.23], [-0.07, 0.13, 0.23], [-0.11, 0.13, 0.15]], 0.0025, wire);
  tube(wearLead, [[-0.029, 0.05, 0.14], [-0.09, 0.08, 0.16], [-0.11, 0.13, 0.15]], 0.0025, wire);
  box(wearLead, [0.023, 0.012, 0.012], black, [-0.12, 0.13, 0.15]);
  for (const side of [-1, 1]) box(wearLead, [0.008, 0.014, 0.009], black, [side * 0.029, 0.05, 0.14]);

  const supply = group('brake-hose', root);
  tube(supply, [[-0.084, -0.04, 0.13], [-0.12, -0.04, 0.13], [-0.17, -0.02, 0.08]], 0.003, steel);
  tube(supply, [[-0.17, -0.02, 0.08], [-0.23, 0.05, 0.08], [-0.23, 0.16, 0.05], [-0.19, 0.22, -0.03]], 0.005, black);
  cylinder(supply, 0.008, 0.018, steel, [-0.17, -0.02, 0.08]);
  cylinder(supply, 0.008, 0.018, steel, [-0.19, 0.22, -0.03]);
  // One bleed valve is shown on the standard front caliper; the PET's external
  // front crossover pipe is PR:450, so it is deliberately absent from this model.
  cylinder(caliper, 0.004, 0.012, steel, [-0.064, 0.094, 0.005], [0, 0, 0]);
  return root;
}
