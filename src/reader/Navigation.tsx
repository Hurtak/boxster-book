import { useEffect, useRef } from 'react';
import type { Chapter } from '../book/types';
import { PrintBook } from './PrintBook';

export function sectionsFor(chapter: Chapter) {
  return [...chapter.headings.filter(h=>h.depth===2),...(chapter.noteCount ? [{id:chapter.id+'--notes',title:'Notes and sources',depth:2}] : [])];
}
export function ChapterNavigation({chapters,active,section}: {chapters:Chapter[];active?:Chapter;section:string}) {
  return <nav aria-label="Book chapters"><ul>{chapters.map(chapter=><li key={chapter.id}>
    <a href={'#'+chapter.id} aria-current={chapter===active ? 'page' : undefined}>{chapter.title}</a>
    {chapter===active && <ul className="chapter-sections">{sectionsFor(chapter).map(item=><li key={item.id}>
      <a href={'#'+item.id} aria-current={section===item.id ? 'location' : undefined}>{item.title}</a>
    </li>)}</ul>}
  </li>)}</ul></nav>;
}
export function ContentsDialog({children,open,onClose}: {children:React.ReactNode;open:boolean;onClose:()=>void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    if(open && !dialog.current!.open){dialog.current!.showModal();dialog.current!.querySelector('[aria-current="page"]')?.scrollIntoView({block:'center'});}
    else if(!open && dialog.current!.open)dialog.current!.close();
  },[open]);
  return <dialog ref={dialog} className="contents-dialog" aria-labelledby="dialog-title" data-ui="" onClose={onClose}
    onClick={e=>{if((e.target as HTMLElement).closest('a') || (e.target===e.currentTarget && e.clientX<e.currentTarget.getBoundingClientRect().left))onClose();}}>
    <div className="dialog-header"><h2 id="dialog-title">Contents</h2><button type="button" data-close-contents onClick={onClose}>Close</button></div>
    <PrintBook className="print-dialog" onPrepare={onClose}/>
    <div className="dialog-navigation">{children}</div><p className="edition-note">Europe &amp; UK · 2010 2.9-litre baseline</p>
  </dialog>;
}
export function Pagination({chapters,active}: {chapters:Chapter[];active?:Chapter}) {
  const index=active ? chapters.indexOf(active) : -1;
  return <nav className="chapter-pagination enhanced-only" aria-label="Adjacent chapters" hidden={!active}>
    {active && [-1,1].map(delta=>{
      const target=chapters[index+delta];return <a key={delta} className={delta<0 ? 'previous' : 'next'} href={target ? '#'+target.id : '#title'}>
        <span>{delta<0 ? '← ' : ''}{target ? `Chapter ${target.number}` : 'Cover'}{delta>0 ? ' →' : ''}</span>{target?.title ?? 'Porsche Boxster 2.9'}
      </a>;
    })}
  </nav>;
}
