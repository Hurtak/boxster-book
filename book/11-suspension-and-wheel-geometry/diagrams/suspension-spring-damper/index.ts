import { line } from 'd3';
import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel, slider } from '../../../../interactive/ui.ts';

// A deliberately simple linear teaching model, not Porsche component data.
// Positive velocity means shortening: the lower mounting rises relative to the body.
// springForceN is additional upward force on the body. The retained damperForceN
// is -c*v, the resistance on the lower mounting in that compression coordinate;
// the equal, opposite damper force on the body is -damperForceN.
export function forces(compressionMm: number, velocityMs: number) {
  return { springForceN: compressionMm * 20, damperForceN: -velocityMs * 1500 };
}

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { compressionMm: 20, velocityMs: 0.1 });
  state.compressionMm ??= 20;
  state.velocityMs ??= 0.1;
  const { stage, controls, explanation } = panel(host, {
    title: 'Position loads the spring; motion loads the damper',
    description:
      'Change compression and velocity independently. These are two properties of one instant, not a simulated journey over a bump. The body is held fixed to make relative movement clear.',
    note: 'Illustrative linear model: spring 20 N/mm; damper 1,500 N·s/m. Spring force is extra beyond static support; the ideal damper shows only velocity force. Solid arrows show force direction on the body (up is positive); the lower mounting feels equal, opposite forces. The separated spring and simplified hydraulic symbol explain functions, not measured Boxster geometry or calibration. The car uses coil-over struts.',
  });
  stage.style.height = '452px';
  const redraw = svgDiagram(
    stage,
    'A spring responds to compression while a damper opposes motion',
    (svg, { width }) => {
      svg.selectAll('*').remove();
      const { springForceN, damperForceN } = forces(state.compressionMm, state.velocityMs);
      const damperBodyForceN = -damperForceN;
      const sx = width * 0.24;
      const dx = width * 0.68;
      const top = 104;
      const bottom = 316 - 1.5 * state.compressionMm;
      // The upper rod and piston stay with the body. The fixed-length cylinder
      // translates with the lower mounting, so shortening inserts more rod.
      const pistonY = 186;
      const cylinderTop = bottom - 154;
      const cylinderBottom = bottom - 18;
      const text = (x: number, y: number, content: string | number, colour: string = '#273e35', anchor = 'middle') =>
        svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', anchor)
          .attr('font-size', 16)
          .attr('fill', colour)
          .text(content);
      const path = (points: Iterable<[number, number]> | number[][], colour: string, stroke: number = 4) =>
        svg
          .append('path')
          .attr('d', line<readonly number[]>()(points))
          .attr('fill', 'none')
          .attr('stroke', colour)
          .attr('stroke-width', stroke)
          .attr('stroke-linejoin', 'round');
      const arrow = (x: number, y: number, signedValue: number, colour: string, dashed = false) => {
        if (Math.abs(signedValue) < 0.001) return;
        const direction = signedValue > 0 ? -1 : 1;
        const end = y + direction * (dashed ? 32 : 24 + Math.min(Math.abs(signedValue) / 30, 22));
        const shaft = path(
          [
            [x, y],
            [x, end],
          ],
          colour,
          3,
        );
        if (dashed) shaft.attr('stroke-dasharray', '5 4');
        path(
          [
            [x - 5, end - direction * 8],
            [x, end],
            [x + 5, end - direction * 8],
          ],
          colour,
          3,
        );
        return shaft;
      };
      svg.append('title').text('Spring position and damper velocity, viewed with the body fixed');
      svg
        .append('desc')
        .text(
          'The spring shortens between body and lower mounting. The damper rod and piston attach to the body; its cylinder moves with the lower mounting. Solid arrows show body forces; the dashed arrow shows lower-mount motion. Upward body force and compression velocity are positive.',
        );
      text(width / 2, 20, 'Body / upper mounting');
      path(
        [
          [24, 78],
          [width - 24, 78],
        ],
        '#273e35',
        10,
      );
      path(
        [
          [sx, 78],
          [sx, top],
        ],
        '#273e35',
      );
      const coil = [[sx, top]];
      for (let i = 0; i < 10; i++) coil.push([sx + (i % 2 ? -16 : 16), top + 12 + (i * (bottom - top - 24)) / 9]);
      coil.push([sx, bottom]);
      path(coil, '#a6552b');
      svg
        .append('rect')
        .attr('data-part', 'damper-cylinder')
        .attr('x', dx - 22)
        .attr('y', cylinderTop)
        .attr('width', 44)
        .attr('height', cylinderBottom - cylinderTop)
        .attr('fill', '#dbe7ed')
        .attr('stroke', '#27627b')
        .attr('stroke-width', 3);
      path(
        [
          [dx, cylinderBottom],
          [dx, bottom],
        ],
        '#27627b',
      );
      path(
        [
          [dx, 78],
          [dx, pistonY],
        ],
        '#273e35',
        5,
      ).attr('data-part', 'damper-rod');
      svg
        .append('rect')
        .attr('data-part', 'damper-piston')
        .attr('x', dx - 20)
        .attr('y', pistonY - 5)
        .attr('width', 40)
        .attr('height', 10)
        .attr('fill', '#27627b');
      for (const offset of [-10, 10])
        path(
          [
            [dx + offset, pistonY - 5],
            [dx + offset, pistonY + 5],
          ],
          '#faf8f1',
          3,
        );
      // Leaders label functional parts without implying a Porsche valve circuit.
      const labelX = width * 0.47;
      text(labelX, 101, 'Rod');
      path(
        [
          [labelX + 18, 96],
          [dx - 2.5, 96],
        ],
        '#526159',
        1,
      );
      text(labelX, 187, 'Piston');
      text(labelX, 206, '/ valves');
      path(
        [
          [labelX + 25, 183],
          [dx - 20, pistonY],
        ],
        '#526159',
        1,
      );
      text(labelX, 238, 'Cylinder');
      path(
        [
          [labelX + 30, 233],
          [dx - 22, cylinderBottom - 40],
        ],
        '#526159',
        1,
      );
      path(
        [
          [sx - 26, bottom],
          [dx + 26, bottom],
        ],
        '#273e35',
        9,
      ).attr('data-part', 'lower-mounting');
      text((sx + dx) / 2, bottom + 24, 'Wheel / lower mounting');
      arrow(sx - 34, 78, springForceN, '#a6552b')?.attr('data-part', 'spring-body-force');
      arrow(dx + 35, 78, damperBodyForceN, '#27627b')?.attr('data-part', 'damper-body-force');
      arrow(Math.min(width - 16, dx + 62), bottom, state.velocityMs, '#526159', true)?.attr(
        'data-part',
        'lower-mount-motion',
      );
      text(
        width / 2,
        371,
        state.velocityMs > 0
          ? 'Dashed: moving up (compression)'
          : state.velocityMs < 0
            ? 'Dashed: moving down (rebound)'
            : 'Lower mounting stationary',
      );
      text(sx, 404, 'Spring force', '#a6552b');
      text(dx, 404, 'Damper force', '#27627b');
      const forceLabel = (value: number) =>
        `${Math.abs(value).toFixed(0)} N${value > 0 ? ' ↑' : value < 0 ? ' ↓' : ''}`;
      text(sx, 431, forceLabel(springForceN));
      text(dx, 431, forceLabel(damperBodyForceN));
      explanation.textContent = `At ${state.compressionMm} mm extra compression, the spring adds ${springForceN.toFixed(0)} N upward on the body. ${state.velocityMs === 0 ? 'With no relative motion, the ideal damper has no velocity force; spring support remains.' : `During ${state.velocityMs > 0 ? 'compression' : 'rebound'}, the damper pushes the body ${state.velocityMs > 0 ? 'upward' : 'downward'} with ${Math.abs(damperForceN).toFixed(0)} N and the lower mounting ${state.velocityMs > 0 ? 'downward' : 'upward'}. This opposes their relative movement. Oil passing through valves converts mechanical energy into heat.`}`;
      Object.assign(host.dataset, {
        compressionMm: state.compressionMm,
        velocityMs: state.velocityMs,
        springForceN,
        damperForceN,
        damperBodyForceN,
      });
    },
    signal,
  );
  const compression = slider(controls, {
    label: 'Extra spring compression',
    min: 0,
    max: 40,
    step: 1,
    value: state.compressionMm,
    format: (v) => `${v} mm`,
    signal,
    onChange: (value) => {
      state.compressionMm = value;
      redraw();
    },
  });
  const velocity = slider(controls, {
    label: 'Compression velocity',
    min: -0.2,
    max: 0.2,
    step: 0.01,
    value: state.velocityMs,
    format: (v) => `${v.toFixed(2)} m/s${v < 0 ? ' (rebound)' : v > 0 ? ' (bump)' : ' (stationary)'}`,
    signal,
    onChange: (value) => {
      state.velocityMs = value;
      redraw();
    },
  });
  buttons(
    controls,
    [
      {
        label: 'Hold still, spring loaded',
        action: () => {
          state.compressionMm = 20;
          state.velocityMs = 0;
          compression.set(20, false);
          velocity.set(0, false);
          redraw();
        },
      },
    ],
    signal,
  );
  return () => {};
}
