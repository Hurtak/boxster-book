import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const strokes = [
  { name: 'Intake', short: 'Intake', colour: '#306b95', text: 'The piston moves away from the head. The open inlet admits an air–fuel charge: the 2.9’s port injector adds fuel upstream of the inlet valve.' },
  { name: 'Compression', short: 'Compress.', colour: '#927039', text: 'The piston returns towards the head with both valves closed, compressing the charge. A spark near the end of compression starts combustion; actual ignition timing varies with operating conditions.' },
  { name: 'Power', short: 'Power', colour: '#b44c35', text: 'Both valves remain closed in this idealised stroke. Combustion raises gas pressure, and expanding gas pushes the piston away from the head. The connecting rod transfers force to the crankshaft.' },
  { name: 'Exhaust', short: 'Exhaust', colour: '#6c6874', text: 'The piston returns towards the head. Spent gas leaves through the open exhaust valve before the next intake stroke.' },
];

export function mount(host, { state, signal }) {
  state.angle ??= 90;
  const { stage, controls, explanation } = panel(host, {
    title: 'One cylinder, two crankshaft turns',
    description: 'Scrub the cycle, select a stroke, or inspect ignition at compression top dead centre (TDC).',
    note: 'Upright view of a horizontal flat-six cylinder; one of each valve pair is shown. Valves switch at stroke boundaries here; real valve events and VarioCam Plus timing differ. Spark at 360° is schematic, not an ignition setting. Dimensions, lift and gas colours are illustrative.',
  });
  stage.style.height = '480px';
  const redraw = svgDiagram(stage, 'Four-stroke cylinder with port injection, valves, spark plug, piston, connecting rod and crankshaft', (svg, { width }) => {
    svg.selectAll('*').remove();
    const angle = state.angle;
    // 720° shares the next cycle’s 0° position, while keeping the accumulated turns visible.
    const cycleAngle = angle % 720;
    const stroke = Math.floor(cycleAngle / 180);
    const item = strokes[stroke];
    const inletOpen = stroke === 0;
    const exhaustOpen = stroke === 3;
    const atDeadCentre = angle % 180 === 0;
    const theta = angle * Math.PI / 180;
    const cx = width / 2;
    const r = 38;
    const rod = 120;
    const crankY = 350;
    const pinX = cx + r * Math.sin(theta);
    const pinY = crankY - r * Math.cos(theta);
    // Fixed rod length, rather than a sinusoidal approximation of piston travel.
    const pistonY = pinY - Math.sqrt(rod ** 2 - (pinX - cx) ** 2);
    const crownY = pistonY - 14;
    const ink = '#263d34';
    const label = (x, y, value, size = 13, anchor = 'middle', fill = ink) => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', fill).text(value);
    const line = (x1, y1, x2, y2, colour = ink, thickness = 2) => svg.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', colour).attr('stroke-width', thickness).attr('stroke-linecap', 'round');
    const arrow = (points, colour) => {
      svg.append('polyline').attr('points', points.map(point => point.join(',')).join(' ')).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 3).attr('stroke-linejoin', 'round');
      const [x, y] = points.at(-1);
      const [px, py] = points.at(-2);
      const a = Math.atan2(y - py, x - px);
      const wing = 6;
      svg.append('path').attr('d', `M${x - wing * Math.cos(a - 0.55)},${y - wing * Math.sin(a - 0.55)} L${x},${y} L${x - wing * Math.cos(a + 0.55)},${y - wing * Math.sin(a + 0.55)}`).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 3);
    };

    label(cx, 22, angle === 720 ? 'Cycle complete · 720°' : `${item.name} · ${angle}° crank`, 19);
    label(cx, 44, `Crankshaft ${angle}° · camshaft ${angle / 2}°`, 14);
    label(cx, 66, `Inlet ${inletOpen ? 'open' : 'closed'} · exhaust ${exhaustOpen ? 'open' : 'closed'}`, 13);
    label(cx - 37, 94, 'Inlet', 12);
    label(cx, 94, 'Plug', 12);
    label(cx + 37, 94, 'Exhaust', 12);

    // A cutaway head and port passages, with the injector outside the cylinder.
    svg.append('rect').attr('x', cx - 61).attr('y', 119).attr('width', 122).attr('height', 22).attr('fill', '#b9c8bd').attr('stroke', '#6b7d73').attr('stroke-width', 2);
    svg.append('rect').attr('x', cx - 56).attr('y', 141).attr('width', 112).attr('height', 145).attr('fill', '#f0f3ef').attr('stroke', '#6b7d73').attr('stroke-width', 5);
    svg.append('rect').attr('x', cx - 53).attr('y', 143).attr('width', 106).attr('height', crownY - 143).attr('fill', item.colour).attr('opacity', 0.24);
    for (const side of [-1, 1]) {
      svg.append('path').attr('d', `M${cx + side * 82},130 H${cx + side * 37} V141`).attr('fill', 'none').attr('stroke', '#f0f3ef').attr('stroke-width', 18);
    }
    svg.append('path').attr('d', `M${cx - 81},108 l13,15`).attr('fill', 'none').attr('stroke', '#86613b').attr('stroke-width', 7);
    for (const [dx, dy] of [[-66, 125], [-61, 128], [-57, 131]]) svg.append('circle').attr('cx', cx + dx).attr('cy', dy).attr('r', 1.8).attr('fill', '#86613b');
    label(cx - 72, 165, 'Port', 12, 'end');
    label(cx - 72, 180, 'injector', 12, 'end');
    svg.append('path').attr('d', `M${cx - 75},153 V117`).attr('fill', 'none').attr('stroke', '#718b81').attr('stroke-width', 1);

    for (const [offset, open] of [[-37, inletOpen], [37, exhaustOpen]]) {
      const drop = open ? 11 : 0;
      line(cx + offset, 103 + drop, cx + offset, 141 + drop, ink, 4);
      line(cx + offset - 11, 141 + drop, cx + offset + 11, 141 + drop, ink, 4);
    }
    line(cx, 105, cx, 139, '#e2dfcc', 8);
    line(cx, 105, cx, 141, ink, 2);
    line(cx, 143, cx + 4, 146, ink, 2);
    line(cx + 4, 146, cx, 149, ink, 2);
    if (inletOpen && !atDeadCentre) arrow([[cx - 91, 130], [cx - 44, 130], [cx - 44, 144], [cx - 51, 155], [cx - 51, 169]], '#306b95');
    if (exhaustOpen && !atDeadCentre) arrow([[cx + 51, 169], [cx + 51, 155], [cx + 44, 144], [cx + 44, 130], [cx + 91, 130]], '#6c6874');
    if (angle === 360) {
      svg.append('path').attr('d', `M${cx},149 l-5,8 6,-2 -4,10 10,-12 -6,2 4,-6`).attr('fill', '#d39720').attr('stroke', '#a66813').attr('stroke-width', 1);
      label(cx, 175, 'Spark', 12, 'middle', '#8d4f13');
    } else if (stroke === 2 && cycleAngle < 400) {
      svg.append('path').attr('d', `M${cx - 17},${crownY - 4} Q${cx - 26},${crownY - 15} ${cx - 10},${crownY - 29} Q${cx - 8},${crownY - 15} ${cx},${crownY - 36} Q${cx + 17},${crownY - 24} ${cx + 12},${crownY - 12} Q${cx + 27},${crownY - 18} ${cx + 20},${crownY - 4} Z`).attr('fill', '#ce7840').attr('opacity', 0.7);
    }

    line(cx, pistonY, pinX, pinY, '#718b81', 12);
    svg.append('rect').attr('x', cx - 51).attr('y', crownY).attr('width', 102).attr('height', 27).attr('rx', 3).attr('fill', '#a5b6ad').attr('stroke', ink).attr('stroke-width', 2);
    line(cx - 50, crownY + 6, cx + 50, crownY + 6, ink, 2);
    svg.append('circle').attr('cx', cx).attr('cy', crankY).attr('r', r).attr('fill', 'none').attr('stroke', '#b4beb6').attr('stroke-width', 2).attr('stroke-dasharray', '4 4');
    line(cx, crankY, pinX, pinY, '#b5773d', 13);
    for (const [x, y] of [[cx, crankY], [pinX, pinY], [cx, pistonY]]) svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 5).attr('fill', ink);
    label(cx - 69, 219, 'Cylinder', 12, 'end');
    line(cx - 65, 215, cx - 57, 215, '#718b81', 1);
    label(cx + 68, pistonY + 4, 'Piston', 12, 'start');
    line(cx + 54, pistonY, cx + 64, pistonY, '#718b81', 1);
    label(cx - 45, 303, 'Rod', 12, 'end');
    line(cx - 41, 299, (cx + pinX) / 2, (pistonY + pinY) / 2, '#718b81', 1);
    label(cx + 59, 354, 'Crank', 12, 'start');
    line(cx + 42, 350, cx + 55, 350, '#718b81', 1);
    if (!atDeadCentre) {
      const movingDown = stroke === 0 || stroke === 2;
      const fromY = pistonY + (movingDown ? -24 : 25);
      const toY = pistonY + (movingDown ? 25 : -24);
      arrow([[cx + 62, fromY], [cx + 62, toY]], '#566e60');
    }

    const railX = 12;
    const railWidth = width - railX * 2;
    strokes.forEach((entry, i) => {
      const x = railX + railWidth * i / 4;
      svg.append('rect').attr('x', x).attr('y', 405).attr('width', railWidth / 4).attr('height', 22).attr('fill', entry.colour).attr('opacity', stroke === i ? 0.95 : 0.13);
      label(x + railWidth / 8, 420, entry.short, width < 340 ? 11 : 12, 'middle', stroke === i ? '#fff' : ink);
    });
    const cursorX = railX + railWidth * angle / 720;
    svg.append('path').attr('d', `M${cursorX - 4},398 H${cursorX + 4} L${cursorX},404 Z`).attr('fill', ink);
    [0, 180, 360, 540, 720].forEach((degrees, i) => label(railX + railWidth * i / 4, 444, `${degrees}°`, 11, i === 0 ? 'start' : i === 4 ? 'end' : 'middle'));
    label(cx, 470, 'Two crank turns → one cam turn', 14);

    const boundary = atDeadCentre ? (angle % 360 === 0 ? 'Top dead centre (TDC): the piston is momentarily stationary. ' : 'Bottom dead centre (BDC): the piston is momentarily stationary. ') : '';
    const cycleText = angle === 720 ? 'One full cycle is complete. Exhaust ends and the next intake begins at the same piston position as 0°. ' : angle === 360 ? 'Compression ends and the power stroke begins. The spark marker is placed at TDC for orientation; real ignition timing is not fixed at 360°. ' : item.text + ' ';
    explanation.textContent = `${boundary}${cycleText}The camshaft has turned ${angle / 2}° while the crankshaft has turned ${angle}°.`;
    host.dataset.engineCrankAngle = String(angle);
    host.dataset.engineCamAngle = String(angle / 2);
    host.dataset.engineStroke = item.name.toLowerCase();
    host.dataset.engineInletOpen = String(inletOpen);
    host.dataset.engineExhaustOpen = String(exhaustOpen);
  }, signal);
  const control = slider(controls, { label: 'Crankshaft angle', min: 0, max: 720, step: 1, value: state.angle, format: value => `${value}°`, signal, onChange: value => { state.angle = value; redraw(); } });
  buttons(controls, [...strokes.map((item, i) => ({ label: item.name, action: () => control.set(i * 180 + 90) })), { label: 'Ignition · TDC', action: () => control.set(360) }], signal);
  return () => {};
}
