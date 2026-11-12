import { createElement, type ReactNode } from 'react';
export { Diagram } from './Diagram';
export { BookImage, Figure } from './Figure';

export function Heading({ level, id, children }: { level: number; id: string; children: ReactNode }) {
  return createElement(`h${level}`, { id }, children);
}
export function SourceReference({
  note,
  reference,
  number,
  aliases = '',
}: {
  note: string;
  reference: string;
  number: string;
  aliases?: string;
}) {
  return (
    <a href={`#${note}`} id={reference} className="footnote-ref" role="doc-noteref">
      {aliases
        .split(' ')
        .filter(Boolean)
        .map((id) => (
          <span key={id} id={id} data-fragment-target={reference} aria-hidden="true" />
        ))}
      <sup>{number}</sup>
    </a>
  );
}
export function SourceNotes({ id, count, children }: { id: string; count: string; children: ReactNode }) {
  // Native disclosure state also covers keyboard toggles and fragment reveals.
  // The reader snapshots the actual DOM state synchronously before printing.
  return (
    <details id={id} className="chapter-notes">
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
