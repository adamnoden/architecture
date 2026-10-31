import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {compositionSource,dispositions,pageSpecs,bookProfiles,createBookPageScene,createBookSectionSpread,type BookFormat} from '../../../compiler/reference-house/georgian/book-composition.js'
import {renderDrawingSceneV2SvgWithTokens} from '../../../compiler/publication-drawing-v2/svg.js'
import {renderDrawingViewportSvg} from '../../../compiler/publication-drawing-v2/composition.js'
import {PLT_CANDIDATE_TOKENS as tokens} from '../../../compiler/publication-drawing-v2/plt-candidate-tokens.js'
await import('../plt16/prepare.js')
const root=import.meta.dirname,work=resolve(root,'.work');await mkdir(work,{recursive:true})
const old=await readFile(resolve(root,'../plt04/.work/ground-100.svg'),'utf8'),fonts=(old.match(/@font-face\{[^}]+\}/g)??[]).join('')
const hash=(s:string)=>createHash('sha256').update(s).digest('hex')
const manifest:Record<string,unknown>={packet:'PLT-BOOK-COMPOSITION-01',sourceSha256:hash(JSON.stringify(compositionSource)),workingSourceAccepted:true,architectureChanged:false,fitScaling:false,physicalAcceptance:false,printTokensFrozen:false,finalManuscriptSequence:false,gutterCriticalExclusionEachSideMm:12,dispositions,profiles:{b5:[176,250,14],a4:[210,297,14],spreads:[352,250,8]},scenes:{}}
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')
const proofIntro=`<div class="intro"><h1>Architectural plates</h1><p class="sub">Book composition proof</p><p>The working house is held. This proof tests facing plans, a larger longitudinal section and a smaller selection of supporting readings.</p><dl><dt>02–03</dt><dd>Ground and first floors</dd><dt>04–05</dt><dd>Longitudinal section and locator</dd><dt>06–07</dt><dd>Services on both floors</dd><dt>08–09</dt><dd>Roof form, water and access</dd><dt>10–11</dt><dd>Front and garden elevations</dd><dt>12</dt><dd>Courtyard north and south</dd><dt>13–14</dt><dd>Service elevation and section</dd></dl><p>The section is 1:50; other architectural drawings are 1:100. Its locator is 1:500. No drawing is fitted to the page.</p><p class="limit">This is a plate-event sampler, not the manuscript sequence. Prose intervals and existing placement anchors still govern integration. Physical print acceptance is pending.</p><p class="limit">Repeated courtyard, structural and adaptation sheets have been consolidated or omitted where they add no distinct supported reading. The transparent 3D study remains withheld.</p></div>`
const pages:Record<BookFormat,string[]>={b5:[],a4:[]}
for(const format of ['b5','a4'] as const){
 const profile=bookProfiles[format],spread=createBookSectionSpread(format),sceneRecords:Record<string,unknown>={}
 await writeFile(resolve(work,format+'-section-scene.json'),JSON.stringify(spread,null,2)+'\n')
 await writeFile(resolve(work,format+'-section.svg'),renderDrawingSceneV2SvgWithTokens(spread,tokens))
 for(const spec of pageSpecs){
  let drawing=''
  if(spec.kind==='spread')drawing=renderDrawingViewportSvg(spread,tokens,{x:spec.page===4?0:profile.width,y:0,width:profile.width,height:profile.height})
  else if(spec.kind!=='intro'){
   const scene=createBookPageScene(spec.page,format)!;sceneRecords[spec.page]={scene:hash(JSON.stringify(scene)),scale:scene.scaleDenominator,view:spec.view}
   await writeFile(resolve(work,`${format}-${spec.page}-scene.json`),JSON.stringify(scene,null,2)+'\n')
   drawing=renderDrawingSceneV2SvgWithTokens(scene,tokens)
  }
  if(drawing){drawing=drawing.replace('</style>',fonts+'</style>');assert.equal((drawing.match(/@font-face/g)??[]).length,2);const id=`${format}-p${spec.page}`;drawing=drawing.replace('aria-labelledby="title desc"',`aria-labelledby="${id}-title ${id}-desc"`).replace('id="title"',`id="${id}-title"`).replace('id="desc"',`id="${id}-desc"`);sceneRecords[spec.page]={...(sceneRecords[spec.page] as object??{}),svg:hash(drawing)};await writeFile(resolve(work,`${format}-${spec.page}.svg`),drawing)}
  const caption='caption' in spec?`<p class="caption">${esc(spec.caption)}</p>`:''
  const side=spec.page%2===0?'left':'right'
  pages[format].push(`<section class="page ${side}" data-page="${spec.page}">${spec.kind==='intro'?proofIntro:`${drawing}<header>${esc(spec.title)}</header>${caption}`}<footer>${String(spec.page).padStart(2,'0')}</footer></section>`)
 }
 sceneRecords.spread={scene:hash(JSON.stringify(spread)),scale:50,locatorScale:500}
 ;(manifest.scenes as Record<string,unknown>)[format]=sceneRecords
}
const css=`${fonts}
html,body{margin:0;padding:0;background:white;color:black}*{box-sizing:border-box}svg{display:block;max-width:none;max-height:none;position:absolute;left:0;top:0;overflow:hidden}.page{position:relative;overflow:hidden;background:white;font-family:"Source Sans 3"}.page header{position:absolute;top:17mm;font-size:9pt;line-height:1.15;font-weight:700;max-width:130mm}.page.left header,.page.left .caption{left:11mm;right:20mm}.page.right header,.page.right .caption{left:20mm;right:11mm}.caption{position:absolute;bottom:17mm;margin:0;font-size:7.5pt;line-height:1.3}.page footer{position:absolute;bottom:8mm;font-size:6pt}.page.left footer{left:15mm}.page.right footer{right:15mm}.intro{position:absolute;left:24mm;right:24mm;top:29mm;font-size:9pt;line-height:1.4}.intro h1{font-size:18pt;line-height:1.1;margin:0 0 3mm}.intro .sub{font-size:11pt;margin:0 0 12mm}.intro p{margin:0 0 5mm}.intro dl{display:grid;grid-template-columns:15mm 1fr;gap:1.6mm 2mm;margin:9mm 0;font-size:8pt}.intro dt,.intro dd{margin:0}.intro .limit{font-size:7.5pt;line-height:1.35}`
for(const format of ['b5','a4'] as const){const p=bookProfiles[format];await writeFile(resolve(work,format+'.html'),`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Architectural book proof</title><style>${css}@page{size:${p.width}mm ${p.height}mm;margin:0}.page{width:${p.width}mm;height:${p.height}mm;break-after:page}.page:last-child{break-after:auto}</style></head><body>${pages[format].join('')}</body></html>`)}
const facing:string[]=[]
for(let i=-1;i<pages.b5.length;i+=2){const left=i<0?'':pages.b5[i],right=pages.b5[i+1]??'';facing.push(`<section class="sheet"><div class="facing-left">${left}</div><div class="facing-right">${right}</div></section>`)}
assert.equal(facing.length,8)
await writeFile(resolve(work,'spreads.html'),`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>B5 facing proof</title><style>${css}@page{size:352mm 250mm;margin:0}.sheet{position:relative;width:352mm;height:250mm;break-after:page;overflow:hidden}.sheet:last-child{break-after:auto}.page{width:176mm;height:250mm}.facing-left,.facing-right{position:absolute;top:0}.facing-left{left:0}.facing-right{left:176mm}</style></head><body>${facing.join('')}</body></html>`)
await writeFile(resolve(work,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')
console.log('PLT book proof prepared: 14 B5 / 14 A4 pages and eight B5 facing views. Source held; physical acceptance pending.')
