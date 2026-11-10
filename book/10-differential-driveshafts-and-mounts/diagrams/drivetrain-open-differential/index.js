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
    description: 'Explore wheel-speed averaging, then the torque ceiling when one tyre has less grip.',
    note: 'Ideal symmetrical open differential. Speed is prescribed; torque is a separate steady-state limit. No losses, inertia, brake intervention or limited-slip friction. All examples are illustrative, not Porsche calibration.',
  });
  stage.style.height = '380px';
  let viewButtons;
  const groups = {};
  const redraw = svgDiagram(stage, 'Open differential: output speed averaging or equal output torque with unequal grip', (svg, { width: w, height: h }) => {
    svg.selectAll('*').remove();
    const ink = '#243e35', green = '#176b53', orange = '#9a4e22', pale = '#eef3ee';
    const text = (x, y, value, size = 20, fill = ink, anchor = 'middle') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', fill).text(value);
    const rect = (x, y, width, height, fill = pale) => svg.append('rect').attr('x', x).attr('y', y).attr('width', width).attr('height', height).attr('rx', 12).attr('fill', fill).attr('stroke', '#c9d5cc');
    const cardW = (w - 34) / 2;
    const cx = [12 + cardW / 2, w - 12 - cardW / 2];
    const { leftRpm, rightRpm } = differentialSpeeds(state.carrierRpm, state.differencePercent);
    const { eachNm, totalNm, unusedNm } = openDifferentialTorque(state.requestedNm, state.leftCapacityNm);
    host.dataset.drivetrainView = state.view;
    host.dataset.drivetrainLeftRpm = String(leftRpm);
    host.dataset.drivetrainRightRpm = String(rightRpm);
    host.dataset.drivetrainCarrierRpm = String(state.carrierRpm);
    host.dataset.drivetrainEachNm = String(eachNm);
    host.dataset.drivetrainTotalNm = String(totalNm);
    if (state.view === 'speed') {
      text(w / 2, 29, 'Carrier (ring gear)', 22);
      rect(12, 46, w - 24, 62);
      text(w / 2, 87, `${state.carrierRpm} rpm`, 30, green);
      svg.append('path').attr('d', `M${w / 2},108V142M${cx[0]},166V142H${cx[1]}V166`).attr('fill', 'none').attr('stroke', green).attr('stroke-width', 4);
      for (const [i, value] of [leftRpm, rightRpm].entries()) {
        rect(i ? w - 12 - cardW : 12, 167, cardW, 129);
        text(cx[i], 196, i ? 'Right' : 'Left', 22);
        text(cx[i], 244, String(Math.round(value)), 34, i ? orange : green);
        text(cx[i], 277, 'rpm');
      }
      text(w / 2, 329, `${Math.round(leftRpm)} + ${Math.round(rightRpm)} = 2 × ${state.carrierRpm}`, 20);
      text(w / 2, h - 15, 'The carrier keeps the average.', 20);
      explanation.textContent = `Carrier ${state.carrierRpm} rpm; left ${leftRpm.toFixed(0)} rpm; right ${rightRpm.toFixed(0)} rpm. The outputs differ by ±${state.differencePercent}% about the mean. Their average is always ${state.carrierRpm} rpm. This prescribes speeds; it does not predict slip or vehicle speed.`;
    } else {
      text(w / 2, 27, 'Tyre torque capacities', 22);
      for (const [i, capacity] of [state.leftCapacityNm, 600].entries()) {
        rect(i ? w - 12 - cardW : 12, 45, cardW, 127);
        text(cx[i], 75, i ? 'Right tyre' : 'Left tyre', 20);
        text(cx[i], 116, `${capacity}`, 32, i ? orange : green);
        text(cx[i], 147, 'Nm limit');
      }
      text(w / 2, 204, 'Delivered to each side', 22);
      for (const [i, x] of cx.entries()) {
        const left = i ? w - 12 - cardW : 12;
        svg.append('rect').attr('x', left).attr('y', 222).attr('width', cardW).attr('height', 18).attr('fill', '#e3e9e2');
        svg.append('rect').attr('x', left).attr('y', 222).attr('width', cardW * eachNm / 600).attr('height', 18).attr('fill', green);
        text(x, 277, `${eachNm} Nm`, 25, green);
      }
      text(w / 2, 323, `Total: ${totalNm} Nm`, 25);
      text(w / 2, h - 15, `Request: ${state.requestedNm} Nm`, 20);
      explanation.textContent = `With ${state.requestedNm} Nm requested at the axle, the left tyre's ${state.leftCapacityNm} Nm limit and the right tyre's 600 Nm limit allow ${eachNm} Nm per output, ${totalNm} Nm total. The remaining ${unusedNm} Nm of the request cannot be sustained in this ideal steady, unbraked example. No wheel speeds are predicted in this view.`;
    }
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
