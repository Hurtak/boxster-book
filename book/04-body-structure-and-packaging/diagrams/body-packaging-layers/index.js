import { panel, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const layers = [
  { id: 'all', label: 'All spaces', text: 'Behind the seats, the folding roof has its own bay above the engine region. The rear boot is farther back. The roof-bay cover and rear luggage lid are separate exterior panels; the removable engine cover is an internal service layer.' },
  { id: 'luggage', label: 'Rear boot', text: 'The rear boot has its own luggage lid. Porsche quotes 130 litres even with the ordinary powered roof lowered: the folded roof uses its dedicated bay. A small flap inside the boot exposes oil and coolant fillers, rather than the complete engine.' },
  { id: 'roof', label: 'Roof bay', text: 'The folded roof occupies the bay immediately behind the occupants, above the engine region. Its exterior compartment cover moves to provide clearance during roof operation. This is a different panel from the rear luggage lid.' },
  { id: 'access', label: 'Service layers', text: 'Carpet trim lies above the removable top engine cover and its perimeter seal (PET 807-005, items 1, 5 and 7). A separate cover behind the cabin rear-wall trim provides another access boundary. The rear boot has a different small flap for the oil and coolant fillers. These are component relationships, not removal steps.' },
];

export function mount(host, { state, signal }) {
  if (!layers.some(layer => layer.id === state.layer)) state.layer = 'all';
  const { stage, controls, explanation } = panel(host, {
    title: 'Separate the rear body layers',
    description: 'Use the seat and body outline to locate three spaces and their different covers. Choose a layer to highlight its boundaries.',
    note: 'Ordinary powered-roof Boxster 2.9. Rear-half side cutaway; front is left. Gaps are expanded and filler positions generalised. Not to scale or a service procedure.',
  });
  // A taller local stage keeps the same legible cutaway at phone and desktop widths.
  stage.style.height = 'auto';
  stage.style.aspectRatio = '600 / 620';
  stage.style.maxHeight = '620px';
  let row;
  const redraw = svgDiagram(stage, 'Rear-body cutaway: separate roof cover, boot lid and internal engine cover', (svg) => {
    svg.selectAll('*').remove();
    svg.attr('viewBox', '0 0 600 620');
    svg.append('title').text('Three spaces behind the seats, with different access covers');
    svg.append('desc').text('Illustrative rear-half side cutaway, front to the left. A seat and rear cabin boundary locate the roof bay above the engine. The rear boot is farther back and holds 130 litres with the roof lowered. The roof-bay outer cover and rear boot lid are separate; carpet trim, a removable engine cover and its perimeter seal are internal layers. A flap within the boot gives access to oil and coolant fillers. Expanded gaps and generic shapes do not represent measured geometry or a removal sequence.');
    const chosen = layers.find(layer => layer.id === state.layer);
    const selected = id => state.layer === 'all' || state.layer === id;
    const ink = '#253d32', muted = '#63736a';
    const roof = '#8a7e34', boot = '#357694', service = '#a35d32', engine = '#176b53';
    const activeRoof = selected('roof');
    const activeBoot = selected('luggage');
    const activeAccess = selected('access');
    const text = (x, y, value, fill = ink, size = 27, anchor = 'middle') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', fill).text(value);
    const path = (d, stroke, width = 3, fill = 'none', dash = null) => svg.append('path').attr('d', d).attr('fill', fill).attr('stroke', stroke).attr('stroke-width', width).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round').attr('stroke-dasharray', dash);
    const tone = (active, colour) => active ? colour : '#a6b0a7';
    text(24, 31, '← Front', muted, 25, 'start');
    text(576, 31, 'Rear →', muted, 25, 'end');

    // One continuous body context, with a cabin boundary and rear wheel.
    path('M24 344V438H379C383 401 402 380 442 380S502 403 506 438H565Q585 438 585 414V241Q582 212 565 200L377 174H158', '#a1afa3', 3, '#e8ece5');
    svg.append('circle').attr('cx', 443).attr('cy', 439).attr('r', 48).attr('fill', '#f1f3f2').attr('stroke', '#a1afa3').attr('stroke-width', 4);
    svg.append('circle').attr('cx', 443).attr('cy', 439).attr('r', 24).attr('fill', 'none').attr('stroke', '#b7c1b8').attr('stroke-width', 3);
    path('M145 178V438', '#7c9182', 7);
    path('M67 222Q68 207 83 208L99 213L110 357H47', ink, 13);
    path('M50 369H119', ink, 11);
    text(77, 411, 'Seat');

    // The exterior panels close two different openings in the same rear deck.
    path('M173 174Q267 155 367 174', tone(activeRoof, roof), activeRoof ? 9 : 5);
    text(267, 69, 'Roof-bay', activeRoof ? roof : muted);
    text(267, 107, 'outer cover', activeRoof ? roof : muted);
    path('M267 118V161', tone(activeRoof, roof), 2.5);
    path('M399 188Q482 181 567 200', tone(activeBoot, boot), activeBoot ? 9 : 5);
    text(485, 69, 'Rear boot', activeBoot ? boot : muted);
    text(485, 107, 'lid', activeBoot ? boot : muted);
    path('M485 118V184', tone(activeBoot, boot), 2.5);

    // Folded fabric/frame is a symbol, not a roof-folding mechanism drawing.
    path('M174 191H368V253Q366 271 344 271H195Q174 271 174 253Z', tone(activeRoof, roof), activeRoof ? 3.5 : 2, activeRoof ? '#e4e2c9' : '#e1e5dc');
    text(270, 225, 'Roof bay', activeRoof ? ink : muted);
    path('M194 251L211 241L235 252L260 240L285 252L309 241L342 251', tone(activeRoof, roof), 5);

    // Expanded vertical separation makes the trim and engine-cover boundary visible.
    path('M178 285H366', tone(activeAccess, '#6f7d69'), 5);
    path('M185 281L195 289M208 281L218 289M231 281L241 289M254 281L264 289M277 281L287 289M300 281L310 289M323 281L333 289M346 281L356 289', tone(activeAccess, '#6f7d69'), 1.5);
    text(272, 308, 'Trim above', activeAccess ? ink : muted, 26);
    text(272, 347, 'Cover + seal', activeAccess ? service : muted, 26);
    path('M174 358H369', tone(activeAccess, service), activeAccess ? 7 : 4, 'none', '10 7');
    path('M177 365H366', tone(activeAccess, '#716958'), activeAccess ? 3 : 2);
    path('M185 380L207 368H337L360 380V423H185Z', tone(activeAccess, engine), activeAccess ? 3.5 : 2, activeAccess ? '#d3e1d3' : '#dde5db');
    path('M194 380H226M319 380H352', tone(activeAccess, engine), 5);
    text(272, 409, 'Engine', activeAccess ? ink : muted);

    // Rear luggage is outside the roof stowage volume. Fillers stay inside its flap.
    path('M399 213L566 224V327Q563 342 546 342H420Q399 342 399 324Z', tone(activeBoot || activeAccess, boot), activeBoot || activeAccess ? 3.5 : 2, activeBoot ? '#d9e5eb' : '#e0e7e5');
    text(488, 283, 'Rear boot', activeBoot ? ink : muted);
    text(488, 324, '130 L', activeBoot ? boot : muted);
    path('M408 232H445V259H408Z', tone(activeAccess, service), activeAccess ? 3 : 2, activeAccess ? '#efe0d2' : '#e5e5dc');
    for (const x of [419, 434]) svg.append('circle').attr('cx', x).attr('cy', 245).attr('r', 4).attr('fill', tone(activeAccess, service));
    path('M447 245H578V505H492', '#87988c', 1.8, 'none', '4 5');
    text(448, 536, 'Boot service flap', activeAccess ? service : muted, 26);
    text(448, 575, 'oil + coolant', activeAccess ? service : muted, 26);
    text(24, 606, 'Cutaway · gaps expanded', muted, 23, 'start');
    explanation.textContent = chosen.text;
    row?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(layers[i].id === state.layer)));
    host.dataset.bodyLayer = state.layer;
  }, signal);
  row = buttons(controls, layers.map(layer => ({ label: layer.label, action: () => { state.layer = layer.id; redraw(); } })), signal);
  redraw();
  return () => {};
}
