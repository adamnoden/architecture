import {pointRectDistance,segmentBodyDistance,segmentDistance} from './service-interface-geometry.mjs';

const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));

// The fixed head stays in the window. Each insulated cartridge pulls straight
// outward onto a captured exterior cradle after its room-side collar releases.
export function headMaintenance(head,model){
  const ffl=head.level==='FIRST'?model.sections.firstFFL:0;
  const inside=head.wall==='outer-east'?[-1,0]:head.wall==='outer-west'?[1,0]:[0,-1];
  const point=(normal,along,z)=>head.wall==='outer-east'?[12000-normal,along,z]
    :head.wall==='outer-west'?[normal,along,z]:[along,12000-normal,z];
  const roomDeck=head.roomAccess.deckZ??900;
  const body=head.roomAccess.body,shoulder=[...body,ffl+roomDeck+1050];
  const allDucts=[...model.architecturalServices.fanAccess.map(f=>f.path),model.architecturalServices.cooker.exhaustRoute];
  const allFurniture=structuredClone(head.level==='FIRST'?model.upperFurniture:model.groundFurniture);
  const park=head.roomAccess.parkedFurniture;
  if(park)allFurniture[park.id]=park.plan;
  const bodyFurniture=Math.min(...Object.entries(allFurniture).map(([id,r])=>{
    const emitter=model.architecturalServices.emitters.find(e=>'service-emitter-'+e.id===id);
    const bottom=emitter?.bottomLocal??(id==='service-utility-PVinverter'?model.architecturalServices.utility.PVinverterLocalZ[0]:0);
    const planGap=pointRectDistance(body,r)-300,verticalGap=Math.max(bottom-roomDeck-1380,0);
    return verticalGap?Math.hypot(Math.max(planGap,0),verticalGap):planGap;
  }));
  const bodyToDuct=Math.min(...allDucts.flatMap(path=>path.slice(1).map((p,i)=>
    segmentBodyDistance(path[i],p,body,[ffl+roomDeck,ffl+roomDeck+1380])-123.5)));
  const deck=head.level==='FIRST'?4300:head.holes[0].id==='cooker-exhaust'?1090:990;
  const minAlong=Math.min(...head.holes.map(p=>head.wall==='outer-north'?p.point[0]:p.point[1]));
  const maxAlong=Math.max(...head.holes.map(p=>head.wall==='outer-north'?p.point[0]:p.point[1]));
  const stage={alongMM:[minAlong-900,maxAlong+900],outwardNormalMM:[250,950],deckZ:deck,
    completeTopZ:deck+2000,standingBodyRadiusMM:300,maximumCombinedWorkerToolsAndPartKG:300,
    guardTubeDiameterMM:20,guardCentreNormalsMM:[260,940],
    feet:[[minAlong-900,250,100,100],[minAlong-900,850,100,100],[maxAlong+800,250,100,100],[maxAlong+800,850,100,100]],
    roofLowerCarrierZ:6375,roofMovementBodyAndSettingMM:48,
    roofVerticalReserveMM:6375-(deck+2000)-48,
    roofLeaderInboardFaceMM:1000,roofLeaderNormalClearanceMM:50,
    admission:'Use a tied single-width exterior access scaffold and captured cartridge cradle qualified for two workers, complete task load, anchors, the four foot fields, ground bearing, guarding and access. The ground datum and support capacity require site evidence.'};
  const cartridges=head.holes.map(port=>{
    const main=port.id.endsWith('-exhaust'),along=head.wall==='outer-north'?port.point[0]:port.point[1];
    const completeTubeOD=main?247:28,faceHalf=port.faceWidth/2;
    const offset=Math.max(completeTubeOD/2,faceHalf)+330;
    const hand=port.id==='principal-bath-condensate'?[11250,7450,ffl+2000]
      :[body[0]-inside[0]*350+(head.wall==='outer-north'?along-body[0]:0),
        body[1]-inside[1]*350+(head.wall==='outer-north'?0:Math.max(-250,Math.min(250,along-body[1]))),ffl+(head.id==='east-window-2'?2050:2160)];
    const target=point(505,along,port.point[2]+5.05-completeTubeOD/2);
    const armToDuct=Math.min(...allDucts.flatMap(path=>path.slice(1).map((p,i)=>segmentDistance(shoulder,hand,path[i],p)-123.5-40)));
    const half=Math.max(faceHalf,completeTubeOD/2);
    const bound=draw=>({outwardNormalMM:[-505+draw,100+draw],alongMM:[along-half,along+half],
      z:[port.point[2]-half-1-draw/100,port.point[2]+half+5.05-draw/100]});
    const externalShoulderZ=deck+1450;
    const bodyToPart=offset-300-half;
    return {id:port.id,wallAxis:port.point,completeTubeOD,formedDiameter:port.radius*2,
      fixedReceiverMaximumOD:port.radius*2-2,fixedReceiverMinimumID:port.radius*2-6,
      minimumRadialRunningClearanceMM:(port.radius*2-6-completeTubeOD)/2,
      completeAxialLengthMM:605,outwardFallRatio:.01,drawVectorOutwardDown:[1,-.01],initial:bound(0),clearanceState:bound(650),dryRest:bound(805),
      firstOutwardDrawMM:650,finalOutwardDrawMM:805,
      retainedOuterFaceMaximumOutwardMM:100,after650InnerTipToRetainedFaceMM:145-100,
      dryRestNormalMM:[275,930],dryRestAlongMM:[along-half-25,along+half+25],
      maximumCompleteMassKG:main?20:3,
      roomRelease:{body,shoulder,hand,target,handReachMM:distance(shoulder,hand),
        steelSocketExtensionMaximumMM:port.id==='principal-bath-condensate'?700:head.id==='east-window-2'?500:400,
        requiredExtensionMM:distance(hand,target),armToInstalledDuctMinimumMM:armToDuct},
      exterior:{frontBody:[along,600],sideBodies:[[along-offset,600],[along+offset,600]],
        bodyToCompleteMovingPartMM:bodyToPart,
        sideHandAlongOffsetMM:half+65,sideHandOutwardMM:600,sideHandZ:port.point[2],
        sideHandReachMM:Math.hypot(265,port.point[2]-externalShoulderZ),
        sideToolMaximumMM:400,sideToolRequiredMM:Math.hypot(half+65,305),
        frontHand:[along,250,port.point[2]-50],
        frontHandReachMM:Math.hypot(350,port.point[2]-50-externalShoulderZ),
        frontToolMaximumMM:300,frontToolRequiredMM:Math.hypot(150,Math.min(110,faceHalf-20),Math.min(90,faceHalf-20)+50),
        operation:'Capture the cartridge before releasing its face fasteners with the recorded tool. Both workers take the two side stations before any outward travel. A captive hand drive draws 650 mm, then a further 155 mm into the dry cradle. Each worker services the near half using the recorded hand and tool envelope. No crossing of the occupied draw lane is credited.'},
      temporaryBlank:{normalMM:[458,478],maximumOD:port.radius*2-2,retainedRoomDuctStartsNormalMM:505,
        gapToRoomDuctMM:27,minimumRoomFaceClearanceMM:25.5,verticalGuideTravelMM:400,maximumMassKG:main?3:.5,
        operation:'A captured room-side blank rises in the47mm axial gap between the fixed receiver end at458 and the retained duct at505. Its20mm body leaves27mm to the duct. Close it only after the complete cartridge has cleared. The fixed receiver falls outward and drains incidental rain back outside. Keep the inner duct separately capped.'},
      weatherClosure:'The temporary blank remains supported on its guide and fixed receiver. Isolate and close the room until the cartridge, water boundary and air/drain tests are restored. Temporary wind-driven-rain performance is an explicit qualification duty.',
      renewal:'The opaque window head and its lower glass stay fixed during cartridge renewal. Whole-head renewal uses the window assembly exterior replacement operation and requires independent glazing/frame support.'};
  });
  const result={method:'Fixed opaque head with individually outward-removable service cartridges',roomAccess:head.roomAccess,
    roomDeckLocalZ:roomDeck,kneelingHeightMM:1380,bodyRadiusMM:300,roomBodyToFurnitureMM:bodyFurniture,
    roomBodyToInstalledDuctMM:bodyToDuct,stage,cartridges,
    sequence:['Isolate the local fan or cooker, close the room and erect the qualified exterior stage. Support the retained inner duct and each complete cartridge independently.',
      'Kneel on the room platform. Release and remove both halves of the actual flat radial collar with the recorded socket extension into the supported tray. Withdraw the tool. The exterior cradle already carries the cartridge.',
      'Release the outer fixings from the front stance, then occupy the two side stances. Draw one cartridge 650 mm and continue to805mm into its supported dry cradle.',
      'Install the separate temporary weather blank and retain the room-side cap. Clean or exchange that cartridge and restore it before beginning the next port. Two removed cartridges never share one rest.',
      'Restore the collar, independent gravity drain, insulation and complete weather/air boundary. Prove fall, flow, cleanability and sealing before enabling the local service.'],
    rejectedInteriorRig:{partOverlap:'The first tube and later elbow occupied intersecting receiver volumes before any clearing step.',
      supportIntersection:'The proposed panel-only lowering crossed its solid support carriage.',
      decision:'Delete the removable inner cassette and its interior draw/lowering rig. Retain the fixed head and replace individual cartridges from outside.'},
    cleanout:'The removable cowl and full cartridge expose the complete clear passage from outside. Clean the retained duct from this end and its separate fan or hood end. Retain access at every bend and a removable grease trap where the actual appliance requires it. The installed cleanability and weather tests remain admission conditions.'};
  head.renewal=result;
  return result;
}
