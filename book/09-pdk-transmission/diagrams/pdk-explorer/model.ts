import * as THREE from 'three';
import {
  annulus,
  assembly,
  beam,
  box,
  cylinder,
  gear,
  materials,
  mesh,
  part,
  tube,
} from '../../../../interactive/three/component-geometry.ts';
import type { ExplorerConfig } from '../../../../interactive/types';

export const config: ExplorerConfig = {
  id: 'pdk-explorer',
  title: 'From the car to optional PDK',
  location:
    'Optional PDK sits behind the 2010 2.9 engine and drives both rear wheels. Its electronic controller is separate, in the rear-right luggage-compartment area.',
  overview:
    'The flywheel feeds nested clutch packs and concentric shafts inside a common housing. The sump, supports, separate ECU, cooler plumbing and selector cable connect this assembly to the car.',
  assembled:
    'K1 is the outer pack but drives the inner shaft; K2 is the inner pack and drives the hollow outer shaft. The cutaways reveal that relationship without reconstructing the complete gearbox.',
  exploded:
    'Separated groups expose the packs, shafts and sample gears, the housing and sump, and separate control and cooling parts. The selector cable serves the mechanical parking lock. Offsets are not a removal sequence.',
  focus: 'k1-odd',
  hideCarParts: ['gearbox', 'gear-lever'],
  direction: [1.25, 0.85, 1.6],
  note: 'Optional CG200 PDK. Housing cutaways, counts, pipe/cable routes and positions are illustrative. Two oil volumes stay separate. PET identifies external assemblies; training establishes the internal clutch paths.',
  connections: [
    {
      from: 'flywheel',
      to: 'k1-odd',
      label: 'Engine drive enters the outer clutch pack',
      kind: 'mechanical',
    },
    {
      from: 'flywheel',
      to: 'k2-even',
      label: 'Engine drive also reaches the inner clutch pack',
      kind: 'mechanical',
    },
    {
      from: 'k1-odd',
      to: 'gears',
      label: 'Inner input shaft serves odd gears and reverse',
      kind: 'mechanical',
    },
    {
      from: 'k2-even',
      to: 'gears',
      label: 'Hollow outer input shaft serves even gears',
      kind: 'mechanical',
    },
    {
      from: 'gears',
      to: 'final-drive',
      label: 'Selected ratio transmits drive to the rear axle',
      kind: 'mechanical',
    },
    {
      from: 'hydraulic-block',
      to: 'k1-odd',
      label: 'Regulated fluid operates and cools the clutch',
      kind: 'fluid',
    },
    {
      from: 'hydraulic-block',
      to: 'k2-even',
      label: 'A separate clutch circuit regulates the other pack',
      kind: 'fluid',
    },
    {
      from: 'hydraulic-block',
      to: 'gears',
      label: 'Hydraulic actuators move the gear-selection mechanisms',
      kind: 'fluid',
    },
    {
      from: 'controller',
      to: 'hydraulic-block',
      label: 'Electrical commands operate the pressure-control valves',
      kind: 'signal',
    },
    {
      from: 'gears',
      to: 'controller',
      label: 'Speed and selection feedback informs control',
      kind: 'signal',
    },
    {
      from: 'hydraulic-block',
      to: 'cooler',
      label: 'Hydraulic/clutch fluid exchanges heat through an external cooler',
      kind: 'fluid',
    },
    {
      from: 'housing',
      to: 'hydraulic-block',
      label: 'Bolted sump closes the housing below the hydraulic unit',
      kind: 'structure',
    },
    {
      from: 'housing',
      to: 'gears',
      label: 'Housing carries gearing and connects to the engine and supports',
      kind: 'structure',
    },
    {
      from: 'selector',
      to: 'housing',
      label: 'Mechanical selector cable operates the parking-lock mechanism',
      kind: 'mechanical',
    },
    {
      from: 'selector',
      to: 'controller',
      label: 'Forward-gear requests are handled through electronic control',
      kind: 'signal',
    },
  ],
};

