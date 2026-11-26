"""Source-owned exact corner bar profiles and ordinary350-band anchorage bounds.
No native model, house response, signed demand or resistance acceptance is produced.
All coordinates are actual millimetres relative to the saved outer concrete face.
"""
import argparse,copy,json,math
from pathlib import Path
import xml.etree.ElementTree as ET
import separated_floor_bearing as source
D=Path(__file__).parent
INPUT=D/'perimeter-upstand-cage-inputs.json'
def area(d):return math.pi*d*d/4
def distance_box_point(p,q,t):
    return math.sqrt(sum(max(0.,abs(a-b)-t)**2 for a,b in zip(p,q)))
def arc_box_distance(centre,r,a,b,p,t):
    """Exact planar circular arc to an axis-aligned relative-placement box."""
    candidates=[a,b]
    def admit(theta):
        for n in range(-2,3):
            v=theta+n*2*math.pi
            if a-1e-12<=v<=b+1e-12:candidates.append(v)
    for k in range(4):admit(k*math.pi/2)
    for x in (p[0]-t,p[0]+t):
        for y in (p[1]-t,p[1]+t):admit(math.atan2(y-centre[1],x-centre[0]))
        v=(x-centre[0])/r
        if abs(v)<=1:
            z=math.acos(v);admit(z);admit(-z)
    for y in (p[1]-t,p[1]+t):
        v=(y-centre[1])/r
        if abs(v)<=1:
            z=math.asin(v);admit(z);admit(math.pi-z)
    return min(distance_box_point([centre[0]+r*math.cos(v),centre[1]+r*math.sin(v)],p,t) for v in candidates)
def line_box_distance(a,b,p,t):
    """Only axis-aligned actual straight bar stubs are used here."""
    if a[0]!=b[0] and a[1]!=b[1]:raise ValueError('Explicit axis-aligned stub required')
    lo=[min(x,y) for x,y in zip(a,b)];hi=[max(x,y) for x,y in zip(a,b)]
    return math.sqrt(sum(max(0.,lo[i]-(p[i]+t),(p[i]-t)-hi[i])**2 for i in range(2)))
def arc(centre,r,a,b,axes,other):
    return {'kind':'arc','centre':centre,'radiusMm':r,'anglesRad':[a,b],'axes':axes,'other':other}
def sample_primitive(p,step=.025):
    if p['kind']=='line':return p['points']
    a,b=p['anglesRad'];n=max(1,math.ceil(abs(b-a)/step));out=[]
    for k in range(n+1):
        q=[0.]*3
        q[p['axes'][0]]=p['centre'][0]+p['radiusMm']*math.cos(a+(b-a)*k/n)
        q[p['axes'][1]]=p['centre'][1]+p['radiusMm']*math.sin(a+(b-a)*k/n)
        q[3-sum(p['axes'])]=p['other'];out.append(q)
    return out
def paths_points(path):
    return [q for p in path['primitives'] for q in sample_primitive(p)]
def column_points(c):
    g,l=c['geometry'],c['links'];f,k=g['columnFaceRowsMm'];last=g['columnAlongStationsMm'][-1]
    pts=sorted({(x,y) for x in (f,k) for y in g['columnAlongStationsMm']}|
        {(x,y) for y in (f,k) for x in g['columnAlongStationsMm']})
    r=(l['columnMandrelMm']+l['columnOutsideMm'])/2
    combined=(l['columnOutsideMm']+g['columnBarOutsideMm'])/2
    delta=r-(r-combined)/math.sqrt(2)-combined
    adjusted={}
    for bounds in ((f,f,k,last),(f,f,last,k)):
        x0,y0,x1,y1=bounds
        for x,y in ((x0,y0),(x1,y0),(x1,y1),(x0,y1)):
            adjusted[x,y]=[x+(delta if x==x0 else -delta),y+(delta if y==y0 else -delta)]
    return [adjusted.get(p,list(p)) for p in pts]
def beam_paths(c):
    g=c['geometry'];out=[]
    for label,n,r in zip(('outer','inner'),g['beamBarNormalMm'],g['beamPlanRadiiMm']):
        centre=[n+r,n+r]
        for z in g['beamBarZMm']:
            out.append({'id':f'beam/{label}/{z:g}','nominalMm':g['beamBarNominalMm'],'outsideMm':g['beamBarOutsideMm'],
                'continuesBeyondLocalWindow':True,'primitives':[
                {'kind':'line','points':[[n,1600,z],[n,n+r,z]]},
                arc(centre,r,math.pi,1.5*math.pi,[0,1],z),
                {'kind':'line','points':[[n+r,n,z],[1600,n,z]]}]})
    return out
