"""Actual modeled roof steel origins and consistent work-dual gravity loads.

The 1.5kPa background and old connection allowances are not steel stock.
Finite outer rafters use their actual Hermite work maps; the opposing pinned
half retains its released bending law. Free tails add loads, never stiffness.
"""
import hashlib
import math
from pathlib import Path

import numpy as np


METHOD='project/str/studies/roof_stock_gravity.py'


def _scalar(axis,maps):
    result={}
    for coefficient,row in zip(axis,maps):
        for index,value in row:result[index]=result.get(index,0.)+coefficient*value
    return list(result.items())


def _maps(p,heel,crown):
    dz=p['zhigh']-p['zheel'];plan=math.dist(heel,crown);length=math.hypot(plan,dz)
    h=[(crown[i]-heel[i])/plan for i in (0,1)]
    x=[h[0]*plan/length,h[1]*plan/length,dz/length]
    y=[-h[1],h[0],0];z=[-h[0]*dz/length,-h[1]*dz/length,plan/length]
    offset=p['zheel']-p['rr']
    bp=[[(p['dof'](heel,0),1),(p['vDO'](heel,1),offset)],
        [(p['dof'](heel,1),1),(p['vDO'](heel,2),offset)],[(p['vDO'](heel,0),-1)]]
    rp=[[(p['vDO'](heel,2),-1)],[(p['vDO'](heel,1),1)],[(p['dof'](heel,2),1)]]
    bq=[[(p['highD'](crown,0),1),(p['rRot'](crown,1),-p['seatZ'])],
        [(p['highD'](crown,1),1),(p['rRot'](crown,0),p['seatZ'])],[(p['highD'](crown,2),1)]]
    rq=[[(p['rRot'](crown,j),1)] for j in range(3)]
    return {'heel':heel,'crown':crown,'lengthMm':length,'planLengthMm':plan,
        'X':x,'Y':y,'Z':z,'bp':bp,'rp':rp,'bq':bq,'rq':rq}


def _add(vector,terms,force):
    for index,value in terms:vector[index]+=force*value


def _point_load(vector,maps,position,force_n,finite):
    """Force applied at an actual primary-axis point, including free tails."""
    length=maps['lengthMm'];bp,bq,rp=maps['bp'],maps['bq'],maps['rp']
    strong=[_scalar(maps['Z'],bp),_scalar([-v for v in maps['Y']],rp),
            _scalar(maps['Z'],bq),_scalar([-v for v in maps['Y']],maps['rq'])]
    local_strong=float(np.dot(force_n,maps['Z']))
    if not finite:
        axial=float(np.dot(force_n,maps['X']));transverse=np.asarray(force_n)-axial*np.asarray(maps['X'])
        _add(vector,_scalar(maps['X'],bp),axial if position<0 else (1-position)*axial)
        if position>=0:_add(vector,_scalar(maps['X'],bq),position*axial)
        for axis in range(3):
            _add(vector,bp[axis],(1-position)*transverse[axis]);_add(vector,bq[axis],position*transverse[axis])
        return [0.]*4
    if position<0:
        # Exact force and moment of the free overhang at its physical root.
        for axis in range(3):_add(vector,bp[axis],force_n[axis])
        moment=np.cross(np.asarray(maps['X'])*position*length,force_n)
        for axis in range(3):_add(vector,rp[axis],moment[axis])
        return [local_strong,local_strong*position*length,0.,0.]
    if not 0<=position<=1:raise ValueError('A roof half member cannot silently extend beyond its crown')
    axial=float(np.dot(force_n,maps['X']))
    _add(vector,_scalar(maps['X'],bp),(1-position)*axial);_add(vector,_scalar(maps['X'],bq),position*axial)
    v=position;n=[1-3*v*v+2*v**3,length*(v-2*v*v+v**3),3*v*v-2*v**3,length*(-v*v+v**3)]
    weak=[_scalar(maps['Y'],bp),_scalar(maps['Z'],rp),_scalar(maps['Y'],bq),_scalar(maps['Z'],maps['rq'])]
    transverse=float(np.dot(force_n,maps['Y']))
    for shape,row in zip(n,weak):_add(vector,row,shape*transverse)
    for shape,row in zip(n,strong):_add(vector,row,shape*local_strong)
    return [shape*local_strong for shape in n]


