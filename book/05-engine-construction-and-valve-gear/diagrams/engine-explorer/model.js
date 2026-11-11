import {
  assembly, part, materials, box, cylinder, annulus, beam, tube, sphere, coil, gear,
} from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'engine-explorer',
  title: 'From the car to the flat-six',
  location: 'The 2010 2.9 engine sits low behind the seats, ahead of the rear axle. Its crankshaft runs along the car; three horizontal cylinders lie on each side.',
  overview: 'Follow the crankcase, six piston-and-rod assemblies, crankshaft, outer cylinder heads and four camshafts with their drive wheels. The intake lies above; manifolds and their catalysts leave below the heads.',
  assembled: 'The crankcase supports the cylinders and rotating shaft. Each head closes one bank of three cylinders, with two longitudinal camshafts acting through hydraulic tappets on spring-returned valves. The cutaway omits solid walls and covers so these relationships remain visible.',
  exploded: 'The heads, valve gear, breathing equipment and internal mechanism separate for inspection. These display offsets are not operating travel or an engine-removal sequence.',
  focus: 'crankcase',
  hideCarParts: ['engine'],
  direction: [1.3, 0.85, 1.5],
  note: 'Port-injected 2.9 cutaway. Positions and angles are illustrative; all chains, cooling jackets and most covers are omitted. Drive wheels, tappets, springs and gaskets are simplified. The visible bore sections are part of the crankcase, not removable iron liners.',
  connections: [
    { from: 'crankcase', to: 'crankshaft', label: 'Main bearings support the rotating crankshaft', kind: 'structure' },
    { from: 'pistons-rods', to: 'crankshaft', label: 'Six rods transmit piston force to six separate crankpins', kind: 'mechanical' },
    { from: 'crankcase', to: 'left-head', label: 'One head closes the three left-side cylinders', kind: 'structure' },
    { from: 'crankcase', to: 'right-head', label: 'One head closes the three right-side cylinders', kind: 'structure' },
    { from: 'crankshaft', to: 'camshafts', label: 'Two omitted timing chains drive the cams at half crankshaft speed', kind: 'mechanical' },
    { from: 'camshafts', to: 'left-head', label: 'Two cams act through hydraulic tappets on the left head’s valves', kind: 'mechanical' },
    { from: 'camshafts', to: 'right-head', label: 'Two cams act through hydraulic tappets on the right head’s valves', kind: 'mechanical' },
    { from: 'intake', to: 'left-head', label: 'Intake runners deliver charge to the inlet ports', kind: 'air' },
    { from: 'intake', to: 'right-head', label: 'Intake runners supply the other cylinder bank', kind: 'air' },
    { from: 'left-head', to: 'exhaust', label: 'Exhaust ports discharge through the manifold to its catalyst', kind: 'air' },
    { from: 'right-head', to: 'exhaust', label: 'The other bank has its own manifold and catalyst', kind: 'air' },
  ],
};

const origin = [0, 0.49, -0.82];
const boreZ = (index, side) => (index - 1) * 0.18 + side * 0.024;
const crankpin = (index, side) => {
  const angle = index * Math.PI * 2 / 3 + (side < 0 ? Math.PI : 0);
  return [0.039 * Math.cos(angle), 0.039 * Math.sin(angle), boreZ(index, side)];
};

