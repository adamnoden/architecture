import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {createResolvedReferenceHouseSource,groundPlanResolution,auditCurrentStairReservation} from '../../../compiler/reference-house/plan-resolution.js'
import {compileReferenceHouseSystem} from '../../../compiler/reference-house/system-compile.js'
import {createResolvedReferenceHouseAdePlanScene} from '../../../compiler/reference-house/resolved-ade-plan-scene.js'
import {createResolvedReferenceHouseAdePlan} from '../../../compiler/reference-house/resolved-ade-plan.js'
import {renderDrawingSceneV2SvgWithTokens} from '../../../compiler/publication-drawing-v2/svg.js'
import {auditSquareStairOptions} from '../../../compiler/reference-house/square-stair-audit.js'
import {auditResolvedHallCirculation} from '../../../compiler/reference-house/hall-circulation.js'
import {ADE03B_PROOF_TOKENS} from '../ade03b/tokens.js'
await import('../plt03b5/prepare.js')
const root=import.meta.dirname,work=resolve(root,'.work'),ade=resolve(root,'../plt03b5/.work')
await mkdir(work,{recursive:true})
const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex')
const oldBook=await readFile(resolve(ade,'ground-100.svg'),'utf8'),oldWall=await readFile(resolve(ade,'ground-50.svg'),'utf8')
const fontCss=(oldBook.match(/@font-face\{[^}]+\}/g)??[]).join('')
const source=createResolvedReferenceHouseSource(),system=compileReferenceHouseSystem(source)
assert.equal(system.status,'PASS')
const circulation=auditResolvedHallCirculation(source,groundPlanResolution)
assert.equal(circulation.pass,true,JSON.stringify(circulation.checks))
const files:Record<string,{sha256:string;sceneSha256:string}>={}
const svgs:Record<string,string>={}
for(const level of ['GROUND','FIRST'] as const)for(const scale of [100,50] as const){
 const scene=createResolvedReferenceHouseAdePlanScene(system.house,source,scale,level)
 const svg=renderDrawingSceneV2SvgWithTokens(scene,ADE03B_PROOF_TOKENS).replace('</style>',fontCss+'</style>')
 const name=`${level.toLowerCase()}-${scale}.svg`
 svgs[name]=svg
 await writeFile(resolve(work,name),svg)
 await writeFile(resolve(work,`${level.toLowerCase()}-${scale}-scene.json`),JSON.stringify(scene,null,2)+'\n')
 files[name]={sha256:hash(svg),sceneSha256:hash(JSON.stringify(scene))}
}
const isolate=(svg:string)=>{
 const id=svg.match(/data-view-id="([^"]+)"/)?.[1];assert.ok(id)
 return svg.replace(/<style>([\s\S]*?)<\/style>/,(_,css:string)=>`<style>${css.replace(/(^|})(\.[^{]+)\{/g,`$1svg[data-view-id="${id}"] $2{`)}</style>`)
}
const page=(svg:string,label:string)=>`<section><header>${label}</header>${isolate(svg)}</section>`
const html=(body:string)=>`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Ground plan: previous and revised</title><style>${fontCss}</style></head><body>${body}</body></html>`
await writeFile(resolve(work,'book.html'),html(page(oldBook,'PREVIOUS — PLT-03B.5 — 1:100')+page(svgs['ground-100.svg'],'B6 — 12 × 12 m / 3.1 m CEILINGS — 1:100')))
await writeFile(resolve(work,'wall.html'),html(page(svgs['ground-50.svg'],'B6 — 12 × 12 m / 3.1 m CEILINGS — 1:50')))
await writeFile(resolve(work,'previous-wall.svg'),oldWall)
await writeFile(resolve(work,'source.json'),JSON.stringify({base:source,choices:groundPlanResolution},null,2)+'\n')
await writeFile(resolve(work,'ground-semantics.json'),JSON.stringify(createResolvedReferenceHouseAdePlan(system.house,source),null,2)+'\n')
await writeFile(resolve(work,'manifest.json'),JSON.stringify({packet:'PLT-03B.6',ownerPhysicalVerdict:'UNREVIEWED',printTokensFrozen:false,fitScaling:false,
 sources:{baseline:hash(oldBook),book:files['ground-100.svg'].sha256,wall:files['ground-50.svg'].sha256},files,
 sourceSha256:hash(JSON.stringify({source,choices:groundPlanResolution})),systemStatus:system.status,
 circulation,squareStairOptions:auditSquareStairOptions(),stairAudit:auditCurrentStairReservation(),stairSelection:groundPlanResolution.stair,
 profiles:{b5:[176,250,2,100],a4:[210,297,2,100],a2:[420,594,1,50]},
 architecturalChangeClass:'S — explicit provisional source choices; historical proofs untouched',X:[]},null,2)+'\n')
console.log('Prepared PLT-03B.6 labelled comparison, paired-level coordination and actual return stair from provisional architectural source.')
