"""Make a compact reproducible receipt from the full inner-frame comparison."""
from pathlib import Path
import argparse,hashlib,importlib.util,json

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--input',type=Path,default=Path(__file__).with_name('roof_water_inner_candidate.json'))
parser.add_argument('--output',type=Path,default=Path(__file__).with_name('roof_water_inner_candidate_compact.json'))
args=parser.parse_args()
source=Path(__file__).with_name('roof_water_inner_candidate.py')
spec=importlib.util.spec_from_file_location('candidate',source);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
full=json.loads(args.input.read_text())
assert full['candidateSourceSHA256']==hashlib.sha256(source.read_bytes()).hexdigest(),'Source changed; reproduce full receipt before compacting.'
out={k:v for k,v in full.items() if k!='families'}
out['receiptKind']='COMPACT REPRODUCIBLE UNSELECTED COMPARISON'
out['fullReceiptSHA256']=hashlib.sha256(args.input.read_bytes()).hexdigest()
out['compactorSHA256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
out['caseIdentityOrder']=['water depths in station order','body p sign','rear q sign','front q sign','apron p sign','apron q sign','vertical sign','gravity factor']
out['families']={}
for name,f in full['families'].items():
    cf={k:v for k,v in f.items() if k!='cassettes'};cf['cassettes']=[]
    for j,assembly in enumerate(f['cassettes']):
        frame,_,_,_=m.make_frame(name,m.families[name],j)
        ca={k:v for k,v in assembly.items() if k not in ['scenarios','governingWitnesses','nodes']}
        ca['frameMembers']=[dict(name=e['name'],start=frame.nodes[e['i']],end=frame.nodes[e['j']],sectionMM=[e['s']['B'],e['s']['H'],e['s']['t']]) for e in frame.members]
        ca['allCaseIdentities']=[]
        ca['caseStressEnvelopesMPa']=[]
        for s in assembly['scenarios']:
            wind=s['windSigns']
            ca['allCaseIdentities'].append([list(s['waterDepthByStation'].values()),*wind['body'],*wind['apron'],wind['vertical'],s['gravityFactor']])
            ca['caseStressEnvelopesMPa'].append(s['worstMPa'])
        ca['governingControls']={}
        for metric,witness in assembly['governingWitnesses'].items():
            selected=max(range(len(witness['members'])),key=lambda i:witness['members'][i]['componentEnvelope']['comparisonMPa'])
            member=dict(witness['members'][selected])
            element=frame.members[selected]
            member.update(start=frame.nodes[element['i']],end=frame.nodes[element['j']])
            ca['governingControls'][metric]=dict(scenario=witness['scenario'],worstMember=member)
        ca['caseCount']=len(ca['allCaseIdentities'])
        ca['equilibriumAbsoluteMax']=dict(
            forceN=max(abs(x) for s in assembly['scenarios'] for x in s['equilibrium']['forceResidualN']),
            momentNmm=max(abs(x) for s in assembly['scenarios'] for x in s['equilibrium']['momentResidualNmm']),
            freeNAndNmm=max(s['equilibrium']['maxFreeResidualNAndNmm'] for s in assembly['scenarios']))
        cf['cassettes'].append(ca)
    out['families'][name]=cf
out['knownAdditionalInterfaceFailures']=[
    'The declared0.7 liner plus1.2 backing consumes1.9mm above a25-deep arm; the current axis14mm below bed leaves1.5mm. Correct this0.4mm local stacking difference in the next geometry revision.',
    'TwoM10 capture bolts and60×40×6 socket stock are inventory placeholders with no earned moment-connection or contact capacity.',
    'The separate renewal comparison raises the rests to6300 and extends the landing150 north. The earlier6280 concept in the frame metadata is superseded only within that explicitly separate temporary-stage comparison.',
    'The main local frame omits the separately exported extra apron-rib/standoff pressure. The joined global comparison remains a separate source and must not inherit a local or native pass.'
]
args.output.write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(dict(output=str(args.output),bytes=args.output.stat().st_size,fullBytes=args.input.stat().st_size,
    candidate=out['candidateSourceSHA256'],cases=sum(c['caseCount'] for f in out['families'].values() for c in f['cassettes'])),indent=2))
