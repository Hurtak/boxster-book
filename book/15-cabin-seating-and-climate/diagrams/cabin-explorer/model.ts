import * as THREE from 'three';
import {
  assembly,
  beam,
  box,
  cylinder,
  materials,
  part,
  tube,
} from '../../../../interactive/three/component-geometry.ts';
import type { ExplorerConfig } from '../../../../interactive/types';

import { seat } from '../../../../interactive/models/boxster/seats.ts';
import { palette } from '../../../../interactive/models/boxster/surfaces.ts';

export const config: ExplorerConfig = {
  id: 'cabin-explorer',
  title: 'From the car to the cabin',
  location:
    'The seats sit between the axles. Ahead of the occupants, the dashboard conceals the heater and air-conditioning unit; coolant pipes connect its heater to the rear engine.',
  overview:
    'Follow the seat into its runners and body supports. At the front, a blower moves air across the evaporator and through the heater or bypass before the ducts distribute it.',
  assembled:
    'The seat and air unit have separate jobs and share body support. The cutaway exposes the two heat exchangers: refrigerant cools the evaporator, while engine coolant warms the heater. Separate refrigerant connections and a receiver-drier sit outside the cabin-air passages.',
  exploded:
    'The support, upholstery, blower, exchangers, ducts and refrigerant connections separate to expose their relationships. These display offsets are not adjustment travel, airflow paths or a removal sequence.',
  focus: 'seat-frame',
  hideCarParts: ['driver-seat', 'chassis'],
  direction: [1.25, 0.85, 1.45],
  note: 'Standard seat adjustment: manual fore/aft and height, electric recline. PET 817-006/008 and 813-000/001/005/010/020/025 identify the assemblies. Seat shapes, air-unit sections, duct and pipe routes are simplified; no cooling performance or bracket coordinates are specified.',
  connections: [
    {
      from: 'body-supports',
      to: 'seat-frame',
      label: 'Seat runners attach to the lower body',
      kind: 'structure',
    },
    {
      from: 'seat-frame',
      to: 'seat-upholstery',
      label: 'Frame and cushion suspension support the occupant',
      kind: 'structure',
    },
    {
      from: 'body-supports',
      to: 'inlet-blower',
      label: 'The front cabin structure supports the air unit',
      kind: 'structure',
    },
    {
      from: 'inlet-blower',
      to: 'evaporator',
      label: 'Filtered inlet air is moved across the cooling surface',
      kind: 'air',
    },
    {
      from: 'evaporator',
      to: 'heater-bypass',
      label: 'Air continues towards heating or the bypass route',
      kind: 'air',
    },
    {
      from: 'heater-bypass',
      to: 'outlet-ducts',
      label: 'Blend and distribution send air to the selected outlets',
      kind: 'air',
    },
    {
      from: 'refrigerant-connections',
      to: 'evaporator',
      label: 'Liquid reaches the expansion valve; vapour returns separately towards the compressor',
      kind: 'fluid',
    },
    {
      from: 'body-supports',
      to: 'refrigerant-connections',
      label: 'Brackets retain the sealed refrigerant pipes and receiver-drier',
      kind: 'structure',
    },
    {
      from: 'heater-bypass',
      to: 'coolant-pipes',
      label: 'Supply and return carry coolant through the heater core',
      kind: 'fluid',
    },
    {
      from: 'body-supports',
      to: 'outlet-ducts',
      label: 'The dashboard region locates the outlet ducts',
      kind: 'structure',
    },
  ],
};

function exchanger(
  parent: THREE.Object3D<THREE.Object3DEventMap>,
  width: number,
  height: number,
  surface: THREE.Material<THREE.MaterialEventMap> | THREE.Material<THREE.MaterialEventMap>[],
) {
  for (const y of [-height / 2, height / 2]) box(parent, [width + 0.025, 0.025, 0.07], surface, [0, y, 0]);
  for (const x of [-width / 2, width / 2]) box(parent, [0.018, height, 0.07], surface, [x, 0, 0]);
  for (let i = 1; i < 17; i++)
    box(parent, [0.006, height - 0.025, 0.055], surface, [-width / 2 + (i * width) / 17, 0, 0]);
  for (const y of [-height * 0.28, 0, height * 0.28]) cylinder(parent, 0.008, width, surface, [0, y, 0.035]);
}

