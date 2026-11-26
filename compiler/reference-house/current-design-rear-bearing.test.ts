import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {sha256SemanticFingerprint} from '../core/identity.js'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {floorSectionStageFields,readFloorSectionCase,savedFloorSectionCase,runFloorSectionCase} from './current-design/structural-floor-section.js'
import {readRearBearingSettings,runRearBearingComparison} from './current-design/structural-rear-bearing.js'

const source={planDigest:'actual-source-test'}
const choices=JSON.parse(execFileSync('python3',['-B','-c',"import sys,json;sys.path.insert(0,'project/str/studies');from rear_bearing_plan import choices_defaults;print(json.dumps(choices_defaults()))"],{encoding:'utf8'}))
test('optional rear comparison requires existing finite controls and does not supply a second house',()=>{
 assert.equal(runRearBearingComparison({},undefined,undefined,source),null)
 assert.throws(()=>runRearBearingComparison({},choices,undefined,source),/finite-joint comparison/)
 assert.throws(()=>runRearBearingComparison({},choices,{execution:'deferred',enabled:false,youngMPa:8250,solidPitchMm:140},source),/enabled finite/)
 const forged={...choices,sourceSHA256:{claimed:'approval'}}
 assert.throws(()=>readRearBearingSettings(forged),/Exact rear/)
 const changed=readRearBearingSettings({...choices,openingYMm:[9150,10950]})
 assert.deepEqual(changed.openingYMm,[9150,10950])
 assert.notDeepEqual(changed,readRearBearingSettings(choices))
})

test('the sole saved floor case carries optional rear choices and rejects incompatible controls before solving',()=>{
 const resolved=readCurrentDesignResolution(),base=readFloorSectionCase(resolved).section
 const canonical=JSON.parse(readFileSync('project/ccr/studies/working-house-comparison.json','utf8'))
 const settings=canonical.stages.floorSection
 const upper={caseId:'SAVED-REAR',comparison:base.comparison.bearingCase} as any
 const finite={execution:'deferred',enabled:true,youngMPa:8250,solidPitchMm:140}
 const documentSettings={...settings,finiteJointComparison:finite,rearBearingComparison:choices}
 assert.ok((floorSectionStageFields as readonly string[]).includes('rearBearingComparison'))
 const saved=savedFloorSectionCase(base,documentSettings,upper)
 assert.deepEqual(saved.rearBearingComparison,choices)
 assert.deepEqual(saved.finiteJointComparison,finite)
 assert.deepEqual(saved.comparison.bearingCase,upper.comparison)
 assert.equal(saved.comparison.wetSupport,settings.wetSupport)
 const edited=savedFloorSectionCase(base,{...documentSettings,rearBearingComparison:{...choices,openingYMm:[9125,10925]}},upper)
 assert.notEqual(sha256SemanticFingerprint(saved),sha256SemanticFingerprint(edited))
 assert.deepEqual(edited.rearBearingComparison!.openingYMm,[9125,10925])
 for(const bad of [
  {...documentSettings,finiteJointComparison:undefined},
  {...documentSettings,finiteJointComparison:{...finite,enabled:false}},
  {...documentSettings,wetSupport:null},
  {...documentSettings,thicknessMm:250},
 ])assert.throws(()=>savedFloorSectionCase(base,bad,upper),/Rear bearing requires/)
 for(const bad of [
  {...saved,finiteJointComparison:undefined},
  {...saved,finiteJointComparison:{...finite,enabled:false}},
  {...saved,comparison:{...saved.comparison,wetSupport:null}},
  {...saved,comparison:{...saved.comparison,thicknessMm:250}},
 ])assert.throws(()=>runFloorSectionCase(resolved,bad),/Rear bearing requires/)
 assert.throws(()=>runFloorSectionCase(resolved,{...saved,rearBearingComparison:{...choices,sourceSHA256:{forged:true}}}),/Exact rear bearing/)
 assert.throws(()=>runFloorSectionCase(resolved,{...saved,bindingDigest:'old'}),/Stale or malformed/)
})
