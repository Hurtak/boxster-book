import { panel, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const relationships = [
  { button: 'PDK + Chrono', first: ['PDK', '7-speed · 250'], second: ['Sport Chrono', '639 or Plus 640'], result: ['Launch Control', '+ SPORT PLUS shifts'], explanation: 'Sport Chrono adds Launch Control and the SPORT PLUS shift strategy when combined with PDK. PCM is a separate choice; it is not required for basic Sport Chrono.' },
  { button: 'Chrono Plus + PCM', first: ['PCM', 'Navigation · P23'], second: ['Sport Chrono Plus', '640'], result: ['PCM integration', '+ personalisation'], explanation: 'Sport Chrono Plus 640 is offered only with PCM. This dependency does not itself establish that the car has PDK or PASM.' },
  { button: 'Differential + wheels', first: ['18- or 19-inch', 'wheel option'], second: ['Locking differential', '220'], result: ['Catalogue pairing', 'Larger wheels required'], explanation: 'The January 2010 UK catalogue offers differential 220 only with 18- or 19-inch wheels. Its entry does not repeat the earlier launch brochure’s manual-only restriction. Larger wheels alone do not prove the differential is fitted.' },
];

export function mount(host, { state, signal }) {
  state.relationship ??= 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'Read the relationship, then check the car',
    description: 'Choose a pairing to see which other equipment supplies a function or satisfies a catalogue condition.',
    note: 'Selected relationships from the January 2010 UK brochure, pp. 56–57 and 107. This is a reading aid, not a complete factory configurator or an individual build record.',
  });
  let row;
  const redraw = svgDiagram(stage, 'Selected factory option relationships for the 2010 Boxster 2.9', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const relationship = relationships[state.relationship];
    const margin = 10, cardWidth = width - margin * 2;
    const text = (x, y, value, size = 20, colour = '#233e32') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('font-size', size).attr('fill', colour).text(value);
    [relationship.first, relationship.second, relationship.result].forEach((lines, index) => {
      const y = 2 + index * 103;
      const result = index === 2;
      svg.append('rect').attr('x', margin).attr('y', y).attr('width', cardWidth).attr('height', 77).attr('fill', result ? '#176b53' : '#e1e8df');
      text(width / 2, y + 30, lines[0], width < 330 ? 20 : 23, result ? '#fff' : '#233e32');
      text(width / 2, y + 59, lines[1], 20, result ? '#fff' : '#233e32');
      if (index < 2) text(width / 2, y + 98, index === 0 ? '+' : '↓', 25);
    });
    explanation.textContent = relationship.explanation;
    row?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === state.relationship)));
    host.dataset.specificationRelationship = String(state.relationship);
  }, signal);
  row = buttons(controls, relationships.map((relationship, index) => ({ label: relationship.button, action: () => { state.relationship = index; redraw(); } })), signal);
  redraw();
  return () => {};
}
