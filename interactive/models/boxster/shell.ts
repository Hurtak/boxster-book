export interface ShellSurface {
  requireHit(point: readonly number[], direction: readonly number[]): { point: THREE.Vector3; normal: THREE.Vector3 };
  hit(point: readonly number[], direction: readonly number[]): { point: THREE.Vector3; normal: THREE.Vector3 } | null;
  on(point: readonly number[], direction: readonly number[], lift?: number): readonly number[];
}
export type SurfaceFrame = ReturnType<typeof frame>;
export interface ShellRegion {
  name: string;
  frame: SurfaceFrame;
  sdf: (a: number, b: number) => number;
  applies: (point: THREE.Vector3) => boolean;
  material: THREE.Material | null;
  recess?: { depth: number; walls?: THREE.Material; floor?: THREE.Material; direction?: number[] };
}
import * as THREE from 'three';
import { columns, grid } from './shape.ts';

// Builds the mirrored lofted shell as one indexed triangle list.
function loft() {
  const rows = grid();
  const width = 2 * columns - 1;
  const positions = [];
  for (const row of rows) {
    for (let c = columns - 1; c >= 1; c--) {
      const [x, y, z] = row[c];
      positions.push(-x, y, z);
    }
    for (const [x, y, z] of row) positions.push(x, y, z);
  }
  const last = rows.length - 1;
  // Both end rows lie on the centre plane; weld them so the nose has no seam.
  const index = (r: number, c: number) =>
    (r === 0 || r === last) && c > columns - 1 ? r * width + (width - 1 - c) : r * width + c;
  const triangles = [];
  for (let r = 0; r < last; r++)
    for (let c = 0; c < width - 1; c++) {
      const a = index(r, c),
        b = index(r + 1, c),
        d = index(r, c + 1),
        e = index(r + 1, c + 1);
      // Mirror the diagonal as well as the vertices. Otherwise interpolation
      // across a curved quad subtly differs on the two sides of the car.
      if (c < columns - 1) triangles.push(a, b, e, a, e, d);
      else triangles.push(a, b, d, d, b, e);
    }
  return { positions: new Float32Array(positions), triangles };
}

const vector = (array: ArrayLike<number>, i: number) =>
  new THREE.Vector3(array[3 * i], array[3 * i + 1], array[3 * i + 2]);

// A planar 2D frame used to describe an opening as a signed-distance outline.
export function frame(origin: number[], normal: number[], up = new THREE.Vector3(0, 1, 0)) {
  const n = new THREE.Vector3(...normal).normalize();
  const e1 = new THREE.Vector3().crossVectors(up, n);
  if (e1.lengthSq() < 1e-8) e1.set(1, 0, 0);
  e1.normalize();
  const e2 = new THREE.Vector3().crossVectors(n, e1).normalize();
  const o = new THREE.Vector3(...origin);
  return {
    o,
    n,
    e1,
    e2,
    to: (p: THREE.Vector3) => {
      const d = p.clone().sub(o);
      return [d.dot(e1), d.dot(e2)] as [number, number];
    },
    from: (a: number, b: number, depth = 0) =>
      o.clone().addScaledVector(e1, a).addScaledVector(e2, b).addScaledVector(n, depth),
  };
}

// Signed distance helpers in a frame's 2D coordinates (negative inside).
export const sdf = {
  roundedBox(cx: number, cy: number, hw: number, hh: number, r: number) {
    return (a: number, b: number) => {
      const qx = Math.abs(a - cx) - hw + r,
        qy = Math.abs(b - cy) - hh + r;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    };
  },
  // Closed smooth outline through control points.
  polygon(points: number[][], samples = 160) {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([a, b]) => new THREE.Vector3(a, b, 0)),
      true,
      'centripetal',
    );
    const outline = curve.getPoints(samples).map((p) => [p.x, p.y]);
    return (a: number, b: number) => {
      let inside = false,
        best = Infinity;
      for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
        const [xi, yi] = outline[i],
          [xj, yj] = outline[j];
        if (yi > b !== yj > b && a < ((xj - xi) * (b - yi)) / (yj - yi) + xi) inside = !inside;
        const dx = xj - xi,
          dy = yj - yi;
        const t = Math.max(0, Math.min(1, ((a - xi) * dx + (b - yi) * dy) / (dx * dx + dy * dy || 1)));
        best = Math.min(best, Math.hypot(a - xi - t * dx, b - yi - t * dy));
      }
      return inside ? -best : best;
    };
  },
};

