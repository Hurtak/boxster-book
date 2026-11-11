import { scalePoint } from 'd3';
import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, SvgSelection, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel, slider } from '../../../../interactive/ui.ts';

const years = [2008, 2009, 2010, 2011, 2012];
const evidence = {
  2008: {
    calendar: [
      ['19 November', 'Revised range announced'],
      ['Next: February 2009', 'Customer availability'],
    ],
    labels: [
      ['08/08 · publication', 'UK launch brochure'],
      ['Not an arrival date', 'The revision reaches 2009'],
    ],
    explanation:
      'Porsche announced the revised Boxster range on 19 November 2008. The launch brochure is marked 08/08, but that publication date does not make the revised car a 2008 model. A contemporary Porsche SE report confirms availability since February 2009.',
  },
  2009: {
    calendar: [
      ['February · Porsche SE', 'Range reported available'],
      ['6 November · Netherlands', 'Spyder announced'],
    ],
    labels: [
      ['2009 · launch range', '2.9, S and optional PDK'],
      ['08/08 · early catalogue', 'Some option dates qualified'],
    ],
    explanation:
      'Porsche SE’s April 2009 report states that the revised ordinary range has been available since February. This does not date an individual delivery. The early UK catalogue gives April for sports exhaust and May for the manual locking differential as earliest planned availability, rather than verified delivery dates. The Dutch Spyder announcement follows in November.',
  },
  2010: {
    calendar: [
      ['January', 'UK reference brochure'],
      ['February · Netherlands', 'Planned Spyder introduction'],
    ],
    labels: [
      ['01/10 · publication', 'UK ordinary / Spyder books'],
      ['2011 · later heading', 'Porsche Classic: Spyder'],
    ],
    explanation:
      'The January 2010 UK ordinary-model brochure documents the book’s reference 2.9. Porsche’s November 2009 Dutch Spyder release plans February 2010 market introduction; it is not a record of first delivery. The later Porsche Classic “2011” heading is a different label and does not change that planned calendar date. Neither publication date establishes a European numerical model year.',
  },
  2011: {
    calendar: [
      ['2 February', 'Black Edition announced'],
      ['March · Netherlands', 'Announced availability'],
    ],
    labels: [
      ['03/2011 · UK list', 'Model year starts 1 March'],
      ['2012 · US model label', 'PCNA Black Edition release'],
    ],
    explanation:
      'Porsche’s Dutch release announced the Black Edition on 2 February 2011 for planned availability from March in that market. The UK price list says its model year begins on 1 March 2011 without supplying a numerical year there. PCNA expressly calls the car a 2012 model. These statements can coexist.',
  },
  2012: {
    calendar: [
      ['12 January · Netherlands', 'New 981 announced'],
      ['14 April · Netherlands', 'Announced 981 dealer date'],
    ],
    labels: [
      ['2012 · US model year', '987 · outgoing specification'],
      ['January 2012 · release', '981 · new generation'],
    ],
    explanation:
      'The US technical sheet headed “2012 Porsche Boxster” describes the outgoing 987 range. Porsche’s Dutch release of 12 January 2012 describes the new 981 and plans a dealer introduction on 14 April in that market. This is a prospective date, not a record of first customer delivery. A brochure date or first registration in 2012 cannot establish the generation by itself.',
  },
};

