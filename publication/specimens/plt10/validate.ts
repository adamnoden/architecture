import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {getDocumentProxy} from 'unpdf'
import {design} from '../../../compiler/reference-house/georgian/section-exemplar.js'
import {createSectionExemplar,design as sectionRoofSource} from '../../../compiler/reference-house/georgian/section-exemplar.js'
const root=import.meta.dirname,work=resolve(root,'.work'),m=JSON.parse(await readFile(resolve(work,'manifest.json'),'utf8')),pt=72/25.4
const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex')
assert.equal(m.sourceSha256,hash(JSON.stringify({design,sectionRoofSource})));assert.equal(m.audit.pass,true);assert.equal(m.ownerPhysicalVerdict,'UNREVIEWED');assert.equal(m.printTokensFrozen,false);assert.equal(m.fullHistoricalSystemRevalidation,false)
const near=(a:number,b:number,label:string,tol=.35)=>assert.ok(Math.abs(a-b)<=tol,`${label}: ${a} != ${b}`)
const evidence:Record<string,unknown>={}
for(const format of ['b5','a4','a2'] as const){
 const path=resolve(root,'dist',`plt10-${format}.pdf`),bytes=await readFile(path),pdf=await getDocumentProxy(new Uint8Array(bytes)),[w,h,count,scale]=m.profiles[format]
 assert.equal(pdf.numPages,count)
 for(let n=1;n<=count;n++){
  const view=m.views[n-1],name=`${view.toLowerCase()}-${scale}`,svg=await readFile(resolve(work,name+'.svg'),'utf8'),scene=createSectionExemplar(view,scale)
  assert.equal(m.files[name].svg,hash(svg));assert.equal(m.files[name].scene,hash(JSON.stringify(scene)))
  const page=await pdf.getPage(n),vp=page.getViewport({scale:1});near(vp.width,w*pt,`${format} width`,1);near(vp.height,h*pt,`${format} height`,1)
  const items=(await page.getTextContent()).items.filter((i):i is typeof i & {str:string;width:number;height:number;transform:number[]}=>'str' in i)
  const item=(s:string)=>{const found=items.filter(i=>i.str===s);assert.equal(found.length,1,`${format}/${view}: unique ${s}`);return found[0]}
  const north=item(`1:${scale}`),bar=item('3 m')
  near(bar.transform[4]+bar.width/2-north.transform[4]-north.width/2,9800/scale*pt,`${format}/${view} horizontal scale`)
  near(north.transform[5]-bar.transform[5],450/scale*pt,`${format}/${view} vertical scale`)
  near(bar.height,6,`${format}/${view} note size`,.15)
  for(const i of items)assert.ok(i.transform[4]>=0&&i.transform[4]+i.width<=w*pt+1&&i.transform[5]>=0&&i.transform[5]<=h*pt,`${format}/${view} text outside page ${i.str}`)
  const fonts=execFileSync('pdffonts',['-f',String(n),'-l',String(n),path],{encoding:'utf8'}),rows=fonts.split('\n').slice(2).filter(r=>r.trim())
  assert.equal(rows.length,2);for(const row of rows){assert.match(row,/SourceSans3-(Regular|Bold)/);assert.match(row,/yes\s+yes\s+yes\s+\d+\s+\d+\s*$/)}
  evidence[format+'-'+view]={page:n,scale,notePt:bar.height,fonts}
 }
 evidence[format+'-file']={sha256:hash(bytes),pages:count}
}
await writeFile(resolve(work,'validation-evidence.json'),JSON.stringify(evidence,null,2)+'\n')
console.log('PLT elevation family PASS: all 15 finished pages, exact scales, embedded fonts, Unicode and source/scene identities.')
