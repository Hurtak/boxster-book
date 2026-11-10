import { line, scaleLinear } from 'd3';
import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

export function mount(host, { state, signal }) {
  state.advance ??= 0;
  state.highLift ??= false;
  const { stage, controls, explanation } = panel(host, {
    title: 'Timing moves the event; lift changes its height',
    description: 'Advance an illustrative inlet event, then switch between the 2.9’s two documented peak inlet lifts.',
    note: 'The 3.6 and 10.0 mm peaks and 40° crank-angle adjustment range are Porsche technical values. The smooth curves and equal durations are teaching geometry, not measured valve profiles, opening angles or an ECU map.',
  });
  let row;
  const redraw = svgDiagram(stage, 'Inlet valve lift against illustrative crank angle, showing phase and two lift settings', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const left = 39, right = width - 16, top = 42, bottom = height - 57;
    const x = scaleLinear([0, 360], [left, right]);
    const y = scaleLinear([0, 11], [bottom, top]);
    const text = (px, py, value, anchor = 'middle') => svg.append('text').attr('x', px).attr('y', py).attr('text-anchor', anchor).attr('font-size', 14).attr('fill', '#263d34').text(value);
    for (const value of [0, 3.6, 10]) {
      svg.append('line').attr('x1', left).attr('x2', right).attr('y1', y(value)).attr('y2', y(value)).attr('stroke', '#d3dbd4');
      text(left - 7, y(value) + 4, String(value), 'end');
    }
    text(left, 20, 'Lift (mm)', 'start');
    text(right, 20, 'Earlier ←', 'end');
    const curve = (lift, advance) => Array.from({ length: 361 }, (_, a) => {
      const position = (a - (65 - advance)) / 220;
      return [a, position > 0 && position < 1 ? lift * Math.sin(Math.PI * position) ** 2 : 0];
    });
    const path = line().x(d => x(d[0])).y(d => y(d[1]));
    svg.append('path').attr('d', path(curve(10, 0))).attr('fill', 'none').attr('stroke', '#98a69d').attr('stroke-width', 2).attr('stroke-dasharray', '5 5');
    const lift = state.highLift ? 10 : 3.6;
    svg.append('path').attr('d', path(curve(lift, state.advance))).attr('fill', 'none').attr('stroke', '#176b53').attr('stroke-width', 4);
    for (const value of [0, 180, 360]) text(x(value), bottom + 22, `${value}°`);
    text((left + right) / 2, height - 10, 'Illustrative crank angle');
    explanation.textContent = `Peak inlet lift: ${lift.toFixed(1)} mm. Timing advanced ${state.advance}° of crank angle from the illustrative reference. Advancing shifts the whole event earlier; changing lift selects a different cam profile. The dashed curve is the high-lift reference at zero advance.`;
    host.dataset.engineAdvance = String(state.advance);
    host.dataset.engineLiftMm = lift.toFixed(1);
    row?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === Number(state.highLift))));
  }, signal);
  // svgDiagram draws immediately; the row exists on subsequent redraws.
  slider(controls, { label: 'Illustrative inlet advance', min: 0, max: 40, step: 1, value: state.advance, format: value => `${value}° crank`, signal, onChange: value => { state.advance = value; redraw(); } });
  row = buttons(controls, [
    { label: 'Low lift · 3.6 mm', action: () => { state.highLift = false; redraw(); } },
    { label: 'High lift · 10.0 mm', action: () => { state.highLift = true; redraw(); } },
  ], signal);
  redraw();
  return () => {};
}