def floor_layers(c):
    g=c['geometry'];bottom,top=g['slabZMm'];cover=g['floorNominalSurfaceCoverMm'];d=g['floorBarOutsideMm']
    return {'X-bottom':bottom+cover+d/2,'Y-bottom':bottom+cover+1.5*d,
        'X-top':top-cover-d/2,'Y-top':top-cover-1.5*d}
def corner_floor_paths(c):
    g=c['geometry'];r=(g['cornerFloorMandrelMm']+g['floorBarOutsideMm'])/2;n=g['cornerFloorReturnNormalMm'];out=[]
    for axis in (0,1):
        for layer in ('bottom','top'):
            z=floor_layers(c)[('X' if axis==0 else 'Y')+'-'+layer];s=-1 if layer=='bottom' else 1
            for along in g['floorAlongCoordinatesMm']:
                p=lambda normal,height:[normal,along,height] if axis==0 else [along,normal,height]
                out.append({'id':f'floor/{axis}/{layer}/{along:g}','nominalMm':g['floorBarNominalMm'],'outsideMm':g['floorBarOutsideMm'],
                    'primitives':[{'kind':'line','points':[p(700,z),p(n+r,z)]},
                        arc([n+r,z+s*r],r,math.pi/2 if s<0 else 1.5*math.pi,math.pi,[axis,2],along),
                        {'kind':'line','points':[p(n,z+s*r),p(n,z+s*(r+g['cornerFloorStraightTailMm']))]}],
                    'verticalTailZMm':sorted((z+s*r,z+s*(r+g['cornerFloorStraightTailMm']))),
                    'surfaceCoveredByActualLowerOrUpper300Core':True})
    return out
def material_bounds(c):
    g,m=c['geometry'],c['materials'];d=g['floorBarNominalMm'];f=m['reinforcementComparisonMPa']
    ab=(g['floorPitchMm']-2*g['independentBarSettingMm'])/2
    ft=area(d)*f;dm=ft/m['concreteCompressionMPa']*(1/ab+1/(2*d))
    layers=floor_layers(c);top=g['slabZMm'][0]+g['ordinaryBandDepthMm']
    end=top-g['floorNominalSurfaceCoverMm']-g['floorBarOutsideMm']/2
    r=(g['ordinaryFloorMandrelMm']+g['floorBarOutsideMm'])/2
    ordinary=[]
    for name,z in layers.items():
        tail=end-z-r;length=math.pi*r/2+max(0.,tail)
        ordinary.append({'layer':name,'straightAfterBendMm':tail,
            'minimumStandardBendTailMm':g['ordinaryFloorHookMinTailFactor']*d,
            'standardBendTailFits':tail>=g['ordinaryFloorHookMinTailFactor']*d,
            'poorBondNoShapeReductionStressCapMPa':length*4*m['poorBondMPa']/d,
            'goodBondNoShapeReductionStressCapMPa':length*4*m['goodBondMPa']/d,
            'mandrelBearingStressCapMPa':g['ordinaryFloorMandrelMm']*m['concreteCompressionMPa']/(area(d)*(1/ab+1/(2*d))),
            'completeAnchorageOrForceDemandAccepted':False})
    return {'floorAreaMm2PerM':area(d)*1000/g['floorPitchMm'],
        'legacyH16Per80AreaMm2PerM':area(16)*1000/80,
        'requiredMandrelAt400MPaWorstIndependentPitchMm':dm,
        'cornerMandrelReserveMm':g['cornerFloorMandrelMm']-dm,
        'cornerPoorBondFull400StraightRequirementMm':d*f/(4*m['poorBondMPa']),
        'cornerStraightTailReserveMm':g['cornerFloorStraightTailMm']-d*f/(4*m['poorBondMPa']),
        'ordinary350Anchorage':ordinary,
        'prospective360MinimumStraightTailMm':min(x['straightAfterBendMm'] for x in ordinary)+10,
        '360GeometryIsAnUnselectedComparison':True}
