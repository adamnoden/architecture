"""Source-only separated-floor bearing geometry and ordinary three-constraint statics.
No native house solve, contact response, resistance or owner acceptance occurs here.
"""
import argparse,ast,copy,hashlib,json,math,re
from itertools import product
from pathlib import Path
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[3]
D=Path(__file__).parent
INPUT=D/'separated-floor-bearing-inputs.json'
CORNERS=(('SW','P01',1,1),('SE','P04',-1,1),('NW','P07',1,-1),('NE','P10',-1,-1))

def sha(b):return hashlib.sha256(b).hexdigest()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def area(r):return max(0.,r[2]-r[0])*max(0.,r[3]-r[1])
def intersection(a,b):
    r=[max(a[0],b[0]),max(a[1],b[1]),min(a[2],b[2]),min(a[3],b[3])]
    return r if area(r)>0 else None

def union_area(rects):
    if not rects:return 0.
    xs=sorted({r[i] for r in rects for i in (0,2)});ys=sorted({r[i] for r in rects for i in (1,3)})
    return math.fsum((x1-x0)*(y1-y0) for x0,x1 in zip(xs,xs[1:]) for y0,y1 in zip(ys,ys[1:])
        if any(r[0]<=(x0+x1)/2<=r[2] and r[1]<=(y0+y1)/2<=r[3] for r in rects))

def intersect_area(rects,rectangle):
    return union_area([p for r in rects if (p:=intersection(r,rectangle))])

def uncovered_area(rectangles,supports):
    return math.fsum(area(r)-intersect_area(supports,r) for r in rectangles)

def transform(r,origin,sx,sy):
    xs=sorted((origin[0]+sx*r[0],origin[0]+sx*r[2]));ys=sorted((origin[1]+sy*r[1],origin[1]+sy*r[3]))
    return [xs[0],ys[0],xs[1],ys[1]]

def load():
    settings=json.loads(INPUT.read_bytes());raw={}
    for path,expected in settings['sourceGitBlobs'].items():
        data=(ROOT/path).read_bytes()
        if blob(data)!=expected:raise ValueError('Changed actual controlling source: '+path)
        raw[path]=data
    if settings['schema']!='str-separated-floor-bearing-inputs/1' or settings['status']!='UNCALCULATED OWNER COMPARISON':
        raise ValueError('Explicit uncalculated comparison required')
    return settings,raw

def source_wind(raw,index,axes):
    path='project/str/studies/distributed_floor_compatibility.py'
    tree=ast.parse(raw[path]);found=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='_native_floor_wind']
    if len(found)!=1:raise ValueError('Actual native floor pressure primitive unavailable')
    namespace={'ast':ast,'product':product}
    exec(compile(ast.Module(body=found,type_ignores=[]),path,'exec'),namespace)
    return namespace['_native_floor_wind']({'windMethodText':raw['project/str/studies/current-house-roof-bracing.py'].decode()},index,axes)

def three_constraints(wrench,points):
    fx,fy,mz=wrench
    a,b,c=points
    lever=(c[1]-a[1])/1000
    if abs(lever)<1e-6:raise ValueError('Guide needs a real torsion lever')
    rx_c=(mz+a[1]/1000*fx-b[0]/1000*fy)/lever
    rx_a=-fx-rx_c;ry_b=-fy
    residual=[fx+rx_a+rx_c,fy+ry_b,mz-a[1]/1000*rx_a+b[0]/1000*ry_b-c[1]/1000*rx_c]
    return {'onFloorKN':[rx_a,ry_b,rx_c],'equilibriumResidualKN_KNm':residual,'torsionLeverMm':lever*1000}

