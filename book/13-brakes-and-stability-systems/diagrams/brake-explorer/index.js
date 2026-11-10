import * as THREE from 'three';
import reference from '../../../../interactive/models/reference-car.glb';
import assembly from './brake.glb';
import config from './scene.json';
import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { scene3D, loadModel, opacity, disposeObject } from '../../../../interactive/three/scene.js';
import { sampleTimeline, segment } from '../../../../interactive/math.js';

export async function mount(host, { state, signal }) {
  state.progress ??= 0;
  state.part ??= 'disc';
  const loaded = await Promise.allSettled([loadModel(reference, signal, import.meta.url), loadModel(assembly, signal, import.meta.url)]);
  const failure = loaded.find((result) => result.status === 'rejected');
  if (failure) {
    loaded.filter((result) => result.status === 'fulfilled').forEach((result) => disposeObject(result.value));
    throw failure.reason;
  }
  const [car, brake] = loaded.map((result) => result.value);
  const { stage, controls, explanation } = panel(host, {
    title: 'From the car to the front brake',
    description: 'Move through the assembly with the slider. Select a part for a closer view. Drag to rotate; pinch or scroll to zoom.',
    note: '2010 2.9 layout with a photo-guided green and tan car. Selected parts are blue; the wheel is ghosted to expose the brake. Mechanical geometry, pipe routing, clearances and exploded distances are illustrative.',
  });
  let view;
  try { view = scene3D(stage, { signal }); }
  catch (error) { disposeObject(car); disposeObject(brake); throw error; }
  view.scene.add(car, brake);
  brake.position.set(0.76, 0.329, 1.2075);
  car.getObjectByName('wheel-fl').visible = false;
  const body = car.getObjectByName('body');
  const faded = ['chassis', 'interior', 'engine', 'gearbox', 'wheel-fr', 'wheel-rl', 'wheel-rr'].map((name) => car.getObjectByName(name));
  const lines = car.getObjectByName('hydraulics');
  const wheelAxis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.24, 0, 0), new THREE.Vector3(1.2, 0, 0)]),
    new THREE.LineDashedMaterial({ color: '#7d9387', dashSize: 0.025, gapSize: 0.018, transparent: true }),
  );
  wheelAxis.computeLineDistances();
  brake.add(wheelAxis);
  const parts = config.parts.map((part) => {
    const object = brake.getObjectByName(part.name);
    if (!object) throw new Error(`Missing named model part: ${part.name}`);
    const surfaces = new Map();
    object.traverse((mesh) => {
      if (!mesh.material) return;
      const clone = (material) => {
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
  let stageRow;
  let partRow;
  const update = () => {
    const p = state.progress;
    const pose = sampleTimeline(p, config.camera);
    body.position.y = segment(p, 0, 30) * 0.75;
    opacity(body, 1 - segment(p, 5, 52));
    faded.forEach((object) => opacity(object, 1 - segment(p, 35, 65)));
    opacity(lines, 1 - segment(p, 35, 60));
    const exploded = segment(p, 65, 100);
    wheelAxis.visible = exploded > 0 && !state.focusPart;
    wheelAxis.material.opacity = exploded * 0.6;
    for (const part of parts) {
      part.object.position.copy(part.initial).addScaledVector(new THREE.Vector3(...part.offset), exploded);
      if (part.name === 'wheel' && p > 30) part.object.position.x += segment(p, 30, 65) * 0.18;
      part.object.traverse((object) => {
        if (!object.material) return;
        for (const material of [object.material].flat()) {
          material.emissive?.set(part.name === state.part ? '#123b78' : '#000000');
          if (material.emissive) material.emissiveIntensity = part.name === state.part ? 0.65 : 0;
        }
      });
      opacity(part.object, state.focusPart && part.name !== state.part ? 0.08 : part.name === 'wheel' && state.part !== 'wheel' ? 1 - segment(p, 45, 65) * 0.85 : 1);
    }
    const currentStage = exploded > 0 ? config.stages.at(-1) : [...config.stages].reverse().find((item) => p >= item.value) ?? config.stages[0];
    const selected = parts.find((part) => part.name === state.part);
    view.camera.position.fromArray(pose.position);
    view.controls.target.fromArray(pose.target);
    if (state.focusPart) {
      brake.updateMatrixWorld(true);
      const sphere = new THREE.Box3().setFromObject(selected.object).getBoundingSphere(new THREE.Sphere());
      const vertical = THREE.MathUtils.degToRad(view.camera.fov / 2);
      const halfFov = Math.min(vertical, Math.atan(Math.tan(vertical) * view.camera.aspect));
      const distance = Math.max(0.35, sphere.radius / Math.sin(halfFov) * 1.25);
      const direction = view.camera.position.clone().sub(view.controls.target).normalize();
      view.controls.target.copy(sphere.center);
      view.camera.position.copy(sphere.center).addScaledVector(direction, distance);
    }
    view.controls.update();
    callout.textContent = state.focusPart ? selected.label : currentStage.label;
    explanation.textContent = `${currentStage.text} ${p >= 60 ? selected.text : ''}`;
    stageRow?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(config.stages[i] === currentStage)));
    partRow?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(parts[i].name === state.part)));
    host.dataset.progress = p;
    host.dataset.exploded = exploded.toFixed(3);
    host.dataset.part = state.part;
    view.render();
  };
  const progress = slider(controls, { label: 'Explore the assembly', value: state.progress, format: (v) => `${v}%`, signal, onChange: (value) => { state.progress = value; state.focusPart = false; update(); } });
  stageRow = buttons(controls, config.stages.map((item) => ({ label: item.label, action: () => progress.set(item.value) })), signal);
  partRow = buttons(controls, parts.map((part) => ({ label: part.label, action: () => { state.part = part.name; progress.set(100); state.focusPart = true; update(); } })), signal);
  buttons(controls, [{ label: 'Reset view', action: () => { state.part = 'disc'; progress.set(0); } }], signal);
  update();
  return view.dispose;
}
