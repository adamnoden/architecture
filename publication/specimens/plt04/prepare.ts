import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {groundPlanResolution,auditCurrentStairReservation} from '../../../compiler/reference-house/plan-resolution.js'
import {compileReferenceHouseSystem} from '../../../compiler/reference-house/system-compile.js'
import {createResolvedReferenceHouseAdePlanScene} from '../../../compiler/reference-house/resolved-ade-plan-scene.js'
import {renderDrawingSceneV2SvgWithTokens} from '../../../compiler/publication-drawing-v2/svg.js'
import {auditSquareStairOptions} from '../../../compiler/reference-house/square-stair-audit.js'
import {auditResolvedHallCirculation} from '../../../compiler/reference-house/hall-circulation.js'
import {PLT_CANDIDATE_TOKENS} from '../../../compiler/publication-drawing-v2/plt-candidate-tokens.js'
import {createPairedReferenceHouseSource,createPairedReferenceHouseAdePlan,firstFloorPlanResolution} from '../../../compiler/reference-house/first-floor-plan-resolution.js'
await import('../plt03b6/prepare.js')
const root=import.meta.dirname,work=resolve(root,'.work'),ade=resolve(root,'../plt03b6/.work')
await mkdir(work,{recursive:true})
const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex')
const oldBook=await readFile(resolve(ade,'ground-100.svg'),'utf8'),oldWall=await readFile(resolve(ade,'ground-50.svg'),'utf8')
const fontCss=(oldBook.match(/@font-face\{[^}]+\}/g)??[]).join('')
const source=createPairedReferenceHouseSource(),system=compileReferenceHouseSystem(source)
assert.equal(system.status,'PASS')
const circulation=auditResolvedHallCirculation(source,groundPlanResolution)
assert.equal(circulation.pass,true,JSON.stringify(circulation.checks))
const files:Record<string,{sha256:string;sceneSha256:string}>={}
const svgs:Record<string,string>={}
for(const level of ['GROUND','FIRST'] as const)for(const scale of [100,50] as const){
 const scene=createResolvedReferenceHouseAdePlanScene(system.house,source,scale,level,createPairedReferenceHouseAdePlan(system.house,source,level))
 const svg=renderDrawingSceneV2SvgWithTokens(scene,PLT_CANDIDATE_TOKENS).replace('</style>',fontCss+'</style>')
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
const html=(body:string)=>`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Paired ground and first-floor plans</title><style>${fontCss}</style></head><body>${body}</body></html>`
await writeFile(resolve(work,'book.html'),html(page(svgs['ground-100.svg'],'GROUND FLOOR — 1:100')+page(svgs['first-100.svg'],'FIRST FLOOR — 1:100')))
await writeFile(resolve(work,'wall.html'),html(page(svgs['ground-50.svg'],'GROUND FLOOR — 1:50')+page(svgs['first-50.svg'],'FIRST FLOOR — 1:50')))
await writeFile(resolve(work,'previous-wall.svg'),oldWall)
await writeFile(resolve(work,'source.json'),JSON.stringify({base:source,ground:groundPlanResolution,first:firstFloorPlanResolution},null,2)+'\n')
await writeFile(resolve(work,'ground-semantics.json'),JSON.stringify(createPairedReferenceHouseAdePlan(system.house,source),null,2)+'\n')
await writeFile(resolve(work,'manifest.json'),JSON.stringify({packet:'PLT-04.1',ownerScreenVerdict:'B6_ACCEPTED_FOR_CONTINUATION',ownerPhysicalVerdict:'UNREVIEWED',printTokensFrozen:false,fitScaling:false,
 sources:{baseline:hash(oldBook),book:files['ground-100.svg'].sha256,wall:files['ground-50.svg'].sha256},files,
 sourceSha256:hash(JSON.stringify({source,choices:groundPlanResolution,first:firstFloorPlanResolution})),systemStatus:system.status,
 circulation,squareStairOptions:auditSquareStairOptions(),stairAudit:auditCurrentStairReservation(),stairSelection:groundPlanResolution.stair,
 profiles:{b5:[176,250,2,100],a4:[210,297,2,100],a2:[420,594,2,50]},
 architecturalChangeClass:'S — explicit provisional source choices; historical proofs untouched',X:[]},null,2)+'\n')
await writeFile(resolve(work,'first-semantics.json'),JSON.stringify(createPairedReferenceHouseAdePlan(system.house,source,'FIRST'),null,2)+'\n')
assert.equal(files['ground-100.svg'].sha256,hash(oldBook),'B6 ground plate must remain unchanged')
assert.equal(files['ground-50.svg'].sha256,hash(oldWall),'B6 wall plate must remain unchanged')
console.log('Prepared paired GROUND/FIRST proofs; B6 ground SVGs unchanged; physical acceptance remains open.')
