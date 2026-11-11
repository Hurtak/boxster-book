import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel, slider } from '../../../../interactive/ui.ts';

// A constant circular force envelope, not a tyre or whole-car simulation.
export function gripBudget(longitudinal: number, lateral: number, capacity: number) {
  if (![longitudinal, lateral, capacity].every(Number.isFinite) || longitudinal < 0 || lateral < 0 || capacity <= 0) {
    throw new RangeError('Force demands must be finite and non-negative; capacity must be positive');
  }
  const resultant = Math.hypot(longitudinal, lateral);
  return {
    resultant,
    remainingLateral: Math.sqrt(Math.max(0, capacity ** 2 - longitudinal ** 2)),
    within: resultant <= capacity + 1e-10,
  };
}

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { longitudinal: 60, lateral: 60, capacity: 100 });
  const bounded = (value: unknown, fallback: number, min: number, max: number) =>
    typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
  state.longitudinal = bounded(state.longitudinal, 60, 0, 120);
  state.lateral = bounded(state.lateral, 60, 0, 120);
  state.capacity = bounded(state.capacity, 100, 40, 100);
  const { stage, controls, explanation } = panel(host, {
    title: 'One tyre, a shared grip budget',
    description:
      'Change the force demands and the available capacity. The marker shows the requested combination, even outside the circle.',
    note: 'Illustrative force units at one tyre. Constant circular envelope, fixed wheel load and no transient response. These controls are not pedal travel, steering angle, slip or a Porsche calibration. A real tyre can have an asymmetric envelope; this diagram does not predict the forces actually delivered or a slide.',
  });
  stage.style.height = '380px';
  let longitudinal, lateral, capacity;
  const redraw = svgDiagram(
    stage,
    'Requested longitudinal and lateral tyre forces against a circular teaching envelope',
    (svg, { width }) => {
      const result = gripBudget(state.longitudinal, state.lateral, state.capacity);
      const ink = '#243a32',
        green = '#17654c',
        demand = result.within ? green : '#885c2c';
      const cx = width / 2,
        cy = 190,
        scale = Math.min(width * 0.32, 126) / 120;
      const extent = 125 * scale;
      const x = cx + state.lateral * scale,
        y = cy - state.longitudinal * scale;
      const label = (x: number, y: number, text: string | number, colour: string = ink, size = 16) =>
        svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('font-size', size)
          .attr('fill', colour)
          .text(text);
      svg.selectAll('*').remove();
      svg
        .append('desc')
        .text(
          `Demand: ${state.longitudinal} longitudinal and ${state.lateral} lateral units. Resultant ${result.resultant.toFixed(1)} against capacity ${state.capacity}. ${result.within ? 'Within' : 'Outside'} the illustrative envelope. The point is a request, not a simulated delivered force.`,
        );
      svg
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', state.capacity * scale)
        .attr('fill', '#e0ebe4')
        .attr('stroke', green)
        .attr('stroke-width', 3);
      for (const [x1, y1, x2, y2] of [
        [cx - extent, cy, cx + extent, cy],
        [cx, cy + extent, cx, cy - extent],
      ] as const) {
        svg
          .append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', '#64766d')
          .attr('stroke-width', 1.5);
      }
      svg
        .append('path')
        .attr('d', `M${cx},${y}H${x}V${cy}`)
        .attr('fill', 'none')
        .attr('stroke', demand)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5 4');
      svg
        .append('line')
        .attr('x1', cx)
        .attr('y1', cy)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', demand)
        .attr('stroke-width', 4);
      svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 6).attr('fill', demand);
      label(cx, 27, '↑ Longitudinal force demand');
      label(cx, 53, `${state.longitudinal} units`, demand);
      label(cx, 338, `Cornering demand → ${state.lateral} units`, demand);
      label(cx, 366, `Capacity ${state.capacity} · ${result.within ? 'Within envelope' : 'Outside envelope'}`, demand);
      explanation.textContent = `The requested resultant is ${result.resultant.toFixed(1)} units against ${state.capacity} available. With ${state.longitudinal} longitudinal units requested, the circle leaves at most ${result.remainingLateral.toFixed(1)} for cornering. ${result.within ? 'This combination fits the teaching envelope.' : 'The requested combination exceeds the envelope. The tyre cannot supply both requested forces within this model; the actual response is not simulated.'}`;
      Object.assign(host.dataset, {
        gripLongitudinal: state.longitudinal,
        gripLateral: state.lateral,
        gripCapacity: state.capacity,
        gripResultant: result.resultant,
        gripRemaining: result.remainingLateral,
        gripWithin: result.within,
      });
    },
    signal,
  );
  longitudinal = slider(controls, {
    label: 'Longitudinal force demand',
    min: 0,
    max: 120,
    value: state.longitudinal,
    signal,
    format: (value) => `${value} units`,
    onChange: (value) => {
      state.longitudinal = value;
      redraw();
    },
  });
  lateral = slider(controls, {
    label: 'Cornering force demand',
    min: 0,
    max: 120,
    value: state.lateral,
    signal,
    format: (value) => `${value} units`,
    onChange: (value) => {
      state.lateral = value;
      redraw();
    },
  });
  capacity = slider(controls, {
    label: 'Available grip capacity',
    min: 40,
    max: 100,
    value: state.capacity,
    signal,
    format: (value) => `${value} units`,
    onChange: (value) => {
      state.capacity = value;
      redraw();
    },
  });
  const preset = (fx: number, fy: number, limit: number) => {
    Object.assign(state, { longitudinal: fx, lateral: fy, capacity: limit });
    longitudinal.set(fx, false);
    lateral.set(fy, false);
    capacity.set(limit, false);
    redraw();
  };
  buttons(
    controls,
    [
      { label: 'Straight braking', action: () => preset(100, 0, 100) },
      { label: 'Shared demand', action: () => preset(60, 60, 100) },
      { label: 'Too much demand', action: () => preset(60, 90, 100) },
      { label: 'Reduced capacity', action: () => preset(60, 60, 70) },
    ],
    signal,
  );
  redraw();
}
