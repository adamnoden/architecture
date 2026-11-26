"""Replay saved whole-house finite-joint actions without re-solving a component."""
import json
import math
import numpy as np


def cross(a,b):
    return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]


def wrench(force,point):return np.array([*force,*cross(point,force)])


def replay(result):
    """Independent metadata-based freebody and actual saved constitutive replay."""
    if result['schema']!='str-current-finite-rc-joint/1' or not result['settings']['enabled']:
        raise ValueError('Actual enabled finite whole-house capture required')
    joint=result['finiteJoint'];ports=joint['ports'];n=len(ports)
    if n!=len({p['id'] for p in ports}):raise ValueError('Duplicate actual physical port')
    k=np.asarray(joint['condensedStiffnessKN_KNm']);q=np.asarray(joint['portDisplacementsM_Rad']);f=np.asarray(joint['condensedPhysicalLoadKN_KNm']);r=np.asarray(joint['portReactionKN_KNm'])
    if k.shape!=(n,n) or any(a.shape!=(n,) for a in (q,f,r)) or not all(np.isfinite(a).all() for a in (k,q,f,r)):
        raise ValueError('Complete finite saved physical arrays required')
    constitutive=float(abs(k@q-f-r).max())
    if constitutive>1e-7:raise ValueError('Saved port displacement/stiffness/load/reaction mismatch')
    groups={};total=np.zeros(6)
    for p,value in zip(ports,r):
        axis=('u','v','w','rx','ry','rz').index(p['coordinate']);point=p.get('originM') or [*p['xyM'],p['zM']]
        force=[0.]*3
        if axis<3:force[axis]=value;v=wrench(force,point)
        else:v=np.eye(6)[axis]*value
        name='/'.join(p['id'].split('/')[:2]) if p['kind'] in ('band','wall') else p['kind']
        groups[name]=groups.get(name,np.zeros(6))+v;total+=v
    geometry=result['audit']['solidGeometry'];a,b,c,d=geometry['patchXYMm'];z0,z1=geometry['slabZMm'];area=(c-a)*(d-b)/1e6
    case=result['executedConventionalCase'];vertical=case['bearingCase']['masonryCase']['verticalCase'];house=vertical['monolithicCase']['houseCase']
    factor=house['boundary']['physicalGFactor']
    # The executed native request owns plate law at this exact level.
    rho=vertical['plateLaw']['unitWeightKNPerM3']
    centre=[(a+c)/2000,(b+d)/2000,(z0+z1)/2000]
    gravity=wrench([0.,0.,-area*(z1-z0)/1000*rho],centre)
    stub_height=(geometry['upperEndZMm']-z1)/1000
    for x0,y0,x1,y1 in geometry['lowerLRectanglesXYMm']:
        weight=(x1-x0)*(y1-y0)/1e6*stub_height*case['bearingCase']['roofControls']['upperUnitWeightKNPerM3']
        gravity+=wrench([0.,0.,-weight],[(x0+x1)/2000,(y0+y1)/2000,(z1+geometry['upperEndZMm'])/2000])
    upper=np.zeros(6);inventory=result['native']['upperMasonry']['inventory']
    for row in inventory['freeTopBodyBoxes']:
        x0,y0,lo,x1,y1,hi=row['boxXYZMm'];left=max(a,x0);right=min(c,x1);bottom=max(b,y0);top=min(d,y1)
        if right<=left or top<=bottom:continue
        weight=(right-left)*(top-bottom)*(hi-lo)/1e9*inventory['densityKNPerM3']
        upper+=wrench([0.,0.,-weight],[(left+right)/2000,(bottom+top)/2000,(lo+hi)/2000])
    live=wrench([0.,0.,-area*1.5*vertical['freshUniformLiveKPa']],centre);wind=np.zeros(6)
    for row in joint['insideWindRows']:
        point=[v/1000 for v in row['pointXYZMm']];point[2]=(z0+z1)/2000
        wind+=wrench(row['forceKN'],point)
    external=factor*(gravity+upper)+live+wind;balance=total+external
    loadsum=sum((np.asarray(v['condensedLoadKN_KNm']) for v in joint['loadFamilies'].values()),np.zeros(n))
    if max(abs(loadsum-f))>1e-8:raise ValueError('Physical load families missing or double applied')
    if max(abs(external-np.asarray(joint['externalWrenchKN_KNm'])))>1e-7 or max(abs(balance))>1e-6:
        raise ValueError('Independent actual material/wind/joint six-wrench balance fails')
    work=abs(float(q@r)+joint['externalLoadWorkKNm']-2*joint['strainEnergyKNm'])
    if work>1e-7:raise ValueError('Saved actual loaded joint work fails')
    heads=result['native']['nativeVertical']['native']['heads']
    if len(heads)!=52 or len({h['id'] for h in heads})!=52:raise ValueError('Actual52-head case required')
    vertical=result['native']['nativeVertical'];native=vertical['native']
    positions=vertical['headPositions'];by_id={p['id']:p for p in positions}
    if len(positions)!=52 or len(by_id)!=52 or set(by_id)!={h['id'] for h in heads}:raise ValueError('Actual head position catalogue incomplete')
    head_wrench=np.zeros(6)
    for head in heads:
        point=np.asarray(by_id[head['id']]['xyzMm'],dtype=float)/1000
        reaction=np.asarray(head['reactionKN_KNm'],dtype=float)
        if point.shape!=(3,) or reaction.shape!=(6,) or not np.isfinite(point).all() or not np.isfinite(reaction).all():raise ValueError('Finite actual head coordinates and reaction required')
        head_wrench+=wrench(reaction[:3],point)+np.array([0.,0.,0.,*reaction[3:]])
    applied=np.asarray(native['externalWrenchKN_KNm'],dtype=float)
    if applied.shape!=(6,) or not np.isfinite(applied).all():raise ValueError('Finite actual applied house wrench required')
    house_balance=head_wrench+applied
    saved=np.asarray(native['equilibriumResidualKN_KNm'],dtype=float)
    if saved.shape!=(6,) or not np.isfinite(saved).all() or max(abs(house_balance))>1e-6 or max(abs(saved-house_balance))>1e-7:raise ValueError('Replayed actual house six-wrench balance fails')
    actual=set(result['audit']['actualNormalContactIds']);bearings=[b for b in result['native']['nativeVertical']['bearings'] if b['id'] in actual]
    if len(bearings)!=len(actual):raise ValueError('Actual contact catalogue incomplete')
    local_cuts={level:[float(r[next(i for i,p in enumerate(ports) if p['id']=='wall/'+level+'/'+coordinate)]) for coordinate in ('u','v','w','rx','ry','rz')] for level in ('lower','upper')}
    return {'wallCutActionsAboutActualCutKN_KNm':local_cuts,'portCount':n,'constitutiveResidualKN_KNm':constitutive,'independentJointWrenchResidualKN_KNm':balance.tolist(),'replayedHouseWrenchResidualKN_KNm':house_balance.tolist(),
            'outsideOnSolidPortGroupsKN_KNm':{k:v.tolist() for k,v in groups.items()},'externalWrenchKN_KNm':external.tolist(),
            'jointWorkResidualKNm':work,'actualNormalCount':len(actual),'activeActualNormalCount':sum(b['active'] for b in bearings)}


if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('capture');args=parser.parse_args()
    print(json.dumps(replay(json.load(open(args.capture))),indent=2,allow_nan=False))
