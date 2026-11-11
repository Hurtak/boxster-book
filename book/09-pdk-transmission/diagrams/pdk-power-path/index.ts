import { Selection } from 'd3-selection';
import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { panel, slider } from '../../../../interactive/ui.ts';

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
  const clutches =
    phase === 1
      ? { [outgoing]: 'releasing', [incoming]: 'applying' }
      : {
          [outgoing]: phase === 0 ? 'closed' : 'open',
          [incoming]: phase === 0 ? 'open' : 'closed',
        };
  return {
    ...shift,
    outgoing,
    incoming,
    gears,
    clutches,
    driving: phase === 0 ? shift.from : phase === 1 ? 'transfer' : shift.to,
  };
}

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { shift: 0, phase: 0 });
  if (!Number.isInteger(state.shift) || !shifts[state.shift]) state.shift = 0;
  if (!Number.isInteger(state.phase) || state.phase < 0 || state.phase > 3) state.phase = 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'A selected gear can turn behind an open clutch',
    description:
      'Choose a shift, then follow engine drive and the gear already selected on the other path. An open clutch disconnects the engine; it does not stop that input shaft.',
    note: 'Functional paths unfolded side by side; the input shafts are actually concentric. Clutch symbols show friction contact or an open gap, not disc count or geometry. Transfer uses regulated slip, never two rigidly locked ratios. Stages have no calibrated timing; the next gear is an illustrative prediction.',
  });
  stage.style.height = '620px';
  const wrapper = document.createElement('div');
  const label = document.createElement('label');
  const select = document.createElement('select');
  const selectId = `${host.closest<HTMLElement>('[data-diagram]')?.dataset.diagram ?? 'pdk-power-path'}-shift`;
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

  const redraw = svgDiagram(
    stage,
    'Two PDK clutch paths with selected gears and clutch states',
    (svg, { width }) => {
      svg.selectAll('*').remove();
      const model = shiftState(state.shift, state.phase);
      const cx = width / 2;
      const ink = '#243c32';
      const drive = '#176b53';
      const passive = '#697c71';
      const amber = '#a56418';
      const transfer = state.phase === 1;
      svg.append('title').text(`PDK ${model.from} to ${model.to}: ${phases[state.phase]}`);
      svg
        .append('desc')
        .text(
          'Two unfolded clutch and selected-gear paths share an output. A visible gap marks an open clutch. Green arrows show engine drive, grey upward arrows show a selected shaft being turned from the output, and amber shows regulated frictional handover. The real input shafts are concentric.',
        );
      const text = (x: number, y: number, value: string | number, size = 20, colour: string = ink) =>
        svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('font-size', size)
          .attr('fill', colour)
          .text(value);
      const halo = (node: Selection<SVGTextElement, unknown, null, undefined>) =>
        node.attr('stroke', '#f1f3f2').attr('stroke-width', 7).attr('paint-order', 'stroke');
      const line = (x1: number, y1: number, x2: number, y2: number, colour: string, weight = 4) =>
        svg
          .append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', colour)
          .attr('stroke-width', weight);
      const box = (x: number, y: number, w: number, h: number, fill: string, stroke: string) =>
        svg
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', w)
          .attr('height', h)
          .attr('rx', 5)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2);
      const arrow = (x: number, y: number, down: boolean, colour: string) =>
        svg
          .append('path')
          .attr(
            'd',
            down
              ? `M${x - 7},${y - 9} L${x},${y} L${x + 7},${y - 9}`
              : `M${x - 7},${y + 9} L${x},${y} L${x + 7},${y + 9}`,
          )
          .attr('fill', 'none')
          .attr('stroke', colour)
          .attr('stroke-width', 3);

      box(cx - 68, 12, 136, 42, '#edf3ee', '#526c5d');
      text(cx, 40, 'Engine', 23);
      line(cx, 54, cx, 78, ink);
      line(width * 0.25, 78, width * 0.75, 78, ink);
      for (const clutch of [1, 2]) {
        const x = width * (clutch === 1 ? 0.25 : 0.75);
        const status = model.clutches[clutch];
        const active = status !== 'open';
        const colour = transfer ? amber : active ? drive : passive;
        const lowerPlate = active ? 156 : 178;
        line(x, 78, x, 150, ink);
        halo(text(x, 114, `Clutch K${clutch}`, 21));
        // The two faces touch when clamped or slipping; only an open clutch has a gap.
        line(x - 30, 150, x + 30, 150, ink, 6);
        line(x - 30, lowerPlate, x + 30, lowerPlate, colour, 6);
        line(x, lowerPlate, x, 314, colour, active ? 6 : 3);
        halo(text(x, 212, status, 20, colour));
        halo(text(x, 255, `Shaft ${clutch}`, 21));
        halo(text(x, 282, clutch === 1 ? 'inner · odd + R' : 'hollow · even', 18));
        const card = Math.min(156, width * 0.45);
        box(x - card / 2, 314, card, 70, '#fff', colour);
        text(x, 342, `Gear ${model.gears[clutch]}`, 23);
        text(x, 369, transfer ? 'handover' : active ? 'engine drive' : 'output-driven', 18, colour);
        line(x, 384, x, 432, colour, active ? 6 : 3);
        arrow(x, active ? 419 : 398, active, colour);
      }
      line(width * 0.25, 432, width * 0.75, 432, ink, 5);
      line(cx, 432, cx, 487, ink, 5);
      halo(text(cx, 465, 'Common output', 21));
      box(cx - 106, 487, 212, 68, '#edf3ee', '#526c5d');
      text(cx, 513, 'Final drive', 22);
      text(cx, 544, 'then differential', 20);
      line(cx, 555, cx, 571, ink, 4);
      arrow(cx, 571, true, ink);
      text(cx, 604, 'Rear wheels', 21);
      const detail = [
        `Gear ${model.from} drives through K${model.outgoing}, which is closed. Gear ${model.to} is already selected on the other path, but K${model.incoming} is open. The common output turns the selected ${model.to} path back towards open K${model.incoming}; its shaft can run at a different speed from the engine. The grey upward arrow shows this mechanical connection, not a second engine-drive path.`,
        `Both gears stay selected. K${model.outgoing} releases as K${model.incoming} applies. Regulated clutch slip allows the engine speed to ${model.to > model.from ? 'fall for this upshift' : 'rise for this downshift'} towards the new ratio while drive is handed over. Amber indicates frictional handover, not fixed shares of torque or two rigidly locked clutches.`,
        `Gear ${model.to} now drives through closed K${model.incoming}. K${model.outgoing} is open; gear ${model.from} can remain selected briefly and be turned from the output without carrying engine drive. Its open clutch separates this input-shaft speed from the engine.`,
        `Gear ${model.to} continues to drive. Behind open K${model.outgoing}, the old gear is deselected and gear ${model.next} is synchronised and selected for a possible ${model.next > model.to ? 'upshift' : 'downshift'}. The displayed state is after that selection: the output can turn this shaft through gear ${model.next}. The controller can choose a different next gear when demand changes.`,
      ];
      explanation.textContent = detail[state.phase];
      Object.assign(host.dataset, {
        pdkShift: `${model.from}-${model.to}`,
        pdkPhase: String(state.phase),
        pdkK1: model.clutches[1],
        pdkK2: model.clutches[2],
        pdkOddGear: String(model.gears[1]),
        pdkEvenGear: String(model.gears[2]),
        pdkDriving: String(model.driving),
      });
    },
    signal,
  );
  const phase = slider(controls, {
    label: 'Shift stage',
    min: 0,
    max: 3,
    step: 1,
    value: state.phase,
    format: (value) => `${value + 1}/4 · ${phases[value]}`,
    signal,
    onChange: (value) => {
      state.phase = value;
      redraw();
    },
  });
  select.addEventListener(
    'change',
    () => {
      state.shift = Number(select.value);
      state.phase = 0;
      phase.set(0, false);
      redraw();
    },
    { signal },
  );
  return () => {};
}
