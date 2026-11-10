import {hydrateRoot} from 'react-dom/client';
import {StrictMode} from 'react';
import {chapters} from 'virtual:book-manifest';
import {assets} from 'virtual:book-assets';
import {registry} from 'virtual:diagrams';
import {BookApp} from './reader/BookApp';
import {Diagrams} from './book/context';
import '../scripts/book.css';
import '../interactive/styles.css';

hydrateRoot(document.getElementById('reader-root')!,<StrictMode><Diagrams.Provider value={registry}><BookApp chapters={chapters} assets={assets}/></Diagrams.Provider></StrictMode>,{
  onRecoverableError:error=>console.error('Book hydration:',error),
});
