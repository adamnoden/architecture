#!/usr/bin/env python3
"""A located conventional junction comparison; geometric fit is not a seal."""
from pathlib import Path
import argparse, hashlib, html, json, math, subprocess

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]

def immutable(source):
    raw=subprocess.check_output(['git','show',source['commit']+':'+source['path']],cwd=ROOT)
    blob=subprocess.check_output(['git','hash-object','--stdin'],input=raw,cwd=ROOT).decode().strip()
    assert blob==source['blob'],f"Source mismatch: {source['path']}"
    return json.loads(raw)

def source_sha256(source):
    raw=subprocess.check_output(['git','show',source['commit']+':'+source['path']],cwd=ROOT)
    return hashlib.sha256(raw).hexdigest()

def produce():
    c=json.loads((HERE/'conventional-ground-junction.json').read_text())
    assert not any(c['admission'].values()) and not c['airRouteControl']['selected']
    m=immutable(c['HAD'])['model'];f=m['northNormalRoute']['floorJoin']
    w=next(q for q in m['groundWalls'] if q['id']==c['section']['wall'])
    assert w['a'][0]==w['b'][0]
    y=c['section']['atY'];assert min(w['a'][1],w['b'][1])<y<max(w['a'][1],w['b'][1])
    assert not any(a<=y<=b for a,b in w.get('holes',[])), 'Section crosses an opening'
    grid=immutable(c['STRgrid']);beam=grid['girders']['spine']
    assert beam['axis']=='y' and beam['datum']==w['a'][0]
    assert beam['extent'][0]<y<beam['extent'][1] and beam['z'][1]==f['z'][3]
    assert f['layers']==[15,65,100,200] and f['z']==[0,-15,-80,-180,-380]
    b=c['bondedMineralBase'];axis=w['a'][0];lo,hi=w['structuralCore'];flo,fhi=w['finishedFaces']
    width=b['headerWidth'];assert width>=hi-lo
    faces=[axis-width/2,axis+width/2]
    z=b['fromZ'];courses=[]
    for n,(bed,unit) in enumerate(zip(b['beds'],b['courses']),1):
        courses.append({'id':f'bed-{n}','z':[z,z+bed]});z+=bed
        courses.append({'id':f'course-{n}','z':[z,z+unit]});z+=unit
    assert [b['fromZ'],z]==f['innerDpc']
    assert f['plasterStops']>z
    # A geometric falsifier only: a continuous finish from the cold RC to the
    # warm wall would run around the whole DPC. No transport rate is inferred.
    bypass={'continuousPlasterDownToRC':[-180,150],
      'overlapsWholeDpc':-180<=b['fromZ'] and 150>=z,
      'status':'Reject an ordinary capillary finish bridging this territory; this is a contact test, not a moisture transport result'}
    source=c['STRfloor'];structural_case=immutable(source) if source else None
    structural=structural_case[source['key']] if source else None
    floor_comparison=None
    if structural:
        assert structural_case['HAD']==source_sha256(c['HAD']), 'STR floor uses a different HAD case'
        assert structural_case['sources']['current-house-grid.json']==source_sha256(c['STRgrid']), 'STR floor/grid input mismatch'
        assert structural['depthRange']==[195,205] and structural['faceCoverRange']==[40,50]
        chosen=structural['preferredField'];assert (chosen['bar'],chosen['pitch'],chosen['effectiveDepth'])==(12,100,127)
        assert structural['maximumClearSpan']==2967.5 and structural['effectiveSpanCompared']==3167.5
        area=sum(structural['physicalAreaM2'].values());guidance=c['moistureControl']['inSituControl']
        assert abs(area-104.895225)<1e-6
        floor_comparison={'sourceRole':source['role'],'matchedInputSha256':{'HAD':structural_case['HAD'],
          'STRgrid':structural_case['sources']['current-house-grid.json']},'physicalRcPlan_m2':area,
          'physicalAreaParts_m2':structural['physicalAreaM2'],
          'maximumClearSpan_mm':structural['maximumClearSpan'],
          'effectiveSpanCompared_mm':structural['effectiveSpanCompared'],
          'depthRange_mm':structural['depthRange'],'faceCoverRange_mm':structural['faceCoverRange'],
          'preferredField':chosen,'steelTonnesBeforeLapsEdges':structural['steelTonnesBeforeLapsEdges'],
          'H12at150ControlSteelTonnes':structural['H12at150ControlSteelTonnes'],
          'localStripEconomy':structural['localStripEconomy'],
          'crackMethod':structural['crackMethod'],'wkIf500Microstrain_mm':structural['wkIf500Microstrain'],
          'pour':structural['pour'],'materials':structural['materials'],
          'nominalUpperLiftVolume_m3':area*f['layers'][3]/1000,
          'cementMassAtGuidanceMinimumOnly_kg':area*f['layers'][3]/1000*guidance['cementMinimum_kg_per_m3'],
          'guidanceDimensionalScreens':{'thickness':min(structural['depthRange'])>=guidance['thicknessMinimum_mm'],
            'cover':min(structural['faceCoverRange'])>=guidance['coverMinimum_mm']},
          'scope':'Only candidate thickness/cover comparisons. Actual mix, curing, crack/joint moisture/air/gas performance, floor/wall and renewable threshold construction remain unearned.'}
    pan=m['southCourtThresholdReference']['pan'];cl=c['thresholdClamp']
    assert pan['dryFold']['profileYZ']==[[4030,0],[4060,0],[4060,15],[4090,15]]
    assert cl['panStartY']==pan['dryFold']['profileYZ'][0][0]
    assert cl['apronEndY']==pan['dryFold']['profileYZ'][1][0]
    assert cl['heelY']<cl['boltY']<cl['panStartY']<cl['sealReferenceY']<cl['backingEndY']<cl['apronEndY']
    assert cl['boltY']+cl['referenceHoleDiameter']/2<cl['panStartY']
    length=cl['clampX'][1]-cl['clampX'][0]
    bolt_span=length-2*cl['boltEndInset']
    bolt_count=math.ceil(bolt_span/cl['boltPitchMaximum'])+1
    load=length*cl['lineForceSensitivity_N_per_mm']
    # The heel and pan push the bar up; bolt tension must balance BOTH.
    heel=load*(cl['sealReferenceY']-cl['boltY'])/(cl['boltY']-cl['heelY'])
    tension=load+heel
    threshold={'control':cl,'panProfileYZ':pan['dryFold']['profileYZ'],
      'installedPanEnvelope':pan['bodyEnvelope'],
      'boltCountReference':bolt_count,'boltPitchReference_mm':bolt_span/(bolt_count-1),
      'holeEdgeToPanStart_mm':cl['panStartY']-cl['boltY']-cl['referenceHoleDiameter']/2,
      'centralRiserToBackingGap_mm':cl['apronEndY']-cl['backingEndY'],
      'upperClampMassOnly_kg':length*(cl['clampY'][1]-cl['clampY'][0])*cl['clampThickness']*cl['density']/1e9,
      'lineForceSensitivityOnly':{'sealCompression_N':load,'heelReaction_N':heel,
        'totalBoltTension_N':tension,'equalBoltShare_N':tension/bolt_count,
        'momentResidual_Nmm':load*(cl['sealReferenceY']-cl['boltY'])-heel*(cl['boltY']-cl['heelY']),
        'role':'Rigid-bar equilibrium sensitivity before pretension, bending, prying, unequal sharing and anchor design. No bolt, pan or support capacity pass.'},
      'renewal':['Remove/capture door leaves, frame and sill under the owning weather-screen sequence',
        'Release dry-side bolts and lift the ENTIRE upper clamp, not merely loosen it',
        'Release the still-unresolved end captures before moving the pan',
        'Translate whole integral pan NORTH500: the central riser moves away from backing ending before4060',
        'Retain owning whole-body draw/rotation/storage controls; actual ends, tool/operator and support remain unqualified'],
      'centralReleaseOnly':True,'completeEndClosureProved':False,'supportLocated':False,
      'walkingAdmitted':False,'materialAdmitted':False,'airWaterPass':False,
      'routeFairness':'Both concrete and separate-field routes owe this same renewable door assembly; no threshold duty is erased or credited exclusively to either floor route.'}
    air=immutable(c['ServicesAir'])
    assert air['sources']['HAD']['blob']==c['HAD']['blob'], 'Services uses a different HAD case'
    assert not any(air['admission'].values())
    assert air['proposedDevelopment']['q50_m3_per_h_m2']==1
    allocation=air['floorWallAllocation'];budgets=air['aggregateFamilyBudgets']
    assert abs(sum(q['fraction'] for q in budgets.values())-1)<1e-12
    assert allocation['ordinaryEdge_m']==118.761
    assert allocation['threeDoorAssemblyFamily']=='completeOpeningsIncludingThreeDoorThresholds'
    assert budgets['floorWallField']['fraction']==.1 and budgets[allocation['threeDoorAssemblyFamily']]['fraction']==.25
    assert allocation['aggregate_m3_per_h_at50Pa']==budgets['floorWallField']['aggregate_m3_per_h_at50Pa']
    air_duty={'source':c['ServicesAir'],'status':air['status'],'floorWallAllocation':allocation,
      'allFamilyBudgets':budgets,'physicalTestBoundaryRegisterComplete':False,
      'allocationRule':'This is one aggregate for the whole family, not a per-detail budget or a demonstrated line rating. The three complete door/threshold assemblies stop this family and belong to openings.'}
    return {'status':c['status'],'sources':{'HAD':c['HAD'],'STRfloor':source,'STRgrid':c['STRgrid']},
      'section':{'wall':w,'y':y,'floor':f,'candidateDpcFaces':faces,'candidateDpcCourses':courses,
        'underlyingSpine':beam,'supportRole':'900 mm common RC spine is integral beneath this section; do not draw a freestanding RC200 coupon here',
        'headerProjectionFromCoreEach_mm':(width-(hi-lo))/2,
        'headerProjectionBeyondFinishedFaceEach_mm':[flo-faces[0],faces[1]-fhi],
        'unplasteredWallCoreAboveDpc_mm':f['plasterStops']-z,
        'concreteToPlasterOffset_mm':f['plasterStops']-f['z'][3],
        'belowFflFaceTerritory':{'normalDepthEach_mm':w['faceFinish'], 'z':[z,f['plasterStops']],
          'status':'Unassigned 3D finish/base territory. No solid plaster, open void or selected glass filler is inferred from a finished-plan mask.'}},
      'airRouteControl':c['airRouteControl'],'plasterBypassNegativeControl':bypass,
      'structuralFloorInputBound':structural is not None,
      'structuralFloorComparison':floor_comparison,
      'thresholdClampComparison':threshold,
      'airDutyComparison':air_duty,
      'moistureControl':c['moistureControl'],'airEvidence':c['airEvidence'],'admission':c['admission']}

