import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mesh } from '../geometry.js';

export function palette() {
  const surfaces = {
    paint: new THREE.MeshPhysicalMaterial({
      name: 'Deep metallic green',
      color: '#0a372e',
      metalness: 0.48,
      roughness: 0.27,
      clearcoat: 0.85,
      clearcoatRoughness: 0.17,
      side: THREE.DoubleSide,
    }),
    tan: new THREE.MeshStandardMaterial({
      name: 'Tan leather',
      color: '#986835',
      roughness: 0.7,
    }),
    insert: new THREE.MeshStandardMaterial({
      name: 'Tan seat inserts',
      color: '#ac8049',
      roughness: 0.8,
    }),
    stitch: new THREE.MeshStandardMaterial({
      color: '#a68150',
      roughness: 0.9,
    }),
    black: new THREE.MeshStandardMaterial({
      name: 'Black trim',
      color: '#111517',
      roughness: 0.68,
    }),
    rubber: new THREE.MeshStandardMaterial({
      color: '#0a0d0f',
      roughness: 0.95,
    }),
    silver: new THREE.MeshStandardMaterial({
      color: '#b7bdc4',
      metalness: 0.88,
      roughness: 0.23,
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: '#e4e7e8',
      metalness: 1,
      roughness: 0.12,
    }),
    lens: new THREE.MeshPhysicalMaterial({
      name: 'Clear lamp covers',
      color: '#f5faf8',
      metalness: 0,
      roughness: 0.045,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
      clearcoat: 1,
      side: THREE.DoubleSide,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      name: 'Windscreen glass',
      color: '#d8e3dd',
      metalness: 0,
      roughness: 0.025,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      clearcoat: 1,
      side: THREE.DoubleSide,
    }),
    red: new THREE.MeshPhysicalMaterial({
      color: '#a50b1c',
      roughness: 0.18,
      metalness: 0.15,
      clearcoat: 1,
    }),
    white: new THREE.MeshStandardMaterial({
      color: '#e5e8dc',
      roughness: 0.32,
    }),
  };
  for (const surface of Object.values(surfaces))
    surface.side = THREE.DoubleSide;
  return surfaces;
}

export function rounded(
  parent,
  size,
  surface,
  position = [0, 0, 0],
  radius = 0.02,
  rotation = [0, 0, 0]
) {
  return mesh(
    parent,
    new RoundedBoxGeometry(
      ...size,
      Math.min(...size) < 0.035 ? 2 : 4,
      Math.min(radius, Math.min(...size) / 2)
    ),
    surface,
    position,
    rotation
  );
}

export function ellipsoid(
  parent,
  size,
  surface,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
) {
  const result = mesh(
    parent,
    new THREE.SphereGeometry(1, 48, 24),
    surface,
    position,
    rotation
  );
  result.scale.fromArray(size);
  return result;
}

export function line3(parent, points, radius, surface, closed = false) {
  const vectors = points.map((point) => new THREE.Vector3(...point));
  const curve =
    points.length === 2
      ? new THREE.LineCurve3(...vectors)
      : new THREE.CatmullRomCurve3(vectors, closed, 'centripetal');
  const segments =
    points.length === 2 ? 1 : Math.min(160, Math.max(20, points.length * 2));
  return mesh(
    parent,
    new THREE.TubeGeometry(curve, segments, radius, 6, closed),
    surface
  );
}

export function surfaceLine(parent, points, map, radius, surface) {
  const parameters = new THREE.CatmullRomCurve3(
    points.map(([u, v]) => new THREE.Vector3(u, v, 0)),
    false,
    'centripetal'
  );
  const curve = new THREE.Curve();
  curve.getPoint = (t, target = new THREE.Vector3()) => {
    const point = parameters.getPoint(t);
    return target.set(...map(point.x, point.y));
  };
  return mesh(
    parent,
    new THREE.TubeGeometry(curve, 180, radius, 6, false),
    surface
  );
}

export function smooth2(points, samples = 80) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((point) => new THREE.Vector3(...point, 0)),
    true,
    'centripetal'
  );
  return curve
    .getPoints(samples)
    .slice(0, -1)
    .map((point) => new THREE.Vector2(point.x, point.y));
}

