#!/usr/bin/env python3
"""Actual-HAD geometry comparison and finite provisional leakage accounting."""
from pathlib import Path
import argparse, hashlib, html, json, math, subprocess

ROOT=Path(__file__).resolve().parents[3]
BASE=Path(__file__).with_suffix('')

def immutable(s):
    raw=subprocess.check_output(['git','show',s['commit']+':'+s['path']],cwd=ROOT)
    assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==s['blob']
    return json.loads(raw)

def topology(outer,cuts):
    x,y,w,h=outer
    xs=sorted({x,x+w,*[v for r in cuts for v in [r[0],r[0]+r[2]] if x<=v<=x+w]})
    ys=sorted({y,y+h,*[v for r in cuts for v in [r[1],r[1]+r[3]] if y<=v<=y+h]})
    cells={}
    for i,(a,b) in enumerate(zip(xs,xs[1:])):
      for j,(c,d) in enumerate(zip(ys,ys[1:])):
        if not any(rx<(a+b)/2<rx+rw and ry<(c+d)/2<ry+rh for rx,ry,rw,rh in cuts):
          cells[i,j]=(b-a)*(d-c)
    perimeter=sum(length for i,j in cells for di,dj,length in [(1,0,ys[j+1]-ys[j]),(-1,0,ys[j+1]-ys[j]),(0,1,xs[i+1]-xs[i]),(0,-1,xs[i+1]-xs[i])] if (i+di,j+dj) not in cells)
    return {'area_m2':sum(cells.values())/1e6,'perimeter_m':perimeter/1000,'outer_mm':outer,'cuts_mm':cuts}

def derive_geometry(m):
    e=m['envelope'];shell=m['shell'];x,y,w,h=m['court']
    outer=[e,e,shell-2*e,shell-2*e]
    walls={v['id']:v for v in m['groundWalls']}
    west,east=(walls[k] for k in ['loggia-west-weather','loggia-east-weather'])
    spine,plant,north=(walls[k] for k in ['gallery-east-water-weather','plant-north','east-passage-north-weather'])
    ground_cuts=[[x-e,y-e,w+2*e,h+e],
      [west['finishedFaces'][0],y+h,east['finishedFaces'][1]-west['finishedFaces'][0],shell-e-y-h],
      [spine['finishedFaces'][0],plant['finishedFaces'][0],shell-e-spine['finishedFaces'][0],north['finishedFaces'][1]-plant['finishedFaces'][0]]]
    g=topology(outer,ground_cuts)
    u=topology(outer,[[x-e,y-e,w+2*e,h+2*e]])
    return g,u

