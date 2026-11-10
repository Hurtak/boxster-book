import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

export const manualRatios = [3.667, 2.050, 1.407, 1.133, 0.972, 0.841];
const finalDrive = 3.875;
const circumferenceM = 2.10;
const whole = value => Math.round(value).toLocaleString('en-GB');

export function calculateManualRatio(gear, rpm, torqueNm) {
  // Both source ratios have three decimals: their product has at most six.
  const reduction = Number((manualRatios[gear - 1] * finalDrive).toFixed(6));
  const wheelRpm = rpm / reduction;
  return {
    reduction,
    wheelRpm,
    speedKmh: wheelRpm * circumferenceM * 60 / 1000,
    axleTorqueNm: torqueNm * reduction,
  };
}

export function mount(host, { state, signal }) {
  state.gear ??= 3;
  state.rpm ??= 3000;
  state.torqueNm ??= 200;
  const { stage, controls, explanation } = panel(host, {
    title: 'Six ratios: speed and torque',
    description: 'Choose a forward gear and vary engine speed or input torque. The bars compare road speed at the same engine rpm.',
    note: 'Ideal calculation using the 2.9 manual ratios in Porsche’s 2010 technical sheet and a 3.875 final drive. Fixed illustrative 2.10 m circumference; clutch locked, equal wheel speeds, no slip or losses. Torque is the total after the final drive, not torque at each wheel. The torque input is independent of rpm, not an engine map.',
  });
  stage.style.height = '420px';
  let gearRow;
  const redraw = svgDiagram(stage, 'Manual gear ratios comparing ideal road speeds and total output torque', (svg, { width }) => {
    svg.selectAll('*').remove();
    const result = calculateManualRatio(state.gear, state.rpm, state.torqueNm);
    const text = (x, y, value, size = 20, anchor = 'middle', fill = '#243d32') => svg.append('text').attr('x', x).attr('y', y).attr('font-size', size).attr('text-anchor', anchor).attr('fill', fill).text(value);
    const mid = width / 2;
    text(mid, 30, `Gear ${state.gear} · ${manualRatios[state.gear - 1].toFixed(3)} : 1`, 21);
    text(mid, 73, `${result.speedKmh.toFixed(1)} km/h`, 34);
    text(mid, 105, `${whole(result.axleTorqueNm)} Nm total`, 24);
    text(mid, 133, `${whole(result.wheelRpm)} wheel rpm`, 20);
    text(mid, 164, 'Speed by gear · km/h', 18);
    text(mid, 188, `at ${whole(state.rpm)} engine rpm`, 17);
    const barX = 39;
    const barWidth = Math.max(80, width - 130);
    const topSpeed = calculateManualRatio(6, state.rpm, state.torqueNm).speedKmh;
    for (let gear = 1; gear <= 6; gear++) {
      const y = 205 + (gear - 1) * 31;
      const item = calculateManualRatio(gear, state.rpm, state.torqueNm);
      const selected = gear === state.gear;
      svg.append('rect').attr('x', barX).attr('y', y).attr('height', 22).attr('width', barWidth * item.speedKmh / topSpeed).attr('fill', selected ? '#286449' : '#c2cec5');
      text(18, y + 18, String(gear), 20);
      text(width - 8, y + 18, item.speedKmh.toFixed(1), 20, 'end', selected ? '#1d5038' : '#4c6155');
    }
    text(mid, 414, 'Same rpm · different road speed', 16);
    explanation.textContent = `Gear ${state.gear}: ${state.rpm.toLocaleString('en-GB')} engine rpm ÷ ${result.reduction.toFixed(3)} total reduction = ${whole(result.wheelRpm)} wheel rpm. With 2.10 m circumference this gives ${result.speedKmh.toFixed(1)} km/h. ${state.torqueNm} Nm × ${result.reduction.toFixed(3)} = ${whole(result.axleTorqueNm)} Nm total after the final drive. A lower gear multiplies torque while reducing speed; it adds no engine power.`;
    Object.assign(host.dataset, {
      manualGear: String(state.gear), engineRpm: String(state.rpm), engineTorqueNm: String(state.torqueNm),
      roadSpeedKmh: String(result.speedKmh), axleTorqueNm: String(result.axleTorqueNm),
      wheelRpm: String(result.wheelRpm), totalReduction: String(result.reduction),
    });
    gearRow?.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-pressed', String(index + 1 === state.gear)));
  }, signal);
  gearRow = buttons(controls, manualRatios.map((ratio, index) => ({
    label: `Gear ${index + 1}`,
    action: () => { state.gear = index + 1; redraw(); },
  })), signal);
  slider(controls, { label: 'Engine speed', min: 1000, max: 7000, step: 100, value: state.rpm, format: value => `${whole(value)} rpm`, signal, onChange: value => { state.rpm = value; redraw(); } });
  slider(controls, { label: 'Input engine torque', min: 50, max: 290, step: 10, value: state.torqueNm, format: value => `${value} Nm`, signal, onChange: value => { state.torqueNm = value; redraw(); } });
  redraw();
  return () => {};
}
