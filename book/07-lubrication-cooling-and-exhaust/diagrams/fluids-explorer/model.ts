import * as THREE from 'three';
import {
  annulus,
  assembly,
  box,
  cylinder,
  group,
  materials,
  mesh,
  part,
  tube,
} from '../../../../interactive/three/component-geometry.ts';
import type { ExplorerConfig } from '../../../../interactive/types';

export const config: ExplorerConfig = {
  id: 'fluids-explorer',
  title: 'From the car to its heat paths',
  location:
    'The 2010 2.9 places the engine behind the seats, its principal coolant radiators at the front, and its exhaust treatment and silencers around the rear power unit.',
  overview:
    'The long coolant circuit moves heat forwards. Oil circulates within the engine and exchanges heat with coolant across a metal wall. Exhaust gas follows its own rearward route.',
  assembled:
    'The oil pan and oil-to-coolant exchanger belong to the engine assembly. The coolant pump serves the engine and front radiators; the expansion tank is a side branch, not the series return path.',
  exploded:
    'The separated groups reveal three distinct systems: oil supply and collection, coolant circulation, and exhaust treatment. Connections are functional; the offsets do not describe a removal sequence.',
  focus: 'engine-jackets',
  hideCarParts: ['engine', 'exhaust-outlets'],
  direction: [1.2, 1.2, 1.5],
  note: 'Factory plates guide assembly identities and attachments; sizes, routing, pump internals and all offsets remain illustrative. Front pair shown; centre radiator, PDK cooler, heater branch and sports-exhaust actuators omitted.',
  connections: [
    {
      from: 'engine-jackets',
      to: 'oil-system',
      label: 'Oil supplies working surfaces and returns from the heads to the integrated reservoir',
      kind: 'fluid',
    },
    {
      from: 'engine-jackets',
      to: 'oil-system',
      label: 'A separate oil-pump chain drives the five-section common shaft',
      kind: 'mechanical',
    },
    {
      from: 'oil-system',
      to: 'heat-exchanger',
      label: 'Engine-oil circuit exchanges heat through separate metal-walled passages',
      kind: 'fluid',
    },
    {
      from: 'heat-exchanger',
      to: 'engine-jackets',
      label: 'Coolant carries heat; it does not mix with the oil',
      kind: 'fluid',
    },
    {
      from: 'coolant-pump',
      to: 'engine-jackets',
      label: 'Pump creates circulation through the engine coolant jackets',
      kind: 'fluid',
    },
    {
      from: 'engine-jackets',
      to: 'coolant-pump',
      label: 'Accessory-belt drive turns the coolant pump',
      kind: 'mechanical',
    },
    {
      from: 'coolant-pump',
      to: 'coolant-pipes',
      label: 'Thermostat regulates access to the long radiator circuit',
      kind: 'fluid',
    },
    {
      from: 'coolant-pipes',
      to: 'front-radiators',
      label: 'Supply and return paths join the rear engine to the front heat exchangers',
      kind: 'fluid',
    },
    {
      from: 'expansion-tank',
      to: 'engine-jackets',
      label: 'Expansion, venting and filling branch; not a series radiator return',
      kind: 'fluid',
    },
    {
      from: 'engine-jackets',
      to: 'exhaust-system',
      label: 'Combustion gas leaves each bank through its manifold and converter assembly',
      kind: 'air',
    },
  ],
};

const zAxis = [Math.PI / 2, 0, 0];

