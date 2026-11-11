import { renderToString } from 'react-dom/server';
import { assetSizes } from 'virtual:book-assets';
import { chapters } from 'virtual:book-manifest';
import type { AssetMap } from './book/types';
import { BookApp } from './reader/BookApp';
export function render(assets: AssetMap) {
  return renderToString(<BookApp chapters={chapters} assets={assets} assetSizes={assetSizes} />);
}
