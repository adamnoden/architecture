"""Explicit slab-section replacement on the current joined physical topology.

The retained RC200 builder supplies topology only. This method rebuilds both
plate operators and their work maps, replaces actual plate gravity and records
the new section datums. It does not adopt a finish/stair/service or weather edit.
"""
import copy
import math

from joined_successor_kernel import cross
from perforated_floor_condensation import compile_perforated_floor
from rc_floor_house_loads import _add, _family_wrench
from retained_components import evaluate_retained_components
from vertical_floor_plate import assemble_vertical_plate, condense_vertical_plate
from vertical_floor_numerics import install_vertical_plate_energy,DIRECT_PLATE_POLICY
from vertical_rc_floor import retained_receiver_operator_participation


def necessary_strain_section(reinforcement):
    """Singly reinforced zero-N strip; no opposite mat or axial benefit.

    Uses the same .8x rectangular block, .0035 concrete strain and 200GPa
    steel law as the retained physical frame comparison. This is a necessary
    section screen, not a floor design or adopted ductility standard.
    """
    s=reinforcement['settings'];row=reinforcement['section'];b=1000.
    d=row['adverseInnerEffectiveDepthMm'];area=row['barAreaPerMetreEachFaceDirectionMm2']
    fc=s['concreteCompressionMPa'];limit=s['steelYieldMPa']*s['strengthSteelFraction']
    def at(x):
        strain=.0035*(d/x-1);stress=min(limit,max(0.,strain*200000.))
        tension=area*stress;compression=fc*.8*x*b
        return compression-tension,strain,stress,compression
    lo,hi=1e-9,d
    for _ in range(70):
        mid=(lo+hi)/2
        if at(mid)[0]<0:lo=mid
        else:hi=mid
    x=(lo+hi)/2;residual,strain,stress,compression=at(x)
    capacity=compression*(d-.4*x)/1e6;demand=reinforcement['momentInspectionKNmPerM']
    return {'schema':'str-necessary-zero-axial-strip-section/1','breadthMm':b,
        'adverseEffectiveDepthMm':d,'steelAreaMm2':area,'neutralAxisMm':x,
        'neutralAxisToEffectiveDepth':x/d,'ultimateTensionStrain':strain,
        'steelStressMPa':stress,'sourceSteelLimitMPa':limit,'steelYields':abs(stress-limit)<1e-7,
        'forceResidualN':residual,'strainCompatibleCapacityKNmPerM':capacity,
        'rawPointBendingPlusTwistingDemandKNmPerM':demand,'necessaryCapacityComparatorPasses':capacity>=demand,
        'reserveRatio':capacity/demand-1 if demand else None,
        'localStressConvergenceProven':False,'reinforcementAccepted':False,
        'scope':'Single tension direction, no compression-mat/axial benefit, same source rectangular material law. Raw local point demand is not a converged design strip. No adopted ductility, shear, punching, crack, deflection, development or joint acceptance.'}


def _energy_springs(frame,prefix,modes,port_terms):
    frame.springs=[r for r in frame.springs if not r['id'].startswith(prefix)]
    for index,mode in enumerate(modes):
        terms={}
        for coefficient,rows in zip(mode,port_terms):
            for node,row in rows:
                target=terms.setdefault(node,[0.]*6)
                for axis,value in enumerate(row):target[axis]+=coefficient*value
        frame.springs.append({'id':prefix+str(index),'terms':list(terms.items()),
            'stiffness':1.,'mode':'bilateral','gap':0.})


def _replace_vertical_plate_energy(frame,data,operator):
    policy=install_vertical_plate_energy(frame,operator,data['portTerms'],data.get('plateEnergyRepresentationPolicy',DIRECT_PLATE_POLICY))
    data['plateEnergyRepresentationPolicy']=policy;data['operator']=operator
    return policy


def _membrane_maps(model,midplane):
    frame=model['model'];terms=[]
    for port in model['joinedFloor']['floor']['ports']:
        node=port['node'];master=frame.nodes[node]
        point=[*port['originXYMm'],midplane];dx,dy,dz=[a-b for a,b in zip(point,master)]
        terms.extend([[(node,[1,0,0,0,dz,-dy])],[(node,[0,1,0,-dz,0,dx])],[(node,[0,0,0,0,0,1000])]])
    return terms


