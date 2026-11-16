"""Finite opposed diagonal floor-to-wall drag paths in a new north L receiver."""
from hashlib import sha256
from json import dumps,loads
from math import cos,pi,radians,sin,tan
from pathlib import Path
from sys import argv,path
home=Path(__file__).resolve().parent
root=Path(argv[1])
path.insert(0,str(root/'project/str/studies'))
from court_tie_starter_paths import segment_distance

files=[
    'project/str/studies/floor-portal-north-collar.json',
    'project/str/studies/current-house-ground-ties.json',
    'project/str/studies/open-loggia-support.json',
    'project/had/studies/open-north-loggia.json',
    'project/mat/studies/loggia-soffit.json',
    'project/str/studies/current-house-grid.json',
    'project/str/studies/floor-portal-straight-receiver.json',
]
sources=[(root/name).read_bytes() for name in files]
collar,ground,floor,house,section,grid,straight=map(loads,sources)
force=collar['old_new_chord'][1]
normal_u=170
stations=[338,440,542,644,746]
theta=radians(62)
bar=20
place=21
setting=5
poor_bond=2.1
soffit,regular_top=section['section']['slabZ']
finish=collar['cornerCandidate']['FFLAndFinishUndersideZmm'][1]
edge_v=(-70,930)
physical_tail_margin=5
bar_force=force/(len(stations)*sin(theta))
need=bar_force*1000/(pi*bar*poor_bond)
length=need+physical_tail_margin
du,dv=length*cos(theta),length*sin(theta)
return_compression=force/tan(theta)
strut_screen=.6*(1-30/250)*17
cover=25

def drag(sign,swap=False,z=0):
    lines=[
        ((normal_u-du,v-sign*dv,z),(normal_u+du,v+sign*dv,z))
        for v in stations
    ]
    if swap:
        return [((a[1],a[0],a[2]),(b[1],b[0],b[2])) for a,b in lines]
    return lines

def min_gap(left,right,d_radii,relative_setting):
    return min(segment_distance(*p,*q) for p in left for q in right)-d_radii-relative_setting

major_points=ground['outer']['primaryBarXY']
# One arm only: the primary toe rows keep their V axes and are rephased
# roomward by 15 mm in the same continuous wall. Common heel unshifted.
primary=[
    (u-70+(15 if v>800 else 0),v-70)
    for u,v in major_points if u<140
]
secondary=[(u,v) for u in (-12,42) for v in (280,530)]

def vertical(points):
    both_wings = set(points) | {(v,u) for u,v in points}
    return [((u,v,3000),(u,v,3600)) for u,v in sorted(both_wings)]

up=drag(1)
down=drag(-1)
pair=drag(1,z=3260)+drag(-1,z=3308)
own_clear=min(b-a for a,b in zip(stations,stations[1:]))*cos(theta)-bar-setting
mixed=min_gap(up,drag(-1,True),bar,setting)
upright={
    'primaryH20':min_gap(pair,vertical(primary),20,setting),
    'secondaryH12':min_gap(pair,vertical(secondary),16,setting),
}
heights=[3206,3218,3260,3284,3308,3350,3362]
diagonal_separation=heights[4]-heights[2]
stack_top=heights[-1]+6+cover+5
port_u,port_v,port_diameter=straight['existingGeometry']['NWrearWCportLocalUVdiameterMm']
port_axis=[((port_u,port_v,soffit),(port_u,port_v,regular_top))]
port_clearances=[{
    'levelZMm': z, 'direction': sign,
    'minimumClearToFormedEdgeAfter5Mm': min_gap(drag(sign,z=z),port_axis,(bar+port_diameter)/2,setting)
} for sign,z in ((1,3260),(-1,3308))]


def gravity(name):
    row=next(r for r in floor['floor_fields'] if r['id']==name)
    amount=row['action']['V']*.86
    return {'field':name,'wingReactionKN':amount,'mean100WideSeatMPa':amount*1000/(100*860),
            'U190ToU20IndependentTieKN':amount*170/row['section']['z']}

def section_gap_one_arm():
    # Roomward wall shift creates outside face positions for the parallel
    # steel. Combine the H12 and one H10 course in one larger H16.
    # Coverage of the complete common heel and closed links is still open.
    rails=[]
    for u,zs,d in [
        (-28,[3211,3251,3335],12),(26,[3211,3251,3335],12),
        (-30,[3293],16),(24,[3293],16),
        (-27,[3143,3443],10),(27,[3143,3443],10),
    ]:
        rails.extend((u,z,d) for z in zs)
    where=[]
    for sign in (1,-1):
        for z in (3260,3308):
            for u,z0,d in rails:
                gap=min_gap(drag(sign,z=z),[((u,-70,z0),(u,930,z0))],(bar+d)/2,setting)
                where.append((gap,sign,z,u,z0,d))
    return {'governingGapAndAxes':min(where),
            'minimumUnrelatedGapMm':min(where)[0],
            'oneCourseReplacementAreaMM2':pi*8**2,
            'priorSeparateH12AndH10AreaMM2':pi*(6**2+5**2),
            'railAxesUMmZMmDiameterMm':rails}

