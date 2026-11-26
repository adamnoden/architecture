import assert from 'node:assert/strict'
import test from 'node:test'
import { studyOrdinaryPlanAppliesToParts, type StudyOrdinaryHandlingPlan } from './current-design/assemblies/study-ordinary-handling.js'

const plan = (ids: readonly unknown[]): StudyOrdinaryHandlingPlan => ({
  schema:'ias-study-ordinary-handling-plan/1', boards:[{id:'square',sizeMm:[300,300],padTurnDeg:0}],
  pickupClearanceMm:5, maximumTravelMm:1200, protocols:ids.map(partId=>({partId})),
})

test('a width edit withholds the former136-part plan against the actual144-part family without rewriting the input',()=>{
  const oldIds=Array.from({length:136},(_,i)=>'former/'+i),currentIds=Array.from({length:144},(_,i)=>'current/'+i)
  const authored=plan(oldIds),before=JSON.stringify(authored)
  assert.equal(studyOrdinaryPlanAppliesToParts(authored,currentIds),false)
  assert.equal(JSON.stringify(authored),before)
  assert.equal(studyOrdinaryPlanAppliesToParts(authored,[...oldIds].reverse()),true)
})
test('same count and one changed identity still invalidates renewal evidence',()=>{
  assert.equal(studyOrdinaryPlanAppliesToParts(plan(['a','b']),['a','different']),false)
})
test('malformed or duplicate protocol identities remain rejected',()=>{
  for(const ids of [['a','a'],['a',null],['a','']])assert.throws(()=>studyOrdinaryPlanAppliesToParts(plan(ids),['a','b']),/INVALID_STUDY_ORDINARY_PART_IDENTITY/)
  assert.throws(()=>studyOrdinaryPlanAppliesToParts(plan(['a','b']),['a','a']),/DUPLICATE_STUDY_CURRENT_PART_IDENTITY/)
})
