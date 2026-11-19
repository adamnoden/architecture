import {pointRectDistance,segmentDistance,segmentBoxDistance} from './service-interface-geometry.mjs';

const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const rectangleGap=(a,b)=>Math.hypot(Math.max(a[0]-b[0]-b[2],b[0]-a[0]-a[2],0),
  Math.max(a[1]-b[1]-b[3],b[1]-a[1]-a[3],0));

const segmentToRect=(a,b,r)=>{
  const corners=[[r[0],r[1]],[r[0]+r[2],r[1]],[r[0]+r[2],r[1]+r[3]],[r[0],r[1]+r[3]]];
  return Math.min(pointRectDistance(a,r),pointRectDistance(b,r),...corners.map((c,i)=>
    segmentDistance([...a,0],[...b,0],[...c,0],[...corners[(i+1)%4],0])));
};

export function selectedRadiatorMaintenance(model){
  const services=model.architecturalServices;
  const definitions=[
    {id:'kitchen-W',direction:[1,0],carrier:[7894.5,10170,250,1400],
      valveBodies:[[8244.5,10540],[8244.5,11160]],shoulderZ:600,valves:[[7819.5,10245,350],[7819.5,11495,350]],
      operator:[8469.5,10645],control:[8244.5,10645,1000],returnPath:[[8469.5,10645],[8800,10645]],
      park:{'dining-chair-west-north':[8200,8450,500,500]},maximumLoadKG:80},
    {id:'rear-W',direction:[1,0],carrier:[604.5,9225,250,700],
      valveBodies:[[954.5,9575],[954.5,9575]],shoulderZ:600,valves:[[529.5,9300,350],[529.5,9850,350]],
      operator:[1179.5,9600],control:[954.5,9600,1000],returnPath:[[1179.5,9600],[1179.5,10100]],
      maximumLoadKG:40},
    {id:'principal-S-high',direction:[0,1],carrier:[10965,6775,570,250],
      valveBodies:[[11242.5,7100],[11242.5,7100]],shoulderZ:1450,
      valves:[[11000,6700,2125],[11500,6700,2125]],valveHands:[[11000,6850,1800],[11500,6850,1800]],valveToolMaximumMM:450,
      actualPanelBox:[11050,6622,2075,400,158,600],
      operator:[10625,7100],control:[11000,6925,1100],returnPath:[[10625,7100],[10625,7550]],
      maximumLoadKG:30,loweredBottomMM:100}
  ];
  return definitions.map(d=>{
    const emitter=services.emitters.find(e=>e.id===d.id),furniture=structuredClone(emitter.level?model.upperFurniture:model.groundFurniture);
    Object.assign(furniture,d.park??{});
    delete furniture['service-emitter-'+d.id];
    const original=emitter.completePlanWithValvesAndBrackets;
    const final=original.map((v,i)=>i<2?v+200*d.direction[i]:v);
    const clearance=body=>Math.min(...Object.entries(furniture).map(([id,r])=>{
      const e=services.emitters.find(q=>'service-emitter-'+q.id===id);
      const vertical=e?Math.max(e.bottomLocal-2000,0):0;
      const plan=pointRectDistance(body,r)-300;
      return vertical?Math.hypot(Math.max(plan,0),vertical):plan;
    }));
    const result={...d,installedPlan:original,firstRestPlan:final,liftMM:50,frontDrawMM:200,
      liftedZ:[emitter.bottomLocal+50,emitter.topLocal+50],
      finalZ:[d.loweredBottomMM??emitter.bottomLocal,(d.loweredBottomMM??emitter.bottomLocal)+600],
      carrierToFurnitureMM:Math.min(...Object.values(furniture).map(r=>rectangleGap(d.carrier,r))),
      operatorToFurnitureMM:clearance(d.operator),operatorToCarrierMM:pointRectDistance(d.operator,d.carrier)-300,
      valveBodyToFurnitureMM:Math.min(...d.valveBodies.map(clearance)),
      valveHandReachMM:d.valves.map((v,i)=>distance([...d.valveBodies[i],d.shoulderZ],d.valveHands?.[i]??v)),
      valveToolRequiredMM:d.valveHands?d.valves.map((v,i)=>distance(d.valveHands[i],v)):[0,0],
      valveToolToPanelMinimumMM:d.actualPanelBox?Math.min(...d.valves.map((v,i)=>segmentBoxDistance(d.valveHands[i],v,d.actualPanelBox)-15)):null,
      rejectedCentralHandToolToPanelMM:d.actualPanelBox?segmentBoxDistance([11242.5,6850,1800],[11025,6700,2125],d.actualPanelBox)-15:null,
      controlReachMM:distance([...d.operator,1450],d.control),
      continuousReturnReserveMM:Math.min(...Object.values(furniture).map(r=>segmentToRect(d.returnPath[0],d.returnPath[1],r)-300)),
      handling:'A wall-tied captured carriage supports the complete assembly through50mm lift,200mm front draw and lowering. Its carrier moves with the radiator and remains beneath it. Keep the operator at the recorded side station during every loaded movement.',
      sequence:'Isolate, cool, drain and support both retained pipes. Release and counterhold the flat unions while the radiator remains on its wall brackets. Cap the retained pipes. Leave the valve stations before erecting the captured carriage. Lift, draw and lower under positive mechanical capture, then reverse the proved movement for replacement. Leak-test, vent and restore the occupied room.',
      admission:'Qualify the tied carriage, anchors, brakes, end catches, complete mass and bracket lifting geometry for the selected room. The model retains the actual fixed furniture and complete moving body.'};
    emitter.renewal={...emitter.renewal,selectedReference:result};
    return result;
  });
}
