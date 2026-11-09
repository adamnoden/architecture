// Recovered calculation, independent of the archived room-allocation generator.
// Dimensions mm, airflow L/s, pressure Pa. A through-flow and zero-reverse
// inlet assumption only apply to the recorded operating and negative cases.
export function controlAndStorage(nativeCharts,addedLengthM=0,addedBendK=0){
  const dp=(q,a)=>.6*q*Math.abs(q)/(.61*a/1000)**2;
  function bisect(f,lo,hi){
    if(f(lo)*f(hi)>0)throw Error('Unbracketed physical state');
    const increasing=f(hi)>f(lo);
    for(let i=0;i<38;i++){const x=(lo+hi)/2;if((f(x)<0)===increasing)lo=x;else hi=x}
    return (lo+hi)/2;
  }
  function supply(p,wet){const f=q=>dp(q,15000)+dp(q-wet,7600)+p;return f(0)>=0?0:bisect(f,0,50)}
  function state(mask,net,area){
    const fans=[0,1,3,4,5].map(i=>13+3*((mask>>i)&1));
    const [guest,utility,rear,family,principal]=fans;
    const bedrooms=p=>[supply(p,0),supply(p,0),supply(p,rear),supply(p,principal)];
    const hall=(p,bed)=>p-dp(bed.reduce((a,b)=>a+b,0)-rear-family-principal,90000);
    const ring=bisect(p=>{const b=bedrooms(p),h=hall(p,b);
      return b.reduce((a,b)=>a+b,0)+2*supply(h,0)-fans.reduce((a,b)=>a+b,net);},-30,-.001);
    const b=bedrooms(ring),h=hall(ring,b),k=h-dp(net,area);
    return {h,k,inlets:[...b,supply(h,0),supply(h,0)]};
  }
  const area=35000,chart=nativeCharts['10'],cases=[],idle=[],restored=[],maxInlets=Array(6).fill(0);
  const save=values=>values.forEach((x,i)=>maxInlets[i]=Math.max(maxInlets[i],x));
  function fanPa(q){const i=chart.findIndex((p,j)=>j&&q<=p[0]);
    const [a,A]=chart[i-1],[b,B]=chart[i];return A+(B-A)*(q-a)/(b-a)}
  for(let mask=0;mask<64;mask++){
    if(mask&4)continue;
    const n=bisect(q=>state(mask,q,area).k+4,-2,40);
    const quiet=state(mask,5,area);save(quiet.inlets);idle.push(quiet.k);
    restored.push(state(mask,.50,area).k);
    for(const [wind,error,kh,kg] of [[50,-15,.035,.030],[0,0,.032,.027],[-50,15,.029,.024]]){
      const pressure=q=>{const direct=Math.max(78,q+20-n);return state(mask,q+20-direct,area).k};
      const q=bisect(q=>{
        const v=q/1000/(Math.PI*.125**2/4);
        return fanPa(q)+error-(kh+kg)*q*q-(.03*(1.2+addedLengthM)/.125+.6+1+addedBendK)*.6*v*v+pressure(q)-wind;
      },50,99);
      const direct=Math.max(78,q+20-n),x=state(mask,q+20-direct,area);save(x.inlets);
      cases.push({q,direct,k:x.k,dp:x.h-x.k,reverse:Math.abs(dp(20-direct,area))});
    }
  }
  const span=x=>[Math.min(...x),Math.max(...x)], range=k=>span(cases.map(x=>x[k]));
  const retained=87.37613424815396+20,old=state(63,retained,7600),worst=state(63,retained,area);
  const force=delta=>Math.abs(delta)*2.04*.845**2/(2*.785);
  const air={masks:32,cases:cases.length,hoodLps:range('q'),directLps:range('direct'),hotPa:range('k'),
    idlePa:span(idle),seatedPa:span(restored),maxInlets,oldFaultKitchenPa:old.k,
    failedSupplyKitchenPa:worst.k,failedSupplyHallPa:worst.h,
    failedSupplyDoorN:force(worst.k-worst.h),failedHoodDoorN:force(range('reverse')[1]),
    acceptedOpenAreaProxy:area,requiredLoadedClosureS:4.75,
    warning:'The nominal 4.75 s contract does not prove the maximum differential, a classified door or an approved grease-rated assembled damper.'};
  let temp=60,on=false,worstTemp=100,worstMiss=0,last=0;
  const volume=300,capacity=volume*4.186/3600,kw=3*(216.2/240)**2,draws={420:80,465:80,510:70,1140:70};
  for(let day=0;day<14;day++){
    last=0;
    for(let m=0;m<1440;m++){
      const req=draws[m]||0,served=Math.min(req,volume*Math.max(0,temp-40)/30);
      if(day>=7)worstMiss=Math.max(worstMiss,req-served);temp-=served*30/volume;
      temp-=(3.5*Math.max(temp-20,0)/40+1)/(1440*capacity);
      if(temp<50)on=true;if(temp>=60)on=false;
      if(on&&!(m>=1020&&m<1140)){const e=Math.min(kw/60,Math.max(0,60-temp)*capacity);temp+=e/capacity;last+=e}
      if(day>=7)worstTemp=Math.min(worstTemp,temp);
    }
  }
  return {air,hotWater:{netOrderedLitres:300,standingLoss60_20KWhDay:3.5,netKWAt216point2V:kw,
    minimumMixedC:worstTemp,missedL40:worstMiss,finalDayChargeKWh:last,draws}};
}
