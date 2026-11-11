import * as THREE from 'three';
import {
  assembly, part, materials, box, cylinder, tube, beam, mesh, group,
} from '../../../../interactive/three/component-geometry.js';

import { windscreenFrame } from '../../../../interactive/models/boxster/windscreen.js';
import { seat, hoopOutline, hoopDepth } from '../../../../interactive/models/boxster/seats.js';
import { steeringWheel } from '../../../../interactive/models/boxster/cabin.js';
import { palette } from '../../../../interactive/models/boxster/surfaces.js';

export const config = {
  id: 'protection-explorer',
  title: 'From the car to occupant protection',
  location: 'The 2010 2.9 places its occupants between the reinforced windscreen frame and two fixed rear bars. Belts, seat and door modules surround the two seats; front modules sit in the wheel and dashboard.',
  overview: 'Follow structural supports and the three-point belt anchorages, then distinguish two front, two seat-thorax and two door-head airbag modules. The bags stay folded inside their housings.',
  assembled: 'The seats locate the occupants within the fixed structure. Upper belt guides attach to the joined rear-bar assembly; outer lower anchors attach to the body and inboard buckles mount to the seats. Airbag modules occupy separate front, seat and door positions.',
  exploded: 'The display separates structural, belt and module groups to reveal their locations. The offsets are not deployment motion or a removal sequence; the rear bars remain fixed members and all six bags stay stowed.',
  focus: 'belt-system',
  hideCarParts: ['driver-seat', 'passenger-seat', 'seat-belt-1', 'seat-belt--1', 'roll-hoop-1', 'roll-hoop--1', 'windscreen-frame', 'tan-steering-wheel', 'steering-column-context', 'chassis'],
  direction: [1.3, 1.05, 1.65],
  note: 'The pictured front-module layout is left-hand drive; UK right-hand-drive positions are reversed. Housings, connectors and mount positions are schematic; trim is cut away. No crash, deployment threshold, belt load or rollover clearance is predicted. The rear bars have no pop-up movement.',
  connections: [
    { from: 'passenger-cell', to: 'windscreen-frame', label: 'Metal frame continues into the front passenger-cell structure', kind: 'structure' },
    { from: 'passenger-cell', to: 'rear-bars', label: 'Fixed rear supports join the body behind the seats', kind: 'structure' },
    { from: 'passenger-cell', to: 'seats', label: 'Seat runners transmit support loads into the floor', kind: 'structure' },
    { from: 'passenger-cell', to: 'belt-system', label: 'Outer lower anchors and retractor supports carry belt loads into the body', kind: 'structure' },
    { from: 'seats', to: 'belt-system', label: 'Inboard belt buckles mount to the seat structure', kind: 'structure' },
    { from: 'rear-bars', to: 'belt-system', label: 'The upper belt anchorage points attach to the bars', kind: 'structure' },
    { from: 'passenger-cell', to: 'front-modules', label: 'Steering-wheel and dashboard supports carry the front modules', kind: 'structure' },
    { from: 'seats', to: 'seat-modules', label: 'Outer backrest bolsters carry the thorax modules', kind: 'structure' },
    { from: 'passenger-cell', to: 'door-modules', label: 'Door structures carry the head modules beside the occupants', kind: 'structure' },
  ],
};

function ribbon(parent, start, end, surface, width = 0.037) {
  const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
  const along = b.clone().sub(a).normalize();
  const across = along.clone().cross(new THREE.Vector3(0, 0, 1)).normalize();
  const normal = across.clone().cross(along).normalize();
  const result = mesh(parent, new THREE.BoxGeometry(width, a.distanceTo(b), 0.004), surface, a.clone().add(b).multiplyScalar(0.5).toArray());
  result.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(across, along, normal));
  return result;
}

function foldedModule(parent, surface, frame, position, dimensions, internalInflator = true) {
  const [width, height, depth] = dimensions;
  const module = group('stowed-airbag-module', parent, position);
  module.userData.kind = 'stowed-airbag-module';
  // Open-sided housing exposes a small folded pack, never an inflated cushion.
  box(module, [width, height, 0.012], frame, [0, 0, -depth / 2]);
  for (const side of [-1, 1]) box(module, [0.012, height, depth], frame, [side * width / 2, 0, 0]);
  for (let i = 0; i < 5; i++) box(module, [width * 0.75, height * 0.12, depth * 0.65], surface, [0, (i - 2) * height * 0.14, 0]);
  if (internalInflator) cylinder(module, Math.min(width, height) * 0.18, width * 0.7, frame, [0, -height * 0.36, depth * 0.18]);
  // Connector identifies the separate electrical interface, without a pinout.
  box(module, [0.018, 0.018, 0.022], frame, [0, -height * 0.55, -depth * 0.35]);
}

