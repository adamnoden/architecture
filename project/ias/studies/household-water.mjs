import { readFileSync, writeFileSync } from 'node:fs';

function household(read) {
  const house = read('had/studies/water-replan.json').model;
  const services = read('mat/studies/whole-house-service-baseline.json');
  const upper = read('ias/studies/upper-wc-release.json');
  const bathing = read('ias/studies/three-bathing-sections.json');
  const benches = read('ias/studies/utility-host-revised-route.json');
  const washer = read('ias/studies/utility-first-release.json');
  const drawing = read('ias/studies/selected-family-convergence.json');
  const check = (value, title) => { if (!value) throw Error(title); };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const distance = (a, b) => Math.hypot(...a.map((n, i) => n - b[i]));
  function gap(a, b) {
    return Math.hypot(...[0, 1].map(i => Math.max(a[i] - b[i] - b[i + 2], b[i] - a[i] - a[i + 2], 0)));
  }
  function margin(point, room) {
    return Math.min(point[0] - room[0], room[2] - point[0], point[1] - room[1], room[3] - point[1]);
  }
  function swept(a, b) {
    check(a[0] === b[0] || a[1] === b[1], 'orthogonal plan sweep');
    return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])];
  }
  const uf = house.upperFurniture, gf = house.groundFurniture;
  const guestBackY = house.envelope + 3 + 60;
  const rearNib = bathing.rearSideOption.apron;
  const fixedUpper = name => [
    ...upper[name].fixed.filter(b => !same(b, uf[name + '-basin'])),
    upper[name].suite, upper[name].fixedTerminal
  ];
  const rooms = [
    ['guest', [7300,850], [1,0], [7300,house.envelope+3,9200,2550],
      [gf['service-emitter-guest-WC-E'], [8900-239,guestBackY,454,218], [8720,guestBackY+215,360,525]]],
    ['rear', [1200,8952.5], [0,1], [429.5,8952.5,2805.5,11570.5],
      [...['rear-shower1000','rear-cabinet','rear-WC','service-emitter-rear-N','rear-west-low-box'].map(k=>uf[k]),rearNib]],
    ['family', [11567.5,5440], [-1,0], [9397,3800,11567.5,6400], fixedUpper('family')],
    ['principal', [9400,7828.75], [1,0], [9400,6600,11567.5,8152.5], fixedUpper('principal')]
  ];
  const basins = {};
  for (const [name, back, normal, room, fixed] of rooms) {
    const point = (t, d) => [back[0]+normal[0]*d-normal[1]*t, back[1]+normal[1]*d+normal[0]*t];
    function box(width, depth, offset = 0) {
      const ends = [point(-width/2,offset), point(width/2,offset+depth)];
      return [Math.min(ends[0][0],ends[1][0]), Math.min(ends[0][1],ends[1][1]),
        Math.abs(ends[0][0]-ends[1][0]), Math.abs(ends[0][1]-ends[1][1])];
    }
    const side = name === 'family' ? 70 : 0;
    const start = point(side,610), finish = point(side,1040);
    const capsule = swept(start,finish);
    const solid = Math.min(...fixed.map(b=>gap(box(470,690),b)));
    const worker = Math.min(margin(start,room),margin(finish,room),...fixed.map(b=>gap(capsule,b)))-300;
    const studs = [-140,140].map(t=>point(t,75));
    const bolts = Math.max(...studs.map(p=>distance([...start,820],[...p,790])));
    check(solid>=30 && worker>=23.75 && bolts<600, 'basin, operator and socket in '+name);
    basins[name] = {back,normal,room,fixed,bowl:box(455,255),pan:box(470,290),park:box(470,290,400),
      start,finish,solid,worker,boltReach:bolts,stops:[point(-25,100),point(125,100)],
      serviceAxis:services.fixtures.find(v=>v.id===name+'-basin').waterBranchPlan.at(-1)};
  }
  const kitchen = services.interfaces.kitchenSinkStation, feed = kitchen.retainedFeed;
  const breaks = kitchen.headFirst.lowerA.map((a,i)=>{
    const b=kitchen.headFirst.upperB[i], x=a.axis[0], disc=[70,70,94][i], od=[22,22,42][i], bore=od-2, pitch=[25,25,38][i];
    check(same(a.axis,[x,10950.5,475]) && same(b.axis,[x,10985.5,625]) && same(a.axisDirection,[0,0,1]) && same(b.faceDirection,[0,-1,0]),'unchanged lower and upper axes');
    check(disc<=Math.min(a.maximumDiameter,b.maximumDiameter) && pitch-9-od/2>=5,'two fully retractable screws');
    const bend=Math.acos(1-15/80), plain=625-40-80*Math.sin(bend)-483;
    const length=2+(Math.PI/2+2*bend)*40+plain;
    const kg=(Math.PI/4*(od**2-bore**2)*length+2*Math.PI/4*(disc**2-bore**2)*8)*8e-6+.25;
    const grips=[];
    for(const sign of [-1,1]){
      for(const t of [-Math.PI/18,0,Math.PI/18]) grips.push([x+sign*pitch+110*Math.sin(t),10950.5-110*Math.cos(t),505]);
      grips.push([x+sign*pitch,10985.5-150,625]);
    }
    const reach=Math.max(...grips.map(p=>distance(p,kitchen.headFirst.firstTask.shoulder)));
    check(reach<600 && plain>55 && disc<100,'spool withdrawal, grip and storage');
    return {id:a.id,A:a.axis,B:b.axis,disc,tubeOD:od,pitch,plain,reach,kg};
  });
  check(!JSON.stringify(house).toLowerCase().includes('dishwasher'),'house fixture inventory');
  const raised = y => 359-400*(1-Math.cos(Math.atan(1/40))) - (y-11140-400*Math.sin(Math.atan(1/40)))/40;
  check(same(feed.completeCrossingSupportEnvelopeZ,[180,304]),'retained supply support');
  const crossings=['coldPath','hotPath'].map(key=>{
    const y=feed[key][4][1], old=300-(y-10950.5)/40-21-(242+37), clearance=raised(y+50)-25-304-10;
    check(old<0 && clearance>13,'obsolete and corrected supply crossing');
    return {y,old,axis:raised(y),clearance};
  });
  const angle=Math.atan(1/40), steeper=Math.PI/4, dx=65*(Math.sin(steeper)-Math.sin(angle)), dz=65*(Math.cos(angle)-Math.cos(steeper));
  const link=(raised(12000)-273.7625-2*(dz-dx/40))/(Math.sin(steeper)-Math.cos(steeper)/40);
  const joinY=11412+2*dx+link*Math.cos(steeper), joinZ=raised(11412)-2*dz-link*Math.sin(steeper);
  check(Math.abs(joinZ-(12000-joinY)/40-kitchen.wasteRequiredRoute[2][2])<1e-6 && 11570.5-joinY-25>15,'same wall axis downstream of the native 50 outlet');
  const plates=drawing.kitchenRelease.feet.map(([x,y])=>[x-50,y-50,100,100]);
  const legs=drawing.kitchenRelease.feet.map(([x,y])=>[x-20,y-20,40,40]);
  const kitchenSheet=[8830,10885.5,640,630], park=[8830,10235.5,640,630];
  const legClear=Math.min(...legs.map(b=>gap(kitchenSheet,b)));
  const plateOverlap=Math.max(...plates.map(b=>Math.min(kitchenSheet[0]+640,b[0]+100)-Math.max(kitchenSheet[0],b[0])));
  check(legClear===10 && plateOverlap===20 && gap(park,drawing.headFirst.table.preRelease)===35.5,'catch and extraction');
  const ub=services.interfaces.architecturalServices.utility, floor=[ub.rearServiceChase[0],ub.rearServiceChase[1],ub.rearServiceChase[2],950];
  const trench=[floor[0],ub.washer[1]+ub.washer[3],floor[2],40], stand=[10170,1465,670,670];
  const clearElectric=gap(trench,ub.electricalWorkingField), clearStand=gap(trench,stand);
  check(clearElectric===310 && clearStand===25,'utility witness channel and receiver');
  const axis=[11395,940], body=[11090,1645,650], toward=[body[0]-axis[0],body[1]-axis[1]];
  const m=Math.hypot(...toward);
  const grip=(d,z)=>[axis[0]+toward[0]*d/m,axis[1]+toward[1]*d/m,z];
  const grips=[grip(245,620),grip(260,665),grip(230,610)].map(p=>distance(body,p));
  const roomClear=Math.min(...[[10935,740,600,600],washer.geometry.body,gf['service-emitter-utility-E'],[10875,1165,20,20],[11570.5,0,400,2550]].map(b=>gap([...body.slice(0,2),0,0],b)))-300;
  const discharge=[[11270,940],[10760,940],[10760,1275],[10875,1275]];
  const lines=discharge.slice(1).map((p,i)=>swept(p,discharge[i]));
  const branchLength=discharge.slice(1).reduce((l,p,i)=>l+distance(p,discharge[i]),0);
  const wetSeats=benches.floorAndWall.seatPlan;
  check(roomClear>=5 && Math.max(...grips)<540 && 620>=washer.native.drainHeight[0],'washer nozzle and reversible front tools');
  check(branchLength===960 && Math.min(...lines.flatMap(a=>wetSeats.map(b=>gap(a,b))))===40,'fixed utility branch');
  const hole=services.plant.formedOpeningProposal, cabinet=uf['family-service-cabinet'];
  const feet=[9450,9920].flatMap(x=>[4715,5370].map(y=>[x-40,y-25,80,50]));
  check(same(hole,[9440,4760,465,545]) && same(cabinet,[9397,4675,600,750]) && Math.min(...feet.map(b=>gap(b,hole)))===20,'positive RC toes');
  const pipes=services.plant.proposedServices;
  function shaftClear(id,faceY){
    const target=pipes.find(p=>p.id===id), a=target.centre, b=[9997,faceY], d=[b[0]-a[0],b[1]-a[1]];
    return Math.min(...pipes.filter(p=>p!==target).map(p=>{
      const t=Math.max(0,Math.min(1,((p.centre[0]-a[0])*d[0]+(p.centre[1]-a[1])*d[1])/(d[0]**2+d[1]**2)));
      return distance(p.centre,[a[0]+t*d[0],a[1]+t*d[1]])-p.outerEnvelope/2-15-10;
    }));
  }
  const oblique=[shaftClear('H-flow',5042),shaftClear('hot',4777)];
  check(oblique.every(x=>x>7.9),'six-service occupied shaft');
  return {basins,kitchen:{breaks,crossings,trapSeatOutletBottom:[430,359,197],raisedTransom:435,transomToSocket:435-20-359-35-10,
    regrade:[11412,65,link,joinY,joinZ],sheet:kitchenSheet,park,plateOverlap,legClear,clearUnderPlate:42-1.2-8,
    actualMassKg:breaks.reduce((total,r)=>total+r.kg,0)},
    utility:{floor,trench,clearElectric,clearStand,netL:2,grossL:1500*40*55/1e6,grips,roomClear,discharge,branchLength,finalBranchZ:610-branchLength/40},
    shaft:{hole,cabinet,feet,pipeTools:oblique},
    spill:{flowsLmin:[6,15,30],secondsAfterFirstVisible:Object.fromEntries([['basin',1.25,.2],['kitchen',.4,.05],['utility',2,.2]].map(([k,n,e])=>[k,[6,15,30].map(q=>+(60*(n-e)/q).toFixed(2))]))}};
}

