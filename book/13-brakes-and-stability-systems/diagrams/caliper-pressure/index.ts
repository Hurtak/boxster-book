import { scaleLinear } from 'd3';
import { clamp } from '../../../../interactive/math.ts';
import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { panel, slider } from '../../../../interactive/ui.ts';

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { input: 0 });
  state.input ??= 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'Four pistons, two pads',
    description: 'Raise hydraulic pressure to see opposing pistons squeeze the disc. The caliper body stays fixed.',
    note: 'Conceptual Boxster 2.9 fixed-caliper cutaway. Piston sizes, passages and clearances are schematic; pad take-up is omitted. The percentage is a display scale, not bar, pedal travel or a vehicle limit.',
  });
  stage.style.height = '440px';
  const redraw = svgDiagram(
    stage,
    'Four-piston fixed caliper with pads on both sides of the disc',
    (svg, { width, height }) => {
      svg.selectAll('*').remove();
      const cx = width / 2;
      const top = 82;
      const bottom = height - 142;
      const pressure = clamp(state.input / 100);
      // Released/applied states, not a pedal-travel or seal-compliance simulation.
      const gap = pressure === 0 ? 14 : 0;
      const colour = scaleLinear([0, 1], ['#a9c2de', '#1d5fbf'])(pressure);
      const ink = '#22272d';
      const forceColour = '#9d3e2c';
      const text = (x: number, y: number, content: string | number, anchor = 'middle') =>
        svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', anchor)
          .attr('font-size', 15)
          .attr('fill', '#363c44')
          .text(content);
      const line = (d: string, stroke: string = '#526159', strokeWidth = 1.5) =>
        svg.append('path').attr('d', d).attr('fill', 'none').attr('stroke', stroke).attr('stroke-width', strokeWidth);
      svg.append('title').text('Four-piston aluminium monobloc fixed caliper');
      svg
        .append('desc')
        .text(
          `Two pistons on each side press a pad against a ventilated disc. Connected fluid chambers share pressure p. Each piston force is p times its area; each pad receives p times the sum of its two piston areas. ${pressure === 0 ? 'Released, with exaggerated pad clearances.' : `Applied at ${Math.round(pressure * 100)} percent of an illustrative pressure range; arrows point inward.`}`,
        );

      line(`M${cx - 124},${bottom} V${top} H${cx + 124} V${bottom}`, ink, 20).attr('stroke-linejoin', 'round');
      // The connection is functional, not a claimed drawing of Porsche's internal routing.
      line(`M${cx},48 V${top} M${cx - 124},247 V${top} H${cx + 124} V247`, colour, 5);
      text(cx - 16, 22, 'One-piece', 'end');
      text(cx - 16, 44, 'fixed body', 'end');
      line(`M${cx - 82},51 V${top - 12}`);
      text(cx + 12, 40, 'Fluid pressure p', 'start');
      text(cx + 12, 62, `${Math.round(pressure * 100)}% relative`, 'start');

      // Two disc faces with a ventilation channel between them.
      svg
        .append('rect')
        .attr('x', cx - 13)
        .attr('y', 106)
        .attr('width', 26)
        .attr('height', bottom - 90)
        .attr('fill', '#9ba5b3');
      svg
        .append('rect')
        .attr('x', cx - 4)
        .attr('y', 106)
        .attr('width', 8)
        .attr('height', bottom - 90)
        .attr('fill', '#eef1f4');
      for (let y = 116; y < bottom + 8; y += 30) line(`M${cx - 4},${y} H${cx + 4}`, '#9ba5b3', 4);

      for (const side of [-1, 1]) {
        const liningX = side < 0 ? cx - 26 - gap : cx + 13 + gap;
        const backingX = side < 0 ? cx - 32 - gap : cx + 26 + gap;
        svg
          .append('rect')
          .attr('x', liningX)
          .attr('y', 126)
          .attr('width', 13)
          .attr('height', 162)
          .attr('fill', '#b0764d');
        svg.append('rect').attr('x', backingX).attr('y', 126).attr('width', 6).attr('height', 162).attr('fill', ink);
        for (const [i, y] of [169, 247].entries()) {
          const pistonBack = cx + side * (82 + gap);
          const padBack = cx + side * (32 + gap);
          const chamberX = side < 0 ? cx - 124 : pistonBack;
          svg
            .append('rect')
            .attr('x', chamberX)
            .attr('y', y - 15)
            .attr('width', 42 - gap)
            .attr('height', 30)
            .attr('fill', colour);
          // Grey piston remains solid; blue fluid acts only on its back face.
          svg
            .append('rect')
            .attr('x', Math.min(pistonBack, padBack))
            .attr('y', y - 15)
            .attr('width', 50)
            .attr('height', 30)
            .attr('rx', 2)
            .attr('fill', '#9ba5b3')
            .attr('stroke', '#526159');
          const housingEnd = cx + side * 52;
          const housingOuter = cx + side * 134;
          line(`M${housingEnd},${y - 19} H${housingOuter} V${y + 19} H${housingEnd}`, ink, 4);
          text(cx + side * (59 + gap), y + 40, i === 0 ? 'A₁' : 'A₂');
          if (pressure > 0) {
            const tip = cx + side * (37 + gap);
            const tail = tip + side * 40 * pressure;
            const arrowSize = 2 + 4 * pressure;
            line(`M${tail},${y} H${tip}`, forceColour, 1 + 3 * pressure);
            svg
              .append('path')
              .attr(
                'd',
                `M${tip},${y} L${tip + side * arrowSize},${y - arrowSize} L${tip + side * arrowSize},${y + arrowSize} Z`,
              )
              .attr('fill', forceColour);
          }
        }
      }
      text(cx - 104, bottom + 28, '2 pistons');
      text(cx + 104, bottom + 28, '2 pistons');
      text(cx - 70, bottom + 51, 'Pad');
      text(cx + 70, bottom + 51, 'Pad');
      line(`M${cx - 70},${bottom + 35} L${cx - 20 - gap},286`);
      line(`M${cx + 70},${bottom + 35} L${cx + 20 + gap},286`);
      text(cx, bottom + 76, 'Ventilated disc');
      line(`M${cx},${bottom + 18} V${bottom + 57}`);
      text(cx, height - 28, 'Each pad: F = p(A₁ + A₂)');
      text(cx, height - 6, pressure === 0 ? 'Released: gaps exaggerated' : 'Arrows: inward piston force');
      explanation.textContent =
        pressure === 0
          ? 'Released: the pads have a tiny running clearance, shown enlarged here. Raising pressure switches to the applied state; pad take-up is not simulated.'
          : `The pads are in contact at ${Math.round(pressure * 100)}% of the display range. Connected chambers share pressure p. Each piston pushes with F = pA, so equal pressure need not mean equal piston force. Each pad receives the sum from its two pistons (areas A₁ and A₂).`;
      host.dataset.relativePressure = String(pressure);
    },
    signal,
  );
  slider(controls, {
    label: 'Relative hydraulic pressure',
    value: state.input,
    format: (v) => `${v}%`,
    signal,
    onChange: (value) => {
      state.input = value;
      redraw();
    },
  });
  return () => {};
}
