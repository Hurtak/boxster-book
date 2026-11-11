import { select } from 'd3';
import type { SvgDraw } from './types';

export function svgDiagram(host: HTMLElement, title: string, draw: SvgDraw, signal: AbortSignal) {
  const svg = select(host)
    .append('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('font-family', "'Source Sans 3', sans-serif")
    .attr('role', 'img')
    .attr('aria-label', title);
  const redraw = () => {
    const width = Math.max(280, host.clientWidth);
    const height = Math.max(280, host.clientHeight);
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);
    draw(svg, { width, height });
  };
  const observer = new ResizeObserver(redraw);
  observer.observe(host);
  signal.addEventListener('abort', () => observer.disconnect(), { once: true });
  redraw();
  return redraw;
}
