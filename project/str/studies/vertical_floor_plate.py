import math
from itertools import pairwise

from perforated_floor_condensation import _add, _schur, positive_energy_modes


GAUSS=(-1/math.sqrt(3),1/math.sqrt(3))


def rectangle_shapes(xi,eta,width,height):
    signs=((-1,-1),(1,-1),(1,1),(-1,1))
    return ([(1+a*xi)*(1+b*eta)/4 for a,b in signs],
        [a*(1+b*eta)/(2*width) for a,b in signs],
        [b*(1+a*xi)/(2*height) for a,b in signs])


def mitc4_element(rectangle,law):
    x0,y0,x1,y1=rectangle;width=x1-x0;height=y1-y0
    if min(width,height)<=0:raise ValueError('A positive rectangular plate cell is required')
    e=law['elasticModulusMPa']/1000;nu=law['poissonRatio'];t=law['thicknessMm']
    d=e*law['flexuralFactor']*t**3/(12*(1-nu*nu));g=e/(2*(1+nu));s=g*law['shearFactor']*t
    bending=[[d,d*nu,0],[d*nu,d,0],[0,0,d*(1-nu)/2]]
    def shear(xi,eta,axis):
        n,dx,dy=rectangle_shapes(xi,eta,width,height);row=[0.]*12
        for i in range(4):
            row[3*i]=(dx if axis==0 else dy)[i];row[3*i+(2 if axis==0 else 1)]=n[i]*(1 if axis==0 else -1)
        return row
    tied_x=[shear(0,side,0) for side in (-1,1)];tied_y=[shear(side,0,1) for side in (-1,1)]
    matrix=[[0.]*12 for _ in range(12)];unit_load=[0.]*12
    for xi in GAUSS:
        for eta in GAUSS:
            n,dx,dy=rectangle_shapes(xi,eta,width,height);b=[[0.]*12 for _ in range(3)];area=width*height/4
            for i in range(4):b[0][3*i+2]=dx[i];b[1][3*i+1]=-dy[i];b[2][3*i+2]=dy[i];b[2][3*i+1]=-dx[i];unit_load[3*i]+=n[i]*area
            gamma=[[sum((1+side*eta)/2*tied_x[k][i] for k,side in enumerate((-1,1))) for i in range(12)],
                [sum((1+side*xi)/2*tied_y[k][i] for k,side in enumerate((-1,1))) for i in range(12)]]
            db=[[sum(bending[k][j]*b[j][i] for j in range(3)) for i in range(12)] for k in range(3)]
            for i in range(12):
                for j in range(12):matrix[i][j]+=area*(sum(b[k][i]*db[k][j] for k in range(3))+s*sum(row[i]*row[j] for row in gamma))
    return matrix,unit_load


def plate_cells(bodies,holes,max_pitch_mm,extra_coordinates=((),())):
    if not bodies:raise ValueError('Actual source floor bodies are required')
    bounds=[min(row[axis] for row in bodies) for axis in (0,1)]+[max(row[axis] for row in bodies) for axis in (2,3)]
    columns=[]
    for axis in (0,1):
        raw={bounds[axis],bounds[axis+2]}
        raw.update(value for row in bodies+holes for value in row[axis::2] if bounds[axis]<=value<=bounds[axis+2])
        raw.update(value for value in extra_coordinates[axis] if bounds[axis]<=value<=bounds[axis+2])
        coordinates=[]
        for a,b in pairwise(sorted(raw)):
            n=max(1,math.ceil((b-a)/max_pitch_mm));coordinates.extend(a+(b-a)*i/n for i in range(n))
        columns.append(coordinates+[bounds[axis+2]])
    inside=lambda p,r:r[0]<p[0]<r[2] and r[1]<p[1]<r[3]
    cells=[]
    for x0,x1 in pairwise(columns[0]):
        for y0,y1 in pairwise(columns[1]):
            p=((x0+x1)/2,(y0+y1)/2)
            if any(inside(p,r) for r in bodies) and not any(inside(p,r) for r in holes):cells.append([x0,y0,x1,y1])
    return cells,columns


