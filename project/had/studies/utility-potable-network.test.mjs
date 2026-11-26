import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {deriveUtilityPotableNetwork,utilityPotableReachability} from './utility-potable-network.mjs'
import {deriveCurrentHouse,serviceSchedule} from './current-house.mjs'
const read=p=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8')),
 base=read('mat/studies/whole-house-service-baseline.json'),choice=read('had/studies/inlet-utility-compact-route.json'),
 plant=read('had/studies/inlet-split-plant-branch-candidate.json'),station=read('had/studies/inlet-split-plant-station-candidate.json'),
 inlet=read('had/studies/south-inlet-under-sill.json'),
 calculate=(b=base,c=choice)=>deriveUtilityPotableNetwork(b,c,plant,station,inlet),network=calculate(),
 dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
if(dir){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'actual-U-potable-topology.json'),JSON.stringify(network,null,2));writeFileSync(join(dir,'actual-U-current-plan-elevation.svg'),network.reviewSvg)}
console.info('ACTUAL_U_POTABLE_TOPOLOGY '+JSON.stringify({retirement:network.retirement.oldColdConnectionRetiredInOccupiedSource,retainedPlantIds:network.retirement.retainedPlantColdFixtureIds,isolation:network.isolation,counterpaths:network.counterpaths,necessary:network.necessarySourceTopology}))
test('actual MAT cold edge is removed; hot/heat and all12 Plant fixtures/store remain; actual occupied compositor consumes the same graph',()=>{
 assert.deepEqual(base.trunks.find(t=>t.id==='ground-utility').duties,['heat','hot'])
 assert.equal(network.retirement.oldColdConnectionRetiredInOccupiedSource,true)
 assert.equal(network.retirement.retainedPlantColdFixtureIds.length,12)
 assert.equal(network.necessarySourceTopology,true)
 const house=deriveCurrentHouse(),actual=house.model.architecturalServices.potableNetwork
 assert.deepEqual(actual,network)
 assert.deepEqual(house.model.servicesInterface.potableNetwork,network)
 assert.deepEqual(serviceSchedule(house).potableNetwork,network)
 assert.ok(Object.hasOwn(house.inputs,'project/had/studies/inlet-utility-compact-route.json'))
 assert.equal(actual.actualFullPlantColdRiserAndFixtureJoinsAccepted,false)
 assert.equal(actual.completeInstallationAccepted,false)
})
test('normal whole-house MAINS isolation uses both internal cuts and never claims to isolate charged stores',()=>{
 const fromStreet=closed=>utilityPotableReachability(network,closed,['street/cold'])
 assert.ok(fromStreet(['U/internal-cut']).includes('P/cut-out'))
 assert.ok(fromStreet(['P/internal-cut']).includes('U/valve-downstream-face'))
 assert.ok(!fromStreet(['U/internal-cut','P/internal-cut']).includes('P/cut-out'))
 assert.ok(!fromStreet(['U/internal-cut','P/internal-cut']).includes('U/valve-downstream-face'))
 assert.equal(network.isolation.chargedStoredHotEnergyIsolatedByThatPair,false)
 assert.ok(utilityPotableReachability(network,['U/internal-cut','P/internal-cut'],['P/store-and-upper-energy']).includes('kitchen-sink/cold'))
})
test('actual local washer stop keeps sink and all Plant mains live; main-removal boundary needs LodgeU AND both actual local stops',()=>{
 assert.equal(network.isolation.localWasherIsolationKeepsSinkAndPlantMains,true)
 const closed=network.isolation.mainColdRenewalRequires,inside=utilityPotableReachability(network,closed)
 for(const id of ['street/cold','P/store-and-upper-energy','washer-PROPOSED/cold','utility-sink-PROPOSED/cold'])assert.ok(!inside.includes(id))
 assert.ok(utilityPotableReachability(network,closed.filter(v=>v!=='Lodge/U-upstream-cut')).includes('street/cold'))
 assert.ok(utilityPotableReachability(network,closed.filter(v=>v!=='U/local-washer-stop')).includes('washer-PROPOSED/cold'))
 assert.ok(utilityPotableReachability(network,closed.filter(v=>v!=='U/local-sink-cold-stop')).includes('utility-sink-PROPOSED/cold'))
 assert.ok(utilityPotableReachability(network,['U/internal-cut','U/local-washer-stop','U/local-sink-cold-stop']).includes('street/cold'),'Closing the valve being removed cannot isolate its live upstream face.')
 assert.equal(network.isolation.internalUOpenDuringControlledWholeBranchDrain,true)
 const reversed=structuredClone(network);reversed.edges=reversed.edges.map(e=>({...e,from:e.to,to:e.from,pathMm:e.pathMm?.slice().reverse()??null}))
 assert.deepEqual(utilityPotableReachability(reversed,closed),inside)
})
test('restored old cold edge/fixture route and a pressure mixer produce explicit backfeed counterpaths',()=>{
 const old=structuredClone(base);old.trunks.find(t=>t.id==='ground-utility').duties=['heat','cold','hot']
 assert.equal(calculate(old).retirement.oldColdConnectionRetiredInOccupiedSource,false)
 for(const f of old.fixtures.filter(f=>['washer-PROPOSED','utility-sink-PROPOSED'].includes(f.id))){f.waterBranchPlanDuties=[...(f.waterBranchPlanDuties??[]),'cold'];f.coldSupply='legacy-cold-tree'}
 const reconnected=calculate(old)
 assert.equal(reconnected.necessarySourceTopology,false)
 assert.ok(reconnected.counterpaths.PlantReachedUWithInternalUClosed.includes('U/valve-downstream-face'))
 const mixer=structuredClone(choice);mixer.coldDistribution.prefabSinkHead.mixing='shared pressure mixer'
 const mixed=calculate(base,mixer)
 assert.equal(mixed.necessarySourceTopology,false)
 assert.ok(mixed.counterpaths.PlantReachedUWithInternalUClosed.includes('U/valve-downstream-face'))
})

test('occupied source uses one current rear horizontal joint and common header; old indoor terminal is not silently reinstated',()=>{
 assert.deepEqual(network.quantities.currentMainTerminalMm,[10870,600,950])
 assert.equal(network.quantities.legacyUnderSillIndoorTailApplicable,false)
 assert.deepEqual(network.nodes.find(n=>n.id==='U/terminal').pointMm,choice.terminalLocalMm)
 const main=network.edges.find(e=>e.id==='U/cut-to-current-terminal'),washer=network.edges.find(e=>e.id==='U/current-rear-header-washer'),sink=network.edges.find(e=>e.id==='U/current-rear-header-sink')
 assert.deepEqual(main.pathMm.at(-1),choice.terminalLocalMm)
 assert.deepEqual(washer.pathMm,choice.coldDistribution.commonPathMm.slice(0,-1))
 assert.deepEqual(sink.pathMm,choice.coldDistribution.commonPathMm.slice(-2))
 assert.equal(network.edges.some(e=>e.id==='U/terminal-to-washer-tee'),false)
 assert.ok(network.reviewSvg.includes('Same occupied source graph'))
 const broken=structuredClone(choice);broken.coldDistribution.commonPathMm[0][0]+=10
 assert.throws(()=>calculate(base,broken),/Current rear header/)
})