// All rings have a deliberate open sector to expose the nesting. Their plate
// count, spline form and gaps are illustrative, not a replacement-parts drawing.
function ring(
  parent: THREE.Object3D<THREE.Object3DEventMap>,
  inner: number,
  outer: number,
  depth: number,
  position: readonly number[] | undefined,
  surface: THREE.MeshStandardMaterial,
) {
  const shape = new THREE.Shape();
  const start = Math.PI * 0.2,
    end = Math.PI * 1.8;
  shape.absarc(0, 0, outer, start, end, false);
  shape.lineTo(Math.cos(end) * inner, Math.sin(end) * inner);
  shape.absarc(0, 0, inner, end, start, true);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 32,
  });
  geometry.translate(0, 0, -depth / 2);
  return mesh(parent, geometry, surface, position);
}

export function createAssembly() {
  const root = assembly('optional-pdk');
  const m = materials();
  const flywheel = part(
    root,
    'flywheel',
    'Dual-mass flywheel',
    [0, 0.48, -1.075],
    [0, 0.08, 0.3],
    'The flywheel receives engine rotation and feeds the common driving side of the two clutch packs. Its two masses reduce torsional fluctuations; the display does not simulate that movement.',
  );
  ring(flywheel, 0.038, 0.165, 0.023, [0, 0, 0.015], m.dark);
  ring(flywheel, 0.05, 0.146, 0.023, [0, 0, -0.015], m.metal);
  cylinder(flywheel, 0.035, 0.06, m.metal, [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10;
    box(
      flywheel,
      [0.013, 0.02, 0.024],
      m.metal,
      [Math.cos(angle) * 0.164, Math.sin(angle) * 0.164, 0.015],
      [0, 0, angle],
    );
  }

  const k1 = part(
    root,
    'k1-odd',
    'K1 and inner shaft',
    [0, 0.48, -1.17],
    [0.37, 0.12, 0.08],
    'Outer wet clutch K1 couples the engine to inner shaft 1. That path serves gears 1, 3, 5 and 7 plus reverse. Hydraulic pressure clamps the discs; their drawn count and spacing are schematic.',
    [0, 0.135, 0.0525],
  );
  ring(k1, 0.105, 0.17, 0.105, [0, 0, 0], m.dark);
  for (let i = 0; i < 6; i++) ring(k1, 0.108, 0.155, 0.009, [0, 0, -0.043 + i * 0.016], i % 2 ? m.metal : m.warm);
  cylinder(k1, 0.023, 0.65, m.warm, [0, 0, -0.31], [Math.PI / 2, 0, 0]);
  ring(k1, 0.025, 0.098, 0.012, [0, 0, -0.057], m.metal);
  for (const angle of [Math.PI * 0.4, Math.PI, Math.PI * 1.6])
    beam(
      k1,
      [Math.cos(angle) * 0.03, Math.sin(angle) * 0.03, -0.057],
      [Math.cos(angle) * 0.115, Math.sin(angle) * 0.115, -0.057],
      0.009,
      m.metal,
    );

  const k2 = part(
    root,
    'k2-even',
    'K2 and hollow shaft',
    [0, 0.48, -1.17],
    [-0.37, 0.12, -0.03],
    'Inner wet clutch K2 couples the engine to hollow outer shaft 2, which surrounds shaft 1 and serves gears 2, 4 and 6. The two input shafts share a centreline but can turn at different speeds.',
    [0, 0.075, 0.051],
  );
  ring(k2, 0.044, 0.1, 0.102, [0, 0, 0], m.green);
  for (let i = 0; i < 6; i++) ring(k2, 0.046, 0.091, 0.009, [0, 0, -0.043 + i * 0.016], i % 2 ? m.metal : m.warm);
  ring(k2, 0.027, 0.041, 0.47, [0, 0, -0.278], m.blue);

  const gears = part(
    root,
    'gears',
    'Gears and selectors',
    [0, 0.48, -1.57],
    [0, 0.35, -0.28],
    'Meshed gears provide possible ratios; sleeves and synchronisers select a route. The sample gears and selector rods explain the arrangement, without claiming a complete seven-speed tooth or shaft layout.',
  );
  for (const x of [-0.14, 0.14]) {
    beam(gears, [x, -0.045, -0.29], [x, -0.045, 0.3], 0.022, m.metal);
    for (const [i, z] of [-0.2, -0.07, 0.08].entries())
      gear(gears, 0.058 + i * 0.007, 0.028, m.metal, [x, -0.045, z], 16);
  }
  for (const z of [-0.2, -0.07, 0.08]) gear(gears, 0.069, 0.022, m.dark, [0, 0, z], 16);
  for (const x of [-0.2, 0.2]) {
    beam(gears, [x, 0.09, -0.22], [x, 0.09, 0.22], 0.009, m.warm);
    ring(gears, 0.058, 0.075, 0.017, [x * 0.7, -0.045, -0.005], m.warm);
    beam(gears, [x, 0.09, -0.005], [x * 0.7, 0.035, -0.005], 0.01, m.warm);
  }
  box(gears, [0.4, 0.018, 0.61], m.dark, [0, -0.15, 0]);
  for (const x of [-0.21, 0.21]) box(gears, [0.018, 0.09, 0.61], m.metal, [x, -0.1, 0]);

  const finalDrive = part(
    root,
    'final-drive',
    'Final drive and outputs',
    [0, 0.345, -1.2075],
    [0, -0.12, 0.32],
    'Both gear paths feed the final drive. PET distinguishes short and long output flanges connecting to the rear driveshafts. Their unequal lengths are represented schematically; differential operation is not simulated.',
  );
  annulus(finalDrive, 0.13, 0.09, 0.022, m.metal);
  cylinder(finalDrive, 0.075, 0.18, m.dark);
  // Unequal internal output reach is shown without claiming factory dimensions.
  beam(finalDrive, [-0.12, 0, 0], [0.25, 0, 0], 0.025, m.dark);
  for (const x of [-0.12, 0.25]) cylinder(finalDrive, 0.047, 0.035, m.warm, [x, 0, 0]);
  for (const side of [-1, 1]) {
    beam(finalDrive, [side < 0 ? -0.135 : 0.27, 0, 0], [side * 0.69, -0.016, 0], 0.018, m.metal);
    cylinder(finalDrive, 0.038, 0.045, m.black, [side * 0.25, 0, 0]);
    cylinder(finalDrive, 0.038, 0.045, m.black, [side * 0.65, -0.016, 0]);
  }

  const hydraulic = part(
    root,
    'hydraulic-block',
    'Hydraulic valve block',
    [0, 0.255, -1.58],
    [0, -0.28, -0.1],
    'The hydraulic unit sits above the oil sump and directs pressure to clutch circuits and gear actuators. It is distinct from the remote electronic ECU. Its channels and solenoids are schematic, not a valve inventory.',
  );
  box(hydraulic, [0.35, 0.045, 0.42], m.metal);
  for (let i = 0; i < 5; i++) {
    box(hydraulic, [0.28, 0.018, 0.013], m.warm, [0, 0.035, -0.16 + i * 0.08]);
    cylinder(hydraulic, 0.022, 0.06, m.black, [0.175, 0.015, -0.16 + i * 0.08]);
  }
  box(hydraulic, [0.08, 0.025, 0.3], m.dark, [-0.19, 0.02, 0]);

  const controller = part(
    root,
    'controller',
    'Separate PDK controller',
    [-0.5, 0.65, -1.62],
    [-0.28, 0.24, -0.18],
    'The electronic PDK controller sits in the rear-right luggage-compartment area. It uses vehicle requests and transmission feedback to command hydraulic valves. The box and mounting position here are approximate.',
  );
  box(controller, [0.2, 0.045, 0.16], m.metal);
  box(controller, [0.22, 0.01, 0.18], m.dark, [0, -0.032, 0]);
  for (const x of [-0.12, 0.12]) box(controller, [0.03, 0.012, 0.045], m.metal, [x, -0.032, 0]);
  for (let i = 0; i < 7; i++) box(controller, [0.012, 0.016, 0.14], m.dark, [-0.084 + i * 0.028, 0.03, 0]);
  box(controller, [0.16, 0.028, 0.03], m.black, [0, 0, 0.091]);
  for (const x of [-0.05, 0.05]) box(controller, [0.045, 0.016, 0.025], m.blue, [x, 0, 0.11]);

  const cooler = part(
    root,
    'cooler',
    'Exchanger and pipes',
    [0.29, 0.5, -1.47],
    [0.4, 0.12, -0.3],
    'Oil pipes join the external exchanger to the gearbox; separate coolant hoses carry heat away. PET also identifies the coolant-side disc valve. The pipe shapes are illustrative; gear oil remains a separate volume.',
  );
  for (let i = 0; i < 10; i++) box(cooler, [0.12, 0.006, 0.18], i % 2 ? m.metal : m.dark, [0, -0.045 + i * 0.01, 0]);
  for (const z of [-0.055, 0.055]) {
    cylinder(cooler, 0.014, 0.055, m.warm, [0.075, -0.025, z]);
    cylinder(cooler, 0.014, 0.055, m.blue, [-0.075, 0.025, z]);
    tube(
      cooler,
      [
        [0.09, -0.025, z],
        [0.14, -0.025, z],
        [0.14, -0.13, z],
        [-0.05, -0.16, z],
      ],
      0.009,
      m.warm,
    );
    tube(
      cooler,
      [
        [-0.09, 0.025, z],
        [-0.11, 0.1, z],
        [-0.11, 0.13, z + 0.11],
      ],
      0.012,
      m.blue,
    );
  }
  cylinder(cooler, 0.026, 0.06, m.dark, [-0.11, 0.13, 0.11], [0, 0, 0]);
  cylinder(cooler, 0.035, 0.016, m.metal, [-0.11, 0.17, 0.11], [0, 0, 0]);

  const housing = part(
    root,
    'housing',
    'Housing, sump and supports',
    [0, 0.45, -1.46],
    [0.48, -0.15, 0.05],
    'The engine bolts to the bellhousing; left and right brackets support the gearbox. A bolted sump closes the hydraulic-unit area below. The open housing sectors expose the internals and do not reproduce a casting.',
  );
  // Partial rings and one lower wall deliberately leave the teaching internals visible.
  ring(housing, 0.192, 0.211, 0.025, [0, 0.03, 0.31], m.metal);
  ring(housing, 0.185, 0.201, 0.025, [0, 0.03, 0.16], m.metal);
  for (const x of [-0.23, 0.23]) {
    box(housing, [0.018, 0.14, 0.6], m.metal, [x, -0.075, -0.08]);
    beam(housing, [x, -0.03, -0.12], [x * 1.48, 0.04, -0.12], 0.022, m.metal);
    cylinder(housing, 0.043, 0.025, m.black, [x * 1.48, 0.05, -0.12], [0, 0, 0]);
  }
  box(housing, [0.41, 0.018, 0.45], m.dark, [0, -0.255, -0.12]);
  for (const x of [-0.21, 0.21]) box(housing, [0.018, 0.045, 0.46], m.metal, [x, -0.231, -0.12]);
  for (const z of [-0.35, 0.11]) box(housing, [0.42, 0.045, 0.018], m.metal, [0, -0.231, z]);
  for (const x of [-0.19, 0.19])
    for (const z of [-0.31, -0.17, -0.03, 0.08]) cylinder(housing, 0.009, 0.014, m.warm, [x, -0.26, z], [0, 0, 0]);

  const selector = part(
    root,
    'selector',
    'Selector and parking cable',
    [0, 0.52, 0.005],
    [-0.3, 0.14, 0.15],
    'The cabin selector sends drive requests electronically. Its separate mechanical cable operates the parking-lock mechanism at the gearbox. It does not directly select each forward gear; the cable route is illustrative.',
    [0, 0.18, 0.0075],
  );
  box(selector, [0.11, 0.07, 0.19], m.dark);
  beam(selector, [0, 0.025, 0], [0, 0.17, -0.02], 0.012, m.metal);
  box(selector, [0.04, 0.055, 0.055], m.black, [0, 0.18, -0.02]);
  tube(
    selector,
    [
      [0.04, -0.02, -0.08],
      [0.16, -0.05, -0.505],
      [0.18, -0.06, -0.955],
      [0.19, -0.04, -1.315],
    ],
    0.007,
    m.black,
  );
  beam(selector, [0.19, -0.04, -1.315], [0.19, -0.04, -1.405], 0.004, m.metal);
  box(selector, [0.045, 0.02, 0.07], m.warm, [0.19, -0.04, -1.405]);
  return root;
}
