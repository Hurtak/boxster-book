import * as THREE from 'three';
import { panel, slider, buttons } from '../ui.js';
import { sampleTimeline, segment, clamp } from '../math.js';
import { loadModel, scene3D, disposeObject, opacity } from './scene.js';

const stops = [
  { value: 0, label: 'Whole car' }, { value: 30, label: 'Connections' },
  { value: 65, label: 'Assembly' }, { value: 100, label: 'Exploded' },
];
const connectionColours = {
  mechanical: '#6d7a80', fluid: '#b5763c', air: '#3c849f',
  electrical: '#b5763c', signal: '#6b7f9b', structure: '#397561',
};

function isolateMaterials(root) {
  const copies = new Map();
  root.traverse(object => {
    if (!object.material) return;
    const copy = material => {
      if (!copies.has(material)) copies.set(material, material.clone());
      return copies.get(material);
    };
    object.material = Array.isArray(object.material) ? object.material.map(copy) : copy(object.material);
    object.castShadow = true;
    object.receiveShadow = true;
  });
}

function centre(object) {
  return new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
}

export function geometryCorners(root) {
  root.updateMatrixWorld(true);
  const points = [];
  root.traverse(object => {
    if (!object.isMesh) return;
    object.geometry.computeBoundingBox();
    const box = object.geometry.boundingBox;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) points.push(new THREE.Vector3(x, y, z).applyMatrix4(object.matrixWorld));
  });
  return points;
}

export function frameBounds(box, camera, direction, padding = 1.18, points) {
  const target = box.getCenter(new THREE.Vector3());
  const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
  const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
  const right = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
  const up = direction.clone().cross(right).normalize();
  let distance = 0.5;
  const corners = points ?? [box.min.x, box.max.x].flatMap(x => [box.min.y, box.max.y].flatMap(y => [box.min.z, box.max.z].map(z => new THREE.Vector3(x, y, z))));
  for (const point of corners) {
    const corner = point.clone().sub(target);
    const depth = corner.dot(direction);
    distance = Math.max(distance, depth + Math.abs(corner.dot(right)) * padding / Math.tan(horizontal), depth + Math.abs(corner.dot(up)) * padding / Math.tan(vertical));
  }
  return { target: target.toArray(), position: target.clone().addScaledVector(direction, distance).toArray() };
}

