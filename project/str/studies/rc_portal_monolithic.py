import hashlib
import json
import math
from pathlib import Path
import sys

from joined_rc_floor import _solve_joined_rc_floor_fixed
from distributed_floor_compatibility import native_intermediate_support_ports
from joined_rc_floor_views import draw_joined_rc_floor
from joined_successor_kernel import rectangle_section
from rc_floor_house_loads import build_rc_floor_house, load_rc_floor_house_source, rc_floor_house_diagnostics, rc_house_schedule, reference_rc_floor_house_case, register_member_gravity, solve_rc_floor_house


METHOD='project/str/studies/rc_portal_monolithic.py'


def load_monolithic_rc_source(root):
    root=Path(root);house=load_rc_floor_house_source(root)
    return {'root':root,'house':house,'identities':{**house['identities'],METHOD:hashlib.sha256((root/METHOD).read_bytes()).hexdigest()}}


def reference_monolithic_rc_case(source):
    return {'schema':'str-monolithic-rc-portal-case/1','sourceSHA256':source['identities'],
        'houseCase':reference_rc_floor_house_case(source['house']),
        'jointMode':'finite-RC-20mm-former-DPC-continuity-diagnostic',
        'waterControl':'coordinate-defined-metal-puddle-and-sealed-rod-concept-unqualified',
        'barGeometry':{'diameterMm':12,'nominalCoverMm':45,'minimumCoverMm':40,'roundedLinkBarFaceMm':69},
        'use':'unqualified-continuous-RC-structural-replacement'}


def _barrier_duties(model):
    duties=[];width=model['widthEdit']['coreAxialWidthMm'];glass=model['widthEdit']['cellularGlassFaceThicknessMm']
    for footprint in model['widthEdit']['footprints']:
        x0,y0,x1,y1=footprint['authoredCoreFootprintXYMm'];west='/west' in footprint['pierId'];cy=(y0+y1)/2
        warm=[x0,y0,x0+140,y1] if west else [x1-140,y0,x1,y1]
        plate=[x0-20,y0-100,x1+100,y1+100] if west else [x0-100,y0-100,x1+20,y1+100]
        source_geometry=model['barrierSourceGeometry'];normal=source_geometry['courtFaces'] if '/court-north/' in footprint['pierId'] else source_geometry['gardenFaces']
        side=source_geometry['westFinishedFaces'] if west else source_geometry['eastFinishedFaces']
        envelope=[side[0],normal[0],side[1],normal[1]]
        if abs((normal[0]+normal[1])/2-cy)>1e-8 or normal[1]-normal[0]!=775:
            raise ValueError('Source finishedportal faces drifted from actual corecentre/775 envelope')
        if any(a<b-1e-8 for a,b in zip(plate[:2],envelope[:2])) or any(a>b+1e-8 for a,b in zip(plate[2:],envelope[2:])):
            raise ValueError('Proposedunloadedflange intrudes beyondactual sourcefinishedportal')
        reserve=plate[0]-envelope[0] if west else envelope[2]-plate[2]
        wall='court-north' if '/court-north/' in footprint['pierId'] else 'outer-north'
        bars=[[x,cy+sign*(width/2-69),-40] for x in (x0+69,x1-69) for sign in (-1,1)]
        duties.append({'pierId':footprint['pierId'],'groundContext':'Open-loggia perimeter frame overlaps140mm heated-side structural wall core and72.5mm exposed jamb extension; not wholly outside the conditioned construction.',
            'sourceHeatedSideCoreOverlapXYMm':warm,'sourceFinishedEnvelopeXYMm':envelope,
            'roomFinishNominalFlangeReserveMm':reserve,'actualUpstandTopZMm':model['wallFrames'][wall]['west']['topMm'],'authoredCoreFootprintXYMm':footprint['authoredCoreFootprintXYMm'],
            'barrierCorePlaneZMm':[-50,-30],'barrierPerimeterPlanXYMm':plate,
            'source140WarmCoreRemainsCapillaryDuty':True,
            'proposedUnloadedFlangePaths':[
                {'side':'heated-room','horizontalReturnMm':20,'verticalFoldMm':80,'scope':'100mm geometric return path within source27mm roomfinish zone; productlap/bend/thickness and air/water proof absent'},
                {'side':'opening-jamb','horizontalReturnMm':100,'remainingSourceRadialWrapMm':180},
                {'side':'normal-faces','horizontalReturnMm':100,'remainingFaceWrapMm':glass+40-100}],
            'continuousH12BarSealInterfacesXYZMm':bars,'sealDetailDiameterMm':None,'waterstopMetalThicknessMm':None,
            'metalSpecification':None,'weldOrSealProcess':None,'waterHeadAndLeakProof':None,'gasAndAirLapProof':None,
            'requiredProofs':[
                'A full non-capillary cut across the entire RCcore at the source−50..−30 plane, with all four continuousH12 rod interfaces sealed; coating only the outerpier faces does not stop internal capillary bypass.',
                'Actual plate/concrete bearing and barinterface behavior must replace the diagnostic20mmRC material before structural adoption. Continuousbar force need not be transferred by a sealweld, but its heat/process effects require sourceproof.',
                'Lap the unloaded perimeterflanges to the retained adjacentmasonry DPC and ground water/gas/air layers at this exact footprint; no blanket omission of other sourceDPCs.',
                'Resolve the room-side20+80fold and its computednominal roomfinish reserve with actual productthickness/setting tolerances and no plaster/mortar capillary bypass.',
                'Show sourcefirstfloordatum3170/3370 and the actual authored200upstandtop and orthogonal loggia-soffit/weatherwall interfaces on one source revision; trace thermal bridge and water/vapour returns through the warmcore overlap.',
                'Verify actualcellularglass202.5/lining40, metalflange thermalbridge, waterstop corrosion/compatibility and castsequence. No material, fabrication, leak or physical acceptance is supplied.'],
            'waterControlAccepted':False,'thermalAccepted':False,'unloadedSealFlanges':'No structural resistance credit; platecore/continuousbars and wetjoint material remain distinct physical duties.'})
    return duties


