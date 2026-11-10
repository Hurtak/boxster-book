import * as THREE from 'three';

// Axis X, outboard face +X. A reusable 18-inch-style split-spoke road wheel.
export function roadWheel(parent, name, position, alloy) {
  const root = new THREE.Group();
  root.name = name;
  root.position.fromArray(position);
  if (name.startsWith('wheel-r')) root.scale.x = 1.15;
  parent.add(root);
  const rubber = new THREE.MeshStandardMaterial({
    name: 'Tyre rubber',
    color: '#111315',
    roughness: 0.94,
  });
  const groove = new THREE.MeshStandardMaterial({
    color: '#07090a',
    roughness: 1,
  });
  const add = (
    geometry,
    material,
    position = [0, 0, 0],
    rotation = [0, 0, 0]
  ) => {
    const object = new THREE.Mesh(geometry, material);
    object.position.fromArray(position);
    object.rotation.set(...rotation);
    root.add(object);
    return object;
  };
  const crossSection = [
    [0.224, -0.091],
    [0.255, -0.113],
    [0.302, -0.108],
    [0.323, -0.082],
    [0.329, -0.054],
    [0.329, 0.054],
    [0.323, 0.082],
    [0.302, 0.108],
    [0.255, 0.113],
    [0.224, 0.091],
  ];
  const tyre = new THREE.LatheGeometry(
    crossSection.map(([radius, axis]) => new THREE.Vector2(radius, axis)),
    128
  );
  add(tyre, rubber, [0, 0, 0], [0, 0, Math.PI / 2]);
  // Circumferential grooves and short tread cuts are geometry, not a flat decal.
  for (const x of [-0.048, -0.017, 0.017, 0.048])
    add(
      new THREE.TorusGeometry(0.3292, 0.0015, 4, 128),
      groove,
      [x, 0, 0],
      [0, Math.PI / 2, 0]
    );
  const cuts = new THREE.BufferGeometry();
  const tread = [],
    indices = [];
  for (let i = 0; i < 96; i++)
    for (const side of [-1, 1]) {
      const a = (i * Math.PI * 2) / 96;
      const offset = tread.length / 3;
      for (const [x, angle] of [
        [side * 0.022, a - 0.002],
        [side * 0.022, a + 0.002],
        [side * 0.075, a + side * 0.035 - 0.002],
        [side * 0.075, a + side * 0.035 + 0.002],
      ]) {
        const r = 0.3291 - 0.007 * (Math.abs(x) / 0.08) ** 4;
        tread.push(x, Math.cos(angle) * r, Math.sin(angle) * r);
      }
      indices.push(
        offset,
        offset + 2,
        offset + 1,
        offset + 1,
        offset + 2,
        offset + 3
      );
    }
  cuts.setAttribute('position', new THREE.Float32BufferAttribute(tread, 3));
  cuts.setIndex(indices);
  cuts.computeVertexNormals();
  const treadMaterial = groove.clone();
  treadMaterial.side = THREE.DoubleSide;
  add(cuts, treadMaterial);
  const barrel = new THREE.CylinderGeometry(0.222, 0.222, 0.185, 96, 1, true);
  const barrelMaterial = new THREE.MeshStandardMaterial({
    color: '#333a40',
    metalness: 0.75,
    roughness: 0.42,
    side: THREE.DoubleSide,
  });
  add(barrel, barrelMaterial, [0, 0, 0], [0, 0, Math.PI / 2]);
  for (const x of [-0.092, 0.095])
    add(
      new THREE.TorusGeometry(0.224, 0.007, 8, 128),
      alloy,
      [x, 0, 0],
      [0, Math.PI / 2, 0]
    );
  add(
    new THREE.CylinderGeometry(0.061, 0.069, 0.034, 48),
    alloy,
    [0.075, 0, 0],
    [0, 0, Math.PI / 2]
  );
  // Five pairs taper into the rim, with the soft sweep visible in the references.
  for (let spoke = 0; spoke < 5; spoke++)
    for (const branch of [-1, 1]) {
      const shape = new THREE.Shape();
      shape.moveTo(0.048, branch * 0.007 - 0.013);
      shape.bezierCurveTo(
        0.105,
        branch * 0.017 - 0.014,
        0.171,
        branch * 0.03 - 0.013,
        0.221,
        branch * 0.022 - 0.012
      );
      shape.lineTo(0.221, branch * 0.022 + 0.012);
      shape.bezierCurveTo(
        0.163,
        branch * 0.03 + 0.014,
        0.101,
        branch * 0.017 + 0.015,
        0.048,
        branch * 0.007 + 0.013
      );
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.015,
        bevelEnabled: true,
        bevelSize: 0.003,
        bevelThickness: 0.003,
        bevelSegments: 3,
        curveSegments: 18,
      });
      // Shape coordinates become radial Y and tangential Z, with extrusion along X.
      const a = (spoke * Math.PI * 2) / 5;
      const p = geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const r = p.getX(i),
          t = p.getY(i),
          depth = p.getZ(i);
        p.setXYZ(
          i,
          0.065 + depth + 0.024 * (r / 0.23),
          Math.sin(a) * r + Math.cos(a) * t,
          Math.cos(a) * r - Math.sin(a) * t
        );
      }
      geometry.computeVertexNormals();
      add(geometry, alloy);
    }
  const cap = new THREE.MeshStandardMaterial({
    color: '#b3b7b8',
    metalness: 0.7,
    roughness: 0.3,
  });
  add(
    new THREE.CylinderGeometry(0.029, 0.029, 0.005, 48),
    cap,
    [0.097, 0, 0],
    [0, 0, Math.PI / 2]
  );
  const bolts = new THREE.MeshStandardMaterial({
    color: '#52565a',
    metalness: 0.8,
    roughness: 0.3,
  });
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    add(
      new THREE.CylinderGeometry(0.0065, 0.0065, 0.006, 6),
      bolts,
      [0.098, Math.cos(a) * 0.043, Math.sin(a) * 0.043],
      [0, 0, Math.PI / 2]
    );
  }
  add(
    new THREE.CylinderGeometry(0.003, 0.003, 0.018, 8),
    rubber,
    [0.085, 0.185, 0.105],
    [0, 0, Math.PI / 2]
  );
  return root;
}