export async function mountExplorer(host, { state, signal }, { reference, base, config, createAssembly }) {
  state.progress = clamp((state.progress ?? 0) / 100) * 100;
  state.part ??= config.focus;
  state.showConnections ??= true;
  const car = await loadModel(reference, signal, base);
  let model, view;
  try {
    model = createAssembly();
    const parts = model.children.filter(object => object.userData.label).map((object, i) => {
      isolateMaterials(object);
      return { object, number: i + 1, initial: object.position.clone(), ...object.userData };
    });
    const byName = new Map(parts.map(part => [part.object.name, part]));
    if (!byName.has(state.part)) state.part = config.focus;
    if (!byName.has(config.focus)) throw new Error(`Unknown focus part in ${config.id}`);
    const { stage, controls, explanation } = panel(host, {
      title: config.title,
      description: 'Locate the assembly, follow its connections, then separate its main parts. Select a part for a closer view; drag to rotate and pinch or scroll to zoom.',
      note: `2010 European/UK 2.9. Blue: selected part. Dashed links: functional connections. Geometry, routes and separation are schematic.${config.note ? ` ${config.note}` : ''}`,
    });
    host.classList.add('component-explorer');
    stage.style.overflow = 'hidden';
    const markers = document.createElement('div');
    markers.className = 'component-markers';
    markers.setAttribute('aria-hidden', 'true');
    for (const part of parts) {
      const marker = document.createElement('span');
      marker.textContent = part.number;
      marker.className = 'component-marker';
      markers.append(marker);
      part.marker = marker;
      const leader = document.createElement('i');
      leader.className = 'component-marker-leader';
      markers.prepend(leader);
      part.leader = leader;
    }
    stage.append(markers);
    const callout = document.createElement('div');
    callout.className = 'diagram-callout';
    stage.append(callout);
    const orient = document.createElement('span');
    orient.className = 'component-front';
    orient.textContent = 'Front';
    orient.setAttribute('aria-hidden', 'true');
    stage.append(orient);
    const relationship = document.createElement('p');
    relationship.className = 'diagram-connections';
    explanation.after(relationship);

    const projectMarkers = () => {
      if (!view) return;
      model.updateMatrixWorld(true);
      const projected = [];
      for (const part of parts) {
        const p = centre(part.object).project(view.camera);
        const x = (p.x + 1) * stage.clientWidth / 2;
        const y = (1 - p.y) * stage.clientHeight / 2;
        const visible = state.progress >= 20 && p.z > -1 && p.z < 1 && x >= 14 && x <= stage.clientWidth - 14 && y >= 14 && y <= stage.clientHeight - 14;
        part.marker.hidden = !visible;
        part.leader.hidden = !visible;
        if (!visible) continue;
        const offsets = [[0, -24], [-30, -16], [30, -16], [-34, 20], [34, 20], [0, 32], [-55, -35], [55, 35], [-65, 12], [65, -12]];
        const offset = offsets.find(([dx, dy]) => x + dx >= 14 && x + dx <= stage.clientWidth - 14 && y + dy >= 18 && y + dy <= stage.clientHeight - 14 && projected.every(other => Math.hypot(x + dx - other.x, y + dy - other.y) >= 28)) ?? [0, 0];
        const [dx, dy] = offset;
        part.marker.style.left = `${x + dx}px`;
        part.marker.style.top = `${y + dy}px`;
        Object.assign(part.leader.style, { left: `${x}px`, top: `${y}px`, width: `${Math.hypot(dx, dy)}px`, transform: `rotate(${Math.atan2(dy, dx)}rad)` });
        part.marker.classList.toggle('is-selected', part.object.name === state.part);
        projected.push({ name: part.object.name, x: x + dx, y: y + dy });
      }
      host.dataset.projectedParts = JSON.stringify(projected);
      const front = new THREE.Vector3(0, 0.2, 2.34).project(view.camera);
      orient.hidden = state.progress >= 35 || Math.abs(front.x) > 0.9 || Math.abs(front.y) > 0.9;
      orient.style.left = `${(front.x + 1) * stage.clientWidth / 2}px`;
      orient.style.top = `${(1 - front.y) * stage.clientHeight / 2}px`;
    };
    let update = () => {};
    view = scene3D(stage, { signal, onRender: projectMarkers, onResize: () => update() });
    view.controls.maxDistance = 20;
    view.renderer.domElement.setAttribute('aria-label', `${config.title}. ${config.location}`);
    view.scene.add(car, model);
    const assembledBox = new THREE.Box3().setFromObject(model);
    const assembledCorners = geometryCorners(model);
    for (const part of parts) part.object.position.copy(part.initial).add(new THREE.Vector3(...part.explode));
    const explodedBox = new THREE.Box3().setFromObject(model);
    const explodedCorners = geometryCorners(model);
    for (const part of parts) part.object.position.copy(part.initial);
    const carBox = new THREE.Box3().setFromObject(car);
    const carCorners = geometryCorners(car);
    const contextBox = carBox.clone().union(assembledBox);
    const focusBox = new THREE.Box3().setFromObject(byName.get(config.focus).object);
    const locator = new THREE.Box3Helper(focusBox, '#327cc3');
    locator.material.depthTest = false;
    locator.material.transparent = true;
    locator.material.opacity = 0.9;
    view.scene.add(locator);
    const links = config.connections.map(connection => {
      if (!byName.has(connection.from) || !byName.has(connection.to)) throw new Error(`Unknown connection in ${config.id}`);
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({ color: connectionColours[connection.kind] ?? '#6d7a80', dashSize: 0.045, gapSize: 0.025, transparent: true, opacity: 0.85 }));
      view.scene.add(line);
      return { ...connection, line };
    });
    let stageRow, partRow;
    const direction = new THREE.Vector3(...(config.direction ?? [1.25, 0.85, 1.65])).normalize();
    const carDirection = new THREE.Vector3(1.05, 0.7, 1.45).normalize();
    update = () => {
      const progress = state.progress;
      const exploded = segment(progress, 65, 100);
      const selected = byName.get(state.part);
      const contextOpacity = 1 - segment(progress, 0, 55);
      for (const subsystem of car.children) {
        const replaced = config.hideCarParts?.includes(subsystem.name);
        opacity(subsystem, replaced ? 1 - segment(progress, 0, 18) : contextOpacity * (1 - segment(progress, 10, 30) * 0.82));
      }
      for (const part of parts) {
        part.object.position.copy(part.initial).addScaledVector(new THREE.Vector3(...part.explode), exploded);
        const chosen = part === selected;
        opacity(part.object, segment(progress, 2, 18) * (state.focusPart && !chosen ? 0.18 : 1));
        part.object.traverse(object => {
          for (const material of [object.material].flat().filter(Boolean)) {
            material.emissive?.set(chosen ? '#124879' : '#000000');
            if (material.emissive) material.emissiveIntensity = chosen ? 0.65 : 0;
          }
        });
      }
      model.updateMatrixWorld(true);
      for (const link of links) {
        link.line.visible = state.showConnections && progress >= 20;
        link.line.geometry.setFromPoints([centre(byName.get(link.from).object), centre(byName.get(link.to).object)]);
        link.line.computeLineDistances();
      }
      locator.visible = progress < 40;
      const camera = view.camera;
      const timeline = [
        { at: 0, ...frameBounds(carBox, camera, carDirection, 1.12, carCorners) },
        { at: 30, ...frameBounds(contextBox, camera, carDirection, 1.05) },
        { at: 65, ...frameBounds(assembledBox, camera, direction, 1.18, assembledCorners) },
        { at: 100, ...frameBounds(explodedBox, camera, direction, 1.18, explodedCorners) },
      ];
      const pose = state.focusPart
        ? frameBounds(new THREE.Box3().setFromObject(selected.object), camera, direction, 1.4)
        : sampleTimeline(progress, timeline);
      camera.position.fromArray(pose.position);
      view.controls.target.fromArray(pose.target);
      view.controls.update();
      const stop = [...stops].reverse().find(stop => progress >= stop.value) ?? stops[0];
      const text = [config.location, config.overview, config.assembled, config.exploded][stops.indexOf(stop)];
      callout.textContent = state.focusPart ? selected.label : stop.label;
      explanation.textContent = state.focusPart ? selected.description : `${text}${progress >= 60 ? ` ${selected.label}: ${selected.description}` : ''}`;
      const connections = links.filter(link => link.from === state.part || link.to === state.part);
      relationship.textContent = `Connected to ${selected.label.toLowerCase()}: ${connections.map(link => `${byName.get(link.from === state.part ? link.to : link.from).label} — ${link.label}`).join('; ')}.`;
      stageRow?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(!state.focusPart && stops[i] === stop)));
      partRow?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(parts[i] === selected)));
      Object.assign(host.dataset, { progress: String(progress), exploded: exploded.toFixed(3), part: state.part, focusPart: String(Boolean(state.focusPart)), explorer: config.id, connectionCount: String(links.length) });
      view.render();
    };
    const progress = slider(controls, { label: 'Explore the assembly', value: state.progress, format: value => `${value}%`, signal, onChange: value => { state.progress = value; state.focusPart = false; update(); } });
    stageRow = buttons(controls, stops.map(stop => ({ label: stop.label, action: () => progress.set(stop.value) })), signal);
    partRow = buttons(controls, parts.map(part => ({ label: part.label, action: () => { state.part = part.object.name; state.progress = 100; state.focusPart = true; progress.set(100, false); update(); } })), signal);
    partRow.classList.add('component-parts');
    partRow.querySelectorAll('button').forEach((button, i) => {
      const number = document.createElement('span');
      number.className = 'component-part-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = `${i + 1} `;
      button.prepend(number);
      button.dataset.part = parts[i].object.name;
    });
    const toggle = document.createElement('label');
    toggle.className = 'component-connection-toggle';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state.showConnections;
    checkbox.addEventListener('change', () => { state.showConnections = checkbox.checked; update(); }, { signal });
    toggle.append(checkbox, ' Show connections');
    controls.append(toggle);
    buttons(controls, [{ label: 'Reset view', action: () => { state.part = config.focus; state.showConnections = true; checkbox.checked = true; progress.set(0); } }], signal);
    update();
    return view.dispose;
  } catch (error) {
    if (view) view.dispose();
    else { disposeObject(car); if (model) disposeObject(model); }
    throw error;
  }
}
