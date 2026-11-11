import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Chapter } from '../book/types';

export function useReader(chapters: Chapter[]) {
  const [enhanced,setEnhanced] = useState(false), [activeId,setActiveId] = useState<string|null>(null);
  const [section,setSection] = useState(''), [progress,setProgress] = useState(0), [place,setPlace] = useState('');
  const [size,setSize] = useState<number>();
  const [dialogOpen,setDialogOpen] = useState(false);
  const [route,setRoute] = useState(0);
  const initial = useRef(true), currentId = useRef<string|null>(null);
  const active = chapters.find(c => c.id === activeId);
  const destination = useRef('');

  useLayoutEffect(() => {
    const locationChanged = () => {
      let id = ''; try { id = decodeURIComponent(location.hash.slice(1)); } catch { /* malformed fragment */ }
      destination.current = id;
      const owner = document.getElementById(id)?.closest('section.level2')?.id;
      const next=id==='book'?currentId.current:chapters.some(c=>c.id===owner)?owner!:null;
      if(next!==currentId.current || !document.documentElement.classList.contains('reader-enhanced'))document.documentElement.dataset.readerPending='true';
      currentId.current=next;
      setActiveId(currentId.current); setDialogOpen(false); setEnhanced(true);
      setRoute(value=>value+1);
    };
    try {
      setPlace(localStorage.getItem('boxster-reading-place') ?? '');
      const value = Number(localStorage.getItem('boxster-reading-size'));
      setSize(value >= 17 && value <= 24 ? value : parseFloat(getComputedStyle(document.body).fontSize));
    } catch { setSize(parseFloat(getComputedStyle(document.body).fontSize)); }
    addEventListener('hashchange', locationChanged); locationChanged();
    return () => removeEventListener('hashchange', locationChanged);
  }, [chapters]);

  // Settle fonts and lightweight panel layouts before the final anchor scroll.
  // The reading sheet stays hidden until then; superseded routes cannot scroll
  // after the reader has started interacting with the next chapter.
  useLayoutEffect(()=>{
    if(!enhanced)return;
    let cancelled=false;
    const id=destination.current,target=document.getElementById(id);
    for(let node=target?.closest('details');node;node=node.parentElement?.closest('details'))node.open=true;
    const owner=target?.closest('section.level2');
    const diagrams=[...document.querySelectorAll<HTMLElement>('#book > section.level2:not([hidden]) [data-diagram]')];
    document.querySelectorAll('#book > section.level2[hidden] [data-diagram]').forEach(node=>node.dispatchEvent(new Event('diagram-suspend')));
    const preparing=document.documentElement.hasAttribute('data-reader-pending');
    if(preparing)diagrams.forEach(node=>node.dispatchEvent(new Event('diagram-prepare')));
    const settle=async()=>{
      await document.fonts.ready;
      while(!cancelled && preparing && diagrams.some(node=>node.dataset.layoutReady!=='true'))await new Promise(requestAnimationFrame);
      if(cancelled)return;
      let focus:Element|null|undefined;
      if(owner&&target){
        focus=target===owner?owner.firstElementChild:target.matches('details')?target.firstElementChild:target;
        focus?.scrollIntoView({block:'start'});
      }else if(!id||id==='title'){
        scrollTo(0,0);
        if(!initial.current)focus=document.querySelector('#title>:first-child');
      }else if(id==='book')focus=document.getElementById('book');
      delete document.documentElement.dataset.readerPending;
      if(focus instanceof HTMLElement){if(focus.tagName!=='SUMMARY')focus.tabIndex=-1;focus.focus({preventScroll:true});}
      initial.current=false;
    };
    void settle();
    return ()=>{cancelled=true;};
  },[route,enhanced]);

  useLayoutEffect(() => {
    if (!enhanced) return;
    document.documentElement.classList.add('reader-enhanced');
    document.documentElement.dataset.view = active ? 'chapter' : 'cover';
    document.title = active ? `${active.title} — Porsche Boxster 2.9` : 'Porsche Boxster 2.9';
    const sidebar = document.querySelector('.book-sidebar'), link = sidebar?.querySelector<HTMLElement>('[aria-current="page"]');
    if (sidebar instanceof HTMLElement && link && sidebar.clientHeight) {
      const box = sidebar.getBoundingClientRect(), row = link.parentElement!;
      const heading = sidebar.querySelector('h2')?.offsetHeight ?? 0, bounds = link.getBoundingClientRect();
      if (bounds.top < box.top+heading || bounds.bottom > box.bottom) sidebar.scrollTop += (row.previousElementSibling ?? row).getBoundingClientRect().top-box.top-heading;
    }
  }, [enhanced, active]);

  useLayoutEffect(() => {
    if (size !== undefined) document.documentElement.style.setProperty('--reading-size',`${size}px`);
  }, [size]);
  const changeSize = (delta: number) => {
    const value = Math.max(17,Math.min(24,(size ?? 20)+delta)); setSize(value);
    try { localStorage.setItem('boxster-reading-size',String(value)); } catch { /* optional preference */ }
  };

  useEffect(() => {
    if (!enhanced || !active) return;
    const chapter = document.getElementById(active.id)!;
    let scheduled = 0;
    const update = () => {
      scheduled=0;
      const box = chapter.getBoundingClientRect();
      setProgress(Math.max(0,Math.min(1,(96-box.top)/Math.max(1,box.height-innerHeight+96))));
      const sections = [...chapter.querySelectorAll<HTMLElement>(':scope > .level3, :scope > .chapter-notes')];
      let current = sections[0], passed: HTMLElement|undefined;
      for (const node of sections) { if (node.getBoundingClientRect().top >= 160) continue; current=node; if (!node.matches('details')) passed=node; }
      setSection(current?.id ?? '');
      const id = passed?.id ?? active.id;
      setPlace(id);
      try { localStorage.setItem('boxster-reading-place',id); } catch { /* optional preference */ }
    };
    const schedule = () => { if (!scheduled) scheduled=requestAnimationFrame(update); };
    addEventListener('scroll',schedule,{passive:true}); addEventListener('resize',schedule);
    chapter.addEventListener('toggle',schedule,true); schedule();
    return () => { cancelAnimationFrame(scheduled); removeEventListener('scroll',schedule); removeEventListener('resize',schedule); chapter.removeEventListener('toggle',schedule,true); };
  }, [active,enhanced]);

  useEffect(() => {
    const media = matchMedia('print');
    let saved: [HTMLDetailsElement,boolean][]|null = null;
    let title='';
    const change = (value: boolean) => {
      if (value && !saved) {
        title=document.title;document.title='Porsche Boxster 2.9 — Complete book';
        saved=[...document.querySelectorAll<HTMLDetailsElement>('details.chapter-notes, details.technical-detail')].map(e=>[e,e.open]);
        saved.forEach(([e])=>{e.open=true;});
      } else if (!value && saved) { saved.forEach(([e,open])=>{e.open=open;}); saved=null;document.title=title; }
    };
    const before=()=>change(true),after=()=>change(false),event=(e:MediaQueryListEvent)=>change(e.matches);
    addEventListener('beforeprint',before);addEventListener('afterprint',after);media.addEventListener('change',event);change(media.matches);
    return () => { removeEventListener('beforeprint',before);removeEventListener('afterprint',after);media.removeEventListener('change',event);if(saved){saved.forEach(([e,open])=>{e.open=open;});document.title=title;} };
  }, []);
  return {enhanced,active,section,progress,place,size,changeSize,dialogOpen,setDialogOpen};
}
