import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';
import { differentialSpeeds, openDifferentialTorque } from './model.js';

export function mount(host, { state, signal }) {
  state.view ??= 'speed';
  state.carrierRpm ??= 300;
  state.differencePercent ??= 20;
  state.leftCapacityNm ??= 100;
  state.requestedNm ??= 800;
  const { stage, controls, explanation } = panel(host, {
    title: 'One differential, two different questions',
    description: 'See how the carrier and bevel gears connect the outputs, then compare speed averaging with the torque ceiling.',
    note: 'Ideal symmetrical open differential. Functional section, not measured Porsche gear geometry. Speed is prescribed; torque is a separate steady-state limit. No losses, inertia, brake intervention or limited-slip friction. All values are illustrative.',
  });
  stage.style.height = '580px';
  let viewButtons;
  const groups = {};
  const redraw = svgDiagram(stage, 'Open differential: carrier and cross-pin carry the spider pinions, which mesh with both output side gears', (svg, { width: w }) => {
    svg.selectAll('*').remove();
    const ink = '#243e35', green = '#176b53', orange = '#9a4e22', pale = '#eef3ee';
    const text = (x, y, value, size = 20, fill = ink, anchor = 'middle') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', fill).text(value);
    const rect = (x, y, width, height, fill = pale) => svg.append('rect').attr('x', x).attr('y', y).attr('width', width).attr('height', height).attr('rx', 12).attr('fill', fill).attr('stroke', '#c9d5cc');
    const line = (d, color = ink, width = 2) => svg.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
    const rpm = value => String(Number(value.toFixed(1)));
    const center = w / 2;
    const diagramW = Math.min(w - 24, 480);
    const cardW = (diagramW - 14) / 2;
    const left = center - diagramW / 2;
    const cx = [left + cardW / 2, center + 7 + cardW / 2];
    const { leftRpm, rightRpm } = differentialSpeeds(state.carrierRpm, state.differencePercent);
    const { eachNm, totalNm, unusedNm } = openDifferentialTorque(state.requestedNm, state.leftCapacityNm);
    host.dataset.drivetrainView = state.view;
    host.dataset.drivetrainLeftRpm = String(leftRpm);
    host.dataset.drivetrainRightRpm = String(rightRpm);
    host.dataset.drivetrainCarrierRpm = String(state.carrierRpm);
    host.dataset.drivetrainEachNm = String(eachNm);
    host.dataset.drivetrainTotalNm = String(totalNm);

    text(center, 25, 'Ring gear drives the carrier', 20);
    text(center, 55, state.view === 'speed' ? `Carrier: ${state.carrierRpm} rpm` : `Axle request: ${state.requestedNm} Nm`, 24, green);
    line(`M${center},64V78M${center - 5},73L${center},79L${center + 5},73`, green, 2.5);
    // Functional bevel-gear section: the carrier takes the cross-pin around
    // the output axis; the pinions can also turn about that cross-pin.
    rect(center - 128, 81, 256, 181, '#f6f8f5').attr('stroke', green).attr('stroke-width', 3);
    line(`M${center},84V259`, '#6c7b72', 5);
    for (const sign of [-1, 1]) {
      const sideX = center + sign * 83;
      line(`M${center + sign * 153},171H${sideX}`, green, 12);
      svg.append('polygon').attr('points', `${center + sign * 84},116 ${center + sign * 37},144 ${center + sign * 37},198 ${center + sign * 84},226`).attr('fill', '#dbeae1').attr('stroke', green).attr('stroke-width', 2.5);
      // Tooth-contact marks identify the bevel meshes without implying tooth counts.
      line(`M${center + sign * 69},125L${center + sign * 58},145M${center + sign * 55},134L${center + sign * 45},153M${center + sign * 69},217L${center + sign * 58},197M${center + sign * 55},208L${center + sign * 45},189`, green, 1.5);
    }
    for (const top of [true, false]) {
      const points = top
        ? `${center - 37},144 ${center - 24},116 ${center + 24},116 ${center + 37},144`
        : `${center - 37},198 ${center - 24},226 ${center + 24},226 ${center + 37},198`;
      svg.append('polygon').attr('points', points).attr('fill', '#f1dbc9').attr('stroke', orange).attr('stroke-width', 2.5);
    }
    // Labels sit in the open spaces of the schematic, away from the meshes.
    svg.append('rect').attr('x', center - 64).attr('y', 88).attr('width', 128).attr('height', 23).attr('fill', '#f6f8f5');
    text(center, 105, 'Spider pinions', 17, orange);
    svg.append('rect').attr('x', center - 42).attr('y', 158).attr('width', 84).attr('height', 25).attr('rx', 4).attr('fill', '#f6f8f5');
    text(center, 176, 'Cross-pin', 17, '#526159');
    line(`M${center - 84},226V278M${center + 84},226V278`, green, 1.5);
    text(center - 84, 298, 'Left side gear', 17, green);
    text(center + 84, 298, 'Right side gear', 17, green);

    for (const [i, x] of cx.entries()) {
      rect(left + i * (cardW + 14), 315, cardW, 113);
      text(x, 340, i ? 'Right output' : 'Left output', 19);
      if (state.view === 'speed') {
        const value = [leftRpm, rightRpm][i];
        const delta = value - state.carrierRpm;
        text(x, 376, `${rpm(value)} rpm`, 27, i ? orange : green);
        text(x, 406, `${delta > 0 ? '+' : ''}${rpm(delta)} vs carrier`, 16);
      } else {
        text(x, 374, `${eachNm} Nm`, 27, green);
        text(x, 405, `Capacity: ${i ? 600 : state.leftCapacityNm} Nm`, 16);
      }
    }
    if (state.view === 'speed') {
      text(center, 461, state.differencePercent === 0 ? 'Pinions do not spin on the cross-pin.' : 'Pinions also spin on the cross-pin.', 18);
      text(center, 489, state.differencePercent === 0 ? 'Both side gears turn with the carrier.' : 'One side gains what the other loses.', 18);
      text(center, 525, `${rpm(leftRpm)} + ${rpm(rightRpm)} = 2 × ${state.carrierRpm}`, 23, green);
      explanation.textContent = `The ring gear is attached to the carrier. The carrier carries the cross-pin and spider pinions around the output-shaft axis. The side gears are fixed to their respective output shafts; each pinion meshes with both side gears. ${state.differencePercent === 0 ? 'At equal output speeds, the pinions have no rotation relative to their cross-pin.' : 'The pinions also spin on the cross-pin, allowing equal and opposite speed offsets relative to the carrier.'} Carrier ${state.carrierRpm} rpm; left ${rpm(leftRpm)} rpm; right ${rpm(rightRpm)} rpm. Their average is always ${state.carrierRpm} rpm. These prescribed speeds do not predict slip or vehicle speed.`;
    } else {
      text(center, 461, 'Both outputs get equal torque.', 20);
      text(center, 494, `Total sustained: ${totalNm} Nm`, 23, green);
      text(center, 525, 'Each ≤ the lower tyre capacity', 20);
      explanation.textContent = `The freely turning spider pinions cannot sustain a torque difference between these equal-sized side gears in the ideal steady case. With ${state.requestedNm} Nm requested at the axle, the left tyre's ${state.leftCapacityNm} Nm limit and the right tyre's 600 Nm limit allow ${eachNm} Nm per output, ${totalNm} Nm total. The remaining ${unusedNm} Nm of the request cannot be sustained here. This is a steady, unbraked limit; no wheel speeds are predicted in this view.`;
    }
    text(center, 563, 'Cross-pin fixed to carrier; pinions free to spin.', 16);
    Object.entries(groups).forEach(([view, group]) => { group.hidden = view !== state.view; });
    viewButtons?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String((i === 0 ? 'speed' : 'grip') === state.view)));
  }, signal);
  viewButtons = buttons(controls, [
    { label: 'Speed averaging', action: () => { state.view = 'speed'; redraw(); } },
    { label: 'Unequal grip', action: () => { state.view = 'grip'; redraw(); } },
  ], signal);
  for (const view of ['speed', 'grip']) {
    groups[view] = document.createElement('div');
    controls.append(groups[view]);
  }
  slider(groups.speed, { label: 'Carrier speed', min: 50, max: 600, step: 10, value: state.carrierRpm, format: value => `${value} rpm`, signal, onChange: value => { state.carrierRpm = value; redraw(); } });
  slider(groups.speed, { label: 'Speed difference about the mean', min: 0, max: 100, step: 5, value: state.differencePercent, format: value => `±${value}%`, signal, onChange: value => { state.differencePercent = value; redraw(); } });
  slider(groups.grip, { label: 'Left tyre torque capacity', min: 0, max: 600, step: 25, value: state.leftCapacityNm, format: value => `${value} Nm`, signal, onChange: value => { state.leftCapacityNm = value; redraw(); } });
  slider(groups.grip, { label: 'Requested axle torque', min: 0, max: 1200, step: 50, value: state.requestedNm, format: value => `${value} Nm`, signal, onChange: value => { state.requestedNm = value; redraw(); } });
  redraw();
  return () => {};
}
