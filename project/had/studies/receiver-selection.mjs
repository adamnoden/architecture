import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {entry,responses} from './receiver-flow.mjs';
import {occupied,services} from './receiver-access.mjs';
import {plate,detail} from './receiver-plate.mjs';

export function selection(){
  const inputs={};
  function read(path){
    const bytes=readFileSync('project/'+path+'.json');
    inputs[path]=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
    return JSON.parse(bytes);
  }
  const h=read('had/studies/court-intake-selection'),home=read('had/studies/water-replan');
  const low=read('rwt/studies/court-bypass-choice'),sites=read('rwt/studies/selected-receiving-interface');
  const grid=read('str/studies/current-house-grid'),temp=read('rwt/studies/temporary-two-path-control');
  const arch=services(h,home,grid,temp),flow=responses(h,-1025,-300,h.basket.cases.at(-1).raisedTail);
  return {id:'HAD-COURT-BYPASS-01',status:'selected pre-site architectural receiver',startingMain:'3c4c52e211db639b59c0d99e0e7361f2caed9261',inputs,
    authority:{retained:[h.priorHADIdentity,h.id],challenger:low.id,site:sites.identity},
    limits:h.limits,entrance:entry(),access:occupied(h,home,grid),services:arch,flow,
    composition:{case:[5700,6550,350,810],bottom:-1100,westCatchX:[5700,5930],calmX:[5935,6050],
      southImpactToY:6740,solidQuietEndWallY:6740,roofTerminalZ:-160,wallX:5930,wall:5,windows:[[6857.5,-920,200,120],[7125,-920,200,120]],screenCassetteY:[[6852.5,7062.5],[7120,7330]],screenGross:[210,130],lowNNeck:[7015,7265,-1025,-940],screenPitch:12,screenHole:9,screenReservePerWindow:.75,
      weir:{soffit:-140,roofWestEdge:-160,crest:-300,alongY:[7010,7280],netLength:195,throat:[250,85],discharge:'Separate covered, vented return only. Bring its outlet through the case wall to (5900,6900).'},
      removableSpout:{x:[5710,5885],startY:6525,toY:6580,entered:30,outerUnderside:40,adverseEffectiveWidth:(175-10)*.75,headAtDuty:2000*(h.incoming.duty**2/(((175-10)*.75)**2*9.81))**(1/3),headAtLong:2000*(h.incoming.longBackup**2/(((175-10)*.75)**2*9.81))**(1/3)},
      westEntryWithMetal:[5700,6625,216,725],northWetReturn:7360,skirtReturn:7380,
      tests:{bothExternalSites:false,surgeAndBackwater:false,perforatedTrafficLoad:false,soilAndSupport:false,firstHarmfulLevel:null}},
    northSite:{xy:low.buried.receiver,bottom:low.buried.forebayFloor,edge:low.buried.forebayOpenEdge,
      originalBasin:low.buried.siteBasin,ordinaryWater:low.buried.normalTail,faultWater:low.buried.faultTail},
    comparisons:{raised:{id:low.handling.highAlternative,decision:'Reject three sliding shutters across the full temporary north weather skirt.'},
      occupiedLowReturn:{southCupFarthest:low.handling.selectedOpenPlatform.maxDistanceToSouthCup,
        actualPlatform:low.handling.selectedOpenPlatform.plan,projectingCrowns:low.handling.selectedOpenPlatform.remainingPipeCrownAboveFloor,
        boughtHoodJoint:low.handling.hood.jointLength,deeperSocket:low.relief.basket.bottomCoupling.axis,
        remedy:'Withdraw both complete cups and downlegs under double isolation. Lower both branch inverts to −1000 or below, reinstall two load-bearing flush plugs and prove reverse flow, vent, occupied footing and the 2.2 m pressure seam.'}},
    states:[
      ['Ordinary occupied','Keep the separately supported perforated covers locked. Original N L-inlet and low west-to-N drain work, high E is dry; the south ramp and east window remain available.'],
      ['N surface or low pipe blocked','Sources entering the exposed floor can reach the west deck. A blocked low pipe raises its calm cell to the independent E weir. Retain the separate original N inlet whenever it is available.'],
      ['N receiving territory unavailable','Isolate the low N connection against reverse pressure. Give zero credit to both north outlets; the high E line carries the whole event to its own chute and separate site.'],
      ['E shoe, external outlet or end nozzle blocked','With N available the west sump stays below the high E sill. No new E delivery in steady state. Prove shutoff transients, venting and no cross-spray before admitting this phase.'],
      ['Corner','Remove complete south ramp; erect guard, feet, towers and actual receiving chambers before releasing any roof joint. Chamber E discharges straight into the south box port. Both chamber lids constrained. Restore every corner part and route, then strike before reinstating the ramp.'],
      ['E service','Prove N under full duty. Isolate, drain and witness the upper E branch, fit independently supported E weather roof and full skirt. Retract the nose 80 west; retain the closed, locked west walking box and available N. Remove dry walking panels from above, then descend west stair onto the unobstructed −800 platform. Restore native east cartridge, nozzle, screens and complete weather test before reopening.'],
      ['N short, then N long','Prove E by temporarily closing low N with original surface N independently available. Install direct west pipe and vented upper alternate before any N opening. While N is open, feed the protected impact chamber, keep E and its receiver proved; if E fails use separately verified N high chase to the available northern site. Long loggia branch follows all short crews. Restore in reverse.'],
      ['Grate, case and total excavation','Guard and isolate one cover at a time. Prove separate N L and maintain an independently contained temporary roof feed during any wet-box shutoff. For whole-case replacement, exclude court, isolate both branches, over-roof/divert directly to separate available site, shore and excavate from above. Re-pressure and wet-test each outlet and all reinstated paving before use.'],
      ['Both receiving sites, shared obstruction or common-cause','No paired outlet credit. Retain independent mapped spill territories; reject occupancy or stop work if the alternate discharge cannot be proved.']
    ]};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const record=selection();
  for(const [name,data] of [['receiver-selection.json',JSON.stringify(record,null,2)+'\n'],['receiver-selection.svg',plate(record)],['receiver-service.svg',detail(record)]]){
    const dest=new URL(name,import.meta.url);
    if(process.argv.includes('--check'))assert.equal(readFileSync(dest,'utf8'),data);else writeFileSync(dest,data);
  }
}