num={
    'status':'Geometric and static monolithic redesign screen. Coupled wall, corner cage and splice loads unadmitted.',
    'sourceSHA256':dict(zip(files,[sha256(raw).hexdigest() for raw in sources])),
    'geometry':{'wallUAndLegVLimitsMm':[[-70,normal_u],list(edge_v)], 'receivingUMm':normal_u,
                'northNearestRawOpeningReserveAtOldToeMm':37.5,
                'permanentWallRoomwardIncreaseMm':normal_u-70,
                'unchangedExteriorGlassCavityBrickMm':collar['cornerCandidate']['unchangedExteriorGlassCavityAndBrickMm'],
                'NWOriginalRearCabinetPlanMm':house['upperFurniture']['rear-cabinet'],
                'soffitAndOrdinarySlabTopZMm':[soffit,regular_top]},
    'straightDrag':{'steel':'S500 H20; C30/37 and declared 2.1MPa poor-bond', 'anglesDeg':[-62,62],
                    'barCentresAtReceivingPlaneVMm':stations,'derivedTensionPerBarKN':bar_force,
                    'requiredBondLengthEachSideMm':need,'modelledLengthEachSideMm':length,
                    'projectionEachSideUAndVMm':[du,dv], 'diagonalRootsUMm':normal_u-du,
                    'stripExtentsVMm':[stations[0]-dv,stations[-1]+dv],
                    'lowerPathsLocalXYZMm':drag(1,z=3260)+drag(-1,True,z=3260),
                    'upperPathsLocalXYZMm':drag(-1,z=3308)+drag(1,True,z=3308),
                    'coverToActualToeEndAfter5mm':edge_v[1]-stations[-1]-dv-5-bar/2*cos(theta),
                    'roomwardAffectedUAtMinimumMm':normal_u+du,
                    'basicPoorBondOnlySafetyRatio':length/need},
    'stack':{'axesInSectionZMm':heights,'barDiametersMm':[12,12,20,28,20,12,12],
             'localSlabTopZMm':stack_top,'slabDepthMm':stack_top-soffit,
             'reserveToActualFinishUndersideMm':finish-stack_top,
             'unrelatedDragPlanesClearShared5Mm':diagonal_separation-bar-setting,
             'samePlaneWingPairClearShared5Mm':mixed,'alongOneSignClearShared5Mm':own_clear,
             'alongOneSignClearIndependent10Mm':own_clear-5,
             'uprightScreenClearShared5Mm':upright,
             'commonJig':'Two opposed groups on each arm. Same level swaps signs on adjoining wings; each plane deliberately touches the intervening H28 at crossings. 5 mm total relative setting is binding.',
             'wallLongitudinalTrial':section_gap_one_arm()},
    'lateralClosure':{'ownerHistoricalForceKN':force,'normalCompressionReturnKN':return_compression,
                      'minimumAreaAtDeclaredCrackedStrutMM2':return_compression*1000/strut_screen,
                      'meanOnAdverseCommonWallFaceMPa':return_compression*1000/(850*(stack_top-soffit-10)*.75),
                      'momentAboutWidenedMidPlaneKNm':force*(normal_u+70)/2000,
                      'momentAboutUnchangedGroundAxisU0KNm':force*normal_u/1000,
                      'scope':'No friction credit. Normal return balances at the same V centroid. Mean pressure only. The resulting torque, transition into the 140 stem and real L-ground stability splice are unproved.'},
    'retainedNWPort':{'axisUVAndDiameterMm':[port_u,port_v,port_diameter], 'levels':port_clearances,
                      'admitted':False},
    'gravity':{'directBearingURangeMm':[-30,70],'records':[gravity(n) for n in ('NW-W','NE')]},
    'groundAlternative':{'retainedNorthCornerAndToeCapIDs':
                         [h['id'] for h in grid['heads'] if h['id'] in ('P07','P08','P09','P10','P11','P12')],
                         'insidePlanGapToSmallestCapAfter5Mm':300-normal_u-5,
                         'outsidePlanGapToSmallestCapAfter5Mm':300-70-5,
                         'scope':'Plan-only alternative with actual continuous widened body onto a redesigned imperforate DPC plate and cap. Existing shallow node, anchors and soil capacities are not transferred.'},
}
assert all(min(h['capXY'])>=600 for h in grid['heads'] if h['id'] in num['groundAlternative']['retainedNorthCornerAndToeCapIDs'])
assert min(own_clear,mixed,*upright.values())>=place
assert own_clear-5<place
assert all(level['minimumClearToFormedEdgeAfter5Mm'] < 0 for level in port_clearances)
assert stack_top-soffit==228 and finish-stack_top==37
assert section_gap_one_arm()['minimumUnrelatedGapMm']>=place
assert num['straightDrag']['coverToActualToeEndAfter5mm']>=cover

