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
  [313, 103],
  [313, 103],
  [365, 83],
  [437, 122],
  [437, 198],
];

// The 624-unit envelope uses the UK 01/10 brochure's 4342 mm length,
// 2415 mm wheelbase and 1292 mm height. Tyre envelopes are nominal 205/55 R17
// and 235/50 R17. Photos guide the contour; PET identifies the parts.
// The five hand-authored snapshots are not a calibrated linkage simulation.
// The same artwork is used to produce the static poster.
export function roofArtwork(position: number) {
  const roofs = [
    'M312 102 C337 88 371 86 401 91 C429 97 446 117 461 144 L493 178 L480 182 L450 153 C431 124 421 116 404 111 C378 102 345 101 316 112 Z',
    'M312 102 C337 88 371 86 401 91 C429 97 446 117 461 144 L493 178 L480 182 L450 153 C431 124 421 116 404 111 C378 102 345 101 316 112 Z',
    'M364 82 C387 73 412 77 434 93 C450 106 460 126 469 148 L493 176 L481 183 L458 155 C444 126 437 116 423 106 C405 94 387 91 368 94 Z',
    'M433 117 Q456 106 480 108 L497 119 L466 160 L498 181 L489 190 L454 165 L483 123 Q459 118 439 130 Z',
    'M431 195 Q451 189 469 195 L496 192 L510 199 L502 214 L476 218 L450 212 L434 216 Z',
  ];
  const frames = [
    'M317 112 L362 108 Q392 108 414 124 L428 155 L439 190 M414 124 L423 156 L439 190 L481 179',
    'M317 112 L362 108 Q392 108 414 124 L428 155 L439 190 M414 124 L423 156 L439 190 L481 179',
    'M369 94 L404 95 L433 116 L448 154 L439 190 M433 116 L428 154 L439 190 L482 179',
    'M439 129 L482 119 L460 160 L439 190 M460 160 L489 184 M482 119 L475 143 L439 190',
    'M437 199 L478 213 L501 198 M440 215 L472 196 L502 213',
  ];
  const linings = [
    'M320 108 Q369 96 403 107 Q430 116 454 150',
    'M320 108 Q369 96 403 107 Q430 116 454 150',
    'M371 90 Q404 84 431 104 Q449 121 463 151',
    'M440 124 Q463 113 488 119 L460 161 L491 183',
    'M436 202 Q453 196 471 203 L499 199 M440 211 L473 207 L499 212',
  ];
  const panes = [
    [467, 151, 48],
    [467, 151, 48],
    [469, 147, 53],
    [477, 172, 24],
    [470, 205, 0],
  ];
  const joints = [
    [
      [362, 108],
      [414, 124],
      [428, 155],
      [439, 190],
    ],
    [
      [362, 108],
      [414, 124],
      [428, 155],
      [439, 190],
    ],
    [
      [404, 95],
      [433, 116],
      [448, 154],
      [439, 190],
    ],
    [
      [482, 119],
      [460, 160],
      [475, 143],
      [439, 190],
    ],
    [
      [478, 213],
      [501, 198],
      [472, 196],
      [439, 209],
    ],
  ];
  const [gx, gy, angle] = panes[position];
  const [hx, hy] = headers[position];
  const clear = position === 2 || position === 3;
  const wheel = (x: number, radius: number) => `
    <g transform="translate(${x} ${274 - radius})">
      <circle r="${radius}" fill="#526159" stroke="#354d41" stroke-width="2"/>
      <circle r="31" fill="#d8ded7" stroke="#7c9184" stroke-width="2"/>
      <circle r="25" fill="#b8c7bd" stroke="#8ca394"/>
      ${[0, 72, 144, 216, 288].map((rotation) => `<path d="M-3 6 L-5 29 L3 29 L5 7 Z" transform="rotate(${rotation})" fill="#edf0e9" stroke="#7c9184" stroke-width="1"/>`).join('')}
      <circle r="7" fill="#90a397" stroke="#637b70"/>
      <circle r="2.4" fill="#edf0e9"/>
    </g>`;
  return `
    <g stroke-linecap="round" stroke-linejoin="round">
      <path d="M37 275 H640" stroke="#cbd5ca" stroke-width="1.5"/>
      ${wheel(160, 47.23)}${wheel(507.1, 47.91)}
      <!-- Ordinary 987.2 body, with wheel arches and a section above the well. -->
      <path d="M26 225 Q28 210 58 203 L105 185 Q128 172 157 172 Q183 171 206 181 L254 178 L420 179 Q440 173 464 173 Q499 165 549 177 L604 190 Q635 201 650 219 V245 Q644 253 620 254 H555 V227 C555 201 534 180 507 180 C480 180 458 201 458 227 V254 H209 V227 C209 200 187 178 160 178 C133 178 111 200 111 227 V254 H42 Q26 252 26 244 Z" fill="#dfe7df" stroke="#637b70" stroke-width="2.5"/>
      <path d="M56 204 Q83 194 109 192 M34 230 L89 225 M39 240 L89 237 M570 190 L624 206 M617 212 L641 221 M565 242 H630" fill="none" stroke="#a0b2a5" stroke-width="1.8"/>
      <path d="M76 199 Q88 187 108 183 L117 187 L106 196 Z" fill="#eaf0e9" stroke="#8ca394" stroke-width="1.4"/>
      <path d="M622 202 L640 213 L639 219 L619 211 Z" fill="#b29b89" opacity=".6"/>
      <path d="M244 181 L255 242 Q320 249 404 243 L421 182 M229 251 H445" fill="none" stroke="#a0b2a5" stroke-width="1.6"/>
      <path d="M425 205 Q431 197 445 197 L447 215 L431 226 Z M431 205 L442 204 M433 211 L442 210 M435 217 L442 215" fill="#bbcbbf" stroke="#8da493" stroke-width="1.4"/>
      <path d="M386 188 H404" stroke="#849b8b" stroke-width="3"/>
      <!-- Fixed raked windscreen, dashboard, seat shell and roll-over bar. -->
      <path d="M236 178 L311 99 Q315 97 320 102 L250 179 Z" fill="#b9d7dc" fill-opacity=".65" stroke="#5b7e86" stroke-width="2"/>
      <path d="M239 177 L312 103" fill="none" stroke="#315d4d" stroke-width="4"/>
      <path d="M308 102 L320 103" stroke="#273f35" stroke-width="5"/>
      <path d="M248 179 Q276 174 299 187 L308 211 L266 209" fill="#bdc9bc" stroke="#839a8a" stroke-width="1.6"/>
      <path d="M304 190 L321 201 M310 181 L299 201" stroke="#7e9286" stroke-width="3"/>
      <path d="M381 147 L375 132 Q374 124 385 123 L393 125 Q398 128 397 137 L395 148 L405 197 Q408 207 399 211 L354 216 Q341 218 340 208 L344 200 L378 198 L368 159 Q367 151 381 147 Z" fill="#c9ad8d" stroke="#96744d" stroke-width="2"/>
      <path d="M379 150 Q384 146 391 149 L397 194 Q392 202 382 201 M349 207 L390 206 M379 130 Q386 128 392 132 M351 220 H401" fill="none" stroke="#ad8d68" stroke-width="1.6"/>
      <path d="M410 179 L411 144 Q412 127 423 127 Q435 129 435 145 L434 179" fill="none" stroke="#71837b" stroke-width="8"/>
      <path d="M411 174 L413 145 Q414 131 423 131 Q431 132 432 145 L431 174" fill="none" stroke="#b8c4b9" stroke-width="2"/>
      <path d="M250 178 ${position === 0 ? 'L315 111 Q371 102 408 124 L423 178' : 'L294 140 Q359 131 407 145 L418 178'} Z" fill="#b9d7dc" fill-opacity=".22" stroke="#8cabb1" stroke-width="1.4"/>
      <path d="M277 170 Q282 161 293 161 L307 167 L302 174 L282 175 Z" fill="#b9cabc" stroke="#789282" stroke-width="1.4"/>
      <!-- Centreline cutaway: the near-side skin is omitted over the compartment. -->
      <path d="M426 184 L433 226 Q463 234 505 224 L516 185" fill="#f3f5f0" stroke="#9aaa9b" stroke-width="1.6" stroke-dasharray="4 4"/>
      <path d="M438 225 Q466 231 500 224" fill="none" stroke="#c4cfc1" stroke-width="3"/>
      <path d="M428 183 Q477 177 537 182" fill="none" stroke="#b2c3b2" stroke-width="2" ${clear ? 'stroke-dasharray="5 5"' : ''}/>
      <!-- One side gearbox/output lever is exposed; the opposite drive is behind it. -->
      <path d="M430 201 L439 198 L447 205 L445 216 L434 219 L428 212 Z" fill="#a4b0a0" stroke="#637b70" stroke-width="1.6"/>
      <circle cx="437" cy="208" r="5" fill="#d5ddcc" stroke="#637b70" stroke-width="1.4"/>
      <path d="M437 208 L451 191 L440 190" fill="none" stroke="#a56d34" stroke-width="3.5"/>
      <path d="${clear ? 'M451 191 L504 157 L526 136 M443 210 Q464 183 504 157' : 'M451 191 L477 183 L519 181 M443 210 Q469 192 501 184'}" fill="none" stroke="#9e8e72" stroke-width="2.4"/>
      <g fill="#f3f5f0" stroke="#806c4c" stroke-width="1.2"><circle cx="451" cy="191" r="2.5"/><circle cx="437" cy="208" r="2"/></g>
      <path d="${roofs[position]}" fill="#526a61" stroke="#273f35" stroke-width="3"/>
      <path d="${linings[position]}" fill="none" stroke="#c4c9b3" stroke-width="2"/>
      <path d="${frames[position]}" fill="none" stroke="#c39b64" stroke-width="3.5"/>
      ${joints[position].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="#e3d4b8" stroke="#806c4c" stroke-width="1.2"/>`).join('')}
      ${position < 2 ? '<path d="M365 89 L362 101 M405 93 L401 104 M424 103 L419 113 M427 151 L432 178" stroke="#879b88" stroke-width="1.5" fill="none"/><path d="M319 115 Q368 105 409 127 L423 160" stroke="#273f35" stroke-width="2" fill="none"/>' : ''}
      <g transform="translate(${gx} ${gy}) rotate(${angle})">
        <!-- A rigid pane seen nearly edge-on, retained as one piece in every pose. -->
        <rect x="-31" y="-4" width="62" height="8" rx="2" fill="#b5d8de" stroke="#3a6065" stroke-width="2.5"/>
        <path d="M-26 -1 H26 M-26 1.5 H26" stroke="#6f9fa9" stroke-width=".8"/>
      </g>
      <!-- The raised cover stays local to its own compartment, ahead of the rear boot. -->
      <path d="${clear ? 'M492 162 Q514 131 540 101 Q546 100 550 106 L552 111 Q528 144 502 170 Z' : 'M424 178 Q471 172 536 179 L540 184 Q481 179 425 185 Z'}" fill="#789b80" stroke="#315d4d" stroke-width="2.5"/>
      <path d="${clear ? 'M501 162 Q526 130 547 109' : 'M431 181 Q480 176 533 181'}" fill="none" stroke="#bed0b9" stroke-width="1.4"/>
      <path d="M548 180 Q575 182 606 193" fill="none" stroke="#9bae9f" stroke-width="1.4"/>
      <!-- Fixed receiver, travelling manual catch and front-frame locating nose. -->
      <path d="M309 108 L311 115 L318 115" fill="none" stroke="#637b70" stroke-width="2"/>
      <path d="M${hx} ${hy + 8} l${position === 0 ? '3 3 v4 h-5' : '-6 9 h-6 l-2 -3'}" fill="none" stroke="#a56d34" stroke-width="2.7"/>
      ${position > 1 ? `<path d="M${hx} ${hy + 3} l-4 -2" stroke="#c7b28d" stroke-width="2.5"/>` : ''}
      ${position === 2 ? '<path d="M328 79 Q342 55 370 59 M360 54 L370 59 L361 66" fill="none" stroke="#a56d34" stroke-width="2"/>' : ''}
      ${position === 3 ? '<path d="M402 110 Q401 151 420 169 M411 164 L420 169 L421 159" fill="none" stroke="#a56d34" stroke-width="2"/>' : ''}
    </g>`;
}

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { stage: 0 });
  state.stage = Math.max(0, Math.min(4, Math.round(Number(state.stage) || 0)));
  const { stage, controls, explanation } = panel(host, {
    title: 'From a closed roof to an open roadster',
    description:
      'Follow the fabric roof, its rigid rear glass and the moving compartment cover. The body is cut away to reveal the stowed package.',
    note: 'Ordinary MY2010 2.9 roof. Photo-guided cutaway; pivots, folds and intermediate poses are illustrative. Real movements overlap. Use the handbook for operation. The Spyder roof differs.',
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
        s === 4 ? [451, 196] : s === 3 ? [472, 113] : s === 2 ? [410, 83] : [377, 91],
        s === 4 ? [470, 205] : s === 3 ? [477, 172] : s === 2 ? [469, 147] : [467, 151],
        s === 2 || s === 3 ? [531, 126] : [520, 180],
        [473, 227],
      ];
      const markerPositions = [
        [
          [294, 75],
          [384, 62],
          [508, 125],
          [567, 157],
          [555, 249],
        ],
        [
          [294, 75],
          [384, 62],
          [508, 125],
          [567, 157],
          [555, 249],
        ],
        [
          [347, 54],
          [431, 53],
          [503, 147],
          [575, 101],
          [555, 249],
        ],
        [
          [410, 102],
          [483, 75],
          [515, 175],
          [575, 111],
          [555, 249],
        ],
        [
          [412, 247],
          [424, 159],
          [492, 250],
          [562, 154],
          [555, 278],
        ],
      ];
      badges.forEach(([x, y], i) => {
        // Numeric keys keep full-size labels away from moving geometry on phones.
        const marker = markerPositions[s][i];
        const bx = offset + marker[0] * scale;
        const by = top + marker[1] * scale;
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
