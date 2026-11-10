import { useContext, useEffect, useRef, useState } from 'react';
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
  useEffect(() => {
    const element = outer.current!, view = host.current!;
    let controller: AbortController | undefined, cleanup: (() => void) | undefined;
    let disposed = false, failed = false, ready = false;
    const release = () => {
      if (ready) {
        const height = element.getBoundingClientRect().height;
        if (height > 0) {
          // Reserve synchronously before imperative children are removed. Waiting
          // for React's next commit lets scroll anchoring move the reading page.
          element.style.setProperty('--diagram-reserved-height',`${height}px`);
          element.classList.add('diagram-suspended');
          setReserved(height); setStatus('suspended');
        } else {
          // A navigation-hidden chapter has no measured placeholder. Its static
          // fallback must become visible when the chapter is selected again.
          setReserved(undefined); setStatus('static');
        }
      }
      ready = false;
      controller?.abort(); controller = undefined;
      cleanup?.(); cleanup = undefined;
      view.replaceChildren();
    };
    const activate = async () => {
      if (controller || failed || disposed) return;
      const operation = new AbortController(); controller = operation;
      setStatus('loading');
      try {
        const load = registry[id];
        if (!load) throw Error(`Unknown diagram: ${id}`);
        const module = await load();
        if (operation.signal.aborted) return;
        const dispose = await module.mount(view, {state:state.current,signal:operation.signal});
        if (operation.signal.aborted) { dispose?.(); return; }
        cleanup = dispose || undefined; ready = true;
        setStatus('ready'); setReserved(undefined);
      } catch (error) {
        if (operation.signal.aborted) return;
        console.error(`Diagram ${id}:`, error);
        release(); failed = true; setReserved(undefined); setStatus('failed');
      }
    };
    retry.current = () => { failed = false; void activate(); };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) void activate();
        else release();
      }
    }, {rootMargin:'200px'});
    observer.observe(element);
    const pagehide = (event: PageTransitionEvent) => { if (!event.persisted) { observer.disconnect(); release(); } };
    addEventListener('pagehide', pagehide);
    return () => { disposed = true; observer.disconnect(); removeEventListener('pagehide', pagehide); release(); };
  }, [id, registry]);
  return <div ref={outer} data-diagram={id} data-ui=""
    className={`book-diagram${status === 'ready' ? ' diagram-ready' : status === 'suspended' || reserved !== undefined ? ' diagram-suspended' : ''}`}
    style={reserved ? {'--diagram-reserved-height':`${reserved}px`} as React.CSSProperties : undefined}>
    {status === 'failed' && <p className="diagram-notice">The interactive view is unavailable. The static diagram is shown below. <button type="button" onClick={() => retry.current()}>Try again</button></p>}
    <Figure src={poster} alt={alt} className="diagram-static" hidden={status === 'ready'}>{alt}</Figure>
    <div ref={host} className="diagram-interactive" />
  </div>;
}