export function createAssembly() {
  const root = assembly('engine-heat-management');
  const m = materials();
  const engine = part(
    root,
    'engine-jackets',
    'Engine coolant jackets',
    [0, 0.52, -0.82],
    [0, 0.32, 0],
    'Coolant absorbs heat from the cylinders and heads behind the cabin. Blue bands locate jacket regions; they do not reproduce internal cast passages.',
  );
  box(engine, [0.48, 0.26, 0.68], m.metal);
  for (const side of [-1, 1]) {
    box(engine, [0.2, 0.24, 0.66], m.blue, [side * 0.43, 0, 0]);
    box(engine, [0.025, 0.2, 0.7], m.metal, [side * 0.545, 0, 0]);
    for (let i = 0; i < 3; i++) {
      cylinder(engine, 0.083, 0.23, m.metal, [side * 0.28, 0, -0.21 + i * 0.21]);
      box(engine, [0.17, 0.024, 0.08], m.blue, [side * 0.42, 0.135, -0.21 + i * 0.21]);
    }
  }

  const oil = part(
    root,
    'oil-system',
    'Oil reservoir and pumps',
    [0, 0.285, -0.82],
    [0, -0.25, -0.1],
    'The integrated reservoir sits below the engine. Four scavenge sections and one pressure section share a shaft driven by a separate oil-pump chain. The open pan exposes a schematic shaft, suction pickup, control valve and level sender; it does not reproduce pump internals.',
  );
  box(oil, [0.59, 0.025, 0.58], m.metal, [0, -0.075, 0]);
  for (const side of [-1, 1]) box(oil, [0.025, 0.13, 0.58], m.metal, [side * 0.285, -0.015, 0]);
  box(oil, [0.59, 0.13, 0.025], m.metal, [0, -0.015, -0.278]);
  box(oil, [0.5, 0.017, 0.45], m.warm, [0, -0.052, 0]);
  // The separate pump drive is longitudinal like the crankshaft, not a cam chain.
  cylinder(oil, 0.009, 0.48, m.dark, [0, 0.025, 0], zAxis);
  for (let i = 0; i < 5; i++) {
    const section = annulus(oil, 0.042, 0.013, 0.045, i === 4 ? m.green : m.warm, [0, 0.025, -0.18 + i * 0.09]);
    section.rotation.set(0, 0, 0);
  }
  for (const [y, radius] of [
    [0.025, 0.045],
    [0.235, 0.055],
  ]) {
    const sprocket = annulus(oil, radius, 0.012, 0.018, m.dark, [0, y, 0.27]);
    sprocket.rotation.set(0, 0, 0);
  }
  tube(
    oil,
    [
      [-0.045, 0.025, 0.27],
      [-0.055, 0.235, 0.27],
      [0, 0.29, 0.27],
      [0.055, 0.235, 0.27],
      [0.045, 0.025, 0.27],
      [0, -0.02, 0.27],
      [-0.045, 0.025, 0.27],
    ],
    0.006,
    m.dark,
  );
  tube(
    oil,
    [
      [0, 0.025, -0.21],
      [0.1, -0.005, -0.21],
      [0.16, -0.035, -0.13],
    ],
    0.018,
    m.metal,
  );
  cylinder(oil, 0.036, 0.018, m.dark, [0.16, -0.047, -0.13], [0, 0, 0]);
  cylinder(oil, 0.022, 0.11, m.green, [0.285, 0.025, 0.1]);
  box(oil, [0.045, 0.032, 0.035], m.black, [0.355, 0.025, 0.1]);
  cylinder(oil, 0.012, 0.12, m.dark, [-0.21, 0.015, -0.13], [0, 0, 0]);
  box(oil, [0.055, 0.025, 0.045], m.black, [-0.21, -0.065, -0.13]);
  for (const side of [-1, 1])
    for (const z of [-0.17, 0.17]) {
      tube(
        oil,
        [
          [side * 0.43, 0.23, z],
          [side * 0.33, 0.13, z],
          [side * 0.18, 0.04, z * 0.2],
        ],
        0.012,
        m.warm,
      );
    }

  const exchanger = part(
    root,
    'heat-exchanger',
    'Oil–coolant exchanger',
    [0.13, 0.69, -0.73],
    [0.15, 0.63, 0],
    'The exchanger mounts on the oil-conducting housing, with a filter cup and insert underneath the adjoining part of that housing and a separate pressure sender. Heat crosses metal without mixing liquids. The exposed plate count and passages are illustrative.',
  );
  box(exchanger, [0.4, 0.045, 0.23], m.dark, [-0.055, -0.035, 0]);
  for (let i = 0; i < 6; i++) box(exchanger, [0.25, 0.012, 0.19], m.metal, [0, i * 0.018, 0]);
  cylinder(exchanger, 0.044, 0.1, m.tan, [-0.2, -0.12, 0], [0, 0, 0]);
  // An open side of the cup keeps its replaceable filter insert visible.
  mesh(
    exchanger,
    new THREE.CylinderGeometry(0.055, 0.055, 0.16, 32, 1, true, 0, Math.PI * 1.4),
    m.black,
    [-0.2, -0.135, 0],
  );
  cylinder(exchanger, 0.017, 0.05, m.green, [-0.22, -0.025, 0.13], zAxis);
  cylinder(exchanger, 0.024, 0.08, m.blue, [0.1, 0.025, 0.13], zAxis);
  cylinder(exchanger, 0.021, 0.07, m.warm, [-0.06, -0.025, -0.13], zAxis);
  tube(
    exchanger,
    [
      [-0.1, -0.015, -0.1],
      [-0.4, 0.01, -0.4],
      [-0.55, 0.08, -0.89],
    ],
    0.018,
    m.black,
  );

  const pump = part(
    root,
    'coolant-pump',
    'Pump and thermostat',
    [0.37, 0.49, -0.44],
    [0.44, 0.05, 0.36],
    'The pulley drives a separate coolant pump. A distinct thermostat insert sits in its own neighbouring housing, connected by water guides and pipes. The exposed impeller and spring explain those different jobs; vane count, spring form and routing are schematic.',
  );
  cylinder(pump, 0.09, 0.1, m.metal, [0, 0, 0], zAxis);
  cylinder(pump, 0.065, 0.018, m.dark, [0, 0, 0.065], zAxis);
  for (const z of [0.058, 0.064, 0.07]) cylinder(pump, 0.067, 0.003, m.black, [0, 0, z], zAxis);
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    box(
      pump,
      [0.075, 0.018, 0.012],
      m.metal,
      [Math.cos(angle) * 0.035, Math.sin(angle) * 0.035, -0.055],
      [0, 0, angle + 0.5],
    );
  }
  cylinder(pump, 0.062, 0.08, m.metal, [-0.16, -0.035, -0.015], zAxis);
  cylinder(pump, 0.045, 0.012, m.warm, [-0.16, -0.035, 0.035], zAxis);
  for (let i = 0; i < 4; i++) {
    const spring = annulus(pump, 0.021, 0.016, 0.003, m.dark, [-0.16, -0.035, -0.045 + i * 0.014]);
    spring.rotation.set(0, 0, 0);
  }
  tube(
    pump,
    [
      [-0.035, -0.04, -0.04],
      [-0.1, -0.065, -0.04],
      [-0.16, -0.035, -0.015],
    ],
    0.026,
    m.blue,
  );
  cylinder(pump, 0.028, 0.09, m.blue, [-0.19, -0.035, 0.05], zAxis);

  const radiators = part(
    root,
    'front-radiators',
    'Front radiators and fans',
    [0, 0.36, 1.63],
    [0, 0.25, 0.5],
    'Each front module combines a coolant radiator, rear fan and fan shroud with separate air guides. Supply and return hoses join the coolant pipes. The A/C condenser is a separate neighbouring circuit, omitted here, as is the conditional centre radiator.',
  );
  for (const side of [-1, 1]) {
    const module = group('radiator-module', radiators, [side * 0.55, 0, 0]);
    module.rotation.y = side * -0.22;
    box(module, [0.37, 0.3, 0.065], m.dark);
    box(module, [0.33, 0.25, 0.072], m.metal);
    for (let i = 0; i < 15; i++) box(module, [0.007, 0.245, 0.008], m.dark, [-0.15 + i * 0.0214, 0, 0.041]);
    const shroud = new THREE.Shape();
    shroud.moveTo(-0.18, -0.145);
    shroud.lineTo(0.18, -0.145);
    shroud.lineTo(0.18, 0.145);
    shroud.lineTo(-0.18, 0.145);
    shroud.closePath();
    const fanOpening = new THREE.Path();
    fanOpening.absarc(0, 0, 0.123, 0, Math.PI * 2, true);
    shroud.holes.push(fanOpening);
    mesh(module, new THREE.ExtrudeGeometry(shroud, { depth: 0.015, bevelEnabled: false }), m.dark, [0, 0, -0.075]);
    cylinder(module, 0.028, 0.038, m.black, [0, 0, -0.085], zAxis);
    for (const side of [-1, 1]) box(module, [0.018, 0.29, 0.11], m.black, [side * 0.18, 0, 0.09]);
    for (const side of [-1, 1]) box(module, [0.36, 0.018, 0.11], m.black, [0, side * 0.14, 0.09]);
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      box(
        module,
        [0.11, 0.035, 0.014],
        m.dark,
        [Math.cos(angle) * 0.061, Math.sin(angle) * 0.061, -0.084],
        [0, 0, angle + 0.4],
      );
    }
    cylinder(module, 0.026, 0.09, m.blue, [side * -0.18, -0.09, -0.02]);
    cylinder(module, 0.026, 0.09, m.blue, [side * -0.18, 0.09, -0.02]);
  }

  const pipes = part(
    root,
    'coolant-pipes',
    'Long coolant connections',
    [0, 0.235, 0.36],
    [0, -0.18, 0.05],
    'Separate supply and return distributor tubes connect the front pair in parallel to the long tunnel pipes. Flexible couplings, retaining clips and pipe brackets join and support them. Manual and PDK pipe listings differ; the shown routes and side assignments are illustrative.',
  );
  for (const side of [-1, 1]) {
    const height = side > 0 ? 0.18 : 0.02;
    tube(
      pipes,
      [
        [side * 0.34, 0.18, -1.03],
        [side * 0.3, 0, -0.78],
        [side * 0.3, 0, 0.72],
        [side * 0.3, height, 1.09],
        [side * 0.15, height, 1.2],
      ],
      0.025,
      m.blue,
    );
    // Separate conceptual supply/return headers reach both front modules.
    tube(
      pipes,
      [
        [-0.55, height, 1.23],
        [-0.38, height, 1.2],
        [0, height, 1.2],
        [0.38, height, 1.2],
        [0.55, height, 1.23],
      ],
      0.022,
      m.blue,
    );
    for (const z of [-0.7, 0.75]) cylinder(pipes, 0.03, 0.1, m.black, [side * 0.3, 0, z], zAxis);
  }

  const tank = part(
    root,
    'expansion-tank',
    'Tank and service caps',
    [-0.43, 0.63, -1.42],
    [-0.4, 0.38, -0.12],
    'The moulded expansion tank has a bleed valve, level switch and several hose connections. A separate rear service cup carries distinct oil and coolant filler caps; a hose links its coolant neck to the tank. Vent lines and the expansion branch do not carry all radiator return flow. Shapes and hose endpoints are schematic.',
  );
  for (const x of [-0.065, 0, 0.065]) cylinder(tank, 0.052, 0.18, m.metal, [x, -0.015, 0], [0, 0, 0]);
  box(tank, [0.22, 0.04, 0.12], m.metal, [0, 0.09, 0]);
  cylinder(tank, 0.036, 0.035, m.blue, [0.025, 0.125, 0.01], [0, 0, 0]);
  cylinder(tank, 0.029, 0.025, m.dark, [-0.065, 0.125, 0.01], [0, 0, 0]);
  cylinder(tank, 0.009, 0.13, m.dark, [-0.055, -0.035, 0], [0, 0, 0]);
  box(tank, [0.035, 0.025, 0.035], m.black, [-0.055, -0.115, 0]);
  tube(
    tank,
    [
      [0.11, 0.07, -0.015],
      [0.17, 0.1, -0.1],
      [0.1, 0.16, -0.2],
    ],
    0.023,
    m.blue,
  );
  box(tank, [0.21, 0.02, 0.12], m.dark, [0.055, 0.15, -0.2]);
  cylinder(tank, 0.033, 0.035, m.black, [0.01, 0.178, -0.2], [0, 0, 0]);
  cylinder(tank, 0.035, 0.035, m.blue, [0.1, 0.178, -0.2], [0, 0, 0]);
  tube(
    tank,
    [
      [0.06, -0.06, 0.045],
      [0.15, -0.14, 0.12],
      [0.29, -0.24, 0.27],
    ],
    0.014,
    m.blue,
  );
  tube(
    tank,
    [
      [-0.1, 0.07, 0.025],
      [-0.15, 0.04, 0.12],
      [-0.08, -0.12, 0.25],
    ],
    0.008,
    m.blue,
  );

  const exhaust = part(
    root,
    'exhaust-system',
    'Converters and silencers',
    [0, 0.24, -1.22],
    [0, -0.04, -0.58],
    'Each bank has a manifold-integrated converter with two bricks, two oxygen-sensor positions and a rear silencer. Flanged joints, catalyst heat shields and a rear retainer locate the installed assemblies. Connecting pipes lead to the 2.9’s single outlet; the open shells are teaching cutaways, not factory sections.',
  );
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++)
      tube(
        exhaust,
        [
          [side * 0.45, 0.17, 0.19 + i * 0.21],
          [side * 0.57, 0.04, 0.14 + i * 0.13],
          [side * 0.62, 0, 0.1],
        ],
        0.022,
        m.warm,
      );
    // One open shell encloses two bricks on each bank, not two converter units.
    mesh(
      exhaust,
      new THREE.CylinderGeometry(0.077, 0.077, 0.3, 32, 1, true, 0, Math.PI),
      m.metal,
      [side * 0.62, 0, -0.05],
      zAxis,
    );
    for (const z of [0.025, -0.115]) cylinder(exhaust, 0.061, 0.085, m.warm, [side * 0.62, 0, z], zAxis);
    for (const z of [0.125, -0.045]) cylinder(exhaust, 0.012, 0.07, m.dark, [side * 0.62, 0.06, z], [0, 0, 0]);
    tube(
      exhaust,
      [
        [side * 0.62, 0, -0.2],
        [side * 0.66, 0, -0.3],
        [side * 0.52, 0.01, -0.4],
      ],
      0.026,
      m.metal,
    );
    box(exhaust, [0.16, 0.014, 0.27], m.metal, [side * 0.62, 0.1, -0.035]);
    cylinder(exhaust, 0.04, 0.014, m.dark, [side * 0.62, 0, -0.21], zAxis);
    const silencer = cylinder(exhaust, 0.14, 0.36, m.metal, [side * 0.43, 0.015, -0.44]);
    silencer.scale.y = 0.65;
    tube(
      exhaust,
      [
        [side * 0.3, 0.015, -0.45],
        [side * 0.16, -0.015, -0.56],
        [0, -0.015, -0.63],
      ],
      0.027,
      m.metal,
    );
  }
  tube(
    exhaust,
    [
      [-0.47, 0.015, -0.33],
      [0, 0.015, -0.27],
      [0.47, 0.015, -0.33],
    ],
    0.022,
    m.metal,
  );
  box(exhaust, [0.85, 0.035, 0.055], m.dark, [0, 0.17, -0.44]);
  for (const side of [-1, 1]) {
    const strap = annulus(exhaust, 0.147, 0.139, 0.025, m.dark, [side * 0.43, 0.015, -0.44]);
    strap.scale.y = 0.65;
    tube(
      exhaust,
      [
        [side * 0.43, 0.13, -0.44],
        [side * 0.39, 0.17, -0.44],
      ],
      0.012,
      m.dark,
    );
  }
  // Rounded trapezoidal contour follows the standard 2.9 outlet in brochure p. 38.
  // Wall, depth and dimensions remain schematic.
  const outletShape = new THREE.Shape();
  outletShape.moveTo(-0.067, 0.04);
  outletShape.lineTo(0.067, 0.04);
  outletShape.quadraticCurveTo(0.08, 0.04, 0.083, 0.027);
  outletShape.lineTo(0.094, -0.027);
  outletShape.quadraticCurveTo(0.096, -0.04, 0.081, -0.04);
  outletShape.lineTo(-0.081, -0.04);
  outletShape.quadraticCurveTo(-0.096, -0.04, -0.094, -0.027);
  outletShape.lineTo(-0.083, 0.027);
  outletShape.quadraticCurveTo(-0.08, 0.04, -0.067, 0.04);
  const outletHole = new THREE.Path();
  outletHole.moveTo(-0.061, 0.028);
  outletHole.lineTo(0.061, 0.028);
  outletHole.quadraticCurveTo(0.069, 0.028, 0.071, 0.019);
  outletHole.lineTo(0.08, -0.02);
  outletHole.quadraticCurveTo(0.081, -0.028, 0.071, -0.028);
  outletHole.lineTo(-0.071, -0.028);
  outletHole.quadraticCurveTo(-0.081, -0.028, -0.08, -0.02);
  outletHole.lineTo(-0.071, 0.019);
  outletHole.quadraticCurveTo(-0.069, 0.028, -0.061, 0.028);
  outletShape.holes.push(outletHole);
  mesh(
    exhaust,
    new THREE.ExtrudeGeometry(outletShape, { depth: 0.11, bevelEnabled: false, curveSegments: 8 }),
    m.metal,
    [0, 0.048, -0.9294],
  ).name = 'standard-2-9-outlet';
  tube(
    exhaust,
    [
      [0, -0.015, -0.63],
      [0, 0.048, -0.82],
      [0, 0.048, -0.87],
    ],
    0.027,
    m.metal,
  );
  return root;
}
