import * as THREE from 'three';
import { assembly, part, materials, box, cylinder, tube, beam, sphere, mesh, annulus } from '../../../../interactive/three/component-geometry.js';

import { windscreenFrame, windscreenPoint } from '../../../../interactive/models/boxster/windscreen.js';
import { palette } from '../../../../interactive/models/boxster/surfaces.js';

export const config = {
  id: 'roof-explorer',
  title: 'From the car to the folding roof',
  location: 'The ordinary 2010 2.9 roof spans the cabin. Its drive, side linkages and stowage well sit behind the occupants, ahead of the rear boot.',
  overview: 'The manual front latch and centring journals meet the fixed header. Frame members support cloth and rigid heated glass; one motor drives both side gearboxes. Separate seals limit entry, while filtered side pans collect runoff.',
  assembled: 'This closed-roof cutaway places the supporting frame below the cloth, the rear glass in its aperture, and the drive beside the stowage well. The separate opening diagram explains their movement.',
  exploded: 'The cloth, frame, glass, seals, drive and collection areas separate for identification. This is a spatial breakdown, not a roof-opening position or a removal sequence. The rear glass remains one rigid pane.',
  focus: 'roof-frame',
  hideCarParts: ['windscreen-frame'],
  direction: [1.25, 0.9, 1.45],
  note: 'Ordinary powered roof, not the Spyder sunshield. Frame sections, bow count, pivots, hidden routing and all separations are illustrative. The frame is shown closed; the glass does not fold.',
  connections: [
    { from: 'header', to: 'roof-frame', label: 'Manual front latch retains the roof against the header', kind: 'mechanical' },
    { from: 'roof-frame', to: 'covering', label: 'Frame and bows establish the cloth enclosure shape', kind: 'structure' },
    { from: 'covering', to: 'rear-glass', label: 'The rear aperture holds a rigid heated glass pane', kind: 'structure' },
    { from: 'motor-shafts', to: 'side-drives', label: 'Two flexible shafts carry rotation to left and right gearboxes', kind: 'mechanical' },
    { from: 'side-drives', to: 'roof-frame', label: 'Levers and articulated rods move the folding frame', kind: 'mechanical' },
    { from: 'side-drives', to: 'cover-well', label: 'Side guide arms and rods coordinate the compartment cover', kind: 'mechanical' },
    { from: 'covering', to: 'drainage', label: 'Runoff reaching the wet collection areas can drain outside', kind: 'fluid' },
    { from: 'cover-well', to: 'drainage', label: 'Collection components manage water around the roof compartment', kind: 'fluid' },
    { from: 'roof-frame', to: 'roof-seals', label: 'Retaining strips hold the separate roof seals against the frame', kind: 'structure' },
    { from: 'cover-well', to: 'roof-seals', label: 'The compartment has a separate perimeter seal and drainage hoses', kind: 'structure' },
  ],
};

function panel(parent, vertices, surface) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flat(), 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return mesh(parent, geometry, surface);
}

function roofSurface(u, t) {
  const front = windscreenPoint(u, 1), halfWidth = .649 - t * .119;
  const edgeHeight = 1.155 + Math.sin(t * Math.PI) * .055 + t * .05;
  return [(u * 2 - 1) * halfWidth, (1 - t) * (front[1] + .024) + t * edgeHeight + Math.sin(u * Math.PI) * .04 * t, (1 - t) * front[2] - t * .62];
}

