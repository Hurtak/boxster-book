import * as THREE from 'three';
import { assembly, part, materials, box, cylinder, mesh, beam, gear, annulus, tube } from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'pdk-explorer',
  title: 'From the car to optional PDK',
  location: 'Optional PDK sits behind the 2010 2.9 engine and drives both rear wheels. Its electronic controller is separate, in the rear-right luggage-compartment area.',
  overview: 'The flywheel feeds nested clutch packs and concentric shafts inside a common housing. The sump, supports, separate ECU, cooler plumbing and selector cable connect this assembly to the car.',
  assembled: 'K1 is the outer pack but drives the inner shaft; K2 is the inner pack and drives the hollow outer shaft. The cutaways reveal that relationship without reconstructing the complete gearbox.',
  exploded: 'Separated groups expose the packs, shafts and sample gears, the housing and sump, and separate control and cooling parts. The selector cable serves the mechanical parking lock. Offsets are not a removal sequence.',
  focus: 'k1-odd',
  hideCarParts: ['gearbox', 'gear-lever'],
  direction: [1.25, .85, 1.6],
  note: 'Optional CG200 PDK. Housing cutaways, counts, pipe/cable routes and positions are illustrative. Two oil volumes stay separate. PET identifies external assemblies; training establishes the internal clutch paths.',
  connections: [
    { from: 'flywheel', to: 'k1-odd', label: 'Engine drive enters the outer clutch pack', kind: 'mechanical' },
    { from: 'flywheel', to: 'k2-even', label: 'Engine drive also reaches the inner clutch pack', kind: 'mechanical' },
    { from: 'k1-odd', to: 'gears', label: 'Inner input shaft serves odd gears and reverse', kind: 'mechanical' },
    { from: 'k2-even', to: 'gears', label: 'Hollow outer input shaft serves even gears', kind: 'mechanical' },
    { from: 'gears', to: 'final-drive', label: 'Selected ratio transmits drive to the rear axle', kind: 'mechanical' },
    { from: 'hydraulic-block', to: 'k1-odd', label: 'Regulated fluid operates and cools the clutch', kind: 'fluid' },
    { from: 'hydraulic-block', to: 'k2-even', label: 'A separate clutch circuit regulates the other pack', kind: 'fluid' },
    { from: 'hydraulic-block', to: 'gears', label: 'Hydraulic actuators move the gear-selection mechanisms', kind: 'fluid' },
    { from: 'controller', to: 'hydraulic-block', label: 'Electrical commands operate the pressure-control valves', kind: 'signal' },
    { from: 'gears', to: 'controller', label: 'Speed and selection feedback informs control', kind: 'signal' },
    { from: 'hydraulic-block', to: 'cooler', label: 'Hydraulic/clutch fluid exchanges heat through an external cooler', kind: 'fluid' },
    { from: 'housing', to: 'hydraulic-block', label: 'Bolted sump closes the housing below the hydraulic unit', kind: 'structure' },
    { from: 'housing', to: 'gears', label: 'Housing carries gearing and connects to the engine and supports', kind: 'structure' },
    { from: 'selector', to: 'housing', label: 'Mechanical selector cable operates the parking-lock mechanism', kind: 'mechanical' },
    { from: 'selector', to: 'controller', label: 'Forward-gear requests are handled through electronic control', kind: 'signal' },
  ],
};

// All rings have a deliberate open sector to expose the nesting. Their plate
// count, spline form and gaps are illustrative, not a replacement-parts drawing.
function ring(parent, inner, outer, depth, position, surface) {
  const shape = new THREE.Shape();
  const start = Math.PI * .2, end = Math.PI * 1.8;
  shape.absarc(0, 0, outer, start, end, false);
  shape.lineTo(Math.cos(end) * inner, Math.sin(end) * inner);
  shape.absarc(0, 0, inner, end, start, true);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 32 });
  geometry.translate(0, 0, -depth / 2);
  return mesh(parent, geometry, surface, position);
}

