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
    note: 'Ideal 12 V source; each lamp is an illustrative 24 W resistive load at 12 V. No wiring resistance, fuse timing or Porsche lamp ratings are modelled. This is a teaching circuit, not a vehicle wiring diagram.',
  });
  stage.style.height = '400px';
  let rows = [];
  const redraw = svgDiagram(stage, 'Battery, fuse, switch, parallel lamps and earth return', (svg, { width }) => {
    svg.selectAll('*').remove();
    const powered = state.connected && state.fault === 'intact';
    const current = powered ? state.lamps * 2 : 0;
    const left = 38;
    const earth = 88;
    const right = width - 28;
    const centre = (earth + right) / 2;
    const fuse = Math.max(115, width * 0.34);
    const sw = right - 35;
    const active = powered ? '#b2762f' : '#9aa79d';
    const label = (x, y, value, size = 20, colour = '#243d32', anchor = 'middle') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', colour).text(value);
    const wire = (d, colour = active, dash) => svg.append('path').attr('d', d).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 4).attr('stroke-dasharray', dash ?? null).attr('stroke-linejoin', 'round');
    const fuseOpen = state.fault === 'fuse';
    wire(`M${left} 169V80H${fuse - 19}`);
    wire(`M${fuse + 19} 80H${sw - 20}`);
    wire(`M${sw + 20} 80H${right}V250`);
    svg.append('rect').attr('x', fuse - 19).attr('y', 70).attr('width', 38).attr('height', 20).attr('rx', 3).attr('fill', '#f1f5ef').attr('stroke', fuseOpen ? '#b74e3c' : '#456653').attr('stroke-width', 2);
    if (fuseOpen) wire(`M${fuse - 13} 80H${fuse - 5}M${fuse + 5} 80H${fuse + 13}`, '#b74e3c');
    else wire(`M${fuse - 14} 80H${fuse + 14}`);
    wire(state.connected ? `M${sw - 20} 80H${sw + 20}` : `M${sw - 20} 80L${sw + 14} 58`, state.connected ? active : '#456653');
    for (const x of [sw - 20, sw + 20]) svg.append('circle').attr('cx', x).attr('cy', 80).attr('r', 3).attr('fill', '#456653');
    label(fuse, 40, fuseOpen ? 'Fuse open' : 'Fuse');
    label(sw, 40, state.connected ? 'Closed' : 'Open');
    wire(`M${earth} 160V307M${earth} 333H${left}V207`, powered ? '#39765b' : '#9aa79d');
    if (state.fault === 'earth') {
      wire(`M${earth} 307L${earth + 14} 319M${earth} 333L${earth - 14} 321`, '#b74e3c');
    } else wire(`M${earth} 307V333`, powered ? '#39765b' : '#9aa79d');
    for (const [number, y] of [[1, 160], [2, 250]]) {
      const present = number <= state.lamps;
      const branchColour = present ? active : '#cbd4cb';
      wire(`M${earth} ${y}H${centre - 24}M${centre + 24} ${y}H${right}`, branchColour, present ? null : '5 6');
      svg.append('circle').attr('cx', centre).attr('cy', y).attr('r', 24).attr('fill', present && powered ? '#fff0a7' : '#f1f5ef').attr('stroke', branchColour).attr('stroke-width', 3).attr('stroke-dasharray', present ? null : '5 6');
      wire(`M${centre - 16} ${y - 16}L${centre + 16} ${y + 16}M${centre - 16} ${y + 16}L${centre + 16} ${y - 16}`, branchColour);
      label(centre, y + 48, present ? `Lamp ${number}: ${powered ? 'on' : 'off'}` : 'Lamp 2 absent');
    }
    wire(`M${left} 169V173M${left - 17} 173H${left + 17}M${left - 9} 195H${left + 9}M${left} 195V207`, '#456653');
    label(left, 151, '+', 20);
    label(left, 231, '−', 20);
    label(left, 265, '12 V', 20);
    label(earth + 12, 360, state.fault === 'earth' ? 'Earth open' : 'Earth return', 20, state.fault === 'earth' ? '#b74e3c' : '#39765b', 'start');
    label(width / 2, 393, `Supply current: ${current} A`, 23);
    let reason = `The complete loop carries ${current} A. Each connected 24 W lamp draws 2 A at 12 V; parallel branches add their currents.`;
    if (!state.connected) reason = 'The switch is open. The loop is incomplete, so neither connected lamp can carry current: 0 A.';
    if (state.fault === 'fuse') reason = 'The fuse is open. It breaks the shared feed, so the connected lamps are off and supply current is 0 A, even with the switch closed.';
    if (state.fault === 'earth') reason = 'The shared earth return is open. Power on the feed side cannot complete a loop, so the connected lamps are off and supply current is 0 A.';
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
