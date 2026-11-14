export type SpeakerPackage = 'standard' | 'plus' | 'bose';

export const packages = [
  {
    key: 'standard',
    label: 'Standard · 4',
    title: 'Standard · 4 loudspeakers',
    counts: [2, 2, 0],
    output: 'Two head-unit output stages · 2 × 25 W',
    dashboard: 'Two tweeters clip into the outer dashboard positions. There is no centre driver.',
    door: 'One bass driver in each door, in its own four-bolt housing. No door midrange driver.',
    rear: 'No rear speaker enclosure.',
  },
  {
    key: 'plus',
    label: 'Sound Package Plus · 7',
    title: 'Sound Package Plus · 7 loudspeakers',
    counts: [3, 4, 0],
    output: 'Separate analogue amplifier · 185 W',
    dashboard: 'Two outer tweeters and one centre driver. The centre grille is a separate speaker position.',
    door: 'One midrange driver above one bass driver in each door. The bass housing differs from the standard unit.',
    rear: 'No rear speaker enclosure.',
  },
  {
    key: 'bose',
    label: 'BOSE · 11',
    title: 'BOSE · 11 loudspeakers',
    counts: [3, 4, 4],
    output: 'Seven-channel digital amplifier · 385 W',
    dashboard: 'Two 25 mm tweeters and one 70 mm centre driver.',
    door: 'One 80 mm midrange and one 200 mm bass driver in each door. Four door speakers altogether.',
    rear: 'One enclosure behind the seats contains two 130 mm bass drivers and two 65 mm mid/high-range drivers.',
  },
] as const;

const ink = '#243e34';
const blue = '#2c7895';
const green = '#176b53';
const outline = `fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
const circle = (x: number, y: number, r: number, fill: string, extra = '') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const label = (x: number, y: number, text: string, size = 24) =>
  `<text x="${x}" y="${y}" fill="${ink}" font-size="${size}">${text}</text>`;
const badge = (x: number, y: number, number: number) =>
  `<g data-location="${number}">${circle(x, y, 15, green, 'stroke="#fff" stroke-width="2"')}<text x="${x}" y="${y}" fill="#fff" text-anchor="middle" dominant-baseline="central" font-size="21" font-weight="600">${number}</text></g>`;

/** Driver faces and mounting housings are distinct; published nominal sizes guide the proportions. */
function driver(x: number, y: number, radius: number, family: string, tweeter = false) {
  const ribs = Array.from({ length: tweeter ? 3 : 8 }, (_, index) => {
    const angle = (index * Math.PI * 2) / (tweeter ? 3 : 8);
    const inner = tweeter ? radius * 0.45 : radius * 0.25;
    return `<path d="M${x + Math.cos(angle) * inner} ${y + Math.sin(angle) * inner} L${x + Math.cos(angle) * radius * 0.94} ${y + Math.sin(angle) * radius * 0.94}" stroke="${ink}" stroke-width="${tweeter ? 2.5 : 1.5}"/>`;
  }).join('');
  return `<g data-speaker-driver="${family}">${circle(x, y, radius + (tweeter ? 5 : 7), '#c3d0c8', `stroke="${ink}" stroke-width="1.5"`)}${circle(x, y, radius, '#b6d0da', `stroke="${blue}" stroke-width="1.5"`)}${circle(x, y, radius * 0.7, '#dce7e7', `stroke="${blue}" stroke-width="1"`)}${ribs}${circle(x, y, radius * 0.25, blue)}</g>`;
}

function svg(width: number, height: number, id: string, title: string, content: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${title}</title><desc id="${id}-desc">Photo-guided speaker housings and cabin locations. Mountings and hidden geometry are illustrative, not measured fitting dimensions.</desc><rect width="${width}" height="${height}" fill="#f5f6ef"/><g font-family="'Source Sans 3',Arial,sans-serif">${content}</g></svg>`;
}

