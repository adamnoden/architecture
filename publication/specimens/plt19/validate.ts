import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {getDocumentProxy} from 'unpdf'
import {createCurrentSynthesisScene,synthesisSource} from '../../../compiler/reference-house/georgian/sectional-synthesis.js'
const root=import.meta.dirname,work=resolve(root,'.work'),m=JSON.parse(await readFile(resolve(work,'manifest.json'),'utf8')),pt=72/25.4
const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex'),evidence:Record<string,unknown>={}
assert.equal(m.sourceSha256,hash(JSON.stringify(synthesisSource)));assert.equal(m.physicalAcceptance,false);assert.equal(m.fitScaling,false);assert.equal(m.scale,'NTS')
for(const format of ['b5','a4','a2','facing'] as const){
 const path=resolve(root,'dist',`plt19-${format}.pdf`),bytes=await readFile(path),pdf=await getDocumentProxy(new Uint8Array(bytes)),[w,h,count]=m.profiles[format],book=format==='b5'||format==='a4'
 assert.equal(pdf.numPages,count)
 for(let n=1;n<=count;n++){
  const page=await pdf.getPage(n),vp=page.getViewport({scale:1});assert.ok(Math.abs(vp.width-w*pt)<1);assert.ok(Math.abs(vp.height-h*pt)<1)
  const all=(await page.getTextContent()).items.filter((i):i is typeof i & {str:string;width:number;height:number;transform:number[]}=>'str' in i&&i.str.trim().length>0)
  const items=all.filter(i=>i.width>0&&i.transform[4]+i.width>0&&i.transform[4]<w*pt&&i.transform[5]>=0&&i.transform[5]<=h*pt)
  for(const i of items){const lo=i.transform[4]/pt,hi=(i.transform[4]+i.width)/pt;assert.ok(lo>=-.05&&hi<=w+.05,`${format}/${n}: clipped ${i.str}`);if(book&&n>1)assert.ok(n===2?hi<=w-12+.05:lo>=12-.05,`${format}/${n}: critical text in fold`)}
  const fonts=execFileSync('pdffonts',['-f',String(n),'-l',String(n),path],{encoding:'utf8'}),rows=fonts.split('\n').slice(2).filter(s=>s.trim())
  assert.equal(rows.length,2);for(const row of rows){assert.match(row,/SourceSans3-(Regular|Bold)/);assert.match(row,/yes\s+yes\s+yes\s+\d+\s+\d+\s*$/)}
  if((book&&n===2)||!book)assert.ok(items.some(i=>i.str==='NTS — fixed parallel projection'))
  evidence[`${format}-${n}`]={visibleTextItems:items.length,fonts}
 }
 const scene=createCurrentSynthesisScene(format==='a2'?'WALL':'BOOK',format==='a4'?'a4':'b5')
 for(let i=0;i<(book?2:1);i++){const name=`${format}-${i}`;assert.equal(m.files[name].scene,hash(JSON.stringify(scene)));assert.equal(m.files[name].svg,hash(await readFile(resolve(work,name+'.svg'))))}
 evidence[format]={sha256:hash(bytes),pages:count,scale:'NTS'}
}
await writeFile(resolve(work,'validation-evidence.json'),JSON.stringify(evidence,null,2)+'\n')
console.log('Current synthesis PASS: eight finished pages, exact source/scene crops, NTS, embedded Unicode fonts and clear critical text bands.')
