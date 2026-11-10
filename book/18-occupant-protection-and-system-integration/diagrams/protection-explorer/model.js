import * as THREE from 'three';
import {
  assembly, part, materials, box, cylinder, tube, beam, mesh, group,
} from '../../../../interactive/three/component-geometry.js';

export const config = {
  id: 'protection-explorer',
  title: 'From the car to occupant protection',
  location: 'The 2010 2.9 places its occupants between the reinforced windscreen frame and two fixed rear bars. Belts, seat and door modules surround the two seats; front modules sit in the wheel and dashboard.',
  overview: 'Follow structural supports and the three-point belt anchorages, then distinguish two front, two seat-thorax and two door-head airbag modules. The bags stay folded inside their housings.',
  assembled: 'The seats locate the occupants within the fixed structure. Upper belt guides attach to the rear bars; lower anchorage and buckle regions complete each three-point path. Airbag modules occupy separate front, seat and door positions.',
  exploded: 'The display separates structural, belt and module groups to reveal their locations. The offsets are not deployment motion or a removal sequence; the rear bars remain fixed members and all six bags stay stowed.',
  focus: 'belt-system',
  hideCarParts: ['interior', 'chassis'],
  direction: [1.3, 1.05, 1.65],
  note: 'Module housings and mount positions are schematic; trim is cut away. No crash, deployment threshold, belt load or rollover clearance is predicted. The fixed rear bars have no pop-up movement.',
  connections: [
    { from: 'passenger-cell', to: 'windscreen-frame', label: 'Metal frame continues into the front passenger-cell structure', kind: 'structure' },
    { from: 'passenger-cell', to: 'rear-bars', label: 'Fixed rear supports join the body behind the seats', kind: 'structure' },
    { from: 'passenger-cell', to: 'seats', label: 'Seat runners transmit support loads into the floor', kind: 'structure' },
    { from: 'passenger-cell', to: 'belt-system', label: 'Lower anchorage regions carry belt loads into the body', kind: 'structure' },
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

function foldedModule(parent, surface, frame, position, dimensions) {
  const [width, height, depth] = dimensions;
  const module = group('stowed-airbag-module', parent, position);
  module.userData.kind = 'stowed-airbag-module';
  // Open-sided housing exposes a small folded pack, never an inflated cushion.
  box(module, [width, height, 0.012], frame, [0, 0, -depth / 2]);
  for (const side of [-1, 1]) box(module, [0.012, height, depth], frame, [side * width / 2, 0, 0]);
  for (let i = 0; i < 5; i++) box(module, [width * 0.75, height * 0.12, depth * 0.65], surface, [0, (i - 2) * height * 0.14, 0]);
  cylinder(module, Math.min(width, height) * 0.18, width * 0.7, frame, [0, -height * 0.36, depth * 0.18]);
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

  const frame = part(root, 'windscreen-frame', 'Reinforced windscreen frame', [0, 0.6, 0.85], [0, 0.25, 0.42], 'A steel reinforcement is integrated into the windscreen frame. Glass and decorative trim are omitted so the fixed metal support can be distinguished from the fabric-roof frame.');
  tube(frame, [[-0.68, 0, 0], [-0.63, 0.23, -0.14], [-0.55, 0.52, -0.36], [0, 0.57, -0.4], [0.55, 0.52, -0.36], [0.63, 0.23, -0.14], [0.68, 0, 0]], 0.028, p.green);
  beam(frame, [-0.68, 0, 0], [0.68, 0, 0], 0.026, p.green);

  const bars = part(root, 'rear-bars', 'Fixed rear bars', [0, 0.55, -0.51], [0, 0.3, -0.4], 'Two high-strength steel bars stand permanently behind the seats. Their upper belt anchorages carry the shoulder-belt route. These are fixed supports, not sensor-triggered extendable hoops.');
  beam(bars, [-0.68, 0, 0], [0.68, 0, 0], 0.026, p.green);
  for (const side of [-1, 1]) {
    const x = side * 0.37;
    tube(bars, [[x - 0.2, 0, 0], [x - 0.2, 0.47, 0], [x - 0.14, 0.57, 0], [x + 0.14, 0.57, 0], [x + 0.2, 0.47, 0], [x + 0.2, 0, 0]], 0.027, p.green);
    for (const dx of [-0.2, 0.2]) box(bars, [0.09, 0.04, 0.1], p.metal, [x + dx, 0, 0]);
    cylinder(bars, 0.027, 0.03, p.warm, [side * 0.57, 0.47, 0], [Math.PI / 2, 0, 0]);
  }

  const seats = part(root, 'seats', 'Seats and runners', [0, 0.33, -0.04], [0, 0.04, 0.36], 'Seat frames and runners support and position both occupants. Their backrests carry the thorax airbag modules; cushion, backrest and floor relationships determine where the belts lie relative to the body.');
  for (const side of [-1, 1]) {
    const x = side * 0.36;
    for (const dx of [-0.15, 0.15]) box(seats, [0.035, 0.035, 0.5], p.dark, [x + dx, 0, 0.02]);
    box(seats, [0.4, 0.035, 0.45], p.metal, [x, 0.045, 0.01]);
    box(seats, [0.4, 0.11, 0.42], p.tan, [x, 0.12, 0.04]);
    box(seats, [0.38, 0.49, 0.11], p.tan, [x, 0.41, -0.17], [-0.13, 0, 0]);
    box(seats, [0.24, 0.16, 0.1], p.tan, [x, 0.72, -0.22], [-0.13, 0, 0]);
    for (const dx of [-0.2, 0.2]) box(seats, [0.045, 0.43, 0.12], p.tan, [x + dx, 0.39, -0.15], [-0.13, 0, 0]);
    cylinder(seats, 0.026, 0.035, p.dark, [x + side * 0.19, 0.15, -0.17]);
    beam(seats, [x - 0.16, 0.06, -0.19], [x - 0.16, 0.58, -0.25], 0.015, p.dark);
    beam(seats, [x + 0.16, 0.06, -0.19], [x + 0.16, 0.58, -0.25], 0.015, p.dark);
  }

  const belts = part(root, 'belt-system', 'Three-point belts', [0, 0, 0], [0, 0.23, 0.08], 'Each belt runs from an outer upper guide diagonally to the inner buckle, then across the pelvis to its lower outer anchorage. A retractor permits normal movement; pretensioning and force limiting have separate roles.');
  for (const side of [-1, 1]) {
    const upper = [side * 0.57, 1.02, -0.51];
    const buckle = [side * 0.145, 0.54, 0.1];
    const outer = [side * 0.59, 0.53, 0.13];
    const lower = [side * 0.65, 0.38, -0.4];
    ribbon(belts, lower, upper, p.dark);
    ribbon(belts, upper, buckle, p.dark);
    ribbon(belts, buckle, outer, p.dark);
    ribbon(belts, outer, [side * 0.65, 0.36, -0.16], p.dark);
    box(belts, [0.054, 0.08, 0.04], p.black, buckle);
    box(belts, [0.032, 0.022, 0.044], p.red, [buckle[0], buckle[1] + 0.034, buckle[2] + 0.003]);
    box(belts, [0.1, 0.12, 0.08], p.metal, lower);
    cylinder(belts, 0.035, 0.074, p.dark, lower);
    cylinder(belts, 0.02, 0.016, p.warm, upper, [Math.PI / 2, 0, 0]);
  }

  const fronts = part(root, 'front-modules', 'Two front modules', [0, 0.77, 0.5], [0, 0.2, 0.66], 'One front airbag is housed in the steering-wheel centre; the other is in the passenger dashboard. Both packs are shown folded. Deployment depends on the assessed event and is not represented by this separation.');
  beam(fronts, [0.36, 0.03, -0.07], [0.36, -0.07, 0.23], 0.024, p.dark);
  mesh(fronts, new THREE.TorusGeometry(0.135, 0.018, 12, 40), p.dark, [0.36, 0.03, -0.07], [0.2, 0, 0]);
  for (const end of [[0.235, 0.03, -0.07], [0.485, 0.03, -0.07], [0.36, -0.095, -0.045]]) beam(fronts, [0.36, 0.03, -0.07], end, 0.013, p.metal);
  cylinder(fronts, 0.068, 0.065, p.dark, [0.36, 0.03, -0.07], [Math.PI / 2 + 0.2, 0, 0]);
  foldedModule(fronts, p.tan, p.metal, [0.36, 0.035, -0.03], [0.1, 0.08, 0.04]);
  foldedModule(fronts, p.tan, p.metal, [-0.35, 0, 0.08], [0.26, 0.13, 0.11]);

  const thorax = part(root, 'seat-modules', 'Two thorax modules', [0, 0.73, -0.19], [0, 0.47, -0.06], 'A thorax airbag module is contained in each outer seat-backrest bolster. The two compact folded packs are separated from the upholstery here to reveal their location; they are not door airbags.');
  for (const side of [-1, 1]) {
    foldedModule(thorax, p.tan, p.metal, [side * 0.565, 0, 0], [0.065, 0.22, 0.075]);
    box(thorax, [0.025, 0.27, 0.045], p.dark, [side * 0.59, 0, -0.055]);
  }

  const heads = part(root, 'door-modules', 'Two door head modules', [0, 0.65, 0.1], [0, 0.28, 0], 'A separate head airbag is carried in each door. Together with the two seat-thorax bags, these four modules are the airbag part of POSIP; the doors also have side-impact protection elements. This view cuts away the door trim; it does not substitute roof curtains or predict which side deploys.');
  for (const side of [-1, 1]) {
    box(heads, [0.028, 0.22, 0.54], p.green, [side * 0.735, -0.055, 0]);
    foldedModule(heads, p.tan, p.metal, [side * 0.71, 0.01, 0], [0.07, 0.15, 0.3]);
    for (const z of [-0.17, 0.17]) box(heads, [0.08, 0.025, 0.04], p.metal, [side * 0.7, -0.09, z]);
  }
  return root;
}