export function createAssembly() {
  const root = assembly('optional-pdk');
  const m = materials();
  const flywheel = part(root, 'flywheel', 'Dual-mass flywheel', [0, .48, -1.075], [0, .08, .3], 'The flywheel receives engine rotation and feeds the common driving side of the two clutch packs. Its two masses reduce torsional fluctuations; the display does not simulate that movement.');
  ring(flywheel, .038, .165, .023, [0, 0, .015], m.dark);
  ring(flywheel, .05, .146, .023, [0, 0, -.015], m.metal);
  cylinder(flywheel, .035, .06, m.metal, [0, 0, 0], [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 10; i++) {
    const angle = i * Math.PI * 2 / 10;
    box(flywheel, [.013, .02, .024], m.metal, [Math.cos(angle) * .164, Math.sin(angle) * .164, .015], [0, 0, angle]);
  }

  const k1 = part(root, 'k1-odd', 'K1 and inner shaft', [0, .48, -1.17], [.37, .12, .08], 'Outer wet clutch K1 couples the engine to inner shaft 1. That path serves gears 1, 3, 5 and 7 plus reverse. Hydraulic pressure clamps the discs; their drawn count and spacing are schematic.');
  ring(k1, .105, .17, .105, [0, 0, 0], m.dark);
  for (let i = 0; i < 6; i++) ring(k1, .108, .155, .009, [0, 0, -.043 + i * .016], i % 2 ? m.metal : m.warm);
  cylinder(k1, .023, .65, m.warm, [0, 0, -.31], [Math.PI / 2, 0, 0]);
  ring(k1, .025, .098, .012, [0, 0, -.057], m.metal);
  for (const angle of [Math.PI * .4, Math.PI, Math.PI * 1.6]) beam(k1, [Math.cos(angle) * .03, Math.sin(angle) * .03, -.057], [Math.cos(angle) * .115, Math.sin(angle) * .115, -.057], .009, m.metal);

  const k2 = part(root, 'k2-even', 'K2 and hollow shaft', [0, .48, -1.17], [-.37, .12, -.03], 'Inner wet clutch K2 couples the engine to hollow outer shaft 2, which surrounds shaft 1 and serves gears 2, 4 and 6. The two input shafts share a centreline but can turn at different speeds.');
  ring(k2, .044, .1, .102, [0, 0, 0], m.green);
  for (let i = 0; i < 6; i++) ring(k2, .046, .091, .009, [0, 0, -.043 + i * .016], i % 2 ? m.metal : m.warm);
  ring(k2, .027, .041, .47, [0, 0, -.278], m.blue);

  const gears = part(root, 'gears', 'Gears and selectors', [0, .48, -1.57], [0, .35, -.28], 'Meshed gears provide possible ratios; sleeves and synchronisers select a route. The sample gears and selector rods explain the arrangement, without claiming a complete seven-speed tooth or shaft layout.');
  for (const x of [-.14, .14]) {
    beam(gears, [x, -.045, -.29], [x, -.045, .3], .022, m.metal);
    for (const [i, z] of [-.2, -.07, .08].entries()) gear(gears, .058 + i * .007, .028, m.metal, [x, -.045, z], 16);
  }
  for (const z of [-.2, -.07, .08]) gear(gears, .069, .022, m.dark, [0, 0, z], 16);
  for (const x of [-.2, .2]) {
    beam(gears, [x, .09, -.22], [x, .09, .22], .009, m.warm);
    ring(gears, .058, .075, .017, [x * .7, -.045, -.005], m.warm);
    beam(gears, [x, .09, -.005], [x * .7, .035, -.005], .01, m.warm);
  }
  box(gears, [.4, .018, .61], m.dark, [0, -.15, 0]);
  for (const x of [-.21, .21]) box(gears, [.018, .09, .61], m.metal, [x, -.1, 0]);

  const finalDrive = part(root, 'final-drive', 'Final drive and outputs', [0, .345, -1.2075], [0, -.12, .32], 'Both gear paths feed the final drive. PET distinguishes short and long output flanges connecting to the rear driveshafts. Their unequal lengths are represented schematically; differential operation is not simulated.');
  annulus(finalDrive, .13, .09, .022, m.metal);
  cylinder(finalDrive, .075, .18, m.dark);
  // Unequal internal output reach is shown without claiming factory dimensions.
  beam(finalDrive, [-.12, 0, 0], [.25, 0, 0], .025, m.dark);
  for (const x of [-.12, .25]) cylinder(finalDrive, .047, .035, m.warm, [x, 0, 0]);
  for (const side of [-1, 1]) {
    beam(finalDrive, [side < 0 ? -.135 : .27, 0, 0], [side * .69, -.016, 0], .018, m.metal);
    cylinder(finalDrive, .038, .045, m.black, [side * .25, 0, 0]);
    cylinder(finalDrive, .038, .045, m.black, [side * .65, -.016, 0]);
  }

  const hydraulic = part(root, 'hydraulic-block', 'Hydraulic valve block', [0, .255, -1.58], [0, -.28, -.1], 'The hydraulic unit sits above the oil sump and directs pressure to clutch circuits and gear actuators. It is distinct from the remote electronic ECU. Its channels and solenoids are schematic, not a valve inventory.');
  box(hydraulic, [.35, .045, .42], m.metal);
  for (let i = 0; i < 5; i++) {
    box(hydraulic, [.28, .018, .013], m.warm, [0, .035, -.16 + i * .08]);
    cylinder(hydraulic, .022, .06, m.black, [.175, .015, -.16 + i * .08]);
  }
  box(hydraulic, [.08, .025, .3], m.dark, [-.19, .02, 0]);

  const controller = part(root, 'controller', 'Separate PDK controller', [-.5, .65, -1.62], [-.28, .24, -.18], 'The electronic PDK controller sits in the rear-right luggage-compartment area. It uses vehicle requests and transmission feedback to command hydraulic valves. The box and mounting position here are approximate.');
  box(controller, [.2, .045, .16], m.metal);
  box(controller, [.22, .01, .18], m.dark, [0, -.032, 0]);
  for (const x of [-.12, .12]) box(controller, [.03, .012, .045], m.metal, [x, -.032, 0]);
  for (let i = 0; i < 7; i++) box(controller, [.012, .016, .14], m.dark, [-.084 + i * .028, .03, 0]);
  box(controller, [.16, .028, .03], m.black, [0, 0, .091]);
  for (const x of [-.05, .05]) box(controller, [.045, .016, .025], m.blue, [x, 0, .11]);

  const cooler = part(root, 'cooler', 'Exchanger and pipes', [.29, .5, -1.47], [.4, .12, -.3], 'Oil pipes join the external exchanger to the gearbox; separate coolant hoses carry heat away. PET also identifies the coolant-side disc valve. The pipe shapes are illustrative; gear oil remains a separate volume.');
  for (let i = 0; i < 10; i++) box(cooler, [.12, .006, .18], i % 2 ? m.metal : m.dark, [0, -.045 + i * .01, 0]);
  for (const z of [-.055, .055]) {
    cylinder(cooler, .014, .055, m.warm, [.075, -.025, z]);
    cylinder(cooler, .014, .055, m.blue, [-.075, .025, z]);
    tube(cooler, [[.09, -.025, z], [.14, -.025, z], [.14, -.13, z], [-.05, -.16, z]], .009, m.warm);
    tube(cooler, [[-.09, .025, z], [-.11, .1, z], [-.11, .13, z + .11]], .012, m.blue);
  }
  cylinder(cooler, .026, .06, m.dark, [-.11, .13, .11], [0, 0, 0]);
  cylinder(cooler, .035, .016, m.metal, [-.11, .17, .11], [0, 0, 0]);

  const housing = part(root, 'housing', 'Housing, sump and supports', [0, .45, -1.46], [.48, -.15, .05], 'The engine bolts to the bellhousing; left and right brackets support the gearbox. A bolted sump closes the hydraulic-unit area below. The open housing sectors expose the internals and do not reproduce a casting.');
  // Partial rings and one lower wall deliberately leave the teaching internals visible.
  ring(housing, .192, .211, .025, [0, .03, .31], m.metal);
  ring(housing, .185, .201, .025, [0, .03, .16], m.metal);
  for (const x of [-.23, .23]) {
    box(housing, [.018, .14, .6], m.metal, [x, -.075, -.08]);
    beam(housing, [x, -.03, -.12], [x * 1.48, .04, -.12], .022, m.metal);
    cylinder(housing, .043, .025, m.black, [x * 1.48, .05, -.12], [0, 0, 0]);
  }
  box(housing, [.41, .018, .45], m.dark, [0, -.255, -.12]);
  for (const x of [-.21, .21]) box(housing, [.018, .045, .46], m.metal, [x, -.231, -.12]);
  for (const z of [-.35, .11]) box(housing, [.42, .045, .018], m.metal, [0, -.231, z]);
  for (const x of [-.19, .19]) for (const z of [-.31, -.17, -.03, .08]) cylinder(housing, .009, .014, m.warm, [x, -.26, z], [0, 0, 0]);

  const selector = part(root, 'selector', 'Selector and parking cable', [0, .52, .005], [-.3, .14, .15], 'The cabin selector sends drive requests electronically. Its separate mechanical cable operates the parking-lock mechanism at the gearbox. It does not directly select each forward gear; the cable route is illustrative.');
  box(selector, [.11, .07, .19], m.dark);
  beam(selector, [0, .025, 0], [0, .17, -.02], .012, m.metal);
  box(selector, [.04, .055, .055], m.black, [0, .18, -.02]);
  tube(selector, [[.04, -.02, -.08], [.16, -.05, -.505], [.18, -.06, -.955], [.19, -.04, -1.315]], .007, m.black);
  beam(selector, [.19, -.04, -1.315], [.19, -.04, -1.405], .004, m.metal);
  box(selector, [.045, .02, .07], m.warm, [.19, -.04, -1.405]);
  return root;
}
