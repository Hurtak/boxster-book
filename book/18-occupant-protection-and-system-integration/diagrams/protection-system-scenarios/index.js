import { panel } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const situations = {
  acceleration: {
    name: 'Accelerating',
    observed: ['Pedal + engine state', 'Driver asks for torque'],
    decision: ['DME', 'Engine torque request'],
    manual: ['Air, fuel and ignition', 'Driver clutch + gear'],
    pdk: ['Air, fuel and ignition', 'PDK carries drive'],
    text: 'DME translates accelerator demand into engine control. The manual driver controls clutch engagement and gear selection; optional PDK controls its own clutches and selected gear. The diagram makes no assumption that PSM must intervene.',
    systems: 'dme',
  },
  shift: {
    name: 'Changing gear',
    observed: ['Driver shift request', 'Speed and gear state'],
    decision: ['Driver', 'Clutch + lever choice'],
    manual: ['Driver clutch + lever', 'New mechanical ratio'],
    pdk: ['PDK clutch handover', 'Engine torque treatment'],
    text: 'With the manual gearbox the driver releases drive through the clutch and selects the ratio. With PDK, transmission control coordinates clutch and gear actions with DME. Engine-torque treatment varies with shift and mode; no fixed reduction or measured overlap is implied.',
    systems: 'driver',
  },
  grip: {
    name: 'Grip correction',
    observed: ['Wheel + steering data', 'Yaw + acceleration'],
    decision: ['PSM', 'Correction requested'],
    manual: ['Individual wheel brakes', 'Engine torque reduction'],
    pdk: ['Individual wheel brakes', 'Engine torque reduction'],
    text: 'In this selected example, PSM identifies a need for correction. It can request reduced engine torque and use individual wheel braking. Selecting PDK does not imply that a particular gearshift accompanies the correction. Available tyre grip still limits the physical result.',
    systems: 'psm,dme',
  },
  braking: {
    name: 'Urgent braking',
    observed: ['Rapid accelerator lift', 'Brake input + wheels'],
    decision: ['PSM hydraulic control', 'Prefill / assist / ABS'],
    manual: ['Wheel-brake pressure', 'Responds as required'],
    pdk: ['Wheel-brake pressure', 'Responds as required'],
    text: 'This example combines rapid accelerator release with an urgent brake application. Prefill readies the brakes, brake assist can increase pressure, and ABS can modulate it if a wheel approaches locking. These functions depend on their own conditions; the diagram does not prescribe stopping distance.',
    systems: 'psm',
  },
  impact: {
    name: 'Impact assessment',
    observed: ['Crash-sensing inputs', 'Direction + severity'],
    decision: ['Restraint controller', 'Event assessment'],
    manual: ['Belt / bag commands', 'If criteria are met'],
    pdk: ['Belt / bag commands', 'If criteria are met'],
    text: 'Crash restraint has its own sensing and assessment. Pretensioner and airbag commands depend on the event; front and side bags have different roles. The six bags are not a rule that all deploy together. The cell, reinforced screen frame and fixed rear bars are already present. No crash outcome is simulated.',
    systems: 'restraint',
  },
};

export function mount(host, { state, signal }) {
  if (!situations[state.scenario]) state.scenario = 'acceleration';
  if (!['manual', 'pdk'].includes(state.transmission)) state.transmission = 'manual';
  const { stage, controls, explanation } = panel(host, {
    title: 'Follow the observation, request and action',
    description: 'Choose a situation, then compare standard manual control with optional PDK.',
    note: 'Functional examples in normal modes, not a wiring map or intervention calibration. PASM and Sport Chrono effects are explained in the text. Fixed structure is present in every situation.',
  });
  stage.style.height = '520px';
  const redraw = svgDiagram(stage, 'Observed inputs, controller requests and physical actions for the chosen situation', (svg, { width }) => {
    svg.selectAll('*').remove();
    const item = situations[state.scenario];
    const decision = state.scenario === 'shift' && state.transmission === 'pdk'
      ? ['PDK ↔ DME', 'Coordinated handover'] : item.decision;
    const rows = [
      { title: 'OBSERVE', lines: item.observed, colour: '#e8eef4' },
      { title: 'DECIDE / REQUEST', lines: decision, colour: '#e3ede4' },
      { title: 'PHYSICAL ACTION', lines: item[state.transmission], colour: '#f1e8dc' },
    ];
    const x = 12;
    const boxWidth = width - 24;
    const label = (value, tx, ty, size, weight = 'normal', anchor = 'start') => svg.append('text')
      .attr('x', tx).attr('y', ty).attr('font-size', size).attr('font-weight', weight)
      .attr('text-anchor', anchor).attr('fill', '#173f32').text(value);
    label(item.name, width / 2, 27, 23, 'bold', 'middle');
    rows.forEach((row, i) => {
      const y = 46 + i * 136;
      svg.append('rect').attr('x', x).attr('y', y).attr('width', boxWidth).attr('height', 108)
        .attr('rx', 10).attr('fill', row.colour).attr('stroke', '#a8baad');
      label(row.title, x + 14, y + 24, 16, 'bold');
      row.lines.forEach((line, j) => label(line, x + 14, y + 58 + j * 29, 20));
      if (i < 2) svg.append('path').attr('d', `M${width / 2} ${y + 113}v16m-7-7 7 7 7-7`)
        .attr('stroke', '#6a8b78').attr('stroke-width', 2.5).attr('fill', 'none');
    });
    svg.append('rect').attr('x', x).attr('y', 458).attr('width', boxWidth).attr('height', 55)
      .attr('rx', 8).attr('fill', '#f5f7f2').attr('stroke', '#b4c1b8');
    label('Always present:', x + 14, 479, 17, 'bold');
    label('Cell, screen frame, bars', x + 14, 502, 20);
    explanation.textContent = item.text;
    host.dataset.protectionScenario = state.scenario;
    host.dataset.protectionTransmission = state.transmission;
    host.dataset.protectionSystems = state.scenario === 'shift' && state.transmission === 'pdk' ? 'pdk,dme' : item.systems;
    host.dataset.protectionDeploys = 'not-predicted';
    host.dataset.protectionFixedStructure = 'present';
  }, signal);
  function selectControl(label, key, choices) {
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
    input.value = state[key];
    input.addEventListener('change', () => { state[key] = input.value; redraw(); }, { signal });
    wrapper.append(caption, input);
    controls.append(wrapper);
  }
  selectControl('Situation', 'scenario', Object.entries(situations).map(([key, value]) => [key, value.name]));
  selectControl('Transmission', 'transmission', [['manual', 'Standard six-speed manual'], ['pdk', 'Optional seven-speed PDK']]);
  return () => {};
}
