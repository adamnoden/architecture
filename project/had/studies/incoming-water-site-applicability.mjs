import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {compareTemporaryGantry} from './incoming-water-temporary-gantry.mjs';
import {compareLiftSill} from './incoming-water-lift-sill.mjs';
import {compareLiftWeather} from './incoming-water-lift-weather.mjs';

const source=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const {dock,opening,carrierHeight}=source('../../mat/studies/plant-threshold.json');
const {entry,functionalCuts,drain}=source('./incoming-water.json').station;
const gantry=compareTemporaryGantry();
const lift=compareLiftSill();
const weather=compareLiftWeather();
const upperDockX=dock.plan[1], deckZ=dock.outerEdgeZ;
const gantryHeightDeduction=gantry.gantry.eyeMaxMM-gantry.vertical.maximumGrossCarrierHeightMM-dock.outerTransferRise;
const retainedGuardAndClearance=gantry.vertical.solidGuardHeightMM+gantry.vertical.requiredOverGuardMarginMM;
const gantryStrokeDropLimit=gantry.hoist.standardLiftMM-retainedGuardAndClearance;
const liftRampHeight=lift.lodigePlanning.lowerPitOrRampMM;
const eastCabinetRight=weather.gradeCabinet.cabinetX[1];
const [gantryPadWest,gantryPadEast]=gantry.conservativelyPaddedFrameX;
const [gantryBeamSouth,gantryBeamNorth]=gantry.grossBeamY;
const gantryPadProjection=gantryPadEast-(gantry.liftX+gantry.gantry.frameWidthMM/2);
const siteModes={
  'level-bridge':{boxes:[],endX:upperDockX},
  'temporary-gantry':{boxes:[gantry.extensionPlan,gantry.gradeRest,gantry.gradeRetreat,
    [gantryPadWest,gantryPadEast,gantryBeamSouth-gantryPadProjection,gantryBeamNorth+gantryPadProjection]],
    endX:Math.max(gantry.gradeRetreat[1],gantryPadEast)},
  'fixed-through-flush':{boxes:[[upperDockX,lift.shaftEastX,...weather.awningY],
    [lift.shaftEastX,lift.shaftEastX+lift.lowerLanding.levelRunMM,...lift.clearY],
    [weather.gradeCabinet.cabinetX[0],eastCabinetRight,...weather.gradeCabinet.bypassY],
    [weather.gradeCabinet.cabinetX[0],eastCabinetRight,...weather.gradeCabinet.cabinetY]],endX:eastCabinetRight},
  'fixed-through-ramp':{boxes:[[upperDockX,lift.shaftEastX,...weather.awningY],
    [lift.shaftEastX,lift.lowerRampEastX,...weather.awningY],
    [weather.gradeCabinet.cabinetX[0],eastCabinetRight,...weather.gradeCabinet.bypassY],
    [weather.gradeCabinet.cabinetX[0],eastCabinetRight,...weather.gradeCabinet.cabinetY]],endX:eastCabinetRight},
};

function surveyValue(value,name,{nonnegative=false}={}){
  if(value==null)return null;
  if(!Number.isFinite(value)||(nonnegative&&value<0))throw new TypeError(`${name} must be a finite${nonnegative?' nonnegative':''} number or null`);
  return value;
}

function box(value,name){
  if(!Array.isArray(value)||value.length!==4||value.some(v=>!Number.isFinite(v))||value[0]>=value[1]||value[2]>=value[3])
    throw new TypeError(`${name} must be [west,east,south,north] with finite increasing ends`);
  return value;
}

const overlapping=(first,second,setback)=>[0,2].every(i=>first[i]-setback<second[i+1]&&first[i+1]+setback>second[i]);
const fits=(area,region)=>area[0]>=region[0]&&area[1]<=region[1]&&area[2]>=region[2]&&area[3]<=region[3];
const clearance=(margin,name)=>({name,marginMM:margin,state:margin===null?'UNKNOWN':margin>=0?'PASS':'FAIL'});
const guard=(value,name)=>({name,state:value===true?'PASS':value===false?'FAIL':'UNKNOWN'});
const status=checks=>checks.some(c=>c.state==='FAIL')?'OUTSIDE_TRIAL':checks.some(c=>c.state==='UNKNOWN')?'EVIDENCE_MISSING':'INSIDE_TRIAL_LIMITS';
const floorDrop=grade=>grade===null?null:deckZ-grade;

