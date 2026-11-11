import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel, slider } from '../../../../interactive/ui.ts';

const heatLabels = ['Bypass heater', 'Some heater air', 'More heater air'];
const outletLabels = { face: 'Face vents', feet: 'Footwell', screen: 'Windscreen' };

export function airRoute(state: { source: string; outlet: string; heat: number; ac: boolean }) {
  return {
    source: state.source === 'recirculate' ? 'Cabin air reused' : 'Fresh outside air',
    evaporator: state.ac ? 'May cool + dry*' : 'A/C cooling off',
    heater: heatLabels[state.heat],
    outlet: outletLabels[state.outlet as 'face' | 'feet' | 'screen'],
    note:
      state.source === 'recirculate'
        ? 'Outside-air supply is interrupted. Occupants still add moisture; prolonged recirculation can encourage misting.'
        : 'Outside air replaces cabin air. Its temperature and moisture content depend on the weather.',
  };
}

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { source: 'fresh', outlet: 'face', heat: 0, ac: true });
  state.source ??= 'fresh';
  state.outlet ??= 'face';
  state.heat ??= 0;
  state.ac ??= true;
  const { stage, controls, explanation } = panel(host, {
    title: 'Choose the air route',
    description:
      'Follow the selected air paths. The inlet flap selects a source; the heater and bypass branches join before the outlet flaps.',
    note: 'Functional air-route schematic, with blower running; flap geometry is illustrative. *A/C can cool only when refrigerant output is available, and dries only when the evaporator is below the air’s dew point. A/C OFF commands zero delivery from the continuously driven compressor. Heater heat needs warm coolant. Refrigerant and coolant stay in separate closed circuits; the arrows here show air. No temperatures, flow proportions or Porsche control calibration are simulated.',
  });
  stage.style.height = '826px';
  const redraw = svgDiagram(
    stage,
    'Air routes through the inlet flap, blower, evaporator, heater or bypass, mixing point and outlet flaps',
    (svg, { width }) => {
      const narrow = width < 470;
      const w = narrow ? 360 : 640;
      const h = narrow ? 860 : 826;
      const displayHeight = narrow ? (width * h) / w : h;
      stage.style.height = `${displayHeight}px`;
      svg.attr('viewBox', `0 0 ${w} ${h}`).attr('width', width).attr('height', displayHeight);
      svg.selectAll('*').remove();
      const m = airRoute(state);
      svg.append('title').text('Selected cabin airflow and heat-treatment paths');
      svg
        .append('desc')
        .text(
          `${m.source} passes through the blower and evaporator, then the selected heater or bypass routes, before ${m.outlet.toLowerCase()} delivery. Solid arrows show selected air paths; dashed paths are not selected in this illustration. Coolant and refrigerant circuits are not drawn.`,
        );
      const ink = '#263e34',
        cool = '#2875a4',
        warm = '#b64e2b',
        pale = '#edf2ef',
        muted = '#7d8b83';
      const c = w / 2;
      const left = narrow ? 90 : 160,
        right = w - left;
      const branchWidth = narrow ? 156 : 244;
      const bodyWidth = narrow ? 300 : 360;
      const text = (x: number, y: number, value: string | number, size = 20, colour: string = ink) =>
        svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('font-size', size)
          .attr('fill', colour)
          .text(value);
      const box = (
        x: number,
        y: number,
        bw: number,
        bh: number,
        lines: (string | number)[],
        colour: string = ink,
        active = true,
      ) => {
        svg
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', bw)
          .attr('height', bh)
          .attr('rx', 8)
          .attr('fill', active ? pale : '#f7f8f6')
          .attr('stroke', active ? colour : muted)
          .attr('stroke-width', active ? 2 : 1.5)
          .attr('stroke-dasharray', active ? null : '5 4');
        const spacing = lines.length === 3 ? 28 : 30;
        const first = y + (bh - spacing * (lines.length - 1)) / 2 + 7;
        lines.forEach((line: string | number, i: number) =>
          text(x + bw / 2, first + i * spacing, line, i === 0 ? 21 : 18, active ? colour : muted),
        );
      };
      const arrow = (points: readonly (readonly number[])[], colour: string = ink, active = true) => {
        const last = points.length - 1;
        svg
          .append('path')
          .attr('d', points.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(''))
          .attr('stroke', active ? colour : muted)
          .attr('stroke-width', active ? 4 : 2)
          .attr('stroke-dasharray', active ? null : '5 5')
          .attr('fill', 'none');
        if (!active) return;
        const [x1, y1] = points[last - 1],
          [x2, y2] = points[last];
        const a = Math.atan2(y2 - y1, x2 - x1),
          s = 9;
        svg
          .append('path')
          .attr(
            'd',
            `M${x2 - s * Math.cos(a - 0.5)},${y2 - s * Math.sin(a - 0.5)}L${x2},${y2}L${x2 - s * Math.cos(a + 0.5)},${y2 - s * Math.sin(a + 0.5)}`,
          )
          .attr('fill', 'none')
          .attr('stroke', colour)
          .attr('stroke-width', 3);
      };
      const sourceY = 30,
        inletY = narrow ? 150 : 128;
      const blowerY = narrow ? 226 : 202,
        evaporatorY = narrow ? 318 : 292;
      const splitY = narrow ? 450 : 412,
        branchY = narrow ? 474 : 438;
      const mixY = narrow ? 584 : 548,
        outletY = narrow ? 668 : 630;
      const deliveryY = narrow ? 758 : 720;
      const fresh = state.source === 'fresh';
      const conditioned = state.ac ? cool : ink;
      const blended = state.heat ? warm : conditioned;
      text(c, 17, 'Solid = selected air path', 17);
      box(
        left - branchWidth / 2,
        sourceY,
        branchWidth,
        92,
        ['Fresh outside', 'Inlet → filter', fresh ? 'Selected' : 'Supply closed'],
        ink,
        fresh,
      );
      box(
        right - branchWidth / 2,
        sourceY,
        branchWidth,
        92,
        ['Cabin air', 'Recirculation', fresh ? 'Not selected' : 'Selected'],
        ink,
        !fresh,
      );
      arrow(
        [
          [left, sourceY + 92],
          [left, inletY + 26],
          [c - 75, inletY + 26],
        ],
        ink,
        fresh,
      );
      arrow(
        [
          [right, sourceY + 92],
          [right, inletY + 26],
          [c + 75, inletY + 26],
        ],
        ink,
        !fresh,
      );
      box(c - 75, inletY, 150, 52, ['Inlet flap']);
      arrow([
        [c, inletY + 52],
        [c, blowerY],
      ]);
      box(c - bodyWidth / 2, blowerY, bodyWidth, 66, ['Blower', 'Creates airflow']);
      arrow([
        [c, blowerY + 66],
        [c, evaporatorY],
      ]);
      box(
        c - bodyWidth / 2,
        evaporatorY,
        bodyWidth,
        104,
        ['Evaporator', m.evaporator, state.ac ? 'Drying needs condensation' : 'Air still passes through'],
        conditioned,
      );
      arrow(
        [
          [c, evaporatorY + 104],
          [c, splitY],
        ],
        conditioned,
      );
      arrow(
        [
          [c, splitY],
          [left, splitY],
          [left, branchY],
        ],
        conditioned,
      );
      arrow(
        [
          [c, splitY],
          [right, splitY],
          [right, branchY],
        ],
        warm,
        state.heat > 0,
      );
      box(
        left - branchWidth / 2,
        branchY,
        branchWidth,
        84,
        ['Bypass', 'Skips heater', state.heat === 2 ? 'Less air' : 'Selected'],
        conditioned,
      );
      box(
        right - branchWidth / 2,
        branchY,
        branchWidth,
        84,
        ['Heater core', state.heat ? 'Warm coolant*' : 'Route closed', state.heat ? 'adds heat' : 'No air here'],
        warm,
        state.heat > 0,
      );
      arrow(
        narrow
          ? [
              [left, branchY + 84],
              [left, mixY - 12],
              [c - 40, mixY - 12],
              [c - 40, mixY],
            ]
          : [
              [left, branchY + 84],
              [left, mixY + 29],
              [c - 85, mixY + 29],
            ],
        conditioned,
      );
      arrow(
        narrow
          ? [
              [right, branchY + 84],
              [right, mixY - 12],
              [c + 40, mixY - 12],
              [c + 40, mixY],
            ]
          : [
              [right, branchY + 84],
              [right, mixY + 29],
              [c + 85, mixY + 29],
            ],
        warm,
        state.heat > 0,
      );
      box(c - 85, mixY, 170, 58, ['Mixing / blend', state.heat ? m.heater : 'Bypass air only'], blended);
      arrow(
        [
          [c, mixY + 58],
          [c, outletY],
        ],
        blended,
      );
      box(c - 100, outletY, 200, 48, ['Outlet flaps'], blended);
      const destinations = narrow ? [60, 180, 300] : [110, 320, 530];
      const deliveryWidth = narrow ? 108 : 170;
      Object.entries(outletLabels)
        .map(([key, label], i) => ({ key, label, i }))
        .sort((a, b) => Number(a.key === state.outlet) - Number(b.key === state.outlet))
        .forEach(({ key, label, i }) => {
          const selected = state.outlet === key;
          arrow(
            [
              [c, outletY + 48],
              [c, deliveryY - 18],
              [destinations[i], deliveryY - 18],
              [destinations[i], deliveryY],
            ],
            blended,
            selected,
          );
          box(destinations[i] - deliveryWidth / 2, deliveryY, deliveryWidth, 56, [label], blended, selected);
        });
      text(c, narrow ? 840 : 806, 'One outlet group highlighted', 17);
      host.dataset.airSource = state.source;
      host.dataset.airOutlet = state.outlet;
      host.dataset.airHeat = String(state.heat);
      host.dataset.airAc = state.ac ? 'on' : 'off';
      const demisting =
        state.outlet === 'screen'
          ? `At the screen, airflow helps evaporate and carry away moisture. ${state.heat ? 'Heated air can warm the glass once coolant is warm. ' : 'This selection adds no heater heat. '}${state.ac ? 'Available A/C drying can help. ' : ''}`
          : '';
      explanation.textContent = `${state.source === 'fresh' ? 'Fresh outside air' : 'Recirculated cabin air'} goes through the blower and evaporator. ${state.ac ? 'A/C is enabled, but compressor-output limits can prevent cooling. If the evaporator is below the air’s dew point, water condenses and drains away. ' : 'A/C cooling is switched off; evaporator drying is unavailable in this selection. Air still crosses the evaporator. '}${state.heat ? 'Some air crosses the heater core and rejoins bypass air. Warm engine coolant supplies the heat; reheating does not put the drained moisture back into the air. ' : 'Air bypasses the heater core. '}${m.outlet} delivery is highlighted; the car also permits combined outlet delivery. ${demisting}${m.note}`;
    },
    signal,
  );
  const selectControl = (
    id: string,
    label: string | null,
    choices: string[][],
    value: string,
    change: {
      (value: string): void;
      (value: string): void;
      (value: string): void;
      (arg0: string): void;
    },
  ) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:grid;gap:4px;margin-bottom:12px;font-size:16px;';
    const caption = document.createElement('label');
    caption.htmlFor = id;
    caption.textContent = label;
    caption.style.fontWeight = '600';
    const select = document.createElement('select');
    select.id = id;
    select.style.cssText =
      'font:inherit;min-height:44px;width:100%;max-width:100%;background:#fff;color:#263e34;border:1px solid #a5b2aa;padding:6px;';
    for (const [key, text] of choices) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = text;
      select.append(option);
    }
    select.value = value;
    select.addEventListener(
      'change',
      () => {
        change(select.value);
        redraw();
      },
      { signal },
    );
    wrap.append(caption, select);
    controls.append(wrap);
    return select;
  };
  const sourceControl = selectControl(
    'cabin-air-source',
    'Air source',
    [
      ['fresh', 'Fresh outside air'],
      ['recirculate', 'Recirculate cabin air'],
    ],
    state.source,
    (value: string) => {
      state.source = value;
    },
  );
  const outletControl = selectControl(
    'cabin-air-outlet',
    'Air delivery',
    Object.entries(outletLabels),
    state.outlet,
    (value: string) => {
      state.outlet = value;
    },
  );
  const acControl = selectControl(
    'cabin-air-ac',
    'A/C selection',
    [
      ['on', 'Enabled: cooling / drying if available'],
      ['off', 'Switched off'],
    ],
    state.ac ? 'on' : 'off',
    (value: string) => {
      state.ac = value === 'on';
    },
  );
  const heatControl = slider(controls, {
    label: 'Heat added after evaporator',
    min: 0,
    max: 2,
    step: 1,
    value: state.heat,
    format: (v) => heatLabels[v],
    signal,
    onChange: (value) => {
      state.heat = value;
      redraw();
    },
  });
  heatControl.input.id = 'cabin-air-heat';
  heatControl.input.parentElement!.querySelector('label')!.htmlFor = 'cabin-air-heat';
  heatControl.input.parentElement!.querySelector('output')!.htmlFor = 'cabin-air-heat';
  buttons(
    controls,
    [
      {
        label: 'Demisting principle',
        action: () => {
          Object.assign(state, { source: 'fresh', outlet: 'screen', heat: 2, ac: true });
          sourceControl.value = state.source;
          outletControl.value = state.outlet;
          acControl.value = 'on';
          heatControl.set(2, false);
          redraw();
        },
      },
      {
        label: 'Cooling principle',
        action: () => {
          Object.assign(state, { source: 'fresh', outlet: 'face', heat: 0, ac: true });
          sourceControl.value = state.source;
          outletControl.value = state.outlet;
          acControl.value = 'on';
          heatControl.set(0, false);
          redraw();
        },
      },
    ],
    signal,
  );
  return () => {};
}
