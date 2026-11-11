/** Reconcile the two inherited water duties challenged by MRA-INTERNAL-LEAKS.
 * Historical service inputs stay intact. This neither selects a new inlet nor
 * changes the fitted kitchen's already-authored raised above-floor branch. */
import assert from 'node:assert/strict';

export function segmentLengthInsideBox(a,b,low,high){
  let start=0,end=1;
  for(let i=0;i<3;i++){
    const d=b[i]-a[i];
    if(d===0){if(a[i]<low[i]||a[i]>high[i])return 0;continue;}
    const t=[(low[i]-a[i])/d,(high[i]-a[i])/d].sort((x,y)=>x-y);
    start=Math.max(start,t[0]);end=Math.min(end,t[1]);
    if(end<=start)return 0;
  }
  return (end-start)*Math.hypot(...b.map((v,i)=>v-a[i]));
}

export function inletEnvelopeWitness(model){
  const s=model.architecturalServices;
  const inlet=s.otherServiceDuties.find(d=>d.id==='incoming-water');
  const radiator=s.emitters.find(e=>e.id==='plant-N');
  assert(inlet&&radiator,'Current inlet and plant-N occurrences are required');
  const [x,y,w,d]=radiator.completePlanWithValvesAndBrackets;
  const box={low:[x,y,radiator.bottomLocal],high:[x+w,y+d,radiator.topLocal]};
  const segments=inlet.path.slice(1).map((b,i)=>({from:inlet.path[i],to:b,
    lengthInsideRequiredEnvelopeMM:Number(segmentLengthInsideBox(inlet.path[i],b,box.low,box.high).toFixed(8))}));
  return {radiator:radiator.id,box,segments,
    totalLengthInsideRequiredEnvelopeMM:segments.reduce((n,e)=>n+e.lengthInsideRequiredEnvelopeMM,0),
    scope:'Intersection with the complete required radiator territory, not detailed solid metal or an installed collision.'};
}

export function selectedKitchenTail(water,base){
  const tail=structuredClone(base.interfaces.kitchenSinkStation.wasteRequiredRoute.slice(-2));
  assert.equal(tail.length,2,'Kitchen downstream wall and external-tail reservations are required');
  const waste=water.kitchen.breaks.find(b=>b.id==='waste');
  const [,,,joinY,joinZ]=water.kitchen.regrade;
  assert.equal(tail[0][0],waste.A[0],'Selected kitchen waste and downstream wall must share X');
  // The IAS JSON rounds its two regrade coordinates to five decimals.
  assert(Math.abs(joinZ-(tail[0][1]-joinY)/40-tail[0][2])<1e-4,
    'Selected raised kitchen branch must reach the existing downstream wall level');
  return tail;
}

export function reconcileSelectedWaterDuties(model,water,base){
  const tail=selectedKitchenTail(water,base),inlet=inletEnvelopeWitness(model);
  assert(inlet.totalLengthInsideRequiredEnvelopeMM>0,
    'Inherited inlet conflict changed; reassess its selected-route and isolation status');
  const inheritedInlet=base.interfaces.architecturalServices.otherServiceDuties.find(d=>d.id==='incoming-water');
  const requirement='Adopt a coordinated incoming-water route clear of plant-N and the actual wall cores, with a located accessible upstream isolator and contained drain. The lobby alternative remains unadopted; preserve site/frost, independent support, utility branch and cylinder-release duties.';
  for(const s of [model.architecturalServices,model.servicesInterface]){
    assert.equal(s.otherServiceDuties.filter(d=>d.id==='foul-kitchen').length,1);
    assert.equal(s.otherServiceDuties.filter(d=>d.id==='incoming-water').length,1);
    assert.deepEqual(s.otherServiceDuties.find(d=>d.id==='incoming-water').path,inheritedInlet.path,
      'Do not silently adopt a new inlet while correcting its status');
    s.otherServiceDuties=s.otherServiceDuties.map(d=>{
      if(d.id==='foul-kitchen')return {...d,path:structuredClone(tail),
        pathScope:'Downstream wall crossing and external-tail reservation only.',
        upstreamSource:'project/ias/studies/household-water.json#/kitchen',
        downstreamSource:'project/mat/studies/whole-house-service-baseline.json#/interfaces/kitchenSinkStation/wasteRequiredRoute',
        decision:'Use the fitted kitchen raised Ø50 branch to the existing wall crossing and retained external tail. The former trap/straight-branch reservation is superseded. Actual opening, fittings, receiving crown/diameter/invert and discharge remain to qualify.'};
      if(d.id==='incoming-water')return {...d,
        status:'REJECTED_RETAINED_ROUTE',
        decision:'Retained solely to expose the rejected incoming-water route; it is not a resolved selected inlet or isolation arrangement.',
        rejectionSource:'project/mat/services-water-joints.md#damaged-tube-at-the-east-plant-station',
        alternativeSource:'project/mat/plant-inlet-route.md',
        currentWitness:structuredClone(inlet),adoptionRequirement:requirement};
      return d;
    });
  }
  return ['Incoming-water REWIND: '+inlet.totalLengthInsideRequiredEnvelopeMM+
    ' mm of inherited centreline enters the current plant-N required envelope. '+requirement];
}