def derive(settings,raw):
    proposal=settings['proposal']
    if proposal['horizontalConstraints']!=[{'id':'SW-X','corner':'SW','face':'west','normalAxis':'x'},{'id':'SW-Y','corner':'SW','face':'south','normalAxis':'y'},{'id':'NW-X','corner':'NW','face':'west','normalAxis':'x'}]:
        raise ValueError('This bounded comparison supports exactly the declared three physical constraint locations')
    working=json.loads(raw['project/ccr/studies/working-house-comparison.json'])
    h=json.loads(raw['project/had/studies/water-replan.json'])['model']
    grid=json.loads(raw['project/str/studies/current-house-grid.json'])
    collector=json.loads(raw['project/str/studies/floor-portal-monolithic-drag.json'])['geometry']
    widths=working['stages']['distributedFloor']['cornerWidthsMm']
    if set(widths)!=set(x[0] for x in CORNERS) or set(widths.values())!={200} or working['stages']['floorSection']['thicknessMm']!=200:
        raise ValueError('This comparison requires the actual saved all-four L200 and RC200 floor')
    low=collector['wallUAndLegVLimitsMm'][0][0];end=collector['wallUAndLegVLimitsMm'][1][1]
    bottom,top=collector['soffitAndOrdinarySlabTopZMm'];base=h['sections']['groundSupport']['top']
    if (bottom,top)!=(h['sections']['firstFloorRC']['bottom'],h['sections']['firstFloorRC']['top']):
        raise ValueError('Actual shared native slab datums differ')
    gap=proposal['isolationGapMm'];thickness=proposal['masonryWidthMm'];finish=proposal['wallFinishMm']
    if any(type(x) not in (int,float) or not math.isfinite(x) or x<=0 for x in (gap,thickness,finish)):
        raise ValueError('Positive finite prospective physical dimensions required')
    inner=low+200;seat_low=inner+gap;seat_end=end+proposal['extraLeafEndGapMm']
    # Includes clearance at the inner faces and the actual RC leaf ends. The
    # outer envelope beyond the slab is not relabelled floor material.
    slit_local=[[low,low,seat_low,seat_end],[seat_low,low,seat_end,seat_low]]
    masonry_local=[[seat_low,seat_low,seat_low+thickness,seat_end],
                   [seat_low+thickness,seat_low,seat_end,seat_low+thickness]]
    old_finish=[[low,low,inner+finish,end+finish],[inner+finish,low,end+finish,inner+finish]]
    new_finish=[[low,low,seat_low+thickness+finish,seat_end+finish],
                [seat_low+thickness+finish,low,seat_end+finish,seat_low+thickness+finish]]
    supports=[]
    for name,g in grid['girders'].items():
        if not name.startswith('outer-'):continue
        lo,hi=g['extent'];d=g['datum'];half=g['width']/2
        rectangle=[lo,d-half,hi,d+half] if g['axis']=='x' else [d-half,lo,d+half,hi]
        supports.append({'id':name,'rectangleXYMm':rectangle,'zMm':g['z']})
    context=raw['compiler/reference-house/current-design/assemblies/study-structural-context.ts'].decode()
    desk_shift=float(re.search(r'const deskEastShiftMm=(\d+)',context).group(1))
    placement=float(re.search(r'const placementGridMm=(\d+)',context).group(1))
    emitter_clear=float(re.search(r'emitterEndClearanceMm=(\d+)',context).group(1))
    floors={}
    for level,field in (('GROUND','groundFurniture'),('FIRST','upperFurniture')):
        floors[level]={k:[r[0],r[1],r[0]+r[2],r[1]+r[3]] for k,r in h[field].items()}
    floors['GROUND']['study-desk'][0]+=desk_shift;floors['GROUND']['study-desk'][2]+=desk_shift
    toe=grid['heads'][0]['xy'][1]+end+finish
    emitter=floors['GROUND']['service-emitter-study-W']
    emitter_shift=max(0.,math.ceil((toe+emitter_clear-emitter[1])/placement)*placement)
    emitter[1]+=emitter_shift;emitter[3]+=emitter_shift
    rows=[];room_min=h['envelope'];room=[room_min,room_min,h['shell']-room_min,h['shell']-room_min]
    for name,head,sx,sy in CORNERS:
        origin=next(p['xy'] for p in grid['heads'] if p['id']==head)
        world=lambda r:transform(r,origin,sx,sy)
        masonry=list(map(world,masonry_local));old=list(map(world,old_finish));new=list(map(world,new_finish))
        rc=list(map(world,[[low,low,inner,end],[inner,low,end,inner]]))
        ground_conflicts=[];upper_existing=[]
        for identifier,r in floors['GROUND'].items():
            old_area=intersect_area(old,r);new_area=intersect_area(new,r)
            if new_area>0:ground_conflicts.append({'id':identifier,'boxXYMm':r,'existing200ConflictMm2':old_area,
                'prospectiveConflictMm2':new_area,'additionalConflictMm2':new_area-old_area})
        for identifier,r in floors['FIRST'].items():
            old_area=intersect_area(old,r)
            if old_area>0:upper_existing.append({'id':identifier,'boxXYMm':r,'existing200ConflictMm2':old_area})
        used=[s for s in supports if any(intersection(r,s['rectangleXYMm']) for r in masonry)]
        missing=uncovered_area(masonry,[s['rectangleXYMm'] for s in used])
        if missing>1e-5:raise ValueError(name+' has masonry off actual ground girder footprint: '+str(missing))
        margins=[]
        for s in used:
            axis=grid['girders'][s['id']]['axis'];normal=1 if axis=='x' else 0;r=s['rectangleXYMm']
            for m in masonry:
                if intersection(m,r):margins.append(min(m[normal]-r[normal],r[normal+2]-m[normal+2]))
        # Do not credit a margin from an unrelated crossing: each actual long arm
        # has a complete corresponding girder, independently of its corner cap.
        own_vertical=next(s for s in supports if s['id']==('outer-W' if sx==1 else 'outer-E'))
        own_horizontal=next(s for s in supports if s['id']==('outer-S' if sy==1 else 'outer-NW' if sx==1 else 'outer-NE'))
        arm_margins=[]
        for local,s in zip(masonry_local,(own_vertical,own_horizontal)):
            m=world(local);r=s['rectangleXYMm'];axis=0 if s is own_vertical else 1
            if area(m)-intersect_area([r],m)>1e-5:raise ValueError('Actual complete girder needed under '+name+' arm')
            arm_margins.append(min(m[axis]-r[axis],r[axis+2]-m[axis+2]))
        new_area=union_area(masonry)
        opening_edges=[]
        for wall,axis,sign in [('outer-'+('south' if sy==1 else 'north'),0,sx),('outer-'+('west' if sx==1 else 'east'),1,sy)]:
            candidates=[]
            for opening in h['archOpeningRegister']['GROUND']:
                if opening['wall']!=wall:continue
                ends=[(opening['centre']-opening['width']/2-origin[axis])*sign,(opening['centre']+opening['width']/2-origin[axis])*sign]
                edge=min(ends)
                if edge>end:candidates.append((edge,opening))
            edge,opening=min(candidates,key=lambda x:x[0])
            opening_edges.append({'id':opening['id'],'wallId':wall,'rawEdgeLocalMm':edge,
                'rawEdgeGlobalMm':origin[axis]+sign*edge,'rawReserveAfterMasonryEndMm':edge-seat_end,
                'finishedToeReserveMm':edge-seat_end-finish})
        rows.append({'corner':name,'headId':head,'originXYMm':origin,'signXY':[sx,sy],
            'rcRectanglesXYMm':rc,'isolationFootprintXYMm':list(map(world,slit_local)),
            'masonrySeatRectanglesXYMm':masonry,'existingFinishedReserveXYMm':old,'proposedGroundFinishedReserveXYMm':new,
            'groundGirderIds':[own_vertical['id'],own_horizontal['id']],'groundGirderZMm':own_vertical['zMm'],
            'missingGroundBearingAreaMm2':missing,'completeArmGroundEdgeMarginsMm':arm_margins,
            'newLowerBodyAreaMm2':new_area,'newLowerBodyEnvelopeVolumeM3':new_area*(bottom-base)/1e9,
            'newLowerBodyEnvelopeComparisonGKN':new_area*(bottom-base)/1e9*proposal['lowerBodyComparisonUnitWeightKNPerM3'],
            'addedGroundFinishedAreaLossM2':(intersect_area(new,room)-intersect_area(old,room))/1e6,
            'groundCurrentFurnitureConflicts':ground_conflicts,'firstExisting200Conflicts':upper_existing,
            'nearestRawOuterOpenings':opening_edges,'newFirstGravityWallAdded':False,'upperRCLateralWallRemainsAligned':True})
    fixed_x=next(r for r in rows if r['corner']=='SW')['originXYMm'][0]+inner
    fixed_y=next(r for r in rows if r['corner']=='SW')['originXYMm'][1]+inner
    along=proposal['interfaceAlongFromOuterCornerMm']
    point_a=[fixed_x,rows[0]['originXYMm'][1]+low+along]
    point_b=[rows[0]['originXYMm'][0]+low+along,fixed_y]
    nw=next(r for r in rows if r['corner']=='NW')
    point_c=[fixed_x,nw['originXYMm'][1]-low-along]
    points=[point_a,point_b,point_c]
    axes={'A':grid['heads'][0]['xy'][0],'B':next(p['xy'][0] for p in grid['heads'] if p['id']=='P10')}
    winds=[]
    for index in range(96):
        actual=source_wind(raw,index,axes);force=[0.,0.];moment=0.
        for row in actual['rows']:
            f=row['forceKN'];p=row['pointXYZMm'];force[0]+=f[0];force[1]+=f[1]
            moment+=(p[0]*f[1]-p[1]*f[0])/1000
        response=three_constraints([*force,moment],points)
        mid=(bottom+top)/2
        physical=[0.]*6
        for row in actual['rows']:
            p=row['pointXYZMm'];fx,fy,fz=row['forceKN']
            for i,v in enumerate((fx,fy,fz,(p[1]*fz-p[2]*fy)/1000,(p[2]*fx-p[0]*fz)/1000,(p[0]*fy-p[1]*fx)/1000)):physical[i]+=v
        remaining=list(physical)
        for p,(fx,fy) in zip(points,((response['onFloorKN'][0],0.),(0.,response['onFloorKN'][1]),(response['onFloorKN'][2],0.))):
            for i,v in enumerate((fx,fy,0.,-mid*fy/1000,mid*fx/1000,(p[0]*fy-p[1]*fx)/1000)):remaining[i]+=v
        response.update(sourcePressureWrenchAboutOriginKN_KNm=physical,
            horizontalReactionHeightZMm=mid,remainingWrenchForVerticalFloorBearingKN_KNm=remaining)
        winds.append({'windIndex':index,'sourcePressure':actual,'appliedFloorWrenchFxFyMzKN_KNm':[*force,moment],**response})
    thermal=proposal['thermalIllustration'];strain=thermal['expansionPerK']*thermal['temperatureChangeK']
    thermal_constraints=[strain*(point_a[0]-fixed_x),strain*(point_b[1]-fixed_y),strain*(point_c[0]-fixed_x)]
    return {'schema':'str-separated-floor-bearing-comparison/1','status':'UNCALCULATED OWNER COMPARISON',
        'sourceCommit':settings['sourceCommit'],'sourceGitBlobs':settings['sourceGitBlobs'],'proposal':proposal,
        'slabZMm':[bottom,top],'groundSeatZMm':base,'firstFFLMm':h['sections']['firstFFL'],
        'newGroundFinishedFaceSWMm':rows[0]['originXYMm'][0]+seat_low+thickness+finish,
        'oldFinishedFaceSWMm':rows[0]['originXYMm'][0]+inner+finish,
        'rawFirstOuterOpeningStartsMm':rows[0]['nearestRawOuterOpenings'][0]['rawEdgeGlobalMm'],'newFinishedToeSWMm':rows[0]['originXYMm'][0]+seat_end+finish,
        'newLowerBodyEnvelopeComparisonGKN':math.fsum(r['newLowerBodyEnvelopeComparisonGKN'] for r in rows),
        'newLowerBodyWeightIsNetGChange':False,
        'addedGroundFinishedAreaLossM2':math.fsum(r['addedGroundFinishedAreaLossM2'] for r in rows),
        'allNewCornerGravityFootprintsOnActualGroundGirders':True,'newFirstGravityWallsAdded':False,
        'corners':rows,'horizontalConstraintPointsXYMm':points,'horizontalConstraintIds':['SW-X','SW-Y','NW-X'],
        'sourceFloorPressureOnlyStatics':winds,
        'maximumAbsoluteThreeConstraintForceKN':[max(abs(w['onFloorKN'][i]) for w in winds) for i in range(3)],
        'maximumUnclosedOutOfPlanePressureMomentKNm':max(abs(w['remainingWrenchForVerticalFloorBearingKN_KNm'][i]) for w in winds for i in (3,4)),
        'maximumThreeConstraintFloorPressureEquilibriumResidualKN_KNm':max(abs(x) for w in winds for x in w['equilibriumResidualKN_KNm']),
        'thermalIllustration':{'assumedUniformStrain':strain,'fixedExpansionOriginXYMm':[fixed_x,fixed_y],
            'threeConstraintResidualMm':thermal_constraints,'NEFreeMovementXYMm':[strain*((next(r for r in rows if r['corner']=='NE')['originXYMm'][0]-inner)-fixed_x),strain*((next(r for r in rows if r['corner']=='NE')['originXYMm'][1]-inner)-fixed_y)],
            'temperatureAndExpansionAreSelectedForIllustrationOnly':True},
        'fullHouseReactionsCalculated':False,'physicalShearConnectionsQualified':False,'floorBearingOrAnchorageResistanceAccepted':False,
        'allFourFiniteJointsResolved':False,'ownerAccepted':False,
        'sourceFloorWindFunctionUse':'Actual named native AST function, executed without its module imports or any solver; exact recipe admission retained. These are rigid-diaphragm necessary statics only, not floor deformation/global reactions.',
        'unclosed':['Actual seat/bond/rotation/cracking and direct-bearing floor edge anchorage','Three physical all-metal horizontal connections: gap/reversal, guide/vertical travel, friction or seizure, local RC/steel anchorage and finite rotational stiffness','Actual masonry bearing/slenderness/restraint plus new full-height DPC/material/finish detail','All52-head native load redistribution, all4local finite interfaces, new source-bound signed programme and unchanged/adverse controls','Concrete/floor/gap/material union mass and six-wrench ledger; added body envelopeG is not netG','Source-specific ground/upper furniture, services, reveal/arch, finish and renewal replans; no service embedded or deleted'],
        'scope':'Geometry and necessary floor-pressure equilibrium only. No cantilever or site capacity is borrowed; complete house support, response, strength, material, physical and owner acceptance remain open.'},h,grid,floors

