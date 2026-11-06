#!/usr/bin/env python3
"""One source-bound field layout and integral-pan interface enquiry, not admission."""
from pathlib import Path
import argparse, bisect, copy, html, json, math, runpy

HERE=Path(__file__).resolve().parent
BASE=runpy.run_path(str(HERE/'current-ground-pier-boundary.py'))

def rect_wall(name,r):
    x,y,w,h=r
    return {'id':name,'a':[x+w/2,y],'b':[x+w/2,y+h],
      'finishedFaces':[x,x+w],'t':w,'holes':[]}

def inside(mesh,x,y):
    xs,ys,mask=mesh
    return (bisect.bisect_right(xs,x)-1,bisect.bisect_right(ys,y)-1) in mask

def merged(intervals):
    out=[]
    for a,b in sorted(intervals):
      if out and abs(out[-1][1]-a)<1e-7:out[-1][1]=b
      else:out.append([a,b])
    return out

def panel_layout(mesh,outer,width,length):
    xs,ys,_=mesh;x0,y0,w,h=outer
    xc=[x0+i*width for i in range(1,math.ceil(w/width))]
    yc=[y0+i*length for i in range(1,math.ceil(h/length))]
    xx=sorted(set(xs+xc));yy=sorted(set(ys+yc));cells={}
    for i,(a,b) in enumerate(zip(xx,xx[1:])):
      for j,(c,d) in enumerate(zip(yy,yy[1:])):
        if inside(mesh,(a+b)/2,(c+d)/2):
          slot=(int(((a+b)/2-x0)//width),int(((c+d)/2-y0)//length))
          cells[i,j]=(slot,(b-a)*(d-c))
    panels={};seen=set()
    for cell,(slot,area) in cells.items():
      q=panels.setdefault(slot,{'slot':list(slot),'area_mm2':0,'connectedPieces':0})
      q['area_mm2']+=area
      if cell in seen:continue
      q['connectedPieces']+=1;todo=[cell];seen.add(cell)
      while todo:
        i,j=todo.pop()
        for di,dj in [(1,0),(-1,0),(0,1),(0,-1)]:
          k=i+di,j+dj
          if k in cells and k not in seen and cells[k][0]==slot:seen.add(k);todo.append(k)
    seams=[]
    for axis,lines,other in [('x',xc,ys),('y',yc,xs)]:
      for line in lines:
        spans=[]
        for a,b in zip(other,other[1:]):
          t=(a+b)/2
          both=(inside(mesh,line-.001,t) and inside(mesh,line+.001,t)) if axis=='x' else (inside(mesh,t,line-.001) and inside(mesh,t,line+.001))
          if both:spans.append([a,b])
        seams.extend({'axis':axis,'at':line,'span':span} for span in merged(spans))
    net=sum(q['area_mm2'] for q in panels.values())/1e6
    allocated=sum(min(width,w-i*width)*min(length,h-j*length) for i,j in panels)/1e6
    assert math.isclose(net,sum(mesh[2].values())/1e6,abs_tol=1e-9)
    return {'panelModule_mm':[width,length],'occupiedLayoutSlots':len(panels),
      'connectedCutPieces':sum(q['connectedPieces'] for q in panels.values()),
      'net_m2':net,'allocatedSlotArea_m2':allocated,'unusedWithinOccupiedSlots_m2':allocated-net,
      'sharedButtSeamLength_m':sum(q['span'][1]-q['span'][0] for q in seams)/1000,
      'sharedSeamSegments':seams,'slots':list(panels.values()),
      'scope':'Explicit clipped layout, not purchased sheet count, a weld procedure, a fabrication cut list or an optimised offcut plan.'},(xc,yc)

def central_cover_sweep(profile,cover_bottom,cover_end,pull,rail_face=None,rail_bottom=None):
    # The central cover is entirely south of the moving riser; its only possible
    # overlapping pan face is the horizontal zero-level apron. Ends are separate.
    assert profile[0][1]==profile[1][1]==0
    assert cover_bottom>profile[0][1], 'Fixed cover touches or cuts the pan apron'
    assert cover_end<profile[1][0], 'Fixed cover traps the initial pan riser'
    assert pull>0
    if rail_face is not None:
      assert rail_face<=profile[1][0] and rail_bottom>profile[0][1], 'Fixed rail traps moving pan'
    return {'centralSectionOnly':True,'minimumNominalGap_mm':cover_bottom,
      'initialRiserSeparation_mm':profile[1][0]-cover_end,'northTranslation_mm':pull,
      'scope':'Analytic central-section nonintersection after bolt/end release; fixed rail separates northward from the pan riser. No 3D end, tolerance, apparatus, bearing or physical renewal pass.'}

def negative_controls():
    mesh=([0,2000],[0,2000],{(0,0):4000000})
    p,_=panel_layout(mesh,[0,0,2000,2000],1000,2000)
    assert (p['occupiedLayoutSlots'],p['connectedCutPieces'],p['sharedButtSeamLength_m'])==(2,2,2)
    split=([0,2000],[0,950,1050,2000],{(0,0):1900000,(0,2):1900000})
    p,_=panel_layout(split,[0,0,2000,2000],1000,2000)
    assert (p['occupiedLayoutSlots'],p['connectedCutPieces'],p['sharedButtSeamLength_m'])==(2,4,1.9)
    for gap,end in [(0,4057),(1,4061)]:
      try:central_cover_sweep([[4030,0],[4060,0],[4060,15],[4090,15]],gap,end,500)
      except AssertionError:pass
      else:raise AssertionError('Cover collision falsifier was accepted')

def produce():
    negative_controls()
    c=json.loads((HERE/'ground-field-assembly.json').read_text())
    reference=json.loads((HERE/c['referenceControl']).read_text())
    h=BASE['immutable'](reference['sources']['HAD']);m=h['model']
    s=BASE['immutable'](reference['sources']['STRground'])
    floor=m['northNormalRoute']['floorJoin'];assert floor['layers']==[15,65,100,200]
    assert floor['z']==[0,-15,-80,-180,-380]
    original,original_mesh=BASE['field_topology'](m)
    beam=m['structuralChanges']['newWetWallBeam']
    assert s['wet_wall_beam']['bottom']==beam['beamBottom']==3020
    assert beam['beamBottom']-s['wet_wall_beam']['receiving_pier_check']['height']==floor['z'][3]
    post=m['structuralChanges']['stairMidPost']['concrete']
    assert post==s['finite_floor_frame']['stair']['midlanding_post_core']
    supports=[{'id':'stair-midlanding-post','core':post,'baseZ':floor['z'][3],
      'scope':'250 square actual source-proposed RC core, not the finished obstacle rectangle'},
      *[{'id':'wet-wall-'+side+'-receiver','core':beam[side+'ReceiverCore'],
        'baseZ':floor['z'][3],'topZ':beam['beamBottom'],
        'scope':'HAD literal core with STR receiving-pier height; source-proposed structure, not capacity admission'} for side in ['south','north']]]
    with_cores=copy.deepcopy(m)
    with_cores['groundWalls'] += [rect_wall(q['id'],q['core']) for q in supports]
    field,mesh=BASE['field_topology'](with_cores)
    assert field['netField_m2']<original['netField_m2']
    for q in supports:
      x,y,w,hc=q['core']
      assert not inside(mesh,x+w/2,y+hc/2)
    layout,grid=panel_layout(mesh,field['outer'],**{'width':c['panelLayout']['width'],'length':c['panelLayout']['length']})
    wall_register=[];widened=copy.deepcopy(with_cores)
    for wall in m['groundWalls']:
      vertical=wall['a'][0]==wall['b'][0];a,b=sorted([wall['a'][1 if vertical else 0],wall['b'][1 if vertical else 0]])
      holes=wall.get('holes') or []
      raw=b-a-sum(y-x for x,y in holes)
      lo,hi=wall['structuralCore'];width=max(hi-lo,c['mineralWallBase']['headerWidth'])
      faces=[(lo+hi-width)/2,(lo+hi+width)/2]
      widened['groundWalls'].append({**wall,'id':'DPC-width-'+wall['id'],'finishedFaces':faces})
      wall_register.append({'id':wall['id'],'axis':wall['a'][0 if vertical else 1],
        'along':[a,b],'openIntervals':holes,'rawSolidLength_mm':raw,
        'coreWidth_mm':hi-lo,'proposedDpcWidth_mm':width,'proposedDpcFaces':faces,
        'finishedFaces':wall['finishedFaces'],
        'roomSideProjectionBeyondFinish_mm':[max(0,wall['finishedFaces'][0]-faces[0]),max(0,faces[1]-wall['finishedFaces'][1])],
        'status':'Authored wall segment and proposed full-width base only; continuity, loads, end bonds and floor/air transition unresolved'})
    widened_field,_=BASE['field_topology'](widened)
    assert sum(c['mineralWallBase']['courseHeights']+c['mineralWallBase']['bedHeights'])==floor['innerDpc'][1]-floor['innerDpc'][0]
    doors=[q for q in m['archOpeningRegister']['GROUND'] if q['kind']=='door']
    assert {q['id'] for q in doors}=={'front-door','plant-replacement','grand-court-entry-south'}
    door_length=sum(q['width'] for q in doors)/1000
    density=reference['thermalScreen']['metalDensity'];edge_height=reference['fullPanChallenger']['edgeReturnTop']-reference['fullPanChallenger']['z'][0]
    field['ordinaryUpstandExcludingThreeDoors_m']=field['edgeLength_m']-door_length
    field['ordinaryFlatAndUpstandScreen_kg']=(field['netField_m2']+field['ordinaryUpstandExcludingThreeDoors_m']*edge_height/1000)/1000*density
    field['omittedThreeDoorUpstands_kg']=door_length*edge_height/1e6*density
    stock=c['stockPriceScreen'];assert stock['sheet_mm']==[1,c['panelLayout']['width'],c['panelLayout']['length']]
    stock_screen={**stock,'oneFullSheetPerOccupiedSlot_count':layout['occupiedLayoutSlots'],
      'oneFullSheetPerOccupiedSlot_GBP_withoutVAT':layout['occupiedLayoutSlots']*stock['priceGBP_withoutVAT'],
      'oneFullSheetPerOccupiedSlot_stockArea_m2':layout['occupiedLayoutSlots']*stock['sheet_mm'][1]*stock['sheet_mm'][2]/1e6,
      'oneFullSheetPerOccupiedSlot_supplierNominalMass_kg':layout['occupiedLayoutSlots']*stock['supplierNominalMass_kg']}
    t=m['southCourtThresholdReference'];profile=t['pan']['dryFold']['profileYZ'];cv=c['thresholdCover'];seal=c['metalSealBurden']
    assert profile==[[4030,0],[4060,0],[4060,15],[4090,15]]
    start,step=profile[0][0],profile[1][0]
    face=step-cv['clampThickness'];cover_length=face-start
    z_bottom=cv['nominalSlideGap'];z_top=z_bottom+cv['coverThickness'];crest=t['pan']['rear']['crestZ']
    width=t['pan']['outerX'][1]-t['pan']['outerX'][0]-2*cv['endClearanceFromOuterPan']
    bolt_span=width-2*cv['boltEndInset'];bolts=math.ceil(bolt_span/cv['boltPitchMaximum'])+1
    # Cantilever cover sensitivity only: uniformly distributed along its reach,
    # over the stated loaded EW width. No use or fabrication load is selected.
    line=cv['walkingLoadSensitivity_N']/cover_length
    moment=line*cover_length**2/2
    stress=moment/(cv['loadedWidthSensitivity_mm']*cv['coverThickness']**2/6)
    I=cv['loadedWidthSensitivity_mm']*cv['coverThickness']**3/12
    deflection=line*cover_length**4/(8*cv['steelESensitivity_MPa']*I)
    threshold={'status':cv['status'],'integralPanBody_mm':t['pan']['bodyEnvelope']['dimensions'],
      'fixedCoverYZ':[[start,z_bottom],[face,z_bottom],[face,z_top],[start,z_top]],
      'nominalPanApronSlideGap_mm':z_bottom,'coverWidth_mm':width,
      'verticalClampLandZ_mm':[z_top,crest],'clampLandHeight_mm':crest-z_top,
      'centredShankEdgeClearance_mm':(crest-z_top-cv['boltDiameterReference'])/2,
      'closedFlangeFaceGap_mm':0,'grooveBottomY_mm':step-seal['grooveDepthNominal_mm'],
      'grooveWidthMinimum_mm':seal['grooveWidthMinimum_mm'],'sealCentreZReference':cv['sealCentreZReference'],
      'grooveToReferenceBoltHoleWeb_mm':(z_top+crest)/2-cv['boltHoleDiameterReference']/2-cv['sealCentreZReference']-seal['grooveWidthMinimum_mm']/2,
      'clampMetalBehindGroove_mm':cv['clampThickness']-seal['grooveDepthNominal_mm'],
      'boltEndInset_mm':cv['boltEndInset'],
      'referenceBoltLocations':bolts,'actualMaximumPitch_mm':bolt_span/(bolts-1),
      'catalogueLinearSeatingBurden_N':width*seal['typicalLineLoad_N_per_mm'],
      'equalShareBurdenPerBolt_N':width*seal['typicalLineLoad_N_per_mm']/bolts,
      'coverMass_kg':width*cover_length*cv['coverThickness']/1e9*density,
      'clampRailMass_kg':width*(crest-z_top)*cv['clampThickness']/1e9*density,
      'centralSectionWithdrawal':central_cover_sweep(profile,z_bottom,face,t['maintainedState']['panTask']['pullNorth'],step,z_top),
      'coverCantileverSensitivity':{'force_N':cv['walkingLoadSensitivity_N'],'loadedWidth_mm':cv['loadedWidthSensitivity_mm'],
        'stress_MPa':stress,'tipDeflection_mm':deflection,'status':'Elastic strip sensitivity, not selected loading, strength, bearing, anchor, fatigue or physical pass'},
      'mandatoryBeforeProgress':['Actual loaded working gap and machined face/stop budget; the 0.08 mm catalogue band is not earned on formed pan',
        'A supplied custom straight/end-return seal and complete constituents; circular 20–150 mm range is not this 1780 mm joint',
        'Two released end closures with actual pan end-wall extent and no trapped corner or leak bypass; fixed rail is continuously welded to the fixed cover',
        'Actual screw heads/tool, hole edge, plate bending and restraint; no bolt capacity or pretension is assigned',
        'Every dry-riser bolt penetration needs an evidenced closed welded boss or its own sealed boundary; an ordinary captive nut is a bypass',
        'Walking line, supported cover and sliding tolerance, floor access and full NORTH 500 mm withdrawal; nominal 1 mm gap is not a physical clearance pass',
        'Fixed return/thermal bridge, first-wetting and inspection/renewal sequence; no pan or field geometry adoption']}
    result={'status':c['status'],'sources':reference['sources'],'unchangedFloor':floor,
      'earlierRoomFieldQuantity':original,'confirmedSourceProposedSupportCrossings':supports,
      'supportAwareRoomField':field,'panelLayout':layout,'wallBaseRegister':wall_register,
      'mineralBaseWidthComparison':{'sourceGroundWallSegments':len(wall_register),
        'courseAndBedHeight_mm':150,'fieldAfter215WidthAndThreeCores_m2':widened_field['netField_m2'],
        'additionalFloorTerritory_m2':field['netField_m2']-widened_field['netField_m2'],
        'scope':'Only explicit ground-wall segments. Outer/court implicit walls, doorway/end bonds, four portal piers and other structural contacts are NOT silently priced by this number.'},
      'threeDoorTransitions':doors,'thresholdCover':threshold,'stockPriceScreen':stock_screen,
      'concreteControl':c['concreteControl'],
      'unassignedContacts':['Actual lower-flight/toe three-dimensional contact; only lowerFlightX and bearing axis are bound',
        'Four lower loggia portal piers and source-proposed upper L piers require their own source/bearing/exposure boundary',
        'Ground-wall/base junction is not a demonstrated continuous internal-wall DPC or a qualified metal-to-mineral air/moisture joint'],
      'admission':dict.fromkeys(['selected','material','structural','airMoisture','thermal','weatherPhysical','site'],False)}
    return result,mesh,grid

def figure(result,mesh,grid):
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#faf9f4"/><g font-family="Arial" fill="#243842">']
    def text(x,y,t,size=16):out.append(f'<text x="{x}" y="{y}" font-size="{size}">{html.escape(t)}</text>')
    text(30,35,'Whole-field layout / real source crossings / integral-pan interface',26)
    text(30,62,'UNSELECTED: finite geometry and quantity comparison; no complete barrier or physical/material admission.',16)
    scale=.052;X=lambda x:35+x*scale;Y=lambda y:750-y*scale
    xs,ys,mask=mesh
    # One filled path cancels shared cell edges, so the calculation mesh is not
    # visually mistaken for additional panel seams.
    fill=[]
    for i,j in mask:
      x,y=X(xs[i]),Y(ys[j+1]);w,h=(xs[i+1]-xs[i])*scale,(ys[j+1]-ys[j])*scale
      fill.append(f'M{x} {y}h{w}v{h}h{-w}z')
    out.append('<path d="'+' '.join(fill)+'" fill="#d7e5dd"/>')
    for q in result['panelLayout']['sharedSeamSegments']:
      a,b=q['span'];p1,p2=((X(q['at']),Y(a)),(X(q['at']),Y(b))) if q['axis']=='x' else ((X(a),Y(q['at'])),(X(b),Y(q['at'])))
      out.append(f'<path d="M{p1[0]} {p1[1]}L{p2[0]} {p2[1]}" stroke="#648778" stroke-width="1"/>')
    for n,q in enumerate(result['confirmedSourceProposedSupportCrossings'],1):
      x,y,w,h=q['core'];out.append(f'<rect x="{X(x)}" y="{Y(y+h)}" width="{w*scale}" height="{h*scale}" fill="#ad4e3d"/>');text(X(x)+18,Y(y+h)+12,str(n),14)
    outer=result['supportAwareRoomField']['outer']
    court_y=result['supportAwareRoomField']['outdoorAndWallCuts'][0][1]
    for q in result['threeDoorTransitions']:
      a,b=q['centre']-q['width']/2,q['centre']+q['width']/2
      if q['wall']=='outer-east':p1,p2=(X(outer[0]+outer[2]),Y(a)),(X(outer[0]+outer[2]),Y(b));tx,ty=X(outer[0]+outer[2])+7,Y(q['centre'])
      else:
        y=outer[1] if q['wall']=='outer-south' else court_y
        p1,p2=(X(a),Y(y)),(X(b),Y(y));tx,ty=X(a),Y(y)+17
      out.append(f'<path d="M{p1[0]} {p1[1]}L{p2[0]} {p2[1]}" stroke="#ae6e2b" stroke-width="4"/>')
      text(tx,ty,{'front-door':'front','plant-replacement':'plant','grand-court-entry-south':'court'}[q['id']],13)
    text(35,787,'Green: room-field envelope clipped around three RC cores; lines: proposed shared butt seams.',15)
    f=result['supportAwareRoomField'];p=result['panelLayout']
    text(700,110,f"Field {f['netField_m2']:.5f} m²",22)
    for n,t in enumerate([f"Earlier room recipe {result['earlierRoomFieldQuantity']['netField_m2']:.5f} m²",f"{p['occupiedLayoutSlots']} occupied 1 × 2 m layout slots",f"{p['connectedCutPieces']} connected cut pieces",f"Shared seams {p['sharedButtSeamLength_m']:.3f} m",f"Allocated slot area {p['allocatedSlotArea_m2']:.3f} m²",'Not a purchased-sheet count or weld procedure.','', 'Three actual doors replace 5 m of generic upstand.', 'Front and plant interfaces remain separately unassigned.', '', '1  Stair midpost: 250 × 250 mm RC', '2/3  Wet receivers: 260 × 450 mm RC', 'These are source-proposed structural cores.', 'Finishes are not full-depth concrete.', '52 foundation shafts are NOT 52 floor boots.', '', '22 explicit wall segments need complete base joins.', '215 mm DPC headers are a width challenger;', '150 mm course height alone proves no continuity.']):text(700,146+n*26,t,15)
    text(35,826,'Threshold rail WITHDRAWN as preferred detail: custom ends / thin lands / closed bolt penetrations remain unearned.',15)
    t=result['thresholdCover'];text(35,852,f"Metal-seal burden sensitivity: {t['catalogueLinearSeatingBurden_N']/1000:.2f} kN / {t['referenceBoltLocations']} locations; catalogue ring is NOT a custom threshold seal.",15)
    out.append('</g></svg>\n');return ''.join(out)

def threshold_figure(result):
    t=result['thresholdCover'];p=result['earlierRoomFieldQuantity']
    X=lambda y:40+(y-4020)*7;Z=lambda z:340-z*7
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="780" viewBox="0 0 1200 780"><rect width="1200" height="780" fill="#faf9f4"/><g font-family="Arial" fill="#243842">']
    def text(x,y,s,size=16):out.append(f'<text x="{x}" y="{y}" font-size="{size}">{html.escape(s)}</text>')
    def path(points,color,width=3):out.append('<path d="'+' '.join(('M' if i==0 else 'L')+f'{X(y)} {Z(z)}' for i,(y,z) in enumerate(points))+f'" fill="none" stroke="{color}" stroke-width="{width}"/>')
    text(30,35,'Integral-pan interface: fixed cover / bolted riser rail',26)
    text(30,63,'WITHDRAWN AS PREFERRED DETAIL. Geometric trial retains integral 420 × 131.5 mm pan; no HAD change.',16)
    path([[4030,0],[4060,0],[4060,15],[4090,15],[4090,-5]],'#4d5960')
    text(385,383,'Rear leg continues to −45 mm wet floor (cropped).',13)
    a,b,c,d=t['fixedCoverYZ'];out.append('<path d="'+' '.join(('M' if i==0 else 'L')+f'{X(y)} {Z(z)}' for i,(y,z) in enumerate([a,b,c,d,a]))+'" fill="#91b3c8" stroke="#36647f"/>')
    path([[4030,1],[4030,-5]],'#36647f',4)
    text(80,197,'Y4030',13);text(290,197,'Y4060',13);text(505,197,'Y4090',13)
    land0,land1=t['verticalClampLandZ_mm'];end_y=t['fixedCoverYZ'][1][0]
    out.append(f'<rect x="{X(end_y)}" y="{Z(land1)}" width="{(4060-end_y)*7}" height="{(land1-land0)*7}" fill="#c39355" stroke="#805c2f"/>')
    # Groove depth is a recess in the released bar, not a 1.32 mm flange gap.
    centre=t['sealCentreZReference'];groove_w=t['grooveWidthMinimum_mm']
    out.append(f'<rect x="{X(t["grooveBottomY_mm"])}" y="{Z(centre+groove_w/2)}" width="{(4060-t["grooveBottomY_mm"])*7}" height="{groove_w*7}" fill="#faf9f4" stroke="#805c2f"/>')
    path([[4054,10],[4064,10]],'#243842',1)
    text(35,125,'SOUTH / fixed floor',17);text(460,125,'NORTH / pan withdrawal →',17)
    text(35,409,'Fixed return continues to proposed field at −80..−79 mm.',15)
    text(35,435,'1 mm central apron slide gap; cover top +5 mm / existing crest +15 mm.',15)
    text(35,461,'Fixed rail closes face-to-face at Y4060; groove bottom Y4058.68.',15)
    text(35,487,'Bolts and both as-yet-undesigned end closures release before NORTH 500 mm.',15)
    text(705,135,'Finite burden, no seal or force pass',21)
    lines=[f"4 mm cover reach {b[0]-a[0]:.0f} mm; 3 mm rail / 10 mm land",f"{t['coverMass_kg']:.3f} kg cover + {t['clampRailMass_kg']:.3f} kg rail before ends",f"{t['referenceBoltLocations']} locations need individually closed penetrations",'M3 is a shank reference, not selected hardware.',f"Circular seal burden {t['catalogueLinearSeatingBurden_N']/1000:.2f} kN",'1.32 mm groove depth +0.08 / −0 is NOT a','permitted open flange gap or formed-pan tolerance.','Catalogue 20–150 mm rings do not supply this U.','', f"Groove-to-hole web only {t['grooveToReferenceBoltHoleWeb_mm']:.3f} mm.", 'Need face stiffness, machining, preload and ends.', '1 mm slide gap is nominal, not a tolerance pass.', 'New +5 mm cover step changes the walking line.', 'No wet-floor fixing or field-to-pan weld credited.']
    for i,s in enumerate(lines):text(705,172+i*26,s,15)
    text(35,567,'Black: existing integral pan wet/reference profile. Blue: new fixed cover/return. Ochre: fixed grooved rail, welded to the cover.',15)
    text(35,598,'Central-section geometry clears after bolt release; pan end-wall extent, removable end caps, full body sweep and restored air/water joints remain open.',15)
    text(35,637,'The steel/metal family, cleaning, welds, plating and every retained accessory need full constituent disclosure.',15)
    text(35,669,'If the complete gap, movement and end closures cannot work, reject or redesign the interface; do not detach the apron by assumption.',15)
    text(35,715,'This detail is one branch of the whole-field comparison, not envelope selection, physical renewal, first-wetting or material admission.',15)
    out.append('</g></svg>\n');return ''.join(out)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    r,mesh,grid=produce();outputs={'ground-field-assembly.results.json':json.dumps(r,indent=2,ensure_ascii=False)+'\n','ground-field-assembly.svg':figure(r,mesh,grid),'ground-field-threshold-cover.svg':threshold_figure(r)}
    for name,content in outputs.items():
      p=HERE/name
      if args.check:assert p.read_text()==content,f'Stale {name}'
      else:p.write_text(content)
    print('Whole-field layout, three real core crossings and integral-pan geometry reproduce; all assembly admissions remain false.')

if __name__=='__main__':main()
