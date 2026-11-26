import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
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