class Svg:
    def __init__(self,w,h,title):
        self.a=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{escape(title)}</title>',
            '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto-start-reverse"><path d="M0 0 L6 3 L0 6" fill="#23714e"/></marker></defs>',
            '<rect width="100%" height="100%" fill="#fff"/>',
            '<style>text{font-family:Arial,sans-serif;fill:#252b30}.title{font-size:27px;font-weight:700}.sub{font-size:18px;font-weight:700}.note{font-size:15px}.small{font-size:12px}.red{fill:#a1262f}.blue{fill:#315c86}.gold{fill:#896a20}</style>']
    def rect(self,x,y,w,h,fill,stroke='#87929c',extra=''):
        if w>0 and h>0:self.a.append(f'<rect x="{x:.3f}" y="{y:.3f}" width="{w:.3f}" height="{h:.3f}" fill="{fill}" stroke="{stroke}" {extra}/>')
    def line(self,x,y,X,Y,stroke='#66717b',extra=''):
        self.a.append(f'<line x1="{x:.3f}" y1="{y:.3f}" x2="{X:.3f}" y2="{Y:.3f}" stroke="{stroke}" {extra}/>')
    def text(self,x,y,text,cls='note',extra=''):
        self.a.append(f'<text x="{x:.3f}" y="{y:.3f}" class="{cls}" {extra}>{escape(str(text))}</text>')
    def finish(self):return '\n'.join(self.a+['</svg>'])+'\n'

