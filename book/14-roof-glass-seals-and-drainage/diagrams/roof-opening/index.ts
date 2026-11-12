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
  [437, 178],
];

// The 624-unit envelope uses the UK 01/10 brochure's 4342 mm length,
// 2415 mm wheelbase and 1292 mm height. Tyre envelopes are nominal 205/55 R17
// and 235/50 R17. Photos guide the contour; PET identifies the parts.
// The five hand-authored snapshots are not a calibrated linkage simulation.
// The same artwork is used to produce the static poster.
export function roofArtwork(position: number) {
  const roofs = [
    'M312 102 C337 88 371 86 401 91 C429 97 446 112 461 129 L493 158 L480 162 L450 138 C431 119 421 112 404 107 C378 99 345 101 316 112 Z',
    'M312 102 C337 88 371 86 401 91 C429 97 446 112 461 129 L493 158 L480 162 L450 138 C431 119 421 112 404 107 C378 99 345 101 316 112 Z',
    'M364 82 C387 73 412 77 434 93 C450 106 460 116 469 128 L493 156 L481 163 L458 135 C444 116 437 111 423 102 C405 92 387 91 368 94 Z',
    'M433 117 Q456 106 480 108 L497 119 L466 140 L498 161 L489 170 L454 145 L483 123 Q459 118 439 130 Z',
    'M431 175 Q451 169 469 175 L496 172 L510 179 L502 194 L476 198 L450 192 L434 196 Z',
  ];
  const frames = [
    'M317 112 L362 108 Q392 108 414 119 L428 140 L439 170 M414 119 L423 141 L439 170 L481 159',
    'M317 112 L362 108 Q392 108 414 119 L428 140 L439 170 M414 119 L423 141 L439 170 L481 159',
    'M369 94 L404 95 L433 116 L448 134 L439 170 M433 116 L428 134 L439 170 L482 159',
    'M439 129 L482 119 L460 140 L439 170 M460 140 L489 164 M482 119 L475 133 L439 170',
    'M437 179 L478 193 L501 178 M440 195 L472 176 L502 193',
  ];
  const linings = [
    'M320 108 Q369 96 403 107 Q430 111 454 135',
    'M320 108 Q369 96 403 107 Q430 111 454 135',
    'M371 90 Q404 84 431 104 Q449 111 463 131',
    'M440 124 Q463 113 488 119 L460 141 L491 163',
    'M436 182 Q453 176 471 183 L499 179 M440 191 L473 187 L499 192',
  ];
  const panes = [
    [467, 135, 37],
    [467, 135, 37],
    [469, 127, 43],
    [477, 152, 24],
    [470, 185, 0],
  ];
  const joints = [
    [
      [362, 108],
      [414, 119],
      [428, 140],
      [439, 170],
    ],
    [
      [362, 108],
      [414, 119],
      [428, 140],
      [439, 170],
    ],
    [
      [404, 95],
      [433, 116],
      [448, 134],
      [439, 170],
    ],
    [
      [482, 119],
      [460, 140],
      [475, 133],
      [439, 170],
    ],
    [
      [478, 193],
      [501, 178],
      [472, 176],
      [439, 189],
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
      ${wheel(183.15, 47.23)}${wheel(530.22, 47.91)}
      <!-- Ordinary 987.2 body, with wheel arches and a section above the well. -->
      <!-- Reuse the photo-guided family silhouette at 624/544 scale. The
           overhang split is illustrative; length and wheelbase share one scale. -->
      <g transform="translate(-6.11765 -172.20588) scale(1.14705882)">
        <path d="M28 333 C28 321 39 313 48 306 C67 293 90 286 116 280 C141 273 163 272 183 275 L236 280 C284 282 334 283 365 278 C383 271 403 267 428 269 C477 269 512 274 540 288 C558 296 568 306 571 321 L572 346 Q568 358 554 362 L513.57 366 V347 A46 46 0 0 0 421.57 347 V366 H210 V347 A45 45 0 0 0 120 347 V366 L57 359 Q35 354 29 345 Z" fill="#dfe7df" stroke="#637b70" stroke-width="2.2"/>
      </g>
      <path d="M47 194 Q63 181 88 173 Q100 169 112 176 Q96 190 67 202 Q53 203 47 194 Z" fill="#eaf0e9" stroke="#8ca394" stroke-width="1.4"/>
      <path d="M51 191 Q73 178 97 175 M44 221 Q64 217 82 221 Q84 226 81 235 Q64 239 44 235 Z M46 226 H81 M47 232 H80 M51 244 Q93 252 127 251" fill="none" stroke="#a0b2a5" stroke-width="1.5"/>
      <path d="M598 158 Q622 163 638 180 L635 187 Q612 182 594 169 Q593 163 598 158 Z" fill="#b29b89" fill-opacity=".6" stroke="#8c9e8c" stroke-width="1.2"/>
      <path d="M607 192 Q632 197 646 205 M590 241 Q620 241 643 230" fill="none" stroke="#a0b2a5" stroke-width="1.7"/>
      <path d="M265 150 L277 230 Q331 239 408 233 L422 151 M248 246 H470" fill="none" stroke="#a0b2a5" stroke-width="1.6"/>
      <path d="M418 187 Q427 178 443 179 L451 205 L432 218 Z M423 188 L441 188 M426 195 L443 195 M429 202 L446 202 M432 209 L448 208" fill="#bbcbbf" stroke="#8da493" stroke-width="1.4"/>
      <path d="M380 166 H398" stroke="#849b8b" stroke-width="3"/>
      <!-- Fixed raked windscreen, dashboard, seat shell and roll-over bar. -->
      <path d="M261 150 L311 99 Q315 97 320 102 L272 151 Z" fill="#b9d7dc" fill-opacity=".65" stroke="#5b7e86" stroke-width="2"/>
      <path d="M263 149 L312 103" fill="none" stroke="#315d4d" stroke-width="4"/>
      <path d="M308 102 L320 103" stroke="#273f35" stroke-width="5"/>
      <path d="M274 154 Q293 150 310 160 M278 158 Q294 155 307 163" fill="none" stroke="#839a8a" stroke-width="2"/>
      <g aria-label="Steering wheel and column, seen from the side">
        <path d="M305 184 L323 173" stroke="#637b70" stroke-width="4"/>
        <ellipse cx="324" cy="172" rx="5.5" ry="24" transform="rotate(-29 324 172)" fill="none" stroke="#496255" stroke-width="3"/>
        <path d="M312 151 L324 172 L336 193" fill="none" stroke="#7f9585" stroke-width="1.8"/>
        <circle cx="324" cy="172" r="3.5" fill="#718779"/>
      </g>
      <g aria-label="Rearward-reclining seat with integrated head restraint">
        <path d="M341 202 Q356 200 376 202 L389 157 Q390 149 397 146 L398 138 Q391 136 393 127 L396 119 Q398 113 405 116 L412 119 Q415 122 413 131 L407 147 L394 201 Q392 210 382 213 L346 216 Q336 216 338 208 Z" fill="#c9ad8d" stroke="#96744d" stroke-width="2"/>
        <path d="M395 152 L383 197 Q381 204 373 205 M346 208 Q364 206 383 207 M398 128 Q404 126 408 130 M346 222 H391 M352 216 V222 M385 215 V222" fill="none" stroke="#ad8d68" stroke-width="1.6"/>
      </g>
      <path d="M414 159 L415 135 Q416 121 426 120 Q437 122 437 136 L436 159" fill="none" stroke="#71837b" stroke-width="8"/>
      <path d="M417 155 L418 135 Q419 124 426 124 Q433 125 434 136 L433 155" fill="none" stroke="#b8c4b9" stroke-width="2"/>
      <path d="M272 150 ${position === 0 ? 'L315 111 Q371 102 408 119 L422 151' : 'L303 131 Q359 124 407 136 L420 151'} Z" fill="#b9d7dc" fill-opacity=".18" stroke="#8cabb1" stroke-width="1.4"/>
      <!-- Centreline cutaway: the near-side skin is omitted over the compartment. -->
      <path d="M426 164 L433 206 Q463 214 505 204 L516 165" fill="#f3f5f0" stroke="#9aaa9b" stroke-width="1.6" stroke-dasharray="4 4"/>
      <path d="M438 205 Q466 211 500 204" fill="none" stroke="#c4cfc1" stroke-width="3"/>
      <path d="M428 163 Q477 157 537 162" fill="none" stroke="#b2c3b2" stroke-width="2" ${clear ? 'stroke-dasharray="5 5"' : ''}/>
      <!-- One side gearbox/output lever is exposed; the opposite drive is behind it. -->
      <path d="M430 181 L439 178 L447 185 L445 196 L434 199 L428 192 Z" fill="#a4b0a0" stroke="#637b70" stroke-width="1.6"/>
      <circle cx="437" cy="188" r="5" fill="#d5ddcc" stroke="#637b70" stroke-width="1.4"/>
      <path d="M437 188 L451 171 L440 170" fill="none" stroke="#a56d34" stroke-width="3.5"/>
      <path d="${clear ? 'M451 171 L504 137 L526 116 M443 190 Q464 163 504 137' : 'M451 171 L477 163 L519 161 M443 190 Q469 172 501 164'}" fill="none" stroke="#9e8e72" stroke-width="2.4"/>
      <g fill="#f3f5f0" stroke="#806c4c" stroke-width="1.2"><circle cx="451" cy="171" r="2.5"/><circle cx="437" cy="188" r="2"/></g>
      <path d="${roofs[position]}" fill="#526a61" stroke="#273f35" stroke-width="3"/>
      <path d="${linings[position]}" fill="none" stroke="#c4c9b3" stroke-width="2"/>
      <path d="${frames[position]}" fill="none" stroke="#c39b64" stroke-width="3.5"/>
      ${joints[position].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5" fill="#e3d4b8" stroke="#806c4c" stroke-width="1.2"/>`).join('')}
      ${position < 2 ? '<path d="M365 89 L362 101 M405 93 L401 104 M424 103 L419 113 M427 136 L432 158" stroke="#879b88" stroke-width="1.5" fill="none"/><path d="M319 115 Q368 105 409 122 L423 145" stroke="#273f35" stroke-width="2" fill="none"/>' : ''}
      <g transform="translate(${gx} ${gy}) rotate(${angle})">
        <!-- A rigid pane seen nearly edge-on, retained as one piece in every pose. -->
        <rect x="-31" y="-4" width="62" height="8" rx="2" fill="#b5d8de" stroke="#3a6065" stroke-width="2.5"/>
        <path d="M-26 -1 H26 M-26 1.5 H26" stroke="#6f9fa9" stroke-width=".8"/>
      </g>
      <!-- The raised cover stays local to its own compartment, ahead of the rear boot. -->
      <path d="${clear ? 'M492 142 Q514 111 540 81 Q546 80 550 86 L552 91 Q528 124 502 150 Z' : 'M424 158 Q471 152 536 159 L540 164 Q481 159 425 165 Z'}" fill="#789b80" stroke="#315d4d" stroke-width="2.5"/>
      <path d="${clear ? 'M501 142 Q526 110 547 89' : 'M431 161 Q480 156 533 161'}" fill="none" stroke="#bed0b9" stroke-width="1.4"/>
      <path d="M548 143 Q575 145 606 157" fill="none" stroke="#9bae9f" stroke-width="1.4"/>
      <!-- Fixed receiver, travelling manual catch and front-frame locating nose. -->
      <path d="M309 108 L311 115 L318 115" fill="none" stroke="#637b70" stroke-width="2"/>
      <path d="M${hx} ${hy + 8} l${position === 0 ? '3 3 v4 h-5' : '-6 9 h-6 l-2 -3'}" fill="none" stroke="#a56d34" stroke-width="2.7"/>
      ${position > 1 ? `<path d="M${hx} ${hy + 3} l-4 -2" stroke="#c7b28d" stroke-width="2.5"/>` : ''}
      ${position === 2 ? '<path d="M328 79 Q342 55 370 59 M360 54 L370 59 L361 66" fill="none" stroke="#a56d34" stroke-width="2"/>' : ''}
      ${position === 3 ? '<path d="M402 110 Q401 151 420 169 M411 164 L420 169 L421 159" fill="none" stroke="#a56d34" stroke-width="2"/>' : ''}
    </g>`;
}

export function roofCallouts(s: number) {
  const [hx, hy] = headers[s];
  return {
    targets: [
      // Follow the catch, glass and cover in the same coordinates as the artwork.
      [hx + (s === 0 ? 3 : -6), hy + (s === 0 ? 11 : 17)],
      s === 4 ? [451, 176] : s === 3 ? [472, 113] : s === 2 ? [410, 83] : [377, 91],
      s === 4 ? [470, 185] : s === 3 ? [477, 152] : s === 2 ? [469, 127] : [467, 135],
      s === 2 || s === 3 ? [531, 106] : [520, 160],
      [473, 207],
    ],
    markers: [
      [
        [294, 75],
        [384, 62],
        [508, 115],
        [567, 119],
        [466, 268],
      ],
      [
        [294, 75],
        [384, 62],
        [508, 115],
        [567, 119],
        [466, 268],
      ],
      [
        [347, 54],
        [431, 53],
        [503, 127],
        [575, 81],
        [466, 268],
      ],
      [
        [410, 92],
        [483, 75],
        [523, 163],
        [575, 91],
        [466, 268],
      ],
      [
        [382, 268],
        [450, 125],
        [424, 268],
        [562, 110],
        [466, 268],
      ],
    ][s],
  };
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
      const scale = Math.min(w / 680, 1);
      const offset = (w - 680 * scale) / 2;
      const top = 49;
      const base = top + 310 * scale;
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

      const { targets: badges, markers } = roofCallouts(s);
      badges.forEach(([x, y], i) => {
        // Numeric keys keep full-size labels away from moving geometry on phones.
        const marker = markers[i];
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
      stage.style.height = `${Math.max(compact ? 420 : 500, Math.ceil(driveTop + 28))}px`;
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