def assemble_vertical_plate(cells,law,boundary_terms=None,port_count=0):
    required={'elasticModulusMPa','poissonRatio','thicknessMm','flexuralFactor','shearFactor','unitWeightKNPerM3'}
    if not isinstance(law,dict) or set(law)!=required or any(type(v) not in (int,float) or not math.isfinite(v) for v in law.values()) or not 0<=law['poissonRatio']<.5 or any(law[k]<=0 for k in required-{'poissonRatio'}):raise ValueError('Explicit finite plate material/thickness/cracking/shear/density law required')
    if law['flexuralFactor']>1 or law['shearFactor']>1:raise ValueError('No plate stiffness enhancement is supported')
    points=sorted({point for x0,y0,x1,y1 in cells for point in ((x0,y0),(x1,y0),(x1,y1),(x0,y1))});dofs={};next_dof=port_count;point_terms={}
    for point in points:
        for axis in range(3):
            terms=boundary_terms(point,axis) if boundary_terms else None
            if terms is None:terms=[(next_dof,1.)];dofs[point,axis]=next_dof;next_dof+=1
            if any(not 0<=i<port_count or not math.isfinite(value) for i,value in terms) and (point,axis) not in dofs:raise ValueError('Unsupported retained plate boundary coordinate')
            point_terms[point,axis]=terms
    matrix={i:{} for i in range(next_dof)};force={};elements=[];area=mx=my=0.
    pressure=-law['unitWeightKNPerM3']*law['thicknessMm']/1e9
    for rectangle in cells:
        x0,y0,x1,y1=rectangle;corners=((x0,y0),(x1,y0),(x1,y1),(x0,y1));terms=[point_terms[p,axis] for p in corners for axis in range(3)]
        local,unit=mitc4_element(rectangle,law);_add(matrix,terms,local)
        for row,value in zip(terms,unit):
            for i,coefficient in row:force[i]=force.get(i,0.)+coefficient*value*pressure
        a=(x1-x0)*(y1-y0);area+=a;mx+=a*(x0+x1)/2;my+=a*(y0+y1)/2
        elements.append({'rectangleXYMm':rectangle,'terms':terms})
    original=max(abs(value) for row in matrix.values() for value in row.values());skew=0.
    pairs={(min(i,j),max(i,j)) for i,row in matrix.items() for j in row}
    for i,j in pairs:
        a=matrix[i].get(j,0.);b=matrix[j].get(i,0.);skew=max(skew,abs(a-b));value=(a+b)/2
        if value:matrix[i][j]=value;matrix[j][i]=value
        else:matrix[i].pop(j,None);matrix[j].pop(i,None)
    if skew/max(1.,original)>1e-10:raise ValueError('Physical plate assembly loses symmetry')
    return {'assemblySymmetryRelativeError':skew/max(1.,original),'freePointDofs':dofs,'matrix':matrix,'force':force,'pointTerms':point_terms,'elements':elements,'points':points,'portCount':port_count,
        'dofCount':next_dof,'law':law,'areaM2':area/1e6,'centroidXYMm':[mx/area,my/area],
        'physicalSelfGKN':-pressure*area,'pressureKNPerMm2':pressure}