function plans(d) {
  const out=['<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="765" viewBox="0 0 1120 765"><title>Four supported basin exchanges</title><desc>North-up room plans show the installed bowl, fixed objects, parked basin and operator.</desc><rect width="1120" height="765" fill="#faf8ef"/>'];
  function label(x,y,t,size=14,bold=false){out.push(`<text x="${x}" y="${y}" font-family="sans-serif" font-size="${size}" font-weight="${bold?'bold':'normal'}" fill="#223c38">${t}</text>`);}
  label(28,40,'Four supported basin exchanges',28,true);
  label(28,69,'North is up. Green shows the basin and receiving pan. Dashed brown is the parked carrier. Purple is the operator.',15);
  for(const [i,[name,r]] of Object.entries(d.basins).entries()){
    const x=29+i%2*551,y=111+Math.floor(i/2)*311;
    const [l,b,e,n]=r.room,scale=Math.min(408/(e-l),186/(n-b));
    const pos=([u,v])=>[x+25+(u-l)*scale,y+208-(v-b)*scale];
    function rect([a,b,w,h],fill,stroke,dash=''){
      const [u,v]=pos([a,b+h]);
      out.push(`<rect x="${u.toFixed(2)}" y="${v.toFixed(2)}" width="${(w*scale).toFixed(2)}" height="${(h*scale).toFixed(2)}" fill="${fill}" stroke="${stroke}" stroke-dasharray="${dash}"/>`);
    }
    label(x,y,name[0].toUpperCase()+name.slice(1),21,true);
    rect([l,b,e-l,n-b],'#eeeFE7','#718379');
    for(const item of r.fixed)rect(item,'#d6cbb4','#9d9685');
    rect(r.pan,'#91b5a8','#245d50');rect(r.bowl,'#d8ece3','#245d50');rect(r.park,'none','#94612e','5 3');
    const [ax,ay]=pos(r.start),[bx,by]=pos(r.finish);
    out.push(`<path d="M${ax.toFixed(2)},${ay.toFixed(2)} L${bx.toFixed(2)},${by.toFixed(2)}" fill="none" stroke="#75648c"/><circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="${(300*scale).toFixed(2)}" stroke="#75648c" fill="none"/>`);
    label(x,y+240,`Carrier to fixed objects    ${r.solid.toFixed(2)} mm`);
    label(x,y+264,`R300 operator to walls and fixtures    ${r.worker.toFixed(2)} mm`);
  }
  label(28,743,'The published geometry stops at the first dry rest. Each room needs its own measured backing, ceramic and fitted-service test.',14);
  return out.join('\n')+'\n</svg>\n';
}

const source = p => JSON.parse(readFileSync(new URL('../../' + p, import.meta.url), 'utf8'));
const result = household(source);
const rounded = (_, n) => typeof n === 'number' ? Number(n.toFixed(5)) : n;
for (const [name, text] of [
  ['household-water.json', JSON.stringify(result, rounded, 2) + '\n'],
  ['four-basin-exchanges.svg', plans(result)]
]) {
  const path = new URL(name, import.meta.url);
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== text) throw Error('Stale ' + name);
  } else {
    writeFileSync(path, text);
  }
}
console.log('Household water fixture geometry, fixed branch crossovers, first-wetting fields and shaft clearances verified.');