def plan_svg(value,h,grid,floors):
    s=Svg(1500,1130,'Actual all-four-corner separated bearing comparison')
    s.text(45,40,'Separate floor bearing from continuous RC lateral walls','title')
    s.text(45,69,'UNCALCULATED OWNER COMPARISON · same saved house coordinates · source5ab92bc0','sub red')
    scale=.044;origins={'GROUND':(65,118),'FIRST':(805,118)}
    clashes=[]
    for level,(ox,oy) in origins.items():
        s.text(ox,oy-17,level+' — '+('new inner masonry seats; current furniture shown' if level=='GROUND' else 'continuous200RC; no new140wall above slab'),'sub')
        point=lambda x,y:(ox+x*scale,oy+(12000-y)*scale)
        def box(r,fill,stroke='#a6adb3',extra=''):
            x,y=point(r[0],r[3]);s.rect(x,y,(r[2]-r[0])*scale,(r[3]-r[1])*scale,fill,stroke,extra)
        box([0,0,12000,12000],'#fafaf7','#424d55')
        if level=='GROUND':
            for g in grid['girders'].values():
                lo,hi=g['extent'];d=g['datum'];half=g['width']/2
                r=[lo,d-half,hi,d+half] if g['axis']=='x' else [d-half,lo,d+half,hi]
                box(r,'none','#b5bec5','stroke-dasharray="3 3" opacity=".48"')
        court=h['court'];box([court[0],court[1],court[0]+court[2],court[1]+court[3]],'#fff','#87929c')
        x,y=point(6000,6000);s.text(x-30,y,'COURT','small')
        for wall in h['groundWalls' if level=='GROUND' else 'upperWalls']:
            a,b=wall['a'],wall['b'];core=wall['structuralCore']
            r=[min(a[0],b[0]),core[0],max(a[0],b[0]),core[1]] if a[0]!=b[0] else [core[0],min(a[1],b[1]),core[1],max(a[1],b[1])]
            box(r,'#dfe2e3','#a0a8ae')
        for c in value['corners']:
            for r in c['rcRectanglesXYMm']:box(r,'#7398b9','#315c86')
            if level=='GROUND':
                for r in c['masonrySeatRectanglesXYMm']:box(r,'#e5c773','#896a20')
                for r in c['proposedGroundFinishedReserveXYMm']:box(r,'none','#896a20','stroke-dasharray="3 2"')
            x,y=point(*c['originXYMm']);s.text(x+7,y-7,c['corner'],'small blue')
        for identifier,r in floors[level].items():
            rows=[p for c in value['corners'] for p in c['groundCurrentFurnitureConflicts' if level=='GROUND' else 'firstExisting200Conflicts']]
            bad=next((p for p in rows if p['id']==identifier),None)
            box(r,'#f4dddf' if bad else '#eef0f1','#b14850' if bad else '#b8bfc5')
            if bad and level=='GROUND':
                number=len(clashes)+1;clashes.append((number,identifier,bad['existing200ConflictMm2']>0))
                x,y=point((r[0]+r[2])/2,(r[1]+r[3])/2);s.text(x,y,number,'small red')
        if level=='GROUND':
            for index,p in enumerate(value['horizontalConstraintPointsXYMm']):
                x,y=point(*p)
                s.line(x-17 if index!=1 else x,y if index!=1 else y+17,x+17 if index!=1 else x,y if index!=1 else y-17,'#23714e','stroke-width="3" marker-end="url(#arrow)"')
            for name,label in [('SW','A: X + Y'),('NW','B: X only'),('SE','inplane free'),('NE','inplane free')]:
                c=next(c for c in value['corners'] if c['corner']==name);x,y=point(*c['originXYMm'])
                s.text(x+15 if c['signXY'][0]>0 else x-115,y+40 if c['signXY'][1]<0 else y-38,label,'small')
        s.text(ox,682,'12,000mm source envelope · solid outlines are actual source wall/furniture context','small')
    s.rect(48,710,1400,1,'#c0c7cc','#c0c7cc')
    s.text(50,746,'Space and interfaces that the new topology costs','sub')
    s.text(50,775,'Blue: continuousRC200   Gold: separate140masonry bearing   Dashed: actual ground grid / new finished reserve','note')
    s.text(50,802,f'Ground finished face{value["oldFinishedFaceSWMm"]:g} → {value["newGroundFinishedFaceSWMm"]:g}mm: +{value["newGroundFinishedFaceSWMm"]-value["oldFinishedFaceSWMm"]:g}mm projection; +{value["addedGroundFinishedAreaLossM2"]:.4f}m² ground area lost.','note')
    s.text(50,829,f'New lower-body envelopeG +{value["newLowerBodyEnvelopeComparisonGKN"]:.4f}kN at{value["proposal"]["lowerBodyComparisonUnitWeightKNPerM3"]:g}kN/m³; floor/gap/bed replacement ledger still required.','note')
    s.text(50,859,'Red numbered items need an actual room/service replan; * already conflicts with the source200RC reserve.','note red')
    for i,(number,name,old) in enumerate(clashes):
        col=i%2;row=i//2
        s.text(50+col*710,889+row*25,f'{number}. {name}'+(' *' if old else ''),'note red')
    s.text(50,1030,'FIRST: unchanged upperRC footprint is not a room pass. Existing rear cabinet conflict remains visible.','note red')
    s.text(50,1057,'No permanent service is chased, buried or silently deleted. Floor finish and all136-piece renewal witnesses must regenerate.','note')
    s.text(50,1084,'All four new local interfaces, whole-house redistribution, physical shear details and owner appearance remain OPEN.','sub red')
    return s.finish()

