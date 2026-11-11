import * as THREE from 'three';
import { assembly, part, materials, group, box, cylinder, tube, annulus, mesh } from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'fluids-explorer',
  title: 'From the car to its heat paths',
  location: 'The 2010 2.9 places the engine behind the seats, its principal coolant radiators at the front, and its exhaust treatment and silencers around the rear power unit.',
  overview: 'The long coolant circuit moves heat forwards. Oil circulates within the engine and exchanges heat with coolant across a metal wall. Exhaust gas follows its own rearward route.',
  assembled: 'The oil pan and oil-to-coolant exchanger belong to the engine assembly. The coolant pump serves the engine and front radiators; the expansion tank is a side branch, not the series return path.',
  exploded: 'The separated groups reveal three distinct systems: oil supply and collection, coolant circulation, and exhaust treatment. Connections are functional; the offsets do not describe a removal sequence.',
  focus: 'engine-jackets',
  hideCarParts: ['engine', 'exhaust-outlets'],
  direction: [1.2, 1.2, 1.5],
  note: 'Factory plates guide assembly identities and attachments; sizes, routing, pump internals and all offsets remain illustrative. Front pair shown; centre radiator, PDK cooler, heater branch and sports-exhaust actuators omitted.',
  connections: [
    { from: 'engine-jackets', to: 'oil-system', label: 'Oil supplies working surfaces and returns from the heads to the integrated reservoir', kind: 'fluid' },
    { from: 'engine-jackets', to: 'oil-system', label: 'A separate oil-pump chain drives the five-section common shaft', kind: 'mechanical' },
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

  const oil = part(root, 'oil-system', 'Oil reservoir and pumps', [0, .285, -.82], [0, -.25, -.1], 'The integrated reservoir sits below the engine. Four scavenge sections and one pressure section share a shaft driven by a separate oil-pump chain. The open pan exposes a schematic shaft, suction pickup, control valve and level sender; it does not reproduce pump internals.');
  box(oil, [.59, .025, .58], m.metal, [0, -.075, 0]);
  for (const side of [-1, 1]) box(oil, [.025, .13, .58], m.metal, [side * .285, -.015, 0]);
  box(oil, [.59, .13, .025], m.metal, [0, -.015, -.278]);
  box(oil, [.5, .017, .45], m.warm, [0, -.052, 0]);
  // The separate pump drive is longitudinal like the crankshaft, not a cam chain.
  cylinder(oil, .009, .48, m.dark, [0, .025, 0], zAxis);
  for (let i = 0; i < 5; i++) {
    const section = annulus(oil, .042, .013, .045, i === 4 ? m.green : m.warm, [0, .025, -.18 + i * .09]);
    section.rotation.set(0, 0, 0);
  }
  for (const [y, radius] of [[.025, .045], [.235, .055]]) {
    const sprocket = annulus(oil, radius, .012, .018, m.dark, [0, y, .27]);
    sprocket.rotation.set(0, 0, 0);
  }
  tube(oil, [[-.045, .025, .27], [-.055, .235, .27], [0, .29, .27], [.055, .235, .27], [.045, .025, .27], [0, -.02, .27], [-.045, .025, .27]], .006, m.dark);
  tube(oil, [[0, .025, -.21], [.1, -.005, -.21], [.16, -.035, -.13]], .018, m.metal);
  cylinder(oil, .036, .018, m.dark, [.16, -.047, -.13], [0, 0, 0]);
  cylinder(oil, .022, .11, m.green, [.285, .025, .1]);
  box(oil, [.045, .032, .035], m.black, [.355, .025, .1]);
  cylinder(oil, .012, .12, m.dark, [-.21, .015, -.13], [0, 0, 0]);
  box(oil, [.055, .025, .045], m.black, [-.21, -.065, -.13]);
  for (const side of [-1, 1]) for (const z of [-.17, .17]) {
    tube(oil, [[side * .43, .23, z], [side * .33, .13, z], [side * .18, .04, z * .2]], .012, m.warm);
  }

  const exchanger = part(root, 'heat-exchanger', 'Oil–coolant exchanger', [.13, .69, -.73], [.15, .63, 0], 'The exchanger mounts on the oil-conducting housing, with a filter cup and insert underneath the adjoining part of that housing and a separate pressure sender. Heat crosses metal without mixing liquids. The exposed plate count and passages are illustrative.');
  box(exchanger, [.4, .045, .23], m.dark, [-.055, -.035, 0]);
  for (let i = 0; i < 6; i++) box(exchanger, [.25, .012, .19], m.metal, [0, i * .018, 0]);
  cylinder(exchanger, .044, .1, m.tan, [-.2, -.12, 0], [0, 0, 0]);
  // An open side of the cup keeps its replaceable filter insert visible.
  mesh(exchanger, new THREE.CylinderGeometry(.055, .055, .16, 32, 1, true, 0, Math.PI * 1.4), m.black, [-.2, -.135, 0]);
  cylinder(exchanger, .017, .05, m.green, [-.22, -.025, .13], zAxis);
  cylinder(exchanger, .024, .08, m.blue, [.1, .025, .13], zAxis);
  cylinder(exchanger, .021, .07, m.warm, [-.06, -.025, -.13], zAxis);
  tube(exchanger, [[-.1, -.015, -.1], [-.4, .01, -.4], [-.55, .08, -.89]], .018, m.black);

  const pump = part(root, 'coolant-pump', 'Pump and thermostat', [.37, .49, -.44], [.44, .05, .36], 'The pulley drives a separate coolant pump. A distinct thermostat insert sits in its own neighbouring housing, connected by water guides and pipes. The exposed impeller and spring explain those different jobs; vane count, spring form and routing are schematic.');
  cylinder(pump, .09, .1, m.metal, [0, 0, 0], zAxis);
  cylinder(pump, .065, .018, m.dark, [0, 0, .065], zAxis);
  for (const z of [.058, .064, .07]) cylinder(pump, .067, .003, m.black, [0, 0, z], zAxis);
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3;
    box(pump, [.075, .018, .012], m.metal, [Math.cos(angle) * .035, Math.sin(angle) * .035, -.055], [0, 0, angle + .5]);
  }
  cylinder(pump, .062, .08, m.metal, [-.16, -.035, -.015], zAxis);
  cylinder(pump, .045, .012, m.warm, [-.16, -.035, .035], zAxis);
  for (let i = 0; i < 4; i++) {
    const spring = annulus(pump, .021, .016, .003, m.dark, [-.16, -.035, -.045 + i * .014]);
    spring.rotation.set(0, 0, 0);
  }
  tube(pump, [[-.035, -.04, -.04], [-.1, -.065, -.04], [-.16, -.035, -.015]], .026, m.blue);
  cylinder(pump, .028, .09, m.blue, [-.19, -.035, .05], zAxis);

  const radiators = part(root, 'front-radiators', 'Front radiators and fans', [0, .36, 1.63], [0, .25, .5], 'Each front module combines a coolant radiator, rear fan and fan shroud with separate air guides. Supply and return hoses join the coolant pipes. The A/C condenser is a separate neighbouring circuit, omitted here, as is the conditional centre radiator.');
  for (const side of [-1, 1]) {
    const module = group('radiator-module', radiators, [side * .55, 0, 0]);
    module.rotation.y = side * -.22;
    box(module, [.37, .3, .065], m.dark);
    box(module, [.33, .25, .072], m.metal);
    for (let i = 0; i < 15; i++) box(module, [.007, .245, .008], m.dark, [-.15 + i * .0214, 0, .041]);
    const shroud = new THREE.Shape();
    shroud.moveTo(-.18, -.145); shroud.lineTo(.18, -.145); shroud.lineTo(.18, .145); shroud.lineTo(-.18, .145); shroud.closePath();
    const fanOpening = new THREE.Path();
    fanOpening.absarc(0, 0, .123, 0, Math.PI * 2, true);
    shroud.holes.push(fanOpening);
    mesh(module, new THREE.ExtrudeGeometry(shroud, { depth: .015, bevelEnabled: false }), m.dark, [0, 0, -.075]);
    cylinder(module, .028, .038, m.black, [0, 0, -.085], zAxis);
    for (const side of [-1, 1]) box(module, [.018, .29, .11], m.black, [side * .18, 0, .09]);
    for (const side of [-1, 1]) box(module, [.36, .018, .11], m.black, [0, side * .14, .09]);
    for (let i = 0; i < 5; i++) {
      const angle = i * Math.PI * 2 / 5;
      box(module, [.11, .035, .014], m.dark, [Math.cos(angle) * .061, Math.sin(angle) * .061, -.084], [0, 0, angle + .4]);
    }
    cylinder(module, .026, .09, m.blue, [side * -.18, -.09, -.02]);
    cylinder(module, .026, .09, m.blue, [side * -.18, .09, -.02]);
  }

  const pipes = part(root, 'coolant-pipes', 'Long coolant connections', [0, .235, .36], [0, -.18, .05], 'Separate supply and return distributor tubes connect the front pair in parallel to the long tunnel pipes. Flexible couplings, retaining clips and pipe brackets join and support them. Manual and PDK pipe listings differ; the shown routes and side assignments are illustrative.');
  for (const side of [-1, 1]) {
    const height = side > 0 ? .18 : .02;
    tube(pipes, [[side * .34, .18, -1.03], [side * .3, 0, -.78], [side * .3, 0, .72], [side * .3, height, 1.09], [side * .15, height, 1.2]], .025, m.blue);
    // Separate conceptual supply/return headers reach both front modules.
    tube(pipes, [[-.55, height, 1.23], [-.38, height, 1.2], [0, height, 1.2], [.38, height, 1.2], [.55, height, 1.23]], .022, m.blue);
    for (const z of [-.7, .75]) cylinder(pipes, .03, .1, m.black, [side * .3, 0, z], zAxis);
  }

  const tank = part(root, 'expansion-tank', 'Tank and service caps', [-.43, .63, -1.42], [-.4, .38, -.12], 'The moulded expansion tank has a bleed valve, level switch and several hose connections. A separate rear service cup carries distinct oil and coolant filler caps; a hose links its coolant neck to the tank. Vent lines and the expansion branch do not carry all radiator return flow. Shapes and hose endpoints are schematic.');
  for (const x of [-.065, 0, .065]) cylinder(tank, .052, .18, m.metal, [x, -.015, 0], [0, 0, 0]);
  box(tank, [.22, .04, .12], m.metal, [0, .09, 0]);
  cylinder(tank, .036, .035, m.blue, [.025, .125, .01], [0, 0, 0]);
  cylinder(tank, .029, .025, m.dark, [-.065, .125, .01], [0, 0, 0]);
  cylinder(tank, .009, .13, m.dark, [-.055, -.035, 0], [0, 0, 0]);
  box(tank, [.035, .025, .035], m.black, [-.055, -.115, 0]);
  tube(tank, [[.11, .07, -.015], [.17, .1, -.1], [.1, .16, -.2]], .023, m.blue);
  box(tank, [.21, .02, .12], m.dark, [.055, .15, -.2]);
  cylinder(tank, .033, .035, m.black, [.01, .178, -.2], [0, 0, 0]);
  cylinder(tank, .035, .035, m.blue, [.1, .178, -.2], [0, 0, 0]);
  tube(tank, [[.06, -.06, .045], [.15, -.14, .12], [.29, -.24, .27]], .014, m.blue);
  tube(tank, [[-.1, .07, .025], [-.15, .04, .12], [-.08, -.12, .25]], .008, m.blue);

  const exhaust = part(root, 'exhaust-system', 'Converters and silencers', [0, .24, -1.22], [0, -.04, -.58], 'Each bank has a manifold-integrated converter with two bricks, two oxygen-sensor positions and a rear silencer. Flanged joints, catalyst heat shields and a rear retainer locate the installed assemblies. Connecting pipes lead to the 2.9’s single outlet; the open shells are teaching cutaways, not factory sections.');
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) tube(exhaust, [[side * .45, .17, .19 + i * .21], [side * .57, .04, .14 + i * .13], [side * .62, 0, .1]], .022, m.warm);
    // One open shell encloses two bricks on each bank, not two converter units.
    mesh(exhaust, new THREE.CylinderGeometry(.077, .077, .3, 32, 1, true, 0, Math.PI), m.metal, [side * .62, 0, -.05], zAxis);
    for (const z of [.025, -.115]) cylinder(exhaust, .061, .085, m.warm, [side * .62, 0, z], zAxis);
    for (const z of [.125, -.045]) cylinder(exhaust, .012, .07, m.dark, [side * .62, .06, z], [0, 0, 0]);
    tube(exhaust, [[side * .62, 0, -.2], [side * .66, 0, -.3], [side * .52, .01, -.4]], .026, m.metal);
    box(exhaust, [.16, .014, .27], m.metal, [side * .62, .1, -.035]);
    cylinder(exhaust, .04, .014, m.dark, [side * .62, 0, -.21], zAxis);
    const silencer = cylinder(exhaust, .14, .36, m.metal, [side * .43, .015, -.44]);
    silencer.scale.y = .65;
    tube(exhaust, [[side * .3, .015, -.45], [side * .16, -.015, -.56], [0, -.015, -.63]], .027, m.metal);
  }
  tube(exhaust, [[-.47, .015, -.33], [0, .015, -.27], [.47, .015, -.33]], .022, m.metal);
  box(exhaust, [.85, .035, .055], m.dark, [0, .17, -.44]);
  for (const side of [-1, 1]) {
    const strap = annulus(exhaust, .147, .139, .025, m.dark, [side * .43, .015, -.44]);
    strap.scale.y = .65;
    tube(exhaust, [[side * .43, .13, -.44], [side * .39, .17, -.44]], .012, m.dark);
  }
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
  mesh(exhaust, new THREE.ExtrudeGeometry(outletShape, { depth: .11, bevelEnabled: false, curveSegments: 8 }), m.metal, [0, .048, -.9294]).name = 'standard-2-9-outlet';
  tube(exhaust, [[0, -.015, -.63], [0, .048, -.82], [0, .048, -.87]], .027, m.metal);
  return root;
}
