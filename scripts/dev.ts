import {createServer} from 'vite';
import {discoverBook} from './mdx/inventory';
import {collectAssets,assetUrls} from './mdx/assets';
import {bookConfig} from './mdx/bundler';
import {htmlDocument,root} from './build';
import {resolve} from 'node:path';

const book=await discoverBook(resolve(root,'book'),root),assets=await collectAssets(book);
const server=await createServer({...bookConfig(book,assets,'/book-assets/',new Set()),logLevel:'info',appType:'custom',server:{host:'127.0.0.1'}});
server.middlewares.use(async(request,response,next)=>{
  if(!['GET','HEAD'].includes(request.method??''))return next();
  if(!request.headers.accept?.includes('text/html'))return next();
  try{
    const {render}=await server.ssrLoadModule('/src/entry-server.tsx');
    const markup=render(assetUrls(assets,'/book-assets/'));
    const document=htmlDocument(markup,'','<script type="module" src="/src/entry-client.tsx"></script>','Development edition; production exports include dependency and font notices.');
    response.setHeader('Content-Type','text/html; charset=utf-8');
    response.end(await server.transformIndexHtml(request.url??'/',document));
  }catch(error){server.ssrFixStacktrace(error as Error);next(error);}
});
await server.listen();server.printUrls();
