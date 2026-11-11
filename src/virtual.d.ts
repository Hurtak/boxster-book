declare module 'virtual:book-manifest' {
  export const chapters: import('./book/types').Chapter[];
}
declare module 'virtual:diagrams' {
  export const registry: import('./book/types').DiagramRegistry;
}
declare module 'virtual:book-assets' {
  export const assets: import('./book/types').AssetMap;
  export const assetSizes: import('./book/types').AssetSizes;
}
declare module '*.glb' {
  const source: string | Uint8Array;
  export default source;
}
