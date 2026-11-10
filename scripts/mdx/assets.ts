import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, basename, extname, relative } from 'node:path';
import { createHash } from 'node:crypto';
import type { AssetMap } from '../../src/book/types';
import type { BookInventory } from './inventory';

const mime: Record<string,string> = {'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.glb':'model/gltf-binary'};
export const dataUrl = (file:string, bytes:Uint8Array) => `data:${mime[extname(file)] ?? 'application/octet-stream'};base64,${Buffer.from(bytes).toString('base64')}`;
export interface Asset { file:string; key:string; name:string; bytes:Buffer }
export async function resourceBytes(file:string, chain:string[]=[]): Promise<Buffer> {
  if(chain.includes(file))throw Error(`Circular embedded resource: ${file}`);
  const bytes=await readFile(file);
  if(extname(file)!=='.svg')return bytes;
  let svg=bytes.toString('utf8');
  const refs=[...svg.matchAll(/(?:\b(?:xlink:)?href=["'])([^"']+)["']|url\(["']?([^)'"\s]+)["']?\)/g)].map(m=>m[1]??m[2]);
  for(const url of new Set(refs)){
    if(url.startsWith('#')||url.startsWith('data:'))continue;
    if(/^(?:[a-z]+:|\/\/)/i.test(url))throw Error(`External resource inside SVG ${file}: ${url}`);
    const [path,fragment]=url.split('#'),nested=resolve(dirname(file),decodeURIComponent(path.split('?')[0]));
    svg=svg.replaceAll(url,dataUrl(nested,await resourceBytes(nested,[...chain,file]))+(fragment?'#'+fragment:''));
  }
  return Buffer.from(svg);
}
export async function collectAssets(book:BookInventory):Promise<Map<string,Asset>>{
  const files=new Set<string>([resolve(book.root,'assets/book-cover.png')]);
  for(const chapter of book.chapters){
    const source=await readFile(chapter.file,'utf8');
    for(const match of source.matchAll(/\bimport\s+\w+\s+from\s+(['"])(.*?)\1/g)){
      if(/\.(?:svg|png|jpe?g|webp)$/.test(match[2]))files.add(resolve(dirname(chapter.file),match[2]));
    }
  }
  const assets=new Map<string,Asset>();
  for(const file of files){
    const bytes=await resourceBytes(file),hash=createHash('sha256').update(bytes).digest('hex').slice(0,12);
    assets.set(file,{file,bytes,key:'book-asset:'+relative(book.root,file).replaceAll('\\','/'),name:`media/${basename(file,extname(file))}-${hash}${extname(file)}`});
  }
  return assets;
}
export function assetUrls(assets:Map<string,Asset>,prefix?:string):AssetMap{
  return Object.fromEntries([...assets.values()].map(a=>[a.key,prefix ? prefix+a.name : dataUrl(a.file,a.bytes)]));
}
export async function inlineCss(css:string,folder:string):Promise<string>{
  if(/@import\s/.test(css))throw Error('Unresolved CSS @import in export; imports must be bundled locally');
  for(const match of [...css.matchAll(/url\((?:["']?)([^)'"\s]+)(?:["']?)\)/g)]){
    const url=match[1];if(url.startsWith('data:')||url.startsWith('#'))continue;
    if(/^(?:[a-z]+:|\/\/)/i.test(url))throw Error(`CSS must not require a remote resource: ${url}`);
    const file=resolve(folder,decodeURIComponent(url.split(/[?#]/)[0]));
    css=css.replaceAll(match[0],`url("${dataUrl(file,await resourceBytes(file))}")`);
  }return css;
}
export async function dependencyNotices(inputs:Iterable<string>,root:string):Promise<string>{
  const packages=new Set([...inputs].map(file=>file.match(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1]).filter((x):x is string=>!!x));
  packages.add('vite');packages.add('esbuild');
  const notices:string[]=[];
  for(const name of [...packages].sort()){
    const folder=resolve(root,'node_modules',name),pkg=JSON.parse(await readFile(resolve(folder,'package.json'),'utf8'));
    const files=(await readdir(folder)).filter(n=>/^(license|copying)(\.|$)/i.test(n));
    if(!files.length)throw Error(`Missing license notice for ${name}`);
    notices.push(`${pkg.name} ${pkg.version}\n`+(await Promise.all(files.map(n=>readFile(resolve(folder,n),'utf8')))).join('\n'));
  }
  for(const file of (await readdir(resolve(root,'assets/fonts'))).filter(n=>/^OFL-.*\.txt$/.test(n)).sort())notices.push(await readFile(resolve(root,'assets/fonts',file),'utf8'));
  return notices.join('\n\n--------------------\n\n');
}