export function carPlan(kind: SpeakerPackage) {
  // Catalogue body envelope and axle spacing use one scale. The plan contours
  // follow the factory overhead photograph; the normal Boxster's rear deck,
  // seats and speaker shelf follow the UK01/10 cutaway, not the Spyder's trim.
  const scale = 720 / 4342;
  const top = 210 - (1801 * scale) / 2;
  const bottom = 420 - top;
  const frontAxle = 400 - 1207.5 * scale;
  const rearAxle = 400 + 1207.5 * scale;
  // Faint dashed tyres are hidden beneath the wings, not blocks on the paint.
  const wheels = [frontAxle, rearAxle]
    .flatMap((x, index) =>
      [86, 334].map(
        (y) =>
          `<rect data-plan-axle="${index === 0 ? 'front' : 'rear'}" x="${x - 55}" y="${y - (index === 0 ? 17 : 19.5)}" width="110" height="${index === 0 ? 34 : 39}" rx="9" fill="#9eafa4" fill-opacity=".12" stroke="#91a498" stroke-width="1.5" stroke-dasharray="4 4"/>`,
      ),
    )
    .join('');
  const doors = [false, true]
    .map(
      (lower) =>
        `<g${lower ? ' transform="translate(0 420) scale(1 -1)"' : ''}><path d="M362 94 Q432 91 512 98 L520 114 Q436 107 366 113 Z" fill="#b6d0da" stroke="${blue}" stroke-width="1.5"/></g>${badge(442, lower ? 317 : 103, 2)}`,
    )
    .join('');
  const seats = [148, 272]
    .map(
      (y, index) =>
        `<g data-plan-seat="${index === 0 ? 'passenger' : 'driver'}" fill="#dec6a3" stroke="#a67d4d" stroke-width="1.5">
          <path data-seat-cushion="" d="M409 ${y - 34} Q400 ${y - 32} 399 ${y - 22} L399 ${y + 22} Q400 ${y + 32} 409 ${y + 34} L471 ${y + 38} Q480 ${y + 26} 480 ${y} Q480 ${y - 26} 471 ${y - 38} Z"/>
          <path d="M415 ${y - 23} L466 ${y - 26} Q473 ${y} 466 ${y + 26} L415 ${y + 23} Q409 ${y} 415 ${y - 23} Z" fill="#e8d2b2"/>
          <path d="M423 ${y - 23} V${y + 23} M439 ${y - 24} V${y + 24} M455 ${y - 25} V${y + 25}" fill="none" stroke="#bc9a6d" stroke-width="1"/>
          <path d="M483 ${y - 41} Q474 ${y - 40} 474 ${y - 27} L477 ${y - 12} V${y + 12} L474 ${y + 27} Q474 ${y + 40} 483 ${y + 41} L499 ${y + 38} Q509 ${y + 34} 509 ${y + 22} V${y - 22} Q509 ${y - 34} 499 ${y - 38} Z"/>
          <rect x="503" y="${y - 21}" width="19" height="42" rx="8" fill="#e8d2b2"/>
          <path d="M485 ${y - 29} Q495 ${y} 485 ${y + 29}" fill="none" stroke="#bc9a6d"/>
        </g>`,
    )
    .join('');
  const headlamp = `<path d="M89 127 C90 114 113 91 133 88 C151 85 157 94 148 108 C140 123 120 140 104 143 C94 145 87 140 89 127 Z" fill="#d3e2e5" stroke="#6a8b88" stroke-width="1.5"/>
    <ellipse cx="130" cy="106" rx="12" ry="10" transform="rotate(-43 130 106)" fill="#b5cbd2" stroke="#6a8b88"/>
    <ellipse cx="106" cy="128" rx="8" ry="7" transform="rotate(-43 106 128)" fill="#eaf0ec" stroke="#8fa6a4"/>
    <path d="M98 139 Q123 129 146 100" stroke="#fff" stroke-width="2" fill="none"/>`;
  const rearLamp = `<path d="M687 79 Q716 87 731 107 Q740 121 744 145 L714 126 Q700 110 687 79 Z" fill="#bd6662" stroke="#8a5550" stroke-width="1.5"/>
    <path d="M701 98 Q716 107 734 130 L730 121 Q716 105 701 98 Z" fill="#d9ddd1"/>
    <path d="M699 90 Q721 103 738 133" stroke="#914b49" fill="none"/>`;
  const rear =
    kind === 'bose'
      ? `<path d="M539 119 Q552 115 559 126 V294 Q552 305 539 301 Z" fill="#b6d0da" stroke="${blue}" stroke-width="2"/>${badge(550, 210, 3)}`
      : '';
  return svg(
    800,
    420,
    `speaker-plan-${kind}`,
    'Speaker locations · left-hand drive · plan view · front to the left',
    `
    ${label(28, 31, 'LHD · front ←', 23)}${label(534, 31, 'Roof and trim cut away', 21)}
    <path data-car-envelope="4342:1801" d="M40 210 C40 146 52 110 91 86 C119 68 163 ${top} 200 ${top} C252 ${top} 278 77 335 79 H477 C530 79 550 ${top} 600 ${top} C654 ${top} 704 64 729 100 C751 130 760 172 760 210 C760 248 751 290 729 320 C704 356 654 ${bottom} 600 ${bottom} C550 ${bottom} 530 341 477 341 H335 C278 343 252 ${bottom} 200 ${bottom} C163 ${bottom} 119 352 91 334 C52 310 40 274 40 210 Z" fill="#e1e8e2" stroke="${ink}" stroke-width="2.5"/>
    ${wheels}
    <path d="M82 210 C82 177 93 157 114 144 L278 107 Q266 210 278 313 L114 276 C93 263 82 243 82 210 Z" fill="#e8ede6" stroke="${ink}" stroke-width="1.8"/>
    <path d="M125 147 Q196 121 269 119 M125 273 Q196 299 269 301 M56 174 Q51 210 56 246" stroke="#a4b5a9" stroke-width="1.3" fill="none"/>
    <g data-plan-headlamp="right">${headlamp}</g>
    <g data-plan-headlamp="left" transform="translate(0 420) scale(1 -1)">${headlamp}</g>
    <path d="M329 108 H516 Q531 210 516 312 H329 Q312 210 329 108 Z" fill="#f5f6ef" stroke="#8b9e93" stroke-width="2"/>
    <path d="M291 101 Q242 210 291 319 L373 306 Q374 210 373 114 Z" fill="#c7dce2" fill-opacity=".65" stroke="#6a8b88" stroke-width="2"/>
    <path d="M291 101 Q242 210 291 319" stroke="#647d72" stroke-width="6" fill="none"/>
    <path d="M373 114 Q374 210 373 306" stroke="#9eb4b1" stroke-width="3" fill="none"/>
    ${doors}
    <path d="M316 114 Q299 210 316 306 L346 300 Q329 210 346 120 Z" fill="#b6d0da" stroke="${blue}" stroke-width="1.5"/>
    <path d="M337 195 L362 198 H499 Q508 210 499 222 H362 L337 225 Z" fill="#b1beb2" stroke="${ink}" stroke-width="1.2"/>
    <path d="M366 203 H395 V217 H366 Z" fill="#d9dfd4" stroke="#839b94"/>
    ${circle(381, 210, 4, '#6b7f73')}
    <path d="M432 215 H465" stroke="#6b7f73" stroke-width="4" stroke-linecap="round"/>
    ${seats}
    <path d="M325 251 Q330 240 342 240 V303 Q328 303 325 292 Z" fill="#7f9587" stroke="${ink}"/>
    <path d="M339 272 H365" stroke="#667e70" stroke-width="5"/>
    <g data-plan-steering="left-hand-drive">
      <circle cx="365" cy="272" r="23" fill="#e9ede4" stroke="${ink}" stroke-width="3"/>
      <path d="M344 266 L365 273 L386 266 M365 273 V293" stroke="${ink}" stroke-width="2.5" fill="none"/>
      ${circle(365, 272, 6, '#b6c4b7', `stroke="${ink}"`)}
    </g>
    <path d="M531 112 Q543 148 531 184 M531 236 Q543 272 531 308" stroke="#718b7d" stroke-width="7" fill="none"/>
    <path d="M530 113 Q539 148 530 183 M530 237 Q539 272 530 307" stroke="#c6d2c9" stroke-width="3" fill="none"/>
    ${rear}
    <path d="M519 93 Q575 98 591 146 Q607 210 591 274 Q575 322 519 327 M594 106 Q652 92 703 119 Q728 158 730 210 Q728 262 703 301 Q652 328 594 314 Q613 210 594 106 Z" ${outline}/>
    <path d="M580 170 Q587 210 580 250" stroke="#b0bfb3" stroke-width="5" fill="none"/>
    <g>${rearLamp}</g><g transform="translate(0 420) scale(1 -1)">${rearLamp}</g>
    <path d="M748 170 Q753 210 748 250" stroke="#a4b5a9" stroke-width="1.3" fill="none"/>
    <path d="M354 80 L343 63 Q342 51 355 51 Q369 52 374 80 M354 340 L343 357 Q342 369 355 369 Q369 368 374 340" fill="#d3ded6" stroke="#839b94" stroke-width="1.5"/>
    ${driver(328, 124, 7, 'plan-tweeter', true)}${driver(328, 296, 7, 'plan-tweeter', true)}
    ${kind !== 'standard' ? driver(339, 210, 12, 'plan-centre') : ''}
    ${badge(288, 210, 1)}
  `,
  );
}

