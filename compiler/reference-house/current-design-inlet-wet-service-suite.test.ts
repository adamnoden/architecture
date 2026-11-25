import assert from 'node:assert/strict'
import test from 'node:test'
import {panSurfaceAt,wetSuiteLinkHead,admitWetServiceSuiteChoice} from './current-design/inlet-wet-service-suite.js'
test('pan join interpolates an independent plane and rejects unrepresented or stepped interfaces',()=>{
 const cell={id:'plane',cornersMm:[[0,0,100],[100,0,110],[100,100,130],[0,100,120]]}
 assert.deepEqual(panSurfaceAt([cell],25,75),{pointMm:[25,75,117.5],cellIds:['plane']})
 assert.throws(()=>panSurfaceAt([cell],101,0),/missing or stepped/)
 assert.throws(()=>panSurfaceAt([cell,{...cell,id:'different',cornersMm:cell.cornersMm.map(p=>[p[0],p[1],p[2]+1])}],25,75),/missing or stepped/)
 assert.throws(()=>panSurfaceAt([{...cell,cornersMm:[[0,0,100],[100,0,110],[100,100,140],[0,100,120]]}],25,75),/nonplanar/)
})
test('actual receiving pool, obstruction and source changes drive the conservative energy envelope',()=>{
 const q=240,w=520,r=wetSuiteLinkHead(q,w,1500,360,345,450),g=9.81,
  flow=q/60000,b=w/2000,yc=Math.cbrt(flow**2/(g*b*b))
 assert.equal(r.freeOutletAssumed,false);assert.equal(r.survivingWidthMm,260);assert.equal(r.bedDepositMm,32)
 assert.ok(r.requiredUpstreamPoolMm>450)
 assert.ok(wetSuiteLinkHead(q,w,1500,360,345,500).requiredUpstreamPoolMm>r.requiredUpstreamPoolMm)
 assert.ok(wetSuiteLinkHead(q+20,w,1500,360,345,450).requiredUpstreamPoolMm>r.requiredUpstreamPoolMm)
 assert.ok(wetSuiteLinkHead(q,w-40,1500,360,345,450).requiredUpstreamPoolMm>r.requiredUpstreamPoolMm)
 // Independent checks on every depth in the supported subcritical domain:
 // velocity head and Manning slope are bounded by their critical values.
 const sf=(depth:number)=>{const area=b*depth,radius=area/(b+2*depth);return .015**2*(flow/area)**2/radius**(4/3)}
 for(let k=1;k<=100;k++){const depth=yc*(1+k/10),v=flow/(b*depth);assert.ok(v*v/(2*g)<=yc/2);assert.ok(sf(depth)<=sf(yc))}
 assert.ok(Math.abs(r.chargedFrictionMm-sf(yc)*1500)<1e-10)
 const deep=wetSuiteLinkHead(q,w,1500,360,345,1000),depth=(1000-345-32)/1000,
  oracle=1000+1000*(flow/(b*depth))**2/(2*g)+sf(yc)*1500+1.5*500*yc
 assert.ok(Math.abs(deep.requiredUpstreamPoolMm-oracle)<1e-9,'Deep backwater uses reservoir energy, not a free-critical outlet')
 assert.throws(()=>wetSuiteLinkHead(0,w,1500,360,345,450),/Unsupported/)
})
test('versioned saved wet-suite choice recomputes geometry, joined backwater and explicit adverse states',async()=>{
 const {readCurrentDesignResolution}=await import('./current-design/resolve.js'),{readGeorgianDesignSnapshot}=await import('./current-design/georgian-source.js'),
  {readInletSourceEnvelopeCase,readLocalUtilityPocketSettings}=await import('./current-design/inlet-source-envelope.js'),{readGroundSectionCase}=await import('./current-design/structural-ground.js'),
  {readEngineeringDocument,compileEngineeringDocument}=await import('./current-design/engineering-document.js'),resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),ground=readGroundSectionCase(resolved),base=await readEngineeringDocument(readGeorgianDesignSnapshot()),
  doc={...base,stages:{roofPitch:base.stages.roofPitch,groundSection:{caseId:ground.ground.caseId,settings:ground.ground.settings},inletSourceEnvelope:{...readLocalUtilityPocketSettings(),splitPlantRoom:request.sourceEnvelope.splitPlantRoom,wetServiceSuite:request.sourceEnvelope.wetServiceSuite}}},
  before=await compileEngineeringDocument(JSON.parse(JSON.stringify(doc))),inlet=before.engineering.inletSourceEnvelope!,suite=inlet.wetServiceSuite
 if(suite.state!=='unselected-connected-wet-service-suite')throw Error('Actual saved wet suite required')
 assert.equal(suite.selected,false);assert.equal(suite.storedRelease.actualContainmentScreen,null);assert.equal(suite.storedRelease.conditionalImpulseTestRequired,false)
 assert.equal(suite.coupledSourceCases[0].link.freeOutletAssumed,false)
 assert.equal(suite.coupledSourceCases[2].conditionalSteadyEnergyScreen,false)
 assert.equal(suite.allOutletsBlocked.conditionalSteadyEnergyScreen,false);assert.equal(suite.highSubmerged.conditionalSteadyEnergyScreen,false)
 assert.ok(suite.geometry.raisedPlantSpillLipMm>=0)
 assert.equal(suite.lobbyPocket.local?.supportPresentAtSides.north,true)
 const moved=structuredClone(doc);moved.stages.inletSourceEnvelope.wetServiceSuite.clearWidthMm-=20
 const after=await compileEngineeringDocument(moved),changed=after.engineering.inletSourceEnvelope!.wetServiceSuite
 if(changed.state!=='unselected-connected-wet-service-suite')throw Error('Changed saved wet suite required')
 assert.ok(changed.coupledSourceCases[0].sourcePoolMm>suite.coupledSourceCases[0].sourcePoolMm)
 assert.deepEqual(after.engineering.inletSourceEnvelope!.bound,inlet.bound);assert.deepEqual(after.engineering.inletSourceEnvelope!.roomCatchment,inlet.roomCatchment)
 assert.deepEqual(after.engineering.inletSourceEnvelope!.splitPlantRoom,inlet.splitPlantRoom);assert.deepEqual(after.engineering.groundSection,before.engineering.groundSection);assert.deepEqual(after.engineering.roofPitch,before.engineering.roofPitch)
 const malformed={...doc.stages.inletSourceEnvelope.wetServiceSuite,settingMm:0};assert.throws(()=>admitWetServiceSuiteChoice(malformed),/Unsupported/)
 const absent=structuredClone(doc);delete (absent.stages.inletSourceEnvelope as any).wetServiceSuite
 const omitted=await compileEngineeringDocument(absent);assert.equal(omitted.engineering.inletSourceEnvelope!.wetServiceSuite.state,'not-requested')
})
