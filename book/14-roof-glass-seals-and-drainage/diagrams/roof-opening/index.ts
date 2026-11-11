import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel, slider } from '../../../../interactive/ui.ts';

const stages = [
  [
    'Closed',
    'The manual header latch holds the front edge at the windscreen. Fabric and lining are supported by the articulated frame; the heated rear window is a rigid glass pane. The side glass meets the roof seals.',
  ],
  [
    'Released',
    'The driver releases the header latch. Roof operation also involves automatic door-glass lowering for clearance from the seals. The drawing separates this preparation from folding; it does not show the exact lowering trigger, control sequence or a measured window drop.',
  ],
  [
    'Clearance',
    'The compartment cover moves clear while the roof starts travelling rearwards. Rods and levers driven from the side gearboxes link these overlapping movements. The windscreen, seats and body remain fixed references.',
  ],
  [
    'Folding',
    'The articulated frame folds rearwards, gathering fabric and lining into the space behind the seats. The rear glass moves with the assembly and stays in one piece. The cover remains clear of the folding roof.',
  ],
  [
    'Stowed',
    'The folded roof and its glass are packed into the roof compartment behind the occupants, beneath the closed compartment cover. They are visible here through the cutaway body. Neither luggage compartment is used for ordinary roof stowage.',
  ],
] as const;

const headers = [
  [278, 100],
  [278, 100],
  [315, 69],
  [451, 124],
  [448, 216],
];