def figure(r):
    s=r['section'];w=s['wall'];axis=w['a'][0];lo,hi=w['structuralCore'];fl,fh=w['finishedFaces'];dl,dh=s['candidateDpcFaces']
    X=lambda x:90+(x-(axis-650))*.68
    Z=lambda z:180-z*.58
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="860" viewBox="0 0 1200 860"><rect width="1200" height="860" fill="#faf9f4"/><g font-family="Arial" fill="#243842">']
    def text(x,y,t,size=16):out.append(f'<text x="{x}" y="{y}" font-size="{size}">{html.escape(t)}</text>')
    def rect(a,b,z0,z1,color,stroke='#67737a'):
        out.append(f'<rect x="{X(a)}" y="{Z(z1)}" width="{X(b)-X(a)}" height="{Z(z0)-Z(z1)}" fill="{color}" stroke="{stroke}"/>')
    text(30,35,'One conventional mineral wall / suspended RC floor control',26)
    text(30,63,'UNSELECTED. Actual service-spine section X9300 / Y4500. No air, damp, thermal or material performance claim.',16)
    beam=s['underlyingSpine'];half=beam['width']/2
    points=[(axis-650,-180),(axis+650,-180),(axis+650,-380),(axis+half,-380),
      (axis+half,beam['z'][0]),(axis-half,beam['z'][0]),(axis-half,-380),(axis-650,-380)]
    out.append('<path d="'+' '.join(('M' if i==0 else 'L')+f'{X(x)} {Z(z)}' for i,(x,z) in enumerate(points))+'z" fill="#b9b7af" stroke="#67737a"/>')
    if r['structuralFloorInputBound']:
        out.append(f'<path d="M{X(axis-half)} {Z(-380)}H{X(axis+half)}" stroke="#67737a" stroke-dasharray="7 5"/>')
    rect(lo,hi,-30,150,'#d2bb92')
    rect(fl,lo,0,150,'#e7dfc9');rect(hi,fh,0,150,'#e7dfc9')
    for q in s['candidateDpcCourses']:
        rect(dl,dh,*q['z'],'#b6a181' if q['id'].startswith('course') else '#dfd7c5')
    for a,b in [(axis-650,dl),(dh,axis+650)]:rect(a,b,-180,-80,'#d2e2d4');rect(a,b,-80,-30,'#e2dfd6')
    for a,b in [(axis-650,fl),(fh,axis+650)]:rect(a,b,-30,-15,'#e2dfd6');rect(a,b,-15,0,'#aeb7bd')
    for a,b in [(fl,lo),(hi,fh)]:rect(a,b,-30,0,'#faf9f4','#b34c3d')
    text(90,115,'27 mm plaster starts at FFL 0.',16)
    text(90,142,'30 mm base/joint territory below it remains explicit.',16)
    text(90,575,'900 mm spine to −630; proposed upper200 lift / lower-grid interface at −380 (dashed).',17)
    text(90,603,'Field: 100 glass / 65 accessible distribution / 15 finish',17)
    text(90,631,'150 mm DPC: bed10 / unit65 / bed10 / unit65',17)
    text(90,659,'215 mm full headers under 140 mm core: 37.5 mm each side, 10.5 beyond finished face.',16)
    for z,label in [(0,'0 FFL'),(-30,'−30 DPC top'),(-80,'−80 glass top'),(-180,'−180 RC top'),(-380,'−380 field'),(-630,'−630 spine')]:
        text(990,Z(z)+5,label,14)
    # Dashed path is the unqualified series of body/bed interfaces, not a seal.
    points=[(axis-400,-190),(axis-100,-190),(axis,-175),(axis,-30),(lo,0),(fl,80)]
    out.append('<path d="'+' '.join(('M' if i==0 else 'L')+f'{X(x)} {Z(z)}' for i,(x,z) in enumerate(points))+'" fill="none" stroke="#a34e3c" stroke-width="3" stroke-dasharray="8 5"/>')
    text(30,710,'Dashed line: candidate series of interfaces needing leakage/movement proof; brick absorption is not air tightness.',16)
    text(30,738,'Red side boxes: below-FFL face territory is unassigned; do not invent solid plaster or an open gap from a plan mask.',16)
    text(30,766,'Ground-floor candidate: H12/100 both faces/axes; cover45±5; crack0.294/0.30 structural screen, not leakage.',16)
    text(30,794,'Continuous plaster down to wet RC would bypass the DPC. Actual floor, three cores and three doors remain separate joins.',16)
    text(30,822,'This internal-wall control is not an external shell, pressure-water / gas route, threshold renewal or whole-envelope exit.',16)
    out.append('</g></svg>\n');return ''.join(out)

