import { panel, slider } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const shifts = [
  { from: 1, to: 2, next: 3 },
  { from: 2, to: 3, next: 4 },
  { from: 3, to: 4, next: 5 },
  { from: 4, to: 3, next: 2 },
];
const phases = ['Ready', 'Transfer', 'New gear', 'Prepare next'];

// Discrete teaching states: no pressure, duration or torque calibration is implied.
export function shiftState(shiftIndex = 0, phase = 0) {
  const shift = shifts[shiftIndex];
  const outgoing = shift.from % 2 ? 1 : 2;
  const incoming = outgoing === 1 ? 2 : 1;
  const gears = { [outgoing]: phase === 3 ? shift.next : shift.from, [incoming]: shift.to };
  const clutches = phase === 1
    ? { [outgoing]: 'releasing', [incoming]: 'applying' }
    : { [outgoing]: phase === 0 ? 'closed' : 'open', [incoming]: phase === 0 ? 'open' : 'closed' };
  return { ...shift, outgoing, incoming, gears, clutches, driving: phase === 0 ? shift.from : phase === 1 ? 'transfer' : shift.to };
}

export function mount(host, { state, signal }) {
  if (!Number.isInteger(state.shift) || !shifts[state.shift]) state.shift = 0;
  if (!Number.isInteger(state.phase) || state.phase < 0 || state.phase > 3) state.phase = 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'A gear ready behind an open clutch',
    description: 'Choose an upshift or downshift, then move through four stages. Read the clutch state as well as the selected gear.',
    note: 'Functional schematic. Transfer shows regulated frictional overlap, never two clutches rigidly locked at different ratios. Stages are not equally timed; the next preselection is an illustrative prediction, not a Porsche shift map.',
  });
  stage.style.height = '460px';
  const wrapper = document.createElement('div');
  const label = document.createElement('label');
  const select = document.createElement('select');
  const selectId = `${host.closest('[data-diagram]')?.dataset.diagram ?? 'pdk-power-path'}-shift`;
  label.htmlFor = selectId;
  label.textContent = 'Gear change';
  select.id = selectId;
  select.style.cssText = 'display:block;min-height:44px;max-width:100%;margin:8px 0 16px;font:inherit;padding:6px;';
  shifts.forEach((shift, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${shift.from} → ${shift.to} ${shift.to > shift.from ? 'upshift' : 'downshift'}`;
    select.append(option);
  });
  select.value = String(state.shift);
  wrapper.append(label, select);
  controls.append(wrapper);

  const redraw = svgDiagram(stage, 'Two PDK clutch paths with selected gears and clutch states', (svg, { width }) => {
    svg.selectAll('*').remove();
    const model = shiftState(state.shift, state.phase);
    const cx = width / 2;
    const text = (x, y, value, size = 20, colour = '#243c32') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('font-size', size).attr('fill', colour).text(value);
    const box = (x, y, w, h, fill, stroke) => svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 5).attr('fill', fill).attr('stroke', stroke).attr('stroke-width', 2);
    box(cx - 70, 12, 140, 46, '#edf3ee', '#526c5d');
    text(cx, 42, 'Engine', 23);
    for (const clutch of [1, 2]) {
      const x = width * (clutch === 1 ? 0.25 : 0.75);
      const status = model.clutches[clutch];
      const transfer = state.phase === 1;
      const active = status !== 'open';
      const colour = transfer ? '#ac681b' : active ? '#176b53' : '#84938b';
      const line = svg.append('path').attr('d', `M${cx},58 V86 H${x} V360 H${cx} V376`).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', active ? 7 : 3);
      if (!active) line.attr('stroke-dasharray', '7 6');
      const card = Math.min(142, width * 0.44);
      box(x - card / 2, 115, card, 76, active ? '#edf4ef' : '#f6f6f3', colour);
      text(x, 143, `K${clutch} · ${clutch === 1 ? 'odd' : 'even'}`, 21);
      text(x, 174, status, 20, colour);
      text(x, 222, clutch === 1 ? 'Inner shaft' : 'Hollow shaft', 20).attr('stroke', '#fff').attr('stroke-width', 5).attr('paint-order', 'stroke');
      box(x - card / 2, 245, card, 74, '#fff', colour);
      text(x, 274, `Gear ${model.gears[clutch]}`, 23);
      text(x, 304, transfer ? 'handover' : active ? 'driving' : 'waiting', 20, colour);
    }
    box(cx - 85, 376, 170, 44, '#edf3ee', '#526c5d');
    text(cx, 405, 'Final drive', 22);
    text(cx, 451, 'Then differential → wheels', width < 330 ? 19 : 21);
    const detail = [
      `Gear ${model.from} drives through K${model.outgoing}, which is closed. Gear ${model.to} is already selected on the other path, but K${model.incoming} is open. That path is ready without connecting the engine through a second ratio.`,
      `Both gears stay selected. K${model.outgoing} releases as K${model.incoming} applies. Controlled clutch slip permits the engine speed to move towards the new ratio while drive is handed over. The amber paths indicate transfer, not fixed shares of torque.`,
      `Gear ${model.to} now drives through closed K${model.incoming}. K${model.outgoing} is open; gear ${model.from} can remain selected briefly without carrying engine drive.`,
      `Gear ${model.to} continues to drive. Behind open K${model.outgoing}, the old gear is deselected and gear ${model.next} is prepared for a possible ${model.next > model.to ? 'upshift' : 'downshift'}. The controller can choose a different next gear when demand changes.`,
    ];
    explanation.textContent = detail[state.phase];
    Object.assign(host.dataset, {
      pdkShift: `${model.from}-${model.to}`,
      pdkPhase: String(state.phase),
      pdkK1: model.clutches[1], pdkK2: model.clutches[2],
      pdkOddGear: String(model.gears[1]), pdkEvenGear: String(model.gears[2]),
      pdkDriving: String(model.driving),
    });
  }, signal);
  const phase = slider(controls, { label: 'Shift stage', min: 0, max: 3, step: 1, value: state.phase, format: value => `${value + 1}/4 · ${phases[value]}`, signal, onChange: value => { state.phase = value; redraw(); } });
  select.addEventListener('change', () => { state.shift = Number(select.value); state.phase = 0; phase.set(0, false); redraw(); }, { signal });
  return () => {};
}
