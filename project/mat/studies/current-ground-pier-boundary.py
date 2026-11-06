#!/usr/bin/env python3
"""Source-bound local comparison. Geometry/arithmetic checks are not assembly admission."""
from pathlib import Path
import argparse, hashlib, json, math, subprocess
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent

def immutable(source,decode_json=True):
    data=subprocess.check_output(['git','show',source['commit']+':'+source['path']],cwd=ROOT)
    blob=subprocess.check_output(['git','hash-object','--stdin'],input=data,cwd=ROOT,text=False).decode().strip()
    assert blob==source['blob'],f"Source blob mismatch: {source['path']}"
    return json.loads(data) if decode_json else data.decode()

def area(poly):
    return abs(sum(x*y2-x2*y for (x,y),(x2,y2) in zip(poly,poly[1:]+poly[:1])))/2

def field_topology(m):
    # Proposed field at current finished faces. No historic warm-grid rectangle.
    e=m['envelope'];shell=m['shell'];x,y,w,h=m['court'];outer=[e,e,shell-2*e,shell-2*e]
    walls={q['id']:q for q in m['groundWalls']}
    west,east=walls['loggia-west-weather'],walls['loggia-east-weather']
    cuts=[[x-e,y-e,w+2*e,h+e],
      [west['finishedFaces'][0],y+h,east['finishedFaces'][1]-west['finishedFaces'][0],shell-e-y-h]]
    spine,plant,north=(walls[k] for k in ['gallery-east-water-weather','plant-north','east-passage-north-weather'])
    cuts.append([spine['finishedFaces'][0],plant['finishedFaces'][0],shell-e-spine['finishedFaces'][0],north['finishedFaces'][1]-plant['finishedFaces'][0]])
    solids=[]
    for q in walls.values():
      vertical=q['a'][0]==q['b'][0]
      assert vertical or q['a'][1]==q['b'][1], 'Nonorthogonal wall needs an explicit field recipe'
      start,end=sorted([q['a'][1 if vertical else 0],q['b'][1 if vertical else 0]])
      lo,hi=q['finishedFaces'];last=start
      for a,b in sorted(q.get('holes') or []):
        assert start<=a<b<=end and a>=last, 'Invalid/overlapping floor-level wall holes'
        if last<a:solids.append([lo,last,hi-lo,a-last] if vertical else [last,lo,a-last,hi-lo])
        last=b
      if last<end:solids.append([lo,last,hi-lo,end-last] if vertical else [last,lo,end-last,hi-lo])
    def inside(q,a,b):return q[0]<a<q[0]+q[2] and q[1]<b<q[1]+q[3]
    xs=sorted(set([outer[0],outer[0]+outer[2]]+[v for q in cuts+solids for v in [q[0],q[0]+q[2]] if outer[0]<=v<=outer[0]+outer[2]]))
    ys=sorted(set([outer[1],outer[1]+outer[3]]+[v for q in cuts+solids for v in [q[1],q[1]+q[3]] if outer[1]<=v<=outer[1]+outer[3]]))
    mask={}
    for i,(a,b) in enumerate(zip(xs,xs[1:])):
      for j,(c,d) in enumerate(zip(ys,ys[1:])):
        if not any(inside(q,(a+b)/2,(c+d)/2) for q in cuts+solids):mask[i,j]=(b-a)*(d-c)
    perimeter=0
    for i,j in mask:
      for di,dj,length in [(1,0,ys[j+1]-ys[j]),(-1,0,ys[j+1]-ys[j]),(0,1,xs[i+1]-xs[i]),(0,-1,xs[i+1]-xs[i])]:
        if (i+di,j+dj) not in mask:perimeter+=length
    seen=set();components=[]
    for p in mask:
      if p in seen:continue
      todo=[p];seen.add(p);ar=0
      while todo:
        a,b=todo.pop();ar+=mask[a,b]
        for di,dj in [(1,0),(-1,0),(0,1),(0,-1)]:
          q=a+di,b+dj
          if q in mask and q not in seen:seen.add(q);todo.append(q)
      components.append(ar/1e6)
    return {'outer':outer,'outdoorAndWallCuts':cuts,'netField_m2':sum(mask.values())/1e6,'edgeLength_m':perimeter/1000,'connectedComponents_m2':components},(xs,ys,mask)