function clothSurface(parent, surface) {
  // A curved upper sheet, open rear aperture, and side quarters. Counts and
  // seams are schematic; the mesh never animates a false folding-glass motion.
  const vertices = [], indices = [];
  const rows = 10, columns = 20;
  for (let row = 0; row <= rows; row++) {
    const t = row / rows;
    for (let column = 0; column <= columns; column++) {
      const u = column / columns;
      vertices.push(...roofSurface(u, t));
      if (row < rows && column < columns) {
        const a = row * (columns + 1) + column;
        indices.push(a, a + 1, a + columns + 2, a, a + columns + 2, a + columns + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  mesh(parent, geometry, surface);
  const rear = (x, t) => [x, 1.205 - t * .36, -.62 - t * .38];
  panel(parent, [rear(-.53, 0), rear(.53, 0), rear(.45, .2), rear(-.45, .2)], surface);
  panel(parent, [rear(-.45, .8), rear(.45, .8), rear(.53, 1), rear(-.53, 1)], surface);
  panel(parent, [rear(-.53, .2), rear(-.385, .2), rear(-.385, .8), rear(-.53, .8)], surface);
  panel(parent, [rear(.385, .2), rear(.53, .2), rear(.53, .8), rear(.385, .8)], surface);
  for (const side of [-1, 1]) panel(parent, [[side * .55, 1.18, -.4], [side * .53, 1.205, -.62], [side * .53, .845, -1], [side * .62, .81, -.76]], surface);
}

export function createAssembly() {
  const root = assembly('ordinary-roof-assembly'), m = materials();
  const fabric = new THREE.MeshStandardMaterial({ color: '#353b3d', roughness: .95, side: THREE.DoubleSide });
  const lining = new THREE.MeshStandardMaterial({ color: '#b5aa96', roughness: .95, side: THREE.DoubleSide });
  const header = part(root, 'header', 'Windscreen header', [0, 0, 0], [0, .1, .4], 'The fixed metal windscreen frame provides the roof’s front contact and latch receiver. Glass and trim are omitted so the header and its relationship to the front roof edge remain visible.');
  windscreenFrame(header, palette());
  box(header, [.065, .022, .035], m.metal, [0, 1.16, .12]);

  const frame = part(root, 'roof-frame', 'Frame and front latch', [0, 0, 0], [0, .3, 0], 'Articulated side members and bows support the roof. A manual catch and paired centring journals travel with its front edge: the journals locate it at the fixed header and the catch retains it. Bow count and joint geometry are illustrative.');
  for (const side of [-1, 1]) {
    const edge = t => roofSurface(side > 0 ? 1 : 0, t).map((n, axis) => n - (axis === 1 ? .024 : 0));
    const points = [edge(0), edge(.45), edge(.85), [side * .52, .98, -.77], [side * .56, .76, -.87]];
    for (let i = 0; i < points.length - 1; i++) beam(frame, points[i], points[i + 1], .018, m.metal);
    for (const point of points.slice(1, -1)) cylinder(frame, .028, .035, m.warm, point);
  }
  for (const t of [0, .45, .85]) tube(frame, Array.from({ length: 61 }, (_, i) => roofSurface(i / 60, t).map((n, axis) => n - (axis === 1 ? .022 : 0))), .016, m.metal);
  box(frame, [.15, .022, .04], m.dark, [0, 1.17, .115]);
  cylinder(frame, .015, .13, m.metal, [0, 1.15, .115]);
  beam(frame, [0, 1.15, .115], [0, 1.12, .045], .012, m.black);
  tube(frame, [[0, 1.155, .10], [0, 1.17, .14], [0, 1.185, .14], [0, 1.185, .12]], .008, m.warm);
  for (const side of [-1, 1]) beam(frame, [side * .45, 1.166, .115], [side * .45, 1.166, .15], .012, m.warm);

  const covering = part(root, 'covering', 'Fabric and lining', [0, 0, 0], [0, .68, .04], 'The outer covering and moulded headliner are separate parts. Tension wires guide the cloth edges; these do not rotate like the motor’s drive shafts. The rear opening accommodates a rigid pane. Cloth edges, wire paths and seams are simplified.');
  clothSurface(covering, fabric);
  panel(covering, [[-.49, 1.17, .10], [.49, 1.17, .10], [.46, 1.2, -.49], [-.46, 1.2, -.49]], lining);
  for (const side of [-1, 1]) tube(covering, [...Array.from({ length: 31 }, (_, i) => roofSurface(side > 0 ? 1 : 0, i / 30)), [side * .53, .845, -1]], .005, m.black);

  const glass = part(root, 'rear-glass', 'Rigid heated rear glass', [0, 0, 0], [0, .17, -.44], 'The rear window stays one rigid pane while the surrounding roof folds. Its separate heating loom supplies resistance elements, independently of the roof motor. Element pattern and the short wire shown are illustrative, not factory wiring or routing.');
  const glassPoint = (x, t) => [x, 1.205 - t * .36, -.62 - t * .38 - .003];
  panel(glass, [glassPoint(-.385, .2), glassPoint(.385, .2), glassPoint(.385, .8), glassPoint(-.385, .8)], m.glass);
  tube(glass, [glassPoint(-.385, .2), glassPoint(.385, .2), glassPoint(.385, .8), glassPoint(-.385, .8), glassPoint(-.385, .2)], .009, m.black);
  for (let i = 0; i < 7; i++) beam(glass, glassPoint(-.36, .27 + i * .075), glassPoint(.36, .27 + i * .075), .0014, m.warm);
  for (const side of [-1, 1]) beam(glass, glassPoint(side * .36, .24), glassPoint(side * .36, .76), .004, m.warm);
  tube(glass, [glassPoint(.36, .73), [.43, .9, -.95], [.51, .84, -.99]], .005, m.black);
  box(glass, [.025, .015, .03], m.dark, [.51, .84, -.99]);

  const motor = part(root, 'motor-shafts', 'Motor and two shafts', [0, .72, -1.06], [0, -.25, -.15], 'One reversible electric motor supplies both sides. Two flexible rotary shafts transmit its turning motion to separate gearboxes; they are not pull cables. Their visible curves identify connectivity rather than the installed route.');
  cylinder(motor, .045, .19, m.dark, [0, 0, 0]);
  box(motor, [.13, .065, .07], m.metal, [0, -.035, .045]);
  for (const side of [-1, 1]) {
    cylinder(motor, .018, .04, m.warm, [side * .115, 0, 0]);
    tube(motor, [[side * .125, 0, 0], [side * .31, .02, .025], [side * .48, .015, .16], [side * .57, .025, .23]], .013, m.black);
    cylinder(motor, .02, .035, m.metal, [side * .57, .025, .23]);
  }

  const drives = part(root, 'side-drives', 'Side gearboxes and rods', [0, 0, 0], [0, -.16, .4], 'Each side gearbox reduces speed and drives levers with jointed rods. These paths move the folding frame and compartment cover together. Left and right must remain coordinated; the displayed pivots are not setting positions.');
  for (const side of [-1, 1]) {
    const x = side * .57, y = .745, z = -.83;
    cylinder(drives, .085, .035, m.dark, [x, y, z]);
    cylinder(drives, .055, .04, m.metal, [x, y, z]);
    cylinder(drives, .021, .05, m.warm, [x, y, z]);
    box(drives, [.055, .075, .055], m.dark, [x, y + .035, z - .06]);
    const pivot = [x + side * .035, y, z];
    const frontEnd = [x + side * .035, y + .035, z + .115];
    const rearEnd = [x + side * .035, y + .1, z - .125];
    beam(drives, frontEnd, pivot, .014, m.warm);beam(drives, pivot, rearEnd, .014, m.warm);
    beam(drives, frontEnd, [side * .56, .76, -.87], .009, m.metal);
    beam(drives, rearEnd, [side * .6, .81, -1.27], .009, m.metal);
    for (const point of [pivot, frontEnd, rearEnd, [side * .56, .76, -.87], [side * .6, .81, -1.27]]) sphere(drives, .018, m.warm, point);
    beam(drives, [side * .63, .79, -.87], [side * .61, .8, -1.1], .015, m.green);
  }

  const well = part(root, 'cover-well', 'Cover and stowage well', [0, .61, -1.1], [0, .03, -.54], 'The moving compartment cover conceals a well immediately behind the occupants. It is separate from the rear boot lid. The well is shown as an open cutaway; the folded roof is not represented inside this closed-roof view.');
  box(well, [1.22, .025, .43], m.black, [0, -.015, 0]);
  for (const side of [-1, 1]) box(well, [.025, .15, .43], m.dark, [side * .61, .045, 0]);
  box(well, [1.22, .15, .025], m.dark, [0, .045, -.215]);
  for (const side of [-1, 1]) panel(well, [[side * .48, .19, .17], [side * .69, .18, .17], [side * .69, .18, -.25], [side * .48, .19, -.25]], m.green);
  panel(well, [[-.69, .18, -.25], [.69, .18, -.25], [.59, .205, -.39], [-.59, .205, -.39]], m.green);
  for (const side of [-1, 1]) beam(well, [side * .57, .11, -.17], [side * .6, .2, -.27], .012, m.metal);

  const drains = part(root, 'drainage', 'Side pans and drains', [0, 0, 0], [0, -.32, .05], 'Left and right drip pans have separate filter elements and drain pipes. The filters intercept debris but still need inspection and cleaning. Separate drive-area drain plates and compartment-seal hoses also appear in PET. These simplified drops do not map all concealed routes.');
  for (const side of [-1, 1]) {
    const x = side * .66;
    const floor = new THREE.Shape();
    floor.moveTo(-.08, -.225);floor.lineTo(.08, -.225);floor.lineTo(.08, .225);floor.lineTo(-.08, .225);floor.closePath();
    const outlet = new THREE.Path();outlet.absarc(0, .15, .019, 0, Math.PI * 2, true);floor.holes.push(outlet);
    const panFloor = new THREE.ExtrudeGeometry(floor, { depth: .015, bevelEnabled: false, curveSegments: 24 });
    panFloor.rotateX(-Math.PI / 2);
    mesh(drains, panFloor, m.blue, [x, .6725, -.84]);
    for (const edge of [-1, 1]) box(drains, [.015, .065, .45], m.blue, [x + edge * .075, .71, -.84]);
    box(drains, [.16, .065, .015], m.blue, [x, .71, -.615]);
    annulus(drains, .028, .018, .03, m.dark, [x, .66, -.99]).rotation.set(-Math.PI / 2, 0, 0);
    // Open filter grille above the outlet: water can pass through its gaps.
    annulus(drains, .035, .029, .008, m.dark, [x, .7, -.99]).rotation.set(-Math.PI / 2, 0, 0);
    for (const offset of [-.016, 0, .016]) {
      beam(drains, [x - .025, .702, -.99 + offset], [x + .025, .702, -.99 + offset], .002, m.metal);
      beam(drains, [x + offset, .702, -1.015], [x + offset, .702, -.965], .002, m.metal);
    }
    tube(drains, [[x, .66, -.99], [x + side * .02, .53, -1.02], [x + side * .035, .34, -1.05], [x + side * .055, .24, -1.08]], .016, m.black);
  }

  const seals = part(root, 'roof-seals', 'Roof and compartment seals', [0, 0, 0], [.25, .18, .22], 'Separate roof-frame, B-pillar and roof-arch seals meet neighbouring surfaces; retaining strips hold them to the frame. The stowage box has its own seal. Contact paths are schematic, with no seal profile, adjustment dimension or concealed drainage route implied.');
  tube(seals, Array.from({ length: 61 }, (_, i) => windscreenPoint(i / 60, 1).map((n, axis) => n - (axis === 1 ? .008 : 0))), .013, m.black);
  for (const side of [-1, 1]) {
    tube(seals, Array.from({ length: 31 }, (_, i) => roofSurface(side > 0 ? 1 : 0, i / 30 * .85).map((n, axis) => n - (axis === 1 ? .034 : 0))), .012, m.black);
    tube(seals, [[side * .55, 1.165, -.4], [side * .52, .98, -.77], [side * .56, .8, -.87]], .016, m.black);
  }
  tube(seals, [[-.56, .82, -.87], [-.3, .83, -1.01], [0, .83, -1.05], [.3, .83, -1.01], [.56, .82, -.87]], .012, m.black);
  tube(seals, [[-.62, .78, -.93], [-.62, .78, -1.31], [0, .79, -1.36], [.62, .78, -1.31], [.62, .78, -.93]], .011, m.black);
  return root;
}
