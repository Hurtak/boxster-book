import {
  assembly, part, materials, box, cylinder, tube, annulus, beam, sphere,
} from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'intake-explorer',
  title: 'From the car to the intake',
  location: 'On the 2010 2.9, combustion air enters through the left side opening and reaches the engine behind the seats. The two banks receive air through the intake above them.',
  overview: 'Follow air from the side opening through filtration, measurement and the throttle. The controller separately commands the port injectors and individual ignition coils.',
  assembled: 'Three intake runners serve each bank. The six injectors add petrol at the inlet ports; the coils and plugs ignite the charge inside the cylinders. Air passages and electrical control links perform different jobs.',
  exploded: 'The intake, fuel-metering and ignition parts separate for inspection. The offsets expose their relationships; they do not show operating travel or a removal sequence.',
  focus: 'plenum-runners',
  hideCarParts: ['engine'],
  direction: [1.3, 1.1, 1.6],
  note: 'The 2.9 port-injection system is shown. Duct shapes, runner paths, controller position and separation distances are schematic. Fuel supply, exhaust feedback and other engine sensors are omitted; no S-model high-pressure injection hardware is fitted here.',
  connections: [
    { from: 'left-inlet', to: 'air-cleaner', label: 'Outside air reaches the filter', kind: 'air' },
    { from: 'air-cleaner', to: 'maf', label: 'Filtered air reaches the measuring tube', kind: 'air' },
    { from: 'maf', to: 'throttle', label: 'Metered air reaches the throttle', kind: 'air' },
    { from: 'throttle', to: 'plenum-runners', label: 'The butterfly controls the intake restriction', kind: 'air' },
    { from: 'plenum-runners', to: 'ports-injectors', label: 'Six runners supply the cylinders’ inlet ports', kind: 'air' },
    { from: 'maf', to: 'dme', label: 'Air-mass information goes to the DME', kind: 'signal' },
    { from: 'dme', to: 'throttle', label: 'Throttle commands coordinate the air charge', kind: 'signal' },
    { from: 'dme', to: 'ports-injectors', label: 'Electrical commands meter port-injected fuel', kind: 'signal' },
    { from: 'dme', to: 'coils-plugs', label: 'Individual coil commands set spark timing', kind: 'signal' },
  ],
};

