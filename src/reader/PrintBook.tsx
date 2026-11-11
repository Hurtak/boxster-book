import { useRef, useState, type MouseEvent } from 'react';

export function PrintBook({ className = '', onPrepare }: { className?: string; onPrepare?: () => void }) {
  const pending = useRef(false);
  const [preparing, setPreparing] = useState(false),
    [failed, setFailed] = useState(false);
  const print = async (event: MouseEvent<HTMLButtonElement>) => {
    if (pending.current) return;
    pending.current = true;
    setPreparing(true);
    setFailed(false);
    const dialog = event.currentTarget.closest('dialog');
    if (dialog?.open) dialog.close();
    onPrepare?.();
    try {
      await document.fonts.ready;
      await Promise.all(
        [...document.querySelectorAll<HTMLImageElement>('#book img')].map((image) => image.decode().catch(() => {})),
      );
      window.print();
    } catch {
      setFailed(true);
    } finally {
      pending.current = false;
      setPreparing(false);
    }
  };
  return (
    <>
      <button
        type="button"
        className={`print-book enhanced-only ${className}`}
        aria-label="Print whole book"
        title="Print all chapters, illustrations and sources, or choose Save as PDF"
        disabled={preparing}
        aria-busy={preparing}
        onClick={(event) => {
          void print(event);
        }}
      >
        {preparing ? 'Preparing…' : 'Print whole book'}
      </button>
      {failed && (
        <p className="print-notice" role="status">
          Use your browser’s Print command to print the whole book or save it as a PDF.
        </p>
      )}
    </>
  );
}
