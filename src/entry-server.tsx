import {renderToString} from 'react-dom/server';
import {chapters} from 'virtual:book-manifest';
import {BookApp} from './reader/BookApp';
import type {AssetMap} from './book/types';
export function render(assets:AssetMap){return renderToString(<BookApp chapters={chapters} assets={assets}/>);}