def _axial_load(maps,position,force_n):
    force=float(np.dot(force_n,maps['X']))
    return [force,0.] if position<0 else [(1-position)*force,position*force]


def pin_half_bending(length_mm,line_loads,point_loads):
    """Exact released-half moment envelope, including a continuous free tail.

    Loads are signed local transverse N/mm and N; coordinates are physical mm
    from the heel. The actual pin supports are at0 andL, not the free tail tip.
    """
    if length_mm<=0:raise ValueError('Positive actual pin half length required')
    total=sum(q*(b-a) for a,b,q in line_loads)+sum(force for _,force in point_loads)
    first=sum(q*(b*b-a*a)/2 for a,b,q in line_loads)+sum(x*force for x,force in point_loads)
    r1=-first/length_mm;r0=-total-r1
    def value(x):
        result=r0*max(0.,x)
        for a,b,q in line_loads:
            end=min(x,b)
            if end>a:result+=q*(x*(end-a)-(end*end-a*a)/2)
        result+=sum(force*max(0.,x-at) for at,force in point_loads)
        return result
    def shear(x):
        return (r0 if x>0 else 0.)+sum(q*max(0.,min(x,b)-a) for a,b,q in line_loads)+sum(force for at,force in point_loads if at<x)
    knots=sorted({0.,length_mm,*[v for a,b,_ in line_loads for v in (a,b)],*[x for x,_ in point_loads]});candidates=list(knots)
    for a,b in zip(knots,knots[1:]):
        q=sum(q for lo,hi,q in line_loads if lo<(a+b)/2<hi)
        if q:
            root=a-shear(a+1e-8)/q
            if a<root<b:candidates.append(root)
    samples=[{'axisMm':x,'momentKNm':value(x)/1e6} for x in sorted(set(candidates))]
    return {'heelReactionN':r0,'crownReactionN':r1,'forceResidualN':r0+r1+total,
        'momentResidualNmm':r1*length_mm+first,'maximumAbsoluteLocalMomentKNm':max(abs(r['momentKNm']) for r in samples),
        'samples':samples,'strengthAccepted':False,'releasedRotationLawPreserved':True}


