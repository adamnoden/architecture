#!/usr/bin/env python3
"""A located conventional junction comparison; geometric fit is not a seal."""
from pathlib import Path
import argparse, hashlib, html, json, subprocess

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

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');a=ap.parse_args();r=produce()
    outputs={'conventional-ground-junction.results.json':json.dumps(r,indent=2,ensure_ascii=False)+'\n','conventional-ground-junction.svg':figure(r)}
    for name,content in outputs.items():
        p=HERE/name
        if a.check:assert p.read_text()==content,f'Stale {name}'
        else:p.write_text(content)
    print('Located ordinary wall/floor geometry reproduces; complete bonded air/moisture transition remains unqualified.')

if __name__=='__main__':main()
