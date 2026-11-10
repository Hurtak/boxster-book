import * as THREE from 'three';
import { assembly, part, materials, group, box, cylinder, tube, annulus, mesh, sphere } from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'fluids-explorer',
  title: 'From the car to its heat paths',
  location: 'The 2010 2.9 places the engine behind the seats, its principal coolant radiators at the front, and its exhaust treatment and silencers around the rear power unit.',
  overview: 'The long coolant circuit moves heat forwards. Oil circulates within the engine and exchanges heat with coolant across a metal wall. Exhaust gas follows its own rearward route.',
  assembled: 'The oil pan and oil-to-coolant exchanger belong to the engine assembly. The coolant pump serves the engine and front radiators; the expansion tank is a side branch, not the series return path.',
  exploded: 'The separated groups reveal three distinct systems: oil supply and collection, coolant circulation, and exhaust treatment. Connections are functional; the offsets do not describe a removal sequence.',
  focus: 'engine-jackets',
  hideCarParts: ['engine', 'hydraulics'],
  direction: [1.2, 1.2, 1.5],
  note: 'Front radiator pair shown; centre fitment varies. PDK cooler and sports-exhaust actuators omitted. Exposed oil and catalyst parts are teaching cutaways, not factory sections.',
  connections: [
    { from: 'engine-jackets', to: 'oil-system', label: 'Oil supplies working surfaces and returns from the heads to the integrated reservoir', kind: 'fluid' },
    { from: 'oil-system', to: 'heat-exchanger', label: 'Engine-oil circuit exchanges heat through separate metal-walled passages', kind: 'fluid' },
    { from: 'heat-exchanger', to: 'engine-jackets', label: 'Coolant carries heat; it does not mix with the oil', kind: 'fluid' },
    { from: 'coolant-pump', to: 'engine-jackets', label: 'Pump creates circulation through the engine coolant jackets', kind: 'fluid' },
    { from: 'engine-jackets', to: 'coolant-pump', label: 'Accessory-belt drive turns the coolant pump', kind: 'mechanical' },
    { from: 'coolant-pump', to: 'coolant-pipes', label: 'Thermostat regulates access to the long radiator circuit', kind: 'fluid' },
    { from: 'coolant-pipes', to: 'front-radiators', label: 'Supply and return paths join the rear engine to the front heat exchangers', kind: 'fluid' },
    { from: 'expansion-tank', to: 'engine-jackets', label: 'Expansion, venting and filling branch; not a series radiator return', kind: 'fluid' },
    { from: 'engine-jackets', to: 'exhaust-system', label: 'Combustion gas leaves each bank through its manifold and converter assembly', kind: 'air' },
  ],
};

const zAxis = [Math.PI / 2, 0, 0];