function wrap(svg: SvgSelection, content: string, x: number, y: number, maxCharacters: number, fontSize = 20) {
  const words = content.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && `${line} ${word}`.length > maxCharacters) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  const text = svg.append('text').attr('x', x).attr('y', y).attr('font-size', fontSize).attr('fill', '#233e33');
  lines.forEach((value, index) =>
    text
      .append('tspan')
      .attr('x', x)
      .attr('dy', index ? 24 : 0)
      .text(value),
  );
  return text;
}

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { year: 2010, mode: 'calendar' });
  if (!years.includes(state.year)) state.year = 2010;
  if (!['calendar', 'labels'].includes(state.mode)) state.mode = 'calendar';
  const { stage, controls, explanation } = panel(host, {
    title: 'A year is not a specification',
    description:
      'Choose a calendar year. Compare the dated events with the labels used by contemporary documents and later summaries.',
    note: 'European chronology, with US model-year labels identified separately. An earliest planned option date is not proof of the first delivered car. No complete annual UK equipment history is implied.',
  });
  stage.style.height = '380px';
  let modeButtons: HTMLDivElement;
  const redraw = svgDiagram(
    stage,
    'Boxster calendar events and evidence labels from 2008 to 2012',
    (svg, { width }) => {
      svg.selectAll('*').remove();
      const selectedTitle = `${state.year} · ${state.mode === 'calendar' ? 'Calendar events' : 'Evidence labels'}`;
      svg.attr('aria-label', selectedTitle);
      svg.append('title').text(selectedTitle);
      svg.append('desc').text(evidence[state.year as 2008 | 2009 | 2010 | 2011 | 2012].explanation);
      const point = scalePoint<number>()
        .domain(years)
        .range([28, width - 28]);
      svg
        .append('text')
        .attr('x', 8)
        .attr('y', 30)
        .attr('font-size', 23)
        .attr('font-weight', 700)
        .attr('fill', '#233e33')
        .text(selectedTitle);
      svg
        .append('line')
        .attr('x1', point(2008)!)
        .attr('x2', point(2012)!)
        .attr('y1', 77)
        .attr('y2', 77)
        .attr('stroke', '#9ba99f')
        .attr('stroke-width', 3);
      svg
        .selectAll('circle')
        .data(years)
        .join('circle')
        .attr('cx', (d) => point(d)!)
        .attr('cy', 77)
        .attr('r', (d) => (d === state.year ? 10 : 5))
        .attr('fill', (d) => (d === state.year ? '#233e33' : '#637e6d'));
      svg
        .selectAll('.year')
        .data(years)
        .join('text')
        .attr('class', 'year')
        .attr('x', (d) => point(d)!)
        .attr('y', 109)
        .attr('text-anchor', 'middle')
        .attr('font-size', 20)
        .attr('font-weight', (d) => (d === state.year ? 700 : 400))
        .attr('fill', '#233e33')
        .text(String);
      evidence[state.year as 2008 | 2009 | 2010 | 2011 | 2012][state.mode as 'calendar' | 'labels'].forEach(
        ([date, title], index) => {
          const y = 139 + index * 117;
          svg
            .append('rect')
            .attr('x', 4)
            .attr('y', y)
            .attr('width', width - 8)
            .attr('height', 104)
            .attr('fill', state.mode === 'calendar' ? '#e1e8df' : '#ede0d0');
          const maxCharacters = Math.max(20, Math.floor((width - 38) / 10.5));
          const dateLabel = wrap(svg, date, 18, y + 28, maxCharacters).attr('font-weight', 700);
          const titleY = y + 40 + dateLabel.selectAll('tspan').size() * 24;
          wrap(svg, title, 18, titleY, maxCharacters);
        },
      );
      explanation.textContent = evidence[state.year as 2008 | 2009 | 2010 | 2011 | 2012].explanation;
      modeButtons
        ?.querySelectorAll('button')
        .forEach((button, index) =>
          button.setAttribute('aria-pressed', String(state.mode === (index === 0 ? 'calendar' : 'labels'))),
        );
      Object.assign(host.dataset, { selectedYear: state.year, evidenceView: state.mode });
    },
    signal,
  );
  slider(controls, {
    label: 'Calendar year',
    min: 2008,
    max: 2012,
    step: 1,
    value: state.year,
    signal,
    onChange: (value) => {
      state.year = value;
      redraw();
    },
  });
  modeButtons = buttons(
    controls,
    [
      {
        label: 'Calendar events',
        action: () => {
          state.mode = 'calendar';
          redraw();
        },
      },
      {
        label: 'Evidence labels',
        action: () => {
          state.mode = 'labels';
          redraw();
        },
      },
    ],
    signal,
  );
  redraw();
  return () => {};
}