def threshold_figure(r):
    t=r['thresholdClampComparison'];c=t['control'];f=t['lineForceSensitivityOnly']
    X=lambda y:90+(y-3950)*5
    Z=lambda z:280-z*5
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="840" viewBox="0 0 1200 840"><rect width="1200" height="840" fill="#faf9f4"/><g font-family="Arial" fill="#243842">']
    def txt(x,y,s,n=17):out.append(f'<text x="{x}" y="{y}" font-size="{n}">{html.escape(s)}</text>')
    def rect(a,b,z0,z1,color):out.append(f'<rect x="{X(a)}" y="{Z(z1)}" width="{X(b)-X(a)}" height="{Z(z0)-Z(z1)}" fill="{color}" stroke="#67737a"/>')
    txt(30,35,'Ordinary removable over-clamp: same threshold duty for both floor routes',25)
    txt(30,66,'UNADOPTED central section only. Bolts outside pan; ends, fixed support, seal and walking transition remain open.')
    rect(*c['clampY'],0,c['clampThickness'],'#a9b7bd')
    rect(c['panStartY'],c['backingEndY'],-1.5-c['backingThickness'],-1.5,'#d5bc94')
    points=t['panProfileYZ']+[[4090,-12]]
    out.append('<path d="'+' '.join(('M' if i==0 else 'L')+f'{X(y)} {Z(z)}' for i,(y,z) in enumerate(points))+'" fill="none" stroke="#27617c" stroke-width="5"/>')
    out.append(f'<path d="M{X(c["boltY"])} {Z(16)}V{Z(-20)}" stroke="#803e35" stroke-width="5"/>')
    for y,z,label in [(c['heelY'],0,'Heel 3980'),(c['boltY'],0,'Bolt 4010'),(c['sealReferenceY'],-1.5,'Seal 4045')]:
        out.append(f'<circle cx="{X(y)}" cy="{Z(z)}" r="5" fill="#803e35"/>')
        txt(X(y)-45,370,label,15)
    txt(70,130,'Upper clamp lifts completely before NORTH withdrawal.',18)
    txt(70,160,'10 mm new top level: actual walking/finish transition is not admitted.',17)
    txt(830,235,'15 mm crest',16);txt(830,270,'0 apron',16)
    txt(820,320,'NORTH →',21)
    txt(30,420,'Fixed lower backing ends at 4058; integral riser starts at 4060: only 2 mm nominal central separation.',18)
    txt(30,451,'Pan moves NORTH; riser moves away from fixed backing. This does not prove end-dam/capture release.',17)
    txt(30,490,f'1780 mm clamp / {t["boltCountReference"]} reference bolts / {t["boltPitchReference_mm"]:.3f} mm pitch. Upper bar alone {t["upperClampMassOnly_kg"]:.3f} kg.',17)
    txt(30,521,f'15 N/mm catalogue-only sensitivity → seal {f["sealCompression_N"]/1000:.2f} kN; heel {f["heelReaction_N"]/1000:.2f} kN;',17)
    txt(30,552,f'bolt tension {f["totalBoltTension_N"]/1000:.2f} kN, equal share {f["equalBoltShare_N"]:.1f} N before prying/pretension.',17)
    txt(30,594,'Bolts are above the selected glass/distribution stack. No unsupported anchor through those layers is assumed.',17)
    txt(30,625,'Fixed flange / heel / support back to RC −180 needs actual geometry, movement, capacity and thermal pricing.',17)
    txt(30,666,'Actual formed pan underside is not a machined seal housing. Finish, custom seal and constituent duties persist.',17)
    txt(30,697,'End X5102 / 6898 and crest 75 are authored; full apron/end intersection and closed end seals are not.',17)
    txt(30,738,'No wet-floor hole, permanent weld to renewable pan, detached apron or 37 sealed bosses is required by this sketch.',17)
    txt(30,779,'No complete threshold, air/water, walking, support, material or renewal pass follows.',18)
    out.append('</g></svg>\n');return ''.join(out)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');a=ap.parse_args();r=produce()
    outputs={'conventional-ground-junction.results.json':json.dumps(r,indent=2,ensure_ascii=False)+'\n','conventional-ground-junction.svg':figure(r),'conventional-ground-threshold-clamp.svg':threshold_figure(r)}
    for name,content in outputs.items():
        p=HERE/name
        if a.check:assert p.read_text()==content,f'Stale {name}'
        else:p.write_text(content)
    print('Located ordinary wall/floor geometry reproduces; complete bonded air/moisture transition remains unqualified.')

if __name__=='__main__':main()
