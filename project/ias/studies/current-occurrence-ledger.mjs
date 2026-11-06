/** Current source map and stale-snapshot audit; no motion or installation admission. */
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {isDeepStrictEqual as equal} from 'node:util'
import assert from 'node:assert/strict'
const root=new URL('../../../',import.meta.url)
const paths={had:'project/had/studies/water-replan.json',services:'project/mat/studies/whole-house-service-baseline.json',ias:'project/ias/studies/selected-family-convergence.json',materials:'project/mat/studies/interiors-whole-house-assembly.json'}
const sources={},data={}
for(const [id,path] of Object.entries(paths)){
  const bytes=readFileSync(new URL(path,root))
  sources[id]={path,blob:createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex')}
  data[id]=JSON.parse(bytes)
}
const H=data.had.model,I=data.ias,M=data.materials
const snapshot=I.occurrenceSet.sourceFurniture
function differences(before,now){return {
  beforeCount:Object.keys(before).length,currentCount:Object.keys(now).length,
  added:Object.keys(now).filter(k=>!(k in before)).sort(),
  removed:Object.keys(before).filter(k=>!(k in now)).sort(),
  changed:Object.keys(now).filter(k=>k in before&&!equal(before[k],now[k])).sort().map(id=>({id,before:before[id],current:now[id]}))
}}
const furniture={GROUND:H.groundFurniture,FIRST:H.upperFurniture}
const snapshotDifferences=Object.fromEntries(Object.entries(furniture).map(([level,current])=>[level,differences(snapshot[level],current)]))
const geometricDoorFields=['rough','axis','frameEach','frameDepth','leaf','hinge','closed','open','edgeGapsEach','minimumClearBudget']
const protectedDoorDifferences=[]
for(const door of H.protectedRoute.doors){
  const before=I.occurrenceSet.protectedDoors.find(d=>d.id===door.id)
  if(!before){protectedDoorDifferences.push({id:door.id,status:'not in older IAS snapshot'});continue}
  for(const field of geometricDoorFields)if(field in door&&field in before&&!equal(door[field],before[field]))protectedDoorDifferences.push({id:door.id,field,before:before[field],current:door[field]})
}
function responsibility(id){
  if(id.startsWith('service-emitter-')){
    const nativeId=id.slice('service-emitter-'.length)
    assert(data.services.heat.emitterSchedule.some(e=>e.id===nativeId),'Current emitter has no owning service record: '+id)
    return {serviceSourceKey:`heat.emitterSchedule[id=${nativeId}].renewal`,owner:'Services / IAS / HAD',release:'Isolate and drain actual local valves; support emitter before union/bracket release; qualify complete lift/pull, lower room handling and restoration. No generic furniture deletion.'}}
  if(id.startsWith('service-utility-')){
    const key=id.slice('service-utility-'.length)
    assert(key in data.services.interfaces.architecturalServices.utility,'Current utility item has no owning service record: '+id)
    return {serviceSourceKey:`interfaces.architecturalServices.utility.${key}`,handlingSourceKey:'interfaces.architecturalServices.utility.working',owner:'Services / IAS / HAD',release:'Isolate actual water/electrical duties; support the complete device and retained services; qualify the specific access, first release, receiving state and restoration.'}
  }
  if(id.startsWith('service-')||id.startsWith('plant-'))return {owner:'Services / IAS / HAD',release:'Use the actual device isolation, fixed service support, independently opening access and complete exchange method; current plan box alone proves none of those tasks.'}
  if(/WC|basin|bath|shower|sink|cooking|cold-storage/.test(id))return {owner:'IAS / Services / MAT / HAD',release:'Retain occurrence-specific water/electrical isolation, real supported first release, complete moving package and reinstated boundary; do not borrow another fixture mechanism.'}
  return {owner:'IAS / HAD; MAT constituents',release:'Retain the whole source piece; empty and support it before any actual anti-tip/attachment release. Earn grip, route, receiving state and restored restraints where movement is required.'}
}
const currentFurniture=Object.fromEntries(Object.entries(furniture).map(([level,items])=>[level,Object.fromEntries(Object.entries(items).map(([id,box])=>[id,{box,...responsibility(id)}]))]))
const rear=I.rearEmitterRepair.ordinary,principal=H.furnitureRequirements.principalBed,study=H.protectedRoute.doors.find(d=>d.id==='STUDY')
const preservedSourceJoins={
  bed4:{currentBody:H.upperFurniture.bed4,currentHead:H.upperFurniture['bed4-head'],newerIASBody:rear.bed,newerIASHead:rear.head,
    newerIASGeometryMatches:equal(H.upperFurniture.bed4,rear.bed)&&equal(H.upperFurniture['bed4-head'],rear.head),
    hadIndependentEvidence:H.rearRenewalEmitterJoin.independentEvidence,currentHADPass:H.rearRenewalEmitterJoin.pass,
    scope:'Preserve the explicitly joined newer emitter-aware repair at its existing limits; the old furniture snapshot is not its actual input.'},
  principal:{currentBody:H.upperFurniture.principal,currentHead:H.upperFurniture['principal-head'],
    sourceRequirementMatches:equal(H.upperFurniture.principal,principal.body)&&equal(H.upperFurniture['principal-head'],principal.head),
    maintenance:principal.maintenance,
    currentApproach:H.actions.witnesses.find(w=>w.id==='principal-wardrobe-foot-north-windows'),
    scope:'Current HAD records the 25 mm south correction and 500 mm north maintenance translation. This is not a rerun of the old IAS wardrobe route or a whole-export/handling pass.'},
  studyDoor:{currentDepth:study.frameDepth,door:study,operation:H.studyDoorOperation,scope:'Preserve the actual 230 mm-frame inside close/reopen witness. Actual assembly, outside first opening, support and room-side renewal remain unearned.'},
  familyDoor:{source:H.familyOperationEvidence.source,geometryEquivalent:H.familyOperationEvidence.familyGeometryEquivalent,
    projectionEquivalent:H.familyOperationEvidence.projectionEquivalent,
    scope:'Retain the current HAD keyed join to its independent family-door evidence; no physical closer/force admission.'}
}
assert(preservedSourceJoins.bed4.newerIASGeometryMatches,'Current Bed4 boxes no longer match the preserved newer IAS repair; reconcile that relationship before regeneration')
assert(preservedSourceJoins.bed4.currentHADPass,'Current HAD no longer preserves the claimed emitter-aware Bed4 repair')
assert(preservedSourceJoins.bed4.hadIndependentEvidence.geometryEquivalent,'Current HAD no longer asserts the independently joined Bed4 repair equivalence')
assert(preservedSourceJoins.principal.sourceRequirementMatches,'Current principal boxes no longer match the preserved HAD maintenance requirement; reconcile before regeneration')
assert(preservedSourceJoins.principal.maintenance.pass,'Current HAD no longer preserves the claimed principal-bed maintenance state')
assert(preservedSourceJoins.principal.currentApproach?.pass,'Current HAD no longer preserves the claimed principal wardrobe approach')
const studyOperation=preservedSourceJoins.studyDoor.operation
const studyProjectionMatches=['rough','leaf','hinge','frameEach'].every(k=>equal(study[k],studyOperation[k]))
const studyFrameMatches=studyOperation.checkedFramePieces.length===2&&studyOperation.checkedFramePieces.every((r,i)=>
  equal(r,[i?study.rough[1]-study.frameEach:study.rough[0],study.axis-study.frameDepth/2,study.frameEach,study.frameDepth]))
assert(study.frameDepth===studyOperation.completeFrameEnvelopeDepth&&studyProjectionMatches&&studyFrameMatches&&studyOperation.pass,
  'Current Study door/frame no longer matches the preserved HAD operation envelope')
assert(preservedSourceJoins.familyDoor.geometryEquivalent&&preservedSourceJoins.familyDoor.projectionEquivalent,'Current HAD no longer preserves the claimed family-door geometry/projection equivalence')
const currentMap={
  wallSegments:{groundWalls:H.groundWalls,upperWalls:H.upperWalls},
  furniture:currentFurniture,protectedDoors:H.protectedRoute.doors,
  openings:H.openings,
  protectedRoofClosureDomains:H.protectedRoofClosureDomains,
  floorSections:H.sections,baseboardTerminations:H.baseboardTerminations,
  localServiceCeilings:{rear:{underside:data.services.interfaces.rearShowerDrop.finishedPanelUnderside,hatch:data.services.interfaces.rearShowerDrop.clearHatch},bath:{underside:data.services.interfaces.familyBathDrop.lower.finishedPanelUnderside,hatch:data.services.interfaces.familyBathDrop.lower.clearHatch}},
  materialOccurrences:M.occurrences.map(o=>({id:o.id,name:o.name,families:o.families})),
  materialSourceDomain:{hadHead:M.geometry.HADHead,hadBlob:M.geometry.HADJSONBlob,services:M.geometry.services},
  fixedScene:{stair:H.stair,void:H.void,fixedObstacles:H.fixedObstacles,court:H.court,envelopeSource:'model.envelope / groundWalls / upperWalls / openings; retain the complete enclosure in every applicable motion proof'}
}
const result={status:'IAS current-source occurrence/disassembly ledger; IAS-03 open; no route, joint, installation, material or performance admission',
  geometryUnits:'mm; furniture rectangles are [x,y,width,depth] plan records, not complete XYZ envelopes. Other copied source fields retain their owning definitions and units.',sources,
  counts:{groundFurniture:Object.keys(furniture.GROUND).length,upperFurniture:Object.keys(furniture.FIRST).length,wallSegments:H.groundWalls.length+H.upperWalls.length,protectedDoors:H.protectedRoute.doors.length,openings:Object.values(H.openings).reduce((n,a)=>n+a.length,0),materialOccurrenceRoles:M.occurrences.length},
  currentMap,snapshotDifferences,protectedDoorDifferences,preservedSourceJoins,
  boundaries:['Generated source map is current only for its recorded blobs; --check fails when any recorded map/source changes.',
    'Snapshot differences are dependency findings, not universal failures of newer independently sourced proofs.',
    'The MAT eighteen-role schedule remains at its own immutable HAD/service identities; this map does not repin or reopen its completed alternatives investigation.',
    'Conventional rear joint remains the specific native seat/straight sealing land/tolerance/engagement hold recorded in ias-03-renewal-proportionality-result.md.',
    'All retained fixtures, structural obstacles, stair and court/weather enclosure remain in each applicable whole-event proof.']}
const target=new URL('./current-occurrence-ledger.json',import.meta.url),text=JSON.stringify(result,null,2)+'\n'
if(process.argv.includes('--check')){if(readFileSync(target,'utf8')!==text)throw Error('Current IAS occurrence map/source drift; reconcile owning sources and explicit exit ledger before regenerating')}
else writeFileSync(target,text)
console.log(JSON.stringify({status:result.status,counts:result.counts,differences:Object.fromEntries(Object.entries(snapshotDifferences).map(([level,d])=>[level,{added:d.added.length,removed:d.removed.length,changed:d.changed.length}])),protectedDoorDifferences,preservedSourceJoins:{bed4:preservedSourceJoins.bed4.newerIASGeometryMatches,principal:preservedSourceJoins.principal.sourceRequirementMatches}},null,2))
