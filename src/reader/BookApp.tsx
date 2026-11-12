import { createElement } from 'react';
import cover from '../../assets/book-cover.png';
import { Assets, ImageSizes } from '../book/context';
import { BookImage } from '../book/Figure';
import type { AssetMap, AssetSizes, Chapter } from '../book/types';
import { ChapterView } from './ChapterView';
import { ChapterNavigation, ContentsDialog, Pagination, sectionsFor } from './Navigation';
import { PrintBook } from './PrintBook';
import { ThemePicker } from './ThemePicker';
import { useReader } from './useReader';

export function BookApp({
  chapters,
  assets,
  assetSizes = {},
}: {
  chapters: Chapter[];
  assets: AssetMap;
  assetSizes?: AssetSizes;
}) {
  const reader = useReader(chapters),
    { active, enhanced } = reader;
  const drafted = chapters.filter((c) => !c.planned),
    first = drafted[0];
  const continued = chapters.find((c) => c.id === reader.place || c.headings.some((h) => h.id === reader.place));
  const navigation = (
    <ChapterNavigation
      chapters={chapters}
      active={active}
      section={reader.section}
      onNavigate={reader.navigateFromMenu}
    />
  );
  return (
    <Assets.Provider value={assets}>
      <ImageSizes.Provider value={assetSizes}>
        <a className="skip-link" href="#book">
          Skip to reading
        </a>
        <header className="viewer-bar" data-ui="">
          <a className="book-name" href="#title">
            Boxster 2.9 <span>2010 · 987.2</span>
          </a>
          <div className="reader-tools">
            <ThemePicker />
            <button
              className="contents-toggle enhanced-only"
              type="button"
              aria-haspopup="dialog"
              onClick={() => reader.setDialogOpen(true)}
            >
              Contents
            </button>
            <a className="static-contents" href="#contents">
              Contents
            </a>
          </div>
          <div className="reading-bar enhanced-only" aria-hidden="true">
            <span style={{ transform: `scaleX(${reader.progress})` }} />
          </div>
        </header>
        <div className="reader-layout">
          <aside id="contents" className="book-sidebar">
            <h2>Contents</h2>
            {navigation}
          </aside>
          <main id="book" tabIndex={-1}>
            <header id="title" className="book-cover" hidden={!!active}>
              {createElement(active ? 'h2' : 'h1', null, 'Porsche Boxster 2.9')}
              <p className="cover-subtitle">An illustrated guide to the 987.2</p>
              <figure className="cover-illustration">
                <BookImage
                  src={cover}
                  alt="Dark green Porsche Boxster with tan seats and the roof open, photographed from a low front three-quarter angle against a blue sky"
                  width={1440}
                />
              </figure>
              <div className="cover-intro">
                <p>
                  Understand the car, one system at a time. Start with the 2010 2.9-litre Boxster, then compare its
                  options, other model years and the S, Spyder and Black Edition.
                </p>
                <div className="cover-actions">
                  <a
                    className="start-reading"
                    href={first ? '#' + first.id : '#title'}
                    data-start-reading
                    hidden={!first}
                  >
                    Start reading <span aria-hidden="true">→</span>
                  </a>
                  <a
                    className="continue-reading"
                    href={'#' + reader.place}
                    data-continue-reading
                    hidden={!continued || (continued === first && reader.place === first.id)}
                  >
                    <span>Continue reading</span>
                    {continued && `Chapter ${continued.number}: ${continued.title}`}
                  </a>
                  <PrintBook />
                </div>
                <p className="manuscript-note" data-draft-status>
                  {enhanced
                    ? drafted.length === chapters.length
                      ? `All ${chapters.length} chapters drafted, with illustrations and source notes.`
                      : `${drafted.length} of ${chapters.length} chapters drafted. Other chapters are planned.`
                    : 'An illustrated draft with chapter source notes.'}
                </p>
              </div>
              <section className="cover-author" aria-labelledby="cover-author-title">
                <h2 id="cover-author-title">By Petr Hurtak</h2>
                <nav className="cover-author-links" aria-label="Author and project links">
                  <a href="https://petrhurtak.com/" rel="author">
                    Website
                  </a>
                  <a href="https://x.com/PetrHurtak" rel="me">
                    X
                  </a>
                  <a href="https://github.com/Hurtak/boxster-book">GitHub</a>
                </nav>
              </section>
              <section
                className="available-chapters enhanced-only"
                data-written-chapters
                hidden={!enhanced || !drafted.length}
              >
                <h2>{drafted.length === chapters.length ? 'Contents' : 'Available chapters'}</h2>
                <nav aria-label="Written chapters" onClick={reader.navigateFromMenu}>
                  <ol>
                    {drafted.map((c) => (
                      <li
                        key={c.id}
                        value={c.number}
                        style={{ '--chapter-number': `"${c.number}"` } as React.CSSProperties}
                      >
                        <a href={'#' + c.id}>{c.title}</a>
                        <span className="toc-time">{c.minutes} min</span>
                      </li>
                    ))}
                  </ol>
                </nav>
              </section>
            </header>
            {chapters.map((chapter) => (
              <ChapterView
                key={chapter.id}
                chapter={chapter}
                count={chapters.length}
                enhanced={enhanced}
                active={active === chapter}
              />
            ))}
            <Pagination chapters={chapters} active={active} />
          </main>
          <aside className="chapter-outline enhanced-only" aria-label="Reading guide" hidden={!active}>
            <h2>In this chapter</h2>
            <nav aria-label="Chapter sections" onClick={reader.navigateFromMenu}>
              {active &&
                sectionsFor(active).map((s) => (
                  <a key={s.id} href={'#' + s.id} aria-current={reader.section === s.id ? 'location' : undefined}>
                    {s.title}
                  </a>
                ))}
            </nav>
            <p className="reading-progress" aria-live="off">
              {Math.round(reader.progress * 100)}% of chapter
            </p>
          </aside>
        </div>
        <ContentsDialog open={reader.dialogOpen} onClose={() => reader.setDialogOpen(false)}>
          {navigation}
        </ContentsDialog>
      </ImageSizes.Provider>
    </Assets.Provider>
  );
}