def assemble_roof_stock_gravity(operator,settings):
    if not isinstance(settings,dict) or set(settings)!={'unitWeightKNPerM3'}:raise ValueError('Exact authored modeled-steel density required')
    density=settings['unitWeightKNPerM3']
    if type(density) not in (int,float) or not math.isfinite(density) or not 75<=density<=80:raise ValueError('Explicit75..80kN/m3 modeled-steel comparison required')
    p=operator['scope'];w=p['w'];vector=np.zeros(p['spaceSize']);origins=[];stocks=[];halves={}
    def record(identifier,category,length_m,area_mm2,centroid):
        volume=length_m*area_mm2/1e6;weight=volume*density
        stocks.append({'id':identifier,'category':category,'physicalLengthM':length_m,'sectionAreaMm2':area_mm2,
            'physicalVolumeM3':volume,'physicalGKN':weight,'gravityCentroidXYZMm':centroid})
        return weight
    def point(maps,t,weight_kn,finite,identifier):
        start=np.array([*maps['heel'],p['zheel']]);finish=np.array([*maps['crown'],p['zhigh']]);at=start+t*(finish-start)
        force=np.array([0.,0.,-weight_kn*1000]);local=_point_load(vector,maps,t,force,finite)
        origins.append({'stockId':identifier,'pointXYZMm':at.tolist(),'forceKN':[0.,0.,-weight_kn]})
        return local
    gauss=(-1/math.sqrt(3),1/math.sqrt(3))
    for index,(outer,inner) in enumerate(p['radials']):
        ordinary=outer[0]==inner[0] or outer[1]==inner[1];family=next(row for row in w['frames'] if row['id']==('ordinary' if ordinary else 'hip'))
        crown=tuple((a+b)/2 for a,b in zip(outer,inner));axis_plan=math.dist(outer,inner)
        half_maps={}
        for label,heel,finite in (('outer',outer,True),('inner',inner,False)):
            maps=_maps(p,heel,crown);half_maps[label]=maps
            physical_half=family['primaryLengthM']*500;tail=physical_half-maps['lengthMm']
            if tail<0:raise ValueError('Actual roof primary stock is shorter than its support-to-crown body')
            ratio=tail/maps['lengthMm'];identifier='ROOF-STOCK/PRIMARY/'+str(index)+'/'+label
            middle_t=(1-ratio)/2;centre=np.array([*heel,p['zheel']])+middle_t*(np.array([*crown,p['zhigh']])-np.array([*heel,p['zheel']]))
            weight=record(identifier,'primary',physical_half/1000,w['sections']['primary']['A'],centre.tolist())
            line_g=w['sections']['primary']['A']/1e6*density
            loads={'id':identifier,'finite':finite,'maps':maps,'lineLoads':[[ -tail,maps['lengthMm'],-line_g*maps['Z'][2]]],
                'pointLoads':[],'equivalentStrongN_Nmm':[0.]*4,'equivalentAxialN':[0.,0.],
                'physicalGKN':weight,'tailLengthMm':tail}
            for a,b in ((-ratio,0.),(0.,1.)):
                for xi in gauss:
                    t=(a+b)/2+xi*(b-a)/2;part=line_g*maps['lengthMm']*(b-a)/2000
                    local=point(maps,t,part,finite,identifier)
                    loads['equivalentStrongN_Nmm']=[x+y for x,y in zip(loads['equivalentStrongN_Nmm'],local)]
                    axial=_axial_load(maps,t,[0,0,-part*1000])
                    loads['equivalentAxialN']=[x+y for x,y in zip(loads['equivalentAxialN'],axial)]
            halves[index,label]=loads
        for row_index,row in enumerate(family['rows']):
            along=row['x']*1000;label='inner' if along<=axis_plan/2 else 'outer';maps=half_maps[label]
            t=(along if label=='inner' else axis_plan-along)/(axis_plan/2)
            length_m=row['area']/row['rowWidth'];identifier='ROOF-STOCK/SECONDARY/'+str(index)+'/'+str(row_index)
            at=np.array([*maps['heel'],p['zheel']])+t*(np.array([*maps['crown'],p['zhigh']])-np.array([*maps['heel'],p['zheel']]))
            weight=record(identifier,'secondary',length_m,w['sections']['secondary']['A'],at.tolist())
            local=point(maps,t,weight,label=='outer',identifier)
            half=halves[index,label];half['pointLoads'].append([t*maps['lengthMm'],-weight*1000*maps['Z'][2]])
            half['equivalentStrongN_Nmm']=[x+y for x,y in zip(half['equivalentStrongN_Nmm'],local)]
            axial=_axial_load(maps,t,[0,0,-weight*1000]);half['equivalentAxialN']=[x+y for x,y in zip(half['equivalentAxialN'],axial)]
        identifier='ROOF-STOCK/TWIN-RAILS/'+str(index);tie_z=p['heel']['node']['ordinary']['tieCentre']
        weight=record(identifier,'twin-rails',axis_plan/1000,w['sections']['tie']['A'],[*crown,tie_z])
        for heel in (outer,inner):
            vector[p['vDO'](heel,0)]+=weight*500
            origins.append({'stockId':identifier,'pointXYZMm':[*heel,tie_z],'forceKN':[0.,0.,-weight/2]})
    for index,(a,b) in enumerate(p['rings']):
        section=p['collectorSection'](a,b);length=math.dist(a,b);axis=0 if a[1]==b[1] else 1;sign=1 if b[axis]>a[axis] else -1
        identifier='ROOF-STOCK/RING/'+str(index);centre=[(a[0]+b[0])/2,(a[1]+b[1])/2,p['rr']]
        weight=record(identifier,'ring',length/1000,section['A'],centre);moment=weight*1000*length/12
        for heel,sgn in ((a,1),(b,-1)):
            vector[p['vDO'](heel,0)]+=weight*500;vector[p['vDO'](heel,1+axis)]+=sign*sgn*moment
        for xi in gauss:
            t=(1+xi)/2;point_xyz=[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1]),p['rr']]
            origins.append({'stockId':identifier,'pointXYZMm':point_xyz,'forceKN':[0.,0.,-weight/2]})
    total=sum(row['physicalGKN'] for row in stocks);category={}
    for row in stocks:
        target=category.setdefault(row['category'],{'physicalGKN':0.,'physicalVolumeM3':0.,'physicalLengthM':0.})
        for key in target:target[key]+=row[key]
    expected={
        'primary':sum(r['count']*r['primaryLengthM'] for r in w['frames'])*w['sections']['primary']['A']/1e6*density,
        'secondary':w['globalOrigins']['purlinPhysicalLengthM']*w['sections']['secondary']['A']/1e6*density,
        'twin-rails':sum(r['count']*r['axisSpanM'] for r in w['frames'])*w['sections']['tie']['A']/1e6*density,
        'ring':62*w['sections']['collector']['A']/1e6*density}
    if any(abs(category[key]['physicalGKN']-value)>1e-9 for key,value in expected.items()):raise ValueError('Actual roof steel stock enumeration duplicates or loses a source family')
    retained=operator['retainedIndices'];interior=operator['interiorIndices'];particular=np.linalg.solve(operator['interiorStiffnessN'],vector[interior])
    condensed=(vector[retained]-operator['interiorCouplingN'].T@particular)/1000
    origin_wrench=np.zeros(6);port_wrench=np.zeros(6)
    for row in origins:
        origin_wrench[:3]+=row['forceKN'];origin_wrench[3:]+=np.cross(row['pointXYZMm'],row['forceKN'])/1000
    for i,(x,y) in enumerate(operator['ringPointsXYMm']):
        fx,fy,mz,down,sx,sy=condensed[6*i:6*i+6];force=np.asarray([fx,fy,-down]);moment=np.asarray([-sy,sx,mz])
        port_wrench[:3]+=force;port_wrench[3:]+=(moment+np.cross([x,y,p['rr']],force))/1000
    stock_wrench=np.asarray([0,0,-total,-sum(r['physicalGKN']*r['gravityCentroidXYZMm'][1]/1000 for r in stocks),
        sum(r['physicalGKN']*r['gravityCentroidXYZMm'][0]/1000 for r in stocks),0])
    if max(float(np.max(np.abs(origin_wrench-port_wrench))),float(np.max(np.abs(origin_wrench-stock_wrench))))>1e-7:
        raise ValueError('Roof steel stock origins, first moments or condensed gravity work map do not conserve')
    pin=[]
    for (index,label),row in halves.items():
        if not row['finite']:pin.append({'id':row['id'],**pin_half_bending(row['maps']['lengthMm'],row['lineLoads'],row['pointLoads'])})
    return {'schema':'str-roof-stock-gravity/1','request':dict(settings),
        'sourceSHA256':{**operator['sourceSHA256'],METHOD:hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},
        'physicalGKN':total,'physicalVolumeM3':sum(row['physicalVolumeM3'] for row in stocks),
        'categories':category,'stockLedger':stocks,'origins':origins,'fullForceN':vector,'condensedForceKN':condensed,
        'gravityWrenchKN_KNm':origin_wrench.tolist(),'stockOriginForceAndMomentResidualKN_KNm':(origin_wrench-port_wrench).tolist(),
        'loadOnlyEnergyKNmm':float(vector[interior]@particular/2000),'halves':halves,'pinHalfLocalG':pin,
        'modeledSteelGravityIntegrated':True,'completeRoofGravity':False,'retainedMinimumGQualified':False,
        'scope':'Only actual authored primary/secondary/twin-rail/closed-ring steel stocks. Old1.5kPa background, heel/crown/brace allowances and unmodeled roof layers are excluded. Source stock lengths remain an unselected mechanical control, not certified installed minimumG.'}


