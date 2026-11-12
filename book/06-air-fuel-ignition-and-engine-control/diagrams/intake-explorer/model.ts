import { Vector3 } from 'three';
import {
  annulus,
  assembly,
  beam,
  box,
  cylinder,
  materials,
  part,
  sphere,
  tube,
} from '../../../../interactive/three/component-geometry.ts';
import type { ExplorerConfig } from '../../../../interactive/types';

export const config: ExplorerConfig = {
  id: 'intake-explorer',
  title: 'From the car to the intake',
  location:
    'On the 2010 2.9, combustion air enters through the left side opening and reaches the engine behind the seats. The two banks receive air through the intake above them.',
  overview:
    'Follow air from the side opening through filtration, measurement and the throttle. The controller separately commands the port injectors and individual ignition coils.',
  assembled:
    'Three intake runners serve each bank. Two vacuum units operate the tuning flaps. A connected fuel-pipe assembly supplies six sealed port injectors; the coils and plugs ignite the charge inside the cylinders. Air, fuel and electrical links perform different jobs.',
  exploded:
    'The intake, fuel-metering and ignition parts separate for inspection. The offsets expose their relationships; they do not show operating travel or a removal sequence.',
  focus: 'plenum-runners',
  hideCarParts: ['engine'],
  reuseCarParts: { 'left-inlet': ['side-inlet-details-1', 'side-intake-1-walls'] },
  finishInstallation(model) {
    const inlet = model.getObjectByName('left-inlet')!,
      p = materials();
    model.updateMatrixWorld(true);
    const points = [
      [0.815, 0.55, -0.58],
      [0.72, 0.615, -0.63],
      [0.61, 0.64, -0.715],
    ];
    tube(
      inlet,
      points.map((point: number[]) => inlet.worldToLocal(new Vector3(...point)).toArray()),
      0.055,
      p.dark,
    );
  },
  direction: [1.3, 1.1, 1.6],
  note: 'The 2.9 port-injection system is shown. The cylindrical filter, air-guide sleeve, vacuum units and connected fuel pipes follow factory parts drawings; their dimensions and routing remain schematic. Controller position and separation distances are approximate. The front-tank feed, exhaust feedback and other sensors are omitted; no S-model high-pressure injection hardware is fitted here.',
  connections: [
    { from: 'left-inlet', to: 'air-cleaner', label: 'Outside air reaches the filter', kind: 'air' },
    {
      from: 'air-cleaner',
      to: 'maf',
      label: 'Filtered air reaches the measuring tube',
      kind: 'air',
    },
    { from: 'maf', to: 'throttle', label: 'Metered air reaches the throttle', kind: 'air' },
    {
      from: 'throttle',
      to: 'plenum-runners',
      label: 'The butterfly controls the intake restriction',
      kind: 'air',
    },
    {
      from: 'plenum-runners',
      to: 'ports-injectors',
      label: 'Six runners supply the cylinders’ inlet ports',
      kind: 'air',
    },
    { from: 'maf', to: 'dme', label: 'Air-mass information goes to the DME', kind: 'signal' },
    {
      from: 'dme',
      to: 'throttle',
      label: 'Throttle commands coordinate the air charge',
      kind: 'signal',
    },
    {
      from: 'dme',
      to: 'plenum-runners',
      label: 'Change-over valves control vacuum at the two tuning actuators',
      kind: 'signal',
    },
    {
      from: 'dme',
      to: 'ports-injectors',
      label: 'Electrical commands meter port-injected fuel',
      kind: 'signal',
    },
    {
      from: 'dme',
      to: 'coils-plugs',
      label: 'Individual coil commands set spark timing',
      kind: 'signal',
    },
  ],
};