def build_monolithic_rc_portals(case,source):
    expected=reference_monolithic_rc_case(source)
    if not isinstance(case,dict) or set(case)!=set(expected) or any(case[key]!=expected[key] for key in ('schema','sourceSHA256','jointMode','waterControl','barGeometry','use')):
        raise ValueError('Exact source-bound monolithic diagnostic and unqualified barrier fields required')
    house=case['houseCase'];model=build_rc_floor_house(house,source['house'])
    h=source['house']['joined']['floor']['retained']['values']['project/had/studies/water-replan.json']['model']
    west=next(row for row in h['groundWalls'] if row['id']=='loggia-west-weather');east=next(row for row in h['groundWalls'] if row['id']=='loggia-east-weather')
    model['barrierSourceGeometry']={'westFinishedFaces':west['finishedFaces'],'eastFinishedFaces':east['finishedFaces'],
        'courtFaces':h['insulatedPortal']['courtFaces'],'gardenFaces':h['insulatedPortal']['gardenFaces']}
    if h['sections']['groundFFL']!=0 or h['sections']['groundFloorRC']['top']!=-180:
        raise ValueError('This source0ground-profile waterstop comparison cannot silentlyadopt the raised715proposal; transformactualground/barrier datums first')
    if house['coreAxialWidthMm']!=290 or house['northUpstandWidthMm']!=200 or house['joinedCase']['portal']['dpcIntervalZMm']!=[-50,-30]:
        raise ValueError('Only the worked290/200 geometry and actual20mm sourcegap are supported by this barrier/cage contract')
    frame=model['model'];frame.springs=[spring for spring in frame.springs if '/dpc/' not in spring['id'] and '/NORMAL/' not in spring['id']]
    bridges=[];total_volume=0.
    for pier in model['dpcNodes']:
        a,b=pier['low'],pier['high'];start=list(frame.nodes[a]);end=list(frame.nodes[b]);length=math.dist(start,end)
        if abs(length-20)>1e-8:raise ValueError('A rigid restraint cannot replace a changed physicaljoint')
        name=pier['low'].split('/-')[0]+'/finite-continuous-RC-former-DPC'
        frame.member(name,a,b,rectangle_section(212.5,290),model['request']['frameLaw'],physical_start=start,physical_end=end,y_axis=[0,1,0])
        model['members'][name]={'a':a,'b':b,'physicalStartMm':start,'physicalEndMm':end,'breadthMm':290,'depthMm':212.5,'kind':'post'}
        volume=212.5*290*length/1e9;total_volume+=volume;weight=volume*25
        register_member_gravity(model,name,already_lumped=False)
        bridges.append({'id':name,'physicalStartMm':start,'physicalEndMm':end,'sectionMm':[212.5,290],
            'finiteLengthMm':length,'RCVolumeM3':volume,'physicalGKN':weight,
            'scope':'Actual finite20mmRC continuity comparison, not a rigidbase or adopted waterstop material.'})
    model['monolithic']={'request':case,'bridges':bridges,'additionalRCVolumeM3':total_volume,'additionalPhysicalGKN':total_volume*25,
        'barrierDuties':_barrier_duties(model),'allOtherSourceDPCsPreserved':True,
        'actualCapCageAxesKnown':False,'actualCapPileInterfaceQualified':False}
    return model


