import * as THREE from 'three';
import { assembly, part, materials, box, mesh, cylinder, tube, beam, sphere } from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'cabin-explorer',
  title: 'From the car to the cabin',
  location: 'The seats sit between the axles. Ahead of the occupants, the dashboard conceals the heater and air-conditioning unit; coolant pipes connect its heater to the rear engine.',
  overview: 'Follow the seat into its runners and body supports. At the front, a blower moves air across the evaporator and through the heater or bypass before the ducts distribute it.',
  assembled: 'The seat and air unit have separate jobs and share body support. The cutaway exposes the two heat exchangers: refrigerant cools the evaporator, while engine coolant warms the heater. Separate refrigerant connections and a receiver-drier sit outside the cabin-air passages.',
  exploded: 'The support, upholstery, blower, exchangers, ducts and refrigerant connections separate to expose their relationships. These display offsets are not adjustment travel, airflow paths or a removal sequence.',
  focus: 'seat-frame',
  hideCarParts: ['interior', 'chassis'],
  direction: [1.25, .85, 1.45],
  note: 'Standard seat adjustment: manual fore/aft and height, electric recline. PET 817-006/008 and 813-000/001/005/010/020/025 identify the assemblies. Seat shapes, air-unit sections, duct and pipe routes are simplified; no cooling performance or bracket coordinates are specified.',
  connections: [
    { from: 'body-supports', to: 'seat-frame', label: 'Seat runners attach to the lower body', kind: 'structure' },
    { from: 'seat-frame', to: 'seat-upholstery', label: 'Frame and cushion suspension support the occupant', kind: 'structure' },
    { from: 'body-supports', to: 'inlet-blower', label: 'The front cabin structure supports the air unit', kind: 'structure' },
    { from: 'inlet-blower', to: 'evaporator', label: 'Filtered inlet air is moved across the cooling surface', kind: 'air' },
    { from: 'evaporator', to: 'heater-bypass', label: 'Air continues towards heating or the bypass route', kind: 'air' },
    { from: 'heater-bypass', to: 'outlet-ducts', label: 'Blend and distribution send air to the selected outlets', kind: 'air' },
    { from: 'refrigerant-connections', to: 'evaporator', label: 'Liquid reaches the expansion valve; vapour returns separately towards the compressor', kind: 'fluid' },
    { from: 'body-supports', to: 'refrigerant-connections', label: 'Brackets retain the sealed refrigerant pipes and receiver-drier', kind: 'structure' },
    { from: 'heater-bypass', to: 'coolant-pipes', label: 'Supply and return carry coolant through the heater core', kind: 'fluid' },
    { from: 'body-supports', to: 'outlet-ducts', label: 'The dashboard region locates the outlet ducts', kind: 'structure' },
  ],
};

function roundedPad(parent, dimensions, surface, position, rotation = [0, 0, 0]) {
  const [width, height, depth] = dimensions;
  const shape = new THREE.Shape();
  const x = width / 2 - .022, z = depth / 2 - .022;
  shape.moveTo(-x, -z); shape.lineTo(x, -z); shape.lineTo(x, z); shape.lineTo(-x, z); shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: height - .04, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .022, bevelThickness: .02 });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -(height - .04) / 2, 0);
  return mesh(parent, geometry, surface, position, rotation);
}

function exchanger(parent, width, height, surface) {
  for (const y of [-height / 2, height / 2]) box(parent, [width + .025, .025, .07], surface, [0, y, 0]);
  for (const x of [-width / 2, width / 2]) box(parent, [.018, height, .07], surface, [x, 0, 0]);
  for (let i = 1; i < 17; i++) box(parent, [.006, height - .025, .055], surface, [-width / 2 + i * width / 17, 0, 0]);
  for (const y of [-height * .28, 0, height * .28]) cylinder(parent, .008, width, surface, [0, y, .035]);
}