export function createAssembly() {
  const root = assembly('2.9-intake-fuel-and-ignition');
  const p = materials();
  const inlet = part(root, 'left-inlet', 'Left side inlet', [0.84, 0.67, -0.56], [0.42, 0, 0.18],
    'The left rear-side opening supplies engine induction air. The opposite side opening has a different engine-bay ventilation job. The internal duct is simplified.');
  box(inlet, [0.025, 0.16, 0.25], p.black);
  for (let i = 0; i < 4; i++) box(inlet, [0.04, 0.018, 0.23], p.metal, [0.018, -0.055 + i * 0.037, 0]);
  tube(inlet, [[-0.02, 0, 0], [-0.12, -0.025, -0.1], [-0.22, -0.025, -0.26]], 0.055, p.dark);

  const cleaner = part(root, 'air-cleaner', 'Air cleaner', [0.59, 0.64, -0.93], [0.45, 0.23, -0.26],
    'The replaceable element removes particles before the air reaches the MAF and throttle. A cutaway lid makes its pleated element visible; this is not a service-position drawing.');
  box(cleaner, [0.29, 0.15, 0.43], p.black, [0, -0.025, 0]);
  box(cleaner, [0.25, 0.015, 0.38], p.tan, [0, 0.06, 0]);
  for (let i = 0; i < 16; i++) box(cleaner, [0.22, 0.035, 0.009], p.tan, [0, 0.079, -0.17 + i * 0.022]);
  for (const x of [-0.135, 0.135]) box(cleaner, [0.018, 0.04, 0.43], p.dark, [x, 0.065, 0]);
  box(cleaner, [0.29, 0.03, 0.1], p.dark, [0, 0.08, -0.16]);
  tube(cleaner, [[-0.1, 0.015, 0.15], [-0.18, 0.07, 0.18], [-0.22, 0.11, 0.18]], 0.055, p.black);

  const maf = part(root, 'maf', 'Air-mass sensor', [0.34, 0.75, -0.75], [0.27, 0.45, 0.12],
    'A hot-film sensor measures incoming air mass and sends an electrical signal to the DME. The airflow tube and sensing insert are shown separately from the downstream throttle.');
  annulus(maf, 0.074, 0.056, 0.16, p.dark);
  box(maf, [0.05, 0.045, 0.06], p.black, [0, 0.081, 0]);
  box(maf, [0.012, 0.085, 0.012], p.metal, [0, 0.015, 0]);
  box(maf, [0.035, 0.025, 0.035], p.blue, [0.01, 0.105, 0]);

  const throttle = part(root, 'throttle', 'Electronic throttle', [0.09, 0.75, -0.75], [-0.12, 0.51, 0.3],
    'An electric actuator turns the butterfly, changing the restriction to incoming air. Throttle position is controlled and monitored; it is not a mechanical extension of the accelerator pedal.');
  annulus(throttle, 0.083, 0.063, 0.09, p.metal);
  cylinder(throttle, 0.061, 0.007, p.warm, [0, 0, 0], [0, 0.55, Math.PI / 2]);
  beam(throttle, [0, -0.077, 0], [0, 0.077, 0], 0.006, p.metal);
  box(throttle, [0.065, 0.07, 0.085], p.black, [0, 0.098, 0.018]);
  box(throttle, [0.035, 0.025, 0.035], p.blue, [0, 0.14, 0.018]);

  const plenums = part(root, 'plenum-runners', 'Plenums + runners', [0, 0.76, -0.85], [-0.08, 0.39, -0.12],
    'The intake has branches for both cylinder banks and three runners per bank. Connecting passages and switchable flaps tune the air columns. Their shapes and relative lengths here are illustrative.');
  for (const side of [-1, 1]) {
    sphere(plenums, 0.135, p.dark, [side * 0.27, 0.035, 0], [0.86, 0.65, 1.95]);
    for (const z of [-0.2, 0, 0.2]) {
      tube(plenums, [[side * 0.29, 0.03, z], [side * 0.39, 0.015, z], [side * 0.47, -0.12, z]], 0.043, p.dark);
      cylinder(plenums, 0.055, 0.014, p.metal, [side * 0.47, -0.13, z], [0, 0, 0]);
    }
  }
  tube(plenums, [[-0.26, 0.04, 0.1], [0, 0.055, 0.1], [0.26, 0.04, 0.1]], 0.057, p.dark);
  tube(plenums, [[-0.26, 0.04, -0.13], [0, 0.065, -0.13], [0.26, 0.04, -0.13]], 0.044, p.dark);
  sphere(plenums, 0.12, p.black, [0, 0.095, -0.025], [0.95, 0.45, 1.7]);
  for (const z of [-0.13, 0.1]) cylinder(plenums, 0.036, 0.006, p.warm, [0.04, 0.05, z]);

  const injectors = part(root, 'ports-injectors', 'Ports + injectors', [0, 0.62, -0.85], [-0.35, 0.11, -0.2],
    'Six EV14 injectors meter fuel at the individual inlet ports, before the inlet valves. The two simplified fuel pipes distribute the supply; this 2.9 has no engine-driven DFI high-pressure pump.');
  for (const side of [-1, 1]) {
    beam(injectors, [side * 0.47, 0.08, -0.26], [side * 0.47, 0.08, 0.26], 0.019, p.warm);
    for (const z of [-0.2, 0, 0.2]) {
      cylinder(injectors, 0.048, 0.023, p.metal, [side * 0.47, -0.02, z], [0, 0, 0]);
      cylinder(injectors, 0.018, 0.085, p.warm, [side * 0.47, 0.025, z], [0, 0, 0]);
      box(injectors, [0.031, 0.03, 0.033], p.blue, [side * 0.495, 0.034, z]);
    }
  }

  const ignition = part(root, 'coils-plugs', 'Coils + plugs', [0, 0.47, -0.85], [-0.43, -0.18, 0.12],
    'Each cylinder has its own coil directly at its spark plug. The plug acts in the combustion chamber after the inlet charge has entered; it is not an injector or part of the air passage.');
  for (const side of [-1, 1]) {
    for (const z of [-0.2, 0, 0.2]) {
      cylinder(ignition, 0.025, 0.12, p.black, [side * 0.57, 0, z]);
      cylinder(ignition, 0.013, 0.065, p.metal, [side * 0.48, 0, z]);
      cylinder(ignition, 0.018, 0.035, p.tan, [side * 0.51, 0, z]);
      box(ignition, [0.032, 0.043, 0.043], p.blue, [side * 0.635, 0.007, z]);
    }
  }

  const controller = part(root, 'dme', 'DME controller', [0.49, 0.67, -1.55], [0.22, 0.27, -0.33],
    'Bosch ME 7.8.2 combines sensor information with driver and system requests. It commands throttle, injection and ignition. The rear-left electronics region is shown approximately; no connector pinout or bracket position is specified.');
  box(controller, [0.27, 0.16, 0.045], p.metal);
  for (let i = 0; i < 9; i++) box(controller, [0.012, 0.135, 0.014], p.dark, [-0.108 + i * 0.027, 0, 0.028]);
  for (const x of [-0.07, 0.07]) box(controller, [0.075, 0.04, 0.04], p.black, [x, -0.09, 0]);
  return root;
}