def serial_roof_stock_gravity(value):
    return {k:v for k,v in value.items() if k not in ('fullForceN','condensedForceKN','halves')}


def _finite_moment_diagram(length,line_loads,point_loads,end):
    def moment(x,tail_side=False):
        result=0. if x<0 or tail_side else -end[1]+end[0]*x
        for a,b,q in line_loads:
            stop=min(x,b)
            if stop>a:result+=q*(x*(stop-a)-(stop*stop-a*a)/2)
        return result+sum(force*max(0.,x-at) for at,force in point_loads)
    def shear(x):
        return (end[0] if x>0 else 0.)+sum(q*max(0.,min(x,b)-a) for a,b,q in line_loads)+sum(force for at,force in point_loads if at<x)
    knots=sorted({0.,length,*[v for a,b,_ in line_loads for v in (a,b)],*[x for x,_ in point_loads]});points=list(knots)
    for a,b in zip(knots,knots[1:]):
        q=sum(q for lo,hi,q in line_loads if lo<(a+b)/2<hi)
        if q:
            zero=a-shear(a+1e-8)/q
            if a<zero<b:points.append(zero)
    rows=[{'axisMm':x,'momentKNm':moment(x)/1e6} for x in sorted(set(points))]
    rows.append({'axisMm':0.,'side':'tail-before-heel-couple','momentKNm':moment(0.,True)/1e6})
    residual=moment(length)-end[3]
    if abs(residual)>1e-8*max(1.,abs(end[1]),abs(end[3])):raise ValueError('Actual outer rafter recovered moment diagram loses endpoint equilibrium')
    return {'momentSamples':rows,'maximumAbsoluteStrongMomentKNm':max(abs(row['momentKNm']) for row in rows),
        'rightEndMomentResidualNmm':residual}


