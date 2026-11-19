import assert from 'node:assert/strict';
const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
export function verifyCourtEastWindow(v){
  let bodyMargin=Infinity,reach=0;
  for(let k=0;k<=360;k++){
    const t=k/360,a=t*Math.PI/2,h=v.interior.hinge,tip=[h[0]+v.interior.leafWidth*Math.sin(a),h[1]+v.interior.leafWidth*Math.cos(a)],
      p=v.interior.bodyStart.map((x,i)=>x+t*(v.interior.bodyEnd[i]-x)+(i===0?30*Math.sin(Math.PI*t):0));
    bodyMargin=Math.min(bodyMargin,distance(p,h,tip)-300-v.interior.leafThickness/2,p[0]-300-v.galleryClearX[0],v.galleryClearX[1]-p[0]-300);
    reach=Math.max(reach,Math.hypot(p[0]-tip[0],p[1]-tip[1]));
  }
  // A quarter-degree interval moves body+tip by less than4mm. Deduct that
  // continuous envelope instead of crediting a discrete minimum as exact.
  assert(bodyMargin-4>=25,'Actual sash/operator/gallery sweep fails');
  assert(reach+4<=600,'Actual sash handle exceeds reference reach');
  const c=v.cleaning,cover=c.closedCoverPlan;
  assert(c.body[0]-300>=cover[0]&&c.body[0]+300<=cover[0]+cover[2]&&c.body[1]-300>=cover[1]&&c.body[1]+300<=cover[1]+cover[3],'Cleaning operator lacks continuous closed cover support');
  assert(c.eastGuardState==='RETAINED; ALL COVERS LOCKED CLOSED','Cleaning requires retained guard and closed covers');
  assert(c.glassZ[0]>c.guardTopZ,'Fixed-head cleaning pole crosses retained guard');
  assert(c.closedWalkingCoverReference.bottomZ-c.closedWalkingCoverReference.hoodTopZ>=25,'Walking cover underside hits retained hood');
  assert(c.body[0]-300>=c.closedWalkingCoverReference.permanentIntakeNotch[0]+c.closedWalkingCoverReference.permanentIntakeNotch[2]+25,'Cleaning operator enters permanent intake notch');
  const maxPole=Math.max(...c.glassZ.map(z=>Math.hypot(c.glassX-c.body[0],z-c.shoulderWorldZ)));
  assert(maxPole<=c.poleWorkingLength,'Cleaning head cannot reach complete glass height');
  return {minimumConservativeBodyReserve:bodyMargin-4,maximumConservativeHandleReach:reach+4,maximumCleaningPoleReach:maxPole,
    scope:'Constructive spatial reference; no force, glass, hardware, walking-cover load or occupational/access-category qualification.'};
}
export function deriveCourtEastWindow(model,renewal){
  const opening=model.openings.GROUND.find(o=>o.id==='court-east-1');assert(opening?.centre===6850&&opening.width===1000);
  const v={openingId:opening.id,retainedRoughOpening:opening,galleryClearX:[8179.5,9203],
    interior:{family:'Two inward side-hung rectangular leaves below fixed arched head; project maximum450-wide leaf envelope, not selected supplier kit',
      maximumLeafEnvelope:450,frameJambEach:50,gapsEach:3,leafWidth:445.5,leafThickness:44,hinge:[8179.5,6403],leafZ:[803,2497],handleZ:1200,
      bodyStart:[8508.5,7200],bodyEnd:[8870,6800],radius:300,
      oppositeLeafState:'CLOSED. Repeat north leaf by mirroring every hinge/leaf/body point aboutY6850; never open both during the proved task.',
      path:'Body moves continuously beside the rotating leaf, keeping the complete450 sweep and600 reach; no450+600 scalar width rejection.'},
    cleaning:{closedCoverPlan:[6125,6300,1525,1100],coverTopAtBody:0,body:[7325,6850],shoulderWorldZ:1450,
      glassX:7750,glassZ:[2500,2850],poleWorkingLength:1800,
      eastGuardState:'RETAINED; ALL COVERS LOCKED CLOSED',guardTopZ:1100,
      closedWalkingCoverReference:{topZ:0,bottomZ:-60,modules:10,modulePlan:[305,550],
        eastWestLedges:{width:60,eastX:7590,westSegments:[{x:6125,y:[6300,6950]},{x:6225,y:[6950,7400]}],z:[-120,-60],role:'Original west ledge is removed across directmouth; offsetledge6225 lies beyond100 freefall slot. No−60 sill remains in water approach.'},
        hoodTopZ:-110,grossUndersideToHood:50,
        permanentIntakeNotch:renewal.courtCollector.actualOpenEntries.coverNotch.plan,
        notchScope:'NEcorner7200..7650/Y7300..7400 is permanently open/guarded, not walking cover. Actual cleaning body maxY7150 remains150 south. Reprofile modularcovers/edgecapture around this source notch; no plate spans inlet.',
        accessAdapter:{plan:[5125,6600,1100,600],courtEndZ:-74,coverEndZ:0,deckThickness:15,lipUndersideZ:-15,solidFill:false,edgeBeamShadowY:[7175,7275],
          role:'Open-sided framed ramp, not a filled dam. At wet lip its−15 underside is20 above quiet−35; sidebeam/postshadow is excluded from credited inlet. Complete support/load admission remains STR.'},
        scope:'Explicit mineral/metal load-bearing closed-cover territory, no credited insulation or hood bearing. Actual1525 span/ledge/capture loads require STR/MAT proof. The74rise is crossed by the1100 open-framed ramp reference; no accessibility-category acceptance.'},
      leafCleaning:{innerFace:'Clean with leaf CLOSED from gallery body[8508.5,6850]; ordinary handled wiper reaches750..2500.',
        exteriorFace:'Open ONE leaf90 using the proved lateral path; clean exposed exterior face from its end-side gallery body[8870,6800] (north leaf mirrored). Fixed arched head stays closed and is cleaned externally above the guard.',
        poleWorkingLength:1800,physicalAccessQualified:false},
      role:'All structural walking covers remain locked/supported over well and hood. Guard remains intact. Only fixed arched-head exterior2500..2850 is reached from these covers, wholly above1100 guard. No low-glass pole through a guard, loose panel, descent or live renewal is credited.',
      scope:'Upper pane reach includes fixed arched head. Ordinary pole geometry only; pressure, glass/edge impact, cover bearing/supports, guard capture/weight and safe surface remain downstream qualification.'},
    costs:'Retains both court windows and visible symmetry. New operating/cleaning reference replaces an absent E6850 task proof; supplier leaf/frame geometry must fit these envelopes or reopen it.'};
  assert(JSON.stringify(renewal.courtIntakeWell)===JSON.stringify(v.cleaning.closedCoverPlan));
  assert(2*v.interior.leafWidth+3*v.interior.gapsEach+2*v.interior.frameJambEach===opening.width);
  v.proof=verifyCourtEastWindow(v);return v;
}
