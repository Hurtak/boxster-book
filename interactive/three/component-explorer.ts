import * as THREE from 'three';
import { clamp, sampleTimeline, segment } from '../math.ts';
import { initializeState, type DiagramContext, type ExplorerConfig } from '../types';
import { buttons, panel, slider } from '../ui.ts';
import { installAssembly } from './installed-assembly.ts';
import { surfaceAnchor } from './anchors';
import { placeMarker } from './marker-layout';
import { disposeObject, isRenderable, loadModel, opacity, scene3D } from './scene.ts';

const stops = [
  { value: 0, label: 'Whole car' },
  { value: 30, label: 'Connections' },
  { value: 65, label: 'Assembly' },
  { value: 100, label: 'Exploded' },
];
const connectionColours = {
  mechanical: '#6d7a80',
  fluid: '#b5763c',
  air: '#3c849f',
  electrical: '#b5763c',
  signal: '#6b7f9b',
  structure: '#397561',
};

function isolateMaterials(root: THREE.Object3D<THREE.Object3DEventMap>) {
  const copies = new Map();
  root.traverse((object) => {
    if (!isRenderable(object)) return;
    const copy = (material: THREE.Material) => {
      if (!copies.has(material)) copies.set(material, material.clone());
      return copies.get(material);
    };
    object.material = Array.isArray(object.material) ? object.material.map(copy) : copy(object.material);
    object.castShadow = true;
    object.receiveShadow = true;
  });
}

export function geometryCorners(root: THREE.Object3D<THREE.Object3DEventMap>) {
  root.updateMatrixWorld(true);
  const points: THREE.Vector3[] = [];
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.computeBoundingBox();
    const box = object.geometry.boundingBox!;
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z])
          points.push(new THREE.Vector3(x, y, z).applyMatrix4(object.matrixWorld));
  });
  return points;
}

export function frameBounds(
  box: THREE.Box3,
  camera: THREE.PerspectiveCamera,
  direction: THREE.Vector3,
  padding = 1.18,
  points?: THREE.Vector3[],
) {
  const target = box.getCenter(new THREE.Vector3());
  const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
  const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
  const right = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
  const up = direction.clone().cross(right).normalize();
  let distance = 0.5;
  const corners =
    points ??
    [box.min.x, box.max.x].flatMap((x) =>
      [box.min.y, box.max.y].flatMap((y) => [box.min.z, box.max.z].map((z) => new THREE.Vector3(x, y, z))),
    );
  for (const point of corners) {
    const corner = point.clone().sub(target);
    const depth = corner.dot(direction);
    distance = Math.max(
      distance,
      depth + (Math.abs(corner.dot(right)) * padding) / Math.tan(horizontal),
      depth + (Math.abs(corner.dot(up)) * padding) / Math.tan(vertical),
    );
  }
  return {
    target: target.toArray(),
    position: target.clone().addScaledVector(direction, distance).toArray(),
  };
}

