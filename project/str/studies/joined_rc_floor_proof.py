import copy
import hashlib
import json
from pathlib import Path
import sys

from continuous_rc_portal import build_continuous_rc_portal, solve_continuous_rc_case
from continuous_rc_portal_proof import compact_case, numerical_case as portal_case
from distributed_floor_proof import numerical_request as floor_case
from joined_rc_floor import build_joined_rc_floor, joined_diagnostics, joined_physical_schedule, load_joined_rc_floor_source, reference_joined_rc_floor_case, seed_joined_rc_floor_contact, solve_joined_rc_floor
from joined_rc_floor_views import draw_joined_rc_floor


D=Path(__file__).resolve().parent


def numerical_case(source):
    case=reference_joined_rc_floor_case(source)
    case.update(portal=portal_case(source['portal']),floor=floor_case(source['floor']),
        portalDPCNormalMode='compression',portalDPCNormalIntegration='exact-active-patch',portalDPCQuadratureOrder=8,portalDPCNormalSubdivisions=4)
    return case


def _compact(result):
    result=compact_case(result)
    for row in result['portalNormalContactResults']:
        samples=row.pop('normalSamples')
        row['normalSampleCount']=len(samples)
        row['minimumSampleNormalForceKN']=min(sample['forceOnUpperKN'] for sample in samples)
        row['maximumSampleNormalCompressionMPa']=max(sample['normalCompressionMPa'] for sample in samples)
    return result


def _delta(a,b):
    return {'all52HeadMaximumDeltaKN_KNm':max(abs(x-y) for left,right in zip(a['heads'],b['heads']) for x,y in zip(left['reactionKN_KNm'],right['reactionKN_KNm'])),
        'actualFloorPortMaximumDeltaMmMrad':max(abs(x-y) for left,right in zip(a['portMovementsMmMrad'],b['portMovementsMmMrad']) for x,y in zip(left['value'],right['value']))}


