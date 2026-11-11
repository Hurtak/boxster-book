import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,writeFile,readFile,rm,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {compile,run} from '@mdx-js/mdx';
import * as jsx from 'react/jsx-runtime';
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {discoverBook,resolveBookLink} from '../scripts/mdx/inventory';
import {compilerOptions} from '../scripts/mdx/compiler';
import {buildBook,root} from '../scripts/build';
import {SourceNotes,SourceReference,Figure,Diagram} from '../src/book/components';
import {resourceBytes,inlineCss} from '../scripts/mdx/assets';

async function fixture(files:Record<string,string>,work:(source:string)=>Promise<void>){
  const folder=await mkdtemp(resolve(tmpdir(),'boxster-mdx-test-'));
  try{for(const [name,source]of Object.entries(files)){const path=resolve(folder,name);await mkdir(resolve(path,'..'),{recursive:true});await writeFile(path,source);}await work(folder);}
  finally{await rm(folder,{recursive:true,force:true});}
}
test('all MDX chapters preserve the published chapter and section destinations',async()=>{
  const contract=JSON.parse(await readFile(resolve(root,'tests/fixtures/manuscript-baseline.json'),'utf8'));
  const book=await discoverBook(resolve(root,'book'),root);
  assert.equal(book.chapters.length,contract.chapters.length);
  for(let i=0;i<book.chapters.length;i++){
    const chapter=book.chapters[i],before=contract.chapters[i];
    assert.ok(chapter.file.endsWith('/index.mdx'));
    assert.equal(chapter.id,before.id);assert.equal(chapter.noteCount,before.notes.length);
    assert.deepEqual(chapter.headings.map(h=>h.id),before.headings.map((h:{id:string})=>h.id));
    assert.deepEqual(chapter.diagrams,before.diagrams);
    await compile({path:chapter.file,value:await readFile(chapter.file,'utf8')},compilerOptions(book));
  }
});
test('GFM tables, repeated notes, captions and legacy source links compile with the same options',async()=>{
  await fixture({'01-sample/index.mdx':`# Sample

Intro[^one], repeated[^one], then another[^two]. [Legacy](index.md#details).

## Details

| Feature | Value |
| --- | --- |
| Engine | 2.9 |

<Figure src="data:image/svg+xml;base64,PHN2Zy8+" alt="Separate visual description">

Caption with **detail** and [credit](https://example.com).

</Figure>

[^one]: First source.
[^two]: Second source.
`},async source=>{
    const book=await discoverBook(source,root),chapter=book.chapters[0];
    const code=await compile({path:chapter.file,value:await readFile(chapter.file,'utf8')},{...compilerOptions(book),outputFormat:'function-body'});
    const module=await run(String(code),jsx);
    const html=renderToString(createElement(module.default,{components:{Figure,Diagram,SourceNotes,SourceReference}}));
    assert.match(html,/<table>/);assert.match(html,/<td>2\.9<\/td>/);
    assert.match(html,/alt="Separate visual description"/);assert.match(html,/<figcaption>Caption with <strong>detail<\/strong> and <a href="https:\/\/example.com">credit<\/a>\.<\/figcaption>/);
    assert.match(html,/id="fn1"/);assert.match(html,/id="fn2"/);assert.match(html,/id="fn3"/);
    assert.equal((html.match(/First source\./g)||[]).length,2);
    for(const n of [1,2,3])assert.match(html,new RegExp(`href="#fnref${n}"`));
    assert.match(html,/<details[^>]*class="chapter-notes"[^>]*>/);assert.doesNotMatch(html,/<details[^>]* open/);
    assert.equal(resolveBookLink('index.mdx#details',chapter,book),resolveBookLink('index.md#details',chapter,book));
  });
});
test('invalid authoring fails with actionable chapter, heading, diagram and note errors',async()=>{
  const cases:[Record<string,string>,RegExp][]=[
    [{'01-one/index.mdx':'# One','01-two/index.mdx':'# Two'},/positive and unique/],
    [{'01-one/index.mdx':'# One','01-one/index.md':'# One'},/exactly one/],
    [{'01-one/index.mdx':'# One\n\n[Bad](../02-no/index.md)'},/Unknown chapter link/],
    [{'01-one/index.mdx':'# One\n\n[Bad](#missing)'},/Unknown chapter heading/],
    [{'01-one/index.mdx':'# One\n\n<Diagram id="missing" poster={poster} alt="An explanation" />'},/Missing diagram module/],
    [{'01-one/index.mdx':'# One\n\n<Figure src={image} alt="" />'},/non-empty literal alt/],
    [{'01-one/index.mdx':'# One\n\nBroken[^missing].'},/Unresolved footnote/],
  ];
  for(const [files,pattern]of cases)await fixture(files,async source=>{await assert.rejects(discoverBook(source,root),pattern);});
});
test('a failed book build leaves the previously successful export intact',async()=>{
  await fixture({'book/01-one/index.mdx':'# One\n\n[Bad](#missing)','book.html':'Existing good edition'},async folder=>{
    const output=resolve(folder,'book.html');
    await assert.rejects(buildBook({source:resolve(folder,'book'),output}),/Unknown chapter heading/);
    assert.equal(await readFile(output,'utf8'),'Existing good edition');
    assert.ok(!(await readdir(folder)).some(n=>n.startsWith('.book-build-')));
  });
  await fixture({'book/01-one/index.mdx':"import Missing from './not-present.tsx';\n\n# One\n\n<Missing />",'book.html':'Existing good edition'},async folder=>{
    const output=resolve(folder,'book.html');
    await assert.rejects(buildBook({source:resolve(folder,'book'),output}));
    assert.equal(await readFile(output,'utf8'),'Existing good edition');
    assert.ok(!(await readdir(folder)).some(n=>n.startsWith('.book-build-')));
  });
});
test('book assets embed nested local resources and reject unresolved network dependencies',async()=>{
  await fixture({'photo.png':'image bytes','nested.svg':'<svg xmlns="http://www.w3.org/2000/svg"><image href="photo.png" /></svg>','remote.svg':'<svg><image href="https://example.com/image.png" /></svg>','circular.svg':'<svg><image href="circular.svg" /></svg>'},async folder=>{
    assert.match((await resourceBytes(resolve(folder,'nested.svg'))).toString(),/data:image\/png;base64/);
    assert.match(await inlineCss('body{background:url("photo.png")}',folder),/data:image\/png;base64/);
    await assert.rejects(resourceBytes(resolve(folder,'remote.svg')),/External resource/);
    await assert.rejects(resourceBytes(resolve(folder,'circular.svg')),/Circular embedded resource/);
    await assert.rejects(inlineCss('@import "https://example.com/style.css";',folder),/Unresolved CSS/);
  });
});
