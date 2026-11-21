"""Source body/contact pairing and density/aperture changes through native heads."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import time
from court_corner_closure import MODE, apply_court_corner_closure
from foundation_solid_weight import add_foundation_solid_weight
from foundation_solid_weight_proof import head_delta, summary
from lower_core_bodies import add_lower_core_bodies, summarize_lower_core_body_response
from vertical_rc_floor import build_vertical_rc_floor, load_vertical_rc_floor_source, solve_vertical_rc_floor
from vertical_rc_floor_proof import numerical_case

D=Path(__file__).resolve().parent


def run(root):
    source=load_vertical_rc_floor_source(root);base=numerical_case(source);results=[];start=time.monotonic();reference=None
    for label,density in [('inherited-combined-control',None),('serial-zero-density',0),('serial20',20),('serial20-aperture-wider',20)]:
        case=copy.deepcopy(base)
        if label.endswith('aperture-wider'):case['monolithicCase']['houseCase']['joinedCase']['floor']['componentCase']['edits']['floorApertures']=[{'id':'FLOOR-APERTURE/plant-riser','shape':{'kind':'rectangle','boundsXYMm':[9240,4760,9905,5305]}}]
        model=build_vertical_rc_floor(case,source);apply_court_corner_closure(model,source,{'mode':MODE},{'unitWeightKNPerM3':25,'gravityFactor':1})
        if density is not None:add_lower_core_bodies(model,source,{'masonryUnitWeightKNPerM3':density})
        add_foundation_solid_weight(model,source,{'unitWeightKNPerM3':25,'gravityFactor':1})
        native=solve_vertical_rc_floor(model,source,'LOWER-CORE/'+label);value=summary(native)
        if reference is None:reference=value
        value['maximumHeadComponentDeltaFromInheritedKN_KNm']=head_delta(reference,value)
        if density is not None:
            added=model['lowerCoreBodies'];body=summarize_lower_core_body_response(model,native)
            value['lowerCoreBodies']={key:data for key,data in added.items() if key!='contactBodies'}
            value['bodyResponse']={key:data for key,data in body.items() if key!='response'}
        results.append(value);print(label,'elapsed',round(time.monotonic()-start,1),'minHead',value['minimumHeadVerticalReactionKN'],'headDelta',value['maximumHeadComponentDeltaFromInheritedKN_KNm'],flush=True)
    by_name={row['caseId'].split('/')[-1]:row for row in results}
    if by_name['serial-zero-density']['maximumHeadComponentDeltaFromInheritedKN_KNm']>1e-6:raise ValueError('Zero-bodyG serial mechanics differ from inherited combined spring response')
    if by_name['serial20']['maximumHeadComponentDeltaFromInheritedKN_KNm']<1:raise ValueError('Independent bodyG failed to propagate to real52heads')
    if head_delta(by_name['serial20'],by_name['serial20-aperture-wider'])<1e-5:raise ValueError('Actualfloor aperture edit failed through serial-body native heads')
    a,b=by_name['serial20']['lowerCoreBodies'],by_name['serial20-aperture-wider']['lowerCoreBodies']
    if abs(a['inventory']['netClearCoreVolumeM3']-b['inventory']['netClearCoreVolumeM3'])>1e-9:raise ValueError('Floor opening edit changed independently authored wallbody geometry')
    extra=('project/str/studies/lower_core_bodies.py','project/str/studies/court_corner_closure.py','project/str/studies/foundation_solid_weight.py')
    return {'schema':'str-lower-clearcore-bodies-proof/1','sourceSHA256':{**source['identities'],**{p:hashlib.sha256((Path(root)/p).read_bytes()).hexdigest() for p in extra}},
        'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'authoredNativeCase':base,'cases':results,
        'zeroDensityMaximumHeadDifferenceKN_KNm':by_name['serial-zero-density']['maximumHeadComponentDeltaFromInheritedKN_KNm'],
        'apertureMaximumHeadComponentDeltaKN_KNm':head_delta(by_name['serial20'],by_name['serial20-aperture-wider']),
        'scope':'Actual native35 curved-frame diagnostic with explicitcourtclosure and ownfoundationG. Regular lowerclearcore bodyG only; independentA successor requires ownsource-bound joint replay.',
        'candidateAccepted':False,'bodyAxialComparisonLawAccepted':False,'completeHouseProof':False}


if __name__=='__main__':
    if sys.argv[1:]!=['--write']:raise SystemExit('Use --write for fresh coupled lowerbody proof')
    result=run(D.parents[2]);(D/'lower-core-bodies-proof.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
