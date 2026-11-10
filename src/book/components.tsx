import { createElement, type ReactNode } from 'react';
export { Diagram } from './Diagram';
export { Figure, BookImage } from './Figure';

export function Heading({level,id,children}: {level:number;id:string;children:ReactNode}) {
  return createElement(`h${level}`, {id}, children);
}
export function SourceReference({note,number}: {note:string;number:string}) {
  return <a href={`#fn${note}`} id={`fnref${note}`} className="footnote-ref" role="doc-noteref"><sup>{number}</sup></a>;
}
export function SourceNotes({id,count,children}: {id:string;count:string;children:ReactNode}) {
  // Native disclosure state also covers keyboard toggles and fragment reveals.
  // The reader snapshots the actual DOM state synchronously before printing.
  return <details id={id} className="chapter-notes">
    <summary><h2>Notes and sources</h2><span className="notes-count">{count} {count === '1' ? 'note' : 'notes'}</span></summary>
    {children}
  </details>;
}
