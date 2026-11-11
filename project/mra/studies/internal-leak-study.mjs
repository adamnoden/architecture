/** MRA-INTERNAL-LEAKS: bounded current-source computation, not whole-house acceptance. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse,scheduleText} from '../../had/studies/current-house.mjs';
import {inletEnvelopeWitness} from '../../had/studies/selected-water-duties.mjs';

const root=new URL('../../../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root)));
const gitBlobBytes=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const gitBlob=path=>gitBlobBytes(readFileSync(new URL(path,root)));
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
// Captured from the unchanged a060138 selected house before the correction,
// not generated from two views of the corrected compositor.
const preFix={main:'a06013820dfdc2b5ee1918abf42abce8423eb0ad',
  scheduleBlob:'3f9de5555c01f39f5c666dfd49e4e6b87f0b9624',
  exteriorPortsSHA256:'9d16691683c6255acad78736c3f6a77ac3c27d01e5f6d7ab908fab1e8fdffabb',
  weatherFacesSHA256:'1155d413b399a8ea93c4097f402e2089ded7131a68177b93a37d881216d7986f',
  selectedInterfacesSHA256:'aefbf9f05d1dd275b0aebd6393a3c7fe09b31c6220ee0303424aff46bbb9deaa',
  houseExceptDeclaredChangesSHA256:'a602a4d87257d73fefa378d84eba7c96cd458e68378fd5ee136e55a7b3a77f49'};
// Independently replayed from the published f794 tree BEFORE applying the water
// correction. Relative to the preserved a060 observation, only these three
// input identities and two embedded receiver identities differ. Every physical
// field, roof interface and numerical service result is unchanged.
const roofJoin={commit:'f7942830ae24ef1d308f01e71a4f87f306f37ab0',
  preWaterProducerSHA256:'6f983def825e3cd6b94e12410b8057fb902c62e28fe3365598a3d1ea69eef021',
  preWaterFullHouseSHA256:'f9f7b2b4d81898b2232ad246cd208f2966ac66fa0c005139b121a76fac3c314c',
  scheduleBlob:'248c8281369d16a8885506660f740c1f66462d9d',
  houseExceptDeclaredChangesSHA256:'1db7717297d3e984954c70f41454aafbc6a8ee47c2bfae3eee4b31cd9009ac31',
  houseInputs:{
    'project/had/studies/receiver-selection.json':{
      before:'5408aac3d43c95e3f5240f8510f91fb04d7a23cd',after:'2def3f7221d55b180cd46392a227b8c56972d03f'},
    'project/ias/studies/shared-family-bathing.json':{
      before:'08d6d466d515804a58d6cbd22a5f45188af7f56e',after:'f89302f9d87708b5314bd68a768c976efcd07b8d'},
    'project/str/studies/reconciled-house-interface.json':{
      before:'66143efe1bf357fe3b373777c93bdb25f861e11d',after:'4d3080dc4540ce7218b86f1d27518fbeb1f8e85d'}},
  receiverInputs:{
    'had/studies/court-intake-selection':{
      before:'80a8481b4e5a508164eff51b596e5a954c152a30',after:'887a3df5b7a335b3eaafc7c8de4529a339428cbc'},
    'rwt/studies/court-bypass-choice':{
      before:'164cbc28358aed78335f59c6856e5ee0ab8fd274',after:'450d121b5c70d95073f1daadd1332c789751156d'}}};
export function verifyPreFixBoundary(house){
  const copy=structuredClone(house);
  for(const s of [copy.model.architecturalServices,copy.model.servicesInterface])
    s.otherServiceDuties=s.otherServiceDuties.map(d=>['foul-kitchen','incoming-water'].includes(d.id)?{id:d.id,comparisonExcluded:true}:d);
  copy.model.currentAdoptionBlockers=['comparison-excluded'];
  const scheduleBytes=readFileSync(new URL('project/had/studies/current-house-services.json',root));
  const schedule=JSON.parse(scheduleBytes);
  const observed={scheduleBlob:gitBlobBytes(scheduleBytes),
    exteriorPortsSHA256:digest(house.model.exteriorPortGeometry),
    weatherFacesSHA256:digest(house.selectedServiceInterfaces.weatherFaces),
    selectedInterfacesSHA256:digest(house.selectedServiceInterfaces),houseExceptDeclaredChangesSHA256:digest(copy)};
  assert.equal(observed.scheduleBlob,roofJoin.scheduleBlob,'Joined service schedule identity changed');
  // Normalize only the independently observed, exact old/new identity pairs.
  // The rest of the schedule and complete model remain covered by the original
  // preFix hashes; an unlisted identity change is not silently discarded.
  for(const [path,{before,after}] of Object.entries(roofJoin.houseInputs)){
    assert.equal(copy.inputs[path],after,'Expected joined house input identity: '+path);
    assert.equal(schedule.sources[path],after,'Expected joined schedule input identity: '+path);
    copy.inputs[path]=before;schedule.sources[path]=before;
  }
  for(const [path,{before,after}] of Object.entries(roofJoin.receiverInputs)){
    assert.equal(copy.courtReceiver.inputs[path],after,'Expected joined receiver input identity: '+path);
    copy.courtReceiver.inputs[path]=before;
  }
  const normalizedObserved={...observed,
    scheduleBlob:gitBlobBytes(Buffer.from(JSON.stringify(schedule,null,2)+'\n')),
    houseExceptDeclaredChangesSHA256:digest(copy)};
  for(const [key,value] of Object.entries(normalizedObserved))assert.equal(value,preFix[key],
    'Current-source boundary changed; reassess the bounded MRA result: '+key);
  assert.equal(observed.houseExceptDeclaredChangesSHA256,roofJoin.houseExceptDeclaredChangesSHA256,
    'Joined pre-water-correction house boundary changed');
  return {preFix,sourceIdentityReconciliation:roofJoin,observed,normalizedObserved,unchanged:true,
    declaredChanges:['Both foul-kitchen duties: superseded downstream reservation corrected; upstream branch stays with IAS.',
      'Both incoming-water duties: rejected status, current witness and adoption duty added; path geometry retained.',
      'model.currentAdoptionBlockers: explicit incoming-water duty replaces the empty list.'],
    scope:'The original a060 observation remains exact after five named source-identity normalizations from the independently replayed f794 pre-water-correction house. Current and normalized schedules and complete unaffected models are separately guarded. Only the two declared water duties and their blocker are excluded from physical comparison; no other provenance or geometry is omitted. No whole-house structural or moisture acceptance is claimed.'};
}
export function retainedVolume({initialL=0,flowLmin,seconds,residualL=0,safeDrainLmin=0}) {
  for (const value of [initialL,flowLmin,seconds,residualL,safeDrainLmin])
    assert(Number.isFinite(value)&&value>=0,'Water balance inputs must be finite and non-negative');
  return Math.max(0,initialL+(flowLmin-safeDrainLmin)*seconds/60)+residualL;
}
export function pathIsOpen(path,closed) {
  return path.every(edge=>!closed.includes(edge));
}
export function deriveInternalLeakStudy() {
  const house=deriveCurrentHouse(),s=house.model.architecturalServices;
  assert.equal(scheduleText(house),readFileSync(new URL('project/had/studies/current-house-services.json',root),'utf8'));
  const base=read('project/mat/studies/whole-house-service-baseline.json');
  const water=read('project/ias/studies/household-water.json');
  const washer=read('project/ias/studies/utility-first-release.json');
  const witnesses=[['basin',1.25,.2],['kitchen',.4,.05],['utility',water.utility.netL,.2]].map(([id,netL,visibleByL])=>{
    const afterVisibilitySeconds=water.spill.flowsLmin.map(q=>(netL-visibleByL)*60/q);
    afterVisibilitySeconds.forEach((t,i)=>assert(Math.abs(t-water.spill.secondsAfterFirstVisible[id][i])<1e-8));
    const residualSensitivityL=[0,.25,1].map(residualL=>({residualL,
      maxResponseSecondsAt30Lmin:Math.max(0,(netL-visibleByL-residualL)*60/30),
      overCapacityAtImmediateIsolationL:Math.max(0,visibleByL+residualL-netL)}));
    return {id,netL,visibleByL,afterVisibilitySeconds,
      scope:'Required net/visibility volumes, not measured products. All water is optimistically captured; no safe drain or evaporation is credited.',
      maximum24hLeakLhWithoutOutflow:netL/24,
      slowLeakSensitivity:{flowLh:.1,visibleHours:visibleByL/.1,fullHours:netL/.1,
        eightHoursL:.8,twentyFourHoursL:2.4,excessAfter24hL:Math.max(0,2.4-netL)},
      fiveSecondsAfterVisibilityAt30Lmin:{retainedL:retainedVolume({initialL:visibleByL,flowLmin:30,seconds:5}),
        excessL:Math.max(0,retainedVolume({initialL:visibleByL,flowLmin:30,seconds:5})-netL)},
      residualSensitivityL};
  });
  const inside=(p,[x,y,w,d])=>p[0]>=x&&p[0]<=x+w&&p[1]>=y&&p[1]<=y+d;
  const basins=Object.entries(water.basins).map(([id,b])=>({id,pan:b.pan,stops:b.stops,
    stopProjectionsInsidePan:b.stops.every(p=>inside(p,b.pan)),
    sourceBranchReservation:b.serviceAxis,
    scope:'Plan projection of fitted stops only. The older serviceAxis is not the selected final inlet. Neither a projected point nor a pan proves jet capture.'}));
  const incoming=s.otherServiceDuties.find(d=>d.id==='incoming-water');
  const inletWitness=inletEnvelopeWitness(house.model);
  const routes=base.trunks.filter(t=>t.duties.includes('cold')).map(t=>({id:t.id,duties:t.duties,profileLengthMM:t.profileLengthMM,coverMM:t.ordinaryBand}));
  const fixtures=base.fixtures.map(f=>({id:f.id,level:f.level,duties:f.duties,nominalBranchLengthIncludingDropMM:f.waterBranchLengthIncludingDropMM,
    endpointScope:'Retained service reservation; selected fittedWater/utility overrides final apparatus, stops and wastes.'}));
  const cold=fixtures.filter(f=>f.duties.includes('cold')).length,hot=fixtures.filter(f=>f.duties.includes('hot')).length;
  assert.equal(cold,14);assert.equal(hot,9);assert.equal(house.separateRearOption.selected,false);
  const localStop='fixture-stop',entry='hypothetical-entry-stop',pump='circulation-pump';
  const cutCases=[
    {case:'Cold hose downstream of its local stop',path:[entry,'branch',localStop,'hose'],closed:[localStop],source:'mains',basis:'Series ordering; actual fitted stop position is present for the four basins.'},
    {case:'Cold branch joint upstream of that stop',path:[entry,'branch'],closed:[localStop],source:'mains',basis:'A downstream fixture stop cannot cut its upstream source.'},
    {case:'Upstream joint with an entry stop actually closed',path:[entry,'branch'],closed:[entry],source:'mains',basis:'Conditional corrective cut, not proof that a located accessible house-entry stop has been selected.'},
    {case:'DHW vessel outlet leak with mains closed and return pump off',path:['stored-DHW','vessel-outlet'],closed:[entry,pump],source:'DHW inventory',basis:'Residual release magnitude depends on head, drain point, air admission and checks; no litre figure is inferred.'},
    {case:'Heating vessel/component leak with mains closed and pump off',path:['heating-inventory','component'],closed:[entry,pump],source:'heating inventory',basis:'Hydraulically distinct from DHW; pump stop is not inventory removal or a demonstrated valve cut.'}
  ].map(c=>({...c,sourcePathRemains:pathIsOpen(c.path,c.closed),scope:'Necessary path/cut reasoning, not a complete fitted circuit diagram or measured leak.'}));
  const wastePaths={bowl:['bowl-waste','common-trap','downstream'],overflow:['bowl-overflow','common-trap','downstream']};
  const commonWaste={paths:wastePaths,commonBlock:'common-trap',bowlPasses:pathIsOpen(wastePaths.bowl,['common-trap']),overflowPasses:pathIsOpen(wastePaths.overflow,['common-trap']),
    scope:'Selected basin overflow requires the working shared downstream path; two entries are not two independent drains.'};
  const sources=Object.fromEntries([
    'project/had/studies/current-house.mjs','project/had/studies/selected-water-duties.mjs',
    'project/had/studies/inhabited-service-compose.mjs','project/had/studies/fitted-house-services.mjs',
    'project/had/studies/selected-service-interfaces.mjs','project/had/inhabited-services-selection.md',
    'project/ias/ias-03-household-water.md','project/ias/ias-03-guest-rear-wc-takeoffs.md',
    'project/ias/ias-03-upper-wc-release.md','project/mat/services-water-joints.md',
    'project/mat/plant-inlet-route.md','project/mat/tempered-kitchen-air.md',
    'project/mat/interiors-whole-house-assembly-schedule.md','project/mat/interiors-b-wetroom-assembly.md',
    'project/mra/mra-00-moisture-constitution-threat-model.md',
    'project/mra/studies/internal-leak-study.mjs'
  ].map(path=>[path,gitBlob(path)]));
  return {packet:'MRA-INTERNAL-LEAKS',selection:house.id,
    scope:'Bounded current internal-water investigation. MRA-02 and TRIAD-GATE remain open; no physical moisture pass, actual spill prediction or installed acceptance.',
    inputs:house.inputs,sources,sourceCorrection:verifyPreFixBoundary(house),
    stressBasis:{inheritedFlowsLmin:water.spill.flowsLmin,
      flowScope:'IAS stress scenarios, not measured available supply or a maximum rupture flow.',
      analystSensitivities:{slowLeakLh:.1,unattendedHours:[8,24],responseAfterVisibilitySeconds:5,postIsolationResidualL:[0,.25,1]},
      exclusions:'No guaranteed human response, alarm, automatic valve, powered pump, evaporation or independent gravity drain is credited. Spill beyond a witness is not proof of damage.'},
    inventory:{cold,hot,fixtures,basins,waterCorridors:routes,waterCorridorTotalMM:routes.reduce((n,t)=>n+t.profileLengthMM,0),
      corridorScope:'These are routing territories, not multiplied pipe lengths, joint counts or a complete located isolation schedule.',
      hotReturns:base.hotWater.loops.map(l=>({id:l.route,returnAxisZ:l.returnAxisZ,path:l.separateReturnPath})),
      hotReturnQualification:'One pump and four balancing/check/isolation stations are declared. Their located functional cut sets, orientation and residual release are not established by that declaration.',
      incoming:incoming.path,heatingEmitters:s.emitters.map(e=>e.id),electricHeaters:s.roomElectric.map(e=>e.id),
      highLevelHydronicCoil:{model:s.cooker.supplyUnit.model,plan:s.cooker.supplyUnit.plan,z:s.cooker.supplyUnit.z,
        airIntakeRoute:s.cooker.supplyUnit.route,hydraulicRoute:null,
        scope:'Located water-bearing unit. The supplied route is its air intake, not a qualified water-side pipe/isolation map.'},
      condensatePorts:house.model.exteriorPortGeometry.filter(p=>p.id.endsWith('-condensate')).map(p=>({id:p.id,point:p.p})),
      dhw:{family:s.plant.cylinder.family,body:s.plant.cylinder.body,
        stockCatalogueComparisonL:s.plant.cylinder.catalogueL,stockAcceptedAt3point5Bar:s.plant.cylinder.stockMS103.acceptedAt3point5Bar,
        orderedMinimumUsableL:s.plant.cylinder.orderedMinUsableL,drainableL:null,
        scope:'Bespoke pressure-rated selection; 370 L describes the stock catalogue comparison, not accepted drainable storage.'},
      heatingBuffer:{body:s.plant.primaryBuffer.body,nominalL:s.plant.primaryBuffer.nominalL,usefulLayerRequiredL:s.plant.primaryBuffer.requiredUsefulLayerL,drainableL:null}},
    witnesses,cutCases,commonWaste,cases:occurrenceCases(),
    retainedRejectedInlet:{...inletWitness,
      status:'REWIND',scope:'Current-source replay of the route already rejected in services-water-joints.md. An occupied exclusion envelope, not a solid detailed radiator or installed collision. The alternative lobby route is still an adoption obligation.'},
    washerMaintenance:{localStop:s.utility.washerStop,channelToElectricalWorkingFieldMM:water.utility.clearElectric,
      dryRestElectricalOverlapMM2:s.utility.temporaryElectricalWorkingOverlapMM2,
      frontDrainTrayUsableL:washer.frontDrain.tray.usableCapacityLitres,externalCuboidUpperBoundL:washer.frontDrain.tray.externalCuboidUpperBoundLitres,
      simultaneousTapWorkerClearanceMM:washer.frontDrain.tapWorkerClearance,
      disposition:'Preserve source order: isolate before bringing the drain tray into the conflicting stance; drain in controlled batches; de-energise before the temporary electrical-field overlap and restore it before re-energising.'},
    currentKitchenDuty:s.otherServiceDuties.find(d=>d.id==='foul-kitchen'),
    supersededKitchenWall:[9150,12000,382.0625],
    kitchenWallCorrectionMM:{x:125,z:-108.3},
    selectedKitchenDownstream:base.interfaces.kitchenSinkStation.wasteRequiredRoute.slice(-2),
    integrationBlockers:house.model.currentAdoptionBlockers,
    receivingReservations:{foul:s.otherServiceDuties.filter(d=>['foul-ground-WC','foul-utility','foul-kitchen','rear-soil','east-soil'].includes(d.id)).map(d=>({id:d.id,tail:d.path.at(-1)})),
      domesticSafety:s.plant.independentSafety.outfall,
      condition:'Coordinate actual opening/pipe/invert and the available receiving crown, backwater and onward fall. No external foul tail, blocked path or safety terminal is an accepted safe floor-leak outfall. Dedicated D2 must not share foul, rainwater or utility receptors.'}};
}

// Source-specific contributions to the existing MRA scenario vocabulary. These
// are not a replacement whole-house matrix or an extension of its claim ceiling.
function occurrenceCases(){
  const common={status:'OBLIGATION',firstVulnerableFabric:'Unestablished for the complete failure path; a visible/washable surface is not itself proof of damage or of dry concealed fabric.',
    maintenance:'Keep the declared access and receiving surfaces unobstructed; do not credit an attendant during temporary unoccupancy.',
    workmanship:'Actual falls, seals, supports, valve function and discharge/visibility require the located installed assembly.',
    drying:'Expose and inspect the affected path after isolation; establish a material-specific drying/cleaning and reinstatement condition before closing it.',
    evidenceLevel:'Current-source geometry and deterministic counterexample; no physical event.'};
  const row=(scenarioIds,occurrence,fields)=>({...common,scenarioIds,occurrence,...fields});
  return [
    row(['INT-01'],'Incoming-water route and upstream isolation',{
      status:'REWIND',source:'Current incoming-water duty; selected plant-N; services-water-joints.md; plant-inlet-route.md',
      event:'A joint or valve on the retained entry/plant feed leaks or needs replacement.',
      path:'Retained X11200/Z500 route enters the required plant-N envelope for 200 mm.',
      defence:'Accessible upstream isolation and contained drain are required, but a coordinated adopted route/station is not established.',
      failurePath:'The rejected line cannot be treated as a serviceable current inlet; copying the lobby proposal would skip its adoption and wall/site duties.',
      declaration:'No proved first wetting/detection latency for the rejected route.',containment:'No credited safe first-wetting receiver.',
      isolation:'A fixture stop downstream cannot isolate this joint or its own upstream connection.',
      repair:'Adopt an actual route clear of the radiator and cores; retain independent supports, drain, release and utility/cylinder compatibility.',
      owner:'HAD/MAT with IAS/STR; resolve before MRA-02 and complete internal-water integration.'}),
    row(['INT-01','CMP-03'],'Eight retained hot/cold routing territories and four hot-return circuits',{
      source:'whole-house-service-baseline.json trunks/hotWater; current-house input identity',event:'A concealed or partly concealed joint leaks slowly while the house is unoccupied.',
      path:'Demountable high-level covers and terminal drops; nominal corridor length is not a joint/location schedule.',
      defence:'Independent supports, demountable covers and joint minimisation remain the selected strategy.',
      failurePath:'An accessible cover does not prove gravity declaration before insulation, lining or a penetration becomes wet.',
      declaration:'Unknown joint-by-joint first surface and observation point; no numeric latency credited.',containment:'Receiver/room escape and drying route unknown for each necessary joint.',
      isolation:'Locate actual upstream branch valves and both hot feed/return paths, checks and drain points; do not infer backfeed or complete cuts from one pump/four station labels.',
      repair:'Expose only the independent cover; preserve the structural/fire/water penetration boundary; drain/cap/support and leak-test the restored joint.',
      owner:'HAD/MAT for distribution and cuts; IAS/MAT for first wetting; MRA-02 for joined closure.'}),
    row(['INT-02','CMP-03'],'Four basin stops, mixer tails and pans',{
      source:'household-water.json basins/spill and ias-03-household-water.md',event:'A fitted tail releases water; separately, a stop itself or its upstream joint fails.',
      path:'All eight stop plan projections fall inside their local pan; jet trajectory and full capture remain unproved.',
      defence:'Independent basin support, exposed trap, two local stops and 1.25 L net witness requirement.',
      failurePath:'Captured water exceeds the witness in the stated no-attendant sensitivity; rim/back bypass can reach the room independently.',
      declaration:'Visible by 0.20 L is an owning requirement, not measured latency or guaranteed observation.',containment:'Pan overflow must reach the washable strip; the complete floor/toe/threshold first-harm route is unqualified.',
      isolation:'The cold/hot fixture stops can cut their downstream tails if operable; repair of either stop requires an upstream cut.',
      repair:'Drain/remove the pan and trap before supported ceramic withdrawal; inspect and dry the wall return and floor after separate reconnection tests.',
      owner:'IAS/HAD/MAT; qualify capture and the room route before MRA-02 acceptance.'}),
    row(['INT-02','WST-01','CMP-03'],'Kitchen supply/waste breaks, catch sheet and trough',{
      source:'household-water.json kitchen/spill; corrected selected foul-kitchen duty',event:'A supply union/tail or trap/socket leaks; the kitchen is unoccupied.',
      path:'Selected breaks and raised Ø50 branch remain upstream of the corrected X9275 wall/tail reservation.',
      defence:'Removable catch sheet, exposed supported connections and 0.40 L net witness requirement.',
      failurePath:'Witness reserve after declaration is only 0.35 L; no-attendant spill requires the room-side path to work.',
      declaration:'Visible by 0.05 L is required. At the inherited 30 L/min scenario, the zero-residual post-declaration reserve lasts 0.7 s.',
      containment:'Visible overflow to washable floor; no proved independent safe drain or sufficient room storage.',
      isolation:'Close the actual upstream supply cuts before supported spool/trap release; a labelled break is not an operating isolator.',
      repair:'Keep the head on its independent receiver, capture residual water, restore supports and test each join separately.',
      owner:'HAD metadata corrected here; IAS/MAT/HAD retain actual isolation, receiver and room duties.'}),
    row(['INT-02','CMP-03'],'Utility washer and sink station',{
      source:'current utility; household-water.json utility/spill; utility-first-release.json',event:'A supply hose, tap or internal appliance water-bearing part releases water.',
      path:'1500-wide graded catch field to the channel at Y1400; full jet bypass and foot/collar performance remain open.',
      defence:'Located front stop, independent supports, 9.5 mm field fall and 2 L net channel requirement.',
      failurePath:'Finite channel spills under the no-attendant sensitivity; it is not an emergency foul drain.',
      declaration:'Visible by 0.20 L is required; no observation or closure time is guaranteed.',containment:'Channel remains 310 mm from the electrical working field, which is a geometric gap, not water/electrical protection.',
      isolation:'Source stop is within 561.805 mm straight reach in the proposed lower stance; actual valve/jet-safe operation and upstream cut remain unqualified.',
      repair:'Isolate before bringing in the drain tray; controlled cooled drain batches; no credited 3.445 L usable tray capacity.',
      owner:'IAS/HAD/MAT; establish first wetting and safe isolation/receiving before MRA-02 closure.'}),
    row(['INT-03'],'Guest, rear, family and principal WCs',{
      source:'fitted-wc-schedule.json; guest/rear takeoff and upper-WC release results',event:'Fill connection, bridge union or cistern leaks; compare a cracked cistern/severed feed separately.',
      path:'Guest/rear accessible connections and upper supply/soil troughs lead toward visible room-side lips.',
      defence:'Independent supports, remote/local isolation and removable drip receivers retain their finite geometry.',
      failurePath:'A cracked tank or pressurised jet can exceed/bypass a drip receiver; no larger containment is inferred.',
      declaration:'Owning lip visibility/fall comparisons are retained; actual first wetting with clear/fouled water is unproved.',containment:'Room floor, wall toe and threshold must accept the actual overflow path without concealed prolonged wetting.',
      isolation:'Stop the feed before release; draining the cistern and proving zero flow are distinct from closing a valve.',
      repair:'Support the ceramic and fixed soil/supply interfaces separately; cap foul/water ends and repeat fill/flush tests before closure.',
      owner:'IAS/MAT/HAD; MRA-02 retains fault containment and drying acceptance.'}),
    row(['INT-04'],'Domestic hot-water vessel and safety connections',{
      source:'Current plant.cylinder and independentSafety; inhabited-services-selection.md',event:'Vessel, cold/hot connection or D1 connection leaks after mains/pump shutdown.',
      path:'DHW vessel inventory remains hydraulically distinct from the heating buffer; matched safety discharge only receives its connected relief flow.',
      defence:'Pressure-rated bespoke vessel requirement, accessible qualified safety group and dedicated visible D2 route.',
      failurePath:'Mains closure does not prove removal of stored water; the safety drain does not capture a split vessel or disconnected D1.',
      declaration:'Tundish visibility is positive for relief flow, not proof of vessel-leak declaration.',containment:'Actual drainable inventory and plant-floor destination are unknown; no 300/370 L spill prediction.',
      isolation:'Stop heat, close the proper cold control and drain/cool/prove zero pressure. Never isolate the vessel from its directly sensing safety valve.',
      repair:'Park the ladder; support retained services and remove the qualified discharge group/bridge before exchange; restore and prove open safety discharge before heat.',
      owner:'HAD/MAT/IAS; actual stored-release/floor route before MRA-02; matched pressure system before purchase/energisation.'}),
    row(['INT-04'],'Heating buffer, primary/secondary components and sixteen emitters',{
      source:'Current plant.primaryBuffer/heatPump and emitters; whole-service-material-offer.md',event:'A hydronic vessel, joint, valve or emitter leaks with pump off or a local valve under repair.',
      path:'Heating inventory is separate from potable DHW and includes branches beyond the buffer.',
      defence:'Separated circuits, accessible paired emitter valves and independent supports.',
      failurePath:'Pump-off does not establish a positive cut or remove hydrostatic inventory; one closed emitter valve is not a two-ended isolation proof.',
      declaration:'No full first-wetting path or measured latency for the sixteen occurrences/plant loop.',containment:'Nominal 300 L buffer and 260 L useful-layer requirement are not drainable amounts and are never added to DHW.',
      isolation:'Show both local valve cuts, pump/makeup state, checks, drain and air admission for each intervention.',
      repair:'Drain and support both retained tails before union release; preserve room access, dry finishes and separate electrical work.',
      owner:'HAD/MAT with IAS; MRA-02 receives actual topology and failure routes.'}),
    row(['INT-04'],'High-level hydronic kitchen supply-air coil',{
      source:'Current cooker.supplyUnit; tempered-kitchen-air.md',event:'Coil/connection leak or frost damage with electrical controls unavailable.',
      path:'Water-bearing unit at Z2150–2755; cabinet, duct and first room-side wetting route require actual definition.',
      defence:'Independent wall cradle, releasable water branches and required unpowered frost-safe arrangement.',
      failurePath:'Cooking/fan inhibition stops an operating duty, not a demonstrated hydraulic source; no drip receiver or harmless first-failure route is established.',
      declaration:'First declaration from the elevated unit remains unlocated.',containment:'Actual coil/circuit residual and cabinet/duct/floor escape unknown.',
      isolation:'Locate both water-side cuts/drain and prove the freeze/fault state independently of pump or software commands.',
      repair:'Isolate electricity and water, cool/drain, retain cradle support until the qualified lift is docked; inspect and dry wet cabinet/duct interfaces before return.',
      owner:'HAD/MAT with IAS; first-wetting/frost/source cuts before MRA-02 and enabling that supplied assembly.'}),
    row(['WST-01','WST-03'],'Four basin wastes and common bowl-overflow paths',{
      source:'household-water.json; ias-03-household-water.md',event:'A trap leaks or its common downstream path is blocked during ordinary open-spout use.',
      path:'Bowl waste and CL25 overflow converge on the same trap/downstream path.',
      defence:'Exposed removable trap and overflow with a working common downstream path.',
      failurePath:'Blocking the common trap defeats both entries; the 15 L/min overflow comparison cannot be credited as an independent drain.',
      declaration:'An open-spout overrun can become visible at the rim; source-to-floor first harm and latency remain unqualified.',containment:'Rim bypass and pan spill use the same unresolved room boundary.',
      isolation:'Stop the supplied water; a supply stop cannot empty waste already in a basin or clear a blocked trap.',
      repair:'Drain into a measured receiver, cap the foul end, remove/clean the supported trap and restore/inspect under flow.',
      owner:'IAS/HAD/MAT; MRA-02 resolves blocked-path consequence.'}),
    row(['WST-01'],'Family bath, principal shower and retained rear shower',{
      source:'Selected three-bathing house; IAS three-bathing/rear tray results; MAT wet-room assembly directions',event:'A waste, tray/bath perimeter or local wet-room junction leaks.',
      path:'Three distinct fitted waste/support/renewal arrangements; the upper local port and accessible lower branch do not imply a drained secondary cavity.',
      defence:'Complete water-boundary reservations, independently supported fixtures and bounded access/capping operations.',
      failurePath:'A failed primary joint can bypass the ordinary wet surface or wet the lower service zone; first vulnerable layer and drying delay are not established.',
      declaration:'No transferred pass from the 20 mm principal saddle or a removable lower panel.',containment:'80 mm floor/30 mm wet lining directions do not establish flood volume, watertight doors or a safe emergency drain.',
      isolation:'Stop use and the relevant feeds; cap and preserve the fixed port/water boundary during waste release.',
      repair:'Follow each occurrence-specific supported first release; reopen affected finishes/liner as needed and prove the restored boundary before use.',
      owner:'IAS/MAT/HAD; MRA-02 plus the actual MRA-03 drying boundary after integration.'}),
    row(['WST-02','CMP-05'],'Utility washer discharge and sink common branch',{
      source:'Current utility.acquiredBranch and utility-first-release/host results',event:'Hose disconnect or restricted common branch with ordinary washer pumping and sink use.',
      path:'Selected 960 mm branch falls 24 mm to the retained connection; washer and sink share its downstream capacity.',
      defence:'Accessible supported spigot/trap/branch and the local washable catch field.',
      failurePath:'The restricted common branch cannot simultaneously be credited as the emergency leak drain; actual pump/discharge and receiving capacity are unqualified.',
      declaration:'Visible floor/channel escape is required; full hose and joint first-wetting path is not proved.',containment:'2 L witness and unknown appliance residual are distinct; no capacity is inferred from hose length or a sink trap alone.',
      isolation:'Stop the appliance and incoming water as appropriate; drain residual inventory independently of the blocked branch.',
      repair:'Use the supported fixed-end release and controlled front draining; restore clamp, trap, floor access and separate sink/washer tests, including simultaneous duty.',
      owner:'IAS/HAD/MAT; close before MRA-02 accepts the shared discharge.'}),
    row(['WST-03'],'Five foul exits and retained external tails',{
      source:'Current corrected otherServiceDuties; selected kitchen and E-02 routes',event:'A named building-side branch/receiver blocks or is submerged.',
      path:'Guest, utility, kitchen, rear-soil and east-soil external reservations; real receiver levels and onward capacity are absent.',
      defence:'Above-floor accessible branches and distinct service duties; no roof/rainwater receiver sharing is credited.',
      failurePath:'First internal surcharge/spill level depends on actual connected invert/trap topology, not the drawn external centreline alone.',
      declaration:'Actual first overflowing fitting and contaminated-water path must be located.',containment:'Blocked primary path receives zero drainage credit until an independent safe path is demonstrated.',
      isolation:'Stop connected sources and control access; a valve cannot cancel stored/foul backwater.',
      repair:'Accessible cleanout/capping, contained removal, cleaning/disinfection and dry reinstatement without concealing the damaged boundary.',
      owner:'HAD/MAT for building-side consequences; DPL for real receiving levels/authority before site acceptance; MRA-02 retains the internal condition.'}),
    row(['WST-04'],'Six local-extract condensate occurrences',{
      source:'Current fanAccess and six exteriorPortGeometry condensate ports',event:'Trap/condensate route disconnects or blocks.',
      path:'Ground WC, utility, kitchen, rear, family and principal routes have located external ports; complete internal first-failure capture is not thereby proved.',
      defence:'Separate removable traps/cleaning access and outward terminal duties.',
      failurePath:'A blocked/disconnected local drain can release water before the wall port; exterior weathering is not its indoor catch path.',
      declaration:'First indoor visible symptom and safe latency remain unqualified.',containment:'No inferred discharge into foul, rainwater, room ceiling or a roof receiver.',
      isolation:'Disable the affected apparatus as required for repair, then deal with retained condensate; stopping a fan is not draining its trap.',
      repair:'Use the selected platform/cover and supported receiver; clear/test the actual drain, inspect surrounding layers and restore dry boundaries.',
      owner:'HAD/MAT/IAS; MRA-02 joins internal first wetting, with exterior/interface duties retained by their owners.'})
  ];
}

export const studyText=()=>JSON.stringify(deriveInternalLeakStudy(),(_,v)=>typeof v==='number'?Number(v.toFixed(8)):v,2)+'\n';
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const text=studyText(),out=new URL('internal-leak-study.json',import.meta.url);
  if(process.argv.includes('--write'))writeFileSync(out,text);
  else if(process.argv.includes('--check')){
    assert.equal(readFileSync(out,'utf8'),text,'Regenerate the source-bound internal leak result after reassessing changed inputs');
    console.log('MRA-INTERNAL-LEAKS: current sources, bounded counterexamples, corrected duties and exact unaffected-house boundary verified. No moisture acceptance awarded.');
  }else process.stdout.write(text);
}
