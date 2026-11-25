"""Propagate actual normal-contact q64 into the declared end witnesses.

Reuse only source-authenticated complete geometry with an identical current
complete cage digest. Every q32/q64 force witness is recomputed from its actual
native case; curved forces and actual bar-force bounds remain unavailable.
"""
from __future__ import annotations
import argparse,hashlib,json,os
from pathlib import Path

from floor_section_model import load_source
from uniform_slab_law import require,row_deltas
from uniform_slab_law_proof import load_captures,read_controls as uniform_controls
from uniform_slab_contact_refinement import read_controls,requests,load_fine
from uniform_slab_end_consequence import compare_cuts,cut_identity
from wet_beam_end_development_proof import read_controls as end_controls
from wet_beam_rectangular_return import assess
from wet_beam_end_views import drawing
from wet_support_cage_comparison import comparison_settings

ROOT=Path(__file__).resolve().parents[3];D=Path(__file__).resolve().parent
PROOF=D/'uniform-slab-contact-end.json';DRAWING=D/'uniform-slab-contact-end.svg'
PRIOR=D/'uniform-slab-law-end-consequence.json'
METHODS=['project/str/studies/uniform_slab_contact_end.py','project/str/studies/uniform_slab_contact_refinement.py',
    'project/str/studies/uniform_slab_law.py','project/str/studies/uniform_slab_law_proof.py',
    'project/str/studies/uniform_slab_end_consequence.py','project/str/studies/wet_beam_end_development_proof.py',
    'project/str/studies/wet_beam_rectangular_return.py','project/str/studies/wet_beam_end_views.py',
    'project/str/studies/wet_support_cage_comparison.py','project/str/studies/continuous_rc_cage.py',
    'project/str/studies/wet_post_head_fan.py','project/str/studies/floor_section_proof.py',
    'project/str/studies/wet_bearing_refinement_proof.py']
GEOMETRY_METHODS=['project/str/studies/wet_beam_rectangular_return.py',
    'project/str/studies/wet_support_cage_comparison.py','project/str/studies/continuous_rc_cage.py',
    'project/str/studies/wet_post_head_fan.py']
INPUTS=['project/str/studies/uniform-slab-contact-refinement-inputs.json',
    'project/str/studies/uniform-slab-law-inputs.json','project/str/studies/wet-beam-rectangular-return-inputs.json',
    'project/str/studies/wet-support-cage-comparison-settings.json']
sha=lambda data:hashlib.sha256(data).hexdigest()
def identities(paths):return {p:sha((ROOT/p).read_bytes()) for p in paths}

def authenticate_geometry(prior,source,coarse_provenance):
    require(prior['schema']=='str-uniform-slab-law-end-consequence/1'
        and prior['nativeSourceSHA256']==source['identities']
        and prior['nativeProvenance']==coarse_provenance,'prior complete geometry/native source ownership changed')
    require(all(prior['processingMethodSHA256'].get(p)==value for p,value in identities(GEOMETRY_METHODS).items()),
        'prior complete geometry methods changed; recompute geometry')
    for path,value in prior['authoredInputSHA256'].items():
        require(sha((ROOT/path).read_bytes())==value,'prior complete geometry authored controls changed')
    require(prior['candidateAccepted'] is False and prior['bendPressureAccepted'] is False,'prior geometry overclaims physical acceptance')

def summarise(current):
    cuts=current['sameCaseCutComparisons'];pairs=[(r,c) for r in cuts['cuts'] for c in r.get('comparisons',[])]
    row,value=max(pairs,key=lambda pair:pair[1]['necessaryMandrelComparisonMm'])
    return {'nativeCaseId':current['nativeCaseId'],'candidateCageGeometrySHA256':current['candidateCageGeometrySHA256'],
        'sourceCutComparisons':cuts,'governingNominalMandrel':{'sourceCut':row['simultaneousSourceCut'],'comparison':value},
        'quantities':current['quantities'],'nativeSolveExecuted':False,'nativeCageMassFeedbackApplied':False,
        'actualBarForceBoundsAvailable':False,'bendPressureAccepted':False,'bondAndAnchorageAccepted':False}

def signed_cut_differences(coarse,fine):
    a={cut_identity(r):r['simultaneousSourceCut'] for r in coarse['cuts']}
    b={cut_identity(r):r['simultaneousSourceCut'] for r in fine['cuts']}
    require(a.keys()==b.keys(),'normal refinement changed actual end cut catalogue')
    keys=list(a)
    return row_deltas([a[k] for k in keys],[b[k] for k in keys],
        ['axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm'],
        ['memberId','end','fraction','cutSide','physicalPointMm'])