export function createAssembly() {
  const root = assembly('2.9-intake-fuel-and-ignition');
  const p = materials();
  const inlet = part(
    root,
    'left-inlet',
    'Left side inlet',
    [0.84, 0.67, -0.56],
    [0.42, 0, 0.18],
    'The left rear-side opening supplies engine induction air. The opposite side opening has a different engine-bay ventilation job. The internal duct is simplified.',
  );
  box(inlet, [0.025, 0.16, 0.25], p.black);
  for (let i = 0; i < 4; i++) box(inlet, [0.04, 0.018, 0.23], p.metal, [0.018, -0.055 + i * 0.037, 0]);
  tube(
    inlet,
    [
      [-0.02, 0, 0],
      [-0.12, -0.025, -0.1],
      [-0.22, -0.025, -0.26],
    ],
    0.055,
    p.dark,
  );

  const cleaner = part(
    root,
    'air-cleaner',
    'Air cleaner',
    [0.59, 0.64, -0.93],
    [0.45, 0.23, -0.26],
    'The factory drawing shows a cylindrical pleated element inside the side airbox, with a separate cover and retaining plate. The cutaway exposes that element before the MAF; the housing is simplified, not drawn in a service position.',
  );
  box(cleaner, [0.29, 0.06, 0.43], p.black, [0, -0.085, 0]);
  for (const x of [-0.135, 0.135]) box(cleaner, [0.018, 0.13, 0.43], p.dark, [x, -0.025, 0]);
  box(cleaner, [0.29, 0.13, 0.025], p.dark, [0, -0.025, -0.2]);
  // PET 106-000 item 8 is cylindrical, rather than a flat panel filter.
  annulus(cleaner, 0.069, 0.044, 0.31, p.tan).rotation.set(0, 0, 0);
  for (let i = 0; i < 40; i++) {
    const angle = (i * Math.PI * 2) / 40;
    box(cleaner, [0.011, 0.004, 0.3], p.tan, [Math.cos(angle) * 0.07, Math.sin(angle) * 0.07, 0], [0, 0, angle]);
  }
  for (const z of [-0.16, 0.16]) annulus(cleaner, 0.077, 0.044, 0.014, p.dark, [0, 0, z]).rotation.set(0, 0, 0);
  tube(
    cleaner,
    [
      [-0.1, 0.015, 0.15],
      [-0.18, -0.02, 0.18],
      [-0.22, 0.02, 0.18],
    ],
    0.055,
    p.black,
  );

  const maf = part(
    root,
    'maf',
    'Air-mass sensor',
    [0.34, 0.66, -0.75],
    [0.27, 0.45, 0.12],
    'A hot-film sensor measures incoming air mass and sends an electrical signal to the DME. Its measuring tube connects to the airbox through a seal and to the throttle through a flexible air guide with clamps.',
  );
  annulus(maf, 0.074, 0.056, 0.16, p.dark);
  tube(
    maf,
    [
      [-0.08, 0, 0],
      [-0.145, 0, 0],
      [-0.205, 0, 0],
    ],
    0.056,
    p.black,
  );
  for (const x of [-0.09, -0.195]) annulus(maf, 0.062, 0.056, 0.012, p.metal, [x, 0, 0]);
  for (let i = 0; i < 5; i++) annulus(maf, 0.061, 0.055, 0.007, p.dark, [-0.11 - i * 0.016, 0, 0]);
  box(maf, [0.05, 0.045, 0.06], p.black, [0, 0.081, 0]);
  box(maf, [0.012, 0.085, 0.012], p.metal, [0, 0.015, 0]);
  box(maf, [0.035, 0.025, 0.035], p.blue, [0.01, 0.105, 0]);

  const throttle = part(
    root,
    'throttle',
    'Electronic throttle',
    [0.09, 0.66, -0.75],
    [-0.12, 0.51, 0.3],
    'An electric actuator turns the butterfly, changing the restriction to incoming air. Throttle position is controlled and monitored; it is not a mechanical extension of the accelerator pedal.',
  );
  annulus(throttle, 0.083, 0.063, 0.09, p.metal);
  cylinder(throttle, 0.061, 0.007, p.warm, [0, 0, 0], [0, 0.55, Math.PI / 2]);
  beam(throttle, [0, -0.077, 0], [0, 0.077, 0], 0.006, p.metal);
  box(throttle, [0.065, 0.07, 0.085], p.black, [0, 0.098, 0.018]);
  box(throttle, [0.035, 0.025, 0.035], p.blue, [0, 0.14, 0.018]);

  const plenums = part(
    root,
    'plenum-runners',
    'Plenums + runners',
    [0, 0.67, -0.85],
    [-0.08, 0.39, -0.12],
    'Three runners serve each cylinder bank. Rubber sleeves and clamps join the bank distributors to the centre tube. Two vacuum units, controlled through change-over valves, operate the tuning flaps. Their positions, hose paths and flap angles are illustrative.',
  );
  for (const side of [-1, 1]) {
    sphere(plenums, 0.135, p.dark, [side * 0.27, 0.035, 0], [0.86, 0.65, 1.95]);
    for (const z of [-0.2, 0, 0.2]) {
      tube(
        plenums,
        [
          [side * 0.29, 0.03, z],
          [side * 0.39, 0.015, z],
          [side * 0.47, -0.12, z],
        ],
        0.043,
        p.dark,
      );
      cylinder(plenums, 0.055, 0.014, p.metal, [side * 0.47, -0.13, z], [0, 0, 0]);
    }
  }
  tube(
    plenums,
    [
      [-0.26, 0.04, 0.1],
      [0, 0.055, 0.1],
      [0.26, 0.04, 0.1],
    ],
    0.057,
    p.dark,
  );
  tube(
    plenums,
    [
      [-0.26, 0.04, -0.13],
      [0, 0.065, -0.13],
      [0.26, 0.04, -0.13],
    ],
    0.044,
    p.dark,
  );
  for (const side of [-1, 1]) {
    annulus(plenums, 0.077, 0.058, 0.06, p.black, [side * 0.19, 0.04, 0.1]);
    for (const x of [0.165, 0.215]) annulus(plenums, 0.081, 0.077, 0.011, p.metal, [side * x, 0.04, 0.1]);
  }
  sphere(plenums, 0.12, p.black, [0, 0.095, -0.025], [0.95, 0.45, 1.7]);
  for (const z of [-0.13, 0.1]) {
    cylinder(plenums, 0.036, 0.006, p.warm, [0.04, 0.05, z]);
    cylinder(plenums, 0.037, 0.025, p.metal, [0.07, 0.09, z - 0.045], [Math.PI / 2, 0, 0]);
    beam(plenums, [0.07, 0.09, z - 0.03], [0.04, 0.05, z], 0.004, p.metal);
    box(plenums, [0.025, 0.035, 0.032], p.black, [0.13, 0.09, z - 0.04]);
    tube(
      plenums,
      [
        [0.13, 0.09, z - 0.04],
        [0.105, 0.13, z - 0.07],
        [0.07, 0.1, z - 0.065],
      ],
      0.005,
      p.black,
    );
  }

  const injectors = part(
    root,
    'ports-injectors',
    'Ports + injectors',
    [0, 0.56, -0.85],
    [-0.35, 0.11, -0.2],
    'One connected fuel collection-pipe assembly supplies all six EV14 port injectors. Each injector has a retaining clip and seals at its fuel-pipe and inlet-port ends. The pipes and feed stub are schematic; the 2.9 has no engine-driven DFI high-pressure pump.',
  );
  tube(
    injectors,
    [
      [-0.47, 0.08, -0.26],
      [-0.3, 0.14, -0.3],
      [0.3, 0.14, -0.3],
      [0.47, 0.08, -0.26],
    ],
    0.013,
    p.warm,
  );
  tube(
    injectors,
    [
      [0.47, 0.08, 0.26],
      [0.52, 0.08, 0.31],
      [0.52, -0.06, 0.38],
    ],
    0.012,
    p.warm,
  );
  for (const side of [-1, 1]) {
    beam(injectors, [side * 0.47, 0.08, -0.26], [side * 0.47, 0.08, 0.26], 0.019, p.warm);
    for (const z of [-0.2, 0, 0.2]) {
      cylinder(injectors, 0.048, 0.023, p.metal, [side * 0.47, -0.02, z], [0, 0, 0]);
      cylinder(injectors, 0.018, 0.085, p.warm, [side * 0.47, 0.025, z], [0, 0, 0]);
      for (const y of [-0.008, 0.061])
        annulus(injectors, 0.022, 0.017, 0.008, p.black, [side * 0.47, y, z]).rotation.set(Math.PI / 2, 0, 0);
      box(injectors, [0.045, 0.008, 0.033], p.metal, [side * 0.47, 0.072, z]);
      box(injectors, [0.031, 0.03, 0.033], p.blue, [side * 0.495, 0.034, z]);
    }
  }

  const ignition = part(
    root,
    'coils-plugs',
    'Coils + plugs',
    [0, 0.47, -0.85],
    [-0.43, -0.18, 0.12],
    'Each cylinder has its own coil directly at its spark plug. The plug acts in the combustion chamber after the inlet charge has entered; it is not an injector or part of the air passage.',
  );
  for (const side of [-1, 1]) {
    for (const z of [-0.2, 0, 0.2]) {
      cylinder(ignition, 0.025, 0.12, p.black, [side * 0.57, 0, z]);
      cylinder(ignition, 0.013, 0.065, p.metal, [side * 0.48, 0, z]);
      cylinder(ignition, 0.018, 0.035, p.tan, [side * 0.51, 0, z]);
      box(ignition, [0.032, 0.043, 0.043], p.blue, [side * 0.635, 0.007, z]);
    }
  }

  const controller = part(
    root,
    'dme',
    'DME controller',
    [0.49, 0.67, -1.55],
    [0.22, 0.27, -0.33],
    'Bosch ME 7.8.2 combines sensor information with driver and system requests. It commands throttle, injection and ignition. The rear-left electronics region is shown approximately; no connector pinout or bracket position is specified.',
  );
  box(controller, [0.27, 0.16, 0.045], p.metal);
  for (let i = 0; i < 9; i++) box(controller, [0.012, 0.135, 0.014], p.dark, [-0.108 + i * 0.027, 0, 0.028]);
  for (const x of [-0.07, 0.07]) box(controller, [0.075, 0.04, 0.04], p.black, [x, -0.09, 0]);
  return root;
}
