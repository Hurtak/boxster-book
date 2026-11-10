import { panel, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const faults = ['intact', 'fuse', 'earth'];

export function mount(host, { state, signal }) {
  state.connected ??= true;
  state.lamps ??= 1;
  state.fault ??= 'intact';
  if (!faults.includes(state.fault)) state.fault = 'intact';
  const { stage, controls, explanation } = panel(host, {
    title: 'Current needs a complete loop',
    description: 'Change the switch, add a parallel lamp, or open either side of the circuit.',
    note: 'Ideal 12 V source; each fitted lamp is a 24 W resistive load at 12 V. Arrows show conventional current from + to − around the external circuit. No arrow means no current; voltage may still be present. Wiring resistance, fuse timing and Porsche lamp ratings are not modelled. This is a teaching circuit, not a vehicle wiring diagram.',
  });
  stage.style.height = '510px';
  let rows = [];
  const redraw = svgDiagram(stage, 'Battery, fuse, switch, parallel lamps and earth return', (svg, { width }) => {
    svg.selectAll('*').remove();
    const powered = state.connected && state.fault === 'intact';
    const current = powered ? state.lamps * 2 : 0;
    const fuseOpen = state.fault === 'fuse';
    const earthOpen = state.fault === 'earth';
    const left = 38;
    const earth = 90;
    const right = width - 22;
    const centre = (earth + right) / 2;
    const fuse = Math.max(135, width * 0.35);
    const sw = right - 48;
    const ink = '#243d32';
    const feed = '#a96b24';
    const back = '#39765b';
    const idle = '#79877d';
    const absent = '#a9b5ab';
    const fault = '#b74e3c';
    const label = (x, y, value, size = 18, colour = ink, anchor = 'middle') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', colour).text(value);
    const wire = (d, colour = feed, dash) => svg.append('path').attr('d', d).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 3.5).attr('stroke-dasharray', dash ?? null).attr('stroke-linejoin', 'round');
    const arrow = (x, y, direction, colour) => {
      if (!powered) return;
      const angles = { right: 0, down: 90, left: 180, up: 270 };
      svg.append('path').attr('d', 'M-6 -6L3 0L-6 6').attr('transform', `translate(${x},${y}) rotate(${angles[direction]})`).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 3).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round').attr('class', 'current-arrow');
    };
    const openings = [!state.connected && 'switch', fuseOpen && 'fuse', earthOpen && 'shared earth return'].filter(Boolean);
    const reason = powered
      ? `Each fitted lamp has 12 V across it and draws 24 W ÷ 12 V = 2 A. ${state.lamps === 2 ? 'The two parallel currents add: 2 A + 2 A = 4 A in the shared feed and return.' : 'One fitted lamp gives 2 A in the shared feed and return. The dashed second branch is not connected.'}`
      : `The ${openings.join(' and ')} ${openings.length > 1 ? 'are' : 'is'} open. There is no complete loop: ${state.lamps === 2 ? 'both fitted lamps are off' : 'the fitted lamp is off'}, and supply current is 0 A. An open circuit does not mean that every point is at zero voltage.`;
    svg.append('title').text(`Supply current: ${current} A`);
    svg.append('desc').text(reason);
    label(width / 2, 20, powered ? 'Conventional current: + → −' : 'Open circuit: no current arrows', 17);

    // Both branches share the protected feed and the return to battery negative.
    wire(`M${left} 196V86H${fuse - 19}`);
    wire(`M${fuse + 19} 86H${sw - 19}`);
    wire(`M${sw + 19} 86H${right}V292`);
    svg.append('rect').attr('x', fuse - 19).attr('y', 76).attr('width', 38).attr('height', 20).attr('rx', 3).attr('fill', '#f1f5ef').attr('stroke', fuseOpen ? fault : back).attr('stroke-width', 2);
    wire(fuseOpen ? `M${fuse - 13} 86H${fuse - 6}M${fuse + 6} 86H${fuse + 13}` : `M${fuse - 14} 86H${fuse + 14}`, fuseOpen ? fault : feed);
    wire(state.connected ? `M${sw - 19} 86H${sw + 19}` : `M${sw - 19} 86L${sw + 13} 108`, state.connected ? feed : fault);
    for (const x of [sw - 19, sw + 19]) svg.append('circle').attr('cx', x).attr('cy', 86).attr('r', 3).attr('fill', back);
    label(fuse, 47, 'Fuse');
    label(fuse, 70, fuseOpen ? 'open' : 'intact', 16, fuseOpen ? fault : ink);
    label(sw, 47, 'Switch');
    label(sw, 70, state.connected ? 'closed' : 'open', 16, state.connected ? ink : fault);
    arrow((fuse + 20 + sw - 20) / 2, 86, 'right', feed);
    arrow(right, 125, 'down', feed);

    wire(`M${earth} 172V374M${earth} 398V405H${left}V219`, back);
    if (earthOpen) wire(`M${earth} 374L${earth + 10} 380M${earth} 398L${earth - 10} 392`, fault);
    else wire(`M${earth} 374V398`, back);
    arrow(earth, 352, 'down', back);
    arrow((earth + left) / 2, 405, 'left', back);
    arrow(left, 321, 'up', back);

    for (const [number, y] of [[1, 172], [2, 292]]) {
      const present = number <= state.lamps;
      const colour = present ? (powered ? feed : idle) : absent;
      wire(`M${earth} ${y}H${centre - 24}M${centre + 24} ${y}H${right}`, colour, present ? null : '5 6');
      svg.append('circle').attr('cx', centre).attr('cy', y).attr('r', 24).attr('fill', present && powered ? '#fff0a7' : '#f1f5ef').attr('stroke', colour).attr('stroke-width', 3).attr('stroke-dasharray', present ? null : '5 6');
      wire(`M${centre - 16} ${y - 16}L${centre + 16} ${y + 16}M${centre - 16} ${y + 16}L${centre + 16} ${y - 16}`, colour);
      if (present) {
        for (const x of [earth, right]) svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 4).attr('fill', x === earth ? back : feed);
        arrow((centre + 24 + right) / 2, y, 'left', feed);
      }
      label(centre, y + 46, present ? `Lamp ${number}: ${powered ? 'on' : 'off'}` : 'Lamp 2 absent');
      label(centre, y + 70, present ? (powered ? '24 W · 12 V · 2 A' : '0 A · no complete loop') : 'Dashed = not connected', 16);
    }

    // Long plate is the positive battery terminal; short plate is negative.
    wire(`M${left - 17} 196H${left + 17}M${left - 9} 219H${left + 9}`, back);
    label(left + 30, 145, 'Battery', 17);
    label(left - 23, 198, '+', 18);
    label(left - 23, 226, '−', 18);
    label(left + 26, 259, '12 V', 18);
    label(left + 26, 282, 'ideal', 16);
    label(earth + 20, 391, earthOpen ? 'Earth open' : 'Shared earth return', 18, earthOpen ? fault : back, 'start');
    label(earth + 20, 415, earthOpen ? 'No return to battery −' : 'Back to battery −', 16, ink, 'start');
    label(width / 2, 463, `Supply current: ${current} A`, 23);
    label(width / 2, 491, powered && state.lamps === 2 ? '2 A + 2 A = 4 A total' : powered ? '24 W ÷ 12 V = 2 A' : 'A break anywhere stops this loop', 18);
    explanation.textContent = reason;
    host.dataset.electricalCurrent = String(current);
    host.dataset.electricalLamps = String(state.lamps);
    host.dataset.electricalFault = state.fault;
    host.dataset.electricalSwitch = state.connected ? 'closed' : 'open';
    for (const [row, selected] of rows) [...row.children].forEach((button, index) => button.setAttribute('aria-pressed', String(index === selected())));
  }, signal);
  const switchRow = buttons(controls, [
    { label: 'Switch closed', action: () => { state.connected = true; redraw(); } },
    { label: 'Switch open', action: () => { state.connected = false; redraw(); } },
  ], signal);
  const lampRow = buttons(controls, [
    { label: 'One lamp', action: () => { state.lamps = 1; redraw(); } },
    { label: 'Two parallel lamps', action: () => { state.lamps = 2; redraw(); } },
  ], signal);
  const faultRow = buttons(controls, [
    { label: 'Intact circuit', action: () => { state.fault = 'intact'; redraw(); } },
    { label: 'Open fuse', action: () => { state.fault = 'fuse'; redraw(); } },
    { label: 'Open earth', action: () => { state.fault = 'earth'; redraw(); } },
  ], signal);
  rows = [[switchRow, () => state.connected ? 0 : 1], [lampRow, () => state.lamps - 1], [faultRow, () => faults.indexOf(state.fault)]];
  redraw();
  return () => {};
}
