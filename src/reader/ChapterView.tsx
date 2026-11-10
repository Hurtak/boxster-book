import { createElement, memo, useMemo, type ReactNode } from 'react';
import type { MDXComponents } from 'mdx/types';
import type { Chapter } from '../book/types';
import { Diagram, Figure, Heading, SourceNotes, SourceReference } from '../book/components';

export const ChapterView = memo(function ChapterView({chapter,count,enhanced,active}: {chapter:Chapter;count:number;enhanced:boolean;active:boolean}) {
  const components = useMemo<MDXComponents>(()=>({
    Diagram, Figure, Heading, SourceNotes, SourceReference,
    ...Object.fromEntries([1,2,3,4,5,6].map(level=>[`h${level}`,({children,...props}:{children?:ReactNode})=> <>
      {createElement(`h${Math.min(6, level===1 ? (enhanced && active ? 1 : 2) : level+(enhanced ? 0 : 1))}`,props,children)}
      {level===1 && enhanced && <p className="chapter-meta">Chapter {chapter.number} of {count} · {chapter.planned ? 'Planned' : `${chapter.minutes} min read`}</p>}
    </>]))
  }),[active,enhanced,chapter,count]);
  return <section id={chapter.id} className={`level2${chapter.planned ? ' planned-chapter' : ''}`} hidden={enhanced && !active}>
    <chapter.Component components={components}/>
    {chapter.planned && enhanced && <p className="planned-message">This chapter is planned.</p>}
  </section>;
});
