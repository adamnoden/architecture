// Operating envelopes on the permanent west receiver. Millimetres, litres/second, kN.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {eastGround} from './east-ground-outfall.mjs';
import {serviceDrawing} from './court-service-selection-plate.mjs';

const read=p=>JSON.parse(readFileSync('project/'+p+'.json','utf8'));
const gap=(a,b)=>Math.hypot(...[0,1].map(i=>Math.max(a[i]-b[i]-b[i+2],b[i]-a[i]-a[i+2],0)));
const centred=([x,y],w,d)=>[x-w/2,y-d/2,w,d];
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function footDistance(p,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1];
  if(dx===0&&dy===0)return dist(p,a);
  const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));
  return dist(p,[a[0]+t*dx,a[1]+t*dy]);
}

function liveWindows(h){
  const c=h.composition, windows=c.screenCassetteY, [start,end]=c.weir.alongY;
  // Treat every moving cassette or blind as entirely opaque at the crest.
  // Worst relative Y shift of the manufactured window and the lifting piece is 10.
  const shadows=windows.map(([a,b])=>Math.max(...[-10,0,10].map(d=>
    Math.max(0,Math.min(end,b+d)-Math.max(start,a+d)))));
  const lowestSoffit=c.weir.soffit-5,highestSill=c.weir.crest+5;
  const cases=h.flow.rows.map(row=>{
    const lifts=shadows.map(shadow=>{
      const left=(end-start-shadow-10)*.75;
      const surface=highestSill+2000*((row.q/left)**2/9.81)**(1/3);
      // One independently seated screen only; discard its deepest quarter.
      const impact=surface+row.quiet;
      return {shadow,restrictedCrestWidth:left,quiet:surface,impact,
        openSoffitClear:lowestSoffit-surface,impactToQuietReference:h.limits.quiet-impact};
    });
    // Measure whole holes. Cells under the measured edges are not included.
    const need=Math.ceil(row.screenHoleCount*.75),area=need*Math.PI*.0045**2;
    return {q:row.q,lifts,holesToVerify:need,holesCounted:row.screenHoleCount,
      conservativeNOffImpactWithGaugedMate:row.highELevel+4*(row.q/1000/area)**2*1000/(2*9.81),
      normalNHighIntakeDry:row.EcrestDryWithN, shutNWithBothHardwareSeated:row.impactWhenNClosed,
      halfMateDuringLong:row.impactWithHalfScreen, downstreamEHead:row.remaining};
  });
  assert.deepEqual(shadows,[62.5,170]);assert.equal(cases[0].holesToVerify,102);
  assert(cases[0].lifts.every(x=>x.openSoffitClear>15&&x.impactToQuietReference>55));
  assert(cases[1].lifts[1].openSoffitClear<0&&cases[1].lifts[1].impactToQuietReference>0);
  assert(cases[1].halfMateDuringLong>h.limits.quiet);
  return {shadows,lowestSoffit,highestSill,cases,allowLongWhileChangingScreen:false};
}

