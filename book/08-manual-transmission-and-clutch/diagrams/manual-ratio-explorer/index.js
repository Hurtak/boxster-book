import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

export const manualRatios = [3.667, 2.050, 1.407, 1.133, 0.972, 0.841];
const finalDrive = 3.875;
const circumferenceM = 2.10;
const speedScaleKmh = 300;
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
    description: 'Choose a forward gear and vary engine speed or input torque. A lower gear trades wheel speed for torque; ideal gearing preserves power.',
    note: '2.9 manual ratios: Porsche’s 2010 technical sheet. Fixed illustrative 2.10 m rolling circumference; clutch locked, equal wheel speeds, no slip or losses. Torque is the total after the final drive, before division between the rear wheels. These independent rpm and torque inputs are not an engine map. Road resistance and available engine power are not modelled, so calculated speed is not a top-speed prediction.',
  });
  stage.style.height = '640px';
  let gearRow;
  const redraw = svgDiagram(stage, 'Manual gear ratios comparing ideal road speed, total output torque and conserved power', (svg, { width }) => {
    svg.selectAll('*').remove();
    const result = calculateManualRatio(state.gear, state.rpm, state.torqueNm);
    const powerKw = state.torqueNm * state.rpm * 2 * Math.PI / 60 / 1000;
    svg.append('title').text(`Gear ${state.gear}: ${result.speedKmh.toFixed(1)} km/h and ${whole(result.axleTorqueNm)} Nm total after the final drive`);
    svg.append('desc').text(`At ${whole(state.rpm)} engine rpm and ${state.torqueNm} Nm input, total reduction is ${result.reduction.toFixed(3)}. Ideal input and output power are both ${powerKw.toFixed(1)} kW. Bars use a fixed 0–300 km/h scale and an illustrative 2.10 m rolling circumference. Clutch locked, equal wheel speeds, no slip or losses; this is not an engine map or a top-speed prediction.`);
    const text = (x, y, value, size = 20, anchor = 'middle', fill = '#243d32') => svg.append('text').attr('x', x).attr('y', y).attr('font-size', size).attr('text-anchor', anchor).attr('fill', fill).text(value);
    const mid = width / 2;
    text(mid, 27, `Gear ${state.gear} · ${manualRatios[state.gear - 1].toFixed(3)} : 1`, 22);
    text(mid, 56, `× 3.875 final drive = ${result.reduction.toFixed(3)} total`, 18);
    text(mid, 91, 'Ideal road speed', 18);
    text(mid, 133, `${result.speedKmh.toFixed(1)} km/h`, 34);
    text(mid, 164, `${whole(result.wheelRpm)} wheel rpm`, 18);
    text(mid, 207, `${whole(result.axleTorqueNm)} Nm total`, 28);
    text(mid, 237, `after final drive · from ${state.torqueNm} Nm`, 18);
    text(mid, 277, `${powerKw.toFixed(1)} kW in = ${powerKw.toFixed(1)} kW out`, 22);
    text(mid, 306, 'Ideal power is conserved', 18);
    svg.append('line').attr('x1', 0).attr('x2', width).attr('y1', 323).attr('y2', 323).attr('stroke', '#c2cec5');
    text(mid, 350, 'Speed by gear · km/h', 21);
    text(mid, 379, `${whole(state.rpm)} engine rpm · fixed scale`, 18);
    const barX = 32;
    const barWidth = width - barX - 68;
    // A fixed axis makes rpm changes visible. The full slider range stays below
    // 300 km/h with the illustrative circumference; this is not a speed limit.
    for (const speed of [0, 100, 200, speedScaleKmh]) {
      const x = barX + barWidth * speed / speedScaleKmh;
      svg.append('line').attr('x1', x).attr('x2', x).attr('y1', 412).attr('y2', 603).attr('stroke', '#d5ded6');
      text(x, 405, String(speed), 16);
    }
    for (let gear = 1; gear <= 6; gear++) {
      const y = 416 + (gear - 1) * 32;
      const item = calculateManualRatio(gear, state.rpm, state.torqueNm);
      const selected = gear === state.gear;
      svg.append('rect').attr('x', barX).attr('y', y).attr('height', 22).attr('width', barWidth * item.speedKmh / speedScaleKmh).attr('fill', selected ? '#286449' : '#c2cec5');
      text(12, y + 18, String(gear), 18);
      text(width - 2, y + 18, item.speedKmh.toFixed(1), 18, 'end', selected ? '#1d5038' : '#4c6155');
    }
    text(mid, 631, 'Ideal gearing, not a top-speed forecast', 18);
    explanation.textContent = `Gear ${state.gear}: ${state.rpm.toLocaleString('en-GB')} engine rpm ÷ (${manualRatios[state.gear - 1].toFixed(3)} × 3.875) = ${whole(result.wheelRpm)} wheel rpm. Road speed = wheel rpm × 2.10 m × 60 ÷ 1,000 = ${result.speedKmh.toFixed(1)} km/h. Total torque = ${state.torqueNm} Nm × ${result.reduction.toFixed(3)} = ${whole(result.axleTorqueNm)} Nm. Power in kW = torque × rpm × 2π ÷ 60,000: both engine input and total wheel output give ${powerKw.toFixed(1)} kW here. Change rpm to move all bars on the fixed 0–300 km/h scale; change torque to alter output torque and power without changing speed.`;
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
