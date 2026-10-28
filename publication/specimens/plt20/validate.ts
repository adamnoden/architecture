import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {getDocumentProxy} from 'unpdf'
import {createLayoutSection,layoutFamilySource} from '../../../compiler/reference-house/georgian/layout-family.js'
import {PLT_CANDIDATE_TOKENS as tokens} from '../../../compiler/publication-drawing-v2/plt-candidate-tokens.js'
const root=import.meta.dirname,work=resolve(root,'.work'),path=resolve(root,'dist/plt20-a1.pdf'),m=JSON.parse(await readFile(resolve(work,'manifest.json'),'utf8')),pt=72/25.4,hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex')
assert.equal(m.sourceSha256,hash(JSON.stringify(layoutFamilySource)));assert.equal(m.sceneSha256,hash(JSON.stringify(createLayoutSection('PRINCIPAL',25))));assert.equal(m.svgSha256,hash(await readFile(resolve(work,'section.svg'))));assert.deepEqual(m.tokens,tokens);assert.equal(m.physicalAcceptance,false);assert.equal(m.fitScaling,false)
const bytes=await readFile(path),pdf=await getDocumentProxy(new Uint8Array(bytes));assert.equal(pdf.numPages,1)
const page=await pdf.getPage(1),vp=page.getViewport({scale:1});assert.ok(Math.abs(vp.width-594*pt)<1);assert.ok(Math.abs(vp.height-841*pt)<1)
const items=(await page.getTextContent()).items.filter((i):i is typeof i & {str:string;width:number;height:number;transform:number[]}=>'str' in i&&i.str.trim().length>0)
for(const i of items)assert.ok(i.transform[4]>0&&i.transform[4]+i.width<594*pt&&i.transform[5]>0&&i.transform[5]<841*pt,'Clipped '+i.str)
const one=(s:string)=>{const a=items.filter(i=>i.str===s);assert.equal(a.length,1,s);return a[0]}
const ground=one('0.00'),first=one('3.45'),ratio=one('1:25'),bar=one('3 m')
assert.ok(Math.abs(first.transform[5]-ground.transform[5]-138*pt)<.4)
assert.ok(Math.abs((bar.transform[4]+bar.width/2)-(ratio.transform[4]+ratio.width/2)-392*pt)<.4)
assert.ok(Math.abs(bar.height-6)<.15,'Physical type was enlarged')
const fonts=execFileSync('pdffonts',[path],{encoding:'utf8'}),rows=fonts.split('\n').slice(2).filter(s=>s.trim());assert.equal(rows.length,2)
for(const row of rows){assert.match(row,/SourceSans3-(Regular|Bold)/);assert.match(row,/yes\s+yes\s+yes\s+\d+\s+\d+\s*$/)}
await writeFile(resolve(work,'validation-evidence.json'),JSON.stringify({sha256:hash(bytes),pages:1,scale:25,fonts,physicalAcceptance:false},null,2)+'\n')
console.log('A1 principal section PASS: exact 1:25 finished PDF, held source/tokens, 6 pt scale text, embedded Unicode fonts and no clipped text.')