def condense_vertical_plate(assembled,rigid_port_vectors,backend='scipy'):
    if backend=='scipy':
        from vertical_floor_numerics import sparse_schur,spectral_energy_modes
        condensed,load,recovery=sparse_schur(assembled);modes,error=spectral_energy_modes(condensed)
        residuals=[max(abs(sum(a*b for a,b in zip(row,vector))) for row in condensed) for vector in rigid_port_vectors]
        if max(residuals)>1e-3:raise ValueError('Sparse verticalplate condensation restrained a physical rigid mode')
        return {'condensedStiffness':condensed,'condensedSelfG':load,'energyModes':modes,'modeReconstructionRelativeError':error,
            'rigidModeResidualKN':residuals,'loadOnlyCondensationEnergyKNmm':recovery['loadOnlyEnergy'],'sparseRecovery':recovery,'assembled':assembled}
    if backend!='stdlib':raise ValueError('Unsupported explicit verticalplate algebra backend')
    count=assembled['portCount'];retained=list(range(count));matrix=assembled['matrix'];interiors=set(matrix)-set(retained);graph={i:set(row)-{i} for i,row in matrix.items()};order=[]
    while interiors:
        index=min(interiors,key=lambda i:(len(graph[i]),i));neighbours=graph[index]
        for a in neighbours:graph[a].discard(index);graph[a].update(neighbours-{a})
        del graph[index];interiors.remove(index);order.append(index)
    condensed,load,steps=_schur(matrix,retained,[1.]*len(matrix),order,assembled['force']);modes,error=positive_energy_modes(condensed)
    residuals=[max(abs(sum(a*b for a,b in zip(row,vector))) for row in condensed) for vector in rigid_port_vectors]
    if max(residuals)>1e-3:raise ValueError('Vertical plate condensation restrained a physical rigid mode')
    force=dict(assembled['force']);constant=0.
    for index,pivot,neighbours in steps:
        f=force.pop(index,0.);constant+=f*f/(2*pivot)
        for a,k in neighbours:force[a]=force.get(a,0.)-k*f/pivot
    return {'condensedStiffness':condensed,'condensedSelfG':load,'energyModes':modes,'modeReconstructionRelativeError':error,
        'rigidModeResidualKN':residuals,'loadOnlyCondensationEnergyKNmm':constant,'steps':steps,'assembled':assembled}


def recover_vertical_plate(operator,port_displacements):
    assembled=operator['assembled'];u={i:value for i,value in enumerate(port_displacements)};forces=dict(assembled['force']);eliminated=[]
    for index,pivot,neighbours in operator.get('steps',[]):
        f=forces.pop(index,0.);eliminated.append((index,pivot,neighbours,f))
        for a,k in neighbours:forces[a]=forces.get(a,0.)-k*f/pivot
    for index,pivot,neighbours,f in reversed(eliminated):u[index]=(f-sum(k*u[j] for j,k in neighbours))/pivot
    if 'sparseRecovery' in operator:
        import numpy as np
        recovery=operator['sparseRecovery'];n=assembled['portCount'];f=np.array([assembled['force'].get(i,0.) for i in range(n,assembled['dofCount'])])*recovery['interiorScale']
        values=recovery['factor'].solve(f-recovery['interiorCoupling']@np.array(port_displacements))*recovery['interiorScale']
        u.update({n+i:float(value) for i,value in enumerate(values)})
    energy=sum(value*u[i]*u[j]/2 for i,row in assembled['matrix'].items() for j,value in row.items());external=sum(value*u[i] for i,value in assembled['force'].items())
    reaction=[sum(value*u[j] for j,value in assembled['matrix'][i].items())-assembled['force'].get(i,0.) for i in range(assembled['portCount'])]
    work=sum(value*u[i] for i,value in enumerate(reaction))+external
    if abs(2*energy-work)>1e-7*max(1.,abs(work)):raise ValueError('Recovered physical plate strainenergy/work mismatch')
    points=[{'xyMm':list(point),'displacementMmRad':[sum(value*u[i] for i,value in assembled['pointTerms'][point,axis]) for axis in range(3)]} for point in assembled['points']]
    return {'points':points,'physicalPlateStrainEnergyKNmm':energy,'externalLoadWorkKNmm':external,'portGeneralizedReactions':reaction,
        'workRelativeResidual':abs(2*energy-work)/max(1.,abs(work)),'maximumDeflectionMm':max(abs(row['displacementMmRad'][0]) for row in points)}
