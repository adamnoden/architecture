/** Join the service plan to the fitted IAS occurrences. Historical room solids
 * remain in the water source. Only the composed furnished option changes. */
export function fitHousehold(model,water,wcs,washer,host){
  const s=model.architecturalServices;
  for(const [room,b] of Object.entries(water.basins)){
    const furniture=room==='guest'?model.groundFurniture:model.upperFurniture;
    furniture[room==='guest'?'guest-WC-basin':room+'-basin']=b.pan;
  }
  Object.assign(model.groundFurniture,{'guest-WC-pan':wcs.guest.pan,'guest-WC-cistern':wcs.guest.cistern,
    'service-utility-washer':washer.geometry.body,'service-utility-sink':[10935,740,600,600]});
  Object.assign(model.upperFurniture,{'family-WC':wcs.family.suite,'principal-WC':wcs.principal.suite,
    'rear-WC':wcs.rear.pan,'rear-cabinet':wcs.rear.cabinet,'family-service-cabinet':water.shaft.cabinet});
  // The old valve bay was a reservation. Use the free strip face, rack and
  // actual waste-access footprint rather than claiming it remains 250 wide.
  const former=s.utility.valveBay;
  const top=model.groundFurniture['service-utility-sink'];
  const freeWidth=top[0]-former[0];
  const valveBay=[former[0],former[1],freeWidth,former[3]];
  model.groundFurniture['service-utility-valveBay']=valveBay;
  const utility={...s.utility,valveBay,sink:top,washer:washer.geometry.body,
    washerReservation:washer.geometry.reservation,washerFirstRest:washer.geometry.rest,
    temporaryElectricalWorkingOverlapMM2:washer.geometry.temporaryElectricalWorkingOverlapMM2,
    washerStop:washer.geometry.tasks.tap,rackFoot:[10835,1100,70,100],rackPost:[10875,1165,20,20],
    seatPlan:host.floorAndWall.seatPlan,wasteAccess:host.floorAndWall.wasteAccessTerritory,
    acquiredBranch:water.utility,status:'Independent supported washer, factory sink head, separate wet cutover and electrical task.',
    working:'Allocate room closure to washer and bench exchange. Preserve independent rack, capped connections and temporary electrical exclusion; restore the electrical field before re-energising.'};
  s.utility=utility;model.servicesInterface.utility=utility;
  s.fittedWater={basins:water.basins,wcs,kitchen:water.kitchen,shaft:water.shaft,
    wetting:water.spill,materials:'Review the appliance and mixer hoses, trap/shower parts, joints, four basin fittings, waste seals and relief unions with their actual material dispositions.'};
  model.servicesInterface.fittedWater=s.fittedWater;
  return {basins:Object.keys(water.basins).length,wcs:4,utilityClearFrontMM:freeWidth,
    status:'Located fixture, isolation and first-rest comparison; connected product, temporary support, wet testing and qualification remain separately owned.'};
}