def produce():
    c=json.loads((HERE/'current-ground-pier-boundary.json').read_text())
    s=immutable(c['sources']['STR']);h=immutable(c['sources']['HAD']);ground=immutable(c['sources']['STRground']);grid=immutable(c['sources']['STRgrid']);threshold_code=immutable(c['sources']['HADthreshold'],False)
    floor=h['model']['northNormalRoute']['floorJoin']
    assert floor['layers']==c['selectedFloorGuard']['layers'] and floor['z']==c['selectedFloorGuard']['z']
    sp=s['capillarySplice'];p=c['plate'];assert sp['plateZ']==p['z'] and sp['plateThickness']==p['thickness']
    assert sp['governingCard']=={'M':300,'Ncompression':500,'Nuplift':100,'V':75}
    polys=[x['polygon'] for x in s['RClegs']['piers']]
    areas=[area(x)/1e6 for x in polys];assert all(abs(a-.2604)<1e-9 for a in areas)
    assert s['RClegs']['actualLpolygonLegPhysicalLength']==1000
    sw=polys[0];end=max(x for x,y in sw);raw_window=min(d['centre']-d['width']/2 for d in h['model']['archOpeningRegister']['GROUND'] if d['wall']=='outer-south' and d['kind']=='window')
    reserve=raw_window-end-p['edgeFlange']['projectionAtLegEnds']
    assert reserve>=25
    r=c['perimeterAirReturn'];assert r['embeddedFoot']['depthBelowRCTop']<r['floorSteelTopCoverGuard']
    assert r['retainedPlasterTotal']-r['sheet']-r['keyStandOff']>0
    assert not c['preferredConditionalRoute']['floorRewind']
    pan=c['fullPanChallenger'];assert not pan['selected'] and pan['remainingDistribution']+pan['sheet']==floor['layers'][1]
    topology,mesh=field_topology(h['model'])
    density=c['thermalScreen']['metalDensity'];edge_height=c['fullPanChallenger']['edgeReturnTop']-pan['z'][0]
    topology['edgeReturnHeight_mm']=edge_height
    topology['flat1mmMass_kg']=topology['netField_m2']*pan['sheet']/1000*density
    topology['edge230mmMass_kg']=topology['edgeLength_m']*edge_height/1000*pan['sheet']/1000*density
    topology['flatAndEdgeQuantityScreen_kg']=topology['flat1mmMass_kg']+topology['edge230mmMass_kg']
    topology['scope']='Proposed source-located net field/edge lower bound, not a sealed system or installed cut list. Frame/reveal consumption and developed edges are unqualified. Excludes seam overlaps, corner development, supports, three renewable door transitions, stair/support boots, waste and fabrication.'
    # Join the real renewable pan apron to the finite field and support territory.
    # This proves plan coverage, never a new pad, structural bearing or a seal.
    threshold=h['model']['southCourtThresholdReference'];tp=threshold['pan'];seat=tp['permanentSeat']
    route=next(q for q in ground['lower_grid']['actual_routes'] if q[0]=='court-S')
    _,ba,bb,bw=route
    assert ba[1]==bb[1] and ground['lower_grid']['top']==floor['z'][3]
    field_y=h['model']['court'][1]-h['model']['envelope']
    apron=tp['dryFold'];assert apron['y'][1]==tp['rear']['planeY'] and apron['crestZ']==tp['rear']['crestZ']
    beam_y=[ba[1]-bw/2,ba[1]+bw/2]
    assert beam_y[0]<=field_y<apron['y'][0]<apron['y'][1]<=beam_y[1]
    assert ba[0]<=seat['plan'][0] and seat['plan'][0]+seat['plan'][2]<=bb[0]
    assert seat['rcZ']==sorted(floor['z'][3:]) and c['thresholdTransition']['fieldPlaneZ']==pan['z']
    profile=tp['dryFold']['profileYZ']
    assert profile==c['thresholdTransition']['actualApronProfileYZ']
    assert profile[0]==[apron['y'][0],0] and profile[-1]==[apron['y'][1],apron['crestZ']]
    for a,b in zip(profile,profile[1:]):
      # Preserve the historical renderer provenance; the corrected owning JSON
      # now supplies the same integral step to all current consumers.
      segment='line('+json.dumps(b,separators=(',',':'))+','+json.dumps(a,separators=(',',':'))+')'
      assert segment in threshold_code.replace(' ',''), 'Actual HAD renderer step mismatch'
    wet_length=tp['fallY'][-1][0]-tp['fallY'][0][0]
    whole_length=tp['fallY'][-1][0]-profile[0][0]
    all_z=[z for y,z in profile+tp['fallY']]
    whole_height=max(tp['ends']['crestZ'],*all_z)-(min(all_z)-tp['thickness'])
    renewal=threshold['maintainedState']['panTask']
    assert renewal['wholeBodyMaximum']==tp['bodyEnvelope']['dimensions']==[tp['outerX'][1]-tp['outerX'][0],whole_length,whole_height]
    assert math.isclose(renewal['planRotationRadius'],math.hypot(tp['outerX'][1]-tp['outerX'][0],whole_length)/2,abs_tol=1e-9)
    assert renewal['clearDrawPlan'][1]==profile[0][0]
    assert renewal['storage']['height']>=whole_length
    transition={
      'status':c['thresholdTransition']['status'],'sourceRoute':route,
      'fieldFinishedFaceY_mm':field_y,'dryApronY_mm':apron['y'],'dryApronCrestZ_mm':apron['crestZ'],
      'horizontalJoinFromField_mm':apron['y'][0]-field_y,'actualApronProfileYZ':profile,
      'riseFromFieldBottomToApronStart_mm':profile[0][1]-pan['z'][0],
      'riseFromFieldBottomToApronCrest_mm':apron['crestZ']-pan['z'][0],
      'commonBeamPlanY_mm':beam_y,'commonBeamTopZ_mm':ground['lower_grid']['top'],
      'seatPlan':seat['plan'],'seatProjectionBeyondBeam_mm':max(0,seat['plan'][1]+seat['plan'][3]-beam_y[1]),
      'ordinaryFloorAccess':'Retained15/65/100/RC200 stack; field below distribution only.95mm return belongs dedicated threshold territory, not a welded lid over ordinary services.',
      'renewal':c['thresholdTransition']['renewal'],
      'sourceContact':'Permanent seat is explicitly continuous with actual ground slab/court-south support. Plan coverage is not force, thermal or dryness performance.',
      'unqualified':c['thresholdTransition']['unqualified'],
      'owningRenewalCorrection':{'declaredWholeBody_mm':renewal['wholeBodyMaximum'],
        'actualIntegralEnvelope_mm':[tp['outerX'][1]-tp['outerX'][0],whole_length,whole_height],
        'wholeBodyPlanRadius_mm':math.hypot(tp['outerX'][1]-tp['outerX'][0],whole_length)/2,
        'declaredPlanRadius_mm':renewal['planRotationRadius'],'declaredStorageHeight_mm':renewal['storage']['height'],
        'nominalOperatorReserve_mm':threshold['maintainedState']['geometryProof']['bodyReserve'],
        'status':'Owning nominal body, draw, rotation and storage corrected; actual fabrication, apparatus, tolerances and physical renewal remain unqualified.'}}
    heads=grid['heads'];assert len(heads)==grid['headCount']
    assert len({q['id'] for q in heads})==len(heads)==len({tuple(q['xy']) for q in heads})
    assert all(q['shaftDiameter']==400 and q['capZ']==[-750,-180] for q in heads)
    named={q['id'] for q in heads}
    assert all(q['id'] in named for beam in grid['girders'].values() for q in beam['heads'])
    corner=[q['id'] for q in heads if 'stability corner group' in q['roles']];assert len(corner)==12
    assert {tuple(q['xy']) for q in heads if q['id'] in corner}=={tuple(p) for q in s['RClegs']['piers'] for p in q['cornerPileGroup']}, 'Spatial candidates differ at corner-group shafts; reconcile before comparison'
    cut_area=sum(math.pi*(q['shaftDiameter']/2000)**2 for q in heads)
    mass_per_mm=cut_area/1000*density
    source_cuts={
      'status':c['lowerSourceCutComparison']['status'],'candidateHeads':len(heads),
      'cornerGroupIncludedNotAdditional':corner,'shaftDiameter_mm':400,
      'shaftCutPlaneArea_m2':cut_area,'shaftFootprintMetalMassPer1mm_kg':mass_per_mm,
      'fieldAndReturnOnlyEqualMassThickness_mm':topology['flatAndEdgeQuantityScreen_kg']/mass_per_mm,
      'fieldPlusUpperPlatesEqualMassThickness_mm':(topology['flatAndEdgeQuantityScreen_kg']+sum(areas)*.020*density)/mass_per_mm,
      'headRegister':[{'id':q['id'],'xy':q['xy'],'capXY':q['capXY'],'capZ':q['capZ']} for q in heads],
      'quantityMethod':c['lowerSourceCutComparison']['quantityMethod'],
      'deleteUpperPlatesOnlyIf':c['lowerSourceCutComparison']['deleteUpperPlatesOnlyIf'],
      'excluded':c['lowerSourceCutComparison']['excluded'],'signedPerHeadForceAdmission':False,
      'bulkWaterEnclosureAdmission':False,'selected':False}
    t=c['thermalScreen'];a=sum(areas)
    rc_depth=(t['height']-t['metalDepth'])/1000
    resistance=rc_depth/t['lambdaRC']+t['metalDepth']/1000/t['lambdaMetal']
    direct_g=a/resistance
    glass_g=a/(floor['layers'][2]/1000/t['lambdaGlass'])
    result={
      'status':c['status'],
      'sourceControlSHA256':hashlib.sha256((HERE/'current-ground-pier-boundary.json').read_bytes()).hexdigest(),
      'sources':c['sources'],'LfootprintEach_m2':areas,'solidPlateMassEach_kg':[x*.020*t['metalDensity'] for x in areas],
      'solidPlateTotal_kg':a*.020*t['metalDensity'],'massExcludes':'Opposed anchors, edge returns, welds, whole-floor air system and fabrication waste',
      'windowReserveAfterEndFlange_mm':reserve,
      'floorTopSteelSeparationScreen_mm':r['floorSteelTopCoverGuard']-r['embeddedFoot']['depthBelowRCTop'],
      'mineralPlasterRemainingAfterSheetAndKey_mm':r['retainedPlasterTotal']-r['sheet']-r['keyStandOff'],
      'actualSTRLegActions':{'V_kN':s['wind']['perLegV'],'M_kNm':s['wind']['perLegM']},'spliceDomain':sp['governingCard'],
      'thermalSensitivity':{'allFourDirectRoutes_W_per_K':direct_g,'sameArea100GlassThoughtComparator_W_per_K':glass_g,
        'difference_W_per_K':direct_g-glass_g,'scenario20KDifference_W':(direct_g-glass_g)*t['scenarioDeltaT'],
        'scenario2500KdaysDifference_kWh':(direct_g-glass_g)*t['scenarioDegreeDays']*24/1000,
        'boundary':t['method'],'actualSurfaceTemperature_C':None,'wholeHouseEnergyResult':None},
      'falsifiedCapillaryPath':c['preferredConditionalRoute']['falsifiedPath'],
      'moisturePaths':c['moisturePaths'],
      'separateFieldChallenger':topology,'thresholdTransition':transition,'lowerSourceCutComparison':source_cuts,
      'activeInternalHolds':['Upper-plate-only floor route withdrawn; resolve every ground-support capillary source or a real separate field boundary','STR opposed anchor/plate force path and local weld/cover schedule','Actual mineral-DPC/plate edge and keyed plaster/metal air termination with movement allowance','Concrete floor construction-joint/crack and repair design plus explicit whole-house leakage budget','Source-bound 3D thermal surface/condensation and actual whole-floor energy model','Full-pan support/seam/expansion/penetration design only if its conditional need is established'],
      'admission':c['admission']}
    # Finite source-derived plan and section; no hand-edited result graphics.
    pts=' '.join(f'{70+(x-200)*.25:.2f},{420-(y-200)*.25:.2f}' for x,y in sw)
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><style>text{{font:16px sans-serif;fill:#20323b}} .small{{font-size:13px}} .rc{{fill:#c4ccd0;stroke:#475b65}} .metal{{fill:#b66a39;stroke:#85451c}} .line{{fill:none;stroke:#b66a39;stroke-width:4}}</style><rect width="1200" height="720" fill="#faf9f4"/><text x="35" y="35" font-size="24">Proposed direct RC pier / solid capillary splice — local comparison</text><text x="35" y="62" class="small">Immutable STR {c['sources']['STR']['commit'][:8]}; geometry/arithmetic only. No selected rewind or air/gas/thermal/material admission.</text><text x="45" y="105">SW pier plan — exact source L</text><polygon points="{pts}" class="rc"/><text x="55" y="425">1000 mm physical legs × 140 mm core</text><text x="55" y="450">20 mm solid plate follows full L</text><text x="55" y="475">{reserve:.1f} mm to raw window after 10 mm end return</text><text x="55" y="500">Four plates: {result['solidPlateTotal_kg']:.2f} kg before anchors/returns</text>
<text x="550" y="105">Local floor / pier section — not to scale</text><rect x="570" y="130" width="145" height="288" class="rc"/><rect x="570" y="418" width="145" height="12" class="metal"/><rect x="570" y="430" width="145" height="78" class="rc"/><rect x="570" y="508" width="550" height="120" class="rc"/><rect x="715" y="400" width="27" height="108" fill="#d5dcbd"/><rect x="715" y="130" width="27" height="270" fill="#e4dfd5"/><rect x="742" y="448" width="378" height="60" fill="#d5dcbd" stroke="#708348"/><rect x="742" y="409" width="378" height="39" fill="#e2d9c7" stroke="#9e876a"/><rect x="742" y="400" width="378" height="9" fill="#c6b69e"/><path d="M715 430 V517 H815 M715 418 V310" class="line"/><text x="840" y="160">RC upper pier</text><text x="840" y="190">Opposed anchors attach to plate faces</text><text x="840" y="220">No continuous through-bar hole</text><text x="840" y="250">Dry-side mineral plaster lap to +150</text><text x="760" y="395">Plate −50..−30 mm</text><text x="760" y="375">FFL 0; finish 15 / distribution 65</text><text x="760" y="485">Glass 100; RC top −180</text><text x="760" y="550">Cast-in folded return at −195</text><text x="760" y="580">RC 200 remains −180..−380</text><path d="M600 664 V615 H1090" fill="none" stroke="#b32e28" stroke-width="4"/><path d="M1080 608 L1090 615 L1080 622" fill="none" stroke="#b32e28" stroke-width="3"/><text x="50" y="650" class="small" fill="#b32e28">WITHDRAWN as a complete floor boundary: ground → pile → lower grid → RC field remains below upper cut.</text><text x="35" y="690" class="small">Strip/RC bond, plaster air closure, cracking, movement, weld/corrosion and inspection are explicit holds. Diagram line is not a qualified seal.</text></svg>'''
    xs,ys,mask=mesh
    xp=lambda v:45+v*.044;yp=lambda v:630-v*.044
    plan='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700"><rect width="1200" height="700" fill="#faf9f4"/><g font-family="sans-serif" fill="#263b44"><text x="35" y="32" font-size="24">Separate-field challenger — actual finished faces and wall holes</text><text x="35" y="58" font-size="14">PROPOSED field envelope / quantity screen; one connected surface is not a sealed assembly.</text>'
    path=''
    for j in range(len(ys)-1):
      runs=[];start=last=None
      for i in sorted(i for i,jj in mask if jj==j):
        if last is not None and i!=last+1:runs.append((start,last));start=None
        if start is None:start=i
        last=i
      if start is not None:runs.append((start,last))
      for a,b in runs:
        path+=f'M{xp(xs[a]):.6f} {yp(ys[j+1]):.6f} H{xp(xs[b+1]):.6f} V{yp(ys[j]):.6f} H{xp(xs[a]):.6f} Z '
    plan+=f'<path d="{path}" fill="#b7d1d0" stroke="none"/>'
    door_points=[]
    m=h['model']
    for d in m['archOpeningRegister']['GROUND']:
      if d.get('kind')!='door':continue
      if d['wall']=='outer-south':point=(d['centre'],m['envelope'])
      elif d['wall']=='outer-east':point=(m['shell']-m['envelope'],d['centre'])
      elif d['wall']=='court-south':point=(d['centre'],m['court'][1]-m['envelope'])
      else:raise AssertionError('Unlocated renewable external door interface')
      label={'front-door':'Front door','plant-replacement':'Plant door','grand-court-entry-south':'Court door'}[d['id']]
      door_points.append((*point,label))
    for x,y,label in door_points:
      plan+=f'<circle cx="{xp(x)}" cy="{yp(y)}" r="7" fill="#b66635"/><text x="{xp(x)+10}" y="{yp(y)-10}" font-size="12">{label}</text>'
    st=h['model']['stair'];plan+=f'<rect x="{xp(st[0])}" y="{yp(st[1]+st[3])}" width="{st[2]*.044}" height="{st[3]*.044}" fill="none" stroke="#b66635" stroke-dasharray="6 4" stroke-width="2"/>'
    lines=[f"Net source-located field: {topology['netField_m2']:.5f} m²",f"Exposed edge: {topology['edgeLength_m']:.3f} m",f"Flat 1 mm sheet: {topology['flat1mmMass_kg']:.2f} kg",f"230 mm return allowance: {topology['edge230mmMass_kg']:.2f} kg",f"Flat + edge quantity screen: {topology['flatAndEdgeQuantityScreen_kg']:.2f} kg",'Before seams, support, fixings and waste.','Upper-pier capillary cuts remain required','unless another actual source cut owns that path.','','Orange: three renewable external door joins.','Dashed stair footprint: actual supports/boots','remain to locate; area is not called a void.','','Pan BELOW accessible distribution only.','No welded lid immediately under finish.','Complete expansion and seam design still open.']
    for i,line in enumerate(lines):plan+=f'<text x="650" y="{115+i*28}" font-size="17">{line}</text>'
    plan+='<text x="35" y="674" font-size="14">Actual floor access survives; no supplied pan, gas/air/moisture performance, capillary closure or MAT completion is earned.</text></g></svg>\n'
    # Coordinate section distinguishes inherited support from proposed closure.
    X=lambda y:70+(y-3650)*1.1
    Z=lambda z:190-z*.65
    rect=lambda y,z,w,d,fill:f'<rect x="{X(y):.3f}" y="{Z(z):.3f}" width="{w*1.1:.3f}" height="{d*.65:.3f}" fill="{fill}" stroke="#52636b"/>'
    join_svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760"><rect width="1200" height="760" fill="#faf9f4"/><g font-family="sans-serif" fill="#20343c"><text x="35" y="34" font-size="25">Court-south field / renewable pan / common RC — source join</text><text x="35" y="61" font-size="15">Proposed MAT interface only; selected HAD pan + historical STR support territory. No adopted rebind or qualified seal.</text>'
    join_svg+=rect(3650,-180,600,450,'#bac6cb')+rect(4060,-180,400,200,'#cdd5d8')
    join_svg+=rect(3650,-80,field_y-3650,100,'#d1dab5')+rect(3650,-15,field_y-3650,65,'#dfd4be')+rect(3650,0,field_y-3650,15,'#bda98d')
    join_svg+=f'<path d="M{X(3650)} {Z(-80)} H{X(field_y)}" fill="none" stroke="#427d88" stroke-width="4"/>'
    join_svg+=f'<path d="M{X(field_y)} {Z(-80)} H{X(4030)} V{Z(0)} H{X(4060)}" fill="none" stroke="#bb6b2f" stroke-width="4" stroke-dasharray="8 5"/>'
    pan_path='M'+' L'.join(f'{X(y)} {Z(z)}' for y,z in profile+tp['fallY'])
    join_svg+=f'<path d="{pan_path}" fill="none" stroke="#4e6c9b" stroke-width="3"/>'
    join_svg+=f'<path d="M{X(4030)} 109 H{X(4400)} M{X(4380)} 101 L{X(4400)} 109 L{X(4380)} 117" fill="none" stroke="#4e6c9b" stroke-width="3"/>'
    join_svg+=f'<path d="M{X(field_y)} 302 V319 H{X(4030)} V302" fill="none" stroke="#bb6b2f" stroke-width="2"/>'
    labels=[(70,95,'SOUTH / interior'),(700,95,'NORTH / court; pan withdraws NORTH 500 mm'),(70,160,'Retained ordinary 15 / 65 / 100 / RC 200 mm'),(70,286,'Field at −80..−79 mm below distribution'),(260,344,f"{transition['horizontalJoinFromField_mm']:.1f} mm formed join territory"),(70,570,'Common court-S beam: Y3650..4250; top −180; historical 450 mm depth'),(70,599,'Actual seat: Y4060..4460 /RC 200; outer 210 mm beyond beam is a real structural/thermal duty'),(70,640,'Blue: actual apron 4030/0 → 4060/0 → 4060/+15 → 4090/+15; rise 80 mm to apron / 95 mm to crest'),(70,668,'Dashed: proposed field transition. Owning integral pan corrected to 1796 × 420 × 131.5 mm'),(70,696,'Owning storage reserves 450 mm for 420 mm height. Nominal geometry only; physical pan renewal remains unproved.'),(70,724,'Clamp/recess must retain 15 mm crest, ordinary access and full north withdrawal. No permanent field-to-pan weld.')]
    for x,y,label in labels:join_svg+=f'<text x="{x}" y="{y}" font-size="17">{label}</text>'
    join_svg+='</g></svg>\n'
    cuts_svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760"><rect width="1200" height="760" fill="#faf9f4"/><g font-family="sans-serif" fill="#20343c"><text x="35" y="33" font-size="25">Lower-source cuts — the actual proposed 52-head register</text><text x="35" y="60" font-size="15">STR 732901d spatial candidate only; no adopted shaft count, force card, cut elevation or all-grid dry enclosure.</text>'
    for q in grid['girders'].values():
      if q['axis']=='x':a=(q['extent'][0],q['datum']);b=(q['extent'][1],q['datum'])
      else:a=(q['datum'],q['extent'][0]);b=(q['datum'],q['extent'][1])
      cuts_svg+=f'<path d="M{xp(a[0])} {yp(a[1])} L{xp(b[0])} {yp(b[1])}" stroke="#c5ced0" stroke-width="{q["width"]*.044}"/>'
    for q in heads:
      color='#b55f32' if q['id'] in corner else '#326f87'
      cuts_svg+=f'<circle cx="{xp(q["xy"][0])}" cy="{yp(q["xy"][1])}" r="{q["shaftDiameter"]*.022}" fill="{color}"/><text x="{xp(q["xy"][0])+10}" y="{yp(q["xy"][1])-5}" font-size="11">{q["id"]}</text>'
    lines=['52 distinct proposed 400 mm shaft positions','12 corner-group shafts are INCLUDED',f'Shaft footprints: {cut_area:.5f} m² total',f'At 7900 kg/m³: {mass_per_mm:.3f} kg per 1 mm',f'880.33 kg field/returns equals {source_cuts["fieldAndReturnOnlyEqualMassThickness_mm"]:.2f} mm',f'With 164.57 kg upper plates: {source_cuts["fieldPlusUpperPlatesEqualMassThickness_mm"]:.2f} mm','These are equal-MASS arithmetic only.','No structural thickness is selected.','','52 force-transfer/inspection locations;','opposed anchorage, welds, enlargement,','bulk-water enclosure and costs excluded.','','Carry separate field as development reference;','retain lower cuts as a conditional challenger.','Neither route is admitted or complete.']
    for i,line in enumerate(lines):cuts_svg+=f'<text x="640" y="{112+i*29}" font-size="17">{line}</text>'
    cuts_svg+='<text x="35" y="686" font-size="16">Orange: stability corner group; blue: other shafts. Grey: proposed common-grid routes; not a moisture enclosure.</text><text x="35" y="718" font-size="16">Exact sources and exclusions in numeric result. No whole-house cost, thermal, gas, capillary or construction acceptance.</text></g></svg>\n'
    return {'current-ground-source-cut-comparison.svg':cuts_svg,'current-ground-threshold-join.svg':join_svg,'current-ground-field-challenger.svg':plan,'current-ground-pier-boundary.results.json':json.dumps(result,indent=2)+'\n','current-ground-pier-boundary.svg':svg+'\n'}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args()
    for name,text in produce().items():
      p=HERE/name
      if args.check:assert p.exists() and p.read_text()==text,f'Stale output: {name}'
      else:p.write_text(text)
    print('MAT ground/pier local source, geometry and sensitivity checks PASS; assembly admissions remain false.')
if __name__=='__main__':main()
