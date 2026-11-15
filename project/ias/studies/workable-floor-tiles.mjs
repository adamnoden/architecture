const intersection = ([x0,y0,x1,y1], [a0,b0,a1,b1]) =>
  [Math.max(x0,a0), Math.max(y0,b0), Math.min(x1,a1), Math.min(y1,b1)];
const area = ([x0,y0,x1,y1]) => Math.max(0,x1-x0)*Math.max(0,y1-y0);

export function tileField(pitch, [originX,originY], roomBands, roomItems) {
  const cells = [];
  const bounds = [
    Math.min(...roomBands.map(b=>b[0])),Math.min(...roomBands.map(b=>b[1])),
    Math.max(...roomBands.map(b=>b[2])),Math.max(...roomBands.map(b=>b[3]))
  ];
  for(let x=originX+Math.floor((bounds[0]-originX)/pitch)*pitch; x<bounds[2]; x+=pitch){
    for(let y=originY+Math.floor((bounds[1]-originY)/pitch)*pitch; y<bounds[3]; y+=pitch){
      const box=[x,y,x+pitch,y+pitch];
      const clipped=roomBands.map(band=>intersection(box,band)).filter(part=>area(part)>0);
      const coverage=clipped.reduce((sum,part)=>sum+area(part),0);
      if(!coverage)continue;
      const full=coverage===pitch**2;
      const fixedObstructions=roomItems.filter(([,item])=>area(intersection(box,item))>0).map(([id])=>id);
      cells.push({box,clipped,full,fixedObstructions});
    }
  }
  return cells;
}
