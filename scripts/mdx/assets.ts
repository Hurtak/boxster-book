import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, basename, extname, relative } from 'node:path';
import { createHash } from 'node:crypto';
import type { AssetMap } from '../../src/book/types';
import type { BookInventory } from './inventory';

const mime: Record<string,string> = {'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.glb':'model/gltf-binary'};
export const dataUrl = (file:string, bytes:Uint8Array) => `data:${mime[extname(file)] ?? 'application/octet-stream'};base64,${Buffer.from(bytes).toString('base64')}`;
export interface Asset { file:string; key:string; name:string; bytes:Buffer; size?:{width:number;height:number} }
export function imageSize(bytes:Buffer,extension:string):Asset['size'] {
  let width=0,height=0;
  if(extension==='.svg'){
    const root=bytes.toString('utf8').match(/<svg\b[^>]*>/)?.[0]??'';
    const view=root.match(/\bviewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
    if(view?.length===4){width=view[2];height=view[3];}
    else{width=Number(root.match(/\bwidth=["']([\d.]+)(?:px)?["']/)?.[1]);height=Number(root.match(/\bheight=["']([\d.]+)(?:px)?["']/)?.[1]);}
  }else if(extension==='.png'&&bytes.length>=24){width=bytes.readUInt32BE(16);height=bytes.readUInt32BE(20);}
  else if(['.jpg','.jpeg'].includes(extension)){
    let p=2;
    while(p+8<bytes.length){
      if(bytes[p++]!==0xff)continue;
      while(bytes[p]===0xff)p++;
      const marker=bytes[p++];if(marker===0xda||marker===0xd9)break;
      if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
      const length=bytes.readUInt16BE(p);if(length<2)break;
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){height=bytes.readUInt16BE(p+3);width=bytes.readUInt16BE(p+5);break;}
      p+=length;
    }
  }else if(extension==='.webp'&&bytes.length>=30){
    const format=bytes.toString('ascii',12,16);
    if(format==='VP8X'){width=bytes.readUIntLE(24,3)+1;height=bytes.readUIntLE(27,3)+1;}
    else if(format==='VP8 '){width=bytes.readUInt16LE(26)&0x3fff;height=bytes.readUInt16LE(28)&0x3fff;}
    else if(format==='VP8L'){const bits=bytes.readUInt32LE(21);width=(bits&0x3fff)+1;height=((bits>>>14)&0x3fff)+1;}
  }
  return width>0&&height>0&&Number.isFinite(width)&&Number.isFinite(height)?{width,height}:undefined;
}
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
    assets.set(file,{file,bytes,size:imageSize(bytes,extname(file)),key:'book-asset:'+relative(book.root,file).replaceAll('\\','/'),name:`media/${basename(file,extname(file))}-${hash}${extname(file)}`});
  }
  return assets;
}
export function assetUrls(assets:Map<string,Asset>,prefix:string):AssetMap{
  return Object.fromEntries([...assets.values()].map(a=>[a.key,prefix+a.name]));
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