def section_svg(value,h,grid):
    s=Svg(1500,1090,'Source-derived corner bearing plan and actual-level section')
    s.text(45,40,'A direct seat below; a continuous lateral wall beside it','title')
    s.text(45,69,'UNCALCULATED · geometry shown; no hidden moment pin, friction capacity or bearing product selected','sub red')
    c=value['corners'][0];scale=.39;ox,oy=50,135
    rc_low=c['rcRectanglesXYMm'][0][0];rc_inner=c['rcRectanglesXYMm'][0][2]
    seat_low=c['masonrySeatRectanglesXYMm'][0][0];seat_inner=c['masonrySeatRectanglesXYMm'][0][2]
    old_face=value['oldFinishedFaceSWMm'];new_face=value['newGroundFinishedFaceSWMm']
    toe=value['newFinishedToeSWMm'];raw_open=value['rawFirstOuterOpeningStartsMm']
    gap=value['proposal']['isolationGapMm'];wall_width=value['proposal']['masonryWidthMm'];finish=value['proposal']['wallFinishMm']
    floor_bottom,floor_top=value['slabZMm'];ground_top=value['groundSeatZMm']
    beam=grid['girders'][c['groundGirderIds'][0]];beam_far=beam['datum']+beam['width']/2;beam_bottom=beam['z'][0]
    p=lambda x,y:(ox+(x-200)*scale,oy+(1500-y)*scale)
    def planbox(r,fill,stroke,extra=''):
        x,y=p(r[0],r[3]);s.rect(x,y,(r[2]-r[0])*scale,(r[3]-r[1])*scale,fill,stroke,extra)
    s.text(50,112,'SW ground corner plan — actual millimetres','sub')
    for name in c['groundGirderIds']:
        g=grid['girders'][name];lo,hi=g['extent'];d=g['datum'];half=g['width']/2
        r=[max(200,lo),max(200,d-half),1500,min(1500,d+half)] if g['axis']=='x' else [max(200,d-half),max(200,lo),min(1500,d+half),1500]
        planbox(r,'#f4f5f6','#adb6bd','stroke-dasharray="5 4"')
    for r in c['isolationFootprintXYMm']:planbox(r,'#fff','#c6cbcf')
    for r in c['rcRectanglesXYMm']:planbox(r,'#7398b9','#315c86')
    for r in c['masonrySeatRectanglesXYMm']:planbox(r,'#e5c773','#896a20')
    for r in c['existingFinishedReserveXYMm']:planbox(r,'none','#315c86','stroke-dasharray="3 3"')
    for r in c['proposedGroundFinishedReserveXYMm']:planbox(r,'none','#896a20','stroke-dasharray="3 3"')
    for i,key in enumerate(value['horizontalConstraintPointsXYMm'][:2]):
        x,y=p(*key);s.rect(x-5,y-5,10,10,'#fff','#a1262f','stroke-width="2"')
    x,y=p(1250,raw_open);s.text(x-130,y-10,f'Raw window starts{raw_open:g}','small')
    x,y=p(1250,value['newFinishedToeSWMm']);s.line(x,y,x+40,y,'#a1262f','stroke-width="2"')
    s.text(50,680,f'RC{rc_low:g}..{rc_inner:g} | nominal gap{gap:g} | new masonry{seat_low:g}..{seat_inner:g}','note')
    s.text(50,707,f'Ground face with{finish:g}finish:{new_face:g}; new finished toe{toe:g}','note')
    s.text(50,734,f'Only{raw_open-toe:g}mm nominal to first raw window: reveal/tolerance replan OPEN.','note red')
    s.text(50,761,f'Both full{wall_width:g}mm arms sit on the real{beam["width"]:g}mm ground girders.','note')
    s.text(50,788,f'Minimum transverse edge margin{min(c["completeArmGroundEdgeMarginsMm"]):g}mm; no new pile or floating cap.','note')
    s.text(50,815,'Ground load is distributed onto the beams, not assigned wholly toP01.','note')
    s.text(50,856,'Three horizontal constraints, using two real western cores:','sub')
    s.text(50,884,'A / SW: X + Y.   B / NW: X only; allow Y movement.','note')
    s.text(50,911,'SE / NE: inplane free. All interfaces permit vertical slip and rotation.','note')
    s.text(50,938,'Wind reversal needs captive opposed faces; actual gaps and engagement OPEN.','note red')
    s.text(50,965,f'Uniform thermal origin{value["thermalIllustration"]["fixedExpansionOriginXYMm"]}; four tight keys avoided.','note')
    s.text(50,992,'No plasticPTFE, resin anchorage or friction resistance is admitted.','note')
    # Section uses explicit independent scales so long ground-to-floor height and
    # narrow wall/seat can both be read. All dimensions are labelled; NTS.
    ox,oy=800,135;sx,sz=.63,.139
    q=lambda x,z:(ox+(x-200)*sx,oy+(4500-z)*sz)
    def secbox(x0,z0,x1,z1,fill,stroke):
        x,y=q(x0,z1);s.rect(x,y,(x1-x0)*sx,(z1-z0)*sz,fill,stroke)
    s.text(800,112,'West-leaf section at interface — NTS','sub')
    secbox(rc_low,ground_top,rc_inner,4400,'#7398b9','#315c86')
    secbox(seat_low,ground_top,seat_inner,floor_bottom,'#e5c773','#896a20')
    secbox(seat_low,floor_bottom,1230,floor_top,'#dce6ef','#315c86')
    secbox(seat_inner,ground_top,new_face,floor_bottom,'#f2e6c2','#896a20')
    secbox(rc_inner,floor_top,old_face,4400,'#dce6ef','#315c86')
    secbox(200,beam_bottom,beam_far,ground_top,'#d5dadd','#6b7680')
    # Existing beam extends to -17.5; clipped viewport is explicitly labelled.
    for z,label in [(value['firstFFLMm'],'FIRST'+str(value['firstFFLMm'])),(floor_top,'RC top'+str(floor_top)),(floor_bottom,'seat / soffit'+str(floor_bottom)),(ground_top,'grid top'+str(ground_top)),(beam_bottom,'beam bottom'+str(beam_bottom))]:
        x,y=q(200,z);s.line(x,y,1450,y,'#a3adb5','stroke-dasharray="3 4"');s.text(1220,y-5,label,'small')
    x,y=q(750,(floor_bottom+floor_top)/2);X,Y=q(rc_inner,(floor_bottom+floor_top)/2)
    s.line(x,y,X,Y,'#a1262f','stroke-width="3" marker-end="url(#arrow)"')
    s.text(1035,240,'H only — physical connection OPEN','small red')
    s.line(1065,247,1050,y,'#a1262f')
    x,y=q((seat_low+seat_inner)/2,3050);X,Y=q((seat_low+seat_inner)/2,2500)
    s.line(x,y,X,Y,'#23714e','stroke-width="4" marker-end="url(#arrow)"')
    s.text(1060,490,'floor normal bearing','note gold')
    s.text(1060,513,f'→{wall_width:g}masonry','note gold')
    s.text(1060,536,'→existing ground girder','note gold')
    x,y=q((rc_low+rc_inner)/2,4000);X,Y=q((rc_low+rc_inner)/2,4350)
    s.line(x,y,X,Y,'#23714e','stroke-width="3" marker-end="url(#arrow)"')
    s.text(800,95,'','small')
    s.text(800,865,'Continuous200RC to roof; ordinary vertical anchorage has storey height.','note blue')
    s.text(800,892,'No new140wall above floor; upperRC remains directly aligned to ground.','note')
    s.text(800,919,'Dry mineral seat / full-height DPC / finishes: constituents and rotation OPEN.','note red')
    s.text(800,946,'Close floor bearing, restraint, edge anchorage and all52-head demands next.','note')
    s.text(800,973,f'Slab stays{floor_top-floor_bottom:g}: top{floor_top:g} leaves{value["firstFFLMm"]-floor_top:g}mm to FIRST{value["firstFFLMm"]:g}.','note')
    s.text(800,1000,'The schematic horizontal arrow is a requirement, not a hidden rigid connection.','note red')
    s.text(50,1050,'No new coupled solve or strength claim. All four finite corner replacements and room replans remain unaccepted.','sub red')
    return s.finish()

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,required=True);a=parser.parse_args()
    settings,raw=load();value,h,grid,floors=derive(settings,raw);a.out.mkdir(parents=True,exist_ok=True)
    value['consumerSourceSHA256']=sha(Path(__file__).read_bytes())
    outputs={'separated-floor-bearing-plan.svg':plan_svg(value,h,grid,floors),
             'separated-floor-bearing-section.svg':section_svg(value,h,grid)}
    for name,svg in outputs.items():ET.fromstring(svg);(a.out/name).write_text(svg)
    value['svgSHA256']={name:sha(svg.encode()) for name,svg in outputs.items()}
    (a.out/'separated-floor-bearing-comparison.json').write_text(json.dumps(value,indent=2,allow_nan=False)+'\n')
    print('SEPARATED_BEARING_SUMMARY '+json.dumps({k:value[k] for k in (
        'sourceCommit','newGroundFinishedFaceSWMm','newFinishedToeSWMm','addedGroundFinishedAreaLossM2','newLowerBodyEnvelopeComparisonGKN',
        'allNewCornerGravityFootprintsOnActualGroundGirders','horizontalConstraintPointsXYMm','maximumAbsoluteThreeConstraintForceKN',
        'maximumThreeConstraintFloorPressureEquilibriumResidualKN_KNm','maximumUnclosedOutOfPlanePressureMomentKNm','thermalIllustration','svgSHA256','fullHouseReactionsCalculated','allFourFiniteJointsResolved')}))
    for name,svg in outputs.items():print('SVG_SOURCE '+name+' '+svg.encode().hex())
if __name__=='__main__':main()
