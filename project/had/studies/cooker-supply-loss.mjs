// The 14-node closed-door air network from the connected cooker study, with
// isothermal room-air storage. Units are Pa, m³, L/s, mm² and seconds.
const nodes=['study','living','bed2','bed3','bed4','principal','protected-F','protected-G','kitchenDining','guestWC','utility','rearBath','familyBath','principalBath'];
const ring=6, hall=7, kitchen=8;
const fanIds=['ground-WC','utility','rear-bath','family-bath','principal-bath'];
const orifice=(pa,area)=>.61*area/1000*Math.sign(pa)*Math.sqrt(Math.abs(pa)/.6);

export function supplyLoss(house,{mask=31,volumeScale=1,profile='early',dt=.0005}={}) {
  if(!['early','late'].includes(profile)) throw Error('Unknown flow profile');
  const s=house.model.architecturalServices, transfer=s.transfers, max=s.cooker.closure.proof;
  const small=transfer.otherEquivalent;
  const edges=[[0,hall,small],[1,hall,small],[2,ring,small],[3,ring,small],[4,ring,small],[5,ring,small],
    [4,11,small],[ring,12,small],[5,13,small],[ring,hall,transfer.stair],[hall,9,small],[hall,10,small],[hall,kitchen,transfer.eastEquivalent]];
  const supplyAreas=['study','living','bed2','bed3','bed4','principal'].map(id=>s.supply.find(v=>v.id===id).measuredEquivalentAreaRequired);
  const extracts=fanIds.map((id,i)=>s.fanAccess.find(f=>f.id===id).modes[(mask>>i)&1]);
  const volumes=nodes.map(n=>3.1*volumeScale*(s.rooms[n].plan+(n==='utility'?s.rooms.plant.plan:0)));
  // Isothermal pV=mRT at 101325 Pa. Positive net inflow raises room pressure.
  const compliance=volumes.map(v=>1000*v/101325), p=nodes.map(()=>-4), net=nodes.map(()=>0);
  function flux(extract) {
    net.fill(0);
    for(let i=0;i<supplyAreas.length;i++)net[i]=orifice(Math.max(0,-p[i]),supplyAreas[i]);
    for(const [i,j,area] of edges){const q=orifice(p[i]-p[j],area);net[i]-=q;net[j]+=q;}
    for(let i=0;i<extracts.length;i++)net[9+i]-=extracts[i];
    net[kitchen]-=extract;
  }
  function advance(extract){flux(extract);for(let i=0;i<p.length;i++)p[i]+=dt*net[i]/compliance[i];}
  // Hold the commissioned kitchen pressure until the other rooms settle.
  for(let i=0;i<Math.round(24/dt);i++){advance(0);p[kitchen]=-4;}
  flux(0);
  const healthyNet=net[kitchen];
  const residual=2*s.cooker.closure.maxExtractLeakLpsEach;
  // The upstream retained 87.376 L/s fault ceiling exceeds all normal high
  // operating points. Keep it after supply loss even with both motors tripped.
  const peak=Math.max(87.37613424815396,max.hoodLps[1])+s.fanAccess.find(f=>f.id==='kitchen').modes.at(-1);
  const closure=s.cooker.closure, seated=closure.detectionS+closure.actuatorS;
  let atDeadline,minimum=0,lastBelow=0,doorDifferential=0;
  for(let i=0;i<Math.round(9/dt);i++){
    const t=i*dt, travel=(t-closure.detectionS)/closure.actuatorS;
    // Bounds on actual combined outward FLOW. No angle-to-flow law is assumed.
    let fraction=travel<1?1:0;
    if(profile==='early'&&travel>=0){
      if(travel>=.75&&travel<1)fraction=.1;
      else if(travel>=.5&&travel<.75)fraction=.25;
      else if(travel>=.25&&travel<.5)fraction=.5;
    }
    advance(residual+(peak-residual)*fraction);
    const end=(i+1)*dt;
    minimum=Math.min(minimum,p[kitchen]);doorDifferential=Math.max(doorDifferential,Math.abs(p[kitchen]-p[hall]));
    if(p[kitchen]<-5)lastBelow=end;
    if(i+1===Math.round(5/dt))atDeadline=p[kitchen];
  }
  return {volumeM3:volumes.reduce((a,b)=>a+b,0),healthyNet,peak,seated,atDeadline,lastBelow,minimum,doorDifferential,final:p[kitchen]};
}