def diagram():
    ink = []
    def line(x1,y1,x2,y2,role):
        ink.append(f'<path d="M{x1:g} {y1:g}L{x2:g} {y2:g}" class="{role}"/>')
    def box(x,y,w,h,role):
        ink.append(f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" class="{role}"/>')
    def circle(x,y,r,role):
        ink.append(f'<circle cx="{x:g}" cy="{y:g}" r="{r:g}" class="{role}"/>')
    def label(x,y,words,role='note'):
        ink.append(f'<text x="{x:g}" y="{y:g}" class="{role}">{words}</text>')

    box(0,0,420,297,'paper')
    label(14,20,'North collector · opposed straight steel','title')
    label(14,30,'Northwest trial · existing port retained in red · print at actual A3 size.')
    line(14,37,406,37,'rule')
    for x, sign, heading in [(17,1,'Lower group at Z3260 · 1:10'),(148,-1,'Upper group at Z3308 · 1:10')]:
        y=58
        def plan(u,v):
            return x+(u+70)/10,y+(v+70)/10
        label(x,47,heading,'head')
        box(x,y,100,24,'concrete')
        box(x,y+24,24,76,'concrete')
        line(*plan(170,170),*plan(170,930),'face')
        line(*plan(170,170),*plan(930,170),'face')
        for group in (drag(sign),drag(-sign,True)):
            for a,b in group:
                line(*plan(*a[:2]),*plan(*b[:2]),'steelPlan')
        circle(*plan(port_u,port_v),port_diameter/20,'port')
        mark=num['retainedNWPort']['levels'][0 if sign==1 else 1]['minimumClearToFormedEdgeAfter5Mm']
        label(x,170,f'Formed Ø{port_diameter} port clash: {-mark:.2f} mm with setting')
        label(x,178,'Both wing directions shown. Positive axes into the room.')
        line(x,184,x+50,184,'rule')
        label(x,190,'500 mm')
    line(270,42,270,208,'rule')
    label(285,47,'Local floor section · 1:5','head')
    base,datum=288,139
    def sx(u):
        return base+(u+70)/5
    def sz(z):
        return datum-(z-soffit)/5
    box(sx(-70),sz(stack_top),(170+70)/5,(stack_top-soffit)/5,'concrete')
    box(sx(-70),sz(soffit),(170+70)/5,25,'concrete')
    box(sx(170),sz(stack_top),32,(stack_top-soffit)/5,'slab')
    line(sx(170),sz(stack_top),sx(170),sz(soffit),'face')
    line(sx(-30),sz(soffit),sx(70),sz(soffit),'seat')
    for z,d in zip(heights,[12,12,20,28,20,12,12]):
        circle(sx(196),sz(z),d/10,'steelSection')
    line(sx(25),sz(finish),sx(265),sz(finish),'rule')
    label(373,sz(finish)+1,'Z3435 finish underside')
    label(373,sz(stack_top)+1,'Z3398 local slab top')
    label(373,sz(soffit)+1,'Z3170 soffit')
    label(287,174,'100 mm gravity seat centred over the old core.')
    label(287,182,'Dash marks the roomward wall face at U170.')
    label(287,190,'Lower and upper diagonal bars bear against H28 chord.')
    line(14,206,406,206,'rule')
    label(14,223,'Release conditions','head')
    label(14,234,'Retire the northwest port through an independent foul route before making this cage.')
    label(14,244,'Prove the widened body, full chord, round ties and imperforate DPC splice as one force path.')
    label(14,254,'This section screens geometry and isolated loads. Ground, roof and whole-house checks remain open.')
    label(14,280,'Plan coordinates U/V and levels Z are in millimetres.')
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-labelledby="title">\n'
            '<title id="title">Opposed straight collector reinforcement and retained port</title>\n'
            '<style>.paper{fill:#f8f4eb}.rule,.face,.steelPlan,.seat{fill:none;stroke:#5b554c;stroke-width:.4}'
            '.face{stroke-dasharray:1 1}.concrete,.slab{fill:#dcd8cf;stroke:#777166;stroke-width:.3}.slab{fill:#e9e4db}'
            '.steelPlan{stroke:#244658;stroke-width:2;stroke-linecap:round}.steelSection,.seat{fill:#244658;stroke:#244658;stroke-width:.65}'
            '.port{fill:#a94d42;fill-opacity:.20;stroke:#a94d42;stroke-width:.7}.title{font:8px Georgia;fill:#302a24}'
            '.head{font:4.8px Georgia;fill:#302a24}.note{font:3.5px Arial;fill:#514639}</style>\n'
            +'\n'.join(ink)+'</svg>\n')


target=home/'floor-portal-monolithic-drag.json'
text=dumps(num,indent=2,sort_keys=True)+'\n'
for output,data in [(target,text),(target.with_suffix('.svg'),diagram())]:
    if '--check' in argv:
        assert output.read_text()==data, output
    else:
        output.write_text(data)
