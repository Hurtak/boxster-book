import { panel, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const relationships = [
  { button: 'PDK + Chrono', first: ['PDK', '7-speed · 250'], join: 'AND', second: ['Sport Chrono', '639 or Plus 640'], outcome: 'BOTH ENABLE ↓', resultLabel: 'FUNCTIONS', result: ['Launch Control', 'SPORT PLUS shift strategy'], explanation: 'These functions need both PDK and Sport Chrono (639 or Plus 640); either option alone is insufficient. Basic Sport Chrono does not require PCM. Plus 640 does, as shown in the next relationship. This pairing does not establish PASM.' },
  { button: 'Chrono Plus + PCM', first: ['Sport Chrono Plus', 'Option 640'], join: 'REQUIRES ↓', second: ['PCM with navigation', 'P23'], resultLabel: 'ADDED WITH PLUS', result: ['Lap-time display', 'Personal memory in PCM'], explanation: 'Sport Chrono Plus 640 is offered only with PCM. Plus adds a lap-time performance display and a personal memory function in PCM to the basic Chrono package. PCM alone does not prove Plus is fitted, and this dependency establishes neither PDK nor PASM.' },
  { button: 'Differential + wheels', first: ['Locking rear differential', 'Option 220'], join: 'REQUIRES ↓', second: ['18- or 19-inch', 'wheel option'], resultLabel: 'EVIDENCE LIMIT', result: ['Larger wheels alone', 'do not establish option 220'], caution: true, explanation: 'The January 2010 UK catalogue requires 18- or 19-inch wheels for differential 220. The 08/08 launch edition planned availability from May 2009 at the earliest with manual transmission. January 2010 omits both qualifiers; that omission does not prove PDK compatibility or eligibility for every build date. Check the individual factory record and the applicable dated specification.' },
];

export function mount(host, { state, signal }) {
  state.relationship ??= 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'Read the relationship, then check the car',
    description: 'Choose a relationship. “AND” combines two options to enable a function; “requires” points from an option to its catalogue prerequisite.',
    note: 'Selected relationships for the Boxster 2.9: January 2010 UK brochure, pp. 54, 56–57 and 107; launch-edition comparison, 08/08, p. 107. This is a reading aid, not a complete configurator or an individual build record.',
  });
  stage.style.height = '350px';
  explanation.setAttribute('aria-live', 'polite');
  let row;
  const redraw = svgDiagram(stage, 'Selected factory option relationships for the 2010 Boxster 2.9', (svg, { width }) => {
    svg.selectAll('*').remove();
    const relationship = relationships[state.relationship];
    svg.attr('aria-label', `${relationship.button}: ${relationship.explanation}`);
    svg.append('title').text(relationship.button);
    svg.append('desc').text(relationship.explanation);
    const cardWidth = Math.min(560, width - 20), margin = (width - cardWidth) / 2;
    const text = (x, y, value, size = 20, colour = '#233e32') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('font-size', size).attr('fill', colour).text(value);
    [relationship.first, relationship.second].forEach((lines, index) => {
      const y = 2 + index * 116;
      svg.append('rect').attr('x', margin).attr('y', y).attr('width', cardWidth).attr('height', 76).attr('fill', '#e1e8df');
      text(width / 2, y + 30, lines[0], 22);
      text(width / 2, y + 59, lines[1]);
    });
    text(width / 2, 104, relationship.join, 18);
    if (relationship.outcome) text(width / 2, 224, relationship.outcome, 18);
    const resultColour = relationship.caution ? '#233e32' : '#fff';
    svg.append('rect').attr('x', margin).attr('y', 242).attr('width', cardWidth).attr('height', 102).attr('fill', relationship.caution ? '#e1e8df' : '#176b53');
    text(width / 2, 264, relationship.resultLabel, 14, resultColour);
    text(width / 2, 294, relationship.result[0], 22, resultColour);
    text(width / 2, 325, relationship.result[1], 20, resultColour);
    explanation.textContent = relationship.explanation;
    row?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === state.relationship)));
    host.dataset.specificationRelationship = String(state.relationship);
  }, signal);
  row = buttons(controls, relationships.map((relationship, index) => ({ label: relationship.button, action: () => { state.relationship = index; redraw(); } })), signal);
  redraw();
  return () => {};
}
