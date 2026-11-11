import { createContext, useContext } from 'react';
import type { AssetMap, AssetSizes, DiagramRegistry } from './types';

export const Assets = createContext<AssetMap>({});
export const ImageSizes = createContext<AssetSizes>({});
export const Diagrams = createContext<DiagramRegistry>({});
export function useAsset(source: string): string {
  const assets = useContext(Assets);
  if (!source.startsWith('book-asset:')) return source;
  const url = assets[source];
  if (!url) throw Error(`Missing book asset: ${source}`);
  return url;
}