export async function mountExplorer(
  host: HTMLElement,
  { state: saved, signal, whenVisible }: DiagramContext,
  {
    reference,
    base,
    config,
    createAssembly,
  }: {
    reference: string | Uint8Array;
    base: string;
    config: ExplorerConfig;
    createAssembly: () => THREE.Object3D;
  },
) {
  const state = initializeState(saved, {
    progress: 0,
    part: config.focus,
    showConnections: true,
    focusPart: false,
  });
  state.progress = clamp((state.progress ?? 0) / 100) * 100;
  state.part ??= config.focus;
  state.showConnections ??= true;
  let car: THREE.Object3D | undefined, view: ReturnType<typeof scene3D> | undefined;
  let model!: THREE.Object3D, locator!: THREE.Box3Helper;
  let disposeReplaced = () => {};
  let links: (ExplorerConfig['connections'][number] & { line: THREE.Line })[] = [];
  try {
    model = createAssembly();
    const parts = model.children
      .filter((object) => object.userData.label)
      .map((object, i) => {
        const { label, explode, description } = object.userData as {
          label: string;
          explode: number[];
          description: string;
        };
        return {
          object,
          number: i + 1,
          initial: object.position.clone(),
          label,
          explode,
          description,
          marker: document.createElement('span'),
          leader: document.createElement('i'),
        };
      });
    const byName = new Map(parts.map((part) => [part.object.name, part]));
    if (!byName.has(state.part)) state.part = config.focus;
    if (!byName.has(config.focus)) throw new Error(`Unknown focus part in ${config.id}`);
    const { stage, controls, explanation } = panel(host, {
      title: config.title,
      description:
        'Locate the assembly, follow its connections, then separate its main parts. Select a part for a closer view; drag to rotate and pinch or scroll to zoom.',
      note: `2010 European/UK 2.9. Blue: selected part. Dashed links: functional connections. Geometry, routes and separation are schematic.${config.note ? ` ${config.note}` : ''}`,
    });
    host.classList.add('component-explorer');
    stage.style.overflow = 'hidden';
    stage.classList.add('diagram-stage-3d');
    const markers = document.createElement('div');
    markers.className = 'component-markers';
    markers.setAttribute('aria-hidden', 'true');
    for (const part of parts) {
      const marker = part.marker;
      marker.textContent = String(part.number);
      marker.className = 'component-marker';
      markers.append(marker);
      part.marker = marker;
      const leader = part.leader;
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
      const projected: { name: string; x: number; y: number }[] = [];
      const width = stage.clientWidth,
        height = stage.clientHeight;
      const bounds = stage.getBoundingClientRect();
      const title = callout.getBoundingClientRect();
      const blocked = {
        left: title.left - bounds.left,
        top: title.top - bounds.top,
        right: title.right - bounds.left,
        bottom: title.bottom - bounds.top,
      };
      for (const part of parts) {
        const p = surfaceAnchor(part.object).project(view.camera);
        const x = ((p.x + 1) * width) / 2;
        const y = ((1 - p.y) * height) / 2;
        const visible =
          state.progress >= 20 && p.z > -1 && p.z < 1 && x >= 14 && x <= width - 14 && y >= 14 && y <= height - 14;
        part.marker.hidden = !visible;
        part.leader.hidden = !visible;
        if (!visible) continue;
        const point = placeMarker({ x, y }, width, height, projected, blocked);
        if (!point) {
          part.marker.hidden = part.leader.hidden = true;
          continue;
        }
        const dx = point.x - x,
          dy = point.y - y;
        part.marker.style.left = `${point.x}px`;
        part.marker.style.top = `${point.y}px`;
        Object.assign(part.leader.style, {
          left: `${x}px`,
          // Centre the one-pixel leader stroke on the projected surface point.
          top: `${y - 0.5}px`,
          width: `${Math.hypot(dx, dy)}px`,
          transform: `rotate(${Math.atan2(dy, dx)}rad)`,
        });
        part.marker.classList.toggle('is-selected', part.object.name === state.part);
        projected.push({ name: part.object.name, ...point });
      }
      host.dataset.projectedParts = JSON.stringify(projected);
      const front = new THREE.Vector3(0, 0.2, 2.34).project(view.camera);
      orient.hidden = state.progress >= 35 || Math.abs(front.x) > 0.9 || Math.abs(front.y) > 0.9;
      orient.style.left = `${((front.x + 1) * stage.clientWidth) / 2}px`;
      orient.style.top = `${((1 - front.y) * stage.clientHeight) / 2}px`;
    };
    let update = () => {};
    let assembledBox: THREE.Box3,
      assembledCorners: THREE.Vector3[],
      explodedBox: THREE.Box3,
      explodedCorners: THREE.Vector3[],
      carBox: THREE.Box3,
      carCorners: THREE.Vector3[],
      contextBox: THREE.Box3;
    const focusBox = new THREE.Box3().setFromObject(byName.get(config.focus)!.object);
    locator = new THREE.Box3Helper(focusBox, '#327cc3');
    (locator.material as THREE.LineBasicMaterial).depthTest = false;
    (locator.material as THREE.LineBasicMaterial).transparent = true;
    (locator.material as THREE.LineBasicMaterial).opacity = 0.9;
    links = config.connections.map((connection) => {
      if (!byName.has(connection.from) || !byName.has(connection.to))
        throw new Error(`Unknown connection in ${config.id}`);
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const line = new THREE.Line(
        geometry,
        new THREE.LineDashedMaterial({
          color: connectionColours[connection.kind] ?? '#6d7a80',
          dashSize: 0.045,
          gapSize: 0.025,
          transparent: true,
          opacity: 0.85,
        }),
      );
      return { ...connection, line };
    });
    let stageRow: HTMLDivElement, partRow: HTMLDivElement;
    const direction = new THREE.Vector3(...(config.direction ?? [1.25, 0.85, 1.65])).normalize();
    const carDirection = new THREE.Vector3(1.05, 0.7, 1.45).normalize();
    update = () => {
      const progress = state.progress;
      const selected = byName.get(state.part)!;
      const exploded = segment(progress, 65, 100);
      const stop = [...stops].reverse().find((stop) => progress >= stop.value) ?? stops[0];
      const text = [config.location, config.overview, config.assembled, config.exploded][stops.indexOf(stop)];
      callout.textContent = state.focusPart ? selected.label : stop.label;
      explanation.textContent = state.focusPart
        ? selected.description
        : `${text}${progress >= 60 ? ` ${selected.label}: ${selected.description}` : ''}`;
      const connections = links.filter((link) => link.from === state.part || link.to === state.part);
      relationship.textContent = `Connected to ${selected.label.toLowerCase()}: ${connections.map((link) => `${byName.get(link.from === state.part ? link.to : link.from)!.label} — ${link.label}`).join('; ')}.`;
      stageRow
        ?.querySelectorAll('button')
        .forEach((button, i) => button.setAttribute('aria-pressed', String(!state.focusPart && stops[i] === stop)));
      partRow
        ?.querySelectorAll('button')
        .forEach((button, i) => button.setAttribute('aria-pressed', String(parts[i] === selected)));
      Object.assign(host.dataset, {
        progress: String(progress),
        exploded: exploded.toFixed(3),
        part: state.part,
        focusPart: String(Boolean(state.focusPart)),
        explorer: config.id,
        connectionCount: String(links.length),
      });
      if (!car || !view) return;
      const contextOpacity = 1 - segment(progress, 0, 55);
      for (const subsystem of car.children) {
        opacity(subsystem, contextOpacity * (1 - segment(progress, 10, 30) * 0.82));
      }
      for (const part of parts) {
        part.object.position.copy(part.initial).addScaledVector(new THREE.Vector3(...part.explode), exploded);
        const chosen = part === selected;
        const ghost =
          config.ghostParts?.includes(part.object.name) && !state.focusPart ? 1 - segment(progress, 10, 45) * 0.84 : 1;
        opacity(part.object, ghost * (state.focusPart && !chosen ? 0.18 : 1));
        part.object.traverse((object) => {
          if (!isRenderable(object)) return;
          for (const material of [object.material].flat().filter(Boolean)) {
            const highlight = chosen && progress >= 20;
            if (material instanceof THREE.MeshStandardMaterial) {
              material.emissive.set(highlight ? '#124879' : '#000000');
              material.emissiveIntensity = highlight ? 0.65 : 0;
            }
          }
        });
      }
      model.updateMatrixWorld(true);
      for (const link of links) {
        link.line.visible = state.showConnections && progress >= 20;
        link.line.geometry.setFromPoints([
          surfaceAnchor(byName.get(link.from)!.object),
          surfaceAnchor(byName.get(link.to)!.object),
        ]);
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
      view.render();
    };
    const progress = slider(controls, {
      label: 'Explore the assembly',
      value: state.progress,
      format: (value) => `${value}%`,
      signal,
      onChange: (value) => {
        state.progress = value;
        state.focusPart = false;
        update();
      },
    });
    stageRow = buttons(
      controls,
      stops.map((stop) => ({ label: stop.label, action: () => progress.set(stop.value) })),
      signal,
    );
    partRow = buttons(
      controls,
      parts.map((part) => ({
        label: part.label,
        action: () => {
          state.part = part.object.name;
          state.progress = 100;
          state.focusPart = true;
          progress.set(100, false);
          update();
        },
      })),
      signal,
    );
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
    checkbox.addEventListener(
      'change',
      () => {
        state.showConnections = checkbox.checked;
        update();
      },
      { signal },
    );
    toggle.append(checkbox, ' Show connections');
    controls.append(toggle);
    buttons(
      controls,
      [
        {
          label: 'Reset view',
          action: () => {
            state.part = config.focus;
            state.showConnections = true;
            checkbox.checked = true;
            progress.set(0);
          },
        },
      ],
      signal,
    );
    update();
    host.dispatchEvent(new Event('diagram-layout'));
    await whenVisible;
    signal.throwIfAborted();
    car = await loadModel(reference, signal, base);
    disposeReplaced = installAssembly(car, config, model);
    parts.forEach((part) => isolateMaterials(part.object));
    signal.addEventListener('abort', disposeReplaced, { once: true });
    assembledBox = new THREE.Box3().setFromObject(model);
    assembledCorners = geometryCorners(model);
    locator.box.setFromObject(byName.get(config.focus)!.object);
    for (const part of parts) part.object.position.copy(part.initial).add(new THREE.Vector3(...part.explode));
    explodedBox = new THREE.Box3().setFromObject(model);
    explodedCorners = geometryCorners(model);
    for (const part of parts) part.object.position.copy(part.initial);
    view = scene3D(stage, { signal, onRender: projectMarkers, onResize: () => update() });
    view.controls.maxDistance = 20;
    view.renderer.domElement.setAttribute('aria-label', `${config.title}. ${config.location}`);
    view.scene.add(car, model);
    view.scene.add(locator);
    links.forEach((link) => view!.scene.add(link.line));
    carBox = new THREE.Box3().setFromObject(car).union(assembledBox);
    carCorners = [...geometryCorners(car), ...assembledCorners];
    contextBox = carBox.clone().union(assembledBox);
    update();
    const mountedView = view;
    return () => {
      mountedView.dispose();
      disposeReplaced();
    };
  } catch (error) {
    disposeReplaced();
    if (view) view.dispose();
    else {
      if (car) disposeObject(car);
      if (model) disposeObject(model);
      if (locator) disposeObject(locator);
      links.forEach((link) => disposeObject(link.line));
    }
    throw error;
  }
}
