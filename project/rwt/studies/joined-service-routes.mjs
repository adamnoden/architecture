import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {readCurrentCourtIntake} from './selected-water-event.mjs';
import {raisedService} from './raised-service-routes.mjs';
import {groundService} from './court-service-feed.mjs';
import {servicePlate} from './court-service-plate.mjs';

export function serviceRoutes(){
  const {path,blob,model:had}=readCurrentCourtIntake();
  const roof=raisedService(had),ground=groundService(had,roof.tributary.oneCorner);
  const record={id:'RWT-06-RAISED-ROOF-COURT-SERVICE',source:{path,blob},roof,ground,
    disposition:{ordinary:'Develop the shortened return shoe, four available ground stations and deck corner access.',
      cassette:'Develop a guarded transfer with two contained boots. Other longitudinal water must have its own tested live route before opening.',
      major:'Retain the separately erected high over-roof and guided ridge repair as a conditional site proposition.',
      groundNorth:'Test the whole N entry, baffle and trunk with E unavailable. Keep the short-before-long source sequence and independent high-chase backup.',
      groundEast:'Develop continuous high containment and an above-grate emergency spill before relying on concentrated E delivery. Prove both independent receiving states.',
      firstWater:'Test the actual shoe, weep, portal collar, saddle and south pan-end backing against the imposed water stage.',
      complete:false,qualifiedFirstHarm:null,siteAccepted:false,physicalEventPerformed:false}};
  return {record,plate:servicePlate({...record,had})};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const {record,plate}=serviceRoutes();
  for(const [extension,content] of [['json',JSON.stringify(record,null,2)+'\n'],['svg',plate]]){
    const url=new URL('./joined-service-routes.'+extension,import.meta.url);
    if(process.argv.includes('--check'))assert.equal(readFileSync(url,'utf8'),content);
    else writeFileSync(url,content);
  }
}
