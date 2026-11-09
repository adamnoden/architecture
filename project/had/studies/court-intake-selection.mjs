// Architectural successor to the checksum-bound two-exit house. Older experiments replay their own source.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {readSelected} from '../../rwt/studies/selected-water-event.mjs';
import {cornerService} from '../../rwt/studies/corner-service.mjs';
import {courtDecision} from '../../rwt/studies/court-intake-decision.mjs';
import {entrance,hood} from './court-intake-water.mjs';
import {cornerFrame,overlap} from './court-intake-frame.mjs';
import {intakeFigure,detailFigure} from './court-intake-figure.mjs';

const outBase='project/had/studies/court-intake-selection';
function source(path,registry){
  const raw=fs.readFileSync(path);
  registry[path]=createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex');
  return JSON.parse(raw);
}

export function courtIntakeSelection(){
  const h=readSelected(), home=h.model, r=home.renewal;
  const blobs={[h.path]:h.blob}, get=(name)=>source('project/'+name+'.json',blobs);
  const six=get('rwt/studies/collector-access-recomposition'), closed=get('rwt/studies/closed-east-control');
  const upper=get('rwt/studies/upper-first-release'),event=get('rwt/studies/selected-water-event');
  const temporary=get('rwt/studies/temporary-two-path-control'),grid=get('str/studies/current-house-grid');
  const roof=get('mat/studies/ring-roof-family'), structure=get('str/studies/reconciled-house-interface');
  const previous=courtDecision(),corner=cornerService(),required=event.duty.flowLps;
  const long=temporary.states.find(s=>s.combinedEBackupDutyLps).combinedEBackupDutyLps;
  const inlet=entrance(six,home,required,event.duty.quietStageMm),basket=hood(r,required,long);
  const frame=cornerFrame(corner,six,grid,roof,home);
  const ordinary=six.ordinaryAccess,openWindow=home.model.courtEastWindow6850;
  const priorRamp=previous.ramp,actualChamber=previous.chambers;
  const outdoor=home.passage.outdoor,eastWall=home.model.court[0]+home.model.court[2];
  const newOutdoor=[eastWall,outdoor[1],outdoor[0]-eastWall,outdoor[3]];
  const furnitureHits=Object.entries(home.model.groundFurniture).filter(([,v])=>
    Array.isArray(v)&&v.length===4&&overlap(v,newOutdoor).every(n=>n>0)).map(([key])=>key);
  const top=r.shield.clearOutlet.z[1],Qlong=basket.cases.at(-1);
  const pickup=home.model.maintenanceRainReference.northMaintenance.courtRoof.pipe;
  const groundBase={id:'HAD-COURT-INTAKE-01',status:'selected pre-site house geometry',
    acceptedHouseBase:structure.acceptedHouse,sourceCommit:'dac2777600c8425a2c7fc38d6c1a42776372b24c',
    sourceBlobs:blobs,priorHADIdentity:h.authority,structuralCandidate:structure.candidate,
    limits:{firstSusceptible:home.model.firstWetReference.qualifiedFirstSusceptibleZ,
      geometricProtection:home.model.firstWetReference.limitingLocatedJoin.z,quiet:event.duty.quietStageMm,
      hydraulicAcceptance:false,engineeredRatings:false,siteAccepted:false},
    incoming:{duty:required,longBackup:long,directRoofTerminal:pickup.route.at(-1),nozzleBore:pickup.insideDiameter,
      nozzleOD:pickup.outsideDiameter,keptCoverOpening:pickup.temporaryPipeCover.clearHole},
    inlet,basket,frame,
    access:{windowCentreY:6850,windowSource:openWindow.openingId,windowLeaf:openWindow.interior.maximumLeafEnvelope,windowTask:openWindow.proof,
      ramp:ordinary.ramp,operator:ordinary.centreline,openLeafX:ordinary.gate.parkedLeafPlan[0],
      bodyEnvelopeRadius:ordinary.bodyRadius,sideClear:ordinary.rampBodyReserves,gateNewY:frame.ramp.newGateY,
      gateAndPadClear:frame.ramp.gateToPad,westGateHinge:six.hingeTradeoff.raisedLatch.southHinge,
      westGatePark:six.hingeTradeoff.raisedLatch.parkedLeaf,westGateY:r.guardGate.clearY,westStairs:r.courtIntakeAccess,
      westPlatform:r.courtIntakeOperatorPlatform,weatherRoof:home.model.maintenanceRainReference.eastMaintenance.roof.underside,
      chamberTo200Approach:inlet.continuousApron[0]-(frame.chambers.east[0]+frame.chambers.east[2]),
      bothBodiesClear:frame.chambers.aisle,oldWestInstalledAndStored:[actualChamber.installedOverlap,actualChamber.storedOverlap],
      retractingWestRamp:priorRamp.ramp,oldSouthOverlap:previous.southernAccess.supportOverlap,
      scope:'South gate opens only on all locked/readmitted covers, and the separate west gate guards isolated E renewal.'},
    eastExport:{permanentPieces:r.pieces,terminal:r.activeOutlet.terminal,installedUpperOperator:r.courtIntakeOperatorPlatform,
      retainedTrack:r.joint.railReference,westGateFirstRest:basket.removal.selectedFirstRest,
      temporaryExtensionRule:'Outboard track and receiver crossings are assembled only while E is isolated and N has been demonstrated.',
      siteStates:event.receiverBlockedOutletScreens.map(v=>({id:v.receiver,farMax:v.spill.farEndMaximumWater,receiverFaultMax:v.spill.maximumFaultedReceiverWater})),
      limitingInternalTailLong:Qlong.allowedNominalTail,screenUpperWater:top-20},
    alternatives:{closed:{sixCovers:six.retained.coverCount,pipe:closed.tube.product,id:closed.tube.minimumInscribedBoreScreen,
      fitting:closed.intakeTurn.productComparator.item,flange:closed.carrier.flange.product,
      nativeClosedAxis:six.collector.closedOutletBinding.axis,firstJoin:closed.intakeTurn.factoryPortBinding.nativePortToFlangeFaceLength,
      park:closed.renewal.parkX,stage:closed.renewal.stage,deckEnd:closed.renewal.requiredDeckEndX,
      stageExtra:closed.renewal.stageExtensionEW,downOutlet:closed.terminal.closedRoute.at(-1),
      upperFirstBound:upper.upperExport.completeBodyRanges,lockClearY:upper.postTranslation.wholeLockedY,
      upperGuardAndRoofGaps:[upper.upperExport.minimumOverGuardAfter10,upper.upperExport.minimumBelowRoofAfter10],
      scope:'Distinct subsequent native upper-first geometry, receiver and blocked dry lane; its ports cannot drain the open pan.'},
      openAirCut:{box:newOutdoor,extraExteriorM2:newOutdoor[2]*newOutdoor[3]/1e6,
        domesticGalleryM2:(home.bridge.permanentDryGalleryClearX[1]-home.bridge.permanentDryGalleryClearX[0])*newOutdoor[3]/1e6,
        furnitureHits,decision:'Additional east exterior cut severs rear-east ground continuity with the open north loggia. Reject without another dry crossing or room replan.'}},
    states:[
      ['Ordinary / east window','Both N/E assembled. Six wet and four dry walking covers locked. Ramp and both half-lids in place. Open south gate over the covers, clean and close.'],
      ['Failed N','N entry has zero credit. Graded court feeds the continuous west edge into its actual six bodies; the ordinary dock and services are separate.'],
      ['E out of service','Prove N full duty and independent receiving/weather route. Close both gates, take out ramp, erect/test the E weather enclosure; remove all walking covers and baskets from above before using the western stair.'],
      ['N short / long works','Install the existing pipe cartridge before N is opened. Capture direct court flow at the original overhead nozzle. Long loggia diversion can combine at 4.43895; separately protect the high N chase when E is blocked.'],
      ['One roof corner','Close ordinary household access; both low chambers and both independent receivers are available. Remove/stage both ramp halves, erect restrained frame, both wet lines and chambers, then high catch before disturbing the ordinary L.'],
      ['Restore','Return the L and leader, wet-test joints and both paths, shift catch dry, then strike hoses, chambers, frame and three sockets. Return ramp, prove gates and covers. For low-body renewal, reverse the captured basket, couplings, pans and weather protection before returning E.']
    ]};
  return groundBase;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const d=courtIntakeSelection(),outputs={json:JSON.stringify(d,null,2)+'\n',svg:intakeFigure(d),detail:detailFigure(d)};
  for(const [ext,text] of Object.entries(outputs)){
    const path=ext==='detail'?outBase+'-detail.svg':outBase+'.'+ext;
    if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),text,path+' is stale');
    else fs.writeFileSync(path,text);
  }
}
