import ast
import contextlib
import copy
import hashlib
import io
import json
import math
from pathlib import Path
import runpy
import sys

from joined_successor_compatibility import _grid, _wrench_at
from joined_successor_kernel import FrameModel, cross, rectangle_contact_quadrature, rectangle_section
from north_portal_receiving import GAUSS, _material, load_north_receiving_source, portal_geometry
from distributed_floor_compatibility import native_intermediate_support_ports


METHOD = 'project/str/studies/continuous_rc_portal.py'
EXTRA_SOURCES = ('project/str/studies/current-house-head-actions.py','project/str/studies/current-house-spatial-arches.py')
FIELDS = ('schema','sourceSHA256','scheme','gridLaw','frameLaw','dpcLaw','dpcIntervalZMm','coverMm','archSegments','infillHeadGapMm','jointZone','headBoundary','use')


def load_continuous_rc_source(root):
    root = Path(root)
    source = load_north_receiving_source(root)
    return {'root':root,'lower':source,'identities':{**source['identities'],**{path:hashlib.sha256((root/path).read_bytes()).hexdigest() for path in (*EXTRA_SOURCES,METHOD)}}}


def reference_continuous_rc_case(source):
    return {'schema':'str-continuous-rc-portal-case/1','sourceSHA256':source['identities'],
        'scheme':'fullheight-piers-integral-curved-ring-no-tie-no-bore',
        'gridLaw':None,'frameLaw':None,'dpcLaw':None,'dpcIntervalZMm':None,
        'coverMm':None,'archSegments':24,'infillHeadGapMm':30,
        'jointZone':'authored-monolithic-rigid-end-offset-comparison',
        'headBoundary':'source52-ideal-pinned-translations-free-rotations','use':'unqualified-continuous-rc-challenger'}


def _admit(case,source):
    if not isinstance(case,dict) or set(case)!=set(FIELDS):
        raise ValueError('Exact authored continuous RC portal fields required; no injected result or approval')
    expected = reference_continuous_rc_case(source)
    if any(case[key]!=expected[key] for key in ('schema','sourceSHA256','scheme','jointZone','headBoundary','use')):
        raise ValueError('Stale source/method identity or unsupported portal scheme')
    for key in ('gridLaw','frameLaw'):_material(case[key],key)
    law = case['dpcLaw']
    if not isinstance(law,dict) or set(law)!={'mode','normalStiffnessKNPerMm3','shearStiffnessKNPerMm3'} or law['mode']!='authored-bilateral-elastic-comparison' or any(type(law[key]) not in (int,float) or not math.isfinite(law[key]) or law[key]<=0 for key in ('normalStiffnessKNPerMm3','shearStiffnessKNPerMm3')):
        raise ValueError('Explicit finite bilateral DPC law required; compression/tension resistance is not inferred')
    interval=case['dpcIntervalZMm']
    if not isinstance(interval,list) or len(interval)!=2 or any(type(value) not in (int,float) or not math.isfinite(value) for value in interval) or not -180<interval[0]<interval[1]<0:
        raise ValueError('Explicit source-baseline cap-to-ground DPC interval required')
    if type(case['coverMm']) not in (int,float) or not 35<=case['coverMm']<=40:
        raise ValueError('Cover comparison restricted to actual source nominal35/adverse40 mm')
    if type(case['archSegments']) is not int or not 8<=case['archSegments']<=96 or case['archSegments']%2:
        raise ValueError('Even arch subdivision8..96 required')
    if case['infillHeadGapMm']!=30:
        raise ValueError('Only the authored30mm infill headgap belongs to this physical challenger')


def source_action_inventory(source):
    rows=[]
    def observer(category,programme,value,point,nodes):
        total=sum(weight for node,receiving,weight in nodes)
        if abs(total-1)>1e-8:raise ValueError('Native source receiving weights do not conserve force')
        offset=[point[i]-sum(receiving[i]*weight for node,receiving,weight in nodes) for i in (0,1)]
        for node,receiving,weight in nodes:
            if not weight:continue
            if node in ('@outer-north','@court-north') and 4307.5<=receiving[0]<=7692.5:
                rows.append({'category':category,'programme':programme,'valueKN':value*weight,'sourceXYMm':list(point),
                    'wallId':node[1:],'receivingXYMm':list(receiving),'residualOffsetXYMm':offset,'receivingKind':'north-wall'})
            elif node in ('loggia-W','loggia-E') and 8082.5<=receiving[1]<=11667.5:
                rows.append({'category':category,'programme':programme,'valueKN':value*weight,'sourceXYMm':list(point),
                    'wallId':node,'receivingXYMm':list(receiving),'residualOffsetXYMm':offset,'receivingKind':'unresolved-loggia-sidewall'})
    old=sys.argv[:]
    try:
        sys.argv=['current-house-head-actions.py','--check']
        with contextlib.redirect_stdout(io.StringIO()):
            runpy.run_path(str(source['root']/EXTRA_SOURCES[0]),init_globals={'originObserver':observer})
    finally:sys.argv=old
    return rows


