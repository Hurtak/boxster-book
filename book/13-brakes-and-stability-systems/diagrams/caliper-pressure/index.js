import { scaleLinear } from 'd3';
import { panel, slider } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';
import { clamp } from '../../../../interactive/math.js';

export function mount(host, { state, signal }) {
  state.input ??= 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'Pressure closes the gap',
    description: 'Move the pedal input to follow four pistons pressing two pads against the disc.',
    note: 'Simplified fixed-caliper cutaway. Clearances and piston movement are exaggerated; pressure is relative, not a measured Boxster calibration.',
  });
  const redraw = svgDiagram(stage, 'Four-piston fixed caliper with pads on both sides of the disc', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const cx = width / 2;
    const top = 84;
    const bottom = height - 72;
    const gap = scaleLinear([0, 15], [18, 0]).clamp(true)(state.input);
    const pressure = clamp((state.input - 15) / 85);
    const colour = scaleLinear([0, 1], ['#9aa3af', '#1d5fbf'])(pressure);
    const text = (x, y, content, anchor = 'middle') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', 13).attr('fill', '#363c44').text(content);
    svg.append('path').attr('d', `M${cx - 106},${bottom} V${top} H${cx + 106} V${bottom}`).attr('fill', 'none').attr('stroke', '#22272d').attr('stroke-width', 18).attr('stroke-linejoin', 'round');
    svg.append('path').attr('d', `M${cx},32 V${top - 8} M${cx - 106},${top} H${cx + 106}`).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 5);
    text(cx, 20, 'Hydraulic pressure');
    svg.append('rect').attr('x', cx - 12).attr('y', top + 20).attr('width', 24).attr('height', bottom - top + 10).attr('fill', '#9ba5b3');
    svg.append('rect').attr('x', cx - 3).attr('y', top + 20).attr('width', 6).attr('height', bottom - top + 10).attr('fill', '#eef1f4');
    const padHeight = bottom - top - 28;
    for (const side of [-1, 1]) {
      const padX = side < 0 ? cx - 26 - gap : cx + 12 + gap;
      svg.append('rect').attr('x', padX).attr('y', top + 34).attr('width', 14).attr('height', padHeight).attr('rx', 2).attr('fill', '#b0764d');
      for (const fraction of [0.32, 0.72]) {
        const y = top + (bottom - top) * fraction;
        const start = side < 0 ? cx - 106 : cx + 26 + gap;
        const length = 80 - gap;
        svg.append('rect').attr('x', start).attr('y', y - 15).attr('width', length).attr('height', 30).attr('rx', 3).attr('fill', colour).attr('stroke', '#3e4854');
        svg.append('path').attr('d', `M${cx + side * 106},${top} V${y}`).attr('stroke', colour).attr('stroke-width', 5).attr('fill', 'none');
      }
    }
    text(cx, bottom + 52, 'Ventilated disc');
    text(cx - 91, bottom + 31, '2 pistons');
    text(cx + 91, bottom + 31, '2 pistons');
    text(cx, top + 16, 'One-piece caliper body');
    explanation.textContent = state.input < 15
      ? 'The pistons take up the small clearance between pads and disc.'
      : `The pads are in contact. More input raises relative hydraulic pressure to ${Math.round(pressure * 100)}%; clamping force rises with it.`;
    host.dataset.relativePressure = pressure;
  }, signal);
  slider(controls, { label: 'Pedal input', value: state.input, format: (v) => `${v}%`, signal, onChange: (value) => { state.input = value; redraw(); } });
  return () => {};
}