def _monolithic_solver(model,source,name,multipliers):
    result=_solve_joined_rc_floor_fixed(model,source,name,multipliers)
    result.pop('dpc',None);result['portalNormalContactResults']=[]
    result['portalContact']={'normalMode':'finite-monolithic-RC-comparison','integration':'not-a-contact-joint','physicalRetentionProvided':False}
    result['bilateralFullContactDomainRejected']=None
    result['contactIntegrationStatus']='not-applicable-finite-RC-continuity'
    result['scopeOfFormerDPC']='No portalgap/shearspring/normalcontact remains. Fouractual20mmRC members transfer fullsixcomponent actions with continuousreinforcement assumed for diagnosticstiffness; actualall-metalbarrier/material/seal is not included or accepted.'
    return result


def solve_monolithic_rc_portals(model,source,name):
    context={**source['house'],'identities':source['identities']}
    result=solve_rc_floor_house(model,context,name,structural_solver=_monolithic_solver)
    result['request']=model['monolithic']['request'];result['sourceSHA256']=source['identities']
    source_schedule=result['schedule'];source_schedule['RCVolumeM3']+=model['monolithic']['additionalRCVolumeM3'];source_schedule['physicalGKN']+=model['monolithic']['additionalPhysicalGKN']
    result['monolithicRCBridgeMembers']=model['monolithic']['bridges'];result['barrierDuties']=model['monolithic']['barrierDuties']
    result['otherSourceDPCsPreserved']=True
    result['waterControlAccepted']=False;result['thermalAccepted']=False;result['actualCapCageAxesKnown']=False
    bridge_rows=[row for row in result['memberCuts'] if '/finite-continuous-RC-former-DPC' in row['memberId']]
    stress=[]
    for row in bridge_rows:
        area=212.5*290;iy=290*212.5**3/12;iz=212.5*290**3/12
        mean=row['axialCompressionKN']*1000/area;bending=abs(row['bendingYKNm'])*1e6*212.5/(2*iy)+abs(row['bendingZKNm'])*1e6*290/(2*iz)
        stress.append({'memberId':row['memberId'],'end':row['end'],'grossElasticNormalStressMPa':[mean-bending,mean+bending],
            'scope':'Gross RCelastic diagnostic only, not cracked/ultimate concretebearing or H12cage resistance.'})
    result['continuousSectionStressDiagnostics']=stress
    return result


