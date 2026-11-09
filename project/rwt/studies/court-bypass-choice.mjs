import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {readSelected,readCurrentCourtIntake} from './selected-water-event.mjs';
import {feeder,lowRelief,buriedReach} from './court-underdrain.mjs';
import {exchange} from './court-bypass-exchange.mjs';
import {bypassPlate} from './court-bypass-plate.mjs';

const read=p=>JSON.parse(readFileSync(p));
export function choice(){
  const {blob,model:h}=readCurrentCourtIntake(), water=readSelected().model;
  const r=read('project/rwt/studies/joined-service-routes.json');
  const site=read('project/rwt/studies/selected-receiving-interface.json');
  const grid=read('project/str/studies/current-house-grid.json'), crew=read('project/str/studies/east-service-platform.json');
  const buried=buriedReach(h,site,grid,crew), relief=lowRelief(h,buried), feed=feeder(h,r.ground);
  const handling=exchange(h,water,relief);
  const cases=[
    ['Normal and routine access','N and E both open, secondary gallery and hood checks open to tested north site. Ordinary walking caps, protection and gate restored. Incidental side capture can reach N.'],
    ['N receiving ground rejected','The passive north forebay check stops reverse basin flow. If the basin route is isolated or plugged, gallery flow must run backwards through the dedicated manifold and BOTH basket windows into available E. Verify cup level and check-valve opening head. No northern disposal credit.'],
    ['Primary E inlet/spout fully blocked','Both side galleries accept the surface event before the earlier first side spill. Their overflows do not pass through the basket. A full blockage of one gallery as well is a separate adverse case.'],
    ['E basket ports, shoe or terminal blocked','An impacting direct pipe continues into the basket. Two independent cell windows enter the backed outer hood, whose lower positive socket connects to the independent manifold. Model the actual partially submerged slots.'],
    ['E service','Prove N entrance/receiver with both routes installed. Stop both incoming E feeds, fit storm roof and complete unperforated north skirt, blank/isolate the relief cups from outside, drain and witness. Lift eastern wet carrier vertically with spout through its notch; withdraw western carrier 50 east before lift. No person under the lift.'],
    ['Basket and native spool','Retract the independently captured bottom shoe 25 east, lift the guided basket, then exchange both empty hood pieces with the hydraulic joint relieved. Use the separate inboard platform and the existing twelve-state east cartridge and outboard-rack transfer. Rebuild lower hood and prove its joint before returning the basket and pan.'],
    ['N short and long','Keep both wet carriers and full E chute assembled. Use the split walking insert to install the separate high nozzle and support it independently. Secure N before short-module removal; long job has 4.43895 L/s combined duty. A failed E path still needs the protected high N chase or an independently live north site leg.'],
    ['Returned house','Lowest wet parts first. Reopen and backwater-test both relief connections, original basket/shoe, gully feeders, independent N, E and outfalls before removing the weather screen. Prove the native side joint and all covered states before restoring the south ramp and ordinary guard/window access.'],
    ['Shared site or double blockage','A lost north basin removes both the new leg and the ordinary N destination. With E lost as well, or both galleries and the basket inlet blocked, this court has no demonstrated escape for the assigned event. Keep occupation/renewal outside that state.']
  ];
  return {id:'RWT-06-LOW-COURT-BYPASS',source:{court:blob,original:r.id,structural:'current-house-grid.json / east-service-platform.json',site:site.identity},
    feed,relief,buried,handling,cases,qualifiedFirstHarm:null,siteAccepted:false,installedPerformance:false};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const r=choice();for(const [ext,content] of [['json',JSON.stringify(r,null,2)+'\n'],['svg',bypassPlate(r)]]){
    const u=new URL('./court-bypass-choice.'+ext,import.meta.url);
    if(process.argv.includes('--check'))assert.equal(readFileSync(u,'utf8'),content);else writeFileSync(u,content);
  }
}