def proof(source):
    case=numerical_case(source);model=build_joined_rc_floor(case,source)
    scenarios=[];raw={};requests={};schedule={};errors=[]
    def run(name,multipliers,request=case,guess=None):
        current=model if request is case else build_joined_rc_floor(request,source)
        if guess is not None:seed_joined_rc_floor_contact(current,source,guess)
        result=solve_joined_rc_floor(current,source,name,multipliers)
        raw[name]=result;requests[name]=copy.deepcopy(request);schedule[name]=joined_physical_schedule(current)
        scenarios.append(name)
        print(name,result['contactIntegrationStatus'],'u',result['maximumFrameTranslationMm'],flush=True)
        return result,current
    baseline,base_model=run('0.9physicalG-noQ-positive2.25kPa',{'physical-G':.9,'pressure-positive':1.})
    negative,negative_model=run('0.9physicalG-noQ-negative2.25kPa',{'physical-G':.9,'pressure-negative':1.})
    run('physicalG-positive2.25kPa',{'physical-G':1.,'pressure-positive':1.},guess=baseline)
    run('GMAX-Q-positive2.25kPa',{'physical-G':1.35,'external-GMAX':1.35,'external-Q':1.5,'pressure-positive':1.},guess=baseline)
    edge=copy.deepcopy(case);edge['portalDPCInsetMm']=5
    run('0.9physicalG-5mm-edge-loss-positive2.25kPa',{'physical-G':.9,'pressure-positive':1.},edge)
    zero=copy.deepcopy(case);zero['portalDPCNormalIntegration']='fixed-gauss'
    run('zero-favourableG-positive2.25kPa',{'pressure-positive':1.},zero)
    depth=copy.deepcopy(case);depth['geometry']['outerUpstandDepthMm']=850
    changed_depth,depth_model=run('outer-upstand850-depth-change',{'physical-G':.9,'pressure-positive':1.},depth,baseline)
    aperture=copy.deepcopy(case);aperture['floor']['componentCase']['edits']['floorApertures']=[{'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[9240,4760,9905,5305]}}]
    changed_aperture,aperture_model=run('plant-riser-aperture-change',{'physical-G':.9,'pressure-positive':1.},aperture,baseline)
    mesh=copy.deepcopy(case);mesh['floor']['maxPitchMm']=700
    refined,refined_model=run('floor-mesh700-refinement',{'physical-G':.9,'pressure-positive':1.},mesh,baseline)
    fixed=copy.deepcopy(case);fixed['portalDPCNormalIntegration']='fixed-gauss';fixed['portalDPCNormalSubdivisions']=1
    coarse,coarse_model=run('fixed8x8-contact-control',{'physical-G':.9,'pressure-positive':1.},fixed)
    fixed32=copy.deepcopy(fixed);fixed32['portalDPCNormalSubdivisions']=4
    fine,fine_model=run('fixed8x32-contact-control',{'physical-G':.9,'pressure-positive':1.},fixed32)
    free_model=build_continuous_rc_portal(case['portal'],source['portal'])
    free=solve_continuous_rc_case(free_model,source['portal'],'same-0.9physicalG-positive-pressure-free-floor',{'physical-G':.9,'pressure-positive':1.})
    base_grid=[member for member in base_model['model'].members if member[0].startswith('GRID/')]
    aperture_grid=[member for member in aperture_model['model'].members if member[0].startswith('GRID/')]
    source_payload=lambda rows:hashlib.sha256(json.dumps(rows,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()
    summary={'schema':'str-joined-rc-floor-proof/1','sourceSHA256':source['identities'],
        'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'authoredNumericalCase':case,
        'nodeCount':len(base_model['model'].nodes),'memberCount':len(base_model['model'].members),
        'floor':{key:base_model['joinedFloor']['floor'][key] for key in ('triangleCount','interiorDofCount','membraneAreaM2','rigidModeResidualKN','modeReconstructionRelativeError','finiteBeamBoundaryReceivers')},
        'physicalReceivingPathsAssembled':{'outerL':4,'northRC':4,'canonicalCompleteAccepted':0,'stillUnresolvedCanonical':28},
        'floorPortCount':len(base_model['joinedFloor']['floor']['ports']),'schedule':joined_physical_schedule(base_model),
        'caseRequests':requests,'caseSchedules':schedule,'cases':{name:_compact(copy.deepcopy(raw[name])) for name in scenarios},
        'freeFloorControl':compact_case(free),'samePressureFreeToJoined':_delta(free,baseline),
        'upstandDepthPerturbation':{**_delta(baseline,changed_depth),'depthMm':[750,850],
            'outerBeamCentroidZMm':[base_model['wallFrames']['outer-north']['west']['beamZMm'],depth_model['wallFrames']['outer-north']['west']['beamZMm']],
            'physicalGKN':[joined_physical_schedule(base_model)['physicalGKN'],joined_physical_schedule(depth_model)['physicalGKN']]},
        'aperturePerturbation':{**_delta(baseline,changed_aperture),'actualGridMembersUnchanged':base_grid==aperture_grid,
            'physicalPortalMassUnchanged':joined_physical_schedule(base_model)==joined_physical_schedule(aperture_model),
            'floorTriangleCount':[base_model['joinedFloor']['floor']['triangleCount'],aperture_model['joinedFloor']['floor']['triangleCount']]},
        'floorMeshRefinement':{**_delta(baseline,refined),'pitchMm':[1400,700],
            'triangleCount':[base_model['joinedFloor']['floor']['triangleCount'],refined_model['joinedFloor']['floor']['triangleCount']]},
        'contactIntegrationRefinement':{'fixed8x8ToExact':_delta(coarse,baseline),'fixed8x32ToExact':_delta(fine,baseline)},
        'admittedNativeActionCount':len(base_model['admittedNativeActions']),'admittedNativeActionsDigest':source_payload(base_model['admittedNativeActions']),
        'withheldNativeActionCount':len(base_model['withheldNativeActions']),'withheldNativeActionsDigest':source_payload(base_model['withheldNativeActions']),
        'diagnostics':joined_diagnostics(),'candidateAccepted':False,'ownerAppearanceApproval':False,'installedAcceptance':False,'roofAdoption':False,'completeHouseProof':False}
    drawing=draw_joined_rc_floor(base_model,baseline);summary['floorSvgSHA256']=hashlib.sha256(drawing.encode()).hexdigest()
    return summary,drawing


if __name__=='__main__':
    if sys.argv[1:]!=['--write']:raise SystemExit('Use --write for actual signed cases, exact contact and source geometry perturbations')
    source=load_joined_rc_floor_source(D.parents[2]);result,drawing=proof(source)
    if source['identities']!=load_joined_rc_floor_source(D.parents[2])['identities']:raise SystemExit('Native source changed during proof; no stale result is written')
    (D/'joined-rc-floor-proof.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    (D/'joined-rc-floor.svg').write_text(drawing)
    print('Joined eight-path floor/portal/52head numerical proof saved; no installed or house acceptance')
