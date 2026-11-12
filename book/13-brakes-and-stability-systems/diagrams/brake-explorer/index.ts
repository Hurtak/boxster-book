import * as THREE from 'three';
import { sampleTimeline, segment } from '../../../../interactive/math.ts';
import reference from '../../../../interactive/models/reference-car.glb';
import { installAssembly } from '../../../../interactive/three/installed-assembly.ts';
import { cameraHelp, disposeObject, loadModel, opacity, scene3D } from '../../../../interactive/three/scene.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel, slider } from '../../../../interactive/ui.ts';
import assembly from './brake.glb';
import config from './scene.json';

export async function mount(host: HTMLElement, { state: saved, signal, whenVisible }: DiagramContext) {
  const state = initializeState(saved, { progress: 0, part: 'disc', focusPart: false });
  state.progress ??= 0;
  state.part ??= 'disc';
  const { stage, controls, explanation } = panel(host, {
    title: 'From the car to the front brake',
    description: `Move through the assembly with the slider. Select a part for a closer view. ${cameraHelp}`,
    note: '2010 2.9 layout with a photo-guided green and tan car. Selected parts are blue; the wheel is ghosted to expose the brake. Factory PET plates 602-000, 604-010 and 401-005 identify the parts. Mechanical geometry, pipe and wire routing, colours, clearances and exploded distances are illustrative.',
  });
  stage.classList.add('diagram-stage-3d');
  let visualProgress = state.progress;
  let visualFocus = Number(state.focusPart);
  let paint = (_animate = false) => {},
    stageRow: HTMLDivElement,
    partRow: HTMLDivElement;
  const stageFor = (p: number) =>
    segment(p, 65, 100) > 0
      ? config.stages.at(-1)!
      : ([...config.stages].reverse().find((item) => p >= item.value) ?? config.stages[0]);
  const update = (animate = false) => {
    const p = state.progress,
      exploded = segment(p, 65, 100);
    const currentStage = stageFor(p);
    const selected = config.parts.find((part) => part.name === state.part)!;
    explanation.textContent = `${currentStage.text} ${p >= 60 ? selected.text : ''}`;
    stageRow
      ?.querySelectorAll('button')
      .forEach((button, i) => button.setAttribute('aria-pressed', String(config.stages[i] === currentStage)));
    partRow
      ?.querySelectorAll('button')
      .forEach((button, i) => button.setAttribute('aria-pressed', String(config.parts[i].name === state.part)));
    host.dataset.progress = String(p);
    host.dataset.exploded = exploded.toFixed(3);
    host.dataset.part = state.part;
    paint(animate);
  };
  const progress = slider(controls, {
    label: 'Explore the assembly',
    value: state.progress,
    format: (v) => `${v}%`,
    signal,
    onChange: (value) => {
      state.progress = value;
      state.focusPart = false;
      update();
    },
  });
  stageRow = buttons(
    controls,
    config.stages.map((item) => ({
      label: item.label,
      action: () => {
        state.progress = item.value;
        state.focusPart = false;
        progress.set(item.value, false);
        update(true);
      },
    })),
    signal,
  );
  partRow = buttons(
    controls,
    config.parts.map((part) => ({
      label: part.label,
      action: () => {
        state.part = part.name;
        state.progress = 100;
        state.focusPart = true;
        progress.set(100, false);
        update(true);
      },
    })),
    signal,
  );
  buttons(
    controls,
    [
      {
        label: 'Reset view',
        action: () => {
          state.part = 'disc';
          state.progress = 0;
          state.focusPart = false;
          progress.set(0, false);
          update(true);
        },
      },
    ],
    signal,
  );
  update();
  host.dispatchEvent(new Event('diagram-layout'));
  await whenVisible;
  signal.throwIfAborted();
  const loaded = await Promise.allSettled([
    loadModel(reference, signal, import.meta.url),
    loadModel(assembly, signal, import.meta.url),
  ]);
  const failure = loaded.find((result) => result.status === 'rejected');
  if (failure) {
    loaded.filter((result) => result.status === 'fulfilled').forEach((result) => disposeObject(result.value));
    throw failure.reason;
  }
  const [car, brake] = loaded.map((result) => {
    if (result.status !== 'fulfilled') throw result.reason;
    return result.value;
  });
  let view;
  try {
    view = scene3D(stage, { signal });
  } catch (error) {
    disposeObject(car);
    disposeObject(brake);
    throw error;
  }
  view.scene.add(car, brake);
  brake.position.set(0.76, 0.329, 1.2075);
  const disposeReplaced = installAssembly(car, {
    id: 'brake-explorer',
    hideCarParts: ['wheel-fl', 'brake-fl'],
  });
  signal.addEventListener('abort', disposeReplaced, { once: true });
  const body = car.getObjectByName('body')!;
  const faded = ['chassis', 'interior', 'engine', 'gearbox', 'wheel-fr', 'wheel-rl', 'wheel-rr'].map((name) =>
    car.getObjectByName(name)!,
  );
  const lines = car.getObjectByName('hydraulics')!;
  const wheelAxis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.24, 0, 0), new THREE.Vector3(1.2, 0, 0)]),
    new THREE.LineDashedMaterial({
      color: '#7d9387',
      dashSize: 0.025,
      gapSize: 0.018,
      transparent: true,
    }),
  );
  wheelAxis.computeLineDistances();
  brake.add(wheelAxis);
  const parts = config.parts.map((part) => {
    const object = brake.getObjectByName(part.name);
    if (!object) throw new Error(`Missing named model part: ${part.name}`);
    const surfaces = new Map();
    object.traverse((mesh) => {
      if (!(mesh instanceof THREE.Mesh)) return;
      const clone = (material: THREE.Material) => {
        if (!surfaces.has(material)) surfaces.set(material, material.clone());
        return surfaces.get(material);
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(clone) : clone(mesh.material);
    });
    return { ...part, object, initial: object.position.clone() };
  });
  const callout = document.createElement('div');
  callout.className = 'diagram-callout';
  stage.append(callout);
  paint = (animate) => {
    const startProgress = visualProgress;
    const startFocus = visualFocus;
    const startPosition = view.camera.position.clone();
    const startTarget = view.controls.target.clone();
    view.transition((amount, moveCamera) => {
      visualProgress = THREE.MathUtils.lerp(startProgress, state.progress, amount);
      visualFocus = THREE.MathUtils.lerp(startFocus, Number(state.focusPart), amount);
      const p = visualProgress;
      const pose = sampleTimeline(p, config.camera);
      opacity(body, 1 - segment(p, 5, 52));
      faded.forEach((object) => opacity(object, 1 - segment(p, 35, 65)));
      opacity(lines, 1 - segment(p, 35, 60));
      const exploded = segment(p, 65, 100);
      wheelAxis.visible = exploded > 0 && visualFocus < 1;
      wheelAxis.material.opacity = exploded * 0.6;
      for (const part of parts) {
        part.object.position.copy(part.initial).addScaledVector(new THREE.Vector3(...part.offset), exploded);
        if (part.name === 'wheel' && p > 30) part.object.position.x += segment(p, 30, 65) * 0.18;
        part.object.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          for (const material of [object.material].flat()) {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.emissive.set(part.name === state.part ? '#123b78' : '#000000');
              material.emissiveIntensity = part.name === state.part ? 0.65 : 0;
            }
          }
        });
        const ghost = part.name === 'wheel' && state.part !== 'wheel' ? 1 - segment(p, 45, 65) * 0.85 : 1;
        opacity(part.object, THREE.MathUtils.lerp(ghost, part.name === state.part ? 1 : 0.08, visualFocus));
      }
      const currentStage = stageFor(p);
      const selected = parts.find((part) => part.name === state.part)!;
      callout.textContent = state.focusPart ? selected.label : currentStage.label;
      if (!moveCamera) return;
      const position = new THREE.Vector3(...pose.position);
      const target = new THREE.Vector3(...pose.target);
      if (state.focusPart) {
        brake.updateMatrixWorld(true);
        const sphere = new THREE.Box3().setFromObject(selected.object).getBoundingSphere(new THREE.Sphere());
        const vertical = THREE.MathUtils.degToRad(view.camera.fov / 2);
        const halfFov = Math.min(vertical, Math.atan(Math.tan(vertical) * view.camera.aspect));
        const distance = Math.max(0.35, (sphere.radius / Math.sin(halfFov)) * 1.25);
        const direction = position.clone().sub(target).normalize();
        target.copy(sphere.center);
        position.copy(sphere.center).addScaledVector(direction, distance);
      }
      if (amount === 1) {
        view.camera.position.copy(position);
        view.controls.target.copy(target);
      } else {
        view.camera.position.copy(startPosition).lerp(position, amount);
        view.controls.target.copy(startTarget).lerp(target, amount);
      }
      view.controls.update();
    }, animate);
  };
  update();
  return () => {
    view.dispose();
    disposeReplaced();
  };
}