/*
  regions: [{ name, frame, sdf, applies(p), material | null (removed),
              recess: { depth, walls, floor } }]
  The first matching region owns a face. Faces crossing an outline are split
  along it, so openings have clean edges at a modest triangle count.
*/
export function buildShell(
  parent: THREE.Object3D,
  base: THREE.Material,
  defineRegions: (surface: ShellSurface) => ShellRegion[],
) {
  const lofted = loft();
  let { positions, triangles } = lofted;
  const original = positions.slice();
  const probe = new THREE.BufferGeometry();
  probe.setAttribute('position', new THREE.BufferAttribute(original, 3));
  probe.setIndex(triangles);
  probe.computeVertexNormals();
  const probeMesh = new THREE.Mesh(probe, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  const ray = new THREE.Raycaster();
  // Nearest shell hit along a direction, starting outside the car.
  const surface: ShellSurface = {
    requireHit(point, direction) {
      const hit = surface.hit(point, direction);
      if (!hit) throw new Error('Reference-shell landmark missed the body surface');
      return hit;
    },
    hit(point: readonly number[], direction: readonly number[]) {
      const d = new THREE.Vector3(...direction).normalize();
      ray.set(new THREE.Vector3(...point).addScaledVector(d, -1.5), d);
      ray.far = 3;
      const result = ray.intersectObject(probeMesh)[0];
      if (!result) return null;
      const n = (result.normal ?? result.face!.normal).clone().normalize();
      if (n.dot(d) > 0) n.negate();
      return { point: result.point, normal: n };
    },
    // Projects a point onto the shell along a direction and lifts it off the paint.
    on(point: readonly number[], direction: readonly number[], lift = 0.0015) {
      const h = surface.hit(point, direction);
      if (!h) return point;
      return h.point.addScaledVector(h.normal, lift).toArray();
    },
  };
  const regions = defineRegions(surface);
  const points = Array.from(positions);
  const pointNormals = Array.from(probe.attributes.normal.array);
  let owner = new Array(triangles.length / 3).fill(-1);
  for (let r = 0; r < regions.length; r++) {
    const region = regions[r];
    const within = (q: THREE.Vector3) => region.applies(q) && region.sdf(...region.frame.to(q)) < 0;
    const inside: boolean[] = [];
    for (let i = 0; i < points.length / 3; i++) inside.push(within(vector(points, i)));
    // One crossing per edge, shared by both faces so the shell stays closed.
    const crossings = new Map();
    const crossing = (a: number, b: number) => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      if (crossings.has(key)) return crossings.get(key);
      const pa = vector(points, a),
        pb = vector(points, b);
      let lo = 0,
        hi = 1;
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2;
        if (within(pa.clone().lerp(pb, mid)) === inside[a]) lo = mid;
        else hi = mid;
      }
      const t = Math.min(1 - 1e-6, Math.max(1e-6, (lo + hi) / 2));
      const v = points.length / 3;
      points.push(...pa.lerp(pb, t).toArray());
      const normal = vector(pointNormals, a).lerp(vector(pointNormals, b), t).normalize();
      pointNormals.push(...normal.toArray());
      crossings.set(key, v);
      return v;
    };
    const next = [],
      owners = [];
    for (let f = 0; f < owner.length; f++) {
      const tri = triangles.slice(3 * f, 3 * f + 3);
      const flags = tri.map((v) => inside[v]);
      const claim = (flag: boolean) => (owner[f] === -1 && flag ? r : owner[f]);
      if (flags[0] === flags[1] && flags[1] === flags[2]) {
        next.push(...tri);
        owners.push(claim(flags[0]));
        continue;
      }
      // Rotate so the vertex alone on its side comes first; winding is kept.
      const k = flags.findIndex((flag, i) => flag !== flags[(i + 1) % 3] && flag !== flags[(i + 2) % 3]);
      const a = tri[k],
        b = tri[(k + 1) % 3],
        c = tri[(k + 2) % 3];
      const pab = crossing(a, b),
        pac = crossing(a, c);
      next.push(a, pab, pac, pab, b, c, pab, c, pac);
      owners.push(claim(flags[k]), claim(!flags[k]), claim(!flags[k]));
    }
    triangles = next;
    owner = owners;
  }
  positions = new Float32Array(points);
  // A cut changes topology, not the painted surface. Interpolate the original
  // smooth normals so tiny cut triangles cannot dent the reflected highlights.
  const normals = pointNormals;
  const emit = (
    name: string,
    faces: number[],
    material: THREE.Material | null | undefined,
    offset: THREE.Vector3 | null = null,
  ) => {
    if (!faces.length || !material) return;
    const used = new Map();
    const pos = [],
      nor = [],
      idx = [];
    for (const f of faces)
      for (let k = 0; k < 3; k++) {
        const v = triangles[3 * f + k];
        if (!used.has(v)) {
          used.set(v, used.size);
          const q = vector(positions, v);
          if (offset) q.add(offset);
          pos.push(q.x, q.y, q.z);
          const normal = vector(normals, v);
          if (normal.lengthSq() < 1e-12) normal.set(0, 1, 0);
          else normal.normalize();
          nor.push(...normal.toArray());
        }
        idx.push(used.get(v));
      }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geometry.setIndex(idx);
    const result = new THREE.Mesh(geometry, material);
    result.name = name;
    parent.add(result);
    return result;
  };
  const groups = new Map();
  owner.forEach((r, f) => {
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(f);
  });
  emit('body-shell', groups.get(-1) ?? [], base);
  regions.forEach((region, r) => {
    const faces = groups.get(r) ?? [];
    emit(region.name, faces, region.material);
    if (!region.recess || !faces.length) return;
    const { depth, walls, floor, direction } = region.recess;
    const inward = direction ? new THREE.Vector3(...direction).normalize() : region.frame.n.clone().negate();
    const mine = new Set(faces);
    const edges = new Map();
    for (const f of faces)
      for (let k = 0; k < 3; k++) {
        const a = triangles[3 * f + k],
          b = triangles[3 * f + ((k + 1) % 3)];
        const key = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    // Edges used once by this region border the rest of the shell.
    const neighbours = new Map();
    for (let f = 0; f < owner.length; f++) {
      if (mine.has(f)) continue;
      for (let k = 0; k < 3; k++) {
        const a = triangles[3 * f + k],
          b = triangles[3 * f + ((k + 1) % 3)];
        const key = a < b ? `${a}:${b}` : `${b}:${a}`;
        if (edges.has(key)) neighbours.set(key, true);
      }
    }
    const wall = [];
    for (const [key, uses] of edges) {
      if (uses !== 1 || !neighbours.has(key)) continue;
      const [a, b] = key.split(':').map(Number);
      const pa = vector(positions, a),
        pb = vector(positions, b);
      const qa = pa.clone().addScaledVector(inward, depth),
        qb = pb.clone().addScaledVector(inward, depth);
      wall.push(...pa.toArray(), ...pb.toArray(), ...qb.toArray());
      wall.push(...pa.toArray(), ...qb.toArray(), ...qa.toArray());
    }
    if (walls && wall.length) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(wall, 3));
      geometry.computeVertexNormals();
      const result = new THREE.Mesh(geometry, walls);
      result.name = `${region.name}-walls`;
      parent.add(result);
    }
    if (floor) emit(`${region.name}-floor`, faces, floor, inward.clone().multiplyScalar(depth));
  });
  return surface;
}
