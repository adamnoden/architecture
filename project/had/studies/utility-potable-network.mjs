/** One source-specific direct-Utility potable topology, consumed by the occupied
 * house compositor and inlet compiler. Retained Plant is conservatively one
 * communicating hazard domain; this is not a new physical P-network approval. */
const copy=v=>structuredClone(v)
const ids=['utility-sink-PROPOSED','washer-PROPOSED']
const point=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b)
function length(path){return path.slice(1).reduce((n,p,k)=>n+Math.hypot(...p.map((v,j)=>v-path[k][j])),0)}
export function deriveUtilityPotableNetwork(base,choice,plantBranch,plantStation,underSill){
 const d=choice.coldDistribution,s=choice.station
 if(!d||d.schema!=='had-utility-direct-cold/1'||!s||!point(s.axisMm)||!point(s.ordinaryShoulderMm)||base.fixtures.length!==14||ids.some(id=>!base.fixtures.some(f=>f.id===id)))throw Error('Actual14-fixture source and complete direct-U controls required')
 const trunk=base.trunks.find(t=>t.id==='ground-utility'),u=base.fixtures.filter(f=>ids.includes(f.id)),p=base.fixtures.filter(f=>!ids.includes(f.id))
 if(!trunk||!equal(p.map(f=>f.id),d.retire.plantConsumerIds)||!equal(d.retire.preserveDuties,['heat','hot']))throw Error('Changed Plant/house consumer set requires explicit disposition')
 for(const q of [d.washer,d.sink])if(!point(q.stop.axisMm)||!point(q.stop.flowAxis)||q.stop.flowAxis.filter(v=>Math.abs(v)===1).length!==1||q.stop.flowAxis.some(v=>v!==0&&Math.abs(v)!==1)||!Number.isFinite(q.stop.faceMm)||q.stop.faceMm<120||q.stop.faceMm>220||!Number.isFinite(q.stop.minimumKvM3h)||q.stop.minimumKvM3h<=0||!Number.isFinite(q.tubeODMm)||q.tubeODMm<=0||!Number.isFinite(q.minimumWallMm)||q.minimumWallMm<=0||q.minimumWallMm*2>=q.tubeODMm)throw Error('Complete bounded pressure and flow domain for both actual local-stop modules required')
 const controls=['Lodge/U-upstream-cut','Lodge/P-upstream-cut','U/internal-cut','P/internal-cut',d.washer.stop.id,d.sink.stop.id,'U/sink-pillar-cold','P/sink-pillar-hot'],
 edges=[],nodes={}
 const node=(id,xyz=null,kind='port')=>{if(xyz!==null&&!point(xyz))throw Error('Actual finite potable port required');if(nodes[id]&&xyz&&!equal(nodes[id].pointMm,xyz))throw Error('Contradictory potable port '+id);nodes[id]??={id,pointMm:xyz,kind};return id}
 const edge=(id,a,b,path=null,control=null,scope='authored physical route')=>{if(!nodes[a]||!nodes[b]||path&&(!Array.isArray(path)||path.length<2||path.some(p=>!point(p))))throw Error('Actual potable edge/ports required');edges.push({id,from:a,to:b,pathMm:copy(path),control,scope})}
 const axis=s.axisMm,upFace=[axis[0],axis[1]-choice.valveDesign.connectionHalfSpanMm,axis[2]],downFace=[axis[0],axis[1]+choice.valveDesign.connectionHalfSpanMm,axis[2]],source=underSill.branches.find(b=>b.id==='utility').coordinates[2],terminal=underSill.branches.find(b=>b.id==='utility').coordinates.at(-1),
 tee=d.sinkTeeMm,washerTee=d.washerTeeMm,uf='U/valve-upstream-face',df='U/valve-downstream-face',
 ws=d.washer.stop,ss=d.sink.stop,wStart=d.washer.pathToStopMm.at(-1),wEnd=ws.axisMm.map((v,k)=>v+ws.flowAxis[k]*ws.faceMm/2),
 cStart=d.sink.pathToStopMm.at(-1),cEnd=d.sink.pathFromStopToHeadMm[0]
 if(!equal(wStart,ws.axisMm.map((v,k)=>v-ws.flowAxis[k]*ws.faceMm/2))||!equal(cStart,ss.axisMm.map((v,k)=>v-ss.flowAxis[k]*ss.faceMm/2))||!equal(cEnd,ss.axisMm.map((v,k)=>v+ss.flowAxis[k]*ss.faceMm/2))||!equal(d.sink.pathFromStopToHeadMm.at(-1),d.prefabSinkHead.coldPortMm))throw Error('Actual complete local stop faces and prefab cold port required')
 node('street/cold',null,'external source');node('U/house-entry',source);node(uf,upFace);node(df,downFace);node('U/sink-tee',tee);node('U/terminal',terminal);node('U/washer-tee',washerTee);node('U/washer-stop-in',wStart);node('washer-PROPOSED/cold',wEnd,'appliance boundary');node('U/sink-stop-in',cStart);node('U/sink-stop-out',cEnd);node('utility-sink-PROPOSED/cold',d.prefabSinkHead.coldPortMm,'head boundary')
 node('U/cold-spout',d.prefabSinkHead.spoutOutletsMm[0],'open air outlet');node('P/hot-spout',d.prefabSinkHead.spoutOutletsMm[1],'open air outlet')
 edge('U/Lodge-service','street/cold','U/house-entry',null,'Lodge/U-upstream-cut','Actual source-control boundary required; external route/head/isolation performance not invented.')
 edge('U/source-to-cut','U/house-entry',uf,[source,...choice.upstreamVirtualCornersMm,upFace])
 edge('U/internal-cut',uf,df,[upFace,downFace],'U/internal-cut')
 edge('U/cut-to-sink-tee',df,'U/sink-tee',[downFace,...choice.downstreamVirtualCornersMm,tee])
 edge('U/sink-tee-to-terminal','U/sink-tee','U/terminal',[tee,terminal])
 edge('U/terminal-to-washer-tee','U/terminal','U/washer-tee',[terminal,washerTee])
 edge('U/washer-branch','U/washer-tee','U/washer-stop-in',d.washer.pathToStopMm)
 edge('U/local-washer-stop','U/washer-stop-in','washer-PROPOSED/cold',[wStart,wEnd],ws.id)
 edge('U/sink-branch','U/sink-tee','U/sink-stop-in',d.sink.pathToStopMm)
 edge('U/local-sink-cold-stop','U/sink-stop-in','U/sink-stop-out',[cStart,cEnd],ss.id)
 edge('U/sink-local-tail','U/sink-stop-out','utility-sink-PROPOSED/cold',d.sink.pathFromStopToHeadMm)
 edge('U/sink-cold-pillar','utility-sink-PROPOSED/cold','U/cold-spout',null,'U/sink-pillar-cold','Separate physical pillar; no mixed hot/cold pressure body.')
 const pAxis=plantStation.axisMm,pIn=[pAxis[0],pAxis[1],pAxis[2]-80],pOut=[pAxis[0],pAxis[1],pAxis[2]+80]
 node('P/house-entry',plantBranch.sourceEntryMm);node('P/cut-in',pIn);node('P/cut-out',pOut);node('P/retained-cold-tree',plantBranch.coldTreeInterfaceMm,'retained distribution boundary');node('P/store-and-upper-energy',null,'unbounded retained hazard domain');node('P/utility-hot-port',d.prefabSinkHead.hotPortMm)
 edge('P/Lodge-service','street/cold','P/house-entry',null,'Lodge/P-upstream-cut')
 edge('P/source-to-cut','P/house-entry','P/cut-in',plantBranch.upstreamPathMm)
 edge('P/internal-cut','P/cut-in','P/cut-out',[pIn,pOut],'P/internal-cut')
 edge('P/cut-to-house-tree','P/cut-out','P/retained-cold-tree',[...plantBranch.outletStemMm,...plantBranch.treeFixedPathMm.slice(1)])
 edge('P/possible-stored-upper-backfeed','P/retained-cold-tree','P/store-and-upper-energy',null,null,'Deliberately conservative retained communicating domain; unknown stored/hot/upper inventory and checks are not qualified.')
 edge('P/retained-hot-to-Utility','P/store-and-upper-energy','P/utility-hot-port',null,null,'Existing H0/upper hot system retained. Actual terminal595-to-head850 spool/stop/release remains geometrically unjoined; no acceptance inferred.')
 edge('P/sink-hot-pillar','P/utility-hot-port','P/hot-spout',null,'P/sink-pillar-hot','Separate physical pillar; open-bowl mixing only.')
 for(const f of p){node(f.id+'/cold',null,'retained fixture boundary');edge('P/retained/'+f.id,'P/retained-cold-tree',f.id+'/cold',null,null,'Actual source consumer ID retained; no new physical upper-riser/endpoint closure is claimed.')}
 // Counterfactual source edits create real hazardous possibilities; neither a
 // restoration of the old trunk nor a mixed pressure body is silently ignored.
 const oldTrunkCold=trunk.duties.includes('cold')
 if(oldTrunkCold){node('legacy/utility-cold-header',[11200,1800,2945]);edge('legacy/ground-utility-cold','P/retained-cold-tree','legacy/utility-cold-header',trunk.selected3DProfile);for(const f of u)if(f.waterBranchPlanDuties?.includes('cold'))edge('legacy/'+f.id,'legacy/utility-cold-header',f.id+'/cold',null,null,'Restored obsolete cold fixture connection; unsafe crossfeed countercase.')}
 if(d.prefabSinkHead.mixing!=='only in open bowl')edge('UNADMITTED/mixed-pressure-body','utility-sink-PROPOSED/cold','P/utility-hot-port',null,null,'Rejected common mixer pressure connection.')
 const reachable=(starts,closed=[])=>{const seen=new Set(starts),off=new Set(closed);let changed=true;while(changed){changed=false;for(const e of edges)if(!e.control||!off.has(e.control)){if(seen.has(e.from)&&!seen.has(e.to)){seen.add(e.to);changed=true}if(seen.has(e.to)&&!seen.has(e.from)){seen.add(e.from);changed=true}}}return[...seen].sort()}
 const afterMainClose=reachable([uf,df],['Lodge/U-upstream-cut',ws.id,ss.id]),normalHouseClosed=reachable(['street/cold'],['U/internal-cut','P/internal-cut']),
 plantToU=reachable(['P/store-and-upper-energy'],['U/internal-cut']),localWasherClosed=reachable(['street/cold'],[ws.id]),
 forbidden=['street/cold','P/store-and-upper-energy','P/retained-cold-tree','washer-PROPOSED/cold','utility-sink-PROPOSED/cold'],
 isolatedMain=forbidden.every(id=>!afterMainClose.includes(id)),
 coldRetired=!oldTrunkCold&&u.every(f=>f.coldSupply==='direct-utility-inlet'&&!f.waterBranchPlanDuties.includes('cold')),
 separatePillars=d.prefabSinkHead.mixing==='only in open bowl'&&d.prefabSinkHead.spoutOutletsMm.every(p=>p[2]-d.prefabSinkHead.floodRimMm>=100)&&!equal(d.prefabSinkHead.coldPortMm,d.prefabSinkHead.hotPortMm)
 return{schema:'had-occupied-direct-Utility-potable-network/1',state:'authored-source-projected-unprocured-design',controls,nodes:Object.values(nodes),edges,
 retirement:{oldColdConnectionRetiredInOccupiedSource:coldRetired,removedTrunkColdDuty:!oldTrunkCold,retainedSameTrunkDuties:copy(trunk.duties),directUtilityFixtureIds:ids,retainedPlantColdFixtureIds:p.map(f=>f.id),retainedPlantTrunks:copy(base.trunks.filter(t=>t.id!=='ground-utility')),retainedPlantStoreBranch:copy(plantBranch.storeFixedPathMm)},
 isolation:{normalWholeHouseMAINSRequires:['U/internal-cut','P/internal-cut'],oneUtilityCutIsNotWholeHouseIsolation:true,chargedStoredHotEnergyIsolatedByThatPair:false,mainColdRenewalRequires:['Lodge/U-upstream-cut',ws.id,ss.id],internalUOpenDuringControlledWholeBranchDrain:true,mainNominalTopologyIsolatedFromPossibleSources:isolatedMain,localWasherIsolationKeepsSinkAndPlantMains:!localWasherClosed.includes('washer-PROPOSED/cold')&&localWasherClosed.includes('utility-sink-PROPOSED/cold')&&p.every(f=>localWasherClosed.includes(f.id+'/cold')),wholeHouseMainsBlockedByPair:!normalHouseClosed.includes(df)&&!normalHouseClosed.includes('P/cut-out'),PlantStoredBackfeedCannotReachUtilityDownstreamWithInternalUClosed:!plantToU.includes(df),PlantCouldBackfeedUpstreamCommonServiceWhenPInternalOpen:plantToU.includes(uf),actualValveClosureLeakTestAndZeroPressureVerified:false},
 head:{...copy(d.prefabSinkHead),separatePillarsWithAirGapNecessaryGeometry:separatePillars,chargedHotConnectionToColdInvented:false,actualHotTailToNewHeadQualified:false},
 directRoomGeometry:copy(d),quantities:{sinkColdPipeLengthMm:length(d.sink.pathToStopMm)+length(d.sink.pathFromStopToHeadMm),washerColdPipeLengthMm:length(d.washer.pathToStopMm),localStopModuleFaceAllowanceIncludesAdapters:true},
 counterpaths:{mainReachedAfterDeclaredClosures:afterMainClose,PlantReachedUWithInternalUClosed:plantToU.filter(id=>id.startsWith('U/')||ids.some(f=>id.startsWith(f)))},
 necessarySourceTopology:coldRetired&&equal(trunk.duties,d.retire.preserveDuties)&&isolatedMain&&separatePillars&&!plantToU.includes(df),actualFullPlantColdRiserAndFixtureJoinsAccepted:false,actualPressureHydraulicsSupportThermalAndAllRenewalsAccepted:false,completeInstallationAccepted:false}
}

export function utilityPotableReachability(record,closed,starts=['U/valve-upstream-face','U/valve-downstream-face']){
 const seen=new Set(starts),off=new Set(closed);let changed=true
 while(changed){changed=false;for(const e of record.edges)if(!e.control||!off.has(e.control)){if(seen.has(e.from)&&!seen.has(e.to)){seen.add(e.to);changed=true}if(seen.has(e.to)&&!seen.has(e.from)){seen.add(e.from);changed=true}}}
 return[...seen].sort()
}
