import { line, scaleLinear } from 'd3';
import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

export function mount(host, { state, signal }) {
  state.advance ??= 0;
  state.highLift ??= false;
  const { stage, controls, explanation } = panel(host, {
    title: 'Timing moves the event; lift selects its profile',
    description: 'Advance an illustrative inlet event, then choose either of the 2.9’s two peak inlet lifts. Compare each setting with the dashed reference.',
    note: 'Porsche specifies 3.6/10.0 mm inlet lifts and a 40° total crank-angle phase range. Curves, equal durations and mechanism symbols are illustrative. Plot zero is arbitrary, not TDC; neither opening angles nor ECU switching thresholds are reproduced. The valve symbol shows the selected peak, not a running engine.',
  });
  stage.style.height = '530px';
  let row;
  const redraw = svgDiagram(stage, 'Inlet lift against illustrative crank angle, with a vane phase adjuster and two selectable cam profiles', (svg, { width }) => {
    svg.selectAll('*').remove();
    svg.append('title').text('Inlet cam phase and profile selection');
    svg.append('desc').text('The dashed event is the selected lift at zero advance. A vane adjuster symbol shows relative cam phase, two symbolic lobes show profile selection, and the inlet valve is drawn at the selected peak. Curves and mechanism geometry are illustrative.');
    const ink = '#263d34', green = '#176b53', amber = '#a4712f', muted = '#87988c';
    const left = 43, right = width - 19, top = 106, bottom = 275;
    const x = scaleLinear([0, 360], [left, right]);
    const y = scaleLinear([0, 11], [bottom, top]);
    const text = (px, py, value, anchor = 'middle', size = 16, fill = ink) => svg.append('text').attr('x', px).attr('y', py).attr('text-anchor', anchor).attr('font-size', size).attr('fill', fill).text(value);
    const segment = (x1, y1, x2, y2, color = ink, dash) => svg.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', color).attr('stroke-width', 2).attr('stroke-dasharray', dash || null);
    const arrow = (x1, y1, x2, y2) => {
      segment(x1, y1, x2, y2, muted);
      svg.append('path').attr('d', `M${x2 - 6},${y2 - 4}L${x2},${y2}L${x2 - 6},${y2 + 4}`).attr('fill', 'none').attr('stroke', muted).attr('stroke-width', 2);
    };
    const lift = state.highLift ? 10 : 3.6;
    const selected = state.highLift ? green : amber;
    text(0, 19, 'Inlet lift (mm)', 'start');
    text(width, 19, 'Earlier ←', 'end');
    segment(0, 45, 25, 45, selected);
    text(34, 50, 'Selected event', 'start');
    segment(0, 70, 25, 70, muted, '5 5');
    text(34, 75, 'Same lift, zero advance', 'start');
    for (const value of [0, 3.6, 10]) {
      segment(left, y(value), right, y(value), '#d3dbd4');
      text(left - 7, y(value) + 5, String(value), 'end');
    }
    // A teaching profile only: keeping duration fixed isolates phase from lift.
    const curve = (peak, advance) => Array.from({ length: 361 }, (_, a) => {
      const position = (a - (65 - advance)) / 220;
      return [a, position > 0 && position < 1 ? peak * Math.sin(Math.PI * position) ** 2 : 0];
    });
    const path = line().x(d => x(d[0])).y(d => y(d[1]));
    svg.append('path').attr('d', path(curve(lift, 0))).attr('fill', 'none').attr('stroke', muted).attr('stroke-width', 3).attr('stroke-dasharray', '5 5');
    svg.append('path').attr('d', path(curve(lift, state.advance))).attr('fill', 'none').attr('stroke', selected).attr('stroke-width', 4);
    // Keep a visible phase reference when the two curves coincide.
    segment(x(175), y(lift) - 8, x(175), bottom, muted, '3 5');
    svg.append('circle').attr('cx', x(175 - state.advance)).attr('cy', y(lift)).attr('r', 4).attr('fill', selected);
    for (const value of [0, 180, 360]) text(x(value), bottom + 24, `${value}°`);
    text((left + right) / 2, 324, 'Illustrative crank angle');
    text(width / 2, 350, '0° is arbitrary; not a TDC reference.', 'middle', 15);

    text(0, 388, 'Functional view · selected settings', 'start');
    const phaseX = width / 6, profileX = width / 2, valveX = width * 5 / 6, cy = 438;
    // Outer ring represents the chain-driven adjuster housing; inner vanes
    // represent the inlet cam's relative phase, not its running rotation.
    svg.append('circle').attr('cx', phaseX).attr('cy', cy).attr('r', 27).attr('fill', '#e4e9e2').attr('stroke', muted).attr('stroke-width', 3);
    segment(phaseX, cy - 25, phaseX, cy - 37, muted, '3 3');
    const rotor = svg.append('g').attr('transform', `translate(${phaseX},${cy}) rotate(${-state.advance / 2})`);
    rotor.append('path').attr('d', 'M0,-22V22M-22,0H22').attr('stroke', green).attr('stroke-width', 7);
    rotor.append('circle').attr('r', 7).attr('fill', green);
    arrow(phaseX + 34, cy, profileX - 39, cy);
    // Symbolic low/high lobes on the inlet cam. The selected motion is
    // transmitted to the valve; no tappet locking layout is implied.
    for (const [high, offset] of [[false, -17], [true, 17]]) {
      svg.append('path').attr('d', high ? 'M0,15C-22,15 -20,-9 0,-30C20,-9 22,15 0,15Z' : 'M0,15C-20,15 -16,-7 0,-18C16,-7 20,15 0,15Z')
        .attr('transform', `translate(${profileX + offset},${cy + 5})`).attr('fill', high === state.highLift ? selected : '#e4e9e2').attr('stroke', high === state.highLift ? selected : muted).attr('stroke-width', 2);
    }
    arrow(profileX + 39, cy, valveX - 20, cy);
    const valveHead = cy + 2 + lift * 1.6;
    segment(valveX - 17, cy + 1, valveX + 17, cy + 1, muted, '4 3');
    segment(valveX, valveHead - 44, valveX, valveHead, selected);
    segment(valveX - 16, valveHead, valveX + 16, valveHead, selected);
    text(phaseX, 489, 'Vane adjuster');
    text(phaseX, 512, `${state.advance / 2}° cam phase`, 'middle', 15);
    text(profileX, 489, 'Cam profiles');
    text(profileX, 512, state.highLift ? 'High selected' : 'Low selected', 'middle', 15, selected);
    text(valveX, 489, 'Inlet valve');
    text(valveX, 512, `${lift.toFixed(1)} mm peak`, 'middle', 15, selected);

    explanation.textContent = `Peak inlet lift: ${lift.toFixed(1)} mm. Advanced ${state.advance}° crank (${state.advance / 2}° at the half-speed cam) from the illustrative reference. Oil-controlled vanes change inlet cam phase relative to its chain drive; opening and closing move earlier together. Lift selection changes the cam profile. Dashed: the same lift at zero advance${state.advance === 0 ? ', so the curves coincide' : ''}. These controls separate the adjustments; the engine controller chooses their combination.`;
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
