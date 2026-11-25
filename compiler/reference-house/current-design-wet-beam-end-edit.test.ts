import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { applyEngineeringEdit, beginEngineeringEdit, currentEngineeringReply, editableWetBeamEndId, editableFloorSectionId, engineeringBase,
  engineeringTicket, replayEngineeringEdit, saveEngineeringEdit } from './current-design/engineering-edit.js'

const support = JSON.parse(execFileSync('python3', ['-B', '-c', "import sys,json;sys.path.insert(0,'project/str/studies');from seated_wet_support import reference_support;print(json.dumps(reference_support(json.load(open('project/had/studies/water-replan.json'))['model'])))"], { encoding: 'utf8' }))
const cage = JSON.parse(readFileSync('project/str/studies/wet-support-cage-comparison-settings.json', 'utf8'))
const document = () => ({schema:'current-engineering-document/1',design:readGeorgianDesignSnapshot(),bindings:{retained:'binding'},stages:{
  roofPitch:{pitchDeg:25},floorSection:{thicknessMm:200,wetSupport:{...support,padWidthMm:120,padCentreOffsetsYMm:[40,0]},
    cageComparison:{...cage,postTopLevelRaiseMm:10},beamEndDevelopment:{endReturnMandrelMm:80,strutCotangentComparisons:[1,2.5]}}}})

test('one mandrel edit retains actual native geometry and chosen cage, saves and reverses exactly', () => {
  const state=beginEngineeringEdit(document(),'actual-end-edit'),old=saveEngineeringEdit(state)
  const operation={kind:'set-wet-beam-end-mandrel',assemblyId:editableWetBeamEndId,endReturnMandrelMm:100}
  const transaction={schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),operation}
  const result=applyEngineeringEdit(state,transaction)
  assert.equal(result.status,'applied')
  const changed=JSON.parse(saveEngineeringEdit(result.state)),before=JSON.parse(old)
  assert.deepEqual(changed,{...before,stages:{...before.stages,floorSection:{...before.stages.floorSection,
    beamEndDevelopment:{endReturnMandrelMm:100,strutCotangentComparisons:[1,2.5]}}}})
  assert.equal(saveEngineeringEdit(state),old)
  assert.equal(saveEngineeringEdit(beginEngineeringEdit(changed,'reload-end')),saveEngineeringEdit(result.state))
  const ticket=engineeringTicket(state,'old-end')
  assert.equal(currentEngineeringReply(result.state,engineeringTicket(result.state,'new-end'),{ticket}),undefined)
  const undo=replayEngineeringEdit(result.state,engineeringBase(result.state),'undo')
  assert.equal(undo.status,'applied');assert.equal(saveEngineeringEdit(undo.state),old)
  const redo=replayEngineeringEdit(undo.state,engineeringBase(undo.state),'redo')
  assert.equal(saveEngineeringEdit(redo.state),saveEngineeringEdit(result.state))
  assert.equal(applyEngineeringEdit(result.state,transaction).status,'rejected')
  assert.equal(applyEngineeringEdit(state,{...transaction,operation:{...operation,endReturnMandrelMm:80}}).state,state)
  for(const bad of [{...transaction,units:'m'}, {...transaction,operation:{...operation,assemblyId:'STR/unknown'}},
    {...transaction,operation:{...operation,candidateAccepted:true}},
    ...[47,200,NaN].map(endReturnMandrelMm=>({...transaction,operation:{...operation,endReturnMandrelMm}}))]) {
    const rejected=applyEngineeringEdit(state,bad)
    assert.equal(rejected.status,'rejected');assert.equal(rejected.state,state)
  }
})

test('mandrel edits require an explicit current end comparison and cannot manufacture its native support or cage', () => {
  for(const field of ['wetSupport','cageComparison','beamEndDevelopment','thicknessMm']) {
    const input:Record<string,any>=document()
    delete input.stages.floorSection[field]
    const state=beginEngineeringEdit(input,'missing-'+field)
    const rejected=applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),
      operation:{kind:'set-wet-beam-end-mandrel',assemblyId:editableWetBeamEndId,endReturnMandrelMm:100}})
    assert.equal(rejected.status,'rejected');assert.equal(rejected.state,state)
  }
})


test('thickness editing admits known optional fields, keeps active end development at RC200 and preserves ordinary comparisons', () => {
  const state=beginEngineeringEdit(document(),'end-thickness')
  const thickness=(base:ReturnType<typeof beginEngineeringEdit>,thicknessMm:number)=>applyEngineeringEdit(base,{
    schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(base),
    operation:{kind:'set-floor-section-thickness',assemblyId:editableFloorSectionId,thicknessMm}})
  const unchanged=thickness(state,200)
  assert.equal(unchanged.status,'applied','A valid end comparison must permit an unchanged RC200 control')
  assert.equal(unchanged.state,state)
  const rejected=thickness(state,250)
  assert.equal(rejected.status,'rejected');assert.equal(rejected.state,state)
  assert.equal(saveEngineeringEdit(rejected.state),saveEngineeringEdit(state))
  // End controls themselves remain RC200-only even if an unadmitted transport
  // document lacks its support. This operation cannot produce another conflict.
  const missingSupport:Record<string,any>=document()
  delete missingSupport.stages.floorSection.wetSupport
  const unsupported=beginEngineeringEdit(missingSupport,'end-without-support')
  assert.equal(thickness(unsupported,250).status,'rejected')
  for(const contour of [undefined,{execution:'deferred',pitchMm:140,youngKNPerM2:33000000,poisson:.2,slabVolumeLoadEquivalentKPa:0}]) {
    const ordinary={schema:'current-engineering-document/1',design:readGeorgianDesignSnapshot(),bindings:{},stages:{roofPitch:{pitchDeg:25},
      floorSection:{thicknessMm:200,...(contour?{contourComponent:contour}:{})}}}
    const before=beginEngineeringEdit(ordinary,'ordinary-'+String(!!contour)),changed=thickness(before,250)
    assert.equal(changed.status,'applied')
    const saved=JSON.parse(saveEngineeringEdit(changed.state))
    assert.equal(saved.stages.floorSection.thicknessMm,250)
    assert.deepEqual(saved.stages.floorSection.contourComponent,contour)
    const undo=replayEngineeringEdit(changed.state,engineeringBase(changed.state),'undo')
    assert.equal(saveEngineeringEdit(undo.state),saveEngineeringEdit(before))
  }
})
