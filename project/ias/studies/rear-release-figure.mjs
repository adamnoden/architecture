// Schematic widths only. The sections plot axial elevations from rearReleaseTrial.
export function releaseFigure({closed, parking, exchange, reach}) {
  const p = reach.pecolift, low = closed.centredBottomToTopAtD0[0]
  const [freeLow, freeTop] = exchange.sleeveJustOffFixedPipeBottomToTopAtD0
  const cut = exchange.fixedPipeTopAtD0, tip = cut + parking.lowerEndGap
  const board = closed.boardTop, span = freeTop-freeLow
  const slabBottom = closed.rcUnderside, slabTop = closed.rcTop
  const z = value => 210 + (3450-value)*0.93
  const parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 722" width="1240" height="722" role="img" aria-labelledby="t d">',
    '<title id="t">Rear shower drain sleeve exchange and lower working reach</title>',
    '<desc id="d">Three sections compare a centred installed sleeve, the sleeve parked below the drain and its removal from the fixed pipe after the tray has been lifted. A separate elevation scale compares the sleeve ends with ideal arm reach.</desc>',
    '<style>text{font-family:DejaVu Sans,Arial,sans-serif;fill:#19343c}.title{font-size:32px;font-weight:bold}.sec{font-size:21px;font-weight:bold}.head{font-size:16px;font-weight:bold}.body{font-size:15px}.small{font-size:13px}.muted{fill:#526770}.warm{fill:#95451c}.cool{fill:#176f71}.num{font-size:14px;font-weight:bold;font-variant-numeric:tabular-nums}</style>']
  const add = s => parts.push(s)
  const rect = (x,y,w,h,c) => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`)
  const line = (x,y,xx,yy,c,w=1,dash='') => add(`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round"/>`)
  const label = (x,y,s,k='body',anchor='start') => add(`<text x="${x}" y="${y}" class="${k}" text-anchor="${anchor}">${s}</text>`)
  const n = v => String(Math.round(v*10)/10)
  const pipe = '#197778', sleeve = '#a94c1f', ink = '#19343c', gray = '#a4b1b1'
  rect(0,0,1240,722,'#fcfcf8')
  label(32,43,'Replacing the rear shower drain sleeve','title')
  label(33,73,'BetteDown B594 and Geberit 390.217.14.1  ·  Centred 10 mm end gap  ·  All section elevations at trial d = 0 mm','body muted')
  line(32,91,1208,91,'#344c4e',1.5)
  label(33,125,'Release the drain before replacing the sleeve','sec')
  label(33,149,'Vertical elevations in mm. The coloured marks show axial extents. Widths are schematic.','small muted')
  const states = [
    ['1  Closed','Tray and drain seated',closed.centredBottomToTopAtD0,
      '46.5 mm overlap on each end.', 'The branch has its own restraint.'],
    ['2  Parked down','Tray still seated',parking.parkedBottomToTopAtD0,
      `Lower sleeve ${n(parking.centredStroke)} mm.`, 'Leave 25 mm below the cut end.'],
    ['3  Sleeve just free','Tray supported away from well',[freeLow, freeTop],
      `Lift ${n(exchange.liftFromParkToJustClearFixedEnd)} mm off the fixed end.`, 'Introduce the new sleeve here.']]
  for (const [i,[name,sub,range,cap,subcap]] of states.entries()) {
    const x = 129+253*i
    label(x-89,182,name,'head');label(x-89,202,sub,'small muted')
    for (const left of [x-66,x+54]) {
      rect(left,z(slabTop),12,z(slabBottom)-z(slabTop),'#dce2dd')
      line(left,z(slabTop),left+12,z(slabTop),gray)
      line(left,z(slabBottom),left+12,z(slabBottom),gray)
    }
    if(i===0) {
      for (const [a,b] of [[x-54,x-6],[x+6,x+54]]) rect(a,z(board),b-a,z(slabBottom)-z(board),'#d4bd8a')
    } else {
      line(x-54,z(board),x+54,z(board),'#b6aa89',1,'3 5')
    }
    // The fixed pipe and upper tail share an axis when connected. Offset the
    // sleeve dimension line for legibility. No actual hand or socket OD shown.
    line(x,z(cut),x,z(3120),pipe,3)
    line(x-5,z(cut),x+5,z(cut),pipe,2)
    if(i<2) {
      line(x,z(3435),x,z(tip),ink,2,'5 4')
      line(x-5,z(tip),x+5,z(tip),ink,2)
    }
    line(x+12,z(range[0]),x+12,z(range[1]),sleeve,4)
    for (const a of range) {
      line(x+7,z(a),x+18,z(a),sleeve,2)
      label(x+22,z(a)+5,n(a),'num warm')
    }
    label(x-89,550,cap,'small');label(x-89,571,subcap,'small muted')
  }
  for (const [height,name] of [[slabTop,'Slab top'],[board,'Board top'],[slabBottom,'Slab soffit']]) {
    line(195,z(height),201,z(height),gray)
    label(206,z(height)+4,`${name} Z${n(height)}`,'small muted')
  }
  line(33,589,759,589,'#bac7c4')
  line(36,611,57,611,ink,2,'5 4'); label(65,616,'Upper drain axis','small')
  line(214,611,235,611,pipe,3); label(243,616,'Fixed pipe axis','small')
  line(382,611,403,611,sleeve,4); label(411,616,`Sleeve, ${n(span)} mm`,'small')
  rect(555,605,18,11,'#d4bd8a');label(582,616,'Board, removed in 2 and 3','small')
  label(35,645,'Reinstall with the new sleeve parked. Seat and restrain the tray, then raise the sleeve to the verified','small')
  label(35,665,'seal positions. Inspect the joint and test it before restoring the floor and wet-room closures.','small')
  line(783,111,783,669,'#bac7c4')
  label(804,125,'Reach from the lower platform','sec')
  label(804,149,`Pecolift trial  ·  deck ${p.deck}, shoulders ${p.shoulderZ}, arm ${p.arm} mm`,'small muted')
  const yr = v => 192 + (3370-v)*2.05
  const xr = 835
  line(xr,yr(3370),xr,yr(3210),gray,1.5)
  // Two neighbouring levels at the lower end are separated with leaders.
  for (const [level,dy,title,tail,color] of [
    [closed.centredBottomToTopAtD0[1],0,'Upper sleeve mouth','centred trial, d = 0',sleeve],
    [p.shoulderZ+p.arm,-7,'Vertical reach ceiling','even directly overhead',ink],
    [p.highestAxisAtLeastOneHandEveryOrigin,-19,'One hand to the axis','for every allowed basket position',pipe],
    [low,17,'Lower sleeve end','centred trial, d = 0',sleeve],
    [p.highestAxisBothHandsEveryOrigin,16,'Both hands to the axis','for every allowed basket position',pipe]]) {
    const y = yr(level), ly=y+dy
    line(xr-5,y,xr+6,y,color,2)
    line(xr+6,y,xr+22,ly,color)
    label(xr+28,ly+5,`Z${n(level)}`,'num')
    label(xr+115,ly+5,title,'head')
    label(xr+115,ly+23,tail,'small muted')
  }
  line(804,553,1207,553,'#bac7c4')
  label(804,579,`With the board fitted, the upper mouth is at least Z${p.lowestClosedUpperMouth}.`,'small')
  label(804,600,`Even directly overhead, this is ${p.minimumMouthShortfallEvenStraightUp} mm beyond the arm limit.`,'small')
  label(804,631,'Axis reach does not establish a usable grip, tool clearance,','small muted')
  label(804,651,'verified engagement, safe posture or platform deployment.','small muted')
  line(32,682,1208,682,'#bac7c4')
  label(33,705,'IAS rear shower  ·  Proposed 400 mm formed well and 800 mm ceiling hatch  ·  Existing floor structure and platform deployment require separate verification.','small muted')
  add('</svg>')
  return parts.join('\n')+'\n'
}
