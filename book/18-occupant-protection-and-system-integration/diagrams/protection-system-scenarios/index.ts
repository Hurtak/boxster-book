import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { panel } from '../../../../interactive/ui.ts';

interface Situation {
  name: string;
  observed: string[];
  decision: string[];
  manual: string[];
  pdk: string[];
  text: string;
  systems: string;
  pdkObserved?: string[];
  pdkDecision?: string[];
  transmission?: Record<string, string>;
}
const situations: Record<string, Situation> = {
  acceleration: {
    name: 'Accelerating',
    observed: ['Pedal-position signal', 'Engine speed + load inputs'],
    decision: ['DME engine controller', 'Sets torque within limits'],
    manual: ['Throttle, injectors, ignition', 'change combustion torque'],
    pdk: ['Throttle, injectors, ignition', 'change combustion torque'],
    text: 'Pedal position expresses the driver’s demand; DME combines it with engine inputs and operating limits to control engine torque. DME controls the engine actuators; the transmission carries the resulting torque.',
    transmission: {
      manual: 'In the manual car, the driver chooses the gear and controls clutch engagement to carry drive.',
      pdk: 'With optional PDK, transmission control manages its clutches and selected gear to carry drive.',
    },
    systems: 'dme',
  },
  shift: {
    name: 'Changing gear',
    observed: ['Driver’s next-gear intent', 'Road + engine speed cues'],
    pdkObserved: ['Driver request or auto logic', 'Speed + current gear state'],
    decision: ['Driver', 'Chooses clutch + lever motion'],
    pdkDecision: ['PDK control ↔ DME', 'Coordinates clutch handover'],
    manual: ['Clutch releases / re-engages', 'Selector engages new ratio'],
    pdk: ['Clutches + gear selectors', 'transfer drive to new ratio', 'Engine torque is coordinated'],
    text: 'With the manual gearbox the driver disengages the clutch, selects the ratio and re-engages drive. PDK controls clutch and gear actions and coordinates engine torque with DME. Torque treatment varies with shift and mode; no universal torque cut or measured overlap is implied.',
    systems: 'driver',
  },
  grip: {
    name: 'Grip correction',
    observed: ['Wheel speeds + steering angle', 'Yaw rate + acceleration'],
    decision: ['PSM compares intended', 'and actual vehicle motion'],
    manual: ['Hydraulics → wheel calipers', 'brake selected wheels', 'DME can reduce engine torque'],
    pdk: ['Hydraulics → wheel calipers', 'brake selected wheels', 'DME can reduce engine torque'],
    text: 'This selected example assumes PSM identifies a need for correction. It can target individual wheel brakes and request engine-torque reduction from DME as required. The arrows show functional roles, not a guaranteed pair of interventions. Tyre grip still limits the result; selecting PDK does not predict a gearshift.',
    systems: 'psm,dme',
  },
  braking: {
    name: 'Urgent braking',
    observed: ['Sudden accelerator release', 'Brake input + wheel speeds'],
    decision: ['PSM braking functions', 'Each has its own conditions'],
    manual: ['Prefill: pads ready at discs', 'Assist: boosts brake pressure', 'ABS: modulates wheel pressure'],
    pdk: ['Prefill: pads ready at discs', 'Assist: boosts brake pressure', 'ABS: modulates wheel pressure'],
    text: 'This normal-mode example assumes PSM is on and combines rapid accelerator release with urgent braking. Prefill brings pads into light contact with the discs. Hydraulic brake assist adds pressure when emergency pedal actuation is detected; ABS regulates pressure when a wheel tends to lock. PSM OFF deactivates the additional braking functions; SPORT with Sport Chrono Package Plus also disables hydraulic brake assist. ABS and ordinary vacuum assistance remain separate. No stopping distance is calculated.',
    systems: 'psm',
  },
  impact: {
    name: 'Impact assessment',
    observed: ['Crash-sensing inputs', 'Impact direction + severity'],
    decision: ['Restraint controller', 'Assesses event and criteria'],
    manual: ['If triggered: pretensioners', 'remove belt slack; inflators', 'fill the selected airbags'],
    pdk: ['If triggered: pretensioners', 'remove belt slack; inflators', 'fill the selected airbags'],
    text: 'Crash restraint uses its own sensing and assessment. Pretensioners and airbag inflators act only when the relevant criteria are met. Front, seat-thorax and door-head bags have different roles; six installed bags does not mean all deploy together. The fixed structure below needs no deployment. No crash outcome is simulated.',
    systems: 'restraint',
  },
};

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { scenario: 'acceleration', transmission: 'manual' });
  if (!situations[state.scenario]) state.scenario = 'acceleration';
  if (!['manual', 'pdk'].includes(state.transmission)) state.transmission = 'manual';
  const { stage, controls, explanation } = panel(host, {
    title: 'Follow the input, decision and physical action',
    description: 'Choose a situation, then compare standard manual control with optional PDK.',
    note: 'Driving examples assume normal modes and PSM on. Arrows show functional roles, not timing or intervention calibration. PASM, Sport Chrono and PSM OFF conditions are explained in the text.',
  });
  stage.style.height = '700px';
  const redraw = svgDiagram(
    stage,
    'Inputs, decisions and physical actions for the chosen situation, with permanent passive structure shown separately',
    (svg, { width }) => {
      svg.selectAll('*').remove();
      const item = situations[state.scenario];
      const isPdk = state.transmission === 'pdk';
      const rows = [
        {
          title: '1  INPUTS / OBSERVATION',
          lines: (isPdk && item.pdkObserved) || item.observed,
          colour: '#e8eef4',
        },
        {
          title: '2  DECIDE / REQUEST',
          lines: (isPdk && item.pdkDecision) || item.decision,
          colour: '#e3ede4',
        },
        { title: '3  PHYSICAL ACTION', lines: isPdk ? item.pdk : item.manual, colour: '#f1e8dc' },
      ];
      const x = 8;
      const boxWidth = width - 16;
      const label = (
        value: string | number,
        tx: number,
        ty: number,
        size: number,
        weight = 'normal',
        anchor = 'start',
      ) =>
        svg
          .append('text')
          .attr('x', tx)
          .attr('y', ty)
          .attr('font-size', size)
          .attr('font-weight', weight)
          .attr('text-anchor', anchor)
          .attr('fill', '#173f32')
          .text(value);
      const wrap = (lines: string[], size = 20) => {
        const measure = label('', 0, 0, size).attr('visibility', 'hidden');
        const wrapped = [];
        for (const line of lines) {
          let current = '';
          for (const word of line.split(' ')) {
            const next = current ? `${current} ${word}` : word;
            measure.text(next);
            if (current && measure.node()!.getComputedTextLength() > boxWidth - 28) {
              wrapped.push(current);
              current = word;
            } else current = next;
          }
          wrapped.push(current);
        }
        measure.remove();
        return wrapped;
      };
      svg.append('title').text(`${item.name} · ${isPdk ? 'optional PDK' : 'standard manual'}`);
      svg
        .append('desc')
        .text(
          `${item.text} Permanent passive structure: passenger cell, reinforced windscreen frame and fixed rear rollover bars.`,
        );
      label(item.name, width / 2, 26, 23, 'bold', 'middle');
      label(isPdk ? 'Optional seven-speed PDK' : 'Standard six-speed manual', width / 2, 53, 18, 'normal', 'middle');
      let y = 72;
      rows.forEach((row, i) => {
        const lines = wrap(row.lines);
        const cardHeight = 73 + (lines.length - 1) * 28;
        svg
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', boxWidth)
          .attr('height', cardHeight)
          .attr('rx', 10)
          .attr('fill', row.colour)
          .attr('stroke', '#a8baad');
        label(row.title, x + 14, y + 25, 16, 'bold');
        lines.forEach((line, j) => label(line, x + 14, y + 58 + j * 28, 20));
        y += cardHeight;
        if (i < 2) {
          svg
            .append('path')
            .attr('d', `M${width / 2} ${y + 6}v19m-7-7 7 7 7-7`)
            .attr('stroke', '#6a8b78')
            .attr('stroke-width', 2.5)
            .attr('fill', 'none');
          y += 34;
        }
      });
      if (state.scenario === 'acceleration') {
        y += 16;
        const driveLines = wrap([
          isPdk ? 'PDK controls clutches + gear' : 'Driver controls clutch + gear',
          'Drive passes to the rear wheels',
        ]);
        label('TRANSMISSION · TORQUE ROUTE', x + 14, y + 25, 16, 'bold');
        driveLines.forEach((line, j) => label(line, x + 14, y + 58 + j * 28, 20));
        y += 73 + (driveLines.length - 1) * 28;
      }
      y += 24;
      const fixedLines = wrap(['Passenger cell', 'Reinforced windscreen frame', 'Fixed rear rollover bars']);
      const fixedHeight = 73 + (fixedLines.length - 1) * 28;
      svg
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', boxWidth)
        .attr('height', fixedHeight)
        .attr('rx', 8)
        .attr('fill', '#f5f7f2')
        .attr('stroke', '#b4c1b8');
      label('ALWAYS PRESENT · STRUCTURE', x + 14, y + 25, 16, 'bold');
      fixedLines.forEach((line, j) => label(line, x + 14, y + 58 + j * 28, 20));
      stage.style.height = `${y + fixedHeight + 8}px`;
      explanation.textContent = [item.text, item.transmission?.[state.transmission]].filter(Boolean).join(' ');
      host.dataset.protectionScenario = state.scenario;
      host.dataset.protectionTransmission = state.transmission;
      host.dataset.protectionSystems = state.scenario === 'shift' && isPdk ? 'pdk,dme' : item.systems;
      host.dataset.protectionDeploys = 'not-predicted';
      host.dataset.protectionFixedStructure = 'present';
    },
    signal,
  );
  function selectControl(label: string | null, key: string, choices: string[][]) {
    const wrapper = document.createElement('div');
    wrapper.className = 'diagram-slider';
    wrapper.style.display = 'block';
    const caption = document.createElement('label');
    caption.textContent = label;
    caption.htmlFor = `protection-system-${key}`;
    const input = document.createElement('select');
    input.id = caption.htmlFor;
    input.style.cssText = 'display:block;width:100%;min-height:44px;margin-top:6px;font:inherit;';
    for (const [value, title] of choices) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = title;
      input.append(option);
    }
    input.value = state[key as 'scenario' | 'transmission'];
    input.addEventListener(
      'change',
      () => {
        state[key as 'scenario' | 'transmission'] = input.value;
        redraw();
      },
      { signal },
    );
    wrapper.append(caption, input);
    controls.append(wrapper);
  }
  selectControl(
    'Situation',
    'scenario',
    Object.entries(situations).map(([key, value]) => [key, value.name]),
  );
  selectControl('Transmission', 'transmission', [
    ['manual', 'Standard six-speed manual'],
    ['pdk', 'Optional seven-speed PDK'],
  ]);
  return () => {};
}
