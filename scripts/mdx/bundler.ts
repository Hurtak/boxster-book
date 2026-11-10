import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import mdxEsbuild from '@mdx-js/esbuild';
import {build as esbuild} from 'esbuild';
import {resolve,relative,dirname,extname} from 'node:path';
import type {Plugin,InlineConfig} from 'vite';
import {compilerOptions} from './compiler';
import type {BookInventory} from './inventory';
import {assetUrls,collectAssets,type Asset} from './assets';
import {discoverBook} from './inventory';

export function virtualSource(name:string,book:BookInventory,assets:Map<string,Asset>,prefix?:string):string|undefined{
  if(name==='virtual:book-manifest')return book.chapters.map((c,i)=>`import C${i} from ${JSON.stringify(c.file)};`).join('\n')+
    `\nexport const chapters=[${book.chapters.map((c,i)=>`{...${JSON.stringify({...c,file:relative(book.root,c.file)})},Component:C${i}}`).join(',')}];`;
  if(name==='virtual:diagrams')return `export const registry={${Object.entries(book.diagrams).map(([id,file])=>`${JSON.stringify(id)}:()=>import(${JSON.stringify(file)})`).join(',')}};`;
  if(name==='virtual:book-assets')return prefix ? `export const assets=${JSON.stringify(assetUrls(assets,prefix))};` :
    `export const assets=Object.fromEntries([...document.querySelectorAll('img[data-book-asset]')].map(e=>[e.dataset.bookAsset,e.getAttribute('src')]));`;
}
export function bookConfig(book:BookInventory,assets:Map<string,Asset>,prefix:string,inputs:Set<string>):InlineConfig{
  const bookPlugin:Plugin={
    name:'book-manifest-and-assets',enforce:'pre',
    resolveId(id){if(id.startsWith('virtual:'))return '\0'+id;},
    async load(id){
      if(id.startsWith('\0virtual:'))return virtualSource(id.slice(1),book,assets,prefix);
      const asset=assets.get(id.split('?')[0]);if(asset)return `export default ${JSON.stringify(asset.key)};`;
    },
    configureServer(server){
      server.middlewares.use((request,response,next)=>{
        const pathname=new URL(request.url ?? '/', 'http://localhost').pathname;
        const asset=[...assets.values()].find(a=>pathname===prefix+a.name);
        if(!asset)return next();
        const types:Record<string,string>={'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
        response.setHeader('Content-Type',types[extname(asset.file)]);response.end(asset.bytes);
      });
    },
    async handleHotUpdate(context){
      if(!context.file.startsWith(resolve(book.root,'book')+'/'))return;
      const next=await discoverBook(dirname(dirname(book.chapters[0].file)),book.root);
      const nextAssets=await collectAssets(next);
      Object.assign(book,next);assets.clear();for(const [key,value] of nextAssets)assets.set(key,value);
      for(const name of ['book-manifest','book-assets','diagrams']){
        const module=context.server.moduleGraph.getModuleById('\0virtual:'+name);
        if(module)context.server.moduleGraph.invalidateModule(module);
      }
      context.server.ws.send({type:'full-reload'});
    },
    generateBundle(_,bundle){
      for(const a of assets.values())this.emitFile({type:'asset',fileName:a.name,source:a.bytes});
      for(const output of Object.values(bundle))if(output.type==='chunk')for(const id of Object.keys(output.modules))inputs.add(id);
    },
  };
  return {root:book.root,base:'./',publicDir:false,configFile:false,logLevel:'warn',plugins:[bookPlugin,mdx(compilerOptions(book)),react()],
    assetsInclude:['**/*.glb'],build:{target:'es2022',assetsInlineLimit:0,emptyOutDir:true,rollupOptions:{output:{entryFileNames:'reader-[hash].js',chunkFileNames:'chunks/[name]-[hash].js',assetFileNames:'models/[name]-[hash][extname]'}}}};
}
export async function portableBundle(book:BookInventory,assets:Map<string,Asset>,destination:string){
  const virtual={name:'book-manifest-and-assets',setup(api:import('esbuild').PluginBuild){
    api.onResolve({filter:/^virtual:/},args=>({path:args.path,namespace:'book'}));
    api.onLoad({filter:/.*/,namespace:'book'},args=>({contents:virtualSource(args.path,book,assets),loader:'js',resolveDir:book.root}));
    api.onLoad({filter:/\.(svg|png|jpe?g|webp)$/},args=>{
      const a=assets.get(args.path);if(a)return {contents:`export default ${JSON.stringify(a.key)};`,loader:'js'};
    });
  }};
  // The established binary-GLB IIFE is retained solely for file:// export.
  // Both bundlers run exactly the same MDX compiler options.
  return esbuild({entryPoints:[resolve(book.root,'src/entry-client.tsx')],outfile:resolve(destination,'reader.js'),bundle:true,format:'iife',platform:'browser',target:'es2022',minify:true,metafile:true,
    plugins:[virtual,mdxEsbuild(compilerOptions(book))],loader:{'.glb':'binary','.woff2':'file'},assetNames:'models/[name]-[hash]',define:{'import.meta.url':'"file:///"','process.env.NODE_ENV':'"production"'},legalComments:'inline',logLevel:'warning'});
}