function handling(h,old,home){
  const c=h.composition, [x,y,w,d]=c.case, ledger=h.access.plate.supportCentreY;
  const lids=ledger.slice(1).map((end,i)=>[x+w/2,(ledger[i]+end)/2]);
  const screens=c.screenCassetteY.map(([start,end])=>[c.calmX[0]+12.5,(start+end)/2]);
  const aims=[...lids,...screens], mast=[5215,6710],stage=[5005,5875],body=[5800,5910];
  const shoes=[4550,5260].flatMap(X=>[6200,7140].map(Y=>centred([X,Y],280,140)));
  const cornerPads=old.frame.pads.map(p=>centred(p,400,400));
  const wet=[h.services.receiver,h.services.approach,h.services.westGate,...home.northNormalRoute.normal.inletRegions];
  const stageBox=centred(stage,450,350), path=[[body[0],4250],body];
  const shoeGap=Math.min(...shoes.flatMap(s=>[...wet,...cornerPads,stageBox].map(r=>gap(s,r))));
  const thresholdX=home.southCourtWeatherDoor.hinges.map(p=>p[0]);
  const entryGap=Math.min(body[0]-thresholdX[0],thresholdX[1]-body[0])-44-300;
  const escapeWidth=Math.min(...[...shoes,stageBox,...wet,...cornerPads].map(r=>gap([body[0],4250,0,body[1]-4250],r)))-300;
  const maxWetRadius=Math.max(...aims.map(a=>dist(a,mast))),rip=dist(stage,mast);
  // Retract to 400, then swing via north/west, then extend straight to parking.
  // The entire inner swing is bounded by a circle. Both straight strokes keep
  // the moving article within its half diagonal, even when its orientation changes.
  const grossRadius=Math.hypot(350,Math.max(...ledger.slice(1).map((v,i)=>v-ledger[i])))/2;
  const dryVector=[stage[0]-mast[0],stage[1]-mast[1]];
  const dryInner=dryVector.map((v,i)=>mast[i]+400*v/rip);
  const wetStrokeClear=Math.min(...aims.map(a=>{
    const r=dist(mast,a),inner=a.map((v,i)=>mast[i]+400*(v-mast[i])/r);
    return footDistance(body,inner,a)-300-grossRadius;
  }));
  const innerClear=dist(body,mast)-400-300-grossRadius;
  const dryClear=footDistance(body,dryInner,stage)-300-grossRadius;
  const allClear=Math.min(wetStrokeClear,innerClear,dryClear);
  const court=home.court;
  const innerWall=Math.min(mast[0]-court[0],mast[1]-court[1],court[0]+court[2]-mast[0],court[1]+court[3]-mast[1])-400-grossRadius;
  const screenedRange=c.windows.map(([Y,Z,W,H])=>[Z-5,Z+H+5]);
  const liftFrom=screenedRange[0][0],carryBottom=1250,hookedToTopReach=Math.max(...aims.map(a=>Math.hypot(dist(body,a),940-(-100))));
  // A protected operator bay is open SOUTH to the existing courtyard door.
  // A narrow vertical sleeve accepts the unloaded setting wand, not people or loads.
  const guard={xs:[5400,6300],ys:[5520,6365],topZ:1100,portX:[5800,5898],portZ:[250,700],wandOD:24};
  const guardFeet=guard.xs.flatMap(X=>guard.ys.map(Y=>centred([X,Y],120,120)));
  const guardGap=Math.min(...guardFeet.flatMap(a=>[...shoes,...wet,...cornerPads,stageBox].map(b=>gap(a,b))));
  const bayAtFeet=Math.min(body[0]-guard.xs[0]-60,guard.xs[1]-60-body[0])-300;
  const reachCrossings=aims.map(([X,Y])=>{const u=(guard.ys[1]-body[1])/(Y-body[1]);
    return [body[0]+u*(X-body[0]),940+u*(-100-940)];});
  const wandReserve=Math.min(...reachCrossings.flatMap(([X,Z])=>[X-guard.portX[0],guard.portX[1]-X,Z-guard.portZ[0],guard.portZ[1]-Z]))-guard.wandOD/2;
  assert(guardGap>=25&&bayAtFeet>=25&&wandReserve>=5, JSON.stringify({guardGap,bayAtFeet,wandReserve}));
  const nakedReached=Math.hypot(dist(body,screens[1]),940-screenedRange[1][1]);
  // Avoid soft/uneven ground assumptions. Gravity restoring from ballast only.
  // Frame self-weight counts for bearing but supplies no favourable overturning credit.
  const G=250*9.81/1000,Q=.60, horizontal=.15,height=2.60,M=horizontal*height;
  const ballast=[4760,6670], xrange=[4550,5260],yrange=[6200,7140];
  const points=[...aims,stage,[x,y],[x+w,y+d]];
  // Within the retracted arc, a wet or dry payload can swing west of the ballast line.
  // Compare a complete bounding square, including corners that the real arc cannot reach.
  for(const X of [mast[0]-400,mast[0]+400])for(const Y of [mast[1]-400,mast[1]+400])points.push([X,Y]);
  const moments={};
  for(const [axis,at,sign,label] of [[0,xrange[0],1,'W'],[0,xrange[1],-1,'E'],[1,yrange[0],1,'S'],[1,yrange[1],-1,'N']]){
    const gravity=sign*G*(ballast[axis]-at)/1000;
    moments[label]=gravity-M+Math.min(0,...points.map(p=>sign*Q*(p[axis]-at)/1000));
  }
  const total=G+Q+60*9.81/1000;
  const slope=Math.hypot(h.access.maxGradient.x,h.access.maxGradient.y);
  assert(shoeGap>=25&&entryGap>=200&&escapeWidth>=50);
  assert(maxWetRadius<900&&rip<900&&allClear>20&&innerWall>300,JSON.stringify({maxWetRadius,rip,allClear,innerWall}));
  assert(hookedToTopReach<1900&&nakedReached>1900);
  assert(Math.min(...Object.values(moments))>0,JSON.stringify(moments));
  return {mast,shoes,stageBox,body,guard,guardFeet,guardGap,bayAtFeet,reachCrossings,wandReserve,path,thresholdX,shoeGap,entryGap,escapeWidth,lids,screens,maxWetRadius,
    toDryRest:rip,grossRadius,innerClear,wetStrokeClear,dryClear,allClear,innerWall,
    surfaceEyeMaximumReach:hookedToTopReach,bareEyeVerticalReach:nakedReached,screenBottom:liftFrom,carryBottom,
    screenLift:carryBottom-liftFrom,looseBlockAndLidLimitKg:40,ballastKg:250,ballastCentre:ballast, maximumHorizontalLoadKN:horizontal,maximumMomentHeightM:height,
    minimumRestoringKNm:moments,onePadGrossKPa:total/(.28*.14),antiSlideFriction:(horizontal+slope*total)/total,
    minimumParkedGuardTop:1100,installed:false};
}

