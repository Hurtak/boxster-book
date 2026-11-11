import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel } from '../../../../interactive/ui.ts';

const layers = [
  {
    id: 'all',
    label: 'All spaces',
    text: 'Behind the seats, the folding roof has its own bay above the engine region. The rear boot is farther back. The roof-bay cover and rear luggage lid are separate exterior panels; the removable engine cover is an internal service layer.',
  },
  {
    id: 'luggage',
    label: 'Rear boot',
    text: 'The rear boot has its own luggage lid. Porsche quotes 130 litres even with the ordinary powered roof lowered: the folded roof uses its dedicated bay. A small flap at the front right inside the boot exposes oil and coolant fillers, rather than the complete engine.',
  },
  {
    id: 'roof',
    label: 'Roof bay',
    text: 'The folded roof occupies the bay immediately behind the occupants, above the engine region. Its exterior compartment cover moves to provide clearance during roof operation. This is a different panel from the rear luggage lid.',
  },
  {
    id: 'access',
    label: 'Service layers',
    text: 'Carpet trim lies above the removable top engine cover and its perimeter seal (PET 807-005, items 1, 5 and 7). A separate cover behind the cabin rear-wall trim provides another access boundary. The rear boot has a different small flap for the oil and coolant fillers. These are component relationships, not removal steps.',
  },
];

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { layer: 'all' });
  if (!layers.some((layer) => layer.id === state.layer)) state.layer = 'all';
  const { stage, controls, explanation } = panel(host, {
    title: 'Separate the rear body layers',
    description:
      'Use the seat and body outline to locate three spaces and their different covers. Choose a layer to highlight its boundaries.',
    note: 'Ordinary powered-roof Boxster 2.9. Approximate centre section; front is left and the wheel is beyond the cut. The right-side filler flap is projected into view. Only the detail separates access layers. Not factory CAD or a service procedure.',
  });
  // A taller local stage keeps the same legible cutaway at phone and desktop widths.
  stage.style.height = 'auto';
  stage.style.aspectRatio = '720 / 760';
  stage.style.maxHeight = '760px';
  let row: HTMLDivElement;
  const redraw = svgDiagram(
    stage,
    'Rear-body cutaway: separate roof cover, boot lid and internal engine cover',
    (svg) => {
      svg.selectAll('*').remove();
      svg.attr('viewBox', '0 0 720 760');
      svg.append('title').text('Three spaces behind the seats, with different access covers');
      svg
        .append('desc')
        .text(
          'Photo-guided rear-half centre cutaway, front to the left, with a rear wheel shown beyond the section. The reclining seat and rollover bar locate the roof bay above the engine. The engine is ahead of the rear axle; the separate 130-litre rear boot is farther back. A shallow roof-compartment cover and a different rear boot lid follow the curved rear deck. The carpet, ribbed top engine cover and perimeter seal are together in the car and separated only in the detail below. A second detail shows the oil and coolant filler cup behind its small flap inside the boot. Shapes and section positions are approximate, not measured CAD or removal instructions.',
        );
      const chosen = layers.find((layer) => layer.id === state.layer) ?? layers[0];
      const selected = (id: string) => state.layer === 'all' || state.layer === id;
      const ink = '#253d32';
      const muted = '#63736a';
      const roof = '#8a7e34';
      const boot = '#357694';
      const service = '#a35d32';
      const engine = '#176b53';
      const activeRoof = selected('roof');
      const activeBoot = selected('luggage');
      const activeAccess = selected('access');
      const tone = (active: boolean, colour: string) => (active ? colour : '#a6b0a7');
      const text = (x: number, y: number, value: string, fill = ink, size = 26, anchor = 'middle') =>
        svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', anchor)
          .attr('font-size', size)
          .attr('fill', fill)
          .text(value);
      const path = (d: string, stroke: string, width = 3, fill = 'none', dash: string | null = null) =>
        svg
          .append('path')
          .attr('d', d)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', width)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('stroke-dasharray', dash);
      const circle = (cx: number, cy: number, r: number, fill: string, stroke = 'none', width = 2) =>
        svg
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', r)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', width);
      text(22, 34, '← Front', muted, 25, 'start');
      text(698, 34, 'Rear →', muted, 25, 'end');

      // The rear-quarter silhouette and wheel/deck proportions follow the ordinary 987 photographs.
      // The central cut passes between the rear wheels, so its luggage floor can overlap the far wheel.
      path(
        'M24 303H204Q219 298 231 264Q266 230 363 236L444 238Q561 233 653 266Q690 279 696 307L701 351Q704 386 686 418L679 438H604C601 361 568 313 516 313S430 356 427 438H24Z',
        '#9aaa9d',
        2.5,
        '#e5eae2',
      );
      path('M30 426H412M616 426H676M670 315L698 321M684 372L700 369', '#b1bdb0', 2);
      path('M652 280Q673 284 685 297L687 312L656 305Z', '#b4877b', 2, '#dfccc3');
      path('M603 273Q634 269 659 276', '#8d9f91', 2);
      circle(516, 403, 80, '#e0e5e1', '#8c9c91', 3);
      circle(516, 403, 65, '#f4f5f1', '#a1afa5', 2);
      circle(516, 403, 53, '#e2e7e2', '#9cab9f', 2);
      for (const angle of [0, 72, 144, 216, 288]) {
        const a = (angle * Math.PI) / 180;
        const b = ((angle + 13) * Math.PI) / 180;
        const point = (r: number, t: number) => `${516 + Math.cos(t) * r} ${403 + Math.sin(t) * r}`;
        path(`M${point(12, a)}L${point(51, a - 0.14)}L${point(51, b)}L${point(12, b)}`, '#a7b3a8', 1, '#f6f6f1');
      }
      circle(516, 403, 14, '#b5c1b7', '#899d8e', 1.5);
      circle(516, 403, 5, '#eaf0e8');
      path('M433 438C435 365 466 319 516 319S594 361 598 438', '#a6b3a7', 2);
      path('M433 483H603', '#d1d8cc', 1.5);

      // Upholstered, integrated-headrest seat; its top reclines towards the rear, not the dashboard.
      path(
        'M166 386Q174 356 185 304L201 231Q210 213 208 190Q207 177 194 177H184Q174 178 171 192L163 226Q157 254 149 286L132 366Q129 378 116 378L56 375Q41 375 39 389L39 398Q40 407 55 409L153 414Q169 411 166 397Z',
        '#59695e',
        2.5,
        '#c5bba4',
      );
      path(
        'M180 191Q194 187 198 196L191 226Q182 232 170 226M169 242Q181 244 189 238M150 293L166 298M145 318L160 323M140 345L155 349M54 385Q104 389 144 392',
        '#8c8977',
        2,
      );
      path('M52 423H165M69 414V423M148 415V423', '#6a7c6e', 4);
      // One rollover hoop in side projection and the shallow, inclined cabin rear wall.
      path('M219 269L224 183Q225 170 235 170Q245 170 247 183L250 257', '#829686', 7);
      path('M215 277L225 344L227 427', '#85998b', 6);
      path('M222 341L231 345L232 398L225 403', tone(activeAccess, service), activeAccess ? 4 : 2);
      circle(227, 352, 2.5, tone(activeAccess, service));
      circle(229, 392, 2.5, tone(activeAccess, service));
      text(88, 478, 'Seat', muted, 24);

      // Two shallow exterior closures meet at a real boundary in the curved rear deck.
      path(
        'M252 244Q326 228 431 241L429 248Q330 236 254 251Z',
        tone(activeRoof, roof),
        2.5,
        activeRoof ? '#c7c299' : '#d5dbd0',
      );
      path(
        'M444 242Q551 237 652 269L650 276Q548 247 444 249Z',
        tone(activeBoot, boot),
        2.5,
        activeBoot ? '#a9c4cf' : '#d5deda',
      );
      path('M437 242L437 253', '#f7f6f0', 4);
      text(332, 81, 'Roof-bay cover', activeRoof ? roof : muted, 27);
      path('M332 94V182L356 237', tone(activeRoof, roof), 1.8);
      text(564, 81, 'Rear boot lid', activeBoot ? boot : muted, 27);
      path('M564 94V199L579 250', tone(activeBoot, boot), 1.8);

      // Fabric and bow stack stays in a low well, above the closely fitted access layers.
      path(
        'M248 258Q324 247 429 257L424 310Q351 321 249 314L239 285Z',
        tone(activeRoof, roof),
        2,
        activeRoof ? '#e5e2c8' : '#e1e5dc',
      );
      path(
        'M254 294Q281 283 302 293L326 301Q346 304 363 292L407 284L417 294Q388 311 357 309L309 308Q280 301 254 306Z',
        tone(activeRoof, roof),
        2,
        activeRoof ? '#b7af7d' : '#c8cec0',
      );
      path('M260 293L295 300L339 300L396 289M264 307L300 312L356 312L405 299', tone(activeRoof, '#6e653d'), 2);
      path('M319 296L335 291L383 282L394 286L344 300Z', tone(activeRoof, '#838d80'), 1, '#c5d2ca');
      text(330, 280, 'Roof bay', activeRoof ? ink : muted, 25);

      // PET 807-005: carpet (1), formed top cover (5), perimeter seal (7). No exploded gap here.
      path('M244 319Q325 322 421 316', tone(activeAccess, '#697a64'), 5);
      path(
        'M243 326Q324 330 421 323L419 329Q326 335 244 332Z',
        tone(activeAccess, service),
        2,
        activeAccess ? '#cfb191' : '#d3d6c8',
      );
      path('M245 334Q326 338 419 331', tone(activeAccess, '#665f50'), 2.5);
      for (const x of [254, 294, 335, 376, 411]) circle(x, 326, 2, tone(activeAccess, service));

      // Longitudinal flat-six: intake above the crankcase/head; transaxle continues aft to the axle.
      path(
        'M245 370Q244 352 265 351L382 348Q404 348 410 371L416 409L403 432H255L241 413Z',
        tone(activeAccess, engine),
        2.5,
        activeAccess ? '#c9d9ca' : '#d5ded3',
      );
      path(
        'M263 352Q261 340 274 339L375 337Q388 338 390 350L378 360H278Z',
        tone(activeAccess, engine),
        2,
        activeAccess ? '#99b7a1' : '#c3cfc0',
      );
      for (const x of [274, 319, 364]) {
        path(`M${x - 10} 386Q${x - 18} 365 ${x - 4} 356Q${x + 6} 350 ${x + 15} 362`, tone(activeAccess, '#53836a'), 4);
        path(
          `M${x - 18} 399L${x - 14} 377Q${x} 369 ${x + 17} 380L${x + 20} 399`,
          tone(activeAccess, engine),
          2,
          activeAccess ? '#b0c8b5' : '#cbd5c7',
        );
      }
      path(
        'M249 400H405L401 420H251ZM261 407H392M263 413H388M271 427H386',
        tone(activeAccess, engine),
        2,
        activeAccess ? '#a5c0ac' : '#c5d2c2',
      );
      path('M415 386L438 390L453 399H504L534 413L555 417L551 436H451L438 429H411Z', '#9daa9c', 2, '#d3dcd1');
      path('M438 397V426M451 403V430M466 406V432M480 408V433M496 410V433M510 413V434', '#afbcad', 2);
      path('M514 407V473', '#8e9e91', 1.5, 'none', '4 5');
      text(326, 461, 'Engine', activeAccess ? engine : muted, 26);
      text(326, 489, 'ahead of rear axle', muted, 23);
      text(518, 510, 'Rear axle', muted, 24);

      // The rear boot has a carpeted, shaped floor; it is a distinct volume aft of the roof well.
      path(
        'M448 257Q550 253 647 283L651 321Q649 347 629 352L493 355Q470 351 464 330Z',
        tone(activeBoot || activeAccess, boot),
        2.5,
        activeBoot ? '#dae8ed' : '#e1e8e3',
      );
      path(
        'M458 265Q551 262 639 289L641 320Q639 337 623 342L494 346Q479 342 475 327',
        tone(activeBoot, '#84a7b4'),
        1.5,
      );
      path('M491 346L622 342M493 350L625 346', tone(activeBoot, '#80a1aa'), 1.5);
      text(556, 308, 'Rear boot', activeBoot ? ink : muted, 25);
      text(556, 338, '130 L', activeBoot ? boot : muted, 25);
      // Right-front filler hatch is projected into this centre cut; the inset gives its face view.
      path('M457 269L488 272L490 294L462 294Z', tone(activeAccess, service), 2, activeAccess ? '#d5b99d' : '#d3d8cb');
      path('M469 285L480 286', tone(activeAccess, '#785e42'), 2);
      path('M488 282L688 300V541', tone(activeAccess, service), 1.5, 'none', '4 5');

      path('M22 535H698', '#d1d8cc', 1.5);
      text(22, 569, 'Internal access · detail', activeAccess ? service : muted, 26, 'start');
      text(445, 569, 'Boot service flap', activeAccess ? service : muted, 26, 'start');

      // Detail only: the engine cover is a rounded, formed panel, not a flat rectangular shelf.
      const cover =
        'M33 605Q36 592 52 590L122 582Q138 580 154 586L211 610Q222 615 218 628L199 640Q188 643 172 637L47 618Q32 616 33 605Z';
      path(cover, tone(activeAccess, '#6f7d69'), 2, activeAccess ? '#c4cbb8' : '#d7ddce');
      path(
        'M53 600L177 620M65 591L193 631M90 588L207 620M53 611L152 591M84 623L178 602',
        tone(activeAccess, '#8d9982'),
        1,
      );
      for (const [x, y] of [
        [48, 604],
        [127, 590],
        [205, 619],
        [183, 635],
      ])
        circle(x, y, 3, '#f7f6f0', tone(activeAccess, '#6f7d69'), 1.5);
      path(
        'M33 649Q36 636 52 634L122 626Q138 624 154 630L211 654Q222 659 218 672L199 684Q188 687 172 681L47 662Q32 660 33 649Z',
        tone(activeAccess, service),
        2,
        activeAccess ? '#dfcab1' : '#dadccc',
      );
      path(
        'M49 647L126 638L203 663L186 674L57 654ZM69 644L179 670M100 640L151 665M68 656L139 641M119 664L176 654',
        tone(activeAccess, '#b38c62'),
        1.5,
      );
      for (const [x, y] of [
        [47, 647],
        [128, 634],
        [207, 664],
        [184, 678],
      ])
        circle(x, y, 3, '#f7f6f0', tone(activeAccess, service), 1.5);
      path(
        'M35 695Q38 682 55 681L124 674Q138 673 153 678L212 701Q222 706 217 716L198 727Q188 731 173 726L49 706Q34 704 35 695Z',
        tone(activeAccess, '#665f50'),
        4,
      );
      text(247, 615, 'Carpet', activeAccess ? ink : muted, 25, 'start');
      text(247, 660, 'Top cover', activeAccess ? service : muted, 25, 'start');
      text(247, 705, 'Seal', activeAccess ? ink : muted, 25, 'start');
      path('M215 616H236M216 660H236M216 704H236', tone(activeAccess, service), 1.5);

      // PET 807-001 and the handbook show a recessed filler cup and a bottom-hinged flap.
      path(
        'M453 600Q454 590 466 589L645 593Q658 593 660 607L664 683L447 683Z',
        tone(activeAccess, '#6b786c'),
        3,
        activeAccess ? '#d3ddd0' : '#dce2d6',
      );
      path(
        'M466 610Q468 603 478 604L633 606Q643 607 644 617L646 667H462Z',
        tone(activeAccess, '#6b786c'),
        2,
        activeAccess ? '#a9b9aa' : '#c8d2c3',
      );
      circle(505, 638, 23, activeAccess ? '#475c50' : '#8b9c8c', tone(activeAccess, '#304a3b'), 2);
      path(
        'M588 616L608 616L620 628L621 647L608 659L590 659L577 647L577 628Z',
        tone(activeAccess, boot),
        2,
        activeAccess ? '#69a0b7' : '#a9bfc0',
      );
      path('M591 622L606 622L614 631V644L605 652H592L584 643V631Z', tone(activeAccess, '#a7c8ce'), 1.5);
      path(
        'M484 627L490 621M480 641L485 648M500 660H508M523 644L528 637M520 621L514 617',
        tone(activeAccess, '#304a3b'),
        3,
      );
      path(
        'M494 635H510L514 640H504L501 647H496L493 640H489M498 630V635M589 638Q594 632 599 638T609 638M589 645Q594 639 599 645T609 645',
        '#edf2e6',
        2,
      );
      path('M447 683L664 683L645 707L462 705Z', tone(activeAccess, '#6b786c'), 2, activeAccess ? '#c4cdbd' : '#d7dece');
      path('M469 680V689M640 680V689M533 696H572', tone(activeAccess, '#5c6d5b'), 3);
      text(557, 739, 'Oil + coolant fillers', activeAccess ? service : muted, 24);
      text(22, 750, 'Layers separated only in detail', muted, 21, 'start');
      explanation.textContent = chosen.text;
      row
        ?.querySelectorAll('button')
        .forEach((button, i) => button.setAttribute('aria-pressed', String(layers[i].id === state.layer)));
      host.dataset.bodyLayer = state.layer;
    },
    signal,
  );
  row = buttons(
    controls,
    layers.map((layer) => ({
      label: layer.label,
      action: () => {
        state.layer = layer.id;
        redraw();
      },
    })),
    signal,
  );
  redraw();
  return () => {};
}
