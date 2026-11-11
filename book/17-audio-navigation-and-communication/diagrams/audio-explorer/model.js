import * as THREE from 'three';
import {
  assembly, part, materials, group, box, cylinder, annulus, mesh, beam, tube,
} from '../../../../interactive/three/component-geometry.js';

import { radioUnit } from '../../../../interactive/models/boxster/radio.js';
import { windscreenPoint, windscreenGlass } from '../../../../interactive/models/boxster/windscreen.js';

export const config = {
  id: 'audio-explorer',
  title: 'From the car to the audio system',
  location: 'The standard 2010 2.9 has CDR-30 in the centre console, two tweeters on the dashboard and one woofer in each door. The radio aerial and its signal amplifier supply reception; vehicle power supplies the audio output stages.',
  overview: 'Follow radio or CD information into the head unit, then speaker-driving current from its internal output stages to four drivers. The dashboard and door locations distribute the sound around the two occupants.',
  assembled: 'The source drive, tuner, controls and output stages belong to one head-unit installation. The four speakers remain in their dashboard and door positions; the electrical supply provides the energy that moves their diaphragms.',
  exploded: 'The head-unit case and internal output board separate, while the speakers move clear of their mounting regions. Their open sections reveal magnet, voice coil and diaphragm relationships; these are display offsets, not a removal order.',
  focus: 'head-unit',
  hideCarParts: ['radio-unit', 'curved-windscreen'],
  direction: [1.45, .95, -1.25],
  note: 'Standard four-speaker CDR-30 layout; PCM, separate sound-package amplifiers and telephone options are omitted. PET 911-000/911-005 establishes the aerial amplifier, driver variants and mountings. Driver sections, antenna pattern, circuit boards, geometry and wire routes are illustrative.',
  connections: [
    { from: 'windscreen-aerial', to: 'head-unit', label: 'The aerial amplifier passes the received signal to the tuner', kind: 'signal' },
    { from: 'vehicle-supply', to: 'head-unit', label: 'Supply and earth power the source and controls', kind: 'electrical' },
    { from: 'vehicle-supply', to: 'output-stages', label: 'Vehicle electrical energy supplies the power stages', kind: 'electrical' },
    { from: 'head-unit', to: 'output-stages', label: 'Selected music and volume control set the programme', kind: 'signal' },
    { from: 'output-stages', to: 'left-tweeter', label: 'Speaker-driving current feeds the left high-range driver', kind: 'electrical' },
    { from: 'output-stages', to: 'right-tweeter', label: 'Speaker-driving current feeds the right high-range driver', kind: 'electrical' },
    { from: 'output-stages', to: 'left-woofer', label: 'Speaker-driving current feeds the left low-range driver', kind: 'electrical' },
    { from: 'output-stages', to: 'right-woofer', label: 'Speaker-driving current feeds the right low-range driver', kind: 'electrical' },
  ],
};

// Canonical driver axis is +Z, towards the cabin. The open quarter reveals the
// electromechanical relationships; no exact Porsche driver construction is claimed.
function ring(parent, outer, inner, depth, surface, position) {
  const result = annulus(parent, outer, inner, depth, surface, position);
  result.rotation.set(0, 0, 0);
  return result;
}

