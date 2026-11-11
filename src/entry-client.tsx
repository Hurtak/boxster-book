import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { assets, assetSizes } from 'virtual:book-assets';
import { chapters } from 'virtual:book-manifest';
import { registry } from 'virtual:diagrams';
import '../interactive/styles.css';
import '../scripts/book.css';
import { Diagrams } from './book/context';
import { BookApp } from './reader/BookApp';

hydrateRoot(
  document.getElementById('reader-root')!,
  <StrictMode>
    <Diagrams.Provider value={registry}>
      <BookApp chapters={chapters} assets={assets} assetSizes={assetSizes} />
    </Diagrams.Provider>
  </StrictMode>,
  {
    onRecoverableError: (error) => console.error('Book hydration:', error),
  },
);
