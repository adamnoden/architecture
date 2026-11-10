import {pointRectDistance} from './service-interface-geometry.mjs';

const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));

export function selectedInletMaintenance(model){
  const s=model.architecturalServices;
  const stations={
    study:{body:[3045,1225]},living:{body:[3625,10900],hand:[3300,11250,1800]},
    bed2:{body:[3045,1225]},bed3:{body:[8955,1225]},
    bed4:{body:[4800,10775],platform:[4475,10450,650,650],deck:900,
      park:{'bed4-island-wardrobe':[2942,9800,1500,660]}},
    principal:{body:[10775,8950],platform:[10450,8625,650,650],deck:900,
      park:{principal:s.emitters.find(e=>e.id==='principal-N').renewal.parkedBed}}
  };
  return s.supply.map(inlet=>{
    const station=stations[inlet.id],port=model.exteriorPortGeometry.find(p=>p.id===inlet.id+'-supply');
    const north=port.wall==='outer-north',east=port.wall==='outer-east';
    const along=east?port.p[1]:port.p[0],ffl=port.level*model.sections.firstFFL;
    const point=(normal,a,z)=>east?[12000-normal,a,z]:[a,north?12000-normal:normal,z];
    const normal=east?12000-station.body[0]:north?12000-station.body[1]:station.body[1];
    const shoulder=[...station.body,ffl+(station.deck?1950:1450)];
    const hand=station.hand?station.hand.map((v,i)=>i===2?v+ffl:v)
      :point(normal-350,along,ffl+(station.deck?2300:1800));
    const target=point(608,along,port.p[2]+6.08-130);
    const furniture=structuredClone(port.level?model.upperFurniture:model.groundFurniture);
    Object.assign(furniture,station.park??{});
    const carrier=east?[11100,along-200,225,400]:north?[along-200,11100,400,225]:[along-200,675,400,225];
    const bodyToFurniture=Math.min(...Object.values(furniture).map(r=>pointRectDistance(station.body,r)-300));
    const exteriorDeck=port.level?(port.p[2]===5550?4200:4300):660;
    const result={id:inlet.id,point:port.p,wall:port.wall,...station,bodyHeightMM:station.deck?1380:2000,
      shoulder,hand,target,handReachMM:distance(shoulder,hand),socketMaximumMM:500,socketRequiredMM:distance(hand,target),
      bodyToFurnitureMM:bodyToFurniture,bodyToCarrierMM:pointRectDistance(station.body,carrier)-300,
      innerCartridge:{completeOD:347,axialLength:150,installedNormalMM:[458,608],drawMM:250,
        finalNormalMM:[708,858],finalZ:[port.p[2]+7.08-173.5,port.p[2]+8.58+173.5],
        maximumCompleteMassKG:12,flatRadialJoint:true,axialPilotMM:0,retainedReceiverID:354,radialGapMM:3.5,
        supportedCarrier:carrier,normalDryRestMM:[675,900],
        temporaryBlank:{normalMM:[458,478],maximumOD:358,verticalTravelMM:400,roomFaceReserveMM:25.5}},
      exterior:{fixedWeatherFaceWH:[400,400],projectionMM:100,roofReserveMM:6375-port.p[2]-200-48,
        stage:{alongMM:[along-900,along+900],outwardNormalMM:[250,950],deckZ:exteriorDeck,
          completeTopZ:exteriorDeck+2000,guardTubeOD:20,guardNormalsMM:[260,940],guardCentreZ:exteriorDeck+1100,roofReserveMM:6375-exteriorDeck-2000-48},
        hoodToInboardGuardMM:port.p[2]-200-3.5-(exteriorDeck+1110)-10,
        sideBodies:[[along-530,600],[along+530,600]],bodyToMovingHoodMM:30,
        hood:{maximumCompleteMassKG:12,initialNormalMM:[0,100],finalNormalMM:[350,450],drawMM:350,
          supportedRestNormalMM:[325,475],completeWHDepth:[400,400,100],drawFallMM:3.5,settingAllowanceMM:10},
        handReachMM:Math.hypot(265,port.p[2]-exteriorDeck-1450),socketMaximumMM:450,
        socketRequiredMM:Math.hypot(265,150)},
      operation:'Isolate the served room and park the named empty furniture. Capture the150mm inner module, release its two flat radial collar halves and withdraw250mm along the1%axis onto the fixed dry cradle. Keep the retained outer hood and receiver supported. Fit the guided temporary blank before cleaning or exchange. Restore and test both flow directions before reopening the room.',
      exteriorOperation:'The fixed400mm weather hood remains during inner module renewal. For hood renewal, use the recorded tied exterior stage and captured cradle. Two workers take the side stations before its350mm outward draw. Lower only after it reaches the separate supported rest. The inner blank stays closed throughout.',
      performance:'The same assembled inlet must provide15000mm² inward and5000mm² unpowered outward equivalent area at Cd0.61, with its complete metal passages, insect/weather and acoustic elements. The150mm module and fixed receiver are the selected dimensional reference for product qualification.',
      admission:'Test complete weather, air, sound, thermal, fire, material and captured handling duties within these dimensions. The fixed receiver and hood drain to the outside.'};
    inlet.selectedFirstRelease=result;
    return result;
  });
}