export function mappedShape(parent, name, outline, holes, map, surface) {
  const shape = new THREE.Shape(outline);
  shape.holes = holes.map((points) => new THREE.Path(points));
  const flat = new THREE.ShapeGeometry(shape, 32);
  const parameters = Array.from(
    { length: flat.attributes.position.count },
    (_, i) =>
      new THREE.Vector2(
        flat.attributes.position.getX(i),
        flat.attributes.position.getY(i)
      )
  );
  let triangles = Array.from(flat.index.array);
  const edge = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);
  // Split shared edges in every adjacent triangle. Independent tessellation makes
  // T-junctions that open into visible cracks when a flat patch is curved.
  for (let iteration = 0; iteration < 10; iteration++) {
    const midpoints = new Map();
    for (let i = 0; i < triangles.length; i += 3)
      for (const [a, b] of [
        [triangles[i], triangles[i + 1]],
        [triangles[i + 1], triangles[i + 2]],
        [triangles[i + 2], triangles[i]],
      ]) {
        const key = edge(a, b);
        if (
          parameters[a].distanceToSquared(parameters[b]) > 0.055 ** 2 &&
          !midpoints.has(key)
        ) {
          midpoints.set(key, parameters.length);
          parameters.push(
            parameters[a].clone().add(parameters[b]).multiplyScalar(0.5)
          );
        }
      }
    if (!midpoints.size) break;
    const next = [];
    for (let i = 0; i < triangles.length; i += 3) {
      const [a, b, c] = triangles.slice(i, i + 3),
        d = midpoints.get(edge(a, b)),
        e = midpoints.get(edge(b, c)),
        f = midpoints.get(edge(c, a));
      const mask =
        (d !== undefined ? 1 : 0) |
        (e !== undefined ? 2 : 0) |
        (f !== undefined ? 4 : 0);
      if (mask === 0) next.push(a, b, c);
      else if (mask === 1) next.push(a, d, c, d, b, c);
      else if (mask === 2) next.push(b, e, a, e, c, a);
      else if (mask === 4) next.push(c, f, b, f, a, b);
      else if (mask === 3) next.push(b, e, d, a, d, c, d, e, c);
      else if (mask === 6) next.push(c, f, e, b, e, a, e, f, a);
      else if (mask === 5) next.push(a, d, f, c, f, b, f, d, b);
      else next.push(a, d, f, d, b, e, f, e, c, d, e, f);
    }
    triangles = next;
  }
  const positions = [],
    normals = [];
  for (const { x: u, y: v } of parameters) {
    const epsilon = 0.0001;
    const du = new THREE.Vector3(...map(u + epsilon, v)).sub(
      new THREE.Vector3(...map(u - epsilon, v))
    );
    const dv = new THREE.Vector3(...map(u, v + epsilon)).sub(
      new THREE.Vector3(...map(u, v - epsilon))
    );
    const normal = du.cross(dv).normalize();
    normals.push(normal.x, normal.y, normal.z);
    positions.push(...map(u, v));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(triangles);
  const result = mesh(parent, geometry, surface);
  result.name = name;
  flat.dispose();
  return result;
}

export function patch(
  parent,
  name,
  sample,
  across,
  along,
  surface,
  omit = () => false
) {
  const positions = [],
    indices = [];
  for (let j = 0; j <= along; j++)
    for (let i = 0; i <= across; i++)
      positions.push(...sample(i / across, j / along));
  for (let j = 0; j < along; j++)
    for (let i = 0; i < across; i++) {
      if (omit(sample((i + 0.5) / across, (j + 0.5) / along))) continue;
      const a = j * (across + 1) + i,
        b = a + across + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const normals = geometry.attributes.normal;
  for (let i = 0; i < normals.count; i++) {
    if (
      normals.getX(i) ** 2 + normals.getY(i) ** 2 + normals.getZ(i) ** 2 >
      1e-12
    )
      continue;
    const row = Math.floor(i / (across + 1)),
      neighbor = row === along ? row - 1 : row + 1;
    const normal = new THREE.Vector3();
    for (let column = 0; column <= across; column++)
      normal.add(
        new THREE.Vector3().fromBufferAttribute(
          normals,
          neighbor * (across + 1) + column
        )
      );
    if (normal.lengthSq() < 1e-12) normal.set(0, 1, 0);
    else normal.normalize();
    normals.setXYZ(i, normal.x, normal.y, normal.z);
  }
  const result = mesh(parent, geometry, surface);
  result.name = name;
  return result;
}

export function profile(points, value) {
  if (value <= points[0][0]) return points[0][1];
  if (value >= points.at(-1)[0]) return points.at(-1)[1];
  const i = points.findIndex((point) => point[0] > value);
  const a = points[i - 1],
    b = points[i];
  const previous = points[Math.max(0, i - 2)],
    next = points[Math.min(points.length - 1, i + 1)];
  const t = (value - a[0]) / (b[0] - a[0]);
  const m0 = (b[1] - previous[1]) / (b[0] - previous[0]);
  const m1 = (next[1] - a[1]) / (next[0] - a[0]);
  return (
    (2 * t ** 3 - 3 * t * t + 1) * a[1] +
    (t ** 3 - 2 * t * t + t) * (b[0] - a[0]) * m0 +
    (-2 * t ** 3 + 3 * t * t) * b[1] +
    (t ** 3 - t * t) * (b[0] - a[0]) * m1
  );
}