export function createAssembly() {
  const root = assembly('engine-assembly');
  const p = materials();
  const crankcase = part(root, 'crankcase', 'Crankcase', origin, [0, -0.2, 0],
    'The aluminium-silicon crankcase locates both cylinder banks and the crankshaft bearings. Its solid casting and cooling jackets are cut away here; the visible rings are sections through the bores, not removable iron cylinder liners.');
  const crank = part(root, 'crankshaft', 'Crankshaft', origin, [0, 0.08, -0.42],
    'One longitudinal crankshaft receives the force from six rods. Each rod has its own offset crankpin; opposed rods do not share a pin. This display does not specify firing order or crank-setting angles.');
  const pistons = part(root, 'pistons-rods', 'Pistons and rods', origin, [0, 0.36, 0.08],
    'Six horizontal pistons connect to six crankpins through articulated rods. The two banks are staggered along the shaft. Each piston has three rings and a pin retained by securing rings. The piston pins let the rods change angle; separate big-end bearing shells support the crankpin joints.');
  const heads = [-1, 1].map(side => part(root, side > 0 ? 'left-head' : 'right-head', side > 0 ? 'Left cylinder head' : 'Right cylinder head',
    [side * 0.43, origin[1], origin[2] + side * 0.024], [side * 0.35, 0.03, 0],
    'This head closes three cylinders and contains twelve valves: two inlet and two exhaust valves per cylinder. Hydraulic bucket tappets transmit cam motion to the valves; springs return them to their seats. A head gasket seals the joint to the crankcase. The open frame is a cutaway, not the exterior casting.'));
  const cams = part(root, 'camshafts', 'Four camshafts', origin, [0, 0.66, 0],
    'Each head carries one inlet and one exhaust camshaft, four in total. Lobes act through the hydraulic tappets. Each inlet cam has a phase-adjuster drive unit; each exhaust cam has a fixed chain sprocket. Two omitted cam-drive chains maintain half crankshaft speed. The separate oil-pump chain is also omitted; VarioCam Plus adjusts inlet timing and lift.');
  const intake = part(root, 'intake', 'Intake and runners', origin, [0, 0.93, 0.12],
    'The intake sits above the low engine, with three runners feeding each bank. On the 2.9, fuel joins the air at the inlet ports before the valves; this view omits the injectors and their wiring.');
  const exhaust = part(root, 'exhaust', 'Manifolds and catalysts', origin, [0, -0.35, -0.08],
    'Three exhaust ports feed one manifold assembly per bank, with its catalytic converter immediately after the branches merge. The downstream silencers continue beyond this cutaway; their flow and emissions functions are explained in the fluids and exhaust chapter.');

  // Sectioned crankcase rails expose the crank and horizontal bores.
  box(crankcase, [0.2, 0.055, 0.62], p.metal, [0, -0.095, 0]);
  for (const side of [-1, 1]) {
    for (const y of [-0.095, 0.095]) box(crankcase, [0.24, 0.025, 0.58], p.metal, [side * 0.22, y, side * 0.024]);
    // Open-side bridge represents continuity of the casting.
    box(crankcase, [0.025, 0.14, 0.48], p.metal, [side * 0.365, 0, side * 0.024]);
    for (let i = 0; i < 3; i++) {
      const z = boreZ(i, side);
      annulus(crankcase, 0.064, 0.052, 0.24, p.metal, [side * 0.25, 0, z]);
      const pin = crankpin(i, side);
      cylinder(crank, 0.018, 0.027, p.warm, pin, [Math.PI / 2, 0, 0]).name = `crankpin-${side}-${i}`;
      beam(crank, [0, 0, z - 0.02], [pin[0], pin[1], z - 0.02], 0.017, p.dark);
      beam(crank, [0, 0, z + 0.02], [pin[0], pin[1], z + 0.02], 0.017, p.dark);
      // Keep the same illustrative rod length at every static crank position.
      const pistonX = pin[0] + side * Math.sqrt(0.24 ** 2 - pin[1] ** 2);
      const pistonPin = [pistonX, 0, z];
      beam(pistons, pin, pistonPin, 0.012, p.metal);
      const bigEnd = annulus(pistons, 0.023, 0.018, 0.02, p.dark, pin);
      bigEnd.rotation.set(0, 0, 0);
      bigEnd.name = 'rod-big-end-bearing-section';
      cylinder(pistons, 0.048, 0.065, p.metal, [pistonX, 0, z]).name = `piston-${side}-${i}`;
      for (const dx of [0.009, 0.020, 0.030]) annulus(pistons, 0.049, 0.046, 0.003, p.dark, [pistonX + side * dx, 0, z]);
      cylinder(pistons, 0.009, 0.075, p.warm, pistonPin, [Math.PI / 2, 0, 0]);
    }
  }
  cylinder(crank, 0.018, 0.65, p.dark, [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 8; i++) cylinder(crank, 0.027, 0.017, p.metal, [0, 0, -0.28 + i * 0.08], [Math.PI / 2, 0, 0]);

  for (const [j, side] of [-1, 1].entries()) {
    const head = heads[j];
    for (const y of [-0.095, 0.095]) box(head, [0.14, 0.025, 0.59], p.metal, [0, y, 0]);
    for (const z of [-0.28, 0.28]) box(head, [0.14, 0.19, 0.025], p.metal, [0, 0, z]);
    for (let i = 0; i < 3; i++) {
      const z = (i - 1) * 0.18;
      annulus(head, 0.057, 0.047, 0.015, p.metal, [-side * 0.066, 0, z]);
      annulus(head, 0.062, 0.047, 0.003, p.dark, [-side * 0.076, 0, z]).name = 'head-gasket-section';
      for (const y of [-0.035, 0.035]) for (const dz of [-0.018, 0.018]) {
        const start = [-side * 0.06, y, z + dz];
        const end = [side * 0.09, y * 1.9, z + dz];
        beam(head, start, end, 0.004, p.warm).name = 'valve-stem';
        cylinder(head, 0.014, 0.005, p.metal, start);
        // One symbolic return coil per valve; no factory spring dimensions
        // or inner/outer spring arrangement is modelled.
        coil(head, [side * 0.014, y * 1.44, z + dz], [side * 0.066, y * 1.76, z + dz], 0.009, 0.0018, p.dark, 4).name = 'valve-return-spring';
        cylinder(head, 0.012, 0.018, p.metal, [side * 0.086, y * 1.9, z + dz]).name = 'hydraulic-tappet';
      }
    }
    for (const y of [-0.067, 0.067]) {
      const x = side * 0.525;
      cylinder(cams, 0.012, 0.61, p.dark, [x, y, side * 0.024], [Math.PI / 2, 0, 0]).name = 'camshaft';
      // Pulley-side drive wheels: illustrative diameters, teeth and spacing.
      const wheel = gear(cams, 0.044, y > 0 ? 0.024 : 0.012, p.warm, [x, y, 0.325 + side * 0.024], 20);
      wheel.name = y > 0 ? 'inlet-phase-adjuster' : 'exhaust-chain-sprocket';
      if (y > 0) cylinder(cams, 0.031, 0.027, p.metal, [x, y, 0.329 + side * 0.024], [Math.PI / 2, 0, 0]);
      for (let i = 0; i < 3; i++) for (const dz of [-0.018, 0.018]) {
        sphere(cams, 0.021, p.warm, [x + side * 0.007, y, boreZ(i, side) + dz], [1.3, 1, 0.38]);
      }
    }
    cylinder(intake, 0.062, 0.56, p.black, [side * 0.22, 0.29, side * 0.024], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 3; i++) {
      const z = boreZ(i, side);
      tube(intake, [[side * 0.22, 0.29, z], [side * 0.36, 0.23, z], [side * 0.43, 0.08, z]], 0.023, p.black);
      tube(exhaust, [[side * 0.43, -0.07, z], [side * 0.44, -0.2, z], [side * 0.32, -0.24, -0.3]], 0.021, p.warm);
    }
    cylinder(exhaust, 0.035, 0.08, p.warm, [side * 0.32, -0.24, -0.34], [Math.PI / 2, 0, 0]);
    cylinder(exhaust, 0.060, 0.14, p.warm, [side * 0.32, -0.24, -0.43], [Math.PI / 2, 0, 0]).name = 'manifold-catalyst';
  }
  tube(intake, [[-0.22, 0.29, 0.11], [0, 0.32, 0.11], [0.22, 0.29, 0.11]], 0.042, p.black);
  cylinder(intake, 0.048, 0.11, p.metal, [0, 0.32, 0.19], [Math.PI / 2, 0, 0]);
  intake.scale.y = .82;
  return root;
}
