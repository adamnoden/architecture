"""Fresh paired native solves; no historical foundation response is added."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import time

from foundation_solid_weight import add_foundation_solid_weight, foundation_solid_inventory, load_foundation_solid_weight_source, reference_foundation_solid_weight_case
from vertical_rc_floor import build_vertical_rc_floor, load_vertical_rc_floor_source, solve_vertical_rc_floor
from vertical_rc_floor_proof import numerical_case

D=Path(__file__).resolve().parent


def summary(result):
    native=result['native'];heads=native['heads']
    return {'caseId':native['caseId'],'heads':heads,'minimumHeadVerticalReactionKN':min(row['reactionKN_KNm'][2] for row in heads),
            'negativeHeadCount':sum(row['reactionKN_KNm'][2]<-1e-7 for row in heads),'equilibriumResidualKN_KNm':native['equilibriumResidualKN_KNm'],
            'maximumFrameTranslationMm':native['maximumFrameTranslationMm'],'maximumPlateDeflectionMm':result['plate']['physicalRecovery']['maximumDeflectionMm'],
            'physicalPlateWorkRelativeResidual':result['plate']['physicalRecovery']['workRelativeResidual'],
            'missingGroundContactAreaMm2':result['missingGroundContactAreaMm2'],'candidateAccepted':False,'capGridResistanceAccepted':False,'completeHouseProof':False}


def head_delta(a,b):
    before={row['id']:row['reactionKN_KNm'] for row in a['heads']}
    return max(abs(x-y) for row in b['heads'] for x,y in zip(before[row['id']],row['reactionKN_KNm']))


def draw_inventory(inventory):
    out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 840">','<rect width="1000" height="840" fill="#faf8f2"/>',
         '<style>text{font:14px sans-serif;fill:#263c43}.small{font-size:12px}</style>',
         '<text x="35" y="34">FOUNDATION: ONE PHYSICAL RC UNION, NOT OVERLAPPING BEAM TOTALS</text>',
         '<text class="small" x="35" y="58">Source-ground0 comparison. All mass lies below Z−180; no above-DPC compression credit.</text>']
    for row in inventory['solids']:
        x0,y0,z0,x1,y1,z1=row['boxXYZMm'];x=45+x0*.055;y=735-y1*.055;w=(x1-x0)*.055;h=(y1-y0)*.055
        out.append(f'<rect x="{x:.4f}" y="{y:.4f}" width="{w:.4f}" height="{h:.4f}" fill="{"#bd976a" if row["kind"]=="cap" else "#8da8a1"}" fill-opacity=".65" stroke="#425f65" stroke-width=".5"/>')
    out.extend([f'<text x="735" y="145">Union {inventory["RCVolumeM3"]:.6f} m³</text>',f'<text x="735" y="178">G {inventory["physicalGKN"]:.3f} kN</text>',
        f'<text class="small" x="735" y="220">Naïve {inventory["naiveOverlappingVolumeM3"]:.6f} m³</text>',f'<text class="small" x="735" y="245">Overlap {inventory["removedOverlapVolumeM3"]:.6f} m³</text>',
        '<text class="small" x="735" y="295">52 named heads</text>','<text class="small" x="735" y="320">Same finite frame and floor</text>',
        '<text class="small" x="735" y="370">No pile or cap capacity proof</text>','<text class="small" x="735" y="395">No adopted water barrier</text>',
        '<text class="small" x="35" y="795">Caps receive their own union material at the named head. Other solids load their own finite beam.</text>',
        '<text class="small" x="35" y="817">Intersection allocation is a declared beam-model idealisation; local 3D transfer and resistance remain open.</text>','</svg>'])
    return '\n'.join(out)+'\n'


def proof(root):
    source=load_vertical_rc_floor_source(root);weight_source=load_foundation_solid_weight_source(root);inventory=foundation_solid_inventory(reference_foundation_solid_weight_case(weight_source),weight_source)
    results=[];start=time.monotonic()
    base=numerical_case(source)
    for programme in ('source-W31-G09','fresh-GMAX-Q2'):
        case=copy.deepcopy(base)
        if programme=='fresh-GMAX-Q2':case['monolithicCase']['houseCase']['boundary'].update(physicalGFactor=1.35,includeExternalGMAXQ=True);case['freshUniformLiveKPa']=2
        model=build_vertical_rc_floor(case,source);original=copy.deepcopy(model['families']['physical-G'])
        reference=summary(solve_vertical_rc_floor(model,source,'FOUNDATION/'+programme+'/unweighted'))
        for density,factor,label in ((25,1,'weighted25'),(20,1,'weighted20'),(25,0,'zero-factor-control')):
            model['families']['physical-G']=copy.deepcopy(original);model.pop('foundationWeight',None)
            added=add_foundation_solid_weight(model,source,{'unitWeightKNPerM3':density,'gravityFactor':factor})
            result=summary(solve_vertical_rc_floor(model,source,'FOUNDATION/'+programme+'/'+label));result['maximumHeadComponentDeltaFromUnweightedKN_KNm']=head_delta(reference,result)
            result['foundationWeight']=added
            if factor==0 and result['maximumHeadComponentDeltaFromUnweightedKN_KNm']>1e-7:raise ValueError('Zero mass control changed compatible head response')
            if factor and result['maximumHeadComponentDeltaFromUnweightedKN_KNm']<1:raise ValueError('Actual foundation G failed to propagate to same52head solve')
            results.append(result);print(programme,label,'elapsed',round(time.monotonic()-start,2),'min',result['minimumHeadVerticalReactionKN'],'negative',result['negativeHeadCount'],flush=True)
        results.append(reference)
    return {'schema':'str-foundation-solid-weight-proof/1','sourceSHA256':{**source['identities'],**weight_source['identities']},
        'proofProducerSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'authoredNativeCase':base,
        'inventory':{key:value for key,value in inventory.items() if key not in ('solids','fragments')},'executedCoupledCaseCount':len(results),'cases':results,
        'candidateAccepted':False,'capGridResistanceAccepted':False,'pileCapacityAccepted':False,'completeHouseProof':False,
        'scope':'Paired native35 RC200 floor/curved-portal control with sourceW31 pressure, G0.9 or freshGMAX/Q2. This does not qualify the separate masonry arch, roof, full windprogramme or missing receiving/material paths.'},draw_inventory(inventory)


if __name__=='__main__':
    if sys.argv[1:]!=['--write']:raise SystemExit('Use --write for fresh paired compatible solves')
    result,svg=proof(D.parents[2]);(D/'foundation-solid-weight-proof.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n');(D/'foundation-solid-weight.svg').write_text(svg)