export function compareInletSite({
  landingGradeMM=null,entryGradeMM=null,siteWaterMM=null,requiredDryFreeboardMM=null,
  carrierHeightMM=null,carrierMassKG=null,requiredEarthCoverMM=null,maximumProtectedRiseMM=null,
  riserExcavationRadiusMM=null,dryRectangularField=null,wetExclusions=[],wetSetbackMM=null,fieldEvidenceComplete=null,
  carrierProfileFits=null,matchedPlate=null,gantrySupport=null,gantryNativeCapture=null,liftNativeMatch=null,
  entryEnclosureQualified=null,providerCutVerified=null,
}={}){
  const dropMM=floorDrop(surveyValue(landingGradeMM,'landingGradeMM'));
  const height=surveyValue(carrierHeightMM,'carrierHeightMM',{nonnegative:true});
  const mass=surveyValue(carrierMassKG,'carrierMassKG',{nonnegative:true});
  const water=surveyValue(siteWaterMM,'siteWaterMM');
  const setback=surveyValue(wetSetbackMM,'wetSetbackMM',{nonnegative:true});
  const freeboard=surveyValue(requiredDryFreeboardMM,'requiredDryFreeboardMM',{nonnegative:true});
  if(dryRectangularField!==null)box(dryRectangularField,'dryRectangularField');
  if(!Array.isArray(wetExclusions))throw new TypeError('wetExclusions must be an array of boxes');
  wetExclusions.forEach(b=>box(b,'wetExclusion'));
  const waterDatum=landingGradeMM===null||water===null||freeboard===null?null:landingGradeMM-water-freeboard;
  const fieldChecks=boxes=>[
    guard(dryRectangularField!==null?boxes.every(b=>fits(b,dryRectangularField)):null,'located footprint inside available rectangle'),
    guard(boxes.some(b=>wetExclusions.some(wet=>overlapping(b,wet,setback??0)))?false:
      wetExclusions.length&&setback===null?null:fieldEvidenceComplete,'surveyed wet or obstructed territory separated'),
  ];
  const ordinaryDoor=[clearance(height===null?null:opening.height-height,'upper clear door height before extra handling allowances'),
    guard(carrierProfileFits,'actual carrier profile, room release, capture and outward route verified')];
  const modes=[];
  const add=(id,checks)=>{
    const reservedBoxes=[dock.plan,...siteModes[id].boxes];
    const all=[...ordinaryDoor,clearance(waterDatum,'measured local dry freeboard'),...fieldChecks(reservedBoxes),...checks];
    modes.push({id,status:status(all),endOfTrialX:siteModes[id].endX,reservedBoxes,checks:all});
  };
  add('level-bridge',[clearance(dropMM===null?null:lift.strip.relativeLevelTrialMM-Math.abs(dropMM),'independently supported adjusted landing level'),
    guard(matchedPlate,'matched transition, receiving and arrival footprint, independent bearing and loaded wheel path')]);
  add('temporary-gantry',[clearance(dropMM,'non-inverted suspended transfer'),
    clearance(dropMM===null?null:gantryStrokeDropLimit-dropMM,'nominal standard hook travel before additional bottom reach'),
    clearance(dropMM===null||height===null?null:gantry.gantry.eyeMaxMM-gantryHeightDeduction-dropMM-height,'upper eye and over-guard height'),
    guard(mass===null?null:mass<=gantry.loading.conservativeCarryKG,'350 kg modeled suspended load and deck wheel envelope'),
    guard(gantrySupport,'independent bearing, uplift and stable pads'),guard(gantryNativeCapture,'matched frame, restraints and native carrier pickup')]);
  for(const [mode,platformAboveGrade] of [['fixed-through-flush',0],['fixed-through-ramp',liftRampHeight]]){
    add(mode,[clearance(dropMM===null?null:dropMM-platformAboveGrade-lift.lodigePlanning.throughMinTravelMM,
      'through-car travel above the planning minimum'),guard(liftNativeMatch,'matched weathered lift, sill, rated wheel loads and operating/rescue arrangement')]);
  }
  const earth=surveyValue(requiredEarthCoverMM,'requiredEarthCoverMM',{nonnegative:true});
  const portOutsideGrade=surveyValue(entryGradeMM,'entryGradeMM');
  const riseLimit=surveyValue(maximumProtectedRiseMM,'maximumProtectedRiseMM',{nonnegative:true});
  const excavation=surveyValue(riserExcavationRadiusMM,'riserExcavationRadiusMM',{nonnegative:true});
  const [,,entryZ]=entry.point;
  const protectedRiseMM=portOutsideGrade===null||earth===null?null:entryZ-portOutsideGrade+earth;
  const protectedEntryChecks=[clearance(protectedRiseMM===null?null:protectedRiseMM,'rising entry direction for this candidate'),
    clearance(riseLimit===null||protectedRiseMM===null?null:riseLimit-protectedRiseMM,'qualified protected enclosure reach'),
    clearance(excavation===null?null:entry.riserToCapPlanMM+entry.protectedRiserRadius-excavation,'P17 plan-only excavation clearance'),
    clearance(portOutsideGrade===null?null:entryZ-portOutsideGrade,'entry centre above local grade in the rising alternative'),
    guard(entryEnclosureQualified,'protected rise, structural support, duct and seals qualified'),
    guard(providerCutVerified,'provider isolation and separate downstream owner cut verified')];
  return {status:'ARCHITECTURAL_APPLICABILITY_ONLY',dropMM,modes,preferredInsideTrial:modes.find(m=>m.status==='INSIDE_TRIAL_LIMITS')?.id??null,
    reference:{deckZ,trialGrade:dock.outsideGrade,gantryStrokeDropLimitMM:gantryStrokeDropLimit,
      gantryHeightDropLimitMM:{W9:gantry.gantry.eyeMaxMM-gantryHeightDeduction-carrierHeight.W9OnCart,
        fullDoor:gantry.gantry.eyeMaxMM-gantryHeightDeduction-opening.height},
      fixedThroughMinimumDropsMM:[lift.lodigePlanning.throughMinTravelMM,lift.lodigePlanning.throughMinTravelMM+liftRampHeight]},
    protectedEntry:{status:status(protectedEntryChecks),point:entry.point,protectedRiseMM,checks:protectedEntryChecks,
      capRadiusBudgetMM:entry.riserToCapPlanMM+entry.protectedRiserRadius,ductRadiusMM:entry.protectedRiserRadius,
      cuts:functionalCuts.map(({work,cuts})=>({work,cuts})),controlledBatchLitres:drain.maximumBatchLitres,
      hold:'Verify frost, excavation/support, port sealing/movement, provider ownership and upstream isolation independently.'}};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const options=process.argv[2]?JSON.parse(readFileSync(process.argv[2],'utf8')):{};
  console.log(JSON.stringify(compareInletSite(options),null,2));
}