export function dashboardDetail(kind: SpeakerPackage) {
  const radius = 10;
  return svg(
    260,
    155,
    `speaker-dash-${kind}`,
    'Outer dashboard tweeters and optional centre driver, enlarged',
    `
    <path d="M13 77Q130 30 247 77L241 120Q130 91 19 120Z" fill="#dce5dd" stroke="#839b94" stroke-width="2"/>
    ${[46, 214].map((x) => `<path d="M${x - radius - 8} 80h-6v12h6M${x + radius + 8} 80h6v12h-6" ${outline}/>${driver(x, 86, radius, 'tweeter', true)}`).join('')}
    ${kind !== 'standard' ? driver(130, 80, 28, 'centre') : ''}
  `,
  );
}

export function doorDetail(kind: SpeakerPackage) {
  const more = kind !== 'standard';
  // BOSE nominal driver-size ratio: 80 mm / 200 mm = 0.4, from UK01/10 p89.
  const midRadius = kind === 'bose' ? 19.2 : 24;
  return svg(
    300,
    220,
    `speaker-door-${kind}`,
    'One door with trim cut away to reveal its speaker housings',
    `
    <path d="M22 29Q110 17 161 37L277 58L279 178Q170 214 27 192Z" fill="#e0e7df" stroke="#839b94" stroke-width="2"/>
    <path d="M29 73L256 92M144 86L208 93L214 122L148 114Z M155 147L262 157L261 181L156 186Z" fill="#c3d0c8" stroke="#839b94" stroke-width="2"/>
    <path d="M68 84L116 89L141 141L128 193L74 204L28 173L26 125Z" fill="#9fb2a7" stroke="${ink}" stroke-width="2"/>
    ${driver(84, 148, 48, 'bass')}
    ${[
      [35, 123],
      [113, 94],
      [130, 178],
      [56, 197],
    ]
      .map(([x, y]) => circle(x, y, 4, '#f5f6ef', `stroke="${ink}" stroke-width="1.5"`))
      .join('')}
    ${more ? driver(104, 58, midRadius, 'midrange') : '<path d="M75 48H132M75 58H132" stroke="#a6b6ac" stroke-width="2"/>'}
  `,
  );
}