def recover_roof_stock_local_actions(gravity,operator,full_displacements,physical_g_factor):
    p=operator['scope'];rows=[]
    for (_,label),half in gravity['halves'].items():
        maps=half['maps'];length=maps['lengthMm'];bp,bq=maps['bp'],maps['bq']
        ua=np.array([sum(full_displacements[i]*value for i,value in row) for row in bp])
        ub=np.array([sum(full_displacements[i]*value for i,value in row) for row in bq])
        axial=p['Es']*p['w']['sections']['primary']['A']/length*float(np.dot(ub-ua,maps['X']))
        axial_end=[-axial-physical_g_factor*half['equivalentAxialN'][0],axial-physical_g_factor*half['equivalentAxialN'][1]]
        item={'id':half['id'],'physicalHalfKind':'finite-outer' if half['finite'] else 'pin-ended-inner',
            'actualAxialEndForcesN':axial_end,'physicalGKN':half['physicalGKN'],
            'strengthAccepted':False,'scope':'Same coupled displacement state, actual modeled-steel G only; unmodeled weather gravity and distributed roof wind absent.'}
        lines=[[a,b,physical_g_factor*q] for a,b,q in half['lineLoads']]
        points=[[x,physical_g_factor*force] for x,force in half['pointLoads']]
        if half['finite']:
            modes={tag:(terms,k) for tag,terms,k in p['nonAxial'](maps['heel'],maps['crown'])}
            terms,matrix=modes['strong'];values=np.array([sum(full_displacements[i]*v for i,v in row) for row in terms])
            ku=np.asarray(matrix)@values;equivalent=np.asarray(half['equivalentStrongN_Nmm'])*physical_g_factor;actual=ku-equivalent
            item.update(elasticStrongEndVectorN_Nmm=ku.tolist(),gravityEquivalentStrongEndVectorN_Nmm=equivalent.tolist(),
                actualStrongEndVectorN_Nmm=actual.tolist(),**_finite_moment_diagram(length,lines,points,actual))
            for tag in ('weak','torsion'):
                terms,matrix=modes[tag];values=np.array([sum(full_displacements[i]*v for i,v in row) for row in terms])
                item[tag+'EndVectorN_Nmm']=(np.asarray(matrix)@values).tolist()
        else:item['localGravityBending']=pin_half_bending(length,lines,points)
        rows.append(item)
    return rows