def draw_monolithic_rc_floor(model,result):
    svg=draw_joined_rc_floor(model,result)
    old='Contact polygons inspect the solved plane; bedding/key strengths and actual minimumG are unqualified.'
    new='Four finite20mmRC bridges replace portal contact; waterstop/rod-seal/thermal duties remain unqualified.'
    if old not in svg:raise ValueError('Parentview text changed; update the explicit monolithic renderer')
    svg=svg.replace(old,new)
    additions=[]
    for i,bridge in enumerate(model['monolithic']['bridges']):
        left=45+215*i;top=925;w=212.5*.6;h=290*.4
        additions.append(f'<rect x="{left}" y="{top}" width="{w}" height="{h}" fill="#99b7b1" stroke="#344d54"/>')
        row=next(row for row in result['continuousSectionStressDiagnostics'] if row['memberId']==bridge['id'] and row['end']==0)
        additions.append(f'<text class="small" x="{left}" y="{top-12}">{bridge["id"].split("/")[0]}/{bridge["id"].split("/")[1]}</text>')
        additions.append(f'<text class="small" x="{left}" y="{top+135}">20mm finite RC / σmax {row["grossElasticNormalStressMPa"][1]:.3f}MPa</text>')
        additions.append(f'<text class="small" x="{left}" y="{top+152}">Not adopted waterproofjoint</text>')
    return svg.replace('</svg>','\n'.join(additions)+'\n</svg>')


def draw_monolithic_barrier(model):
    duty=model['monolithic']['barrierDuties'][0];core=duty['authoredCoreFootprintXYMm'];x0,y0,x1,y1=core
    cx=(x0+x1)/2;cy=(y0+y1)/2
    def px(value):return 235+(value-cx)*.55
    def py(value):return 310-(value-cy)*.55
    plate=duty['barrierPerimeterPlanXYMm'];warm=duty['sourceHeatedSideCoreOverlapXYMm']
    rows=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 760">','<rect width="980" height="760" fill="#faf8f2"/>',
        '<style>text{font:12px sans-serif;fill:#243339}.small{font-size:10px}.hold{fill:#a84f3e}</style>',
        '<text x="35" y="28">CONTINUOUS RC / COORDINATE-DEFINED WATERSTOP CONCEPT</text>',
        '<text x="35" y="50">Mechanics: actual20mmRC bridge. Metalbarrier/rodseals are NOT included or accepted.</text>',
        '<text x="35" y="83">COURT WEST PLAN / repeated source-bound atall4piers</text>']
    for rectangle,color in ((duty['sourceFinishedEnvelopeXYMm'],'#e8dfbf'),(plate,'#87aaa8'),(core,'#c6d2ca'),(warm,'#d7b3a2')):
        a,b,c,d=rectangle
        rows.append(f'<rect x="{px(a)}" y="{py(d)}" width="{(c-a)*.55}" height="{(d-b)*.55}" fill="{color}" stroke="#405954" stroke-width=".8"/>')
    for x,y,z in duty['continuousH12BarSealInterfacesXYZMm']:
        rows.append(f'<circle cx="{px(x)}" cy="{py(y)}" r="3.3" fill="#344d54"/>')
        rows.append(f'<circle cx="{px(x)}" cy="{py(y)}" r="8" fill="none" stroke="#b34937" stroke-dasharray="3 2"/>')
    rows.extend(['<text x="35" y="572">Clay:140mm heated-side core overlap, not an outdoor-only pier.</text>',
        '<text x="35" y="593">Blue:proposedunloadedflange; fourredcircles are UNQUALIFIEDmetal/barseals.</text>',
        '<text x="35" y="614">40lining +202.5glass eachnormalface;290core;775finishedenvelope retained.</text>',
        f'<text x="35" y="635">Roomflange20+verticalfold80 has{duty["roomFinishNominalFlangeReserveMm"]:.1f}mm nominalreserve: actualthickness/tolerances OPEN.</text>'])
    left=565;top=420;scale=.30
    cap=model['widthEdit']['footprints'][0]['actualCapFootprintXYMm']
    def sx(value):return left+(value-cap[0])*scale
    def zz(value):return top-value*scale
    rows.append(f'<rect x="{left}" y="{zz(-180)}" width="{(cap[2]-cap[0])*scale}" height="{570*scale}" fill="#c6d2ca" stroke="#405954"/>')
    rows.append(f'<rect x="{sx(x0)}" y="{zz(500)}" width="{212.5*scale}" height="{680*scale}" fill="#a5beb4" stroke="#405954"/>')
    for bx in (69,212.5-69):
        xx=sx(x0+bx)
        rows.append(f'<path d="M{xx} {zz(-680)} V{zz(500)}" stroke="#344d54" stroke-width="2.6"/>')
    rows.append(f'<path d="M{sx(x0)-10} {zz(-40)} H{sx(x1)+20}" stroke="#b34937" stroke-width="3" stroke-dasharray="5 3"/>')
    for z,label in ((0,'0 sourcegroundFFL'),(-40,'−40 barrierreference'),(-180,'−180 captop'),(-405,'−405 finitecapcut'),(-680,'−680 starterend'),(-750,'−750 capbottom')):
        rows.append(f'<text class="small" x="{left+270}" y="{zz(z)+4}">{label}</text>')
    rows.extend(['<text x="555" y="100">SECTION / lower500mm; twoof4H12 shown</text>',
        '<text x="555" y="121">FiniteRC/barcontinuity is diagnosticonly.</text>',
        '<text x="555" y="142">500actualstarterrun;480credited;434.78required.</text>',
        '<text class="hold" x="35" y="687">Waterstopmetal/thickness/process/leak/gas/air andthermalproof remainnull. No coat-onlycapillarywaiver.</text>',
        '<text x="35" y="709">OthermasonryDPCs, sourcehydraulics and0/3170/3370datums arepreserved; no raised715mix.</text>',
        '<text x="35" y="731">The realplate/interface must replace the20mmRC surrogate beforephysicaladoption.</text>','</svg>'])
    return '\n'.join(rows)+'\n'


