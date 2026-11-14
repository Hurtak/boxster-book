import { createElement, type ReactNode } from 'react';
export { Diagram } from './Diagram';
export { BookImage, Figure } from './Figure';
export { AnnotatedFigure, ComparisonImage, ImageComparison } from './ImageFigures';
export { DimensionedFigure } from './DimensionedFigure';

export function Heading({ level, id, children }: { level: number; id: string; children: ReactNode }) {
  return createElement(`h${level}`, { id }, children);
}
export function SourceReference({ note, reference, number }: { note: string; reference: string; number: string }) {
  return (
    <a href={`#${note}`} id={reference} className="footnote-ref" role="doc-noteref">
      <sup>{number}</sup>
    </a>
  );
}
export function SourceNotes({ id, count, children }: { id: string; count: string; children: ReactNode }) {
  // Native disclosure state also covers keyboard toggles and fragment reveals.
  // The reader snapshots the actual DOM state synchronously before printing.
  return (
    // Fragment navigation may expand this native disclosure before hydration.
    // Its open state belongs to the browser, rather than React props.
    <details id={id} className="chapter-notes" suppressHydrationWarning>
      <summary>
        <h2>Notes and sources</h2>
        <span className="notes-count">
          {count} {count === '1' ? 'note' : 'notes'}
        </span>
      </summary>
      {children}
    </details>
  );
}