export function rearDetail() {
  return svg(
    300,
    220,
    'speaker-rear-bose',
    'BOSE rear enclosure with four drivers, cover partly cut away',
    `
    <path d="M18 107L48 56Q149 35 255 56L282 107L277 169Q225 184 191 171L177 153H122L109 171Q62 183 22 162Z" fill="#b7c8bd" stroke="${ink}" stroke-width="2"/>
    <path d="M18 107Q67 126 112 112L127 95H176L191 112Q239 126 282 107M41 71L30 106M261 71L273 106" ${outline}/>
    <g data-speaker-driver="rear-bass"><ellipse cx="85" cy="78" rx="36" ry="20" fill="#b6d0da" stroke="${blue}" stroke-width="2"/><ellipse cx="85" cy="78" rx="27" ry="14" fill="#dce7e7" stroke="${blue}"/>${circle(85, 78, 7, blue)}</g>
    <g data-speaker-driver="rear-bass"><ellipse cx="216" cy="78" rx="36" ry="20" fill="#b6d0da" stroke="${blue}" stroke-width="2"/><ellipse cx="216" cy="78" rx="27" ry="14" fill="#dce7e7" stroke="${blue}"/>${circle(216, 78, 7, blue)}</g>
    ${driver(62, 146, 18, 'rear-mid-high')}${driver(239, 146, 18, 'rear-mid-high')}
    <path d="M45 57Q85 40 124 57M177 57Q217 40 257 57" stroke="#839b94" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
  `,
  );
}

export function staticFrame(index: number) {
  const p = packages[index];
  const height = p.key === 'bose' ? 1110 : 890;
  const details = [
    {
      title: `1 · Dashboard · ${p.counts[0]} speakers`,
      image: dashboardDetail(p.key),
      lines:
        p.key === 'standard'
          ? ['Two outer tweeters', 'Clip-in housings']
          : ['Two tweeters + centre', 'Separate mounting positions'],
    },
    {
      title: `2 · Each door · ${p.counts[1] / 2} speaker${p.counts[1] === 2 ? '' : 's'}`,
      image: doorDetail(p.key),
      lines:
        p.key === 'standard'
          ? ['One bass driver', 'Four-bolt housing']
          : ['Midrange above bass', 'Two speakers per door'],
    },
    ...(p.key === 'bose'
      ? [
          {
            title: '3 · Rear enclosure · 4 speakers',
            image: rearDetail(),
            lines: ['Two 130 mm bass drivers', 'Two 65 mm mid/high drivers'],
          },
        ]
      : []),
  ];
  const rows = details
    .map((detail, i) => {
      const y = 410 + i * 220;
      return `${label(24, y, detail.title, 25)}<g transform="translate(14 ${y + 15}) scale(.77)">${detail.image}</g>${label(264, y + 83, detail.lines[0], 22)}${label(264, y + 117, detail.lines[1], 22)}`;
    })
    .join('');
  return svg(
    600,
    height,
    `speaker-static-${p.key}`,
    p.title,
    `
    <rect width="600" height="${height}" fill="#f5f6ef"/>
    ${label(24, 43, p.title, 28)}${label(24, 80, `${p.counts[0]} dashboard + ${p.counts[1]} doors + ${p.counts[2]} rear`, 24)}
    <g transform="translate(0 90) scale(.75)">${carPlan(p.key)}</g>
    ${rows}
    ${label(24, height - 55, p.output, 22)}${label(24, height - 22, 'Locations and housings illustrated; details enlarged.', 21)}
  `,
  );
}
