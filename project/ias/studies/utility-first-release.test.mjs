import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join,dirname} from 'node:path'
import {spawnSync} from 'node:child_process'

test('legitimate moved opening regenerates the actual arch line in both utility states',()=>{
  const root=new URL('../../../',import.meta.url),temp=mkdtempSync(join(tmpdir(),'ias-utility-opening-'))
  const producer='project/ias/studies/utility-first-release.mjs'
  const had='project/had/studies/water-replan.json',services='project/mat/studies/whole-house-service-baseline.json'
  try{
    for(const p of [producer,had,services]){mkdirSync(dirname(join(temp,p)),{recursive:true});writeFileSync(join(temp,p),readFileSync(new URL(p,root)))}
    const run=(...args)=>{const r=spawnSync(process.execPath,[join(temp,producer),...args],{encoding:'utf8'});assert.equal(r.status,0,r.stderr)}
    run();run('--check')
    const h=JSON.parse(readFileSync(join(temp,had),'utf8')),s=JSON.parse(readFileSync(join(temp,services),'utf8'))
    h.model.utilityDisposition.opening=[10450,11350]
    h.model.utilityDisposition.axis=2500
    s.air.transfer.utilityNorthBoundaryRequirement.rough=[10450,11350]
    s.air.transfer.utilityNorthBoundaryRequirement.axisY=2500
    const wall=h.model.groundWalls.find(w=>w.id==='utility-north')
    wall.holes=[[10450,11350]];wall.a[1]=2500;wall.b[1]=2500;wall.finishedFaces=[2403,2597]
    const wording='Isolated source-mutation test: utility raw OPENARCH10450..11350 atY2500; numerical utility fixtures and valve unchanged.'
    for(const u of [s.interfaces.architecturalServices.utility,s.rewinds.utility,h.model.architecturalServices.utility,h.model.servicesInterface.utility])u.working=wording
    writeFileSync(join(temp,had),JSON.stringify(h));writeFileSync(join(temp,services),JSON.stringify(s))
    run();run('--check')
    const sheet=readFileSync(join(temp,'project/ias/studies/utility-first-release.svg'),'utf8')
    assert(sheet.includes('d="M106.25 57.5H173.75"'),'first state retained a stale opening line')
    assert(sheet.includes('d="M306.25 57.5H373.75"'),'second state retained a stale opening line')
    assert(!sheet.includes('d="M91.25 53.75H158.75"'),'old first-state source line survived regeneration')
    assert(sheet.includes('RAW OPEN ARCH 900'),'raw width must not imply finished clearance')
  }finally{rmSync(temp,{recursive:true,force:true})}
})