def _pressure_offset_couples(model,rows,target,midplane):
    """Same explicit face/corner and finite-north route, at the actual new plane."""
    corners=model['joinedFloor']['corners'];records=[]
    north=model['wallFrames']['outer-north'];datum=north['west']['pier']['footCentroidXYMm'][1]
    receiver=next(r for r in model['joinedFloor']['floor']['finiteBeamBoundaryReceivers'] if abs(r['datum']-datum)<1e-6)
    end0,end1=receiver['lo'],receiver['hi']
    for row in rows:
        force=row['forceKN'];axis=0 if force[0] else 1;low,high=row['loadedAlongIntervalMm'];point=row['pointXYZMm']
        is_north=axis==1 and abs(point[1]-datum)<1e-6
        cuts=sorted({low,high,*[u for u in (end0,end1) if low<u<high]}) if is_north else [low,high]
        for a,b in zip(cuts,cuts[1:]):
            fraction=(b-a)/(high-low);middle=(a+b)/2
            moment=cross([0,0,point[2]-midplane],[v*fraction for v in force])
            if is_north and end0<=middle<=end1:
                xs=north['beamXMm'];nodes=north['beamNodes'];stations=sorted({a,b,*[x for x in xs if a<x<b]})
                for c,d in zip(stations,stations[1:]):
                    x=(c+d)/2
                    if x<=xs[0]:shares=[(nodes[0],1.)]
                    elif x>=xs[-1]:shares=[(nodes[-1],1.)]
                    else:
                        i=next(i for i in range(len(xs)-1) if xs[i]<=x<=xs[i+1]);v=(x-xs[i])/(xs[i+1]-xs[i]);shares=[(nodes[i],1-v),(nodes[i+1],v)]
                    for node,factor in shares:_add(target,node,[0,0,0,*[v*(d-c)/(b-a)*factor for v in moment]])
            else:
                side=[c for c in corners if abs(c['originXYMm'][axis]-point[axis])<1e-6]
                side.sort(key=lambda c:c['originXYMm'][1-axis])
                if len(side)!=2:raise ValueError('No actual finite corner pair for transformed source pressure')
                lo,hi=[c['originXYMm'][1-axis] for c in side];v=(middle-lo)/(hi-lo)
                for corner,factor in zip(side,(1-v,v)):_add(target,corner['node'],[0,0,0,*[m*factor for m in moment]])
            records.append({'sourceId':row['id'],'intervalMm':[a,b],'sourceZMm':point[2],
                'actualMembraneMidplaneZMm':midplane,'offsetMm':point[2]-midplane,'momentKNmm':moment})
    return records