def produce():
    raw=BASE.with_name(BASE.name+'-sources').with_suffix('.json').read_bytes(); c=json.loads(raw)
    m=immutable(c['sources']['HAD'])['model'];field=immutable(c['sources']['floorField'])
    g,u=derive_geometry(m);p=c['comparison'];z=m['sections'];height=p['clearHeight_m']
    assert z['groundFFL']==0 and z['firstFFL']==3450 and m['shell']==12000
    # Reference puts the step at FFL3450 and upper ceiling at FFL+3100.
    # Actual loggia underside2890 / protected closure6444 and solid air volumes
    # explicitly prevent calling this reference the final test envelope/volume.
    ground_height=(z['firstFFL']-z['groundFFL'])/1000
    exposed=u['area_m2']-g['area_m2'];assert exposed>0
    surfaces={'groundFloor':g['area_m2'],'upperCeiling':u['area_m2'],
      'upperFloorOverOutdoor':exposed,'groundStoreyWalls':g['perimeter_m']*ground_height,
      'upperWalls':u['perimeter_m']*height}
    A=sum(surfaces.values());V=(g['area_m2']+u['area_m2'])*height
    assert math.isclose(A,2*u['area_m2']+g['perimeter_m']*ground_height+u['perimeter_m']*height,abs_tol=1e-9)
    f=field['supportAwareRoomField'];L=f['ordinaryUpstandExcludingThreeDoors_m']
    assert f['edgeLength_m']-L==5 and f['netField_m2']<g['area_m2']
    # Falsifiers: omitting the real east notch changes both A/G; deducting the
    # entrance void from the upper air domain mistakes absence of floor for air.
    absent=topology(g['outer_mm'],g['cuts_mm'][:-1]);assert absent['area_m2']>g['area_m2']+5
    assert not math.isclose(g['perimeter_m'],absent['perimeter_m'])
    vx,vy,vw,vh=m['void'];clipped_void=vw*(vy+vh-max(vy,m['envelope']))/1e6
    assert clipped_void>5 and V-(g['area_m2']+u['area_m2']-clipped_void)*height>15
    cases=[]
    for q in p['q50Cases_m3_per_h_m2']:
      Q50=q*A
      trials=[]
      for pressure in p['operatingPressureChallenges_Pa']:
        for exponent in p['authoredExponents']:
          Q=Q50*(pressure/50)**exponent/3.6
          H=Q*p['airHeatCapacity_J_per_m3_K']/1000
          trials.append({'uniformPressure_Pa':pressure,'exponent':exponent,'flow_Lps':Q,'heatLoss_W_per_K':H,'heatAt30K_W':H*p['temperatureDifference_K']})
      assert all(t['flow_Lps']<Q50/3.6 for t in trials)
      cases.append({'q50_m3_per_h_m2':q,'totalQ50_m3_per_h':Q50,'pressureChallenges':trials})
    proposed=next(v for v in cases if v['q50_m3_per_h_m2']==p['proposedDevelopmentQ50_m3_per_h_m2'])
    fractions=p['familyBudgetFractions'];assert math.isclose(sum(fractions.values()),1)
    budgets={k:{'fraction':v,'aggregate_m3_per_h_at50Pa':v*proposed['totalQ50_m3_per_h']} for k,v in fractions.items()}
    floor=budgets['floorWallField']['aggregate_m3_per_h_at50Pa']
    assert sum(v['aggregate_m3_per_h_at50Pa'] for v in budgets.values())==proposed['totalQ50_m3_per_h']
    assert floor<proposed['totalQ50_m3_per_h'] and fractions['unassignedReserve']>0
    Hnormal=p['ventilationNormal_Lps']*1.2*(1-p['idealRecoveryComparison'])
    Hcooking=p['ventilationCooking_Lps']*1.2*(1-p['idealRecoveryComparison'])
    return {'status':c['status'],'sources':c['sources'],'primaryEvidence':c['primaryEvidence'],
      'sourceExtractSHA256':hashlib.sha256(raw).hexdigest(),
      'decision':'Develop q50<=1.0 as an authored whole-system comparison, with one10% aggregate floor/wall allocation and20% unassigned reserve. Not an owner invariant, method-certified envelope/volume, local joint rating or compliance pass.',
      'geometry':{'groundPressureFootprint':g,'upperPressureFootprint':u,'referenceSurfaceAreas_m2':surfaces,
        'referenceEnvelope_m2':A,'grossTwoClearLayerVolume_m3':V,'entranceVoidInsideAirDomain_m2':clipped_void,
        'occupiedRoomField_m2':f['netField_m2'],'ordinaryFloorEdge_m':L,
        'referenceRole':'Current HAD finished-face plan, with explicit prismatic step at3450 and two3100 clear layers. Not final TM23 envelope or finished net Vn50. No n50 is calculated from this gross proxy.',
        'requiredCorrections':['Actual loggia soffit2890 rather than stepFFL3450; pressure-layer location through upper floor/beam/insulation must bind',
          'Protected roof closure bottom6444 differs from ordinary upperFFL+3100=6550; actual complete private-room/roof/step boundary must bind',
          'Internal walls/floors/hidden risers excluded from net Vn50, while conditioned entrance/stair void air must be included with actual stair/landing solids',
          'Method-specific final test preparation: normal ventilation openings sealed as prescribed; ordinary ventilation and actual building operation remain separate']},
      'comparisonCases':cases,'proposedDevelopment':proposed,'aggregateFamilyBudgets':budgets,
      'floorWallAllocation':{'aggregate_m3_per_h_at50Pa':floor,'ordinaryEdge_m':L,
        'bookkeepingEquivalent_m3_per_h_m_at50Pa':floor/L,'bookkeepingEquivalent_Lps_m_at50Pa':floor/L/3.6,
        'role':p['allocationRole'],'threeDoorWidths_m':5,'threeDoorAssemblyFamily':'completeOpeningsIncludingThreeDoorThresholds',
        'notAdmitted':['A uniform line rating or tested length','63.2 budget plus additional field/core budgets','Arbitrary zero-leak junction','A mineral/concrete/DPC/clamp alone establishes the allocated performance']},
      'ventilationComparison':{'normal_Lps':96,'cooking_Lps':128,'idealRecovery':.7,'normalUnrecovered_W_per_K':Hnormal,'cookingUnrecovered_W_per_K':Hcooking,
        'role':'Pressure challenges are uniform imposed comparisons, not actual site infiltration, annual energy or room airflow. Leakage bypasses heat recovery. Add sensitivity loss once; neither subtract it from required delivered ventilation nor use it as certified hob makeup. Actual wind/stack/leak paths/network and native frost controls still govern.'},
      'renewalRemainsOpen':['W9 native156kg evenly bottom-supported lifting; actual base/frame bearing paths, initial support and base-to270deck transfer',
        'Complete machine/fixture/operator and lowest-load travel fields; no ordinary hand-lift or free adapter',
        'Full folded exterior slope/loading/turn capture and rated anchors remain unearned; no cart or handling pass',
        'Actual complete diverging port connections, insulation/jacket sealing and pre-crossing attenuator hosts remain unearned'],
      'admission':{'ownerTargetAdopted':False,'actualEnvelopeTested':False,'netN50VolumeAgreed':False,'wholeHouseHeatSelected':False,'materialException':False,'handlingPass':False,'packetComplete':False}}

