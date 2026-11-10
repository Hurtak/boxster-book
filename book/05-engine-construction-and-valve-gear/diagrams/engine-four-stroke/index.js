import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const strokes = [
  { name: 'Intake', colour: '#306b95', text: 'The piston moves away from the head. The open inlet admits the air–fuel charge prepared by the 2.9’s port injector.' },
  { name: 'Compression', colour: '#927039', text: 'The piston returns towards the head with both valves closed, compressing the charge. Ignition follows near the end of compression.' },
  { name: 'Power', colour: '#b44c35', text: 'Combustion raises the gas pressure. Expanding gas pushes the piston away from the head and turns the crankshaft through the connecting rod.' },
  { name: 'Exhaust', colour: '#6c6874', text: 'The piston returns towards the head. The open exhaust valve lets the spent gas leave before the next intake stroke.' },
];

export function mount(host, { state, signal }) {
  state.angle ??= 90;
  const { stage, controls, explanation } = panel(host, {
    title: 'One cylinder, two crankshaft turns',
    description: 'Scrub through a complete four-stroke cycle, or select the middle of a stroke.',
    note: 'A single 2010 2.9 cylinder turned upright for clarity. Valve events are idealised at stroke boundaries; the real VarioCam Plus events overlap them. Geometry and gas colours are explanatory, not a combustion simulation.',
  });
  stage.style.height = '365px';
  const redraw = svgDiagram(stage, 'Piston, valves, connecting rod and crankshaft through a four-stroke cycle', (svg, { width }) => {
    svg.selectAll('*').remove();
    const angle = state.angle;
    const stroke = Math.min(3, Math.floor(angle / 180));
    const item = strokes[stroke];
    const theta = angle * Math.PI / 180;
    const cx = width / 2;
    const r = 38;
    const rod = 110;
    const crankY = 278;
    const pinX = cx + r * Math.sin(theta);
    const pinY = crankY - r * Math.cos(theta);
    const pistonY = pinY - Math.sqrt(rod ** 2 - (pinX - cx) ** 2);
    const label = (x, y, value, size = 14, anchor = 'middle') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', '#263d34').text(value);
    label(cx, 20, `${item.name} · ${angle}° crank`, 19);
    label(cx - 40, 45, 'Inlet');
    label(cx + 40, 45, 'Exhaust');
    svg.append('rect').attr('x', cx - 63).attr('y', 84).attr('width', 126).attr('height', 139).attr('fill', '#f0f3ef').attr('stroke', '#6b7d73').attr('stroke-width', 5);
    svg.append('rect').attr('x', cx - 60).attr('y', 87).attr('width', 120).attr('height', Math.max(0, pistonY - 97)).attr('fill', item.colour).attr('opacity', 0.25);
    svg.append('rect').attr('x', cx - 70).attr('y', 67).attr('width', 140).attr('height', 17).attr('fill', '#73867b');
    for (const [offset, open] of [[-40, stroke === 0], [40, stroke === 3]]) {
      const drop = open ? 12 : 0;
      svg.append('line').attr('x1', cx + offset).attr('x2', cx + offset).attr('y1', 53 + drop).attr('y2', 83 + drop).attr('stroke', '#253e33').attr('stroke-width', 5);
      svg.append('line').attr('x1', cx + offset - 12).attr('x2', cx + offset + 12).attr('y1', 83 + drop).attr('y2', 83 + drop).attr('stroke', '#253e33').attr('stroke-width', 5);
    }
    svg.append('line').attr('x1', cx).attr('x2', pinX).attr('y1', pistonY).attr('y2', pinY).attr('stroke', '#718b81').attr('stroke-width', 13).attr('stroke-linecap', 'round');
    svg.append('rect').attr('x', cx - 57).attr('y', pistonY - 10).attr('width', 114).attr('height', 25).attr('rx', 3).attr('fill', '#a5b6ad').attr('stroke', '#253e33').attr('stroke-width', 2);
    svg.append('line').attr('x1', cx - 56).attr('x2', cx + 56).attr('y1', pistonY - 3).attr('y2', pistonY - 3).attr('stroke', '#253e33').attr('stroke-width', 2);
    svg.append('circle').attr('cx', cx).attr('cy', crankY).attr('r', r).attr('fill', 'none').attr('stroke', '#b4beb6').attr('stroke-width', 2).attr('stroke-dasharray', '4 4');
    svg.append('line').attr('x1', cx).attr('x2', pinX).attr('y1', crankY).attr('y2', pinY).attr('stroke', '#b5773d').attr('stroke-width', 14).attr('stroke-linecap', 'round');
    for (const [x, y] of [[cx, crankY], [pinX, pinY], [cx, pistonY]]) svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 5).attr('fill', '#233c31');
    label(cx, 338, `Crankshaft ${angle}° · camshaft ${angle / 2}°`, 15);
    label(cx, 359, '720° crank = one complete cycle', 14);
    explanation.textContent = `${item.text} The camshaft has turned ${angle / 2}° while the crankshaft has turned ${angle}°.`;
    host.dataset.engineCrankAngle = String(angle);
    host.dataset.engineCamAngle = String(angle / 2);
    host.dataset.engineStroke = item.name.toLowerCase();
  }, signal);
  const control = slider(controls, { label: 'Crankshaft angle', min: 0, max: 720, step: 1, value: state.angle, format: value => `${value}°`, signal, onChange: value => { state.angle = value; redraw(); } });
  buttons(controls, strokes.map((item, i) => ({ label: item.name, action: () => control.set(i * 180 + 90) })), signal);
  return () => {};
}