export function createAssembly() {
  const root = assembly('engine-heat-management');
  const m = materials();
  const engine = part(root, 'engine-jackets', 'Engine coolant jackets', [0, .52, -.82], [0, .32, 0], 'Coolant absorbs heat from the cylinders and heads behind the cabin. Blue bands locate jacket regions; they do not reproduce internal cast passages.');
  box(engine, [.48, .26, .68], m.metal);
  for (const side of [-1, 1]) {
    box(engine, [.2, .24, .66], m.blue, [side * .43, 0, 0]);
    box(engine, [.025, .2, .7], m.metal, [side * .545, 0, 0]);
    for (let i = 0; i < 3; i++) {
      cylinder(engine, .083, .23, m.metal, [side * .28, 0, -.21 + i * .21]);
      box(engine, [.17, .024, .08], m.blue, [side * .42, .135, -.21 + i * .21]);
    }
  }

  const oil = part(root, 'oil-system', 'Oil reservoir and pumps', [0, .285, -.82], [0, -.25, -.1], 'The integrated reservoir sits below the engine. Four scavenge sections return oil and one pressure section supplies lubrication; all five share a mechanically driven shaft. The open pan illustrates their grouping.');
  box(oil, [.59, .025, .58], m.metal, [0, -.075, 0]);
  for (const side of [-1, 1]) box(oil, [.025, .13, .58], m.metal, [side * .285, -.015, 0]);
  box(oil, [.59, .13, .025], m.metal, [0, -.015, -.278]);
  box(oil, [.5, .017, .45], m.warm, [0, -.052, 0]);
  cylinder(oil, .009, .46, m.dark, [0, .025, 0]);
  for (let i = 0; i < 5; i++) {
    annulus(oil, .042, .013, .045, i === 4 ? m.green : m.warm, [-.18 + i * .09, .025, 0]);
  }
  for (const side of [-1, 1]) for (const z of [-.17, .17]) {
    tube(oil, [[side * .43, .23, z], [side * .33, .13, z], [side * .18, .04, z * .2]], .012, m.warm);
  }

  const exchanger = part(root, 'heat-exchanger', 'Oil–coolant exchanger', [.13, .69, -.73], [.15, .63, 0], 'Heat crosses metal between oil and coolant; the liquids remain separate. The adjoining filter belongs to the oil assembly, while the exposed plate stack illustrates heat-transfer area.');
  box(exchanger, [.27, .035, .21], m.dark, [0, -.035, 0]);
  for (let i = 0; i < 6; i++) box(exchanger, [.25, .012, .19], m.metal, [0, i * .018, 0]);
  cylinder(exchanger, .054, .18, m.black, [-.17, .025, 0], [0, 0, 0]);
  cylinder(exchanger, .024, .08, m.blue, [.1, .025, .13], zAxis);
  cylinder(exchanger, .021, .07, m.warm, [-.06, -.025, -.13], zAxis);

  const pump = part(root, 'coolant-pump', 'Pump and thermostat', [.37, .49, -.44], [.44, .05, .36], 'A separate belt-driven pump circulates coolant. The thermostat regulates the long radiator route while a short engine path supports warm-up; the exposed shapes are schematic.');
  cylinder(pump, .09, .1, m.metal, [0, 0, 0], zAxis);
  cylinder(pump, .065, .018, m.dark, [0, 0, .065], zAxis);
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3;
    box(pump, [.075, .018, .012], m.metal, [Math.cos(angle) * .035, Math.sin(angle) * .035, -.055], [0, 0, angle + .5]);
  }
  sphere(pump, .065, m.metal, [-.16, -.035, -.015]);
  tube(pump, [[-.035, -.04, -.04], [-.1, -.065, -.04], [-.16, -.035, -.015]], .026, m.blue);
  cylinder(pump, .028, .09, m.blue, [-.19, -.035, .05], zAxis);

  const radiators = part(root, 'front-radiators', 'Front radiators and fans', [0, .36, 1.63], [0, .25, .5], 'The principal radiators sit behind the left and right front openings. Their tubes and fins transfer coolant heat to outside air, assisted by fans when needed; a conditional centre module is omitted.');
  for (const side of [-1, 1]) {
    const module = group('radiator-module', radiators, [side * .55, 0, 0]);
    module.rotation.y = side * -.22;
    box(module, [.37, .3, .065], m.dark);
    box(module, [.33, .25, .072], m.metal);
    for (let i = 0; i < 15; i++) box(module, [.007, .245, .008], m.dark, [-.15 + i * .0214, 0, .041]);
    cylinder(module, .122, .026, m.black, [0, 0, -.065], zAxis);
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5;
      box(module, [.11, .035, .014], m.dark, [Math.cos(angle) * .061, Math.sin(angle) * .061, -.084], [0, 0, angle + .4]);
    }
    cylinder(module, .026, .09, m.blue, [side * -.18, -.09, -.02]);
    cylinder(module, .026, .09, m.blue, [side * -.18, .09, -.02]);
  }

  const pipes = part(root, 'coolant-pipes', 'Long coolant connections', [0, .235, .36], [0, -.18, .05], 'Long supply and return paths join the rear engine and front radiators through rigid pipes and flexible couplings. Their shown routes and side assignments are illustrative.');
  for (const side of [-1, 1]) {
    const height = side > 0 ? .18 : .02;
    tube(pipes, [[side * .34, .18, -1.03], [side * .3, 0, -.78], [side * .3, 0, .72], [side * .3, height, 1.09], [side * .15, height, 1.2]], .025, m.blue);
    // Separate conceptual supply/return headers reach both front modules.
    tube(pipes, [[-.55, height, 1.23], [-.38, height, 1.2], [0, height, 1.2], [.38, height, 1.2], [.55, height, 1.23]], .022, m.blue);
    for (const z of [-.7, .75]) cylinder(pipes, .03, .1, m.black, [side * .3, 0, z], zAxis);
  }

  const tank = part(root, 'expansion-tank', 'Rear expansion tank', [-.43, .75, -1.42], [-.4, .38, -.12], 'The tank provides expansion space and a filling/checking point through the rear luggage service flap. It is a branch of the cooling system, not a vessel carrying all radiator return flow.');
  sphere(tank, .1, m.metal, [0, 0, 0], [1.15, .9, 1.35]);
  cylinder(tank, .04, .055, m.metal, [0, .1, .02], [0, 0, 0]);
  cylinder(tank, .048, .025, m.blue, [0, .14, .02], [0, 0, 0]);
  tube(tank, [[.06, -.06, .045], [.15, -.14, .12], [.29, -.24, .27]], .014, m.blue);

  const exhaust = part(root, 'exhaust-system', 'Converters and silencers', [0, .24, -1.22], [0, -.04, -.58], 'Each bank has one converter assembly with two catalyst bricks and a rear silencer. Connecting pipes join the two sides before the standard 2.9’s single shaped outlet; open shells expose the bricks.');
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) tube(exhaust, [[side * .45, .17, .19 + i * .21], [side * .57, .04, .14 + i * .13], [side * .62, 0, .1]], .022, m.warm);
    // One open shell encloses two bricks on each bank, not two converter units.
    mesh(exhaust, new THREE.CylinderGeometry(.077, .077, .3, 32, 1, true, 0, Math.PI), m.metal, [side * .62, 0, -.05], zAxis);
    for (const z of [.025, -.115]) cylinder(exhaust, .061, .085, m.warm, [side * .62, 0, z], zAxis);
    for (const z of [.125, -.045]) cylinder(exhaust, .012, .07, m.dark, [side * .62, .06, z], [0, 0, 0]);
    tube(exhaust, [[side * .62, 0, -.2], [side * .66, 0, -.3], [side * .52, .01, -.4]], .026, m.metal);
    const silencer = cylinder(exhaust, .14, .36, m.metal, [side * .43, .015, -.44]);
    silencer.scale.y = .65;
    tube(exhaust, [[side * .3, .015, -.45], [side * .16, -.015, -.56], [0, -.015, -.63]], .027, m.metal);
  }
  tube(exhaust, [[-.47, .015, -.33], [0, .015, -.27], [.47, .015, -.33]], .022, m.metal);
  // Rounded trapezoidal contour follows the standard 2.9 outlet in brochure p. 38.
  // Wall, depth and dimensions remain schematic.
  const outletShape = new THREE.Shape();
  outletShape.moveTo(-.067, .04);
  outletShape.lineTo(.067, .04);
  outletShape.quadraticCurveTo(.08, .04, .083, .027);
  outletShape.lineTo(.094, -.027);
  outletShape.quadraticCurveTo(.096, -.04, .081, -.04);
  outletShape.lineTo(-.081, -.04);
  outletShape.quadraticCurveTo(-.096, -.04, -.094, -.027);
  outletShape.lineTo(-.083, .027);
  outletShape.quadraticCurveTo(-.08, .04, -.067, .04);
  const outletHole = new THREE.Path();
  outletHole.moveTo(-.061, .028);
  outletHole.lineTo(.061, .028);
  outletHole.quadraticCurveTo(.069, .028, .071, .019);
  outletHole.lineTo(.08, -.02);
  outletHole.quadraticCurveTo(.081, -.028, .071, -.028);
  outletHole.lineTo(-.071, -.028);
  outletHole.quadraticCurveTo(-.081, -.028, -.08, -.02);
  outletHole.lineTo(-.071, .019);
  outletHole.quadraticCurveTo(-.069, .028, -.061, .028);
  outletShape.holes.push(outletHole);
  mesh(exhaust, new THREE.ExtrudeGeometry(outletShape, { depth: .11, bevelEnabled: false, curveSegments: 8 }), m.metal, [0, -.015, -.785]);
  return root;
}
