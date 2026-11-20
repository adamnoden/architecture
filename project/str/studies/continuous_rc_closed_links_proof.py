import argparse
import hashlib
import json
import math
from pathlib import Path

from continuous_rc_closed_links import derive_bounded_geometry, reference_closed_link_case

D=Path(__file__).resolve().parent
ROOT=D.parents[2]


def render_section(result):
    rows=result['postArchJointTrials'];component=result['closedLinkComponents'][0]
    wire=component['wire']['points'];scale=1.5
    path=' '.join(('M' if i==0 else 'L')+f'{190+x*scale:.3f},{235-y*scale:.3f}' for i,(x,y,z) in enumerate(wire))
    labels=''.join(f'<text x="400" y="{105+i*27}">{r["type"]} z{r["stationZMm"]:g}: {r["clearance"]["adverseSurfaceLowerBoundMm"]:.2f} mm</text>' for i,r in enumerate(rows))
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="640" viewBox="0 0 1120 640"><rect width="1120" height="640" fill="white"/><g font-family="sans-serif" font-size="15" fill="#222"><text x="30" y="35" font-size="23" fill="#a21b24">REJECTED complete joint tie assembly</text><text x="30" y="65">71 mm face / corrected 4850–5850 and 6150–7150 lap proposal; no fabrication release</text><path d="{path}" fill="none" stroke="#1d5b72" stroke-width="2"/><text x="30" y="415">Isolated post link: 14 mm hook-plane split</text><text x="30" y="440">Local hook and main-bar fit only</text>{labels}<text x="30" y="535">Old 4550 lap: 13 mm ramp; minimum radius bound 7.04 mm versus 86 mm required.</text><text x="30" y="565">New lap ramps: 300 mm; minimum radius bound {min(r["minimumRadiusLowerBoundMm"] for r in result["lapBendAudit"]):.2f} mm versus 87 mm required.</text><text x="30" y="595">Curved arch / post enclosure unresolved. Missing ≤100 mm joint station coverage; no joint/cap strength credit.</text></g></svg>'


def proof():
    paths=['project/had/studies/water-replan.json','project/str/studies/continuous_rc_cage.py','project/str/studies/continuous_rc_closed_links.py']
    portal=json.loads((ROOT/paths[0]).read_text())['model']['insulatedPortal']
    result=derive_bounded_geometry(reference_closed_link_case(),portal)
    result['sourceSHA256']={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in paths}
    result['forceScope']='Geometry rejection only. No historical or current native wind force receipt is treated as approval or an input to this geometry result.'
    return result


def reproduction_diagnostics(expected_text, actual_text):
    first=next((i for i,(a,b) in enumerate(zip(expected_text,actual_text)) if a!=b),min(len(expected_text),len(actual_text)))
    report={'expectedBytes':len(expected_text.encode()),'actualBytes':len(actual_text.encode()),
        'firstCharacterDifference':first,'firstDifferenceLine':expected_text.count('\n',0,first)+1,
        'firstDifferenceExpected':expected_text[max(0,first-60):first+100],
        'firstDifferenceActual':actual_text[max(0,first-60):first+100],
        'numericDifferenceCount':0,'nonNumericDifferenceCount':0,'nonFiniteDifferenceCount':0,'maximumAbsoluteNumericDifference':0.,
        'maximumRelativeNumericDifference':0.,'differences':[]}
    try:expected=json.loads(expected_text);actual=json.loads(actual_text)
    except json.JSONDecodeError:return report
    def visit(a,b,path):
        if type(a) is not type(b):
            if isinstance(a,(int,float)) and not isinstance(a,bool) and isinstance(b,(int,float)) and not isinstance(b,bool):pass
            else:record(path,'type',type(a).__name__,type(b).__name__);return
        if isinstance(a,dict):
            if a.keys()!=b.keys():record(path,'keys',list(a),list(b))
            for key in a:
                if key not in b:continue
                visit(a[key],b[key],path+'/'+str(key))
        elif isinstance(a,list):
            if len(a)!=len(b):record(path,'length',len(a),len(b))
            for i,(x,y) in enumerate(zip(a,b)):visit(x,y,path+'/'+str(i))
        elif isinstance(a,(int,float)) and not isinstance(a,bool) and (not math.isfinite(a) or not math.isfinite(b)):
            report['nonFiniteDifferenceCount']+=1
            record(path,'non-finite',repr(a),repr(b))
        elif a!=b:
            if isinstance(a,(int,float)) and not isinstance(a,bool):
                delta=abs(a-b);relative=delta/max(abs(a),abs(b),1e-300)
                report['numericDifferenceCount']+=1
                if delta>report['maximumAbsoluteNumericDifference']:
                    report['maximumAbsoluteNumericDifference']=delta;report['maximumAbsoluteNumericDifferencePath']=path
                report['maximumRelativeNumericDifference']=max(relative,report['maximumRelativeNumericDifference'])
                if len(report['differences'])<12:report['differences'].append({'path':path,'kind':'number','expected':a,'actual':b,'absoluteDifference':delta})
            else:record(path,'value',a,b)
    def record(path,kind,a,b):
        report['nonNumericDifferenceCount']+=1
        if len(report['differences'])<12:report['differences'].append({'path':path,'kind':kind,'expected':a,'actual':b})
    visit(expected,actual,'')
    return report


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');parser.add_argument('--read',action='store_true');args=parser.parse_args()
    if args.read:print(json.dumps(reference_closed_link_case(),indent=2));return
    result=proof();svg=render_section(result)
    text=json.dumps(result,indent=2,allow_nan=False)+'\n'
    if args.check:
        mismatches={}
        for path,actual in ((D/'continuous-rc-closed-links-proof.json',text),(D/'continuous-rc-closed-links.svg',svg)):
            expected=path.read_text()
            if expected!=actual:mismatches[path.name]=reproduction_diagnostics(expected,actual)
        if mismatches:raise SystemExit('Closed-link geometry evidence differs from its source-bound reproduction\n'+json.dumps(mismatches,indent=2,allow_nan=False))
        print('Rejected assembly evidence reproduces exactly')
    else:
        (D/'continuous-rc-closed-links-proof.json').write_text(text);(D/'continuous-rc-closed-links.svg').write_text(svg)
        print(json.dumps({'assemblyAssessment':result['assemblyAssessment'],'isolatedComponentsPass':result['allLocalClosedLinkComponentsPass'],'oldLapRejected':result['oldLapGeometryRejected'],'newLapPass':result['lapGeometryPasses'],'maximumTrialAsBuiltGapMm':result['maximumTrialAsBuiltGapMm']}))


if __name__=='__main__':main()
