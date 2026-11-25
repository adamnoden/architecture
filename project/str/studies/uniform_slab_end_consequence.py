"""Replay the actual slab-law change through existing wet-end witnesses.

The chosen corner-force allocation is not an actual bar-force bound. No native
solve, curved-cut force recovery or engineering selection occurs here.
"""
from __future__ import annotations
import argparse,hashlib,json,os
from pathlib import Path

from floor_section_model import load_source
from uniform_slab_law import require
from uniform_slab_law_proof import load_captures,read_controls as uniform_controls
from wet_beam_end_development_proof import read_controls as end_controls,summary
from wet_beam_rectangular_return import assess
from wet_beam_end_views import drawing
from wet_support_cage_comparison import comparison_settings

ROOT=Path(__file__).resolve().parents[3];D=Path(__file__).resolve().parent
PROOF=D/'uniform-slab-law-end-consequence.json'
DRAWING=D/'uniform-slab-law-end.svg'
METHODS=['project/str/studies/uniform_slab_end_consequence.py',
    'project/str/studies/uniform_slab_law.py','project/str/studies/uniform_slab_law_proof.py',
    'project/str/studies/wet_beam_end_development_proof.py','project/str/studies/wet_beam_rectangular_return.py',
    'project/str/studies/wet_beam_end_views.py','project/str/studies/wet_support_cage_comparison.py',
    'project/str/studies/continuous_rc_cage.py','project/str/studies/wet_post_head_fan.py',
    'project/str/studies/floor_section_proof.py','project/str/studies/wet_bearing_refinement_proof.py']
INPUTS=['project/str/studies/uniform-slab-law-inputs.json',
    'project/str/studies/wet-beam-rectangular-return-inputs.json',
    'project/str/studies/wet-support-cage-comparison-settings.json']
sha=lambda data:hashlib.sha256(data).hexdigest()
def identities(paths):return {p:sha((ROOT/p).read_bytes()) for p in paths}
def cut_identity(record):
    row=record['simultaneousSourceCut']
    return json.dumps([row.get(k) for k in ['memberId','end','fraction','cutSide','physicalPointMm']],sort_keys=True)

def compare_cuts(control,changed):
    a={cut_identity(r):r for r in control['cuts']};b={cut_identity(r):r for r in changed['cuts']}
    require(len(a)==len(control['cuts']) and len(b)==len(changed['cuts']),'duplicate physical end cut identity')
    require(a.keys()==b.keys(),'slab-law end comparison changed physical cut catalogue')
    result=[];unsupported=[]
    for key in a:
        old,new=a[key],b[key]
        require(old['status']==new['status'],'same end geometry changed supported cut classification')
        if old['status']!='nominal-straight-section-witness':
            require('comparisons' not in old and 'comparisons' not in new,'unsupported curved force was invented')
            unsupported.append({'physicalCut':json.loads(key),'status':old['status'],'compatibleBarForceAvailable':False})
            continue
        require(old['chosenEquilibriumAllocation'] and new['chosenEquilibriumAllocation'],'nominal allocation identity lost')
        require(old['actualBarForceBoundsAvailable'] is False and new['actualBarForceBoundsAvailable'] is False,'nominal witness promoted to actual force bound')
        require(old['selfEquilibratingCornerModeResolved'] is False and new['selfEquilibratingCornerModeResolved'] is False,'corner mode falsely resolved')
        require([c['cotTheta'] for c in old['comparisons']]==[c['cotTheta'] for c in new['comparisons']],'different strut choices cannot be paired')
        for p,q in zip(old['comparisons'],new['comparisons']):
            result.append({'physicalCut':json.loads(key),'cotTheta':p['cotTheta'],
                'controlSourceCut':old['simultaneousSourceCut'],'changedSourceCut':new['simultaneousSourceCut'],
                'control':p,'uniform8250':q,'chosenEquilibriumAllocation':True,'actualBarForceBoundsAvailable':False})
    require(len(unsupported)==5 and len(result)==6,'declared five curved and three straight end cuts changed')
    return {'samePhysicalCutCount':len(a),'unsupportedCurvedCuts':unsupported,'nominalStraightComparisons':result,
        'continuousCutEnvelopeAvailable':False,'beamEndDRegionAccepted':False,'actualBarForceBoundsAvailable':False}