function driver(parent, radius, m, tweeter = false) {
  const unit = group('moving-coil-driver', parent);
  const depth = radius * .65;
  ring(unit, radius * 1.08, radius * .94, .008, m.metal, [0, 0, .015]);
  mesh(unit, new THREE.TorusGeometry(radius * .89, radius * .055, 8, 36, Math.PI * 1.5), m.black, [0, 0, .023]);
  for (const angle of [.35, 2.05, 3.75]) {
    const x = Math.cos(angle), y = Math.sin(angle);
    beam(unit, [x * radius, y * radius, .01], [x * radius * .36, y * radius * .36, -depth * .75], radius * .045, m.metal);
  }
  // PET 911-005 items 1/2 and 7/8: two clips per tweeter, four bolts per
  // door bass-driver housing. Positions and the cutaway remain illustrative.
  const mountingCount = tweeter ? 2 : 4;
  for (let i = 0; i < mountingCount; i++) {
    const angle = i * Math.PI * 2 / mountingCount;
    const position = [Math.cos(angle) * radius * 1.1, Math.sin(angle) * radius * 1.1, .008];
    box(unit, [radius * .18, radius * .18, .008], m.dark, position, [0, 0, angle]);
    if (!tweeter) cylinder(unit, radius * .045, .012, m.metal, [position[0], position[1], .015], [Math.PI / 2, 0, 0]);
  }
  cylinder(unit, radius * .43, depth * .42, m.dark, [0, 0, -depth * .83], [Math.PI / 2, 0, 0]).name = 'fixed-magnet';
  cylinder(unit, radius * .16, depth * .5, m.metal, [0, 0, -depth * .57], [Math.PI / 2, 0, 0]).name = 'pole-piece';
  for (let i = 0; i < 5; i++) ring(unit, radius * .235, radius * .19, .0025, m.warm, [0, 0, -depth * .53 + i * depth * .06]).name = 'voice-coil-turn';
  ring(unit, radius * .55, radius * .23, .003, m.warm, [0, 0, -depth * .32]).name = 'spider-support';
  const cone = new THREE.LatheGeometry([
    new THREE.Vector2(radius * .24, -depth * .25),
    new THREE.Vector2(radius * .7, depth * .15),
    new THREE.Vector2(radius * .86, depth * .27),
  ], 36, .25, Math.PI * 1.5);
  mesh(unit, cone, m.black, [0, 0, 0], [Math.PI / 2, 0, 0]).name = 'diaphragm-section';
  if (tweeter) mesh(unit, new THREE.SphereGeometry(radius * .52, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m.dark, [0, 0, .013], [Math.PI / 2, 0, 0]).name = 'small-dome';
  else mesh(unit, new THREE.SphereGeometry(radius * .25, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m.dark, [0, 0, -depth * .1], [Math.PI / 2, 0, 0]).name = 'dust-cap';
  for (const x of [-1, 1]) {
    box(unit, [radius * .12, radius * .13, .008], m.warm, [x * radius * .53, -radius * .6, -depth * .5]);
    tube(unit, [[x * radius * .53, -radius * .6, -depth * .48], [x * radius * .35, -radius * .32, -depth * .12], [x * radius * .22, 0, -depth * .23]], .0018, m.warm);
  }
  return unit;
}

export function createAssembly() {
  const root = assembly('standard-audio');
  const m = materials();
  const head = part(root, 'head-unit', 'CDR-30 head unit', [0, 0, 0], [0, .12, -.28],
    'The centre-console unit contains radio reception, the single CD drive, source selection and volume controls. The partial case exposes the source electronics; the optional six-disc changer and PCM are not shown.');
  radioUnit(head, m);

  const output = part(root, 'output-stages', 'Internal output stages', [0, .660, .338], [.27, -.15, 0],
    'Two 25-watt output stages inside the head unit provide speaker-driving current. They use vehicle electrical energy under the programme signal’s control; this standard system has no separate BOSE or Sound Package Plus amplifier.');
  output.rotation.x = -.2;
  box(output, [.17, .006, .13], m.green);
  for (const x of [-.047, .047]) {
    box(output, [.037, .017, .028], m.black, [x, .012, .012]);
    for (let i = 0; i < 6; i++) box(output, [.005, .025, .055], m.metal, [x - .017 + i * .007, .02, .04]);
    for (let i = 0; i < 5; i++) box(output, [.003, .002, .012], m.warm, [x - .014 + i * .007, .005, -.009]);
  }
  for (const x of [-.064, -.03, .03, .064]) cylinder(output, .009, .018, m.dark, [x, .013, -.045], [0, 0, 0]);

  for (const side of [-1, 1]) {
    const left = side > 0;
    const tweeter = part(root, left ? 'left-tweeter' : 'right-tweeter', left ? 'Left dash tweeter' : 'Right dash tweeter', [side * .56, .797, .62], [side * .17, .27, .02],
      'One of the standard pair of dashboard high-range speakers, retained by two clips in PET 911-005 items 1–2. Its small diaphragm moves air at high frequencies; the enlarged open section explains the coil and magnet, not exact factory construction.');
    const tweeterUnit = driver(tweeter, .034, m, true);
    tweeterUnit.rotation.x = -Math.PI / 2;
    const woofer = part(root, left ? 'left-woofer' : 'right-woofer', left ? 'Left door woofer' : 'Right door woofer', [side * .654, .50, .05], [side * .32, -.08, -.1],
      'One of the standard pair of door low-range speakers. PET 911-005 items 7–8 distinguishes the standard bass-driver housing from Plus/BOSE variants and lists four mounting bolts per housing. The coil/magnet cutaway and mounting geometry are illustrative.');
    const wooferUnit = driver(woofer, .087, m);
    wooferUnit.rotation.y = -side * Math.PI / 2;
  }

  const aerial = part(root, 'windscreen-aerial', 'Radio aerial and amplifier', [0, 0, 0], [0, .28, .14],
    'The aerial receives the broadcast; its signal amplifier and connection feed CDR-30 (PET 911-000 item 13 and radio cable). This reception amplifier does not drive the speakers. The windscreen pattern, amplifier position and cable route are schematic; GPS and telephone use distinct optional aerial hardware.');
  windscreenGlass(aerial, { glass: m.glass });
  const onGlass = (u, v) => windscreenPoint(u, v).map((n, axis) => n + (axis === 1 ? .002 : 0));
  const pattern = [[.15, .12], [.2, .88], [.4, .90], [.5, .14], [.6, .90], [.8, .88], [.85, .12]];
  for (let i = 1; i < pattern.length; i++) {
    const [a, b] = [pattern[i - 1], pattern[i]];
    tube(aerial, Array.from({ length: 31 }, (_, j) => {
      const t = j / 30;
      return onGlass(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
    }), .002, m.warm);
  }
  const ampAt = onGlass(.15, .05);
  const receptionAmp = cylinder(aerial, .012, .078, m.metal, ampAt, [0, 0, Math.PI / 2]);
  receptionAmp.name = 'radio-aerial-signal-amplifier';
  box(aerial, [.05, .005, .025], m.dark, [ampAt[0], ampAt[1] - .015, ampAt[2]]);
  tube(aerial, [ampAt, [ampAt[0], .80, .68], [ampAt[0], .75, .60]], .003, m.black);

  const power = part(root, 'vehicle-supply', 'Vehicle supply and earth', [0, .66, 1.1], [-.14, .08, .2],
    'The battery-backed vehicle supply powers the head unit and its output stages. Earth connections complete the electrical circuit. The visible supply and return paths explain connectivity, not the fuse locations or harness route.');
  box(power, [.28, .15, .18], m.black);
  box(power, [.29, .018, .19], m.dark, [0, .082, 0]);
  cylinder(power, .011, .02, m.red, [-.095, .1, 0], [0, 0, 0]);
  cylinder(power, .011, .02, m.blue, [.095, .1, 0], [0, 0, 0]);
  tube(power, [[-.095, .11, 0], [-.16, .05, -.1], [-.14, -.02, -.32], [0, .04, -.78]], .004, m.warm);
  tube(power, [[.095, .11, 0], [.16, .02, -.1], [.18, -.12, -.2]], .004, m.blue);
  ring(power, .014, .007, .005, m.metal, [.18, -.12, -.2]);
  return root;
}