// Functional side cutaway, not a reconstruction of Porsche linkage geometry.
// The same artwork is used when producing the static poster.
export function roofArtwork(position: number) {
  const roofs = [
    'M278 100 Q356 65 428 98 L510 192 L493 195 L417 115 Q355 85 280 115 Z',
    'M278 100 Q356 65 428 98 L510 192 L493 195 L417 115 Q355 85 280 115 Z',
    'M315 69 Q394 34 455 94 L509 187 L493 193 L443 110 Q390 56 320 84 Z',
    'M451 124 L425 70 Q459 77 504 103 L466 161 L523 194 L508 204 L446 165 L484 108 L447 91 L466 119 Z',
    'M444 209 Q461 201 477 208 L491 205 L508 211 L542 207 L556 222 L538 235 L512 230 L485 235 L464 228 L448 231 Z',
  ];
  const frames = [
    'M280 114 L355 106 L417 116 L438 204 M385 111 L438 204 L493 191',
    'M280 114 L355 106 L417 116 L438 204 M385 111 L438 204 L493 191',
    'M320 83 L389 88 L437 129 L438 204 M410 107 L438 204 L493 188',
    'M459 123 L438 88 L490 108 L453 164 L438 204 M453 164 L513 196',
    'M448 216 L479 225 L505 214 L539 226 M455 230 L490 216 L548 230',
  ];
  const panes = [
    [472, 148, 59],
    [472, 148, 59],
    [478, 147, 54],
    [493, 177, 24],
    [504, 220, 0],
  ];
  const [gx, gy, angle] = panes[position];
  const [hx, hy] = headers[position];
  const clear = position === 2 || position === 3;
  return `
    <g stroke-linecap="round" stroke-linejoin="round">
      <!-- Fixed reference structure: the body is cut away over the roof well. -->
      <path d="M26 221 Q46 203 105 196 L207 190 L247 199 L421 199 L429 190 L573 190 Q623 190 651 218 L651 247 L28 247 Z" fill="#dfe7df" stroke="#637b70" stroke-width="3"/>
      <path d="M205 191 L278 100 L286 104 L220 193" fill="#b9d7dc" stroke="#5b7e86" stroke-width="3"/>
      <path d="M269 102 L287 102" stroke="#315d4d" stroke-width="6"/>
      <path d="M253 201 L259 237 H405 V201" fill="none" stroke="#a0b0a5" stroke-width="2"/>
      <path d="M337 202 L332 164 Q331 150 344 150 L353 153 L365 202 M329 204 H373" fill="#c9ad8d" stroke="#96744d" stroke-width="4"/>
      <path d="M394 198 V164 Q394 143 405 143 Q416 143 416 164 V199" fill="none" stroke="#71837b" stroke-width="7"/>
      <path d="M430 198 L442 240 L564 240 L574 198" fill="#f3f5f0" stroke="#70877a" stroke-width="2"/>
      <path d="M449 241 H558" stroke="#bbc9bf" stroke-width="4"/>
      <g fill="#f3f5f0" stroke="#637b70" stroke-width="3"><circle cx="133" cy="246" r="32"/><circle cx="587" cy="246" r="32"/></g>
      <g fill="#bac6bd"><circle cx="133" cy="246" r="18"/><circle cx="587" cy="246" r="18"/></g>
      <path d="M243 ${position === 0 ? 192 : 200} L281 ${position === 0 ? 119 : 148} L389 ${position === 0 ? 119 : 148} L414 ${position === 0 ? 191 : 200} Z" fill="#b9d7dc" fill-opacity=".35" stroke="#8cabb1" stroke-width="2"/>
      ${clear ? '<path d="M426 193 Q495 187 570 193" fill="none" stroke="#a5b7a9" stroke-width="3" stroke-dasharray="7 6"/>' : ''}
      <!-- The pale body cutaway makes the stowed package visible below the lid. -->
      <path d="${roofs[position]}" fill="#526a61" stroke="#273f35" stroke-width="3"/>
      <path d="${frames[position]}" fill="none" stroke="#c39b64" stroke-width="5"/>
      <g transform="translate(${gx} ${gy}) rotate(${angle})">
        <rect x="-34" y="-8" width="68" height="16" rx="3" fill="#b5d8de" stroke="#477b88" stroke-width="3"/>
        <path d="M-26 -3 H26 M-26 3 H26" stroke="#6f9fa9" stroke-width="1.5"/>
      </g>
      <path d="${clear ? 'M520 111 Q585 110 650 139 L646 150 Q582 126 515 124 Z' : 'M425 190 Q493 184 573 190 L570 200 Q493 194 428 200 Z'}" fill="#789b80" stroke="#315d4d" stroke-width="3"/>
      <path d="M${hx} ${hy + 12} l${position === 0 ? '6 4 v7 h-7' : '-9 11 h-6'}" fill="none" stroke="#a56d34" stroke-width="4"/>
      ${position === 2 ? '<path d="M336 47 Q393 12 435 48 M424 36 L435 48 L419 50" fill="none" stroke="#a56d34" stroke-width="3"/>' : ''}
      ${position === 3 ? '<path d="M378 78 Q397 166 428 185 M415 174 L428 185 L429 169" fill="none" stroke="#a56d34" stroke-width="3"/>' : ''}
    </g>`;
}

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { stage: 0 });
  state.stage = Math.max(0, Math.min(4, Math.round(Number(state.stage) || 0)));
  const { stage, controls, explanation } = panel(host, {
    title: 'From a closed roof to an open roadster',
    description:
      'Follow the fabric roof, its rigid rear glass and the moving compartment cover. The body is cut away to reveal the stowed package.',
    note: 'Ordinary MY2010 2.9 roof. Cutaway and stages are schematic; real movements overlap. Use the handbook for operation. The Spyder roof differs.',
  });
  stage.style.height = host.clientWidth < 540 ? '420px' : '500px';
  explanation.setAttribute('aria-live', 'polite');
  let row: HTMLDivElement;
  const redraw = svgDiagram(
    stage,
    'Schematic stages of the ordinary 2010 Boxster folding roof',
    (svg, { width: w }) => {
      svg.selectAll('*').remove();
      const s = state.stage;
      const compact = w < 480;
      stage.style.height = compact ? '420px' : '500px';
      const scale = Math.min(w / 680, 1);
      const offset = (w - 680 * scale) / 2;
      const top = 49;
      const base = top + 285 * scale;
      svg.attr('aria-label', `${stages[s][0]}: ordinary 2010 Boxster roof, functional side cutaway`);
      const text = (x: number, y: number, value: string | number, size = 14, anchor = 'start') =>
        svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', anchor)
          .attr('font-size', size)
          .attr('fill', '#263c34')
          .text(value);
      text(0, 20, `${s + 1} / 5 · ${stages[s][0]}`, 18);
      text(w, 20, 'Front ←', 14, 'end');
      text(
        0,
        42,
        s === 0
          ? 'Latch engaged · glass sealed'
          : s === 4
            ? 'Roof below the closed cover'
            : s === 1
              ? 'Manual release · window clearance'
              : 'Roof and cover movements overlap',
        14,
      );
      svg.append('g').attr('transform', `translate(${offset},${top}) scale(${scale})`).html(roofArtwork(s));

      const badges = [
        headers[s],
        s === 4 ? [465, 215] : s === 3 ? [442, 90] : s === 2 ? [385, 61] : [370, 83],
        s === 4 ? [514, 222] : s === 3 ? [505, 170] : [484, 147],
        s === 2 || s === 3 ? [603, 135] : [549, 191],
        [549, 244],
      ];
      badges.forEach(([x, y], i) => {
        // Numeric keys keep full-size labels away from moving geometry on phones.
        const marker =
          s === 4
            ? [
                [416, 266],
                [465, 178],
                [507, 271],
                [549, 163],
                [572, 286],
              ][i]
            : [x, y];
        const bx = offset + marker[0] * scale;
        const by =
          top +
          marker[1] * scale +
          (s === 4
            ? 0
            : i === 0 && s === 3
              ? 10
              : compact
                ? i === 2
                  ? 11
                  : i === 4
                    ? 7
                    : -9
                : i === 2
                  ? 18
                  : i === 4
                    ? 9
                    : -14);
        svg
          .append('path')
          .attr('d', `M${offset + x * scale} ${top + y * scale} L${bx} ${by}`)
          .attr('stroke', '#637b70')
          .attr('stroke-width', 1);
        svg
          .append('circle')
          .attr('cx', bx)
          .attr('cy', by)
          .attr('r', 10)
          .attr('fill', '#f3f5f0')
          .attr('stroke', '#315d4d')
          .attr('stroke-width', 1.5);
        text(bx, by + 4, String(i + 1), 12, 'middle');
      });
      const labels = [
        'Manual header latch',
        'Fabric + articulated frame',
        'Heated glass: one rigid pane',
        'Moving compartment cover',
        'Roof well behind the seats',
      ];
      const keyTop = base + 26;
      labels.forEach((label, i) => {
        const x = compact ? 0 : ((i % 2) * w) / 2;
        const y = keyTop + (compact ? i : Math.floor(i / 2)) * 24;
        text(x, y, `${i + 1}  ${label}`, 14);
      });
      const driveTop = keyTop + (compact ? 5 : 3) * 24 + 15;
      text(0, driveTop, '1 motor → 2 flexible drive shafts', 14);
      text(0, driveTop + 22, '→ left/right gearboxes → roof + cover', 14);
      explanation.textContent = stages[s][1];
      host.dataset.roofStage = String(s);
      host.dataset.roofPosition = stages[s][0].toLowerCase();
      host.dataset.roofCover = s === 2 || s === 3 ? 'clear' : 'closed';
      host.dataset.roofHeader = s === 0 ? 'latched' : 'released';
      host.dataset.roofGlass = s === 4 ? 'stowed' : 'visible';
      host.dataset.roofDoorGlass = s === 0 ? 'raised' : 'lowered';
      if (row) [...row.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === s)));
    },
    signal,
  );
  const control = slider(controls, {
    label: 'Opening stage',
    min: 0,
    max: 4,
    step: 1,
    value: state.stage,
    format: (v) => stages[v][0],
    signal,
    onChange: (value) => {
      state.stage = value;
      redraw();
    },
  });
  row = buttons(
    controls,
    stages.map(([label], i) => ({ label, action: () => control.set(i) })),
    signal,
  );
  redraw();
  return () => {};
}