def figure(r):
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1050" viewBox="0 0 1200 1050">','<rect width="1200" height="1050" fill="#f4f1e9"/>']
    def text(x,y,s,size=18,color='#21363b'):
      out.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-family="Arial,sans-serif">{html.escape(s)}</text>')
    text(35,42,'A measurable leakage duty for the current house',29)
    text(35,72,'Authored development comparison — no owner invariant, test result or material/handling adoption',17)
    for name,key,ox in [('GROUND pressure footprint','groundPressureFootprint',40),('UPPER air domain','upperPressureFootprint',420)]:
      q=r['geometry'][key];scale=.025
      x,y,w,h=q['outer_mm'];out.append(f'<rect x="{ox}" y="110" width="{w*scale}" height="{h*scale}" fill="#b4cec4" stroke="#21363b"/>')
      for cx,cy,cw,ch in q['cuts_mm']:
        out.append(f'<rect x="{ox+(cx-x)*scale}" y="{110+(cy-y)*scale}" width="{cw*scale}" height="{ch*scale}" fill="#f4f1e9"/>')
      text(ox,415,name,16);text(ox,441,f"{q['area_m2']:.3f} m² / {q['perimeter_m']:.3f} m",16)
    g=r['geometry'];text(770,130,'Source-located geometry',22)
    for i,s in enumerate([f"Reference envelope {g['referenceEnvelope_m2']:.3f} m²",f"Two-clear-layer proxy {g['grossTwoClearLayerVolume_m3']:.3f} m³",'Upper void is inside the air domain.','Includes exposed upper-floor soffits.','Floor field 83.057 ≠ pressure footprint 88.554.','Real closure/solids/test boundaries still bind.','Gross proxy is NOT net n50 volume.']):text(770,166+29*i,s,16)
    text(35,492,'50 Pa design cases and one imposed 2 Pa / exponent0.65 sensitivity',22)
    headings=['q50 m³/(h·m²)','Total Q50 m³/h','Challenge flow L/s','Challenge loss W/K']
    for x,s in zip([45,310,590,875],headings):text(x,526,s,17)
    for i,row in enumerate(r['comparisonCases']):
      t=next(v for v in row['pressureChallenges'] if v['uniformPressure_Pa']==2 and v['exponent']==.65)
      if row['q50_m3_per_h_m2']==1:out.append(f'<rect x="35" y="{540+i*35}" width="1120" height="33" fill="#d4e4bd"/>')
      for x,s in zip([45,310,590,875],[str(row['q50_m3_per_h_m2']),f"{row['totalQ50_m3_per_h']:.1f}",f"{t['flow_Lps']:.2f}",f"{t['heatLoss_W_per_K']:.2f}"]):text(x,563+i*35,s,19)
    text(35,708,'2 Pa is not site weather. Full 1/2/4 Pa × 0.5/0.65/1 exponent cases remain in JSON.',17)
    text(35,738,'Ideal 70% recovery at 96 L/s leaves 34.56 W/K; leakage bypasses recovery and is charged once.',17)
    text(35,788,'One finite floor/wall allocation',23)
    f=r['floorWallAllocation'];text(35,821,f"10% = {f['aggregate_m3_per_h_at50Pa']:.3f} m³/h@50Pa for the WHOLE field + ordinary joints/cores.",18)
    text(35,850,f"Over 118.761 m: {f['bookkeepingEquivalent_m3_per_h_m_at50Pa']:.4f} m³/(h·m) bookkeeping average, not a joint rating.",18)
    text(35,879,'Complete 3 door/threshold assemblies → openings 25%; one physical path gets one budget.',18)
    text(35,908,'Walls 15% / roof 20% / openings 25% / penetrations 10% / floor 10% / reserve 20%.',18)
    text(35,953,'Next: agree real pressure boundary; test representative full junction, then whole house.',19)
    text(35,986,'W9 bottom lift/base-to-deck, complete ports and folded exterior capture remain OPEN.',19,'#8c402e')
    out.append('</svg>');return '\n'.join(out)+'\n'

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args()
    r=produce();products={BASE.with_suffix('.json'):json.dumps(r,indent=2)+'\n',BASE.with_suffix('.svg'):figure(r)}
    for path,content in products.items():
      if args.check:assert path.read_text()==content,f'Stale generated {path.name}'
      else:path.write_text(content)
    print('PASS: current-HAD footprint/area accounting, pressure/heat sensitivities, nonduplicated family budget and explicit nonadmissions')

if __name__=='__main__':main()