def assess(c,base):
    g=c['geometry'];col=column_points(c);beam=beam_paths(c);floors=corner_floor_paths(c)
    if base['slabZMm']!=g['slabZMm'] or base['firstFFLMm']!=g['FIRSTMm']:raise ValueError('Changed actual source levels')
    if g['comparisonCoreMm']!=300 or g['ordinaryBandWidthMm']!=300 or g['ordinaryBandDepthMm']!=350:raise ValueError('This exact unselected300x350 source family only')
    if any(c['scope'][k] is not False for k in ('nativeHouseSolved','old96DemandTransferred','wholeCagePlacingAccepted','completeResistanceAccepted','productAccepted','ownerAccepted','houseAccepted')):raise ValueError('No approval or demand injection')
    tol=2*g['independentBarSettingMm'];beam_col=[]
    for p in col:
        for bar in beam:
            rr=(g['columnBarOutsideMm']+bar['outsideMm'])/2
            distances=[]
            for primitive in bar['primitives']:
                if primitive['kind']=='line':distances.append(line_box_distance(primitive['points'][0][:2],primitive['points'][1][:2],p,tol))
                else:distances.append(arc_box_distance(primitive['centre'],primitive['radiusMm'],*primitive['anglesRad'],p,tol))
            beam_col.append({'columnXYMm':p,'beamId':bar['id'],'adverseCylinderClearMm':min(distances)-rr})
    floor_col=[]
    for bar in floors:
        axis=int(bar['id'].split('/')[1]);along=float(bar['id'].split('/')[-1])
        for p in col:
            nearest=list(p);n=g['cornerFloorReturnNormalMm']
            point=[min(700,max(n,p[axis])),along] if axis==0 else [along,min(700,max(n,p[axis]))]
            floor_col.append({'floorId':bar['id'],'columnXYMm':p,
                'adverseProjectedCylinderClearMm':distance_box_point(point,p,tol)-(bar['outsideMm']+g['columnBarOutsideMm'])/2})
    layers=floor_layers(c);inter=layers['Y-top']-layers['Y-bottom']-g['floorBarOutsideMm']-tol
    return {'schema':'str-perimeter-upstand-cage-checkpoint/1','status':'EXACT CORNER PROFILES;WHOLE CAGE/ORDINARY EDGE ANCHORAGE NOT ACCEPTED',
        'geometry':g,'columnBarCoordinatesLocalMm':col,'columnBarsNominalCount':len(col),
        'beamSectionOriginNormalZMm':[g['ordinaryBandWidthMm']/2,g['slabZMm'][0]+g['ordinaryBandDepthMm']/2],
        'L300ConcreteAreaMm2':510000,'L300CentroidLocalXYMm':[355.88235294117646]*2,
        'floorLayerZMm':layers,'parallelFloorBarAdverseClearMm':g['floorPitchMm']-g['floorBarOutsideMm']-tol,
        'interMatAdverseParallelClearMm':inter,
        'beamColumnWitness':min(beam_col,key=lambda x:x['adverseCylinderClearMm']),
        'floorColumnWitness':min(floor_col,key=lambda x:x['adverseProjectedCylinderClearMm']),
        'cornerMainBarHoleChecksPass':min(x['adverseCylinderClearMm'] for x in beam_col)>=0 and min(x['adverseProjectedCylinderClearMm'] for x in floor_col)>=0,
        'beamPaths':beam,'cornerFloorPaths':floors,'materialBounds':material_bounds(c),
        'sourceCornerMirrors':[{'corner':r['corner'],'originHeadXYMm':r['originXYMm'],'signXY':r['signXY'],
            'outerFaceXYMm':[r['originXYMm'][i]-70*r['signXY'][i] for i in range(2)],'localCoordinatesMeasuredInwardFromOuterFace':True} for r in base['corners']],
        'newInnerMasonrySeatUsed':False,'nativeHouseSolveExecuted':False,
        'unclosed':['All H10/H8 link closures, cross-ties, beam laps and full cage-cylinder audit remain to be completed',
            'Ordinary350wall-span top anchor tail is8mm below the chosen5phi rule;360 is only a proposed geometry control',
            'No current signed whole-house force envelope, beam/column six-component resistance or floor stress-convergence proof exists for this profile',
            'Factory rib envelopes/common jig and physical installation/material acceptance unearned',
            'Actual north650/750 overlap and material union belong to the producer; no guessed beam width is used here'],
        'scope':copy.deepcopy(c['scope'])}
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--out',type=Path,required=True);p=ap.parse_args()
    c=json.loads(INPUT.read_bytes());settings,raw=source.load();base,h,grid,furniture=source.derive(settings,raw)
    result=assess(c,base);p.out.mkdir(parents=True,exist_ok=True)
    result['sourceSHA256']={name:source.sha((D/name).read_bytes()) for name in ('perimeter_upstand_cage.py','perimeter-upstand-cage-inputs.json','perimeter_upstand_cage_test.py')}
    data=json.dumps(result,indent=2,allow_nan=False)+'\n';(p.out/'perimeter-upstand-cage-checkpoint.json').write_text(data)
    print('UPSTAND_CAGE_SUMMARY '+json.dumps({k:v for k,v in result.items() if k not in ('beamPaths','cornerFloorPaths')}))
    print('CHECKPOINT_SHA256 '+source.sha(data.encode()))
    print('JSON_SOURCE perimeter-upstand-cage-checkpoint.json '+data.encode().hex())
if __name__=='__main__':main()