export function serviceSelection(){
  const h=read('had/studies/receiver-selection'),old=read('had/studies/court-intake-selection');
  const home=read('had/studies/water-replan').model,roof=read('rwt/studies/joined-service-routes').roof;
  const site=read('rwt/studies/selected-receiving-interface'),east=eastGround();
  assert.equal(east.qualifiedFirstHarm,null);assert.equal(h.limits.siteAccepted,false);
  return {id:'RWT-06-PERMANENT-RECEIVER-SERVICE',house:h.id,roofSource:'joined-service-routes / roof only',
    normalInlet:h.entrance.selected, windows:liveWindows(h),handling:handling(h,old,home),roof:{
      pole:roof.reach.minimumPoleEffective,return:roof.reach.returnLeg,shortenedAdverse:roof.reach.shortenedAdverse,
      major:roof.major,straight:roof.straight.rows},
    ground:{basins:[site.north,site.east].map(s=>({bounds:s.receiverBounds,normal:s.maximumWater,bed:s.bedMaximum,
        spill:s.blockedOutletSpill.edge,fault:s.blockedOutletSpill.maximumFaultedReceiverWater,
        farEnd:s.blockedOutletSpill.farEndMaximumWater})),
      eastDry:{footEnd:east.crew.footEnd,stairY:east.crew.stairY,cargoLift:east.crew.cargoLift},
      eastWet:{normal:east.wet.low,bypass:east.wet.high}, services:{receiver:h.services.receiver,approach:h.services.approach,
        westGate:h.services.westGate,northKeeper:h.services.guard.newPost},
      ordinary:courtState(h), floorWaterReference:h.limits.quiet,protectedReference:h.limits.geometricProtection},
    duties:['Cleaning and rodding','Outlet and downpipe removal','Visible gullies and inspection',
      'Court, doors and thresholds','Wall base and splash','Receiving site and dry escape'],
    successor:'RWT-07',qualifiedFirstHarm:null,installedPerformance:false,acceptedSite:false};
}
function courtState(h){
  return {lowN:h.flow.low,highE:h.flow.high,normalArea: h.entrance.selected.area, maxBroad:h.entrance.selected.next2,
    longWithNClosed:h.flow.rows[1].impactWhenNClosed, crewAccess:h.services.Ework.platform};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const q=serviceSelection();const check=process.argv.includes('--check');
  for(const [suffix,output] of [['json',JSON.stringify(q,null,2)+'\n'],['svg',serviceDrawing(q)]]){
    const dest=new URL('./court-service-selection.'+suffix,import.meta.url);
    if(check)assert.equal(readFileSync(dest,'utf8'),output);else writeFileSync(dest,output);
  }
}