def produce():
    before=identities(METHODS);inputs=identities(INPUTS);source=load_source(ROOT)
    controls=end_controls();settings=comparison_settings();settings['postTopLevelRaiseMm']=controls['postTopLevelRaiseMm']
    require(settings['postTopLevelRaiseMm']==10 and controls['comparisonEndMandrelsMm']==[80,100]
        and controls['strutCotangentComparisons']==[1,2.5],'supported explicit end comparison controls required')
    natives,provenance=load_captures(source,uniform_controls())
    grid=json.loads((D/'current-house-grid.json').read_bytes());cases={};comparisons={};svg=None
    for name,native in natives.items():
        cases[name]={}
        for mandrel in controls['comparisonEndMandrelsMm']:
            current=assess(native,grid,settings,mandrel,controls['strutCotangentComparisons'],with_geometry=True)
            cases[name][str(mandrel)]=summary(current)
            if name=='uniform200' and mandrel==100:svg=drawing(current)
    for mandrel in controls['comparisonEndMandrelsMm']:
        old,new=cases['control'][str(mandrel)],cases['uniform200'][str(mandrel)]
        require(old['candidateCageGeometrySHA256']==new['candidateCageGeometrySHA256'],'constitutive-only edit changed complete actual cage geometry')
        require(old['geometry']==new['geometry'] and old['quantities']==new['quantities'],'constitutive-only edit changed geometric or stock controls')
        comparisons[str(mandrel)]=compare_cuts(old['sourceCutComparisons'],new['sourceCutComparisons'])
    require(svg is not None,'current-source D100 comparison drawing missing')
    for name in cases:
        for mandrel in cases[name]:
            case=cases[name][mandrel]
            require(case['geometry']['independentPathFailures']==0 and case['geometry']['internalClosureFailures']==0
                and case['geometry']['coverFailures']==0,'current complete end geometry comparison fails')
            require(all(case[k] is False for k in ['candidateAccepted','beamEndDRegionAccepted','bendPressureAccepted',
                'bondAndAnchorageAccepted','toleranceDomainAccepted','completeSignedLoadEnvelope','continuousCutEnvelopeAvailable']),
                'end consequence manufactured acceptance')
    result={'schema':'str-uniform-slab-law-end-consequence/1','nativeSourceSHA256':source['identities'],
        'processingMethodSHA256':before,'authoredInputSHA256':inputs,'nativeProvenance':provenance,
        'authoredEndControls':controls,'actualCageSettings':settings,'sameCaseComparisons':cases,'samePhysicalCutConsequences':comparisons,
        'drawingSHA256':sha(svg.encode()),'nativeSolveExecuted':False,'nativeCageMassFeedbackApplied':False,
        'defaultOldLawOrD80Changed':False,'nextComparisonDirection':{
            'oldLaw':'Retain D80 as the existing old-law control; no silent constitutive switch.',
            'uniform8250':'Carry D100 into further common8250-law end development: D80 fails a declared nominal witness while D100 does not.',
            'isAssemblySelection':False,'isActualBarForceBound':False,'isPhysicalD80Rejection':False},
        'candidateAccepted':False,'bendPressureAccepted':False,'bondAndAnchorageAccepted':False,'beamEndDRegionAccepted':False,
        'changedLawQuadratureConverged':False,'completeSignedLoadEnvelope':False,
        'scope':'Actual same-q32 source/control/change through current complete cage geometry and nominal straight-cut witnesses. Five curved cuts stay unsupported. A chosen axial/shear/torsion allocation leaves the self-equilibrating corner mode and actual bar forces unresolved; neither a physical D80 rejection nor D100 anchorage/assembly acceptance follows.'}
    require(before==identities(METHODS) and inputs==identities(INPUTS) and source['identities']==load_source(ROOT)['identities'],
        'source, authored controls or end methods changed during replay')
    return result,svg

if __name__=='__main__':
    p=argparse.ArgumentParser();g=p.add_mutually_exclusive_group(required=True);g.add_argument('--write',action='store_true');g.add_argument('--check',action='store_true');a=p.parse_args()
    result,svg=produce()
    if a.check:
        require(json.loads(PROOF.read_bytes())==result and DRAWING.read_text()==svg,'stale uniform-law end consequence/view')
    else:
        for path,data in [(PROOF,json.dumps(result,indent=2,allow_nan=False)+'\n'),(DRAWING,svg)]:
            temp=path.with_suffix('.writing'+path.suffix);temp.write_text(data);os.replace(temp,path)
    print(json.dumps({'nativeSolveExecuted':False,'defaultOldLawOrD80Changed':False,
        'governingControlMandrelMm':result['sameCaseComparisons']['control']['80']['supportedNominalMandrelGovernor']['comparison']['necessaryMandrelComparisonMm'],
        'governingUniformMandrelMm':result['sameCaseComparisons']['uniform200']['80']['supportedNominalMandrelGovernor']['comparison']['necessaryMandrelComparisonMm'],
        'nextComparisonDirection':result['nextComparisonDirection']}))