export function createAssembly() {
  const root = assembly('occupant-protection-assembly');
  const p = materials();
  const cell = part(root, 'passenger-cell', 'Body supports', [0, 0.28, 0.1], [0, -0.26, 0], 'Floor, side and transverse structures carry the seats, restraint anchorages and cabin hardware. This open support view omits most sheet metal and trim; it is not a factory joint or repair map.');
  box(cell, [1.3, 0.028, 1.45], p.metal);
  for (const side of [-1, 1]) {
    box(cell, [0.1, 0.14, 1.45], p.green, [side * 0.69, 0.04, 0]);
    beam(cell, [side * 0.7, 0.06, -0.5], [side * 0.7, 0.23, 0.65], 0.023, p.green);
    box(cell, [0.07, 0.05, 0.08], p.metal, [side * 0.65, 0.075, -0.54]);
  }
  for (const z of [-0.63, -0.2, 0.24, 0.7]) box(cell, [1.4, 0.055, 0.075], p.green, [0, 0.04, z]);
  box(cell, [1.3, 0.06, 0.12], p.dark, [0, 0.42, 0.63]);

  const frame = part(root, 'windscreen-frame', 'Reinforced windscreen frame', [0, 0, 0], [0, 0.25, 0.42], 'A steel reinforcement is integrated into the windscreen frame. The shared outer envelope locates this fixed support. Its internal reinforcement and trim layers are not separately sectioned; the glass stays with the fading car context.');
  windscreenFrame(frame, palette());

  const bars = part(root, 'rear-bars', 'Fixed rear bars', [0, 0, 0], [0, 0.3, -0.4], 'The two high-strength steel hoops and their cross-member form one fixed roll-bar assembly, bolted to the body behind the seats. Upper belt guides and retractor supports attach to its outer sides. It is separate from decorative covers and has no sensor-triggered extension.');
  beam(bars, [-.56, .65, -.61], [.56, .65, -.61], .026, p.green);
  for (const side of [-1, 1]) {
    const x = side * .345;
    tube(bars, hoopOutline.map(([dx, y]) => [x + dx, y, hoopDepth(y)]), .018, p.green);
    for (const dx of [-.192, .192]) {
      beam(bars, [x + dx, .65, -.61], [x + dx, .745, hoopDepth(.745)], .018, p.green);
      box(bars, [.09, .04, .1], p.metal, [x + dx, .65, -.61]);
    }
    box(bars, [.035, .25, .1], p.green, [side * .537, .78, -.615]);
    box(bars, [.07, .075, .025], p.metal, [side * .537, 1.005, -.639]);
    cylinder(bars, .027, .03, p.warm, [side * .537, 1.005, -.639], [Math.PI / 2, 0, 0]);
  }

  const seats = part(root, 'seats', 'Seats and runners', [0, 0, 0], [0, 0.04, 0.36], 'Seat frames and runners support and position both occupants. Their backrests carry the thorax airbag modules; cushion, backrest and floor relationships determine where the belts lie relative to the body.');
  for (const side of [-1, 1]) {
    seat(seats, palette(), side, { belt: false });
    for (const dx of [-.145, .145]) box(seats, [.035, .035, .5], p.dark, [side * .345 + dx, .31, -.115]);
  }

  const belts = part(root, 'belt-system', 'Three-point belts', [0, 0, 0], [0, 0.23, 0.08], 'Each belt runs from its retractor through the rear-bar upper guide, diagonally to a seat-mounted inner buckle and across the pelvis to the lower outer body anchorage. The separate latch stalk follows the seat. Pretensioning and force limiting are functions of the restraint system; their hidden internals are not modelled.');
  for (const side of [-1, 1]) {
    const upper = [side * .537, 1.005, -.639];
    const buckle = [side * .107, .48, -.25];
    const outer = [side * .56, .49, -.1];
    const lower = [side * .60, .45, -.65];
    ribbon(belts, lower, upper, p.dark);
    ribbon(belts, upper, buckle, p.dark);
    ribbon(belts, buckle, outer, p.dark);
    ribbon(belts, outer, [side * 0.65, 0.36, -0.16], p.dark);
    box(belts, [0.054, 0.08, 0.04], p.black, buckle);
    box(belts, [0.032, 0.022, 0.044], p.red, [buckle[0], buckle[1] + 0.034, buckle[2] + 0.003]);
    beam(belts, [side * 0.16, 0.39, -0.05], [buckle[0], buckle[1] - 0.035, buckle[2]], 0.014, p.dark);
    cylinder(belts, 0.022, 0.025, p.metal, [side * 0.16, 0.39, -0.05], [0, 0, Math.PI / 2]);
    box(belts, [0.1, 0.12, 0.08], p.metal, lower);
    cylinder(belts, 0.035, 0.074, p.dark, lower);
    cylinder(belts, 0.02, 0.016, p.warm, upper, [Math.PI / 2, 0, 0]);
  }

  const fronts = part(root, 'front-modules', 'Two front modules', [0, 0, 0], [0, 0.2, 0.66], 'The steering-wheel centre carries one front airbag, with the steering contact unit behind it. A bracket on the dashboard support carries the passenger module. This left-hand-drive schematic reverses the two positions relative to a UK right-hand-drive car. Both packs stay folded; separation is not deployment.');
  steeringWheel(fronts, palette());
  mesh(fronts, new THREE.TorusGeometry(.064, .017, 8, 28), p.black, [.345, .805, .235], [-.28, 0, 0]);
  foldedModule(fronts, p.tan, p.metal, [.345, .795, .19], [.1, .08, .04]);
  foldedModule(fronts, p.tan, p.metal, [-.35, .76, .46], [.26, .13, .11]);
  for (const x of [-.44, -.26]) {
    beam(fronts, [x, .695, .46], [x, .60, .51], .012, p.metal);
    cylinder(fronts, .011, .025, p.dark, [x, .695, .46]);
  }
  box(fronts, [.3, .02, .06], p.metal, [-.35, .60, .51]);

  const thorax = part(root, 'seat-modules', 'Two thorax modules', [0, .77, -.397], [0, 0.47, -0.06], 'Each thorax airbag is a separate module with a carrier and fasteners on the outer backrest frame, beneath the bolster covering. A dedicated seat wire set supplies its electrical connection. The compact packs remain folded. Sports bucket seats use their own module variants; this view shows ordinary seats.');
  for (const side of [-1, 1]) {
    foldedModule(thorax, p.tan, p.metal, [side * .535, 0, 0], [0.065, 0.22, 0.075]);
    box(thorax, [0.025, 0.27, 0.045], p.dark, [side * .55, 0, -.015]);
    for (const y of [-0.09, 0.09]) cylinder(thorax, 0.011, 0.03, p.metal, [side * .55, y, -0.035], [Math.PI / 2, 0, 0]);
  }

  const heads = part(root, 'door-modules', 'Two door head modules', [0, 0.65, 0.1], [0, 0.28, 0], 'A separate head airbag is carried in each door. Together with the two seat-thorax bags, these four modules are the airbag part of POSIP; the doors also have side-impact protection elements. This view cuts away the door trim; it does not substitute roof curtains or predict which side deploys.');
  for (const side of [-1, 1]) {
    box(heads, [0.028, 0.22, 0.54], p.green, [side * 0.735, -0.055, 0]);
    foldedModule(heads, p.tan, p.metal, [side * 0.71, 0.01, 0], [0.07, 0.15, 0.3], false);
    // PET 403-006 item 6 shows a long pack and a separate cylindrical inflator.
    cylinder(heads, 0.021, 0.2, p.metal, [side * 0.69, -0.1, -0.01], [Math.PI / 2, 0, 0]);
    tube(heads, [[side * 0.69, -0.1, 0.09], [side * 0.69, -0.06, 0.15], [side * 0.71, 0.01, 0.15]], 0.007, p.metal);
    for (const z of [-0.17, 0.17]) box(heads, [0.08, 0.025, 0.04], p.metal, [side * 0.7, -0.09, z]);
  }
  return root;
}
