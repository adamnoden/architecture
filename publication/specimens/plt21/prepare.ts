import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {createExteriorIsometricScene,exteriorViews,exteriorProfiles,exteriorSource,exteriorFingerprint} from '../../../compiler/reference-house/georgian/exterior-isometrics.js'
import {renderDrawingSceneV2SvgWithTokens} from '../../../compiler/publication-drawing-v2/svg.js'
import {PLT_CANDIDATE_TOKENS as tokens} from '../../../compiler/publication-drawing-v2/plt-candidate-tokens.js'
import {fetchPublicationFonts} from '../../fonts.js'
const root=import.meta.dirname,work=resolve(root,'.work'),assets=resolve(root,'../../../public/drawings/exterior-isometrics')
await mkdir(work,{recursive:true});await mkdir(assets,{recursive:true})
const hash=(value:string)=>createHash('sha256').update(value).digest('hex')
const proofs=process.argv.includes('--proof'),check=process.argv.includes('--check')
const manifest={source:exteriorSource.id,modelFingerprint:exteriorFingerprint,profiles:exteriorProfiles,physicalAcceptance:false,roofSelectionFinal:false,files:{} as Record<string,string>}
const title=(s:string)=>s.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join('-')
for(const view of exteriorViews){
 const svg=renderDrawingSceneV2SvgWithTokens(createExteriorIsometricScene(view,'svg'),tokens)+'\n',path=resolve(assets,view+'.svg')
 if(check){if(await readFile(path,'utf8')!==svg)throw Error('Stale exterior SVG: '+view)}else await writeFile(path,svg)
 manifest.files[view]=hash(svg)
}
if(proofs){
 const fonts=await fetchPublicationFonts(resolve(work,'fonts'))
 const css=(await Promise.all([['PUBLICATION_SANS_REGULAR',400],['PUBLICATION_SANS_BOLD',700]].map(async([slot,weight])=>`@font-face{font-family:"Source Sans 3";font-style:normal;font-weight:${weight};src:url(data:font/ttf;base64,${(await readFile(fonts[slot as keyof typeof fonts])).toString('base64')}) format("truetype");}`))).join('')
 for(const format of ['b5','a4','a2'] as const){
  const p=exteriorProfiles[format]
  const pages=exteriorViews.map(view=>`<section><h1>${title(view)}</h1>${renderDrawingSceneV2SvgWithTokens(createExteriorIsometricScene(view,format),tokens)}<p class="foot">Intact exterior · isometric · NTS<br>Nominal facade notation; roof/water design remains provisional.</p></section>`)
  // Comparison uses four BOOK-factor scenes translated into equal cells, never fit-scaled.
  if(format==='a2')pages.push(`<section><h1>Four exterior views</h1><div class="grid">${exteriorViews.map(v=>`<div class="cell"><h2>${title(v)}</h2>${renderDrawingSceneV2SvgWithTokens(createExteriorIsometricScene(v,'b5'),tokens)}</div>`).join('')}</div><p class="foot">One house · four cameras · common factor within each profile · NTS</p></section>`)
  const html=`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Exterior isometrics — ${format.toUpperCase()}</title><style>${css}@page{size:${p.width}mm ${p.height}mm;margin:0}*{box-sizing:border-box}body{margin:0;font-family:"Source Sans 3"}section{position:relative;width:${p.width}mm;height:${p.height}mm;break-after:page;overflow:hidden}section:last-child{break-after:auto}section>svg{position:absolute;inset:0}h1{position:absolute;top:${format==='a2'?25:13}mm;left:15mm;right:15mm;text-align:center;margin:0;font-size:7pt;font-weight:700}.foot{position:absolute;bottom:${format==='a2'?24:12}mm;left:12mm;right:12mm;text-align:center;font-size:6pt;line-height:1.5;margin:0}.grid{position:absolute;top:40mm;left:20mm;display:grid;grid-template-columns:176mm 176mm;column-gap:28mm;row-gap:8mm}.cell{position:relative;width:176mm;height:250mm}.cell svg{width:176mm;height:250mm}h2{position:absolute;top:7mm;left:0;width:100%;text-align:center;font-size:7pt;font-weight:400;margin:0}</style></head><body>${pages.join('')}</body></html>`
  await writeFile(resolve(work,format+'.html'),html)
 }
}
await writeFile(resolve(work,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')
console.log(check?'Four exterior SVGs match current source.':'Four exterior isometrics generated from one source model.')
