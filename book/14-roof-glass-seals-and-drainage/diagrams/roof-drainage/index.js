import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

export function mount(host, { state, signal }) {
  state.blocked ??= false;
  state.rain ??= 35;
  const { stage, controls, explanation } = panel(host, {
    title: 'A good seal still needs a working drain',
    description: 'Keep the seal intact, then compare a clear outlet with a blocked one as water is added.',
    note: 'Conceptual section through one side of the ordinary roof compartment. Water levels and the overflow threshold are illustrative, not measured capacities, rainfall rates or a map of the concealed hoses.',
  });
  explanation.setAttribute('aria-live', 'polite');
  let row;
  const redraw = svgDiagram(stage, 'Water entering a roof drip pan with a clear or blocked drain', (svg, { width: w, height: h }) => {
    svg.selectAll('*').remove();
    const x = w*.20, y = h*.40, panW = w*.53, bottom = h*.70;
    const text = (xx, yy, value, anchor = 'middle') => svg.append('text').attr('x', xx).attr('y', yy).attr('text-anchor', anchor).attr('font-size',14).attr('fill','#263c34').text(value);
    const path = (d, colour, sw, fill = 'none') => svg.append('path').attr('d',d).attr('fill',fill).attr('stroke',colour).attr('stroke-width',sw).attr('stroke-linecap','round').attr('stroke-linejoin','round');
    text(w/2, 22, state.blocked ? 'Outlet blocked' : 'Outlet clear');
    path(`M${w*.1},${y-39} Q${w*.35},${y-65} ${w*.55},${y-35}`, '#315d4d',10);
    text(w*.32,y-71,'Roof edge');
    svg.append('rect').attr('x',w*.56).attr('y',y-47).attr('width',w*.15).attr('height',12).attr('rx',5).attr('fill','#b28049');
    text(w*.70,y-56,'Seal intact');
    path(`M${x},${y} V${bottom} H${x+panW} V${y}`, '#455b50',4);
    const waterDepth = state.blocked ? Math.min(state.rain / 65,1)*(bottom-y-5) : state.rain > 0 ? 9 : 0;
    svg.append('rect').attr('x',x+3).attr('y',bottom-waterDepth).attr('width',panW-6).attr('height',waterDepth).attr('fill','#7fb8d0').attr('opacity',.75);
    const drainX = x+panW*.35;
    path(`M${drainX},${bottom} V${h-31}`, '#7f9890',14);
    if (state.rain > 0) {
      for (let i=0;i<3;i++) path(`M${w*(.25+i*.1)},${y-20} l-3,17`, '#22779e',3);
      if (!state.blocked) path(`M${drainX},${bottom-3} V${h-33} m-5,-6 l5,6 l5,-6`, '#22779e',4);
    }
    if (state.blocked) {
      path(`M${drainX-9},${bottom+11} l18,10 m-18,0 l18,-10`, '#a14f39',4);
      text(w*.76,bottom+26,'Debris');
    }
    const overflow = state.blocked && state.rain > 65;
    if (overflow) {
      path(`M${x+panW-12},${y+7} h25 v${bottom-y+20} m-5,-7 l5,7 l5,-7`, '#a14f39',4);
      text(w*.83,y+56,'Overflow');
    }
    text(x+panW/2,bottom-13,'Drip pan');
    text(w*.32,h-9,state.blocked ? 'Outlet obstructed' : 'Water leaves the body');
    const outcome = !state.rain ? 'dry' : !state.blocked ? 'drained' : overflow ? 'overflow' : 'collecting';
    const messages = {
      dry: 'No water has been added. A dry compartment alone does not show whether its drain is clear.',
      drained: 'Water reaching the drip pan can leave through the drain. The seal and the drainage route perform different jobs.',
      collecting: 'The seal is still intact, but water accumulates behind the blocked outlet. The compartment has lost its intended escape route.',
      overflow: 'With more water added, the illustrated pan overflows. Water can enter the interior without a tear in the roof fabric or a failed upper seal.',
    };
    explanation.textContent = messages[outcome];
    host.dataset.drainState = state.blocked ? 'blocked' : 'clear';
    host.dataset.waterOutcome = outcome;
    host.dataset.rainInput = String(state.rain);
    if(row) [...row.children].forEach((b,i) => b.setAttribute('aria-pressed',String(i === Number(state.blocked))));
  }, signal);
  row = buttons(controls, [
    {label:'Clear drain', action: () => { state.blocked = false; redraw(); }},
    {label:'Blocked drain', action: () => { state.blocked = true; redraw(); }},
  ], signal);
  slider(controls, {label:'Illustrative rain input', min:0,max:100,step:1,value:state.rain,format:v => v === 0 ? 'None' : v <= 35 ? 'Low' : v <=65 ? 'Moderate' : 'High',signal,onChange:value => {state.rain=value;redraw();}});
  redraw();
  return () => {};
}
