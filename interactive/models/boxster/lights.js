import * as THREE from 'three';
import { group, mesh } from '../geometry.js';
import { ellipsoid, line3 } from './surfaces.js';
import { frame, sdf } from './shell.js';

// 987.2 headlamp: an egg-shaped glass lying in the sloping nose of the wing,
// the rounder end outboard and rearward.
export function headlampFrame(surface, side) {
  const normal = new THREE.Vector3(side * 0.12, 0.66, 0.74).normalize();
  const hit = surface.hit([side * 0.625, 0.68, 1.78], normal.clone().negate().toArray());
  return frame(hit.point.toArray(), normal.toArray());
}

function lampPoints(side) {
  const tilt = 0.28;
  const axis = [side * Math.sin(tilt), Math.cos(tilt)];
  const across = [axis[1], -axis[0]];
  return Array.from({ length: 64 }, (_, i) => {
    const phi = (i / 64) * Math.PI * 2;
    const u = 0.25 * Math.cos(phi),
      v = 0.127 * Math.sin(phi) * (1 + 0.2 * Math.cos(phi));
    return [axis[0] * u + across[0] * v, axis[1] * u + across[1] * v];
  });
}
export const headlampOutline = (side) => sdf.polygon(lampPoints(side), 128);

export function headlamp(parent, p, f, side, surface) {
  const root = group(`headlamp-${side}`, parent);
  root.userData.carPart = true;
  const n = f.n.clone();
  const at = (a, b, depth) => f.from(a, b, depth).toArray();
  const ring = lampPoints(side);
  const inward = n.clone().negate().toArray();
  line3(root, ring.map(([a, b]) => surface.on(at(a, b, 0.3), inward, 0.002)), 0.0035, p.black, true);
  line3(root, ring.map(([a, b]) => surface.on(at(a*.978, b*.978, 0.3), inward, 0.003)), 0.0015, p.chrome, true);
  const tilt = 0.28;
  const axis = [side * Math.sin(tilt), Math.cos(tilt)];
  const lamps = [
    [0.11, 0.074, true],
    [-0.075, 0.052, false],
  ];
  for (const [offset, radius, main] of lamps) {
    const hit=surface.hit(at(axis[0]*offset,axis[1]*offset,.3),inward);
    const point=hit.point.clone().add(new THREE.Vector3(0,main?-.08:-.065,-.035)).toArray();
    const unit = group(`${main ? 'projector' : 'high-beam-reflector'}-${side}`, root, point);
    // The optics aim along the road; only the outer cover follows the wing.
    unit.lookAt(new THREE.Vector3(...point).add(new THREE.Vector3(side*.025,-.005,1)));
    mesh(unit, new THREE.CylinderGeometry(radius * 1.08, radius * 0.9, 0.05, 48, 1, true), p.chrome, [0, 0, -0.01], [Math.PI / 2, 0, 0]);
    mesh(unit, new THREE.TorusGeometry(radius, 0.005, 8, 48), p.chrome, [0, 0, 0.012]);
    mesh(unit, new THREE.CircleGeometry(radius * 0.92, 48), p.black, [0, 0, 0.004]);
    const glass = new THREE.MeshPhysicalMaterial({
      color: main ? '#304451' : '#ccd4d9',
      metalness: main ? 0.35 : 0.85,
      roughness: 0.1,
      clearcoat: 1,
    });
    ellipsoid(unit, [radius * 0.76, radius * 0.76, radius * 0.3], glass, [0, 0, 0.01]);
    if (!main)
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        line3(unit, [
          [Math.cos(a) * radius * 0.66, Math.sin(a) * radius * 0.66, 0.008],
          [Math.cos(a) * radius * 0.9, Math.sin(a) * radius * 0.9, 0.006],
        ], 0.0012, p.chrome);
      }
  }
  const across=[axis[1],-axis[0]];
  for(const v of [-.172,-.157,-.142]) {
    const strip=Array.from({length:25},(_,i)=>{
      const u=(i/24*2-1)*.078;
      return surface.on(at(axis[0]*v+across[0]*u,axis[1]*v+across[1]*u,.3),inward,-.025);
    });
    line3(root,strip,.0018,p.chrome);
  }
  return root;
}

const mirrored = (side, points) => points.map(([x, y, z]) => [side * x, y, z]);

// 987.2 tail lamp, traced on the shell from two calibrated rear photographs: a
// tall, blunt inner end beside the rear lid, a top edge along the wing crest
// and a point wrapping onto the flank.
export const tailLampOutline = (side) =>
  mirrored(side, [
    [0.5, 0.735, -1.965],
    [0.525, 0.766, -1.895],
    [0.555, 0.787, -1.83],
    [0.6, 0.799, -1.772],
    [0.65, 0.804, -1.727],
    [0.72, 0.798, -1.683],
    [0.785, 0.776, -1.619],
    [0.838, 0.738, -1.552],
    [0.838, 0.716, -1.597],
    [0.833, 0.687, -1.672],
    [0.822, 0.666, -1.752],
    [0.809, 0.66, -1.852],
    [0.778, 0.661, -1.91],
    [0.72, 0.666, -1.955],
    [0.64, 0.673, -1.985],
    [0.57, 0.68, -2.0],
    [0.515, 0.688, -2.003],
    [0.498, 0.706, -1.99],
  ]);

// Clear reversing and indicator band inside a thin red rim along the lower
// edge, narrowing to nothing on the flank.
const bandTop = [
  [0.79, 0.706, -1.8],
  [0.725, 0.716, -1.894],
  [0.62, 0.717, -1.95],
  [0.548, 0.715, -1.976],
  [0.512, 0.713, -1.982],
];
export const tailLampBandOutline = (side) =>
  mirrored(side, [
    ...bandTop,
    [0.509, 0.701, -1.99],
    [0.528, 0.695, -1.996],
    [0.57, 0.69, -1.994],
    [0.64, 0.683, -1.979],
    [0.72, 0.676, -1.949],
    [0.775, 0.672, -1.905],
    [0.799, 0.673, -1.85],
    [0.809, 0.687, -1.775],
  ]);

// Darker LED cluster in the upper outer corner of the red lens.
export const tailLampLedOutline = (side) =>
  mirrored(side, [
    [0.689, 0.783, -1.779],
    [0.784, 0.77, -1.632],
    [0.811, 0.739, -1.632],
    [0.8, 0.712, -1.76],
    [0.73, 0.725, -1.87],
    [0.697, 0.751, -1.864],
  ]);

// Black rim and a bright divider above the clear band.
export function tailLamp(parent, p, surface, side) {
  const root = group(`tail-lamp-detail-${side}`, parent);
  const n = new THREE.Vector3(side * 0.55, 0.3, -0.8).normalize();
  const project = (point, lift) => surface.on(new THREE.Vector3(...point).addScaledVector(n, 0.4).toArray(), n.clone().negate().toArray(), lift);
  const curve = (points, closed, count) =>
    new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)), closed, 'centripetal')
      .getPoints(count)
      .map((point) => point.toArray());
  line3(root, curve(tailLampOutline(side), true, 140).map((point) => project(point, 0.002)), 0.0045, p.black, true);
  line3(root, curve(mirrored(side, bandTop), false, 60).map((point) => project(point, 0.003)), 0.0022, p.chrome);
  return root;
}