def _strength_function(source):
    path=source['root']/EXTRA_SOURCES[1]
    tree=ast.parse(path.read_text())
    function=next(node for node in tree.body if isinstance(node,ast.FunctionDef) and node.name=='mr')
    function.decorator_list=[]
    namespace={'math':math}
    exec(compile(ast.Module(body=[function],type_ignores=[]),str(path),'exec'),namespace)
    return namespace['mr']


def _arc_primitive(radius,x):
    return .5*(x*math.sqrt(max(0,radius*radius-x*x))+radius*radius*math.asin(x/radius))


def _ring_area(radius,outer,a,b):
    return (_arc_primitive(outer,b)-_arc_primitive(outer,a)) - (_arc_primitive(radius,b)-_arc_primitive(radius,a))


def build_continuous_rc_portal(case,source):
    _admit(case,source)
    lower=source['lower'];parent=lower['parent'];piers=copy.deepcopy(portal_geometry(lower))
    portal=parent['retained']['values']['project/had/studies/water-replan.json']['model']['insulatedPortal']
    radius,outer,centre_z=portal['rawRadius'],portal['rawRadius']+portal['ring'],portal['centreZ']
    mean=(radius+outer)/2;theta=math.asin(1480/mean)
    model=FrameModel();grid=parent['successor']['values']['current-house-grid'];_grid(model,grid,case['gridLaw'])
    members={};families={name:{} for name in ('physical-G','external-GMAX','external-Q','pressure-positive','pressure-negative','unit-uplift')}
    panels=[];floor_ports=[];joints=[];wall_frames={};dpc_nodes=[]
    def addload(family,node,wrench):
        target=families[family].setdefault(node,[0.]*6)
        for i,value in enumerate(wrench):target[i]+=value
    def at(family,node,point,force,moment=(0,0,0)):
        wrench=_wrench_at(force,point,model.nodes[node]);wrench[3:]=[a+b for a,b in zip(wrench[3:],moment)]
        addload(family,node,wrench)
    def member(name,a,b,breadth,depth,p=None,q=None,kind='post'):
        start,end=p or model.nodes[a],q or model.nodes[b]
        section=rectangle_section(depth,breadth)
        model.member(name,a,b,section,case['frameLaw'],physical_start=start,physical_end=end,y_axis=[0,1,0])
        members[name]={'a':a,'b':b,'physicalStartMm':list(start),'physicalEndMm':list(end),'breadthMm':breadth,'depthMm':depth,'kind':kind}
    for index,pier in enumerate(piers):
        x,y=pier['footCentroidXYMm'];wall=pier['wallId'];side=pier['side'];stem=wall+'/'+side
        top=3920 if wall=='outer-north' else 3820;beam_z=(3170+top)/2
        head=next(row for row in grid['heads'] if row['id']==pier['headId'])
        cap=model.node(stem+'/cap',[*head['xy'],-180])
        model.member(stem+'/finite-cap',head['id'],cap,rectangle_section(*head['capXY']),case['gridLaw'],
            physical_start=[*head['xy'],pier['capGridAxisZMm']],physical_end=[*head['xy'],-180],y_axis=[0,1,0])
        levels=[-180,*case['dpcIntervalZMm'],0.,1125.,2250.,centre_z+mean*math.cos(theta),beam_z]
        nodes=[model.node(stem+'/'+str(z),[x,y,z]) for z in levels]
        del model.nodes[nodes[0]]
        nodes[0]=cap
        low,high=case['dpcIntervalZMm'];joint_low=nodes[1];joint_high=nodes[2]
        footprint=pier['footprintXYMm'];joint_point=[x,y,(low+high)/2]
        for number,(px,py,area) in enumerate(rectangle_contact_quadrature(footprint)):
            for axis,direction in enumerate(([1,0,0],[0,1,0],[0,0,1])):
                stiffness=area*case['dpcLaw']['normalStiffnessKNPerMm3' if axis==2 else 'shearStiffnessKNPerMm3']
                model.spring(stem+'/dpc/'+str(number)+'/'+str(axis),joint_high,joint_low,[px,py,joint_point[2]],direction,stiffness)
        dpc_nodes.append({'pierId':pier['id'],'wallId':wall,'low':joint_low,'high':joint_high,'pointMm':joint_point,'footprintXYMm':footprint})
        for i,(a,b) in enumerate(zip(nodes,nodes[1:])):
            if i==1:continue
            p=[x,y,levels[i]];q=[x,y,min(levels[i+1],3170)]
            if i==0:p=[x,y,-180]
            member(stem+'/post/'+str(i),a,b,215,212.5,p,q)
            weight=212.5*215*(q[2]-p[2])/1e9*25
            for node in (a,b):at('physical-G',node,[(p[0]+q[0])/2,y,(p[2]+q[2])/2],[0,0,-weight/2])
        floor_port={'id':pier['floorReceiverId'],'node':nodes[-1],'pointMm':pier['floorReceiverXYZMm'],'wallId':wall}
        floor_ports.append(floor_port)
        wall_frames.setdefault(wall,{})[side]={'pier':pier,'nodes':nodes,'beamZMm':beam_z,'topMm':top}
        joints.append({'id':stem+'/arch-column','masterNode':nodes[-2],'physicalFaceXMm':4520 if side=='west' else 7480,
            'offsetAlongMm':106.25,'law':'unqualified-rigid-monolithic-end-zone','oldTaperRemoved':True,'structuralBoreDiameterMm':0})
    for wall,frame in wall_frames.items():
        west,east=frame['west'],frame['east'];y=west['pier']['footCentroidXYMm'][1];beam_z=west['beamZMm'];height=west['topMm']-3170
        beam_x=[4413.75,4520,4800,5200,5600,6000,6400,6800,7200,7480,7586.25]
        beam_nodes=[model.node(wall+'/beam/'+str(x),[x,y,beam_z]) for x in beam_x]
        del model.nodes[beam_nodes[0]];del model.nodes[beam_nodes[-1]]
        beam_nodes[0]=west['nodes'][-1];beam_nodes[-1]=east['nodes'][-1]
        for i,(a,b) in enumerate(zip(beam_nodes,beam_nodes[1:])):
            member(wall+'/upstand/'+str(i),a,b,140,height,kind='upstand')
            weight=(beam_x[i+1]-beam_x[i])*140*height/1e9*25
            for node in (a,b):addload('physical-G',node,[0,0,-weight/2,0,0,0])
        for side,x_edge,node in [('west',4307.5,beam_nodes[0]),('east',7692.5,beam_nodes[-1])]:
            weight=106.25*140*height/1e9*25
            at('physical-G',node,[(x_edge+model.nodes[node][0])/2,y,beam_z],[0,0,-weight])
        angles=[-theta+2*theta*i/case['archSegments'] for i in range(case['archSegments']+1)]
        arc_points=[[6000+mean*math.sin(t),y,centre_z+mean*math.cos(t)] for t in angles]
        arc_nodes=[model.node(wall+'/arch/'+str(i),point) for i,point in enumerate(arc_points)]
        del model.nodes[arc_nodes[0]];del model.nodes[arc_nodes[-1]]
        arc_nodes[0]=west['nodes'][-2];arc_nodes[-1]=east['nodes'][-2]
        for i,(a,b) in enumerate(zip(arc_nodes,arc_nodes[1:])):
            member(wall+'/arch/'+str(i),a,b,215,215,arc_points[i],arc_points[i+1],kind='curved-ring')
            dx0,dx1=arc_points[i][0]-6000,arc_points[i+1][0]-6000
            ring_area=_ring_area(radius,outer,dx0,dx1)
            ring_weight=ring_area*215/1e9*25
            middle_x=(arc_points[i][0]+arc_points[i+1][0])/2
            ring_low=centre_z+math.sqrt(radius*radius-(middle_x-6000)**2)
            ring_high=centre_z+math.sqrt(outer*outer-(middle_x-6000)**2)
            infill_top=3170-case['infillHeadGapMm'];infill_height=infill_top-ring_high
            if infill_height<=0:raise ValueError('The physical arch intersects the authored infill headgap')
            infill_area=(dx1-dx0)*(infill_top-centre_z)-(_arc_primitive(outer,dx1)-_arc_primitive(outer,dx0))
            infill_weight=infill_area*215/1e9*20
            for node in (a,b):
                at('physical-G',node,[middle_x,y,(ring_low+ring_high)/2],[0,0,-ring_weight/2])
                at('physical-G',node,[middle_x,y,(ring_high+infill_top)/2],[0,0,-infill_weight/2])
            panels.append({'wallId':wall,'xMm':[arc_points[i][0],arc_points[i+1][0]],'ringAreaM2':ring_area/1e6,
                'infillAreaM2':infill_area/1e6,'infillTopZMm':infill_top,'ringOuterMidZMm':ring_high,'headgapMm':case['infillHeadGapMm']})
        frame.update(beamNodes=beam_nodes,beamXMm=beam_x,arcNodes=arc_nodes,arcPoints=arc_points)
        pressure_x=sorted(set([4307.5,4520,4800,5200,5600,6000,6400,6800,7200,7480,7692.5]))
        for a,b in zip(pressure_x,pressure_x[1:]):
            for coordinate,weight in GAUSS:
                x=(a+b)/2+(b-a)*coordinate/2
                opening_height=0 if x<4800 or x>7200 else centre_z+math.sqrt(portal['finishedRadius']**2-(x-6000)**2)
                height_exposed=3170-opening_height
                force=2.25*(b-a)*weight/2*height_exposed/1e6
                z=(3170+opening_height)/2
                if x<4520 or x>7480:node=west['nodes'][-2] if x<6000 else east['nodes'][-2]
                else:node=min(arc_nodes,key=lambda name:abs(model.nodes[name][0]-x))
                for family,sign in [('pressure-positive',1),('pressure-negative',-1)]:
                    at(family,node,[x,y+sign*387.5,z],[0,sign*force,0])
        at('unit-uplift',beam_nodes[len(beam_nodes)//2],[6000,y,3370],[0,0,1])
    inventory=source_action_inventory(source)
    admitted=[];withheld=[]
    for row in inventory:
        category=row['category'];programme=row['programme']
        if row['receivingKind']!='north-wall' or category not in ('upper core and finish budget','independent ceiling envelope','first-floor fields') or programme not in ('G','Q'):
            withheld.append(row);continue
        if category=='first-floor fields' and programme=='G':
            withheld.append({**row,'reason':'Source slab/finish GMAX overlaps the separately authored RC union; exact material subtraction and tributary reuse are not supplied.'});continue
        frame=wall_frames[row['wallId']];x,y=row['receivingXYMm'];nodes=frame['beamNodes'];xs=frame['beamXMm']
        if x<=xs[0]:shares=[(nodes[0],1.)]
        elif x>=xs[-1]:shares=[(nodes[-1],1.)]
        else:
            i=next(i for i in range(len(xs)-1) if xs[i]<=x<=xs[i+1]);fraction=(x-xs[i])/(xs[i+1]-xs[i]);shares=[(nodes[i],1-fraction),(nodes[i+1],fraction)]
        family='external-GMAX' if programme=='G' else 'external-Q'
        for node,share in shares:at(family,node,[x+row['residualOffsetXYMm'][0],y+row['residualOffsetXYMm'][1],3370],[0,0,-row['valueKN']*share])
        admitted.append(row)
    return {'schema':'str-continuous-rc-portal-model/1','sourceSHA256':source['identities'],'request':case,'model':model,
        'members':members,'wallFrames':wall_frames,'ports':floor_ports,'dpcNodes':dpc_nodes,'joints':joints,'panels':panels,
        'families':families,'admittedNativeActions':admitted,'withheldNativeActions':withheld,'grid':grid,'portal':portal,
        'candidateTopology':'Four fullheight unbored RC piers, two integral RC rings and two source-depth floor upstands; no structural tie or bore. Gravity-only spandrel infill with30mm headgap.',
        'scope':'Source-baseline cap/grid and ground datums; explicit authored RC replacement. No raised715 service-floor proposal or upper ground RC tie. No old masonry mass or old fixed-base roof/foundation reactions.'}


def _capacity(model,source,case,solution):
    mr=_strength_function(source);rows=[]
    cover=case['coverMm'];bar=16;link=8;face=cover+link+bar/2
    for name,member in model['members'].items():
        a,b=member['physicalStartMm'],member['physicalEndMm'];length=math.dist(a,b);axis=[(v-u)/length for u,v in zip(a,b)]
        y=[0,1,0];z=cross(axis,y)
        breadth,depth=member['breadthMm'],member['depthMm']
        if member['kind']=='upstand':
            face_b=cover+8+12/2;face_d=cover+8+12/2;steel_note='No resistance screen for source140mm upstand cage; actual reinforcement and joined detailing are unqualified'
            capacities=None
        else:face_b=face_d=face;steel_note='4H16, H8 links; two bars per opposite face';capacities=True
        for end,node in enumerate((member['a'],member['b'])):
            force=solution['memberEndWrenchesKN_KNmm'][name][end*6:end*6+3]
            moment=solution['memberEndWrenchesKN_KNmm'][name][end*6+3:end*6+6]
            actual_point=model['model'].nodes[node];physical=a if end==0 else b
            moment=[v+w for v,w in zip(moment,cross([u-v for u,v in zip(actual_point,physical)],force))]
            n=sum(v*w for v,w in zip(force,axis))*(1 if end==0 else -1)
            my=sum(v*w for v,w in zip(moment,y))/1000;mz=sum(v*w for v,w in zip(moment,z))/1000
            torsion=abs(sum(v*w for v,w in zip(moment,axis)))/1000
            shear=math.sqrt(max(0,sum(value*value for value in force)-n*n))
            if capacities:
                cap_y=mr(breadth,depth,face_d,depth-face_d,n,my<0)
                cap_z=mr(depth,breadth,face_b,breadth-face_b,n,mz<0)
                ratio=abs(my)/cap_y+abs(mz)/cap_z if cap_y>0 and cap_z>0 else None
            else:cap_y=cap_z=ratio=None
            rows.append({'memberId':name,'end':end,'axialCompressionKN':n,'bendingYKNm':my,'bendingZKNm':mz,
                'torsionKNm':torsion,'shearKN':shear,'uniaxialCapacityYKNm':cap_y,'uniaxialCapacityZKNm':cap_z,
                'linearUniaxialScreenRatio':ratio,'steel':steel_note,
                'domain':'Source rectangular4H16 strain-compatibility necessary flexural screen only; biaxial envelope, shear/torsion, anchorage, jointpanel, cracking and second-order resistance are not qualified.'})
    return rows


def solve_continuous_rc_case(model,source,name,multipliers):
    if any(key not in model['families'] or type(value) not in (int,float) or not math.isfinite(value) for key,value in multipliers.items()):
        raise ValueError('Finite supported source-family multipliers required')
    frame=model['model'];frame.loads.clear()
    for family,factor in multipliers.items():
        for node,wrench in model['families'][family].items():frame.load(node,[value*factor for value in wrench])
    result=frame.solve();external=[0.]*6;reaction=[0.]*6;heads=[]
    for node,wrench in frame.loads.items():
        value=_wrench_at(wrench[:3],frame.nodes[node],[0,0,0]);value[3:]=[a+b for a,b in zip(value[3:],wrench[3:])]
        external=[a+b for a,b in zip(external,value)]
    for head in model['grid']['heads']:
        wrench=result['supportWrenches'][head['id']];value=_wrench_at(wrench[:3],frame.nodes[head['id']],[0,0,0]);value[3:]=[a+b for a,b in zip(value[3:],wrench[3:])]
        reaction=[a+b for a,b in zip(reaction,value)]
        heads.append({'id':head['id'],'reactionKN_KNm':[*wrench[:3],*[v/1000 for v in wrench[3:]]]})
    residual=[*(a+b for a,b in zip(external[:3],reaction[:3])),*((a+b)/1000 for a,b in zip(external[3:],reaction[3:]))]
    if max(abs(value) for value in residual)>1e-6:raise ValueError('Actual52head six-component wrench equilibrium fails')
    dpc=[]
    for row in model['dpcNodes']:
        low=result['displacements'][row['low']];high=result['displacements'][row['high']]
        pressures=[]
        for x,y in ((row['footprintXYMm'][i],row['footprintXYMm'][j]) for i in (0,2) for j in (1,3)):
            dz=(high[2]-low[2])+(high[3]-low[3])*(y-row['pointMm'][1])-(high[4]-low[4])*(x-row['pointMm'][0])
            pressures.append(-dz*model['request']['dpcLaw']['normalStiffnessKNPerMm3']*1000)
        dpc.append({'pierId':row['pierId'],'cornerNormalCompressionMPa':pressures,'requiresNormalTension':min(pressures)<-1e-9})
    energy=.5*math.fsum(value*u for node,wrench in frame.loads.items() for value,u in zip(wrench,result['displacements'][node]))
    internal=.5*math.fsum(value*u for name,a,b,stiffness in frame.members for value,u in zip(result['memberEndWrenchesKN_KNmm'][name],result['displacements'][a]+result['displacements'][b]))
    internal+=.5*math.fsum(spring['forceKN']*spring['relativeMm'] for spring in result['springs'])
    energy_error=abs(internal-energy)/max(1.,abs(energy))
    if energy_error>1e-7:raise ValueError('Full finite-frame work/strain-energy balance fails')
    capacities=_capacity(model,source,model['request'],result)
    group_statics=[]
    for wall,geometry in model['wallFrames'].items():
        y=geometry['west']['pier']['footCentroidXYMm'][1];z=sum(model['request']['dpcIntervalZMm'])/2
        applied=[0.]*6
        for node,wrench in frame.loads.items():
            if not node.startswith(wall+'/'):continue
            value=_wrench_at(wrench[:3],frame.nodes[node],[6000,y,z]);value[3:]=[a+b for a,b in zip(value[3:],wrench[3:])]
            applied=[a+b for a,b in zip(applied,value)]
        normal=-applied[2];width=geometry['west']['pier']['sourceRCSectionMm'][1]
        bound=max(0.,normal)*width/2/1000
        applicable='joinedFloor' not in model
        impossible=normal<-1e-8 or abs(applied[3])/1000>bound+1e-8
        group_statics.append({'wallId':wall,'applicableFreeFloorBoundary':applicable,
            'appliedNormalShearKN':applied[1],'verticalCompressionRequiredKN':normal,
            'normalOverturningAtDPCMidplaneKNm':applied[3]/1000,'physicalFootprintNormalWidthMm':width,
            'maximumCompressionOnlyNormalMomentKNm':bound,
            'requiredNormalEccentricityMm':abs(applied[3])/normal if normal>1e-10 else None,
            'compressionOnlyEquilibriumImpossible':impossible if applicable else None,
            'scope':'Necessary per-portal equilibrium bound for the free-floor boundary. Finite-contact redistribution cannot exceed the actual215mm normal footprint. Joined floor interface wrenches must be included before applying this bound.'})
    port_movements=[]
    for port in model['ports']:
        u=result['displacements'][port['node']];offset=[a-b for a,b in zip(port['pointMm'],frame.nodes[port['node']])]
        shift=cross(u[3:],offset)
        port_movements.append({'id':port['id'],'pointMm':port['pointMm'],'value':[*(a+b for a,b in zip(u[:3],shift)),*[v*1000 for v in u[3:]]]})
    return {'name':name,'multipliers':multipliers,'externalWrenchKN_KNm':[*external[:3],*[v/1000 for v in external[3:]]],
        'heads':heads,'equilibriumResidualKN_KNm':residual,'strainEnergyKNmm':energy,
        'recoveredInternalStrainEnergyKNmm':internal,'energyRelativeResidual':energy_error,
        'maximumFreeResidualKNOrKNmm':result['maximumFreeResidualKNOrKNmm'],
        'portMovementsMmMrad':port_movements,
        'dpc':dpc,'memberNecessaryScreens':capacities,'maximumFrameTranslationMm':max(abs(v) for node,u in result['displacements'].items() if not node.startswith('GRID') and not node.startswith('P') for v in u[:3]),
        'completeHouseProof':False,'roofAdoption':False,'installedAcceptance':False,
        'candidateAccepted':False,'bilateralFullContactDomainRejected':any(row['requiresNormalTension'] for row in dpc),
        'freeFloorPortalStatics':group_statics,
        'freeFloorCompressionOnlyEquilibriumRejected':any(row['compressionOnlyEquilibriumImpossible'] for row in group_statics) if 'joinedFloor' not in model else None,
        'domainReason':'Negative affine corner pressure rejects bilateral full contact only; partial compression contact remains possible unless an independently applicable footprint/resultant bound rejects equilibrium.'}


def physical_schedule(model):
    case=model['request'];portal=model['portal'];gap=case['dpcIntervalZMm'][1]-case['dpcIntervalZMm'][0]
    piers=4*212.5*215*(3350-gap)/1e9
    upstands=3385*140*(750+650)/1e9
    ring=sum(row['ringAreaM2']*.215 for row in model['panels'])
    infill=sum(row['infillAreaM2']*.215 for row in model['panels'])
    face=case['coverMm']+8+8
    return {'RCVolumeM3':piers+upstands+ring,'fullheightPierVolumeM3':piers,'floorUpstandVolumeM3':upstands,
        'ringOutsidePierUnionVolumeM3':ring,'gravityOnlyInfillVolumeM3':infill,
        'physicalGKN':(piers+upstands+ring)*25+infill*20,
        'steel':{'postAndRing':'4H16 with H8 links at100mm authored NEW trial; no inherited transverse jamb schedule and no lap or anchorage resistance inferred',
            'nominalCoverMm':case['coverMm'],'barCentreFaceMm':face,
            'minimumPostClearBarSpacingMm':min(212.5,215)-2*face-16,
            'minimumRingClearBarSpacingMm':215-2*face-16,
            'sourceStrengthSteelFraction':.92,'bendMandrelDiameterMm':160,
            'ringBarRadiusMm':[portal['rawRadius']+face,portal['rawRadius']+215-face],
            'anchorDevelopmentRequiredMm':16*(500/1.15)/(4*(2.25*2.0/1.5)),
            'foundationAvailableStraightEmbedmentMm':570-2*case['coverMm'],
            'anchorageAccepted':False,'archColumnBarTransitionAccepted':False,'jointPanelAccepted':False},
        'removedHardware':{'structuralTieCount':0,'boreDiameterMm':0,'oldVisibleTransomDepthMm':50,'ownerAppearanceApproval':False},
        'opening':{'rawSpanMm':2960,'springMm':2250,'riseMm':600,'coreAxialMm':215,'finishedAxialMm':775,
            'finishedCrownMm':portal['finishedCrown'],'finishedJambSpringMm':portal['finishedJambSpring'],
            'finishedWidthMm':portal['finishedWidthAtVerticalJambs'],'changedTransomUndersideToCrownMm':portal['finishedCrown']-2175},
        'interfaces':{'infillHeadGapMm':30,'monolithicJointEndOffsetsMm':106.25,'oldRCBevelReplaced':True,
            'columnToFloorUpstandWidthReductionMm':215-140,'waterBarrierPenetrationByTieRemoved':True,
            'DPCMechanicalTensionRetentionProvided':False,'floorReceiverPathSelected':False},
        'massAccounting':'Exact vertical-cut RC ring outside212.5mm pier rectangles; four fullheight piers stop at3170 and upstands start there. DPC gap removed. No old brick ring/tie/pier/spandrel or pre-collapsed roof/head mass is retained. Infill counted once, no stiffness. Source slabG overlap withheld explicitly.'}


def draw_continuous_rc_portal(model):
    portal=model['portal'];x0=4307.5;x1=7692.5
    def x(value):return 50+(value-x0)*.18
    def z(value):return 820-value*.18
    rows=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 940 940">','<rect width="940" height="940" fill="#faf8f2"/>',
        '<style>text{font:13px sans-serif;fill:#243339}.small{font-size:11px}.rc{fill:#aebfc0;stroke:#344d54;stroke-width:1.2}.void{fill:#faf8f2;stroke:#344d54}</style>',
        '<text x="35" y="28">CONTINUOUS RC NORTHERN PORTAL — AUTHORED CHALLENGER</text>',
        '<text x="35" y="49">No structural tie / no bore. Conditional finite joint and bilateral DPC laws.</text>']
    for wall,frame in model['wallFrames'].items():
        if wall!='outer-north':continue
        for a,b in ((4307.5,4520),(7480,7692.5)):
            rows.append(f'<rect class="rc" x="{x(a)}" y="{z(3170)}" width="{(b-a)*.18}" height="{(3170+180)*.18}"/>')
        rows.append(f'<rect class="rc" x="{x(x0)}" y="{z(3920)}" width="{(x1-x0)*.18}" height="135"/>')
        outer=[];inner=[];count=100
        for i in range(count+1):
            xx=4520+2960*i/count;dx=xx-6000
            outer.append(f'{x(xx)},{z(portal["centreZ"]+math.sqrt((portal["rawRadius"]+215)**2-dx*dx))}')
            inner.append(f'{x(xx)},{z(portal["centreZ"]+math.sqrt(portal["rawRadius"]**2-dx*dx))}')
        rows.append('<polygon class="rc" points="'+' '.join(outer+inner[::-1])+'"/>')
        infill=['%s,%s'%(x(4520),z(3140)),'%s,%s'%(x(7480),z(3140)),*outer[::-1]]
        rows.append('<polygon fill="#d8c7a2" stroke="#9b855a" points="'+' '.join(infill)+'"/>')
        rows.append(f'<path d="M{x(4520)} {z(3170)} H{x(7480)}" stroke="#ae4a30" stroke-width="4" stroke-dasharray="5 4"/>')
        for a,b in ((4307.5,4520),(7480,7692.5)):
            for level in model['request']['dpcIntervalZMm']:
                rows.append(f'<path d="M{x(a)} {z(level)} H{x(b)}" stroke="#ae4a30"/>')
        finished=[]
        for i in range(101):
            xx=4800+2400*i/100
            finished.append(f'{x(xx)},{z(portal["centreZ"]+math.sqrt(portal["finishedRadius"]**2-(xx-6000)**2))}')
        rows.append('<polyline points="'+f'{x(4800)},{z(0)} '+' '.join(finished)+f' {x(7200)},{z(0)}'+'" fill="none" stroke="#6b8972" stroke-dasharray="5 4"/>')
    for zz,label in ((3920,'3920 outer beam top; court3820'),(3370,'3370 slab top'),(3170,'3170 beam underside'),(2850,'2850 raw crown'),(2250,'2250 raw spring'),(0,'0 source baseline'),(-180,'−180 cap top')):
        rows.append(f'<text class="small" x="{x(x1)+6}" y="{z(zz)+4}">{label}</text>')
    rows.extend(['<text x="35" y="877">212.5×215 piers; 215×215 ring; 140×750 outer / 140×650 court upstands.</text>',
        '<text x="35" y="898">Gold: gravity-only infill. Dashed red:30mm headgap. Green: source finished opening.</text>',
        '<text x="35" y="920">No roof adoption, joint capacity, DPC tension retention or owner appearance approval.</text>','</svg>'])
    return '\n'.join(rows)+'\n'


SCENARIOS = (
    ('physical-selfweight',{'physical-G':1.}),
    ('source-GMAX-Q-strength-challenge',{'physical-G':1.35,'external-GMAX':1.35,'external-Q':1.5}),
    ('positive-solid-face-pressure-no-favourable-G',{'pressure-positive':1.}),
    ('negative-solid-face-pressure-no-favourable-G',{'pressure-negative':1.}),
    ('GMAX-Q-positive-pressure',{'physical-G':1.35,'external-GMAX':1.35,'external-Q':1.5,'pressure-positive':1.}),
    ('GMAX-Q-negative-pressure',{'physical-G':1.35,'external-GMAX':1.35,'external-Q':1.5,'pressure-negative':1.}),
    ('authored-unit-uplift-at-each-floor-crown',{'unit-uplift':1.}),
)


def continuous_rc_diagnostics():
    return [
        'AUTHORED REPLACEMENT: the old tapered/short RC piers and masonry arch/ring are replaced by fullheight RC piers and integral RC rings. Their old mass, stiffness, tie and bore are not retained.',
        'H8 links at100mm belong only to this NEW authored challenger. No transverse reinforcement schedule is attributed to the existing jamb source. Actual140mm floor-upstand reinforcement, intersections and placing remain unqualified.',
        'The source opening remains open-loggia. Actual finished solid facade only receives the bound2.25kPa normal-pressure recipe; no fictitious closed-door/opening load or fixing is supplied. Load introduction into adjacent RC nodes is an authored boundary, not qualification of insulation/infill anchors.',
        'The finite frame uses physical column-face cuts and106.25mm monolithic rigid end offsets at RC arch-column joints, with finite post lengths ending at the floor-upstand underside. End-zone shear, joint-panel distortion and three-dimensional local resistance remain unqualified.',
        'Mass uses the exact vertical-cut RC union: ring material inside the fullheight columns is excluded, and upstands start above those columns. Beam idealisation through the curved joint is approximate; no unqualified joint-panel stiffness or capacity is promoted to acceptance.',
        'Infill is supported on the RC ring, carries its own20kN/m3 gravity and no favorable frame stiffness. The30mm headgap bypasses it as a floor support. Out-of-plane ties, lateral serviceability, fire/acoustic/movement finishes and installability remain proof obligations.',
        'Source native actions are intercepted before ground/head redistribution, retaining signed values and source first-moment offsets. Gross upper-wall and ceiling GMAX are external strength challenges, never favorable retained gravity. Old roof/fixed-base reactions are withheld.',
        'The one native slab GMAX card overlaps this separately authored RC union and is withheld until exact tributary/material subtraction. Loggia-W/E adjoining masonry/sidewall cards require their actual finite receiving paths. This is not a complete house gravity combination.',
        'The portal floor ports are free in lateral translation except through their own RC frame and actual ground grid. Existing four-corner-only diaphragm condensation cannot be attached as a fictitious rigid restraint. A new floor condensation must retain these four receiving ports and remove overlapping band/upstand material stiffness.',
        'Negative affine DPC corner pressure rejects full contact only. The separately reported per-portal free-floor equilibrium bound compares actual applied normal overturning with totalN times half the215mm support footprint; exceeding that bound rejects compression-only equilibrium regardless of partial-contact redistribution. This bound is not applied after a joined floor supplies additional interface wrenches.',
        'H16 straight development is screened against actual570mm cap depth less covers. Hook/loop routes, splitting/confinement, DPC tension retention, positive shear transfer and anchorage capacity are not invented. The H8 trial itself does not provide these connections.',
        'The rectangular4H16 source strain-compatibility law is reused without executing its historical house solver. Individual uniaxial capacities and their linear comparison do not qualify biaxial interaction, shear/torsion, second-order response, cracking or the unscheduled floor beam.',
        'All52 actual source heads have ideal translation restraint/free rotation. Upper caps are finite from inherited grid axis tocap top; lower head-to-grid eccentric transfer is inherited rigid. No site/foundation resistance or settlement is accepted.',
        'Removing the visible50mm transom changes appearance and leaves an owner-review gate. The775mm wrapped envelope and finished arch are retained geometrically; no aesthetic, weather-barrier, fire or occupied-house approval is fabricated.',
        'No raised715 service-floor proposal, adopted roof geometry, upper ground RC tie, installed acceptance or complete-house proof is supplied. All28 existing floor-receiving duties remain unresolved as complete joined paths.'
    ]


def compile_continuous_rc_portal(case,source):
    model=build_continuous_rc_portal(case,source)
    results=[solve_continuous_rc_case(model,source,name,multipliers) for name,multipliers in SCENARIOS]
    schedule=physical_schedule(model)
    candidate_ports={row['id'] for row in model['ports']}
    receiving=[{**row,'candidateStatus':'authored-RC-frame-awaits-joined-diaphragm-and-connections' if row['id'] in candidate_ports else 'not-modelled-by-this-challenger'} for row in native_intermediate_support_ports(source['lower']['parent'])]
    return {'schema':'str-continuous-rc-portal-result/1','sourceSHA256':source['identities'],'request':case,
        'status':'scoped-free-floor-boundary-rejection','schedule':schedule,'cases':results,'ports':model['ports'],'joints':model['joints'],
        'admittedNativeActions':model['admittedNativeActions'],'withheldNativeActions':model['withheldNativeActions'],
        'receivingPorts':receiving,'unresolvedReceivingPortCount':len(receiving),'completeReceivingPaths':0,
        'topology':model['candidateTopology'],'scope':model['scope'],
        'nodeCount':len(model['model'].nodes),'memberCount':len(model['model'].members),
        'diagnostics':continuous_rc_diagnostics(),'drawings':{'section.svg':draw_continuous_rc_portal(model)},
        'roofAdoption':False,'ownerAppearanceApproval':False,'candidateAccepted':False,'installedAcceptance':False,'completeHouseProof':False}


if __name__=='__main__':
    source=load_continuous_rc_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:
        print(json.dumps(reference_continuous_rc_case(source),allow_nan=False))
    elif not sys.argv[1:]:
        print(json.dumps(compile_continuous_rc_portal(json.load(sys.stdin),source),allow_nan=False))
    else:raise SystemExit('Use --read, or provide the explicit source-bound comparison on stdin')
