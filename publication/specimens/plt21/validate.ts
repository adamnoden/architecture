import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {getDocumentProxy} from 'unpdf'
import {exteriorProfiles,exteriorFingerprint,exteriorViews} from '../../../compiler/reference-house/georgian/exterior-isometrics.js'
const root=import.meta.dirname,pt=72/25.4,manifest=JSON.parse(await readFile(resolve(root,'.work/manifest.json'),'utf8')),evidence:Record<string,unknown>={}
assert.equal(manifest.modelFingerprint,exteriorFingerprint);assert.equal(manifest.physicalAcceptance,false);assert.equal(manifest.roofSelectionFinal,false)
for(const view of exteriorViews){const svg=await readFile(resolve(root,'../../../public/drawings/exterior-isometrics',view+'.svg'),'utf8');assert.equal(manifest.files[view],createHash('sha256').update(svg).digest('hex'))}
for(const format of ['b5','a4','a2'] as const){
 const html=await readFile(resolve(root,'.work',format+'.html'),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,`${format}: duplicate proof DOM identities`)
 const path=resolve(root,'dist',`plt21-${format}.pdf`),bytes=await readFile(path),pdf=await getDocumentProxy(new Uint8Array(bytes)),profile=exteriorProfiles[format],count=format==='a2'?5:4
 assert.equal(pdf.numPages,count)
 for(let n=1;n<=count;n++){
  const page=await pdf.getPage(n),vp=page.getViewport({scale:1});assert.ok(Math.abs(vp.width-profile.width*pt)<1);assert.ok(Math.abs(vp.height-profile.height*pt)<1)
  const items=(await page.getTextContent()).items.filter((i):i is typeof i & {str:string;width:number;transform:number[]}=>'str' in i&&i.str.trim().length>0)
  assert.ok(items.some(i=>i.str.includes('NTS')),`${format}/${n}: missing NTS`)
  const label=n<=4?exteriorViews[n-1].split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join('-'):'Four exterior views'
  assert.ok(items.some(i=>i.str.includes(label)),`${format}/${n}: wrong camera label`)
  for(const i of items){assert.ok(i.transform[4]>=0&&i.transform[4]+i.width<=vp.width+.1,`${format}/${n}: text clipped`);assert.ok(i.transform[5]>=0&&i.transform[5]<=vp.height)}
 }
 const fonts=execFileSync('pdffonts',[path],{encoding:'utf8'}).split('\n').slice(2).filter(s=>s.trim())
 assert.equal(fonts.length,2);for(const row of fonts){assert.match(row,/SourceSans3-(Regular|Bold)/);assert.match(row,/yes\s+yes\s+yes\s+\d+\s+\d+\s*$/)}
 evidence[format]={pages:count,sha256:createHash('sha256').update(bytes).digest('hex'),fonts}
}
await writeFile(resolve(root,'.work/validation-evidence.json'),JSON.stringify(evidence,null,2)+'\n')
console.log('Exterior isometrics PASS: thirteen finished pages, physical page sizes, camera labels, embedded Unicode fonts, NTS and exact generated source.')
