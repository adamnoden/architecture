import {createSectionContrastScene} from '../../../compiler/architectural-drawing/section-contrast-fixture.js'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {design} from '../../../compiler/reference-house/georgian/section-exemplar.js'
import {createSectionExemplar,exemplarViews,design as sectionRoofSource} from '../../../compiler/reference-house/georgian/section-exemplar.js'
import {auditGeorgianReplan,auditRoomAccess} from '../../../compiler/reference-house/georgian/audit.js'
import {renderDrawingSceneV2SvgWithTokens} from '../../../compiler/publication-drawing-v2/svg.js'
import {PLT_CANDIDATE_TOKENS} from '../../../compiler/publication-drawing-v2/plt-candidate-tokens.js'
await import('../plt11/prepare.js')
const root=import.meta.dirname,work=resolve(root,'.work');await mkdir(work,{recursive:true})
const old=await readFile(resolve(root,'../plt04/.work/ground-100.svg'),'utf8'),fonts=(old.match(/@font-face\{[^}]+\}/g)??[]).join('')
const views=[...exemplarViews,'ENGINE-CONTRAST'] as const
const access={ground:auditRoomAccess('GROUND'),first:auditRoomAccess('FIRST')};assert.ok(access.ground.pass&&access.first.pass,JSON.stringify(access));
const historicalPlanAudit=auditGeorgianReplan();const audit={...historicalPlanAudit,nominalAtticHeadroom:undefined,roofHighEdgeMm:design.roof.eaves+2100*Math.tan(25*Math.PI/180),atticStairAccepted:false,atticUse:design.atticUse};assert.equal(audit.pass,true,JSON.stringify(audit.failures))
const hash=(s:string)=>createHash('sha256').update(s).digest('hex')
const files:Record<string,{svg:string;scene:string}>={},html:Record<number,string[]>={100:[],50:[]}
for(const scale of [100,50] as const)for(const view of views){
 const scene=view==='ENGINE-CONTRAST'?createSectionContrastScene(scale):createSectionExemplar(view,scale),json=JSON.stringify(scene),svg=renderDrawingSceneV2SvgWithTokens(scene,PLT_CANDIDATE_TOKENS).replace('</style>',fonts+'</style>'),name=`${view.toLowerCase()}-${scale}`
 await writeFile(resolve(work,name+'.svg'),svg);await writeFile(resolve(work,name+'-scene.json'),JSON.stringify(scene,null,2)+'\n');files[name]={svg:hash(svg),scene:hash(json)}
 const id=svg.match(/data-view-id="([^"]+)"/)?.[1];assert.ok(id)
 const scoped=svg.replace(/<style>([\s\S]*?)<\/style>/,(_,css:string)=>`<style>${css.replace(/(^|})(\.[^{]+)\{/g,`$1svg[data-view-id="${id}"] $2{`)}</style>`)
 html[scale].push(`<section><header>${view} — SECTION / ROOF CANDIDATE — 1:${scale}</header>${scoped}</section>`)
}
for(const [name,scale]of [['book',100],['wall',50]] as const)await writeFile(resolve(work,name+'.html'),`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Sections and roof</title><style>${fonts}</style></head><body>${html[scale].join('')}</body></html>`)
await writeFile(resolve(work,'source.json'),JSON.stringify({design,sectionRoofSource},null,2)+'\n')
await writeFile(resolve(work,'manifest.json'),JSON.stringify({packet:'PLT-SECTION-ASSEMBLIES',workingSourceAccepted:true,views,sourceSha256:hash(JSON.stringify({design,sectionRoofSource})),files,audit,access,ownerPhysicalVerdict:'UNREVIEWED',printTokensFrozen:false,fullHistoricalSystemRevalidation:false,fitScaling:false,profiles:{b5:[176,250,6,100],a4:[210,297,6,100],a2:[420,594,6,50]}},null,2)+'\n')
console.log('Section assemblies prepared: five held-house readings and independent engine contrast.')
