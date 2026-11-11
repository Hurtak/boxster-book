import { group } from '../geometry.js';
import { line3, patch } from './surfaces.js';

// One installed surface for the car, body cutaway and roof's fixed header.
// Metres, car axes. These are photo-guided surfaces, not fitting dimensions.
export function windscreenPoint(u, v) {
  const t = u * 2 - 1;
  return [t * (.727 - .078 * v), .84 + .335 * v - .02 * t * t, .64 - .52 * v + .06 * t * t];
}

export function windscreenFrame(parent, p) {
  const root = group('windscreen-frame', parent);
  root.userData.carPart = true;
  for (const v of [0, 1]) {
    const edge = Array.from({ length: 61 }, (_, i) => windscreenPoint(i / 60, v));
    line3(root, edge, .026, p.paint);
    line3(root, edge.map(([x, y, z]) => [x, y - .007, z - .004]), .009, p.black);
  }
  for (const u of [0, 1]) {
    const edge = Array.from({ length: 41 }, (_, i) => windscreenPoint(u, i / 40));
    line3(root, edge, .027, p.paint);
    line3(root, edge.map(([x, y, z]) => [x + (u === 0 ? .009 : -.009), y, z]), .008, p.black);
  }
  return root;
}

export function windscreenGlass(parent, p) {
  return patch(parent, 'curved-windscreen', windscreenPoint, 72, 32, p.glass);
}