export function createAssembly() {
  const root = assembly('cabin-seating-climate');
  const m = materials();
  const supports = part(root, 'body-supports', 'Cabin body supports', [0, .265, .08], [0, -.18, 0], 'The floor supports the seat runners; the front cabin structure supports the dashboard and air unit. Their structural connection is not an air or coolant route.');
  for (const side of [-1, 1]) {
    box(supports, [.48, .022, 1.3], m.green, [side * .36, 0, 0]);
    box(supports, [.055, .07, 1.3], m.green, [side * .65, .02, 0]);
  }
  for (const z of [-.38, .18]) box(supports, [1.25, .055, .07], m.metal, [0, .035, z]);
  beam(supports, [-.64, .44, .61], [.64, .44, .61], .026, m.metal);
  for (const side of [-1, 1]) {
    beam(supports, [side * .59, .035, .55], [side * .59, .44, .61], .023, m.green);
    box(supports, [.065, .08, .07], m.metal, [side * .23, .38, .61]);
  }

  const frame = part(root, 'seat-frame', 'Seat runners and frame', [.37, .34, -.015], [.44, 0, -.12], 'Two runners lock the seat to its chosen fore/aft position. Pivoting height links carry the spring-supported base frame; the height lever is manual. A separate motor drives backrest recline. The backrest frame and spring grille support its padding and integrated head restraint. Link geometry is illustrative.');
  for (const x of [-.145, .145]) {
    box(frame, [.035, .035, .5], m.metal, [x, 0, .01]);
    box(frame, [.026, .027, .4], m.dark, [x, .031, .01]);
    for (const z of [-.21, .22]) box(frame, [.06, .015, .045], m.dark, [x, -.022, z]);
    // Paired lifting links, not a crossed scissor mechanism.
    for (const z of [-.16, .14]) {
      beam(frame, [x, .025, z], [x, .11, z + .035], .012, m.dark);
      cylinder(frame, .017, .025, m.metal, [x, .025, z]);
    }
    box(frame, [.025, .025, .4], m.metal, [x, .11, .01]);
    beam(frame, [x, .12, -.22], [x, .65, -.34], .014, m.metal);
  }
  for (const z of [-.16, .16]) beam(frame, [-.17, .11, z], [.17, .11, z], .014, m.dark);
  beam(frame, [-.145, .65, -.34], [.145, .65, -.34], .014, m.metal);
  for (let i = 0; i < 5; i++) beam(frame, [-.13, .24 + i * .045, -.25 - i * .01], [.13, .24 + i * .045, -.25 - i * .01], .003, m.dark);
  cylinder(frame, .021, .065, m.black, [-.12, .16, -.22], [0, 0, 0]);
  tube(frame, [[.2, .12, -.16], [.13, .12, -.21], [-.1, .13, -.22]], .0035, m.black);
  for (let i = 0; i < 5; i++) tube(frame, [[-.155, .12, -.13 + i * .06], [-.08, .105, -.11 + i * .06], [0, .12, -.13 + i * .06], [.08, .105, -.11 + i * .06], [.155, .12, -.13 + i * .06]], .0045, m.metal);
  cylinder(frame, .035, .055, m.dark, [.18, .13, -.21]);
  beam(frame, [.19, .06, -.04], [.23, .09, .12], .008, m.black);
  box(frame, [.022, .017, .08], m.black, [.23, .09, .14]);

  const upholstery = part(root, 'seat-upholstery', 'Cushion and backrest', [.37, .49, -.015], [.36, .35, -.1], 'Shaped foam and upholstery spread support across the cushion and backrest. The head restraint is integrated into the backrest. The centre panels represent the standard Alcantara upholstery; colour alone does not identify the material or prove seat ventilation.');
  roundedPad(upholstery, [.43, .09, .49], m.tan, [0, 0, .015]);
  roundedPad(upholstery, [.29, .045, .37], m.dark, [0, .045, .025]);
  for (const side of [-1, 1]) roundedPad(upholstery, [.09, .11, .43], m.tan, [side * .182, .04, .015]);
  roundedPad(upholstery, [.43, .13, .58], m.tan, [0, .32, -.235], [Math.PI / 2 - .13, 0, 0]);
  roundedPad(upholstery, [.285, .04, .43], m.dark, [0, .31, -.16], [Math.PI / 2 - .13, 0, 0]);
  for (const side of [-1, 1]) sphere(upholstery, .09, m.tan, [side * .176, .31, -.19], [.65, 2.75, .9]);
  sphere(upholstery, .1, m.tan, [0, .64, -.295], [1.15, 1.5, .65]);

  const blower = part(root, 'inlet-blower', 'Inlet, filter and blower', [0, .73, .84], [-.38, .22, .26], 'Outside air enters near the windscreen base and passes through a filter. The electric blower supplies airflow; recirculation changes the inlet source. PET identifies the cowl filter housing and separate blower. The second inlet represents cabin recirculation; the inlet door, cage and motor position are illustrative.');
  box(blower, [.33, .03, .2], m.dark, [.02, .13, .02]);
  for (let i = 0; i < 15; i++) box(blower, [.015, .026, .18], m.tan, [-.13 + i * .021, .15, .02]);
  box(blower, [.19, .025, .25], m.black, [-.1, .015, -.04]);
  // Two inlet mouths meet at a schematic source-selection flap.
  box(blower, [.15, .11, .015], m.dark, [.16, .055, -.09]);
  box(blower, [.12, .07, .018], m.black, [.16, .055, -.103]);
  box(blower, [.13, .013, .1], m.metal, [.08, .045, -.035], [0, 0, .5]);
  cylinder(blower, .092, .13, m.dark, [-.22, -.035, -.03]);
  for (let i = 0; i < 24; i++) {
    const angle = i * Math.PI * 2 / 24;
    box(blower, [.13, .012, .025], m.metal, [-.22, -.035 + Math.cos(angle) * .09, -.03 + Math.sin(angle) * .09], [angle, 0, 0]);
  }
  cylinder(blower, .04, .055, m.black, [-.315, -.035, -.03]);
  tube(blower, [[-.17, .025, -.04], [-.09, -.005, -.1], [0, -.055, -.15]], .044, m.blue);

  const evap = part(root, 'evaporator', 'Evaporator and valve', [0, .65, .65], [.42, .15, .18], 'Refrigerant evaporates inside this exchanger, absorbing heat from the air. Condensation can remove moisture. The expansion valve meters refrigerant; condensed water has a separate drain.');
  exchanger(evap, .32, .25, m.metal);
  box(evap, [.065, .045, .045], m.warm, [.16, .16, .01]);
  for (const [x, surface] of [[.145, m.warm], [.18, m.blue]]) tube(evap, [[x, .16, .01], [x, .16, .08], [x + .07, .15, .12]], .007, surface);
  tube(evap, [[.02, -.13, -.01], [.02, -.2, 0], [.04, -.34, -.015]], .009, m.black);

  const heater = part(root, 'heater-bypass', 'Heater and bypass', [0, .65, .46], [-.28, .2, -.12], 'Engine coolant supplies heat inside the heater core. A parallel bypass lets air avoid that core; a temperature-flap motor changes the heating contribution. Coolant remains separate from cabin air and refrigerant.');
  const core = new THREE.Group(); core.position.x = .08; heater.add(core);
  exchanger(core, .18, .22, m.warm);
  for (const x of [.065, .11]) tube(heater, [[x, .12, 0], [x, .2, .02], [x + .04, .2, .1]], .009, m.warm);
  for (const x of [-.235, -.055]) box(heater, [.015, .25, .06], m.dark, [x, 0, 0]);
  for (const y of [-.125, .125]) box(heater, [.195, .015, .06], m.dark, [-.145, y, 0]);
  box(heater, [.16, .22, .01], m.blue, [-.145, 0, 0], [0, .55, 0]);
  box(heater, [.055, .045, .025], m.black, [-.26, -.055, -.035]);
  beam(heater, [-.25, -.055, -.035], [-.145, -.055, -.035], .005, m.metal);

  const ducts = part(root, 'outlet-ducts', 'Outlet ducts', [0, .8, .37], [0, .44, .2], 'Distribution flaps apportion air among the face vents, footwells and windscreen; combined delivery is possible. These destinations share the same air unit; the tube shapes are functional connections, not factory duct routing.');
  box(ducts, [.34, .1, .12], m.dark, [0, -.01, .005]);
  for (const side of [-1, 1]) {
    tube(ducts, [[side * .08, 0, 0], [side * .23, .04, .02], [side * .47, .035, .03], [side * .52, .025, -.035]], .035, m.blue);
    box(ducts, [.075, .055, .035], m.dark, [side * .52, .025, -.055]);
    tube(ducts, [[side * .08, .02, .04], [side * .17, .14, .14], [side * .24, .2, .28]], .027, m.blue);
    box(ducts, [.2, .025, .04], m.dark, [side * .24, .2, .29]);
    tube(ducts, [[side * .08, -.025, -.005], [side * .17, -.2, .025], [side * .28, -.4, .045]], .028, m.blue);
  }

  const refrigerant = part(root, 'refrigerant-connections', 'Refrigerant pipes and drier', [.25, .67, .68], [.48, -.06, .32], 'Pressure and suction connections cross the body separately from heater coolant and the condensate drain. Liquid refrigerant passes through the receiver-drier before the expansion valve; vapour returns towards the engine compressor. The front condensers and rear compressor lie beyond this cutaway. The drier removes moisture inside the refrigerant circuit, not from cabin air. These pipe bends and bracket positions are illustrative.');
  // Connector ends meet the two valve pipes in the assembled position.
  tube(refrigerant, [[-.035, .13, .09], [-.035, .13, .2], [.13, -.01, .31], [.16, -.01, .42]], .007, m.warm);
  cylinder(refrigerant, .031, .13, m.metal, [.16, -.075, .42], [0, 0, 0]);
  cylinder(refrigerant, .034, .015, m.dark, [.16, -.045, .42], [0, 0, 0]);
  tube(refrigerant, [[.16, -.01, .42], [.21, -.01, .42], [.22, -.07, .55]], .007, m.warm);
  tube(refrigerant, [[0, .13, .09], [.05, .09, .18], [.11, -.09, .2], [.08, -.27, -.12]], .01, m.blue);
  cylinder(refrigerant, .012, .025, m.metal, [.2, -.01, .42], [0, 0, 0]);
  box(refrigerant, [.027, .025, .027], m.black, [.2, .015, .42]);

  const coolant = part(root, 'coolant-pipes', 'Heater coolant pipes', [.16, .31, -.15], [0, -.15, -.22], 'A supply and return connect the front heater to the rear engine cooling circuit. The warmer supply gives up heat in the core, and coolant returns to the engine; neither pipe carries cabin air. Flexible hoses join the pipes at the front heater, and grommets seal their body passage.');
  for (const [offset, surface] of [[0, m.warm], [.045, m.blue]]) {
    tube(coolant, [[offset, .14, -.65], [offset, 0, -.45], [offset, -.01, .1], [offset, 0, .48], [offset, .31, .63], [offset - .055, .54, .71]], .011, surface);
    for (const z of [-.3, .12, .38]) cylinder(coolant, .014, .018, m.dark, [offset, 0, z], [Math.PI / 2, 0, 0]);
  }
  return root;
}
