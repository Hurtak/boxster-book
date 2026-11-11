import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel, slider } from '../../../../interactive/ui.ts';

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { blocked: false, rain: 35 });
  state.blocked ??= false;
  // Keep this retained-state key; it denotes an illustrative amount, not rain rate.
  state.rain ??= 35;
  const { stage, controls, explanation } = panel(host, {
    title: 'A good seal still needs a working drain',
    description: 'Find the shaped side pan behind the seats, then compare a clear and blocked outlet.',
    note: 'Ordinary 2010 powered roof. The pan follows the visible factory-part profile; the enlarged section is explanatory. Water amounts, levels and the spill point are illustrative snapshots, not measured capacity, rainfall or hidden pipe routing. Filters were introduced on 31 August 2009; earlier cars may differ.',
  });
  stage.style.height = '740px';
  explanation.setAttribute('aria-live', 'polite');
  let row: HTMLDivElement;
  const redraw = svgDiagram(
    stage,
    'A formed side pan behind the seats, with filter and drain pipe; clear or blocked outlet',
    (svg, { width: w }) => {
      svg.selectAll('*').remove();
      const ink = '#263c34',
        blue = '#22779e',
        rust = '#a14f39',
        soft = '#81978b';
      const overflow = state.blocked && state.rain > 65;
      const outcome = !state.rain ? 'dry' : !state.blocked ? 'drained' : overflow ? 'overflow' : 'collecting';
      const messages = {
        dry: 'No water has been added. A dry pan alone does not show whether its drain is clear. The mesh filter sits over the opening and the pipe carries water away below it.',
        drained:
          'Runoff reaches the formed side pan on the wet side of the roof compartment. Water can pass through the filter and drain opening into the pipe. The arrow means discharge outside, without reconstructing the concealed route or a flow rate.',
        collecting:
          'In this example, debris blocks the opening beneath the filter and water stays in the pan. The seal is still intact: sealing the compartment joint and draining collected water are separate jobs. Filters reduce debris entering the pipe; the compartment still needs regular inspection and cleaning.',
        overflow:
          'With the opening blocked, this high-water snapshot shows a possible spill towards the interior. The spill is over the collection boundary, not through the intact upper seal. Its position and water level are explanatory, not a measured Boxster capacity.',
      };
      svg.append('title').text('Sealing and drainage do different jobs');
      svg.append('desc').text(messages[outcome]);
      const text = (
        x: number,
        y: number,
        lines: string | string[],
        { anchor = 'start', colour = ink, size = 16, weight = 400 } = {},
      ) => {
        const label = svg
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', anchor)
          .attr('font-size', size)
          .attr('font-weight', weight)
          .attr('fill', colour);
        for (const [i, line] of (typeof lines === 'string' ? [lines] : lines).entries())
          label
            .append('tspan')
            .attr('x', x)
            .attr('dy', i ? 19 : 0)
            .text(line);
        return label;
      };
      const path = (d: string, colour: string, sw = 2, fill = 'none') =>
        svg
          .append('path')
          .attr('d', d)
          .attr('fill', fill)
          .attr('stroke', colour)
          .attr('stroke-width', sw)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
      const arrow = (d: string, x: number, y: number, colour = blue, direction: readonly [number, number] = [0, 1]) => {
        const length = Math.hypot(...direction),
          dx = direction[0] / length,
          dy = direction[1] / length;
        path(d, colour, 3);
        path(
          `M${x - dx * 8 - dy * 5},${y - dy * 8 + dx * 5} L${x},${y} L${x - dx * 8 + dy * 5},${y - dy * 8 - dx * 5}`,
          colour,
          3,
        );
      };
      const wide = w >= 620;
      const panelW = wide ? (w - 48) / 2 : w - 24;
      const panTop = 219,
        panY = panTop + 22,
        panScale = Math.min(panelW / 430, 0.82),
        panWidth = 430 * panScale,
        panX = 12 + (panelW - panWidth) / 2,
        pipeLabelY = Math.max(panY + 249 * panScale, panY + 170 * panScale + 65),
        sectionTop = wide ? panTop : Math.max(432, pipeLabelY + 40);
      const sectionX = wide ? w / 2 + 12 : 12;
      stage.style.height = wide ? '535px' : `${sectionTop + 270}px`;

      text(12, 24, 'Behind the seats', { size: 18, weight: 600 });
      text(w - 12, 24, state.blocked ? 'Blocked outlet' : 'Clear outlet', {
        anchor: 'end',
        colour: state.blocked ? rust : blue,
        weight: 600,
      });
      // Both reference-guided shapes use one scale factor at every viewport.
      // Labels stay outside the scaled geometry at readable phone sizes.
      const carScale = Math.min((w - 24) / 440, 0.85),
        carWidth = 440 * carScale,
        cx = (w - carWidth) / 2,
        carY = 46;
      svg.append('g').attr('transform', `translate(${cx},${carY}) scale(${carScale})`).html(`
      <path d="M18 107 Q52 103 77 101 C96 97 102 64 128 49 C154 33 206 31 237 42 Q266 56 295 99 L411 110 L427 128 L14 128 Z" fill="#315d4d" stroke="#263c34" stroke-width="2"/>
      <path d="M77 101 C96 97 102 64 128 49 C154 33 206 31 237 42 Q266 56 295 99 L263 102 Q249 73 228 65 C203 53 169 54 151 65 Q133 78 131 104 Z" fill="#3e4641" stroke="#263c34" stroke-width="2"/>
      <path d="M141 102 Q144 76 163 67 C181 58 208 58 228 68 Q244 80 257 102 Z" fill="#c7d8d3" stroke="#8ba99e" stroke-width="1.5"/>
      <path d="M228 68 L260 101 L282 101 L244 53 Z" fill="#93b5af" opacity=".7"/>
      <path d="M191 100 V83 Q195 72 201 80 L206 102 M164 102 V83 Q168 73 172 83 V102" fill="#b6936a" stroke="#7f6b50" stroke-width="3"/>
      <path d="M21 106 Q57 102 83 103 L119 109" fill="none" stroke="#9fb3a5" stroke-width="4"/>
      <path d="M99 114 Q114 108 133 111 L159 116 L156 128 L118 131 L103 125 Z" fill="#e1c591" stroke="#9f743d" stroke-width="2"/>
      <path d="M88 102 L99 106" stroke="#b28049" stroke-width="6" stroke-linecap="round"/>
      <path d="M270 109 L273 125 M314 110 L312 127 M331 114 h27" fill="none" stroke="#182f27" stroke-width="1.5"/>
    `);
      text(cx + carWidth * 0.47, 55, 'Roof fabric', { anchor: 'middle', size: 15 });
      path(`M${cx + carWidth * 0.47},60 V${carY + 40 * carScale}`, soft, 1);
      text(cx + carWidth * 0.07, 75, 'Cover', { size: 15 });
      path(`M${cx + carWidth * 0.1},80 L${cx + 54.5 * carScale},${carY + 103.25 * carScale}`, soft, 1);
      text(cx + carWidth * 0.15, 174, 'Seal at joint', { size: 15 });
      path(`M${cx + carWidth * 0.23},158 L${cx + 94 * carScale},${carY + 104 * carScale}`, '#a67f4e', 1.5);
      text(cx + carWidth * 0.54, 174, 'Side pan below', { size: 15 });
      path(`M${cx + carWidth * 0.58},158 L${cx + 136 * carScale},${carY + 122 * carScale}`, '#9f743d', 1.5);
      text(12, 190, 'Upper-body crop', { size: 14 });
      text(w - 12, 190, 'Front →', { anchor: 'end', size: 14, weight: 600 });
      path(`M12,198 H${w - 12}`, '#c6d1c6', 1);

      text(12, panTop, 'The formed collection part', { weight: 600, size: 18 });
      // PET 812-000 item 12 and a direct photograph of 987 561 805 01:
      // asymmetric scallops, shallow bowl, mounting apertures and rising wing.
      const pan = svg.append('g').attr('transform', `translate(${panX},${panY}) scale(${panScale})`);
      pan.html(`
      <path d="M20 119 Q15 87 36 79 L55 79 Q61 92 85 90 L94 76 L145 73 Q164 69 174 57 Q208 53 235 60 L239 79 Q249 78 250 60 Q285 58 302 44 Q316 30 321 14 Q345 23 367 15 L381 32 Q367 48 370 61 Q394 85 405 65 Q415 48 418 57 L416 106 Q405 133 375 141 L330 143 Q308 138 296 148 L272 165 Q235 180 206 165 L185 160 Q153 157 141 148 L67 142 Q40 136 30 127 Z" fill="#46534c" stroke="#263c34" stroke-width="3"/>
      <path d="M29 118 L49 103 Q62 111 88 107 L104 93 L151 90 L182 105 L199 134 L237 139 L270 126 Q301 110 318 83 L343 43 L369 38 M91 109 L104 133 M153 92 L161 139 M277 129 Q331 134 392 96" fill="none" stroke="#8d9b90" stroke-width="2"/>
      <path d="M39 124 Q106 151 172 146 L205 156 Q235 171 265 156 L293 141 Q326 132 373 135" fill="none" stroke="#1f322a" stroke-width="5"/>
      <ellipse cx="107" cy="83" rx="5" ry="3" fill="#e5e9df"/><ellipse cx="158" cy="83" rx="5" ry="3" fill="#e5e9df"/>
      <path d="M219 119 L250 99 Q258 98 264 107 L263 120 L230 140 L218 133 Z" fill="#b3c1ad" stroke="#233e32" stroke-width="2"/>
      <path d="M239 164 L239 179 Q239 185 244 186 L239 209 Q231 232 232 249" stroke="#253d31" stroke-width="12" fill="none"/>
      <path d="M239 164 L239 179 Q239 185 244 186 L239 209 Q231 232 232 249" stroke="#a3b0a0" stroke-width="7" fill="none"/>
      <path d="M224 237 l16 6 m-16 0 l16 6" stroke="#f3f5f0" stroke-width="3" fill="none"/>
    `);
      // TI 29/09 Figure 1 shows a broad mesh filter over the drain opening.
      for (let i = 0; i < 7; i++)
        pan
          .append('path')
          .attr('d', `M${221 + i * 5} ${121 - i * 3} l8 9`)
          .attr('stroke', '#3f5b49')
          .attr('stroke-width', 1.2);
      for (let i = 0; i < 4; i++)
        pan
          .append('path')
          .attr('d', `M${220 + i * 2} ${121 + i * 4} l35 -21`)
          .attr('stroke', '#3f5b49')
          .attr('stroke-width', 1.2);
      text(panX, panY + 22, 'Raised wing', { size: 15 });
      path(`M${panX + 96},${panY + 17} L${panX + 322 * panScale},${panY + 23 * panScale}`, soft, 1);
      text(panX, panY + 170 * panScale + 35, 'Shaped rim', { size: 15 });
      path(
        `M${panX + 100 * panScale},${panY + 170 * panScale + 15} L${panX + 100 * panScale},${panY + 140 * panScale}`,
        soft,
        1,
      );
      text(panX + 275 * panScale, panY + 170 * panScale + 22, ['Mesh filter', 'over opening'], { size: 15 });
      path(
        `M${panX + 280 * panScale},${panY + 170 * panScale + 4} L${panX + 242 * panScale},${panY + 125 * panScale}`,
        soft,
        1,
      );
      text(panX + 275 * panScale, pipeLabelY, 'Drain pipe', { size: 15 });
      path(`M${panX + 268 * panScale},${pipeLabelY - 6} L${panX + 233 * panScale},${panY + 236 * panScale}`, soft, 1);

      text(sectionX, sectionTop, 'Enlarged outlet section', { weight: 600, size: 18 });
      const sx = sectionX,
        sy = sectionTop + 31,
        sw = panelW;
      const lip = sx + sw * 0.73,
        outlet = sx + sw * 0.4;
      text(sx, sy + 5, 'Wet side', { colour: blue, size: 15 });
      text(sx + sw, sy + 5, 'Interior', { anchor: 'end', colour: rust, size: 15 });
      path(`M${lip + 12},${sy + 31} V${sy + 176}`, '#c9c4b4', 1.5).attr('stroke-dasharray', '3 5');
      const floor = `M${sx + 8},${sy + 62} Q${sx + 20},${sy + 116} ${sx + 48},${sy + 122} H${outlet - 9} M${outlet + 9},${sy + 122} L${lip - 31},${sy + 116} Q${lip - 10},${sy + 108} ${lip},${sy + 64}`;
      const waterY = sy + (state.blocked ? 122 - Math.min(state.rain / 65, 1) * 58 : 115);
      const clip = svg.append('defs').append('clipPath').attr('id', `pan-water-${w}`);
      clip
        .append('path')
        .attr(
          'd',
          `M${sx + 8},${sy + 60} Q${sx + 20},${sy + 116} ${sx + 48},${sy + 122} H${outlet - 9} V${sy + 134} H${outlet + 9} V${sy + 122} L${lip - 31},${sy + 116} Q${lip - 10},${sy + 108} ${lip},${sy + 60} Z`,
        );
      if (state.rain)
        svg
          .append('rect')
          .attr('x', sx)
          .attr('y', waterY)
          .attr('width', sw)
          .attr('height', sy + 136 - waterY)
          .attr('fill', '#78b6d1')
          .attr('opacity', 0.65)
          .attr('clip-path', `url(#pan-water-${w})`);
      path(floor, '#41584a', 5);
      path(
        `M${outlet - 9},${sy + 122} V${sy + 146} Q${outlet - 9},${sy + 154} ${outlet - 14},${sy + 164} M${outlet + 9},${sy + 122} V${sy + 146} Q${outlet + 9},${sy + 154} ${outlet + 4},${sy + 164}`,
        '#41584a',
        3,
      );
      path(`M${outlet - 23},${sy + 110} Q${outlet},${sy + 101} ${outlet + 23},${sy + 110}`, '#58764c', 5);
      for (let i = -2; i <= 2; i++) path(`M${outlet + i * 8},${sy + 105} v8`, '#274734', 1.5);
      if (state.rain) arrow(`M${sx + 46},${sy + 29} V${sy + 73}`, sx + 46, sy + 73);
      if (state.blocked) {
        path(`M${outlet - 8},${sy + 118} l16,12 m-16,0 l16,-12`, rust, 3.5);
        svg
          .append('ellipse')
          .attr('cx', outlet - 5)
          .attr('cy', sy + 118)
          .attr('rx', 6)
          .attr('ry', 3)
          .attr('fill', '#af814d');
      } else if (state.rain)
        arrow(
          `M${outlet},${sy + 112} V${sy + 146} Q${outlet},${sy + 162} ${outlet - 5},${sy + 178}`,
          outlet - 5,
          sy + 178,
          blue,
          [-5, 16],
        );
      if (overflow)
        arrow(
          `M${lip - 13},${sy + 64} H${lip + 18} Q${lip + 32},${sy + 64} ${lip + 32},${sy + 83} V${sy + 127}`,
          lip + 32,
          sy + 127,
          rust,
        );
      text(sx + sw, sy + 153, state.blocked ? ['Debris blocks', 'the opening'] : ['Through filter', 'and opening'], {
        anchor: 'end',
        size: 15,
      });
      path(
        `M${sx + sw * 0.65},${sy + 147} L${outlet + (state.blocked ? 0 : 16)},${sy + (state.blocked ? 124 : 108)}`,
        soft,
        1,
      );
      text(
        sx + 3,
        sy + 202,
        outcome === 'dry'
          ? 'No water added'
          : outcome === 'drained'
            ? 'Discharge outside'
            : overflow
              ? 'Possible interior spill'
              : 'Water retained',
        { colour: outcome === 'overflow' ? rust : blue, weight: 600 },
      );
      text(sx, sy + 225, 'Levels and section depth illustrative', { size: 14 });
      explanation.textContent = messages[outcome];
      host.dataset.drainState = state.blocked ? 'blocked' : 'clear';
      host.dataset.waterOutcome = outcome;
      host.dataset.rainInput = String(state.rain);
      if (row) [...row.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === Number(state.blocked))));
    },
    signal,
  );
  row = buttons(
    controls,
    [
      {
        label: 'Clear drain',
        action: () => {
          state.blocked = false;
          redraw();
        },
      },
      {
        label: 'Blocked drain',
        action: () => {
          state.blocked = true;
          redraw();
        },
      },
    ],
    signal,
  );
  slider(controls, {
    label: 'Illustrative water added',
    min: 0,
    max: 100,
    step: 1,
    value: state.rain,
    format: (v) => (v === 0 ? 'None' : v <= 35 ? 'Low' : v <= 65 ? 'Medium' : 'High'),
    signal,
    onChange: (value) => {
      state.rain = value;
      redraw();
    },
  });
  redraw();
  return () => {};
}
