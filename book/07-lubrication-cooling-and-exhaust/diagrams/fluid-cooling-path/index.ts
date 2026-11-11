import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel } from '../../../../interactive/ui.ts';

const conditions = [
  {
    label: 'Warming up',
    radiator: false,
    fan: false,
    airflow: 'Airflow depends on conditions',
    text: 'The belt-driven pump circulates coolant through the engine and short bypass while the thermostat restricts the long radiator circuit. The orange return in this example has not passed through a radiator; it is not a cooled supply. Fans are not requested in this example.',
  },
  {
    label: 'Warm driving',
    radiator: true,
    fan: false,
    airflow: 'Road motion supplies airflow',
    text: 'As the thermostat opens progressively, more coolant can pass through the front radiators. Heat crosses from coolant to air, and the cooler return reaches the pump through the thermostat. This example uses road airflow without fan assistance; driving does not guarantee that fans remain off.',
  },
  {
    label: 'Warm in traffic',
    radiator: true,
    fan: true,
    airflow: 'Electric fans draw air through',
    text: 'The liquid circuit is the same as in the warm-driving example. Electric fans now assist airflow through the front radiator pair. The thermostat regulates coolant routing; the fans move air. Low road speed alone does not specify the actual thermostat position or fan demand.',
  },
];

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { condition: 0 });
  state.condition =
    Number.isInteger(state.condition) && state.condition >= 0 && state.condition < conditions.length
      ? state.condition
      : 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'Where does the coolant go?',
    description: 'Select an example to compare liquid circulation with airflow through the radiators.',
    note: 'Functional schematic, not pipe geometry or a temperature simulation. Solid arrows show coolant; dashed green arrows show air. Grey routes are de-emphasised, not measured flow splits. The tank is a side connection, with its plumbing simplified. Heater and oil-cooler branches are omitted; thermostat opening is progressive.',
  });
  stage.style.height = '664px';
  stage.style.maxWidth = '430px';
  stage.style.marginInline = 'auto';
  let row: HTMLDivElement;
  const redraw = svgDiagram(
    stage,
    'Coolant loop and separate airflow through the front radiators',
    (svg, { width }) => {
      svg.selectAll('*').remove();
      const cx = width / 2;
      const left = 16;
      const right = width - 16;
      const selected = conditions[state.condition];
      const warm = '#b35e37';
      const cool = '#26708a';
      const air = '#52715a';
      const muted = '#aab1aa';
      const returning = selected.radiator ? cool : warm;
      svg.append('title').text(`Coolant circuit: ${selected.label.toLowerCase()}`);
      svg
        .append('desc')
        .text(
          `${selected.text} The expansion tank accommodates changing coolant volume and provides the rear filling and level-checking point; it is not in series with the main loop. The two front radiators are grouped as one functional block.`,
        );
      const defs = svg.append('defs');
      for (const [name, colour] of [
        ['warm', warm],
        ['cool', cool],
      ] as const) {
        defs
          .append('marker')
          .attr('id', `fluid-cooling-${name}`)
          .attr('markerWidth', 6)
          .attr('markerHeight', 6)
          .attr('refX', 5)
          .attr('refY', 3)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0 0L6 3L0 6Z')
          .attr('fill', colour);
      }
      defs
        .append('marker')
        .attr('id', 'fluid-cooling-air')
        .attr('markerWidth', 7)
        .attr('markerHeight', 7)
        .attr('refX', 5)
        .attr('refY', 3.5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M1 1L5 3.5L1 6')
        .attr('fill', 'none')
        .attr('stroke', air)
        .attr('stroke-width', 1.5);
      const line = (d: string, colour: string, marker: string | null = null, dashed = false, strokeWidth = 4) =>
        svg
          .append('path')
          .attr('d', d)
          .attr('fill', 'none')
          .attr('stroke', colour)
          .attr('stroke-width', strokeWidth)
          .attr('stroke-dasharray', dashed ? '6 5' : null)
          .attr('marker-end', marker ? `url(#fluid-cooling-${marker})` : null);
      const text = (x: number, y: number, value: string | number, size = 18, weight = 400) =>
        svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('font-size', size)
          .attr('font-weight', weight)
          .attr('text-anchor', 'middle')
          .attr('fill', '#24342c')
          .text(value);
      const box = (x: number, y: number, w: number, h: number, fill: string, stroke: string) =>
        svg
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', w)
          .attr('height', h)
          .attr('rx', 8)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2);
      svg.append('rect').attr('width', width).attr('height', 664).attr('fill', '#f7f7f2');
      text(cx, 23, 'FRONT OF CAR', 16, 600);

      // The pair is grouped into a functional block, not drawn as radiators in series.
      line(`M${cx - 88} 515H${left}V270`, warm);
      line(`M${left} 270V105H${cx - 88}`, selected.radiator ? warm : muted, null, !selected.radiator);
      line(
        `M${cx + 88} 105H${right}V325H${cx + 88}`,
        selected.radiator ? cool : muted,
        selected.radiator ? 'cool' : null,
        !selected.radiator,
      );
      if (selected.radiator) line(`M${left} 219V183`, warm, 'warm');
      box(cx - 88, 70, 176, 68, selected.radiator ? '#d5e8ef' : '#edf0e9', selected.radiator ? cool : muted);
      text(cx, 96, 'Front radiator', 20, 600);
      text(cx, 126, 'pair', 20);

      // Open arrowheads and dashes distinguish air from the closed liquid circuit.
      for (const offset of [-48, 0, 48]) {
        line(`M${cx + offset} 36V60`, air, 'air', true, 2.5);
        line(`M${cx + offset} 148V176`, air, 'air', true, 2.5);
      }
      text(cx, 199, selected.airflow, 17, 600);
      text(cx, 222, selected.fan ? 'Fans: assisting in this example' : 'Fans: not requested in this example', 16);

      line(
        `M${left} 270H${cx}V294`,
        selected.radiator ? muted : warm,
        selected.radiator ? null : 'warm',
        selected.radiator,
      );
      text(cx, 254, 'Short bypass', 18, 600);
      box(cx - 88, 294, 176, 62, selected.radiator ? '#d5e8ef' : '#f2ddb9', '#526455');
      text(cx, 320, 'Thermostat', 20, 600);
      text(cx, 343, selected.radiator ? 'Radiator route open' : 'Radiator restricted', 16);
      line(`M${cx} 356V387`, returning, selected.radiator ? 'cool' : 'warm');

      // Neutral, unarrowed tank connection: it is not a compulsory series route.
      line(`M${cx} 363H${cx + 112}V606H${cx + 90}`, '#7c897c', null, false, 2);
      svg.append('circle').attr('cx', cx).attr('cy', 363).attr('r', 3).attr('fill', '#7c897c');
      box(cx - 88, 392, 176, 56, '#e0ebdf', '#236148');
      text(cx, 414, 'Coolant pump', 20, 600);
      text(cx, 441, 'Belt driven', 17);
      line(`M${cx} 448V478`, returning, selected.radiator ? 'cool' : 'warm');
      box(cx - 88, 484, 176, 62, '#e0ebdf', '#236148');
      text(cx, 508, 'Engine jackets', 20, 600);
      text(cx, 535, 'Heat enters coolant', 17);
      // Arrow on the shared outlet also remains visible when the radiator is restricted.
      line(`M${cx - 92} 515H${left + 10}`, warm, 'warm');
      box(cx - 90, 572, 180, 66, '#eef1ea', '#7c897c');
      text(cx, 598, 'Expansion tank', 20, 600);
      text(cx, 622, 'Expansion + fill / level', 16);
      text(cx, 658, 'REAR / ENGINE AREA', 16, 600);

      explanation.textContent = selected.text;
      host.dataset.coolingCondition = String(state.condition);
      if (row)
        [...row.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === state.condition)));
    },
    signal,
  );
  row = buttons(
    controls,
    conditions.map(({ label }, i) => ({
      label,
      action: () => {
        state.condition = i;
        redraw();
      },
    })),
    signal,
  );
  redraw();
  return () => {};
}
