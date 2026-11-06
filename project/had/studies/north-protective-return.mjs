/** Constructed protection over historical -30 DPC; geometry only, never first-leak certification. */
import assert from 'node:assert/strict';
export function deriveNorthProtectiveReturn(model){
 const walls=['loggia-west-weather','loggia-east-weather'].map(id=>model.groundWalls.find(w=>w.id===id));
 const v={historicalInnerDpc:[-180,-30],crest:15,backLegTop:60,endDamTop:75,
  materialRole:'Project1.5 folded metal wet shoe/cavity tray with separate mineral protection and bearing; constituent/residue, contact, corrosion, seam and movement acceptance remains MAT.',
  sideShoes:walls.map((w,i)=>({wall:w.id,weatherFaceX:i?w.finishedFaces[0]:w.finishedFaces[1],y:[7750,12000],
   soleZ:-180,frontFoldTop:15,capReturnAcrossBrickAndCavity:152.5,
   glassFaceX:i?w.finishedFaces[0]+152.5:w.finishedFaces[1]-152.5,
   trayZ:15,backLegTop:60,weepBottom:15,apronIntoLoggia:100,
   role:'Continuous shoe shields the weather-leaf base, returns152.5 through102.5 weather leaf and50 cavity to the outside face of the existing200 glass, and turns UP to60. Weeps and front geometric overflow are15. The old-30 inner DPC is BEHIND this actual secondary assembly, not relabelled. No metal strip crosses the200 glass or carries masonry; actual separate mineral bearing/support stays reserved.'})),
  portalCollars:{finishedAxialBands:[[7695,8470],[11280,12055]],jambFacesX:[4800,7200],bottom:-180,crest:15,endDams:75,
   role:'At the wrapped portal, weather brick is absent: a separately folded metal/mineral jamb-base collar follows the actual finished240-glass/40-lining profile, returns into each side shoe with100 accessible lap and75 end dams. No open cut at the old shoe/portal boundary. It stays at jamb edges; no upstand crosses the clear2400 walking opening.'},
  joints:{shoeSegmentsMaximum:1500,overlap:100,fastenerMinimumZ:150,wetFloorPenetrations:0,
   floorApronJoin:'Existing exterior floor wet face receives a100 lap at−180 outside the protected wall/air line. Fullheight folded end returns and separate mineral clamps back every cut; actual seal compatibility/first-wetting test stays unearned.',
   dryAirLine:'Dry-side mineral floor/plaster at0 remains behind the wet shoe and old DPC. No new floor penetration; air/gas/movement junction still has a located downstream MAT duty.'},
  controllingInterfaces:[{id:'side-shoe-front/cavity weep',z:15},{id:'wrapped-portal-base collar',z:15},{id:'south sill/rear-pan crest',z:15},{id:'shoe/collar end dams',z:75},{id:'shoe fixings',z:150}],
  exposure:'The outdoor N floor/stone/metal/RC may wet during N failure up to the declared stage. N route closes to occupants; west garden bypass remains. Occupied floor, inner DPC, insulation and air/gas plane remain behind the continuous protective returns.',
  qualifiedFirstHarm:null,physicalWeatherAccepted:false};
 verifyNorthProtectiveReturn(v,model);return v;
}
export function verifyNorthProtectiveReturn(v,model){
 assert(v.sideShoes.every(s=>s.trayZ>=v.crest&&s.weepBottom>=v.crest&&s.backLegTop>v.crest));
 assert(v.controllingInterfaces.every(q=>q.z>=v.crest));
 for(const s of v.sideShoes){const w=model.groundWalls.find(w=>w.id===s.wall);assert(w.finishedFaces.includes(s.weatherFaceX),'Protective shoe is not on actual weather face');assert.equal(s.capReturnAcrossBrickAndCavity,152.5,'Protective tray does not join actual cavity/glass boundary');}
 assert(v.portalCollars.crest>=v.crest&&v.portalCollars.endDams>=v.crest,'Portal collar leaves lower exposure');
 assert(v.joints.wetFloorPenetrations===0&&v.joints.fastenerMinimumZ>=v.crest,'Protective return has lower unbacked fixing');
 return {pass:true,scope:'Located continuous shoe/cavity tray/collar and actual geometric crests; physical qualification stays unearned.'};
}
export function renderNorthProtectiveReturn(v){
 const x=z=>80+z*.7,y=z=>540-z*1.5;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#fbfaf5"/><g font-family="sans-serif" fill="#222">';
 const t=(a,b,q,n=17)=>`<text x="${a}" y="${b}" font-size="${n}">${q}</text>`;
 s+=t(35,35,'N FLOOR PROTECTIVE RETURN · CONSTRUCTED REFERENCE',24);
 s+=t(35,75,'Old innerDPC−180..−30 stays behind this shoe/tray; geometric crest15, certified first harm NULL.');
 let at=0;for(const [w,c]of [[27,'#c6c0b5'],[140,'#99958b'],[200,'#a5d8ca'],[50,'#eef1ef'],[102.5,'#ba8d77']]){s+=`<rect x="${x(at)}" y="${y(180)}" width="${w*.7}" height="${360*1.5}" fill="${c}"/>`;at+=w;}
 s+=`<path d="M${x(519.5+100)},${y(-180)} H${x(519.5)} V${y(15)} H${x(367)} V${y(60)}" fill="none" stroke="#167a98" stroke-width="5"/>`;
 s+=`<path d="M${x(0)},${y(-30)} H${x(27)}" stroke="#b14641" stroke-width="5"/>`;
 s+=t(520,230,'Wet shoe−180→15;152.5 cap returns across weather brick/cavity.');
 s+=t(520,265,'Backleg60 at outside glass face; no thermal metal bridge through glass.');
 s+=t(520,300,'Weep15 / enddam75 / fixings150 / no wet-floor holes.');
 s+=t(520,335,'Wrapped jamb-base collars follow actual finished portal;');
 s+=t(520,365,'100 accessible laps,75 end dams, no clear-path upstand.');
 s+=t(520,410,'Quiet−35 +25 splash +25 tolerance = geometric15.');
 s+=t(520,450,'Outdoor Nfloor may wet; occupants use west bypass.');
 s+=t(35,690,'Actual metal/mineral seals, movement, cavities, retained residues and physical first-wetting remain MAT/RWT/OAS duties.');
 s+=t(35,730,'This new protective assembly changes the reference; it does not turn the historical−30 DPC into a qualified higher datum.');
 return s+'</g></svg>\n';
}
