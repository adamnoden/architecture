import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {getDocumentProxy} from 'unpdf'
import {createCurrentSettingScene,settingSource} from '../../../compiler/reference-house/georgian/setting-family.js'
const root=import.meta.dirname,work=resolve(root,'.work'),m=JSON.parse(await readFile(resolve(work,'manifest.json'),'utf8')),pt=72/25.4
const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex')
assert.equal(m.sourceSha256,hash(JSON.stringify(settingSource)));assert.equal(m.physicalAcceptance,false);assert.equal(m.fitScaling,false)
const evidence:Record<string,unknown>={}
for(const format of ['b5','a4','a2'] as const){
 const path=resolve(root,'dist',`plt18-${format}.pdf`),bytes=await readFile(path),pdf=await getDocumentProxy(new Uint8Array(bytes)),[w,h,count,scale]=m.profiles[format]
 assert.equal(pdf.numPages,count)
 for(let n=1;n<=count;n++){
  const page=await pdf.getPage(n),vp=page.getViewport({scale:1});assert.ok(Math.abs(vp.width-w*pt)<1);assert.ok(Math.abs(vp.height-h*pt)<1)
  const items=(await page.getTextContent()).items.filter((i):i is typeof i & {str:string;width:number;height:number;transform:number[]}=>'str' in i&&i.str.trim().length>0)
  for(const i of items){assert.ok(i.transform[4]>=0&&i.transform[4]+i.width<=w*pt+.2,`${format}/${n}: clipped ${i.str}`);assert.ok(i.transform[5]>0&&i.transform[5]<h*pt,`${format}/${n}: off-page ${i.str}`)}
  const one=(s:string)=>{const a=items.filter(i=>i.str===s);assert.equal(a.length,1,`${format}/${n}: ${s}`);return a[0]}
  const zero=one('0'),five=one('5 m');assert.ok(Math.abs((five.transform[4]+five.width/2)-(zero.transform[4]+zero.width/2)-5000/scale*pt)<.4,`${format}/${n}: exact scale bar`)
  one(`1:${scale}`);one('3.5 × 3.5 m')
  const fonts=execFileSync('pdffonts',['-f',String(n),'-l',String(n),path],{encoding:'utf8'}),rows=fonts.split('\n').slice(2).filter(s=>s.trim())
  assert.equal(rows.length,2);for(const row of rows){assert.match(row,/SourceSans3-(Regular|Bold)/);assert.match(row,/yes\s+yes\s+yes\s+\d+\s+\d+\s*$/)}
  const view=n===1?'SETTING':'EXTERNAL-OBLIGATIONS',name=`${format}-${view.toLowerCase()}`
  assert.equal(m.files[name].scene,hash(JSON.stringify(createCurrentSettingScene(view,scale))));assert.equal(m.files[name].svg,hash(await readFile(resolve(work,name+'.svg'))))
  evidence[`${format}-${n}`]={fonts,textItems:items.length}
 }
 evidence[format]={sha256:hash(bytes),pages:count,scale}
}
await writeFile(resolve(work,'validation-evidence.json'),JSON.stringify(evidence,null,2)+'\n')
console.log('Current setting PASS: six finished pages; exact source, scales, embedded Unicode fonts and unclipped glyphs. Physical acceptance unearned.')
