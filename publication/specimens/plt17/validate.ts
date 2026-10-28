import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {getDocumentProxy} from 'unpdf'
import {compositionSource,pageSpecs,bookProfiles,createBookPageScene,createBookSectionSpread} from '../../../compiler/reference-house/georgian/book-composition.js'
const root=import.meta.dirname,work=resolve(root,'.work'),m=JSON.parse(await readFile(resolve(work,'manifest.json'),'utf8')),pt=72/25.4
const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex')
assert.equal(m.sourceSha256,hash(JSON.stringify(compositionSource)));assert.equal(m.architectureChanged,false);assert.equal(m.fitScaling,false);assert.equal(m.physicalAcceptance,false);assert.equal(m.printTokensFrozen,false);assert.equal(m.finalManuscriptSequence,false);assert.equal(m.gutterCriticalExclusionEachSideMm,12)
const near=(a:number,b:number,key:string,tolerance=.4)=>assert.ok(Math.abs(a-b)<tolerance,`${key}: ${a} != ${b}`)
const evidence:Record<string,unknown>={}
for(const format of ['b5','a4','spreads'] as const){
 const path=resolve(root,'dist',`plt17-${format}.pdf`),bytes=await readFile(path),pdf=await getDocumentProxy(new Uint8Array(bytes)),[w,h,count]=m.profiles[format]
 assert.equal(pdf.numPages,count)
 for(let n=1;n<=count;n++){
  const page=await pdf.getPage(n),vp=page.getViewport({scale:1});near(vp.width,w*pt,format+' page width',1);near(vp.height,h*pt,format+' page height',1)
  const all=(await page.getTextContent()).items.filter((i):i is typeof i & {str:string;width:number;height:number;transform:number[]}=>'str' in i)
  // Fully off-page text may remain in a clipped PDF stream; no visible text may be cut.
  const items=all.filter(i=>i.width>0&&i.transform[4]+i.width>0&&i.transform[4]<w*pt&&i.transform[5]>=0&&i.transform[5]<=h*pt)
  for(const i of items)assert.ok(i.transform[4]>=-.2&&i.transform[4]+i.width<=w*pt+.2,`${format}/${n}: clipped text ${i.str}`)
  const fonts=execFileSync('pdffonts',['-f',String(n),'-l',String(n),path],{encoding:'utf8'}),rows=fonts.split('\n').slice(2).filter(r=>r.trim());assert.equal(rows.length,2,`${format}/${n}: fonts`)
  for(const row of rows){assert.match(row,/SourceSans3-(Regular|Bold)/);assert.match(row,/yes\s+yes\s+yes\s+\d+\s+\d+\s*$/)}
  const unique=(s:string)=>{const found=items.filter(i=>i.str===s);assert.equal(found.length,1,`${format}/${n}: unique ${s}`);return found[0]}
  if(format!=='spreads'){
   const spec=pageSpecs[n-1],p=bookProfiles[format]
   if(spec.kind!=='intro')assert.equal(m.scenes[format][n].svg,hash(await readFile(resolve(work,`${format}-${n}.svg`))))
   if(spec.kind==='spread'){
    for(const i of items){const lo=i.transform[4]/pt,hi=(i.transform[4]+i.width)/pt;assert.ok(n===4?hi<=p.width-12+.05:lo>=12-.05,`${format}/${n}: critical text in fold ${i.str}`)}
    if(n===4){const ground=unique('0.00'),first=unique('3.45');near(first.transform[5]-ground.transform[5],69*pt,`${format}: finished section 3450 mm at 1:50`);unique('1:500')}
    else{const ratio=unique('1:50'),bar=unique('3 m');near((bar.transform[4]+bar.width/2)-(ratio.transform[4]+ratio.width/2),54*pt,format+' spread bar position');near(ratio.transform[5]-bar.transform[5],8*pt,format+' spread bar offset');near(bar.height,6,format+' bar text',.15)}
   }else if(spec.kind!=='intro'){
    const scene=createBookPageScene(n,format)!;assert.equal(m.scenes[format][n].scene,hash(JSON.stringify(scene)))
    const ratio=unique('1:100'),bar=unique('3 m');near((bar.transform[4]+bar.width/2)-(ratio.transform[4]+ratio.width/2),98*pt,`${format}/${n} finished ordinary scale`);near(ratio.transform[5]-bar.transform[5],4.5*pt,`${format}/${n} bar offset`);near(bar.height,6,`${format}/${n} bar type`,.15)
    const visible=items.filter(i=>!['02','03','06','07','08','09','10','11','12','13','14'].includes(i.str))
    for(const i of visible){const lo=i.transform[4]/pt,hi=(i.transform[4]+i.width)/pt;assert.ok(n%2===0?hi<=w-12+.1:lo>=12-.1,`${format}/${n}: binding text ${i.str}`)}
   }
  }
  evidence[format+'-'+n]={visibleTextItems:items.length,fonts}
 }
 if(format!=='spreads'){const spread=createBookSectionSpread(format);assert.equal(m.scenes[format].spread.scene,hash(JSON.stringify(spread)));const svg=await readFile(resolve(work,format+'-section.svg'),'utf8');assert.ok(svg.includes(`viewBox="0 0 ${2*w} ${h}"`))}
 evidence[format+'-file']={sha256:hash(bytes),pages:count}
}
await writeFile(resolve(work,'validation-evidence.json'),JSON.stringify(evidence,null,2)+'\n')
console.log('PLT book composition PASS: 36 finished pages, held source, exact scales, embedded Unicode fonts and clear critical fold bands.')