def produce():
    before=identities(METHODS);inputs=identities(INPUTS);prior_bytes=PRIOR.read_bytes();prior=json.loads(prior_bytes)
    source=load_source(ROOT);controls=read_controls();_,fine_request=requests(source,controls)
    natives,coarse_provenance=load_captures(source,uniform_controls());coarse=natives['uniform200']
    fine,fine_provenance=load_fine(source,controls,fine_request)
    authenticate_geometry(prior,source,coarse_provenance)
    end=end_controls();settings=comparison_settings();settings['postTopLevelRaiseMm']=end['postTopLevelRaiseMm']
    require(settings==prior['actualCageSettings'],'current complete cage choices differ from prior checked geometry')
    grid=json.loads((D/'current-house-grid.json').read_bytes());cases={};reuse={};comparisons={};svg=None
    for label,native in [('q32',coarse),('q64',fine)]:
        cases[label]={}
        for mandrel in end['comparisonEndMandrelsMm']:
            current=assess(native,grid,settings,mandrel,end['strutCotangentComparisons'],with_geometry=False)
            reference=prior['sameCaseComparisons']['uniform200'][str(mandrel)]
            require(current['candidateCageGeometrySHA256']==reference['candidateCageGeometrySHA256']
                and current['quantities']==reference['quantities'],'current complete cage/quantity identity changed; no geometry reuse')
            require(all(reference['geometry'][k]==0 for k in ['independentPathFailures','internalClosureFailures','coverFailures']),
                'prior complete geometry checks were not clear')
            cases[label][str(mandrel)]=summarise(current)
            reuse[str(mandrel)]={'completeGeometryIdentity':reference['candidateCageGeometrySHA256'],
                'priorActualGeometry':reference['geometry'],'geometryMethodsUnchanged':True,
                'currentCompletePathAndQuantityIdentityMatches':True,'newGeometryCheckExecuted':False}
            if label=='q64' and mandrel==100:svg=drawing(current)
    for mandrel in end['comparisonEndMandrelsMm']:
        a,b=cases['q32'][str(mandrel)],cases['q64'][str(mandrel)]
        comparisons[str(mandrel)]={'samePhysicalCutConsequences':compare_cuts(a['sourceCutComparisons'],b['sourceCutComparisons']),
            'allSignedNativeCutComponentDifferences':signed_cut_differences(a['sourceCutComparisons'],b['sourceCutComparisons']),
            'governingNominalMandrelDifferenceMm':b['governingNominalMandrel']['comparison']['necessaryMandrelComparisonMm']-a['governingNominalMandrel']['comparison']['necessaryMandrelComparisonMm']}
    require(svg is not None,'actual fine D100 end drawing missing')
    result={'schema':'str-uniform-slab-contact-end/1','nativeSourceSHA256':source['identities'],
        'processingMethodSHA256':before,'authoredInputSHA256':inputs,'coarseNativeProvenance':coarse_provenance,
        'fineNativeProvenance':fine_provenance,'priorCompleteGeometryReceiptSHA256':sha(prior_bytes),
        'geometryReuse':reuse,'actualForceCases':cases,'samePhysicalEndRefinementConsequences':comparisons,
        'drawingSHA256':sha(svg.encode()),'nativeSolveExecuted':False,'normalContactRefinementOnly':True,
        'defaultOldLawOrD80Changed':False,'nextComparisonDirection':prior['nextComparisonDirection'],
        'materialQualified':False,'globalStressConverged':False,'actualBarForceBoundsAvailable':False,
        'curvedBarForceAvailable':False,'beamEndDRegionAccepted':False,'bendPressureAccepted':False,
        'bondAndAnchorageAccepted':False,'completeSignedLoadEnvelope':False,'candidateAccepted':False,
        'scope':'Actual q32 and q64 uniform8250 force cases through the same supported straight-cut nominal allocations. All eight exact physical native cuts retain their six signed action comparisons; five curved cuts retain no compatible bar-force witness. Geometry reuse is conditional on current complete cage/quantity identity and unchanged actual geometry methods/choices. This normal-bearing refinement does not establish global mesh/stress convergence, actual bar-force bounds, physical bend/anchorage resistance or assembly selection.'}
    require(before==identities(METHODS) and inputs==identities(INPUTS) and PRIOR.read_bytes()==prior_bytes
        and source['identities']==load_source(ROOT)['identities'],'source/method/geometry receipt changed during fine end replay')
    return result,svg

if __name__=='__main__':
    p=argparse.ArgumentParser();g=p.add_mutually_exclusive_group(required=True);g.add_argument('--write',action='store_true');g.add_argument('--check',action='store_true');a=p.parse_args()
    result,svg=produce()
    if a.check:require(json.loads(PROOF.read_bytes())==result and DRAWING.read_text()==svg,'stale actual fine end consequence/view')
    else:
        for path,data in [(PROOF,json.dumps(result,indent=2,allow_nan=False)+'\n'),(DRAWING,svg)]:
            temp=path.with_suffix('.writing'+path.suffix);temp.write_text(data);os.replace(temp,path)
    print(json.dumps({'q32MandrelMm':result['actualForceCases']['q32']['100']['governingNominalMandrel']['comparison']['necessaryMandrelComparisonMm'],
        'q64MandrelMm':result['actualForceCases']['q64']['100']['governingNominalMandrel']['comparison']['necessaryMandrelComparisonMm'],
        'mandrelDifferenceMm':result['samePhysicalEndRefinementConsequences']['100']['governingNominalMandrelDifferenceMm'],
        'fineD100NominalScreenPasses':result['actualForceCases']['q64']['100']['governingNominalMandrel']['comparison']['necessaryMandrelScreenPasses'],
        'actualBarForceBoundsAvailable':False,'globalStressConverged':False,'nativeSolveExecuted':False}))