def replace_floor_section(model,source,thickness_mm):
    """Replace the unmodified current RC200 topology with an explicit200..250 trial."""
    if type(thickness_mm) not in (int,float) or not math.isfinite(thickness_mm) or not 200<=thickness_mm<=250:
        raise ValueError('Explicit finite supported200..250mm slab section required')
    if 'floorSectionSuccessor' in model:raise ValueError('Floor section already transformed; rebuild from the admitted topology')
    data=model['verticalFloor'];frame=model['model'];old=data['operator'];assembled=old['assembled']
    if assembled['law']['thicknessMm']!=200 or data['mass']['floorSlabThicknessMm']!=200:
        raise ValueError('The retained topology is no longer its declared RC200 control')
    soffit=3170.;top=soffit+thickness_mm;mid=(soffit+top)/2;law={**assembled['law'],'thicknessMm':thickness_mm}
    retained=assembled['portCount'];old_terms=assembled['pointTerms']
    def boundary(point,axis):
        terms=old_terms[point,axis]
        return list(terms) if all(i<retained for i,_ in terms) else None
    fresh=assemble_vertical_plate(data['cells'],law,boundary,retained)
    if fresh['pointTerms']!=old_terms or fresh['freePointDofs']!=assembled['freePointDofs']:
        raise ValueError('Section edit changed topology/coordinate identity; explicit remeshing required')
    rigid=[]
    for kind in range(3):
        rigid.append([(1 if kind==0 else .001*r['xyMm'][1] if kind==1 else -.001*r['xyMm'][0])
            if r['coordinate'] in (None,0) else (1 if r['coordinate']==kind else 0) for r in data['ports']])
    operator=condense_vertical_plate(fresh,rigid)
    g_before=_family_wrench(model,model['families']['physical-G'])
    for vector,factor in ((old['condensedSelfG'],-1.),(operator['condensedSelfG'],1.)):
        for value,terms in zip(vector,data['portTerms']):
            for node,row in terms:_add(model['families']['physical-G'],node,[factor*value*v for v in row])
    energy_policy=_replace_vertical_plate_energy(frame,data,operator)
    data['request']={**data['request'],'plateLaw':law}
    for trace in data['retainedPointReceivers'].values():
        old_audit=trace['physicalPlateParticipation'];indices=old_audit['portIndices']
        physical=fresh['pointTerms'].get((tuple(trace['xyMm']),0))
        if physical is None:
            # The existing finite north member can be a retained boundary
            # without a slab mesh corner. Recover its UNIQUE coefficient row
            # from the already-proved port-to-frame map, not a nearest point.
            import numpy as np
            nodes=sorted({n for i in indices for n,_ in data['portTerms'][i]}|{n for n,_ in trace['terms']})
            lookup={n:6*i for i,n in enumerate(nodes)};matrix=np.zeros((6*len(nodes),len(indices)));target=np.zeros(6*len(nodes))
            for j,i in enumerate(indices):
                for node,row in data['portTerms'][i]:matrix[lookup[node]:lookup[node]+6,j]+=row
            for node,row in trace['terms']:target[lookup[node]:lookup[node]+6]+=row
            coefficients,_,rank,_=np.linalg.lstsq(matrix,target,rcond=1e-12)
            if rank!=len(indices) or max(abs(matrix@coefficients-target))>1e-9:
                raise ValueError('Finite receiving trace has no unique exact actual port map')
            physical=[(i,float(v)) for i,v in zip(indices,coefficients)]
        trace['physicalPlateParticipation']=retained_receiver_operator_participation(tuple(trace['xyMm']),physical,fresh,operator)
    inplane=model['joinedFloor'];old_floor=inplane['floor'];request=model['houseLoadCase']['joinedCase']['floor']
    floor_source=source['base']['vertical']['parent']['house']['joined']['floor']
    physical=evaluate_retained_components(request['componentCase'],floor_source['retained'])
    bodies=[r['geometry']['bodyRectangleXYMm'] for r in physical['components'] if r['kind']=='first-floor']
    bands=[{**r,'depth':thickness_mm} for r in old_floor['bands']]
    membrane_law={**old_floor['unqualifiedLaw'],'thicknessMm':thickness_mm}
    floor=compile_perforated_floor(bodies,copy.deepcopy(old_floor['omissionsXYMm']),bands,
        copy.deepcopy(old_floor['ports']),membrane_law,request['maxPitchMm'],
        model['housePressure']['reconciledFloorRows'],copy.deepcopy(old_floor['finiteBeamBoundaryReceivers']))
    modes=floor.pop('energyModes');inplane['floor']=floor;inplane['portTerms']=_membrane_maps(model,mid)
    _energy_springs(frame,'JOINED-FLOOR/energy/',modes,inplane['portTerms'])
    loads={}
    for coefficient,terms in zip(floor['condensedForceKN'],inplane['portTerms']):
        for node,row in terms:_add(loads,node,[coefficient*v for v in row])
    projection=_pressure_offset_couples(model,model['housePressure']['reconciledFloorRows'],loads,mid)
    expected=[0.]*6
    for row in model['housePressure']['reconciledFloorRows']:
        f=row['forceKN'];m=cross(row['pointXYZMm'],f)
        for i,v in enumerate([*f,*[v/1000 for v in m]]):expected[i]+=v
    actual=_family_wrench(model,loads);pressure_residual=[a-b for a,b in zip(actual,expected)]
    if max(abs(v) for v in pressure_residual)>1e-6:raise ValueError('Transformed membrane loses source pressure force/first moments')
    model['families']['native-floor-reconciled']=loads;model['housePressure']['projectionCouples']=projection
    g_after=_family_wrench(model,model['families']['physical-G']);g_delta=[b-a for a,b in zip(g_before,g_after)]
    weight=fresh['physicalSelfGKN']-assembled['physicalSelfGKN'];cx,cy=fresh['centroidXYMm']
    residual=[a-b for a,b in zip(g_delta,[0,0,-weight,-weight*cy/1000,weight*cx/1000,0])]
    if max(abs(v) for v in residual)>1e-6:raise ValueError('Section replacement duplicates or loses plate mass/first moments')
    data['mass'].update(newPlatePhysicalSelfGKN=fresh['physicalSelfGKN'],floorSlabThicknessMm=thickness_mm)
    result={'schema':'str-floor-section-successor/1','soffitZMm':soffit,'topZMm':top,'midplaneZMm':mid,
        'thicknessMm':thickness_mm,'plateSelfGKN':fresh['physicalSelfGKN'],'addedPlateGKN':weight,
        'sourceGravityResidualKN_KNm':residual,'sourcePressureResidualKN_KNm':pressure_residual,
        'steelChordAxialRigidityKN':membrane_law['edgeAxialRigidityKN'],
        'northernUpstandGeometryChanged':False,'sourceFFLMm':3450.,'remainingSourceFinishDepthMm':3450.-top,
        'verticalPlateEnergyRepresentationPolicy':energy_policy,
        'finishStairServiceEvidenceApplicable':thickness_mm==200.,'candidateAccepted':False}
    model['floorSectionSuccessor']=result
    return result
