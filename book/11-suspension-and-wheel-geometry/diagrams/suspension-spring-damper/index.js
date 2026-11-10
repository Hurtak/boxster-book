import { line } from 'd3';
import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

// A deliberately simple linear teaching model, not Porsche component data.
export function forces(compressionMm, velocityMs) {
  return { springForceN: compressionMm * 20, damperForceN: -velocityMs * 1500 };
}

export function mount(host, { state, signal }) {
  state.compressionMm ??= 20;
  state.velocityMs ??= 0.1;
  const { stage, controls, explanation } = panel(host, {
    title: 'Position loads the spring; motion loads the damper',
    description: 'Change compression and velocity independently. These are two properties of one instant, not a simulated journey over a bump.',
    note: 'Illustrative linear model: spring 20 N/mm; damper 1,500 N·s/m. Arrows show forces on the body; values are extra forces beyond static support. These are not measured Boxster rates. The spring and damper are separated here for clarity; the car uses coil-over struts.',
  });
  stage.style.height = '340px';
  const redraw = svgDiagram(stage, 'A spring responds to compression while a damper opposes motion', (svg, { width }) => {
    svg.selectAll('*').remove();
    const { springForceN, damperForceN } = forces(state.compressionMm, state.velocityMs);
    const sx = width * 0.29;
    const dx = width * 0.71;
    const top = 68;
    const bottom = 232 - state.compressionMm;
    const text = (x, y, content, colour = '#273e35') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('font-size', 16).attr('fill', colour).text(content);
    const path = (points, colour, stroke = 4) => svg.append('path').attr('d', line()(points)).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', stroke).attr('stroke-linejoin', 'round');
    const arrow = (x, y, force, colour) => {
      if (Math.abs(force) < 0.01) return;
      const direction = force > 0 ? -1 : 1;
      const end = y + direction * (20 + Math.min(Math.abs(force) / 15, 35));
      path([[x, y], [x, end]], colour, 3);
      path([[x - 5, end - direction * 8], [x, end], [x + 5, end - direction * 8]], colour, 3);
    };
    text(width / 2, 23, 'Body / upper mounting');
    path([[28, 45], [width - 28, 45]], '#273e35', 12);
    path([[sx, 45], [sx, top]], '#273e35');
    const coil = [[sx, top]];
    for (let i = 0; i < 10; i++) coil.push([sx + (i % 2 ? -16 : 16), top + 12 + i * (bottom - top - 24) / 9]);
    coil.push([sx, bottom]);
    path(coil, '#a6552b');
    path([[dx, 45], [dx, top + 30]], '#273e35');
    svg.append('rect').attr('x', dx - 17).attr('y', top + 26).attr('width', 34).attr('height', bottom - top - 26).attr('fill', '#dbe7ed').attr('stroke', '#27627b').attr('stroke-width', 3);
    path([[dx - 13, top + 55], [dx + 13, top + 55]], '#27627b');
    path([[dx, top + 55], [dx, bottom]], '#27627b');
    path([[sx - 32, bottom], [dx + 32, bottom]], '#273e35', 9);
    text(width / 2, bottom + 27, 'Wheel / lower mounting');
    arrow(sx - 40, 145, springForceN, '#a6552b');
    arrow(dx + 40, 145, -damperForceN, '#27627b');
    text(sx, 284, 'Spring', '#a6552b');
    text(dx, 284, 'Damper', '#27627b');
    text(sx, 311, `${springForceN.toFixed(0)} N extra`);
    text(dx, 311, `${Math.abs(damperForceN).toFixed(0)} N ${damperForceN < 0 ? 'resists bump' : damperForceN > 0 ? 'resists rebound' : 'at rest'}`);
    explanation.textContent = `The spring has ${springForceN.toFixed(0)} N of additional restoring force. ${state.velocityMs === 0 ? 'With no relative motion, the ideal damper produces no force, even though the spring remains compressed.' : `The damper opposes ${state.velocityMs > 0 ? 'compression' : 'extension'} with ${Math.abs(damperForceN).toFixed(0)} N. Reverse the velocity and its force reverses; the spring force stays the same.`}`;
    Object.assign(host.dataset, { compressionMm: state.compressionMm, velocityMs: state.velocityMs, springForceN, damperForceN });
  }, signal);
  const compression = slider(controls, { label: 'Extra spring compression', min: 0, max: 40, step: 1, value: state.compressionMm, format: v => `${v} mm`, signal, onChange: value => { state.compressionMm = value; redraw(); } });
  const velocity = slider(controls, { label: 'Compression velocity', min: -0.2, max: 0.2, step: 0.01, value: state.velocityMs, format: v => `${v.toFixed(2)} m/s${v < 0 ? ' (rebound)' : v > 0 ? ' (bump)' : ' (stationary)'}`, signal, onChange: value => { state.velocityMs = value; redraw(); } });
  buttons(controls, [{ label: 'Hold still, spring loaded', action: () => { state.compressionMm = 20; state.velocityMs = 0; compression.set(20, false); velocity.set(0, false); redraw(); } }], signal);
  return () => {};
}
