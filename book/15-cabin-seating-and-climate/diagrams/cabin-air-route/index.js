import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const heatLabels = ['Bypass heater', 'Some heater air', 'More heater air'];
const outletLabels = { face: 'Face vents', feet: 'Footwell', screen: 'Windscreen' };

export function airRoute(state) {
  return {
    source: state.source === 'recirculate' ? 'Cabin air reused' : 'Fresh outside air',
    evaporator: state.ac ? 'Cooling + drying*' : 'No A/C cooling',
    heater: heatLabels[state.heat],
    outlet: outletLabels[state.outlet],
    note: state.source === 'recirculate'
      ? 'Outside-air supply is interrupted. Occupants still add moisture; prolonged recirculation can encourage misting.'
      : 'Outside air replaces cabin air. Its temperature and moisture content depend on the weather.',
  };
}

export function mount(host, { state, signal }) {
  state.source ??= 'fresh';
  state.outlet ??= 'face';
  state.heat ??= 0;
  state.ac ??= true;
  const { stage, controls, explanation } = panel(host, {
    title: 'Choose the air route',
    description: 'Separate the inlet, cooling, heater contribution and destination. The demisting preset combines their purposes.',
    note: 'Connection schematic, with blower running. *Drying occurs when moisture condenses on the evaporator. No temperatures, flow proportions or Porsche control calibration are simulated; actual compressor operation has limits.',
  });
  stage.style.height = '470px';
  const redraw = svgDiagram(stage, 'Cabin air source, evaporator, heater and outlet path', (svg, { width }) => {
    const narrow = width < 470;
    stage.style.height = narrow ? '500px' : '470px';
    const w = narrow ? 360 : 600;
    const h = narrow ? 560 : 470;
    svg.attr('viewBox', `0 0 ${w} ${h}`).attr('width', width).attr('height', narrow ? 500 : 470);
    svg.selectAll('*').remove();
    const m = airRoute(state);
    const ink = '#263e34', cool = '#2875a4', warm = '#b64e2b', pale = '#edf2ef';
    const text = (x, y, value, size = 22, colour = ink) => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('font-size', size).attr('fill', colour).text(value);
    const box = (x, y, bw, bh, line1, line2, colour = ink) => {
      svg.append('rect').attr('x', x).attr('y', y).attr('width', bw).attr('height', bh).attr('rx', 8).attr('fill', pale).attr('stroke', colour).attr('stroke-width', 2);
      text(x + bw / 2, y + 29, line1, 23, colour);
      if (line2) text(x + bw / 2, y + 57, line2, 20, colour);
    };
    const arrow = (x1, y1, x2, y2, colour = ink) => {
      svg.append('path').attr('d', `M${x1},${y1}L${x2},${y2}`).attr('stroke', colour).attr('stroke-width', 5).attr('fill', 'none');
      const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
      svg.append('path').attr('d', `M${x2 - s * Math.cos(a - 0.5)},${y2 - s * Math.sin(a - 0.5)}L${x2},${y2}L${x2 - s * Math.cos(a + 0.5)},${y2 - s * Math.sin(a + 0.5)}`).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 4);
    };
    if (narrow) {
      box(30, 12, 300, 70, m.source, state.source === 'fresh' ? 'Inlet + filter' : 'Outside route closed');
      arrow(180, 82, 180, 112);
      box(30, 112, 300, 70, 'Blower', 'Moves the air');
      arrow(180, 182, 180, 212);
      box(30, 212, 300, 70, 'Evaporator', m.evaporator, state.ac ? cool : ink);
      arrow(180, 282, 180, 312, state.ac ? cool : ink);
      box(30, 312, 300, 70, 'Heater / bypass', m.heater, state.heat ? warm : ink);
      arrow(180, 382, 180, 412, state.heat ? warm : state.ac ? cool : ink);
      box(30, 412, 300, 70, 'Delivery', m.outlet);
      text(180, 525, 'Source → treatment → outlet', 22);
    } else {
      box(150, 12, 300, 70, m.source, state.source === 'fresh' ? 'Inlet + filter' : 'Outside route closed');
      arrow(300, 82, 300, 112);
      box(150, 112, 300, 70, 'Blower', 'Moves the air');
      arrow(300, 182, 300, 198);
      box(20, 212, 260, 70, 'Evaporator', m.evaporator, state.ac ? cool : ink);
      arrow(300, 198, 150, 198);
      arrow(150, 198, 150, 212);
      arrow(280, 247, 320, 247, state.ac ? cool : ink);
      box(320, 212, 260, 70, 'Heater / bypass', m.heater, state.heat ? warm : ink);
      arrow(450, 282, 450, 316, state.heat ? warm : state.ac ? cool : ink);
      arrow(450, 316, 300, 316, state.heat ? warm : state.ac ? cool : ink);
      arrow(300, 316, 300, 346, state.heat ? warm : state.ac ? cool : ink);
      box(150, 346, 300, 70, 'Delivery', m.outlet);
      text(300, 454, 'Source → treatment → outlet', 22);
    }
    host.dataset.airSource = state.source;
    host.dataset.airOutlet = state.outlet;
    host.dataset.airHeat = String(state.heat);
    host.dataset.airAc = state.ac ? 'on' : 'off';
    explanation.textContent = `${m.source} goes to the ${m.outlet.toLowerCase()}. ${state.ac ? 'The available A/C removes heat and can remove condensed moisture. ' : 'A/C cooling and evaporator drying are unavailable in this selection. '}${state.heat ? 'The heater adds heat after the evaporator; cooling and reheating can work together. ' : 'The route bypasses the heater. '}${m.note}`;
  }, signal);
  const selectControl = (id, label, choices, value, change) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:grid;gap:4px;margin-bottom:12px;font-size:16px;';
    const caption = document.createElement('label');
    caption.htmlFor = id;
    caption.textContent = label;
    caption.style.fontWeight = '600';
    const select = document.createElement('select');
    select.id = id;
    select.style.cssText = 'font:inherit;min-height:44px;width:100%;max-width:100%;background:#fff;color:#263e34;border:1px solid #a5b2aa;padding:6px;';
    for (const [key, text] of choices) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = text;
      select.append(option);
    }
    select.value = value;
    select.addEventListener('change', () => { change(select.value); redraw(); }, { signal });
    wrap.append(caption, select);
    controls.append(wrap);
    return select;
  };
  const sourceControl = selectControl('cabin-air-source', 'Air source', [['fresh', 'Fresh outside air'], ['recirculate', 'Recirculate cabin air']], state.source, value => { state.source = value; });
  const outletControl = selectControl('cabin-air-outlet', 'Air delivery', Object.entries(outletLabels), state.outlet, value => { state.outlet = value; });
  const acControl = selectControl('cabin-air-ac', 'A/C compressor', [['on', 'Available for cooling / drying'], ['off', 'Switched off']], state.ac ? 'on' : 'off', value => { state.ac = value === 'on'; });
  const heatControl = slider(controls, { label: 'Heat added after evaporator', min: 0, max: 2, step: 1, value: state.heat, format: v => heatLabels[v], signal, onChange: value => { state.heat = value; redraw(); } });
  heatControl.input.id = 'cabin-air-heat';
  heatControl.input.parentElement.querySelector('label').htmlFor = 'cabin-air-heat';
  heatControl.input.parentElement.querySelector('output').htmlFor = 'cabin-air-heat';
  buttons(controls, [{ label: 'Demisting principle', action: () => {
    Object.assign(state, { source: 'fresh', outlet: 'screen', heat: 2, ac: true });
    sourceControl.value = state.source;
    outletControl.value = state.outlet;
    acControl.value = 'on';
    heatControl.set(2, false);
    redraw();
  } }, { label: 'Cooling principle', action: () => {
    Object.assign(state, { source: 'fresh', outlet: 'face', heat: 0, ac: true });
    sourceControl.value = state.source;
    outletControl.value = state.outlet;
    acControl.value = 'on';
    heatControl.set(0, false);
    redraw();
  } }], signal);
  return () => {};
}