def run_monolithic_rc_case(case,source,name):
    model=build_monolithic_rc_portals(case,source);result=solve_monolithic_rc_portals(model,source,name)
    return {'schema':'str-monolithic-rc-portal-result/1','sourceSHA256':source['identities'],'request':case,'native':result,
        'schedule':result['schedule'],'floor':model['joinedFloor']['floor'],
        'diagnostics':rc_floor_house_diagnostics()+['The monolithic20mmRC comparison eliminates only thesefour structuralDPC joints; its proposedmetalpuddlebarrier is coordinate-defined but not included as accepted material. Allwarmcore, water/gas/air/thermal and actualcapcage duties remain explicit.'],
        'drawings':{'floor.svg':draw_monolithic_rc_floor(model,result),'barrier.svg':draw_monolithic_barrier(model)},
        'unresolvedReceivingPorts':native_intermediate_support_ports(source['house']['joined']['floor']),'unresolvedReceivingPortCount':28,'completeReceivingPaths':0,
        'candidateAccepted':False,'ownerAppearanceApproval':False,'waterControlAccepted':False,'thermalAccepted':False,'completeHouseProof':False,'roofAdoption':False,'installedAcceptance':False}


if __name__=='__main__':
    source=load_monolithic_rc_source(Path(__file__).resolve().parents[3])
    if sys.argv[1:]==['--read']:print(json.dumps(reference_monolithic_rc_case(source),allow_nan=False))
    elif not sys.argv[1:]:
        request=json.load(sys.stdin)
        if set(request)!={'case','name'}:raise ValueError('Exact case/name required')
        print(json.dumps(run_monolithic_rc_case(request['case'],source,request['name']),allow_nan=False))
    else:raise SystemExit('Use --read or source-bound case/name onstdin')
