import {build as viteBuild,mergeConfig} from 'vite';
import {mkdir,mkdtemp,readFile,writeFile,readdir,cp,rename,rm} from 'node:fs/promises';
import {resolve,dirname,extname,basename} from 'node:path';
import {parseArgs} from 'node:util';
import {pathToFileURL} from 'node:url';
import {discoverBook} from './mdx/inventory';
import {collectAssets,assetUrls,inlineCss,dependencyNotices} from './mdx/assets';
import {bookConfig,portableBundle} from './mdx/bundler';

export const root=resolve(import.meta.dirname,'..');
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function htmlDocument(markup:string,css:string,script:string,notices:string){
  return `<!doctype html>\n<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator" content="MDX, React and Vite"><meta name="theme-color" content="#174b3d"><link rel="icon" href="data:,"><title>Porsche Boxster 2.9</title>
<script>(function(){
  var root=document.documentElement;
  root.dataset.readerPending='true';
  if(!location.hash||location.hash==='#title')root.dataset.view='cover';
  history.scrollRestoration='manual';
  try{var size=Number(localStorage.getItem('boxster-reading-size'));if(size>=17&&size<=24)root.style.setProperty('--reading-size',size+'px');}catch(e){}
  function fallback(event){
    if(event&&event.target!==window&&event.target.tagName!=='SCRIPT')return;
    if(!root.classList.contains('reader-enhanced')){
      delete root.dataset.readerPending;
      delete root.dataset.view;
      history.scrollRestoration='auto';
    }
  }
  addEventListener('error',fallback,true);
  addEventListener('load',function(){setTimeout(fallback,5000);});
})();</script>
<style>${css.replace(/<\/style/gi,'<\\/style')}</style></head><body><div id="reader-loading" role="status">Loading book…</div><div id="reader-root">${markup}</div><template id="third-party-notices"><pre>${escape(notices)}</pre></template>${script}</body></html>`;
}
async function filesIn(folder:string):Promise<string[]>{
  return (await Promise.all((await readdir(folder,{withFileTypes:true})).map(e=>e.isDirectory()?filesIn(resolve(folder,e.name)):resolve(folder,e.name)))).flat();
}
export async function buildBook({source=resolve(root,'book'),output=resolve(root,'dist/book.html'),format='portable'}:{source?:string;output?:string;format?:string}={}){
  if(!['portable','web'].includes(format))throw Error('Format must be portable or web');
  source=resolve(source);output=resolve(output);
  if(extname(output).toLowerCase()!=='.html')throw Error('The output filename must end in .html');
  const book=await discoverBook(source,root),assets=await collectAssets(book);
  await mkdir(dirname(output),{recursive:true});
  const temporary=await mkdtemp(resolve(dirname(output),'.book-build-'));
  try{
    const inputs=new Set<string>(),assetFolder=basename(output,'.html')+'-assets',prefix='./'+assetFolder+'/';
    const configuration=bookConfig(book,assets,prefix,inputs),serverFolder=resolve(temporary,'server'),clientFolder=resolve(temporary,'assets');
    await viteBuild(mergeConfig(configuration,{ssr:{noExternal:true},build:{ssr:resolve(root,'src/entry-server.tsx'),outDir:serverFolder,rollupOptions:{output:{entryFileNames:'server.mjs'}}}}));
    const server=await import(pathToFileURL(resolve(serverFolder,'server.mjs')).href);
    const markup=server.render(assetUrls(assets,format==='web'?prefix:undefined));
    let script:string,styles:string[]=[];
    if(format==='portable'){
      const result=await portableBundle(book,assets,clientFolder);
      Object.keys(result.metafile!.inputs).forEach(file=>inputs.add(file));
      const javascript=await readFile(resolve(clientFolder,'reader.js'),'utf8');
      script=`<script>${javascript.replace(/<\/script/gi,'<\\/script')}</script>`;
    }else{
      await viteBuild(mergeConfig(configuration,{build:{outDir:clientFolder,rollupOptions:{input:resolve(root,'src/entry-client.tsx')}}}));
      const entry=(await readdir(clientFolder)).find(n=>/^reader-.*\.js$/.test(n));
      if(!entry)throw Error('Vite did not emit the reader entry');
      script=`<script type="module" src="${prefix+entry}"></script>`;
    }
    for(const file of await filesIn(clientFolder))if(extname(file)==='.css')styles.push(await inlineCss(await readFile(file,'utf8'),dirname(file)));
    const notices=await dependencyNotices(inputs,root);
    const document=htmlDocument(markup,styles.join('\n'),script,notices);
    const staged=resolve(temporary,'book.html');await writeFile(staged,document);
    if(format==='web'){
      await writeFile(resolve(clientFolder,'THIRD_PARTY_NOTICES.txt'),notices);
      // Content-hashed assets are additive; an already open edition keeps working.
      await cp(clientFolder,resolve(dirname(output),assetFolder),{recursive:true});
    }
    await rename(staged,output);
    const size=Buffer.byteLength(document);
    console.log(`Built ${book.chapters.length} MDX chapters, ${Object.keys(book.diagrams).length} diagrams → ${output} (${(size/1024/1024).toFixed(2)} MiB)`);
    return {output,size,chapters:book.chapters.length,diagrams:Object.keys(book.diagrams).length};
  }finally{await rm(temporary,{recursive:true,force:true});}
}
if(process.argv[1] && pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  try{
    const {values}=parseArgs({options:{source:{type:'string'},output:{type:'string'},format:{type:'string'},help:{type:'boolean'}}});
    if(values.help)console.log('Build the MDX book: node --import tsx scripts/build.ts [--source book] [--output dist/book.html] [--format portable|web]');
    else await buildBook(values);
  }catch(error){console.error('Book build failed:',error);process.exitCode=1;}
}
