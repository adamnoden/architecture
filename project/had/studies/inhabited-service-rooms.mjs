// Reconstruct the last locally checked 46-opening heat result from the five
// immutable owner records. No measured installed performance is represented.
export function roomSelection(h,env,base,offer,th){
  const levels={G:'GROUND',F:'FIRST'}, wall={G:h.groundWalls,F:h.upperWalls};
  const fp={G:env.geometry.groundPressureFootprint,F:env.geometry.upperPressureFootprint};
  const inside=([a,b,w,d],x,y)=>x>a&&x<a+w&&y>b&&y<b+d;
  const present=(l,x,y)=>inside(fp[l].outer_mm,x,y)&&!fp[l].cuts_mm.some(r=>inside(r,x,y));
  function zone(l,x,y){
    const s=k=>{const {a,b}=wall[l].find(w=>w.id===k);return a[0]===b[0]?a[0]:a[1]};
    if(l==='G'){
      if(x<s('study-east')&&(y<s('study-cloak-north')||x<s('study-L-return')&&y<s('study-L-north')))return x>s('cloak-west')&&y>s('cloak-south')?'protected-G':'study';
      if(x>s('service-spine')&&y<s('utility-north'))return 'utility';
      if(x>s('wc-west')&&x<s('service-spine')&&y<s('wc-north'))return 'guestWC';
      if(x>s('service-spine')&&y>s('plant-intermediate-arch')&&y<s('plant-north'))return 'plant';
      if(x<s('loggia-west-weather')&&y>s('rear-west'))return 'living';
      if(x>s('loggia-east-weather')&&y>s('rear-east'))return 'kitchenDining';
    }else{
      if(x<s('bed2-east')&&(y<s('bed2-north-main')||x<s('bed2-L-return')&&y<s('bed2-L-north')))return 'bed2';
      if(x>s('bed3-west')&&(y<s('bed3-north-main')||x>s('wet-spine')&&y<s('bed3-L-north')))return 'bed3';
      if(x>s('wet-spine')&&y>s('bed3-L-north')&&y<s('bath-north'))return 'familyBath';
      if(x>s('wet-spine-principal')&&y>s('bath-north')&&y<s('rear-east-principal'))return 'principalBath';
      if(x>s('rear-divider')&&y>s('rear-east'))return 'principal';
      if(x<s('rear-wet-east')&&y>s('rear-wet-south'))return 'rearBath';
      if(x<s('rear-divider')&&(y>s('rear-west')||x>s('rear-west-return')&&y>h.court[1]+h.court[3]+h.envelope))return 'bed4';
    }
    return 'protected-'+l;
  }
  const rects=Object.values(fp).flatMap(f=>[f.outer_mm,...f.cuts_mm]);
  const cuts=i=>Array.from(new Set([...rects.flatMap(r=>[r[i],r[i]+r[i+2]]),...Object.values(wall).flat().flatMap(w=>[w.a[i],w.b[i]])])).sort((a,b)=>a-b);
  const X=cuts(0),Y=cuts(1),rows={};
  const get=k=>rows[k]??=( {plan:0,outsideAbove:0,outsideBelow:0,perimeter:0,thickWall:0,windows:0,doors:0,openingPerimeter:0,openingIds:[]} );
  for(const [l,level] of Object.entries(levels)){
    for(let i=1;i<X.length;i++)for(let j=1;j<Y.length;j++){
      const a=X[i-1],b=X[i],c=Y[j-1],d=Y[j],x=(a+b)/2,y=(c+d)/2;
      if(!present(l,x,y))continue;
      const z=get(zone(l,x,y)),ar=(b-a)*(d-c)/1e6;z.plan+=ar;
      if(l==='F'&&!present('G',x,y))z.outsideBelow+=ar;
      if(l==='G'&&!present('F',x,y))z.outsideAbove+=ar;
      for(const [px,py,len] of [[a-.001,y,d-c],[b+.001,y,d-c],[x,c-.001,b-a],[x,d+.001,b-a]]){
        if(present(l,px,py))continue;z.perimeter+=len/1000;
        if(l==='G'&&fp[l].cuts_mm.slice(1).some(r=>inside(r,px,py)))z.thickWall+=len/1000;
      }
    }
    const e=h.envelope,hi=h.shell-e,ci=h.court[0]-e,co=h.court[0]+h.court[2]+e;
    for(const o of h.archOpeningRegister[level]){
      if(!['window','door'].includes(o.kind))continue;
      const [out,side]=o.wall.split('-'),c=o.centre;
      const p=out==='outer'?{south:[c,e+.1],north:[c,hi-.1],west:[e+.1,c],east:[hi-.1,c]}:{south:[c,ci-.1],north:[c,co+.1],west:[ci-.1,c],east:[co+.1,c]};
      if(!present(l,...p[side]))throw Error(o.id);
      const z=get(zone(l,...p[side])),w=o.width/1000,s=(o.head-o.spring)/1000,r=w*w/(8*s)+s/2,jamb=(o.spring-(o.sill??0))/1000;
      z[o.kind==='door'?'doors':'windows']+=w*jamb+r*r*Math.acos((r-s)/r)-(r-s)*w/2;
      z.openingPerimeter+=w+2*jamb+2*r*Math.asin(w/(2*r));
      z.openingIds.push(l+':'+o.id);
    }
  }
  const air=offer.localAirAndHeat,leak=env.proposedDevelopment.q50_m3_per_h_m2*1.2/3.6*(4/50)**.65;
  let fabric=0,H=0,idle=0,wetTransfer=0,ground=0,junction=0,fed=0;
  for(const [n,z] of Object.entries(rows)){
    const emit=base.heat.emitterSchedule.filter(a=>a.id===n||a.room===n);
    const {level,roomTargetC:t}=emit[0],delta=t+10,lm=10/Math.log((55-t)/(45-t)),step=z.outsideAbove+z.outsideBelow;
    const wa=z.perimeter*h.sections.firstFFL/1000,open=z.windows+z.doors,roof=level?z.plan/Math.cos(h.roofDevelopment.pitch*Math.PI/180):0,floor=level?0:z.plan;
    const hl=leak*(wa+z.plan+step),Hwall=(wa-open)*th.wallU110-z.thickWall*h.sections.firstFFL/1000*(th.wallU110-th.wallU200);
    const hk=Hwall+1.6*open+.12*roof+.18*floor+th.allFieldWorstNotchAndRods*step+hl;
    const inlet=air.roomCaps[n]?.inletLps??0,vent=1.2*(inlet*delta+(t===22?16:0)*(t-20));
    const oldRadiator=emit.reduce((sum,q)=>sum+q.nominalDelta50W*(lm/50)**q.nCoefficient,0);
    const rad=n==='principal'?offer.principal.newOutputW:['bed2','bed3'].includes(n)?2150*(lm/50)**1.32:oldRadiator;
    const elec=n==='protected-G'?2000*(216.2/230)**2+1000*(216.2/240)**2:n==='protected-F'?2000*(216.2/230)**2:n==='bed4'?500*(216.2/240)**2:0;
    const jw=.02*z.openingPerimeter+.03*2*z.perimeter+.12,floorAdd=.23*floor*delta;
    const load=hk*delta+vent+jw*delta+floorAdd;
    Object.assign(z,{roomTarget:t,fabricCoefficientWK:hk,sourceW:hk*delta,addedSuspendedFloorW:floorAdd,
      boughtJunctionWK:jw,inletLps:inlet,ventilationW:vent,designDutyW:load,selectedHydronicW:rad,supplementAtLowV:elec,marginW:rad+elec-load});
    fabric+=hk*delta;H+=hk;idle+=load;ground+=floorAdd;junction+=jw*delta;
    fed+=Math.min(load,elec);if(t===22)wetTransfer+=vent;
  }
  const initial=air.hotWholeKW*1000-220*30+fabric+wetTransfer;
  const hot=initial+ground+junction+175;idle+=175;
  const defrost=((idle-fed)/1000+3)*10/60;
  return {rooms:rows,totals:{count:Object.keys(rows).length,closedOpenings:Object.values(rows).reduce((s,z)=>s+z.openingIds.length,0),
    untouchedFabricWK:H,baseFabricW:fabric,hotInitialW:initial,chargedGroundW:ground,chargedJunctionW:junction,
    primaryHeatAllowanceW:175,designIdleW:idle,designHotW:hot,directLowLineW:fed,hydronicHotW:hot-fed,
    usableMachineW:14000,hotSpareW:14000+fed-hot,dailyRoomKWh:(22*idle+2*hot)/1000,
    minRoomMarginW:Math.min(...Object.values(rows).map(z=>z.marginW)),tenMinuteDefrostKWh:defrost,
    chargedStratifiedKWh:260*3.2*10/3600,fullyMixed5KKWh:290*3.2*5/3600,old100LUpperKWh:100*3.2*10/3600,
    rechargeMin:60*defrost/(14-(idle-fed)/1000)}};
}
