import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { Diagrams } from './context';
import { Figure } from './Figure';

export interface DiagramProps { id: string; poster: string; alt: string }
export function Diagram({ id, poster, alt }: DiagramProps) {
  const registry = useContext(Diagrams);
  const outer = useRef<HTMLDivElement>(null), host = useRef<HTMLDivElement>(null);
  const state = useRef<Record<string, unknown>>({});
  const retry = useRef<() => void>(() => {});
  const [status, setStatus] = useState<'static'|'loading'|'ready'|'suspended'|'failed'>('static');
  const [reserved, setReserved] = useState<number>();
  useLayoutEffect(() => {
    const element = outer.current!, view = host.current!;
    let controller: AbortController | undefined, cleanup: (() => void) | undefined;
    let disposed = false, failed = false, ready = false, visible = false, started = false;
    let wake: (()=>void)|undefined, measuredHeight=0, measuredWidth=0;
    const measure = () => {
      if(!view.childElementCount || !element.getBoundingClientRect().width)return;
      const box=view.getBoundingClientRect();
      if(!box.height)return;
      measuredHeight=Math.abs(box.width-measuredWidth)>1?box.height:Math.max(measuredHeight,box.height);
      measuredWidth=box.width;
      element.style.setProperty('--diagram-reserved-height',`${measuredHeight}px`);
      element.dataset.layoutReady='true';
      setReserved(measuredHeight);
    };
    const release = () => {
      if (controller || ready) {
        measure();
        if (measuredHeight > 0) {
          // Reserve synchronously before imperative children are removed. Waiting
          // for React's next commit lets scroll anchoring move the reading page.
          element.style.setProperty('--diagram-reserved-height',`${measuredHeight}px`);
          element.classList.add('diagram-suspended');
          setReserved(measuredHeight); setStatus('suspended');
        } else {
          // An unprepared figure keeps its static fallback until layout is known.
          setStatus('static');
        }
      }
      ready = false;
      controller?.abort(); controller = undefined;
      wake?.(); wake=undefined; started=false;
      cleanup?.(); cleanup = undefined;
      view.replaceChildren();
    };
    const activate = async () => {
      if (controller || failed || disposed) return;
      const operation = new AbortController(); controller = operation;
      delete element.dataset.layoutReady;
      const whenVisible=new Promise<void>(resolve=>{wake=resolve;if(visible){started=true;resolve();}});
      setStatus('loading');
      try {
        const load = registry[id];
        if (!load) throw Error(`Unknown diagram: ${id}`);
        const module = await load();
        if (operation.signal.aborted) return;
        view.replaceChildren();
        const dispose = await module.mount(view, {state:state.current,signal:operation.signal,whenVisible});
        if (operation.signal.aborted) { dispose?.(); return; }
        cleanup = dispose || undefined; ready = true;
        measure(); setStatus('ready');
      } catch (error) {
        if (operation.signal.aborted) return;
        console.error(`Diagram ${id}:`, error);
        release(); failed = true; element.dataset.layoutReady='true'; setStatus('failed');
      }
    };
    retry.current = () => { failed = false; void activate(); };
    const prepare=()=>{void activate();};
    const resize=new ResizeObserver(measure);
    resize.observe(view);
    view.addEventListener('diagram-layout',measure);
    element.addEventListener('diagram-prepare',prepare);
    element.addEventListener('diagram-suspend',release);
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        visible=entry.isIntersecting;
        if (visible) { started=true; wake?.(); void activate(); }
        else if(ready || started)release();
      }
    }, {rootMargin:'200px'});
    observer.observe(element);
    const pagehide = (event: PageTransitionEvent) => { if (!event.persisted) { observer.disconnect(); release(); } };
    addEventListener('pagehide', pagehide);
    return () => { disposed = true; observer.disconnect(); resize.disconnect(); element.removeEventListener('diagram-prepare',prepare); element.removeEventListener('diagram-suspend',release); view.removeEventListener('diagram-layout',measure); removeEventListener('pagehide', pagehide); release(); };
  }, [id, registry]);
  return <div ref={outer} data-diagram={id} data-ui="" data-diagram-status={status} aria-busy={status==='loading'}
    className={`book-diagram${status === 'ready' ? ' diagram-ready' : status !== 'failed' && (status === 'suspended' || reserved !== undefined) ? ' diagram-suspended' : ''}`}
    style={reserved ? {'--diagram-reserved-height':`${reserved}px`} as React.CSSProperties : undefined}>
    {status === 'failed' && <p className="diagram-notice">The interactive view is unavailable. The static diagram is shown below. <button type="button" onClick={() => retry.current()}>Try again</button></p>}
    <Figure src={poster} alt={alt} className="diagram-static" hidden={status === 'ready'}>{alt}</Figure>
    <span className="diagram-loading" role="status" aria-label={`Loading interactive diagram. ${alt}`} />
    <div ref={host} className="diagram-interactive" />
  </div>;
}