export function createAssembly() {
  const root = assembly('cabin-seating-climate');
  const m = materials();
  const supports = part(
    root,
    'body-supports',
    'Cabin body supports',
    [0, 0.265, 0.08],
    [0, -0.18, 0],
    'The floor supports the seat runners; the front cabin structure supports the dashboard and air unit. Their structural connection is not an air or coolant route.',
  );
  for (const side of [-1, 1]) {
    box(supports, [0.48, 0.022, 1.3], m.green, [side * 0.36, 0, 0]);
    box(supports, [0.055, 0.07, 1.3], m.green, [side * 0.65, 0.02, 0]);
  }
  for (const z of [-0.38, 0.18]) box(supports, [1.25, 0.055, 0.07], m.metal, [0, 0.035, z]);
  beam(supports, [-0.64, 0.44, 0.61], [0.64, 0.44, 0.61], 0.026, m.metal);
  for (const side of [-1, 1]) {
    beam(supports, [side * 0.59, 0.035, 0.55], [side * 0.59, 0.44, 0.61], 0.023, m.green);
    box(supports, [0.065, 0.08, 0.07], m.metal, [side * 0.23, 0.38, 0.61]);
  }

  const frame = part(
    root,
    'seat-frame',
    'Seat runners and frame',
    [0.345, 0.285, -0.115],
    [0.44, 0, -0.12],
    'Two runners lock the seat to its chosen fore/aft position. Pivoting height links carry the spring-supported base frame; the height lever is manual. A separate motor drives backrest recline. The backrest frame and spring grille support its padding and integrated head restraint. Link geometry is illustrative.',
  );
  for (const x of [-0.145, 0.145]) {
    box(frame, [0.035, 0.035, 0.5], m.metal, [x, 0, 0.01]);
    box(frame, [0.026, 0.027, 0.4], m.dark, [x, 0.031, 0.01]);
    for (const z of [-0.21, 0.22]) box(frame, [0.06, 0.015, 0.045], m.dark, [x, -0.022, z]);
    // Paired lifting links, not a crossed scissor mechanism.
    for (const z of [-0.16, 0.14]) {
      beam(frame, [x, 0.025, z], [x, 0.11, z + 0.035], 0.012, m.dark);
      cylinder(frame, 0.017, 0.025, m.metal, [x, 0.025, z]);
    }
    box(frame, [0.025, 0.025, 0.4], m.metal, [x, 0.11, 0.01]);
    beam(frame, [x, 0.12, -0.22], [x, 0.65, -0.34], 0.014, m.metal);
  }
  for (const z of [-0.16, 0.16]) beam(frame, [-0.17, 0.11, z], [0.17, 0.11, z], 0.014, m.dark);
  beam(frame, [-0.145, 0.65, -0.34], [0.145, 0.65, -0.34], 0.014, m.metal);
  for (let i = 0; i < 5; i++)
    beam(frame, [-0.13, 0.24 + i * 0.045, -0.25 - i * 0.01], [0.13, 0.24 + i * 0.045, -0.25 - i * 0.01], 0.003, m.dark);
  cylinder(frame, 0.021, 0.065, m.black, [-0.12, 0.16, -0.22], [0, 0, 0]);
  tube(
    frame,
    [
      [0.2, 0.12, -0.16],
      [0.13, 0.12, -0.21],
      [-0.1, 0.13, -0.22],
    ],
    0.0035,
    m.black,
  );
  for (let i = 0; i < 5; i++)
    tube(
      frame,
      [
        [-0.155, 0.12, -0.13 + i * 0.06],
        [-0.08, 0.105, -0.11 + i * 0.06],
        [0, 0.12, -0.13 + i * 0.06],
        [0.08, 0.105, -0.11 + i * 0.06],
        [0.155, 0.12, -0.13 + i * 0.06],
      ],
      0.0045,
      m.metal,
    );
  cylinder(frame, 0.035, 0.055, m.dark, [0.18, 0.13, -0.21]);
  beam(frame, [0.19, 0.06, -0.04], [0.23, 0.09, 0.12], 0.008, m.black);
  box(frame, [0.022, 0.017, 0.08], m.black, [0.23, 0.09, 0.14]);

  const upholstery = part(
    root,
    'seat-upholstery',
    'Cushion and backrest',
    [0, 0, 0],
    [0.36, 0.35, -0.1],
    'Shaped foam and upholstery spread support across the cushion and backrest. The head restraint is integrated into the backrest. The tan surfaces follow the shared car model; they do not identify an upholstery material or prove seat ventilation. The chapter explains standard trim choices.',
  );
  seat(upholstery, palette(), 1, { belt: false });

  const blower = part(
    root,
    'inlet-blower',
    'Inlet, filter and blower',
    [0, 0.6, 0.84],
    [-0.38, 0.22, 0.26],
    'Outside air enters near the windscreen base and passes through a filter. The electric blower supplies airflow; recirculation changes the inlet source. PET identifies the cowl filter housing and separate blower. The second inlet represents cabin recirculation; the inlet door, cage and motor position are illustrative.',
    [-0.155, -0.035, 0.062],
  );
  box(blower, [0.33, 0.03, 0.2], m.dark, [0.02, 0.13, 0.02]);
  for (let i = 0; i < 15; i++) box(blower, [0.015, 0.026, 0.18], m.tan, [-0.13 + i * 0.021, 0.15, 0.02]);
  box(blower, [0.19, 0.025, 0.25], m.black, [-0.1, 0.015, -0.04]);
  // Two inlet mouths meet at a schematic source-selection flap.
  box(blower, [0.15, 0.11, 0.015], m.dark, [0.16, 0.055, -0.09]);
  box(blower, [0.12, 0.07, 0.018], m.black, [0.16, 0.055, -0.103]);
  box(blower, [0.13, 0.013, 0.1], m.metal, [0.08, 0.045, -0.035], [0, 0, 0.5]);
  cylinder(blower, 0.092, 0.13, m.dark, [-0.22, -0.035, -0.03]);
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    box(
      blower,
      [0.13, 0.012, 0.025],
      m.metal,
      [-0.22, -0.035 + Math.cos(angle) * 0.09, -0.03 + Math.sin(angle) * 0.09],
      [angle, 0, 0],
    );
  }
  cylinder(blower, 0.04, 0.055, m.black, [-0.315, -0.035, -0.03]);
  tube(
    blower,
    [
      [-0.17, 0.025, -0.04],
      [-0.09, -0.005, -0.1],
      [0, -0.03, -0.15],
    ],
    0.044,
    m.blue,
  );

  const evap = part(
    root,
    'evaporator',
    'Evaporator and valve',
    [0, 0.57, 0.65],
    [0.42, 0.15, 0.18],
    'Refrigerant evaporates inside this exchanger, absorbing heat from the air. Condensation can remove moisture. The expansion valve meters refrigerant; condensed water has a separate drain.',
  );
  exchanger(evap, 0.32, 0.25, m.metal);
  box(evap, [0.065, 0.045, 0.045], m.warm, [0.16, 0.16, 0.01]);
  for (const [x, surface] of [
    [0.145, m.warm],
    [0.18, m.blue],
  ] as const)
    tube(
      evap,
      [
        [x, 0.16, 0.01],
        [x, 0.16, 0.08],
        [x + 0.07, 0.15, 0.12],
      ],
      0.007,
      surface,
    );
  tube(
    evap,
    [
      [0.02, -0.13, -0.01],
      [0.02, -0.2, 0],
      [0.04, -0.34, -0.015],
    ],
    0.009,
    m.black,
  );

  const heater = part(
    root,
    'heater-bypass',
    'Heater and bypass',
    [0, 0.57, 0.46],
    [-0.28, 0.2, -0.12],
    'Engine coolant supplies heat inside the heater core. A parallel bypass lets air avoid that core; a temperature-flap motor changes the heating contribution. Coolant remains separate from cabin air and refrigerant.',
  );
  const core = new THREE.Group();
  core.position.x = 0.08;
  heater.add(core);
  exchanger(core, 0.18, 0.22, m.warm);
  for (const x of [0.065, 0.11])
    tube(
      heater,
      [
        [x, 0.12, 0],
        [x, 0.2, 0.02],
        [x + 0.04, 0.2, 0.1],
      ],
      0.009,
      m.warm,
    );
  for (const x of [-0.235, -0.055]) box(heater, [0.015, 0.25, 0.06], m.dark, [x, 0, 0]);
  for (const y of [-0.125, 0.125]) box(heater, [0.195, 0.015, 0.06], m.dark, [-0.145, y, 0]);
  box(heater, [0.16, 0.22, 0.01], m.blue, [-0.145, 0, 0], [0, 0.55, 0]);
  box(heater, [0.055, 0.045, 0.025], m.black, [-0.26, -0.055, -0.035]);
  beam(heater, [-0.25, -0.055, -0.035], [-0.145, -0.055, -0.035], 0.005, m.metal);

  const ducts = part(
    root,
    'outlet-ducts',
    'Outlet ducts',
    [0, 0, 0],
    [0, 0.44, 0.2],
    'Distribution flaps apportion air among the face vents, footwells and windscreen; combined delivery is possible. These destinations share the same air unit; the tube shapes are functional connections, not factory duct routing.',
  );
  box(ducts, [0.34, 0.1, 0.12], m.dark, [0, 0.65, 0.405]);
  for (const side of [-1, 1]) {
    tube(
      ducts,
      [
        [side * 0.08, 0.67, 0.4],
        [side * 0.23, 0.74, 0.39],
        [side * 0.47, 0.76, 0.35],
        [side * 0.575, 0.76, 0.307],
      ],
      0.03,
      m.blue,
    );
    tube(
      ducts,
      [
        [side * 0.04, 0.68, 0.4],
        [side * 0.066, 0.76, 0.35],
        [side * 0.066, 0.816, 0.307],
      ],
      0.028,
      m.blue,
    );
    tube(
      ducts,
      [
        [side * 0.08, 0.68, 0.445],
        [side * 0.17, 0.75, 0.55],
        [side * 0.24, 0.81, 0.64],
      ],
      0.02,
      m.blue,
    );
    box(ducts, [0.2, 0.015, 0.04], m.dark, [side * 0.24, 0.81, 0.65]);
    tube(
      ducts,
      [
        [side * 0.08, 0.625, 0.395],
        [side * 0.17, 0.5, 0.395],
        [side * 0.28, 0.4, 0.415],
      ],
      0.028,
      m.blue,
    );
  }

  const refrigerant = part(
    root,
    'refrigerant-connections',
    'Refrigerant pipes and drier',
    [0.25, 0.59, 0.68],
    [0.48, -0.06, 0.32],
    'Pressure and suction connections cross the body separately from heater coolant and the condensate drain. Liquid refrigerant passes through the receiver-drier before the expansion valve; vapour returns towards the engine compressor. The front condensers and rear compressor lie beyond this cutaway. The drier removes moisture inside the refrigerant circuit, not from cabin air. These pipe bends and bracket positions are illustrative.',
    [0.191, -0.09, 0.42],
  );
  // Connector ends meet the two valve pipes in the assembled position.
  tube(
    refrigerant,
    [
      [-0.035, 0.13, 0.09],
      [-0.035, 0.13, 0.2],
      [0.13, -0.01, 0.31],
      [0.16, -0.01, 0.42],
    ],
    0.007,
    m.warm,
  );
  cylinder(refrigerant, 0.031, 0.13, m.metal, [0.16, -0.075, 0.42], [0, 0, 0]);
  cylinder(refrigerant, 0.034, 0.015, m.dark, [0.16, -0.045, 0.42], [0, 0, 0]);
  tube(
    refrigerant,
    [
      [0.16, -0.01, 0.42],
      [0.21, -0.01, 0.42],
      [0.22, -0.07, 0.55],
    ],
    0.007,
    m.warm,
  );
  tube(
    refrigerant,
    [
      [0, 0.13, 0.09],
      [0.05, 0.09, 0.18],
      [0.11, -0.09, 0.2],
      [0.08, -0.27, -0.12],
    ],
    0.01,
    m.blue,
  );
  cylinder(refrigerant, 0.012, 0.025, m.metal, [0.2, -0.01, 0.42], [0, 0, 0]);
  box(refrigerant, [0.027, 0.025, 0.027], m.black, [0.2, 0.015, 0.42]);

  const coolant = part(
    root,
    'coolant-pipes',
    'Heater coolant pipes',
    [0.16, 0.31, -0.15],
    [0, -0.15, -0.22],
    'A supply and return connect the front heater to the rear engine cooling circuit. The warmer supply gives up heat in the core, and coolant returns to the engine; neither pipe carries cabin air. Flexible hoses join the pipes at the front heater, and grommets seal their body passage.',
  );
  for (const [offset, surface] of [
    [0, m.warm],
    [0.045, m.blue],
  ] as const) {
    tube(
      coolant,
      [
        [offset, 0.14, -0.65],
        [offset, 0, -0.45],
        [offset, -0.01, 0.1],
        [offset, 0, 0.48],
        [offset, 0.31, 0.63],
        [offset - 0.055, 0.46, 0.71],
      ],
      0.011,
      surface,
    );
    for (const z of [-0.3, 0.12, 0.38]) cylinder(coolant, 0.014, 0.018, m.dark, [offset, 0, z], [Math.PI / 2, 0, 0]);
  }
  return root;
}
